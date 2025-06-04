"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        if (isLoggedIn) {
          // إذا كان المستخدم مسجل الدخول، انتقل إلى لوحة التحكم
          router.push("/dashboard")
        } else {
          // إذا لم يكن المستخدم مسجل الدخول، انتقل إلى صفحة تسجيل الدخول
          router.push("/login")
        }
      } catch (error) {
        // في حالة وجود خطأ في الوصول إلى localStorage (مثل عند التشغيل على الخادم)
        console.error("Error checking authentication:", error)
        // انتقل إلى صفحة تسجيل الدخول كإجراء افتراضي
        router.push("/login")
      }
    }

    // تأخير قصير للتأكد من أن الكود يعمل على جانب العميل
    const timer = setTimeout(() => {
      checkAuth()
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return null
}
