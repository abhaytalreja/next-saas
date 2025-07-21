import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@nextsaas/supabase/server'
import { SecurityPolicyEngine } from '../lib/security-policy-engine'
import type { SecurityPolicy } from '../types/sso'

export interface SecurityMiddlewareConfig {
  // Skip security checks for these paths
  skipPaths?: string[]
  // Custom error pages
  errorPages?: {
    ipBlocked?: string
    mfaRequired?: string
    sessionExpired?: string
  }
  // Enable debug logging
  debug?: boolean
}

export class SecurityMiddleware {
  private policyEngine: SecurityPolicyEngine
  private config: SecurityMiddlewareConfig

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.policyEngine = new SecurityPolicyEngine()
    this.config = {
      skipPaths: ['/auth/sign-in', '/auth/sign-up', '/auth/callback', '/api/auth/callback', ...config.skipPaths || []],
      errorPages: {
        ipBlocked: '/security/ip-blocked',
        mfaRequired: '/security/mfa-required',
        sessionExpired: '/auth/sign-in?reason=session-expired',
        ...config.errorPages,
      },
      debug: config.debug || false,
    }
  }

  async handle(request: NextRequest): Promise<NextResponse> {
    const pathname = request.nextUrl.pathname

    // Skip security checks for certain paths
    if (this.shouldSkipPath(pathname)) {
      return NextResponse.next()
    }

    try {
      // Get client IP
      const clientIP = this.getClientIP(request)
      const userAgent = request.headers.get('user-agent') || ''

      if (this.config.debug) {
        console.log(`[SecurityMiddleware] Checking path: ${pathname}, IP: ${clientIP}`)
      }

      // Get user session
      const supabase = createSupabaseServerClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // No session, skip security checks (will be handled by auth middleware)
        return NextResponse.next()
      }

      // Get user's organization context
      const organizationId = await this.getOrganizationContext(request, session.user.id)
      
      if (!organizationId) {
        // No organization context, skip security checks
        return NextResponse.next()
      }

      // Load and check security policies
      const policies = await this.loadSecurityPolicies(organizationId)
      
      if (policies.length === 0) {
        // No security policies, allow access
        return NextResponse.next()
      }

      // Validate IP access
      const ipValidation = await this.policyEngine.validateIPAccess(
        organizationId,
        clientIP,
        userAgent
      )

      if (!ipValidation.allowed) {
        if (this.config.debug) {
          console.log(`[SecurityMiddleware] IP blocked: ${ipValidation.reason}`)
        }
        return this.createBlockResponse('ip_blocked', ipValidation.reason)
      }

      // Validate MFA requirement
      const userMFAStatus = await this.getUserMFAStatus(session.user.id)
      const mfaValidation = await this.policyEngine.validateMFARequirement(
        organizationId,
        session.user.id,
        userMFAStatus.enabled,
        userMFAStatus.lastVerified
      )

      if (mfaValidation.required && !this.isMFASetupPath(pathname)) {
        if (this.config.debug) {
          console.log(`[SecurityMiddleware] MFA required: ${mfaValidation.reason}`)
        }
        return this.createMFARequiredResponse(mfaValidation.gracePeriod)
      }

      // Validate session timeout
      const sessionData = await this.getSessionData(session.user.id)
      if (sessionData) {
        const sessionValidation = await this.policyEngine.validateSessionTimeout(
          organizationId,
          sessionData.started_at,
          sessionData.last_activity
        )

        if (!sessionValidation.valid) {
          if (this.config.debug) {
            console.log(`[SecurityMiddleware] Session timeout: ${sessionValidation.reason}`)
          }
          
          // Clear session and redirect to login
          await supabase.auth.signOut()
          return this.createSessionExpiredResponse(sessionValidation.reason)
        }

        // Update last activity
        await this.updateSessionActivity(session.user.id)
      }

      // Check for suspicious activity
      const suspiciousActivity = await this.policyEngine.detectSuspiciousActivity(
        organizationId,
        session.user.id,
        {
          ipAddress: clientIP,
          userAgent,
          location: await this.getLocationFromIP(clientIP),
        }
      )

      if (suspiciousActivity.suspicious && suspiciousActivity.riskScore >= 80) {
        if (this.config.debug) {
          console.log(`[SecurityMiddleware] High risk activity detected: ${suspiciousActivity.riskScore}`)
        }
        
        // For very high risk, require re-authentication
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL('/auth/sign-in?reason=suspicious-activity', request.url)
        )
      }

      // All security checks passed
      return NextResponse.next()

    } catch (error) {
      console.error('[SecurityMiddleware] Error:', error)
      
      // On error, allow access but log the issue
      if (this.config.debug) {
        console.log('[SecurityMiddleware] Error occurred, allowing access')
      }
      
      return NextResponse.next()
    }
  }

  private shouldSkipPath(pathname: string): boolean {
    return this.config.skipPaths!.some(path => pathname.startsWith(path))
  }

  private isMFASetupPath(pathname: string): boolean {
    const mfaPaths = ['/auth/mfa', '/security/mfa', '/settings/security']
    return mfaPaths.some(path => pathname.startsWith(path))
  }

  private getClientIP(request: NextRequest): string {
    // Check various headers for the real IP
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const xRealIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (cfConnectingIP) return cfConnectingIP
    if (xRealIP) return xRealIP
    if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
    
    return '127.0.0.1' // Fallback IP for NextRequest which doesn't have ip property
  }

  private async getOrganizationContext(request: NextRequest, userId: string): Promise<string | null> {
    try {
      // Try to get organization from header or cookie
      const orgHeader = request.headers.get('x-organization-id')
      if (orgHeader) return orgHeader

      const orgCookie = request.cookies.get('organization_id')?.value
      if (orgCookie) return orgCookie

      // Fallback: get user's primary organization
      const supabase = createSupabaseServerClient()
      const { data } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .limit(1)
        .single()

      return data?.organization_id || null
    } catch {
      return null
    }
  }

  private async loadSecurityPolicies(organizationId: string): Promise<SecurityPolicy[]> {
    try {
      const supabase = createSupabaseServerClient()
      const { data } = await supabase
        .from('security_policies')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      return data || []
    } catch {
      return []
    }
  }

  private async getUserMFAStatus(userId: string): Promise<{ enabled: boolean; lastVerified?: Date }> {
    try {
      const supabase = createSupabaseServerClient()
      const { data } = await supabase
        .from('user_mfa_settings')
        .select('enabled, last_verified_at')
        .eq('user_id', userId)
        .single()

      return {
        enabled: data?.enabled || false,
        lastVerified: data?.last_verified_at ? new Date(data.last_verified_at) : undefined,
      }
    } catch {
      return { enabled: false }
    }
  }

  private async getSessionData(userId: string): Promise<{ started_at: Date; last_activity: Date } | null> {
    try {
      const supabase = createSupabaseServerClient()
      const { data } = await supabase
        .from('user_sessions')
        .select('started_at, last_activity_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) return null

      return {
        started_at: new Date(data.started_at),
        last_activity: new Date(data.last_activity_at),
      }
    } catch {
      return null
    }
  }

  private async updateSessionActivity(userId: string): Promise<void> {
    try {
      const supabase = createSupabaseServerClient()
      await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_active', true)
    } catch {
      // Ignore errors
    }
  }

  private async getLocationFromIP(ipAddress: string): Promise<{ country?: string; city?: string } | undefined> {
    // In real implementation, would use a GeoIP service
    return undefined
  }

  private createBlockResponse(reason: 'ip_blocked', message?: string): NextResponse {
    const redirectUrl = this.config.errorPages!.ipBlocked!
    const response = NextResponse.redirect(new URL(redirectUrl, 'http://localhost'))
    
    if (message) {
      response.cookies.set('security_block_reason', message, { 
        maxAge: 300, // 5 minutes
        secure: true,
        httpOnly: true,
      })
    }
    
    return response
  }

  private createMFARequiredResponse(gracePeriod?: Date): NextResponse {
    const redirectUrl = this.config.errorPages!.mfaRequired!
    const response = NextResponse.redirect(new URL(redirectUrl, 'http://localhost'))
    
    if (gracePeriod) {
      response.cookies.set('mfa_grace_period', gracePeriod.toISOString(), {
        maxAge: 300,
        secure: true,
        httpOnly: true,
      })
    }
    
    return response
  }

  private createSessionExpiredResponse(reason?: string): NextResponse {
    const redirectUrl = this.config.errorPages!.sessionExpired!
    const url = new URL(redirectUrl, 'http://localhost')
    
    if (reason) {
      url.searchParams.set('reason', reason)
    }
    
    return NextResponse.redirect(url)
  }
}

// Factory function for easy integration
export function createSecurityMiddleware(config?: SecurityMiddlewareConfig) {
  const middleware = new SecurityMiddleware(config)
  return (request: NextRequest) => middleware.handle(request)
}

// Helper function for integrating with existing middleware
export function withSecurity(
  middleware: (request: NextRequest) => Promise<NextResponse>,
  config?: SecurityMiddlewareConfig
) {
  const securityMiddleware = new SecurityMiddleware(config)
  
  return async (request: NextRequest): Promise<NextResponse> => {
    // Run security checks first
    const securityResponse = await securityMiddleware.handle(request)
    
    // If security middleware returns a redirect/block, return it
    if (securityResponse.status !== 200) {
      return securityResponse
    }
    
    // Otherwise, continue with the original middleware
    return middleware(request)
  }
}