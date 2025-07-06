import { SignupForm, AuthLayout } from '@nextsaas/auth'

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your journey with NextSaaS today."
      showBackToHome
    >
      <SignupForm redirectTo="/dashboard" />
    </AuthLayout>
  )
}
