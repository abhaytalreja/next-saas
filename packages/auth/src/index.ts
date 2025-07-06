// Main authentication package exports - CLIENT SIDE ONLY

// Components
export * from './components/forms/LoginForm'
export * from './components/forms/SignupForm'
export * from './components/forms/ForgotPasswordForm'
export * from './components/forms/ResetPasswordForm'
export * from './components/providers/SocialLoginButton'
export * from './components/providers/SocialAuthButtons'
export * from './components/layouts/AuthLayout'
export * from './components/layouts/ProtectedLayout'

// Hooks
export * from './hooks'

// Providers
export * from './providers'

// Types
export * from './types'

// Utils
export * from './utils'

// Lib - CLIENT ONLY
export * from './lib/auth-client'
export * from './lib/session-manager'

// Note: Server-side exports are available in @nextsaas/auth/server
// Note: Middleware exports are available in @nextsaas/auth/server
