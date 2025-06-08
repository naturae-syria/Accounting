import { NextResponse } from "next/server"
import { getProductsFromFile } from "@/lib/db"

export async function GET() {
  try {
    const products = await getProductsFromFile()
    return NextResponse.json(products)
  } catch (error) {
    console.error("خطأ في استيراد المنتجات:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء استيراد المنتجات" }, { status: 500 })
  }
}
