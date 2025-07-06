'use client'

import { SignupForm } from '@nextsaas/auth'
import { MarketingAuthLayout } from '@/components/auth/marketing-auth-layout'

export default function SignUpPage() {
  return (
    <MarketingAuthLayout
      title="Start Building Today"
      subtitle="Join thousands of developers building with NextSaaS"
      type="signup"
    >
      <SignupForm redirectTo="/dashboard" />
    </MarketingAuthLayout>
  )
}