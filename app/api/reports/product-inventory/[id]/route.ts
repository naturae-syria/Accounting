import { type NextRequest, NextResponse } from "next/server"
import { getProductInventoryReport } from "@/lib/db"

export async function GET(request: NextRequest, { params }: any) {
  try {
    const id = params.id
    const report = await getProductInventoryReport(id)
    return NextResponse.json(report)
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على تقرير مخزون المنتج" }, { status: 500 })
  }
}
