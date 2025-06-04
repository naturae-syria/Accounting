import { type NextRequest, NextResponse } from "next/server"
import {
  getDistributionCenters,
  addDistributionCenter,
  updateDistributionCenter,
  deleteDistributionCenter,
} from "@/lib/db"

export async function GET() {
  try {
    const centers = await getDistributionCenters()
    return NextResponse.json(centers)
  } catch (error) {
    console.error("خطأ في الحصول على مراكز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء الحصول على مراكز التوزيع" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const center = await request.json()
    const newCenter = await addDistributionCenter(center)
    return NextResponse.json(newCenter, { status: 201 })
  } catch (error) {
    console.error("خطأ في إضافة مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إضافة مركز التوزيع" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...center } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "معرف مركز التوزيع مطلوب" }, { status: 400 })
    }
    const updatedCenter = await updateDistributionCenter(id, center)
    return NextResponse.json(updatedCenter)
  } catch (error) {
    console.error("خطأ في تحديث مركز التوزيع:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث مركز التوزيع" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "معرف مركز التوزيع مطلوب" }, { status: 400 })
    }
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
