import { NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { env } from '@/lib/env'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (username === env.ADMIN_USER && password === env.ADMIN_PASS) {
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      serialize('session', 'auth', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    )
    return new NextResponse(JSON.stringify({ success: true }), { headers })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
