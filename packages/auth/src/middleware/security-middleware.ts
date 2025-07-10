import { NextRequest, NextResponse } from 'next/server'
import { auditService } from '../services/audit-service'
import { rateLimiters, withRateLimit } from './rate-limiting'

export interface SecurityMiddlewareOptions {
  rateLimiter?: 'api' | 'auth' | 'profileUpdate' | 'avatarUpload' | 'dataExport' | 'sessionManagement'
  logEvent?: boolean
  action?: string
  resource?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  requireAuth?: boolean
}

/**
 * Security middleware that combines rate limiting, audit logging, and authentication
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions = {}) {
  const {
    rateLimiter = 'api',
    logEvent = true,
    action,
    resource,
    severity = 'low',
    requireAuth = true
  } = options

  return async function securityMiddleware(
    request: NextRequest,
    handler: (req: NextRequest, userId?: string) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    try {
      // 1. Apply rate limiting first
      const limiter = rateLimiters[rateLimiter]
      if (limiter) {
        const rateLimitResponse = await withRateLimit(
          async () => NextResponse.next(),
          limiter
        )(request)

        if (rateLimitResponse.status === 429) {
          // Log rate limit violation
          if (logEvent) {
            await auditService.logSecurityViolation({
              violationType: 'rate_limit',
              resource: resource || 'api',
              ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip,
              userAgent: request.headers.get('user-agent') || undefined,
              details: {
                endpoint: request.nextUrl.pathname,
                method: request.method,
                rate_limiter: rateLimiter
              }
            })
          }
          return rateLimitResponse
        }
      }

      // 2. Handle authentication if required
      let userId: string | undefined

      if (requireAuth) {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          // Log unauthorized access attempt
          if (logEvent) {
            await auditService.logSecurityViolation({
              violationType: 'unauthorized_access',
              resource: resource || 'api',
              ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip,
              userAgent: request.headers.get('user-agent') || undefined,
              details: {
                endpoint: request.nextUrl.pathname,
                method: request.method,
                missing_auth: true
              }
            })
          }

          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
          )
        }

        // Extract user ID from auth context (this would typically be done via JWT verification)
        // For now, we'll assume it's handled by the calling code
      }

      // 3. Execute the main handler
      const response = await handler(request, userId)

      // 4. Log successful operation if requested
      if (logEvent && action && resource && response.status < 400) {
        await auditService.logEvent({
          userId,
          action,
          resource,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip,
          userAgent: request.headers.get('user-agent') || undefined,
          status: 'success',
          severity,
          details: {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            response_status: response.status
          }
        })
      }

      // 5. Log failed operation if applicable
      if (logEvent && action && resource && response.status >= 400) {
        await auditService.logEvent({
          userId,
          action,
          resource,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip,
          userAgent: request.headers.get('user-agent') || undefined,
          status: 'failed',
          severity: response.status >= 500 ? 'high' : 'medium',
          details: {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            response_status: response.status,
            error: true
          }
        })
      }

      return response

    } catch (error) {
      console.error('Security middleware error:', error)

      // Log the error
      if (logEvent) {
        await auditService.logEvent({
          action: action || 'api_error',
          resource: resource || 'api',
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip,
          userAgent: request.headers.get('user-agent') || undefined,
          status: 'failed',
          severity: 'high',
          details: {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            error: error instanceof Error ? error.message : 'Unknown error',
            middleware_error: true
          }
        })
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Convenience function for profile-related endpoints
 */
export function createProfileSecurityMiddleware(options: Omit<SecurityMiddlewareOptions, 'resource'> = {}) {
  return createSecurityMiddleware({
    ...options,
    resource: 'profile'
  })
}

/**
 * Convenience function for authentication endpoints
 */
export function createAuthSecurityMiddleware(options: Omit<SecurityMiddlewareOptions, 'resource' | 'rateLimiter'> = {}) {
  return createSecurityMiddleware({
    ...options,
    resource: 'authentication',
    rateLimiter: 'auth'
  })
}

/**
 * Convenience function for session management endpoints
 */
export function createSessionSecurityMiddleware(options: Omit<SecurityMiddlewareOptions, 'resource' | 'rateLimiter'> = {}) {
  return createSecurityMiddleware({
    ...options,
    resource: 'sessions',
    rateLimiter: 'sessionManagement'
  })
}

/**
 * Helper function to extract user ID from Supabase session
 */
export async function extractUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // This would typically involve verifying a JWT token
    // For now, we'll assume the calling code handles this
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    // In a real implementation, you would:
    // 1. Extract the JWT token
    // 2. Verify it with Supabase
    // 3. Return the user ID
    // For now, we'll return null to indicate this needs to be handled by the caller
    return null
  } catch (error) {
    console.error('Error extracting user ID:', error)
    return null
  }
}

/**
 * Helper function to validate suspicious activity patterns
 */
export async function detectSuspiciousActivity(
  userId: string,
  action: string,
  ipAddress?: string
): Promise<{ suspicious: boolean; reason?: string }> {
  try {
    // Get recent activities for this user
    const result = await auditService.queryAuditLogs({
      userId,
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      limit: 100
    })

    if (!result.success || !result.activities) {
      return { suspicious: false }
    }

    const activities = result.activities

    // Check for rapid successive actions
    const recentActions = activities.filter(a => 
      a.action === action && 
      new Date(a.created_at) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
    )

    if (recentActions.length > 10) {
      return { 
        suspicious: true, 
        reason: 'Rapid successive actions detected'
      }
    }

    // Check for multiple IP addresses
    if (ipAddress) {
      const recentIps = new Set(
        activities
          .filter(a => a.ip_address && new Date(a.created_at) > new Date(Date.now() - 60 * 60 * 1000))
          .map(a => a.ip_address)
      )

      if (recentIps.size > 3 && recentIps.has(ipAddress)) {
        return {
          suspicious: true,
          reason: 'Multiple IP addresses detected'
        }
      }
    }

    // Check for failed authentication attempts
    const failedAuth = activities.filter(a =>
      a.action.includes('login') && 
      a.status === 'failed' &&
      new Date(a.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    )

    if (failedAuth.length > 5) {
      return {
        suspicious: true,
        reason: 'Multiple failed authentication attempts'
      }
    }

    return { suspicious: false }

  } catch (error) {
    console.error('Error detecting suspicious activity:', error)
    return { suspicious: false }
  }
}