'use client'

import { useEffect } from 'react'

export function CachesPolyfill() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).caches === 'undefined') {
      ;(window as any).caches = {
        open: () => Promise.reject(new Error('Cache API not available')),
      }
    }
  }, [])

  return null
}
