import { authMiddleware } from '@nextsaas/auth/middleware'

export const middleware = authMiddleware({
  publicRoutes: [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/privacy',
    '/terms'
  ],
  authRoutes: ['/auth/sign-in', '/auth/sign-up'],
  loginUrl: '/auth/sign-in',
  defaultRedirectUrl: '/dashboard'
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     * INCLUDE api routes for session refresh
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};