import { NextResponse } from "next/server"
import { initializeDatabase, seedDatabase, testConnection } from "@/lib/db"

export async function GET() {
  try {
    // اختبار الاتصال بقاعدة البيانات
    const connected = await testConnection()
    if (!connected) {
      return NextResponse.json({ success: false, message: "فشل الاتصال بقاعدة البيانات" }, { status: 500 })
    }

    // إنشاء الجداول
    await initializeDatabase()

    // إضافة بيانات تجريبية
    await seedDatabase()

    return NextResponse.json({ success: true, message: "تم تهيئة قاعدة البيانات بنجاح" })
  } catch (error) {
    console.error("خطأ في تهيئة قاعدة البيانات:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تهيئة قاعدة البيانات", error: errorMessage },
      { status: 500 },
    )
  }
}
