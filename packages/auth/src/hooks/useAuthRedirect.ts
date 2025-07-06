'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from './useAuth'

interface RedirectConfig {
  redirectTo?: string
  requireAuth?: boolean
  requireVerification?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * Hook for handling authentication redirects
 */
export function useAuthRedirect(config: RedirectConfig = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    redirectTo,
    requireAuth = false,
    requireVerification = false,
    onSuccess,
    onError,
  } = config

  // Handle redirect after authentication
  const handleAuthSuccess = useCallback(() => {
    const redirect = redirectTo || searchParams.get('redirect') || '/dashboard'

    // Avoid redirect loops
    if (pathname === redirect) {
      onSuccess?.()
      return
    }

    router.push(redirect)
    onSuccess?.()
  }, [redirectTo, searchParams, pathname, router, onSuccess])

  // Handle authentication requirement
  useEffect(() => {
    if (loading) return

    if (requireAuth && !user) {
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    if (requireVerification && user && !user.email_confirmed_at) {
      router.push('/auth/verify-email')
      return
    }

    if (user && !requireAuth) {
      // User is logged in but on a guest-only page
      handleAuthSuccess()
    }
  }, [
    user,
    loading,
    requireAuth,
    requireVerification,
    pathname,
    searchParams,
    router,
    handleAuthSuccess,
  ])

  return {
    isRedirecting: loading,
    handleAuthSuccess,
  }
}

/**
 * Hook for protected routes
 */
export function useProtectedRoute(config: RedirectConfig = {}) {
  return useAuthRedirect({
    ...config,
    requireAuth: true,
  })
}

/**
 * Hook for guest-only routes (login, signup, etc.)
 */
export function useGuestRoute(config: RedirectConfig = {}) {
  const { user, loading } = useAuth()

  return useAuthRedirect({
    ...config,
    requireAuth: false,
  })
}

/**
 * Hook for handling OAuth callbacks
 */
export function useOAuthCallback() {
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (loading) return

    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      // Handle OAuth error
      console.error('OAuth error:', errorParam, errorDescription)
      router.push(`/auth/error?error=${encodeURIComponent(errorParam)}`)
      return
    }

    if (user) {
      // OAuth success
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    }
  }, [user, loading, error, router, searchParams])

  return {
    loading,
    error: error?.message || searchParams.get('error_description'),
  }
}

/**
 * Hook for email verification redirect
 */
export function useEmailVerificationRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (loading) return

    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (type === 'email' && token) {
      // Email verification token detected
      if (user?.email_confirmed_at) {
        // Email already verified, redirect to dashboard
        router.push('/dashboard')
      } else {
        // Process email verification
        // This would typically be handled by the auth provider
        console.log('Processing email verification...')
      }
    }
  }, [user, loading, router, searchParams])

  return {
    loading,
    isVerifying: !!searchParams.get('token'),
  }
}
