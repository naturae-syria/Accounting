import { type NextRequest, NextResponse } from "next/server"
import { getCenterInventoryReport } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const report = await getCenterInventoryReport(id)
    return NextResponse.json(report)
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على تقرير مخزون مركز التوزيع" }, { status: 500 })
  }
}
