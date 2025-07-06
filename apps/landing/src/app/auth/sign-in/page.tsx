import { LoginForm, AuthLayout } from '@nextsaas/auth'

export default function SignInPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back! Please enter your details."
      showBackToHome
    >
      <LoginForm redirectTo="/dashboard" />
    </AuthLayout>
  )
}
