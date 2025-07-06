import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '../lib/auth-server'
import type { MiddlewareConfig } from '../types'

const defaultConfig: MiddlewareConfig = {
  publicRoutes: [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/error',
  ],
  protectedRoutes: ['/dashboard', '/profile', '/organization', '/settings'],
  authRoutes: ['/auth/login', '/auth/signup'],
  adminRoutes: ['/admin'],
  callbackUrl: '/auth/callback',
  loginUrl: '/auth/login',
  unauthorizedUrl: '/unauthorized',
}

/**
 * Authentication middleware for Next.js
 * Protects routes and handles authentication redirects
 */
export function createAuthMiddleware(config: Partial<MiddlewareConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    const supabase = createSupabaseMiddlewareClient(request, response)

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isAuthenticated = !!session?.user

    // Check if route is public
    const isPublicRoute = finalConfig.publicRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route is auth route (login, signup, etc.)
    const isAuthRoute = finalConfig.authRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route is protected
    const isProtectedRoute = finalConfig.protectedRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if route is admin route
    const isAdminRoute = finalConfig.adminRoutes.some(
      route => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Redirect authenticated users away from auth routes
    if (isAuthenticated && isAuthRoute) {
      const redirectTo =
        request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && (isProtectedRoute || isAdminRoute)) {
      const redirectUrl = new URL(finalConfig.loginUrl, request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin access
    if (isAdminRoute && isAuthenticated) {
      // Check if user has admin role
      const isAdmin =
        session.user.app_metadata?.role === 'admin' ||
        session.user.app_metadata?.role === 'super_admin'

      if (!isAdmin) {
        return NextResponse.redirect(
          new URL(finalConfig.unauthorizedUrl, request.url)
        )
      }
    }

    // Check email verification if required
    if (isAuthenticated && !isPublicRoute && !session.user.email_confirmed_at) {
      const needsVerification = finalConfig.protectedRoutes.some(
        route => pathname === route || pathname.startsWith(`${route}/`)
      )

      if (needsVerification && pathname !== '/auth/verify-email') {
        return NextResponse.redirect(new URL('/auth/verify-email', request.url))
      }
    }

    return response
  }
}

/**
 * Default authentication middleware instance
 */
export const authMiddleware = createAuthMiddleware()

/**
 * Helper to check if a route should be protected
 */
export function shouldProtectRoute(
  pathname: string,
  config: Partial<MiddlewareConfig> = {}
): boolean {
  const finalConfig = { ...defaultConfig, ...config }

  const isPublicRoute = finalConfig.publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  )

  return !isPublicRoute
}

/**
 * Middleware configuration helper
 */
export function withAuth(
  middleware: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: Partial<MiddlewareConfig> = {}
) {
  const authMiddlewareInstance = createAuthMiddleware(config)

  return async function enhancedMiddleware(request: NextRequest) {
    // Run auth middleware first
    const authResponse = await authMiddlewareInstance(request)

    // If auth middleware returned a redirect, use it
    if (authResponse.status === 307 || authResponse.status === 308) {
      return authResponse
    }

    // Otherwise, run the provided middleware
    return middleware(request)
  }
}
