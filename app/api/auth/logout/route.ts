import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() {
  const headers = new Headers()
  headers.append('Set-Cookie', serialize('session', '', { httpOnly: true, path: '/', expires: new Date(0) }))
  return new NextResponse(null, { headers })
}
