import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getSales, addSale, deleteSale } from "@/lib/db"

export async function GET() {
  try {
    const sales = await getSales()
    return NextResponse.json(sales)
  } catch (error) {
    console.error("خطأ في الحصول على المبيعات:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على المبيعات" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sale = await request.json()
    const newSale = await addSale(sale)
    return NextResponse.json(newSale, { status: 201 })
  } catch (error: unknown) {
    console.error("خطأ في إضافة عملية البيع:", error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة عملية البيع", message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "معرف عملية البيع مطلوب" }, { status: 400 })
    }
    const success = await deleteSale(id)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "عملية البيع غير موجودة" }, { status: 404 })
    }
  } catch (error) {
    console.error("خطأ في حذف عملية البيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف عملية البيع" }, { status: 500 })
  }
}
