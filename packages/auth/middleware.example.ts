import { NextRequest } from 'next/server'
import {
  createAuthMiddleware,
  composeMiddleware,
  securityHeaders,
  csrfProtection,
  rateLimiters,
  withRateLimit,
} from '@nextsaas/auth/middleware'

// Configure authentication middleware
const authMiddleware = createAuthMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/pricing',
    '/blog',
    '/docs',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/error',
  ],
  protectedRoutes: [
    '/dashboard',
    '/profile',
    '/settings',
    '/organization',
    '/projects',
  ],
  authRoutes: ['/auth/login', '/auth/signup'],
  adminRoutes: ['/admin'],
  loginUrl: '/auth/login',
  callbackUrl: '/auth/callback',
  unauthorizedUrl: '/unauthorized',
})

// Apply rate limiting to auth routes
const authRoutesWithRateLimit = withRateLimit(authMiddleware, rateLimiters.auth)

// Compose all middleware
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply different middleware based on route
  if (pathname.startsWith('/auth/')) {
    // Auth routes with rate limiting
    return authRoutesWithRateLimit(request)
  }

  if (pathname.startsWith('/api/')) {
    // API routes with different rate limiting
    const apiMiddleware = composeMiddleware(
      securityHeaders(),
      csrfProtection(),
      rateLimiters.api,
      authMiddleware
    )
    return apiMiddleware(request)
  }

  // Default middleware for all other routes
  const defaultMiddleware = composeMiddleware(securityHeaders(), authMiddleware)

  return defaultMiddleware(request)
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
