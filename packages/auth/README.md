# @nextsaas/auth

Comprehensive authentication system for NextSaaS with Supabase Auth, social providers, and multi-tenant organization support.

## Features

- 🔐 **Email/Password Authentication** - Secure authentication with validation
- 🌐 **Social Login** - Google, GitHub, Microsoft, Apple, Discord, Twitter
- 🏢 **Multi-Tenant Organizations** - Built-in organization management
- 🔄 **Session Management** - Automatic token refresh and session handling
- 🛡️ **Security Features** - CSRF protection, rate limiting, security headers
- 📱 **Responsive UI** - Mobile-first authentication components
- 🎨 **Customizable** - Fully typed and customizable components
- ⚡ **Performance** - Optimized bundle size with lazy loading

## Installation

```bash
npm install @nextsaas/auth
```

## Quick Start

### 1. Wrap your app with providers

```tsx
// app/layout.tsx
import {
  AuthProvider,
  OrganizationProvider,
  SessionProvider,
} from '@nextsaas/auth/providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <SessionProvider>
            <OrganizationProvider>{children}</OrganizationProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Add authentication middleware

```ts
// middleware.ts
import { createAuthMiddleware } from '@nextsaas/auth/middleware'

export default createAuthMiddleware({
  publicRoutes: ['/', '/auth/login', '/auth/signup'],
  protectedRoutes: ['/dashboard', '/profile'],
  loginUrl: '/auth/login',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### 3. Create authentication pages

```tsx
// app/auth/login/page.tsx
import {
  AuthLayout,
  LoginForm,
  SocialAuthButtons,
} from '@nextsaas/auth/components'

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in to your account">
      <LoginForm />
      <SocialAuthButtons />
    </AuthLayout>
  )
}
```

## Usage

### Authentication Hooks

```tsx
import {
  useAuth,
  useUser,
  useSession,
  useOrganization,
} from '@nextsaas/auth/hooks'

function MyComponent() {
  // Authentication state and methods
  const { user, signIn, signOut, loading } = useAuth()

  // User profile management
  const { updateProfile, changePassword } = useUser()

  // Session management
  const { session, refreshSession, isNearExpiry } = useSession()

  // Organization context
  const { currentOrganization, switchOrganization } = useOrganization()
}
```

### Protected Routes

```tsx
import { ProtectedLayout } from '@nextsaas/auth/components'

export default function DashboardLayout({ children }) {
  return (
    <ProtectedLayout requireEmailVerification requireOrganization>
      {children}
    </ProtectedLayout>
  )
}
```

### Social Authentication

```tsx
import { SocialAuthButtons } from '@nextsaas/auth/components';

// Default providers: Google, GitHub, Microsoft
<SocialAuthButtons />

// Custom providers
<SocialAuthButtons
  providers={['google', 'github']}
  redirectTo="/dashboard"
/>
```

### Organization Management

```tsx
import { useOrganization } from '@nextsaas/auth/hooks'

function OrganizationSwitcher() {
  const {
    organizations,
    currentOrganization,
    switchOrganization,
    createOrganization,
  } = useOrganization()

  return (
    <select
      value={currentOrganization?.id}
      onChange={e => switchOrganization(e.target.value)}
    >
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  )
}
```

## Components

### Forms

- `LoginForm` - Email/password login
- `SignupForm` - User registration with organization
- `ForgotPasswordForm` - Password reset request
- `ResetPasswordForm` - Password reset confirmation

### Layouts

- `AuthLayout` - Authentication page layout
- `ProtectedLayout` - Protected route wrapper

### Providers

- `SocialLoginButton` - Individual social login button
- `SocialAuthButtons` - Multiple social login options

## Security

### CSRF Protection

```ts
import { csrfProtection } from '@nextsaas/auth/middleware'

export default csrfProtection()
```

### Rate Limiting

```ts
import { rateLimiters } from '@nextsaas/auth/middleware'

// Predefined limiters
rateLimiters.auth // 5 requests per 15 minutes
rateLimiters.api // 60 requests per minute
rateLimiters.passwordReset // 3 requests per hour
```

### Security Headers

```ts
import { securityHeaders } from '@nextsaas/auth/middleware'

export default securityHeaders({
  contentSecurityPolicy: "default-src 'self'",
  strictTransportSecurity: 'max-age=31536000',
})
```

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers (configured in Supabase)
# Set up at: https://app.supabase.com/project/_/auth/providers
```

### Types

All components and hooks are fully typed with TypeScript:

```tsx
import type {
  AuthUser,
  AuthSession,
  Organization,
  Membership,
  SignInCredentials,
  SignUpCredentials,
} from '@nextsaas/auth/types'
```

## Advanced Usage

### Custom Authentication Flow

```tsx
import { useAuth } from '@nextsaas/auth/hooks'
import { validateFormData, signInSchema } from '@nextsaas/auth/utils'

function CustomLoginForm() {
  const { signIn } = useAuth()

  const handleSubmit = async data => {
    // Validate input
    const validation = validateFormData(signInSchema, data)
    if (!validation.success) {
      // Handle validation errors
      return
    }

    // Authenticate
    const { data: session, error } = await signIn(validation.data)
    if (error) {
      // Handle auth error
    }
  }
}
```

### Session Management

```tsx
import { getSessionManager } from '@nextsaas/auth'

const sessionManager = getSessionManager({
  refreshThreshold: 5, // Minutes before expiry
  maxRetries: 3,
  retryDelay: 1000,
})

// Listen for session changes
sessionManager.addListener(session => {
  console.log('Session updated:', session)
})
```

### Server-Side Authentication

```ts
import { getServerUser, getServerSession } from '@nextsaas/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const user = await getServerUser(cookies())

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // User is authenticated
}
```

## License

MIT
