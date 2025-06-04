import type React from "react"
import Image from "next/image"

interface HeaderProps {
  children?: React.ReactNode
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="bg-background shadow-custom py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-rmysD103c1t2GgXHuIcowad02c1m9e.png"
                alt="شركة المؤيد العالمية"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">نظام إدارة المحاسبة والتوزيع</h1>
              <p className="text-text-light text-sm">شركة المؤيد العالمية</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="text-left ml-4">
              <p className="text-sm text-text-light">
                {new Date().toLocaleDateString("ar-SA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </header>
  )
}
