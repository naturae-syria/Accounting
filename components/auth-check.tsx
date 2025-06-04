"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthCheckProps {
  children: React.ReactNode
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter()

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      // إذا لم يكن المستخدم مسجل الدخول، انتقل إلى صفحة تسجيل الدخول
      router.push("/login")
    }
  }, [router])

  return <>{children}</>
}
