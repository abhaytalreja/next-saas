'use client'

import { LoginForm } from '@nextsaas/auth'
import { MarketingAuthLayout } from '@/components/auth/marketing-auth-layout'

export default function SignInPage() {
  return (
    <MarketingAuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue building amazing things"
      type="signin"
    >
      <LoginForm redirectTo="/dashboard" />
    </MarketingAuthLayout>
  )
}