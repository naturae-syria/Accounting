import { type NextRequest, NextResponse } from "next/server"
import { getInventory, updateInventory } from "@/lib/db"

export async function GET() {
  try {
    const inventory = await getInventory()
    return NextResponse.json(inventory)
  } catch (error) {
    console.error("خطأ في الحصول على المخزون:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على المخزون" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, centerId, quantity, isAddition, reason } = await request.json()
    if (!productId || !centerId || !quantity) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }
    await updateInventory(productId, centerId, quantity, isAddition, reason)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("خطأ في تحديث المخزون:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث المخزون" }, { status: 500 })
  }
}
