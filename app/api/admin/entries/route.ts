import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/adminAuth'

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!(await isAdminAuthed())) return unauthorized()

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = data || []

  const withUrls = await Promise.all(
    entries.map(async (entry) => {
      let receipt_url: string | null = null
      if (entry.receipt_file_path) {
        const { data: urlData } = await supabase.storage
          .from('entry-receipts')
          .createSignedUrl(entry.receipt_file_path, 60 * 60 * 24)
        receipt_url = urlData?.signedUrl ?? null
      }
      return { ...entry, receipt_url }
    })
  )

  return NextResponse.json(withUrls)
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return unauthorized()

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await req.json()
  const { purchaseType, privacyAgreed, officialMallId, phone, buyerName } = body

  if (!phone || !buyerName) {
    return NextResponse.json({ error: '연락처와 성함을 입력해 주세요.' }, { status: 400 })
  }

  const { error } = await supabase.from('entries').insert({
    name: buyerName,
    phone,
    relationship: purchaseType === 'online' ? '온라인 구매' : '오프라인 구매',
    guests: 1,
    purchase_type: purchaseType || 'online',
    privacy_agreed: privacyAgreed ?? true,
    official_mall_id: officialMallId || null,
    buyer_name: buyerName,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthed())) return unauthorized()

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { data: entry } = await supabase.from('entries').select('receipt_file_path').eq('id', id).single()
  if (entry?.receipt_file_path) {
    await supabase.storage.from('entry-receipts').remove([entry.receipt_file_path])
  }

  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
