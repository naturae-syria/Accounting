import { type NextRequest, NextResponse } from "next/server"
import { getDistributionCenterById, updateDistributionCenter, deleteDistributionCenter } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const center = await getDistributionCenterById(id)
    if (!center) {
      return NextResponse.json({ error: "مركز التوزيع غير موجود" }, { status: 404 })
    }
    return NextResponse.json(center)
  } catch (error) {
    console.error("خطأ في الحصول على مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على مركز التوزيع" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const center = await request.json()
    const updatedCenter = await updateDistributionCenter(id, center)
    return NextResponse.json(updatedCenter)
  } catch (error) {
    console.error("خطأ في تحديث مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث مركز التوزيع" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await deleteDistributionCenter(id)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "مركز التوزيع غير موجود" }, { status: 404 })
    }
  } catch (error) {
    console.error("خطأ في حذف مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف مركز التوزيع" }, { status: 500 })
  }
}
