import { NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { env } from '@/lib/env'
import { getUserByUsername } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const { username, password } = await request.json()
  try {
    const user = await getUserByUsername(username)
    if (user && (await verifyPassword(password, user.passwordHash))) {
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
  } catch (error: unknown) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
