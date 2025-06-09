import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getSalesByCenterReport } from "@/lib/db"

export async function GET(request: NextRequest, { params }: any) {
  try {
    const id = params.id
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get("startDate") ?? undefined
    const endDate = searchParams.get("endDate") ?? undefined

    const report = await getSalesByCenterReport(id, startDate, endDate)
    return NextResponse.json(report)
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مبيعات مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على تقرير مبيعات مركز التوزيع" }, { status: 500 })
  }
}
