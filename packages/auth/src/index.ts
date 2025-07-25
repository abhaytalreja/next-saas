// Main authentication package exports - CLIENT SIDE ONLY

// Components
export * from './components/forms/LoginForm'
export * from './components/forms/SignupForm'
export * from './components/forms/ForgotPasswordForm'
export * from './components/forms/ResetPasswordForm'
export * from './components/forms/UpdatePasswordForm'
export * from './components/forms/ProfileForm'
export * from './components/forms/EnhancedProfileForm'
export * from './components/forms/PreferencesForm'
export * from './components/providers/SocialLoginButton'
export * from './components/providers/SocialAuthButtons'
export * from './components/layouts/AuthLayout'
export * from './components/layouts/ProtectedLayout'
export * from './components/ui/AccountDropdown'
export * from './components/ui/OrganizationSwitcher'
export * from './components/ui/MembersList'
export * from './components/ui/InvitationForm'
export * from './components/profile/OrganizationProfileSwitcher'
export * from './components/profile/OrganizationAwareProfileManager'
export * from './components/profile/OrganizationContextProvider'
export * from './components/profile/OrganizationContextWidget'
export * from './components/profile/ProfileModeDetector'
export * from './components/profile/BasicProfileManager'
export * from './components/profile/ProfileWrappers'

// Hooks
export * from './hooks'

// Providers
export * from './providers'

// Types
export * from './types'

// Components (re-export from components/index to avoid conflicts)
export { UserAvatar } from './components/ui/UserAvatar'

// Utils
export * from './utils'

// Lib - CLIENT ONLY
export * from './lib/auth-client'
export * from './lib/session-manager'
export * from './lib/universal-profile-manager'

// Note: Server-side exports are available in @nextsaas/auth/server
// Note: Middleware exports are available in @nextsaas/auth/server
