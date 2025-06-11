import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() {
  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    serialize('session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  )
  return new NextResponse(null, { headers })
}
