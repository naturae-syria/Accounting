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
      const hasSession = document.cookie.includes('session=auth')
      if (hasSession) {
        router.push('/dashboard')
      } else {
        router.push('/login')
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
