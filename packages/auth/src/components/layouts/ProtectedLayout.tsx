'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useIsAuthenticated } from '../../hooks/useAuth'
import { Spinner } from '@nextsaas/ui'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requireEmailVerification?: boolean
  requireOrganization?: boolean
  fallback?: React.ComponentType
  redirectTo?: string
}

export function ProtectedLayout({
  children,
  requireEmailVerification = false,
  requireOrganization = false,
  fallback: Fallback,
  redirectTo = '/auth/sign-in',
}: ProtectedLayoutProps) {
  const { user, loading } = useAuth()
  const isAuthenticated = useIsAuthenticated()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    // Only require email verification if it's enabled globally
    const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
    if (requireEmailVerification && user && !user.email_confirmed_at && !disableEmailConfirmation) {
      router.push('/auth/verify-email')
      return
    }

    if (requireOrganization && user) {
      // Check if user has an organization
      // This would be implemented based on your organization logic
    }
  }, [
    user,
    loading,
    isAuthenticated,
    requireEmailVerification,
    requireOrganization,
    router,
    redirectTo,
  ])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    if (Fallback) {
      return <Fallback />
    }
    return null
  }

  // Only require email verification if it's enabled globally
  const disableEmailConfirmation = process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION === 'true'
  if (requireEmailVerification && user && !user.email_confirmed_at && !disableEmailConfirmation) {
    return null
  }

  return <>{children}</>
}
