import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ExcelJS from 'exceljs'

const RECEIPT_BUCKET = 'entry-receipts'

interface EntryRow {
  name: string
  phone: string
  relationship?: string | null
  purchase_type?: 'online' | 'offline' | null
  privacy_agreed?: boolean | null
  official_mall_id?: string | null
  buyer_name?: string | null
  receipt_file_name?: string | null
  receipt_file_path?: string | null
  created_at: string
}

function getPurchaseLabel(value: EntryRow['purchase_type']) {
  if (value === 'offline') return '오프라인'
  if (value === 'online') return '온라인'
  return '-'
}

async function downloadReceipt(supabase: SupabaseClient, path: string): Promise<Uint8Array | null> {
  const { data, error } = await supabase.storage.from(RECEIPT_BUCKET).download(path)
  if (error || !data) return null
  return new Uint8Array(await data.arrayBuffer())
}

function getImageExtension(path: string): 'png' | 'jpeg' {
  if (path.endsWith('.png')) return 'png'
  return 'jpeg'
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key')
  if (secret !== 'tnf2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  const entries = data as EntryRow[]

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('응모 목록')

  const headers = ['번호', '구매 방식', '개인 정보 동의', '공식몰 회원 ID', '연락처', '성함', '영수증', '신청일시']
  const headerRow = sheet.addRow(headers)
  headerRow.font = { bold: true, size: 11 }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  sheet.columns = [
    { width: 6 },
    { width: 12 },
    { width: 14 },
    { width: 20 },
    { width: 16 },
    { width: 12 },
    { width: 18 },
    { width: 20 },
  ]

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const row = sheet.addRow([
      i + 1,
      getPurchaseLabel(entry.purchase_type),
      entry.privacy_agreed ? '동의' : '미동의',
      entry.official_mall_id || '-',
      entry.phone,
      entry.buyer_name || entry.name,
      '',
      new Date(entry.created_at).toLocaleString('ko-KR'),
    ])

    row.alignment = { vertical: 'middle' }

    if (entry.receipt_file_path) {
      const imageBuffer = await downloadReceipt(supabase, entry.receipt_file_path)
      if (imageBuffer) {
        const ext = getImageExtension(entry.receipt_file_path)
        const imageId = workbook.addImage({
          buffer: imageBuffer as unknown as Buffer,
          extension: ext,
        })

        const rowIndex = i + 1
        sheet.addImage(imageId, {
          tl: { col: 6, row: rowIndex },
          ext: { width: 120, height: 120 },
        })

        row.height = 95
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="event-entries-${Date.now()}.xlsx"`,
    },
  })
}
