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
    const checkSession = async () => {
      try {
        const cookies = document.cookie.split('; ').map(c => c.trim())
        const hasSession = cookies.some(c => c.startsWith('session='))
        if (!hasSession) {
          router.push('/login')
          return
        }

        const res = await fetch('/api/auth/check')
        const { valid } = await res.json()
        if (!valid) {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  return <>{children}</>
}
