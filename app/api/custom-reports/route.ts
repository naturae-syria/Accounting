import { type NextRequest, NextResponse } from "next/server"
import { getCustomReports, addCustomReport, deleteCustomReport } from "@/lib/db"

export async function GET() {
  try {
    const reports = await getCustomReports()
    return NextResponse.json(reports)
  } catch (error) {
    console.error("خطأ في الحصول على التقارير المخصصة:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على التقارير" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    const newReport = await addCustomReport(report)
    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    console.error("خطأ في إضافة التقرير المخصص:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة التقرير" }, { status: 500 })
  }
}
