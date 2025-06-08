import { NextResponse } from "next/server"
import { register, collectDefaultMetrics, Counter, Histogram } from "prom-client"

// جمع المقاييس الافتراضية
collectDefaultMetrics()

// إنشاء مقاييس مخصصة
const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
})

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
})

export async function GET() {
  try {
    // جمع المقاييس وإرجاعها
    const metrics = await register.metrics()
    return new NextResponse(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    })
  } catch (error) {
    console.error("Error collecting metrics:", error)
    return NextResponse.json({ error: "Error collecting metrics" }, { status: 500 })
  }
}

// تصدير المقاييس لاستخدامها في أماكن أخرى
export { httpRequestsTotal, httpRequestDuration }
