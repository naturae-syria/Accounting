import { type NextRequest, NextResponse } from "next/server"
import { getSalesByCenterReport } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const report = await getSalesByCenterReport(id, startDate, endDate)
    return NextResponse.json(report)
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مبيعات مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على تقرير مبيعات مركز التوزيع" }, { status: 500 })
  }
}
