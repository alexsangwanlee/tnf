import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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

function escapeCsv(value: string | number | boolean | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function getPurchaseLabel(value: EntryRow['purchase_type']) {
  if (value === 'offline') return '오프라인'
  if (value === 'online') return '온라인'
  return '-'
}

async function getReceiptUrl(supabase: SupabaseClient, path?: string | null) {
  if (!path) return ''

  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 30)

  if (error) {
    console.error('Supabase signed URL error:', error)
    return ''
  }

  return data.signedUrl
}

export async function GET() {
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

  const header =
    '번호,구매 방식,개인 정보 동의,공식몰 회원 ID,연락처,성함,영수증 파일명,영수증 첨부 URL,신청일시\n'
  const rows = await Promise.all(
    (data as EntryRow[]).map(async (entry, index) => {
      const receiptUrl = await getReceiptUrl(supabase, entry.receipt_file_path)

      return [
        index + 1,
        escapeCsv(getPurchaseLabel(entry.purchase_type)),
        escapeCsv(entry.privacy_agreed ? '동의' : '미동의'),
        escapeCsv(entry.official_mall_id),
        escapeCsv(entry.phone),
        escapeCsv(entry.buyer_name || entry.name),
        escapeCsv(entry.receipt_file_name),
        escapeCsv(receiptUrl),
        escapeCsv(new Date(entry.created_at).toLocaleString('ko-KR')),
      ].join(',')
    })
  )

  const csv = '\uFEFF' + header + rows.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="event-entries-${Date.now()}.csv"`,
    },
  })
}
