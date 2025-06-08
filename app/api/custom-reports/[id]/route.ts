import { type NextResponse } from "next/server"
import { deleteCustomReport } from "@/lib/db"

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await deleteCustomReport(id)
    if (success) {
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: "التقرير غير موجود" }, { status: 404 })
  } catch (error) {
    console.error("خطأ في حذف التقرير المخصص:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حذف التقرير" }, { status: 500 })
  }
}
