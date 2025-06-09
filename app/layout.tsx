import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// استيراد خط Tajawal باستخدام next/font/google
import localFont from "next/font/local"
import { APP_VERSION } from "@/lib/version"

// تكوين خط Tajawal
const tajawal = localFont({
  src: [
    { path: "../public/fonts/Tajawal/Tajawal-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/Tajawal/Tajawal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Tajawal/Tajawal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Tajawal/Tajawal-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/Tajawal/Tajawal-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tajawal",
  display: "swap",
})

export const metadata: Metadata = {
  title: "نظام إدارة المحاسبة والتوزيع - شركة المؤيد العالمية",
  description: "نظام متكامل لإدارة المحاسبة وتوزيع المنتجات",
  generator: `Accounting Distribution System v${APP_VERSION}`,
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
