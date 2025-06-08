import { type NextRequest, NextResponse } from "next/server"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/db"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("خطأ في الحصول على المنتجات:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على المنتجات" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()
    const newProduct = await addProduct(product)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("خطأ في إضافة المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...product } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 })
    }
    const updatedProduct = await updateProduct(id, product)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث المنتج" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 })
    }
    const success = await deleteProduct(id)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف المنتج" }, { status: 500 })
  }
}
