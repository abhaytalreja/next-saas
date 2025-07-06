import { ForgotPasswordForm, AuthLayout } from '@nextsaas/auth'

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a reset link."
      showBackToHome
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
