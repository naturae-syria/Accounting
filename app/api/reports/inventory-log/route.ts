import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getInventoryLog } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const productId = searchParams.get("productId")
    const centerId = searchParams.get("centerId")

    const logs = await getInventoryLog(productId, centerId)
    return NextResponse.json(logs)
  } catch (error) {
    console.error("خطأ في الحصول على سجل المخزون:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على سجل المخزون" }, { status: 500 })
  }
}
