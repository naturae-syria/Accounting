import { NextResponse } from "next/server"
import { register } from "prom-client"
import { httpRequestsTotal, httpRequestDuration } from "@/lib/metrics"

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
