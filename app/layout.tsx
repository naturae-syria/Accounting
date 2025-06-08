import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// استيراد خط Tajawal باستخدام next/font/google
import { Tajawal } from "next/font/google"

// تكوين خط Tajawal
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
})

export const metadata: Metadata = {
  title: "نظام إدارة المحاسبة والتوزيع - شركة المؤيد العالمية",
  description: "نظام متكامل لإدارة المحاسبة وتوزيع المنتجات",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-tajawal`}>{children}</body>
    </html>
  )
}
