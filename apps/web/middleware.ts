import { authMiddleware } from '@nextsaas/auth/middleware'
import { adminMiddleware } from '@nextsaas/auth/middleware/admin-middleware'
import { NextRequest, NextResponse } from 'next/server'

// Combined middleware that handles both auth and admin routes
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For admin routes, use admin middleware
  if (pathname.startsWith('/admin')) {
    return adminMiddleware(request)
  }

  // For all other routes, use standard auth middleware
  return authMiddleware({
    publicRoutes: [
      '/',
      '/auth/sign-in',
      '/auth/sign-up',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/privacy',
      '/terms',
      '/unauthorized',
      '/error',
    ],
    authRoutes: ['/auth/sign-in', '/auth/sign-up'],
    loginUrl: '/auth/sign-in',
    defaultRedirectUrl: '/dashboard',
  })(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     * INCLUDE api routes for session refresh
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
