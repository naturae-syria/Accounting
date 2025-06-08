"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // التحقق من بيانات تسجيل الدخول
    if (username === "admin" && password === "admin123") {
      // تخزين حالة تسجيل الدخول في localStorage
      localStorage.setItem("isLoggedIn", "true")

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام إدارة المحاسبة والتوزيع",
      })

      // الانتقال إلى الصفحة الرئيسية
      router.push("/dashboard")
    } else {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md bg-background shadow-custom">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-rmysD103c1t2GgXHuIcowad02c1m9e.png"
                alt="شركة المؤيد العالمية"
                width={96}
                height={96}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl text-primary">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات تسجيل الدخول للوصول إلى نظام إدارة المحاسبة والتوزيع</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary-hover" disabled={isLoading}>
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-text-light">
          <p className="w-full">جميع الحقوق محفوظة © {new Date().getFullYear()} - شركة المؤيد العالمية</p>
        </CardFooter>
      </Card>
    </div>
  )
}
