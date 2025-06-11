import { NextResponse } from 'next/server'
import { parse } from 'cookie'

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parse(cookieHeader)
  const valid = cookies.session === 'auth'
  return NextResponse.json({ valid })
}
