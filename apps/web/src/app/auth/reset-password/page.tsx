'use client'

import { ForgotPasswordForm } from '@nextsaas/auth'
import { MarketingAuthLayout } from '@/components/auth/marketing-auth-layout'

export default function ResetPasswordPage() {
  return (
    <MarketingAuthLayout
      title="Reset Password"
      subtitle="Enter your email and we'll send you a secure reset link"
      type="reset"
    >
      <ForgotPasswordForm data-testid="reset-password-form-component" />
    </MarketingAuthLayout>
  )
}