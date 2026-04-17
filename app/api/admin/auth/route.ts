import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminAuthed,
  sessionCookieOptions,
} from '@/lib/adminAuth'

export async function GET() {
  return NextResponse.json({ authed: await isAdminAuthed() })
}

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: '잘못된 코드입니다.' }, { status: 401 })
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions)
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  return NextResponse.json({ success: true })
}
