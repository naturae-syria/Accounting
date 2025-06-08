import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const start = Date.now()
  const method = request.method
  const url = request.nextUrl.pathname

  // تنفيذ الطلب
  const response = NextResponse.next()

  // قياس المدة وتسجيل المقاييس
  const duration = (Date.now() - start) / 1000
  const status = response.status

  // تسجيل المقاييس فقط لطلبات API
  if (url.startsWith("/api")) {
    // يمكننا استخدام مقاييس Prometheus هنا إذا كانت متاحة
    console.log(`API Request: ${method} ${url} ${status} ${duration}s`)
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}
