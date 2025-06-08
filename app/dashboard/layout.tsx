"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        if (!isLoggedIn) {
          // إذا لم يكن المستخدم مسجل الدخول، انتقل إلى صفحة تسجيل الدخول
          router.push("/login")
          return
        }
        setMounted(true)
      } catch (error) {
        // في حالة وجود خطأ في الوصول إلى localStorage
        console.error("Error checking authentication:", error)
        router.push("/login")
      }
    }

    // تأخير قصير للتأكد من أن الكود يعمل على جانب العميل
    const timer = setTimeout(() => {
      checkAuth()
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
    toast({
      title: "تم تسجيل الخروج بنجاح",
      description: "نشكرك على استخدام نظام إدارة المحاسبة والتوزيع",
    })
  }

  if (!mounted) return null

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <main className="min-h-screen bg-secondary">
        <Header>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </Header>
        <div className="container mx-auto p-4">{children}</div>
        <footer className="bg-background border-t border-border py-6 text-center text-text-light text-sm">
          <div className="container mx-auto">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} - شركة المؤيد العالمية</p>
            <div className="mt-2">
              <a href="#" className="text-primary hover:text-primary-hover transition-colors">
                <span className="ml-2">info@mgc.com</span>
              </a>
            </div>
          </div>
        </footer>
        <Toaster />
      </main>
    </ThemeProvider>
  )
}
