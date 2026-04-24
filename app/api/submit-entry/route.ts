import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type PurchaseType = 'online' | 'offline'

const RECEIPT_BUCKET = 'entry-receipts'
const MAX_RECEIPT_SIZE = 10 * 1024 * 1024

interface EntryPayload {
  purchaseType?: unknown
  privacyAgreed?: unknown
  orderNumber?: unknown
  officialMallId?: unknown
  phone?: unknown
  buyerName?: unknown
  name?: unknown
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toPurchaseType(value: unknown): PurchaseType {
  return value === 'offline' ? 'offline' : 'online'
}

function toBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on'
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File
}

async function ensureReceiptBucket(supabase: SupabaseClient) {
  const { error } = await supabase.storage.createBucket(RECEIPT_BUCKET, {
    public: false,
    fileSizeLimit: MAX_RECEIPT_SIZE,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  })

  if (!error) return

  const statusCode =
    'statusCode' in error ? String((error as { statusCode?: string | number }).statusCode) : ''
  const message = error.message.toLowerCase()

  if (statusCode === '409' || message.includes('already exists')) return

  throw error
}

function getFileExtension(fileName: string) {
  const match = fileName.match(/\.[a-z0-9]+$/i)
  return match ? match[0].toLowerCase() : '.jpg'
}

const DUPLICATE_WINDOW_MS = 60_000

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let purchaseType: PurchaseType = 'online'
    let privacyAgreed = false
    let orderNumber = ''
    let officialMallId = ''
    let phone = ''
    let buyerName = ''
    let receiptFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      purchaseType = toPurchaseType(formData.get('purchaseType'))
      privacyAgreed = toBoolean(formData.get('privacyAgreed'))
      orderNumber = toTrimmedString(formData.get('orderNumber'))
      officialMallId = toTrimmedString(formData.get('officialMallId'))
      phone = toTrimmedString(formData.get('phone'))
      buyerName = toTrimmedString(formData.get('buyerName'))

      const fileValue = formData.get('receiptFile')
      receiptFile = isFile(fileValue) && fileValue.size > 0 ? fileValue : null
    } else {
      const payload = (await req.json()) as EntryPayload
      purchaseType = toPurchaseType(payload.purchaseType)
      privacyAgreed = toBoolean(payload.privacyAgreed)
      orderNumber = toTrimmedString(payload.orderNumber)
      officialMallId = toTrimmedString(payload.officialMallId)
      phone = toTrimmedString(payload.phone)
      buyerName = toTrimmedString(payload.buyerName) || toTrimmedString(payload.name)
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { error: '개인 정보 수집 및 이용 동의가 필요합니다.' },
        { status: 400 }
      )
    }

    if (purchaseType === 'online' && !orderNumber) {
      return NextResponse.json({ error: '주문 번호를 입력해 주세요.' }, { status: 400 })
    }

    if (!phone || !buyerName) {
      return NextResponse.json({ error: '연락처와 성함을 입력해 주세요.' }, { status: 400 })
    }

    if (purchaseType === 'online' && !officialMallId) {
      return NextResponse.json(
        { error: '온라인 구매 고객은 공식몰 회원 ID를 입력해 주세요.' },
        { status: 400 }
      )
    }

    if (purchaseType === 'offline') {
      if (!receiptFile) {
        return NextResponse.json(
          { error: '오프라인 구매 고객은 실물 영수증 이미지를 첨부해 주세요.' },
          { status: 400 }
        )
      }

      if (!receiptFile.type.startsWith('image/')) {
        return NextResponse.json({ error: '영수증은 이미지 파일로 첨부해 주세요.' }, { status: 400 })
      }

      if (receiptFile.size > MAX_RECEIPT_SIZE) {
        return NextResponse.json(
          { error: '영수증 이미지는 10MB 이하로 첨부해 주세요.' },
          { status: 400 }
        )
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not set')
      return NextResponse.json({ error: '서버 설정을 확인해 주세요.' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const recentCutoff = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString()
    const { data: recent, error: recentError } = await supabase
      .from('entries')
      .select('id')
      .eq('phone', phone)
      .gte('created_at', recentCutoff)
      .limit(1)

    if (recentError) {
      console.error('Duplicate check error:', recentError)
    } else if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: '이미 접수된 요청이 있습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 429 }
      )
    }

    let receiptFilePath: string | null = null
    let receiptFileName: string | null = null

    if (receiptFile) {
      await ensureReceiptBucket(supabase)

      receiptFileName = receiptFile.name
      receiptFilePath = `${Date.now()}-${crypto.randomUUID()}${getFileExtension(receiptFile.name)}`
      const { error: uploadError } = await supabase.storage
        .from(RECEIPT_BUCKET)
        .upload(receiptFilePath, await receiptFile.arrayBuffer(), {
          contentType: receiptFile.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        console.error('Supabase receipt upload error:', uploadError)
        return NextResponse.json({ error: '영수증 이미지를 저장하지 못했습니다.' }, { status: 500 })
      }
    }

    const { error } = await supabase.from('entries').insert({
      name: buyerName,
      phone,
      relationship: purchaseType === 'online' ? '온라인 구매' : '오프라인 구매',
      guests: 1,
      expectation: null,
      purchase_type: purchaseType,
      privacy_agreed: privacyAgreed,
      order_number: orderNumber || null,
      official_mall_id: officialMallId || null,
      buyer_name: buyerName,
      receipt_file_name: receiptFileName,
      receipt_file_path: receiptFilePath,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: '신청 정보를 저장하지 못했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit entry error:', error)
    return NextResponse.json({ error: '올바르지 않은 요청입니다.' }, { status: 400 })
  }
}
