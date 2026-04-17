import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'tnf_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function getSecret() {
  return process.env.ADMIN_PASSWORD || ''
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function createSessionToken() {
  const issuedAt = Date.now().toString()
  return `${issuedAt}.${sign(issuedAt)}`
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !getSecret()) return false
  const [issuedAt, mac] = token.split('.')
  if (!issuedAt || !mac) return false

  const expected = sign(issuedAt)
  if (expected.length !== mac.length) return false
  try {
    if (!timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(mac, 'hex'))) return false
  } catch {
    return false
  }

  const age = (Date.now() - Number(issuedAt)) / 1000
  if (!Number.isFinite(age) || age < 0 || age > SESSION_TTL_SECONDS) return false
  return true
}

export async function isAdminAuthed() {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
}
