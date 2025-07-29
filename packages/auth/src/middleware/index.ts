// Main middleware exports
export * from './auth-middleware'
export * from './admin-middleware'
export * from './csrf-protection'
export * from './rate-limiting'
export * from './security-headers'

import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from './auth-middleware'
import { csrfProtection } from './csrf-protection'
import { rateLimiters } from './rate-limiting'
import { securityHeaders } from './security-headers'

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<
    (request: NextRequest) => Promise<NextResponse> | NextResponse
  >
) {
  return async function composedMiddleware(request: NextRequest) {
    let response: NextResponse = NextResponse.next()

    for (const middleware of middlewares) {
      response = await middleware(request)

      // If middleware returns a redirect or error, stop processing
      if (response.status !== 200 && response.status !== 304) {
        return response
      }
    }

    return response
  }
}

/**
 * Default middleware configuration with all security features
 */
export const defaultAuthMiddleware = composeMiddleware(
  securityHeaders(),
  authMiddleware,
  csrfProtection()
)

/**
 * Middleware with rate limiting for auth routes
 */
export const authRoutesMiddleware = composeMiddleware(
  securityHeaders(),
  rateLimiters.auth,
  csrfProtection(),
  authMiddleware
)
