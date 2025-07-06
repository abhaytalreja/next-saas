'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@nextsaas/auth'
import { LoginForm } from '@nextsaas/auth'
import { MarketingAuthLayout } from '@/components/auth/marketing-auth-layout'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  // Show sign-in form for unauthenticated users
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading NextSaaS...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <MarketingAuthLayout
      title="Welcome to NextSaaS"
      subtitle="Sign in to access your account and start building"
      type="signin"
    >
      <LoginForm redirectTo="/dashboard" />
    </MarketingAuthLayout>
  )
}
