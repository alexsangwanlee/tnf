import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface EntryRow {
  name: string
  phone: string
  relationship?: string | null
  guests: number
  expectation?: string | null
  created_at: string
}

function escapeCsv(value: string | number | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
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

  const header = '번호,아이 이름,연락처,관계,인원,기대평,신청일시\n'
  const rows = (data as EntryRow[])
    .map((entry, index) =>
      [
        index + 1,
        escapeCsv(entry.name),
        escapeCsv(entry.phone),
        escapeCsv(entry.relationship),
        entry.guests,
        escapeCsv(entry.expectation),
        escapeCsv(new Date(entry.created_at).toLocaleString('ko-KR')),
      ].join(',')
    )
    .join('\n')

  const csv = '\uFEFF' + header + rows

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rsvp-entries-${Date.now()}.csv"`,
    },
  })
}
