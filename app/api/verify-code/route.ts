import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const secret = process.env.SECRET_PASSCODE
    if (!secret) {
      console.error('SECRET_PASSCODE environment variable is not set')
      return NextResponse.json({ success: false }, { status: 500 })
    }

    const isValid = code.trim().toUpperCase() === secret.trim().toUpperCase()

    // Small delay to prevent brute-force timing attacks
    await new Promise((r) => setTimeout(r, 200))

    return NextResponse.json({ success: isValid })
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
