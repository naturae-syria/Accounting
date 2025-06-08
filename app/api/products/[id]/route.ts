import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("خطأ في الحصول على المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على المنتج" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const product = await request.json()
    const updatedProduct = await updateProduct(id, product)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث المنتج" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
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
