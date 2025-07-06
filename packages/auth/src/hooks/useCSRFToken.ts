'use client'

import { useEffect, useState } from 'react'

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'

/**
 * Hook to get and include CSRF token in requests
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get CSRF token from cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === CSRF_COOKIE) {
        setToken(value)
        break
      }
    }
  }, [])

  return {
    token,
    headers: token ? { [CSRF_HEADER]: token } : {},
  }
}
