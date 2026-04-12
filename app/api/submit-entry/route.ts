import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface EntryPayload {
  name?: unknown
  phone?: unknown
  relationship?: unknown
  guests?: unknown
  expectation?: unknown
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as EntryPayload

    const name = toTrimmedString(payload.name)
    const phone = toTrimmedString(payload.phone)
    const relationship = toTrimmedString(payload.relationship)
    const expectation = toTrimmedString(payload.expectation)
    const guestsValue = Number(payload.guests)
    const guests = Number.isInteger(guestsValue) && guestsValue > 0 ? guestsValue : 1

    if (!name || !phone || !relationship) {
      return NextResponse.json(
        { error: '아이 이름, 연락처, 보호자와의 관계를 입력해 주세요.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not set')
      return NextResponse.json({ error: '서버 설정을 확인해 주세요.' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error } = await supabase.from('entries').insert({
      name,
      phone,
      relationship,
      guests,
      expectation: expectation || null,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: '신청 정보를 저장하지 못했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }
}
