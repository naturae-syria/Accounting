import { NextResponse } from "next/server"
import { getMetrics, metricsContentType } from "@/lib/metrics"

export async function GET() {
  try {
    // جمع المقاييس وإرجاعها
    const metrics = await getMetrics()
    return new NextResponse(metrics, {
      headers: {
        "Content-Type": metricsContentType,
      },
    })
  } catch (error) {
    console.error("Error collecting metrics:", error)
    return NextResponse.json({ error: "Error collecting metrics" }, { status: 500 })
  }
}

// تصدير المقاييس لاستخدامها في أماكن أخرى
// Exported metrics are imported from '@/lib/metrics'
