import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { TenantContext } from './tenant-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SecurityEvent {
  type: 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'PERMISSION_DENIED' | 'INVALID_TOKEN' | 'BRUTE_FORCE' | 'SQL_INJECTION' | 'XSS_ATTEMPT' | 'UNAUTHORIZED_ACCESS'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  organizationId?: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  details: Record<string, any>
}

export interface ThreatDetectionConfig {
  enabled: boolean
  sqlInjectionPatterns: RegExp[]
  xssPatterns: RegExp[]
  bruteForceThreshold: number
  suspiciousPatterns: RegExp[]
  maxFailedAttempts: number
  lockoutDuration: number
}

/**
 * Default threat detection configuration
 */
const DEFAULT_THREAT_CONFIG: ThreatDetectionConfig = {
  enabled: true,
  sqlInjectionPatterns: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|\||&)/,
    /(\b(OR|AND)\b.*['"][^'"]*['"].*=.*['"][^'"]*['"])/i,
    /(CONCAT\s*\(|CHAR\s*\(|ASCII\s*\()/i
  ],
  xssPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["\'][^"\']*["\']?/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
  ],
  bruteForceThreshold: 5,
  suspiciousPatterns: [
    /\.\.\/|\.\.\\/, // Directory traversal
    /\/etc\/passwd/i,
    /\/proc\/|\/sys\//,
    /\x00/, // Null bytes
    /%00/i // URL encoded null
  ],
  maxFailedAttempts: 5,
  lockoutDuration: 30 * 60 * 1000 // 30 minutes
}

/**
 * Security monitoring service
 */
export class SecurityMonitor {
  private static instance: SecurityMonitor
  private config: ThreatDetectionConfig
  private failedAttempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map()

  constructor(config: ThreatDetectionConfig = DEFAULT_THREAT_CONFIG) {
    this.config = config
  }

  static getInstance(config?: ThreatDetectionConfig): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor(config)
    }
    return SecurityMonitor.instance
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert({
          type: event.type,
          severity: event.severity,
          organization_id: event.organizationId,
          user_id: event.userId,
          ip_address: event.ip,
          user_agent: event.userAgent,
          endpoint: event.endpoint,
          details: event.details,
          created_at: new Date().toISOString()
        })

      // Also log to audit_logs for critical events
      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        await supabase
          .from('audit_logs')
          .insert({
            organization_id: event.organizationId || 'system',
            actor_id: event.userId || 'system',
            actor_type: 'system',
            action: 'security_event',
            resource_type: 'security',
            resource_id: event.type,
            result: 'failure',
            error_message: `Security event: ${event.type}`,
            ip_address: event.ip,
            user_agent: event.userAgent,
            metadata: {
              security_event_type: event.type,
              severity: event.severity,
              details: event.details
            }
          })
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  /**
   * Detect SQL injection attempts
   */
  detectSQLInjection(input: string): boolean {
    if (!this.config.enabled) return false
    
    return this.config.sqlInjectionPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Detect XSS attempts
   */
  detectXSS(input: string): boolean {
    if (!this.config.enabled) return false
    
    return this.config.xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousActivity(input: string): boolean {
    if (!this.config.enabled) return false
    
    return this.config.suspiciousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Check if IP is currently locked out
   */
  isLockedOut(key: string): boolean {
    const attempts = this.failedAttempts.get(key)
    if (!attempts || !attempts.lockedUntil) return false
    
    if (Date.now() > attempts.lockedUntil) {
      // Lockout expired, reset
      this.failedAttempts.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Record failed attempt and check for brute force
   */
  recordFailedAttempt(key: string): boolean {
    const now = Date.now()
    const attempts = this.failedAttempts.get(key) || { count: 0, lastAttempt: now }
    
    // Reset count if last attempt was more than 1 hour ago
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      attempts.count = 1
    } else {
      attempts.count++
    }
    
    attempts.lastAttempt = now
    
    // Check if threshold reached
    if (attempts.count >= this.config.maxFailedAttempts) {
      attempts.lockedUntil = now + this.config.lockoutDuration
      this.failedAttempts.set(key, attempts)
      return true // Brute force detected
    }
    
    this.failedAttempts.set(key, attempts)
    return false
  }

  /**
   * Analyze request for threats
   */
  async analyzeRequest(req: NextRequest, context?: TenantContext): Promise<SecurityEvent[]> {
    const threats: SecurityEvent[] = []
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
              req.headers.get('x-real-ip') || 
              'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const url = req.url
    const pathname = new URL(req.url).pathname

    try {
      // Check if IP is locked out
      const lockoutKey = `lockout:${ip}`
      if (this.isLockedOut(lockoutKey)) {
        threats.push({
          type: 'BRUTE_FORCE',
          severity: 'HIGH',
          organizationId: context?.organizationId,
          userId: context?.userId,
          ip,
          userAgent,
          endpoint: pathname,
          details: { reason: 'IP locked out due to too many failed attempts' }
        })
      }

      // Analyze URL for suspicious patterns
      if (this.detectSQLInjection(url)) {
        threats.push({
          type: 'SQL_INJECTION',
          severity: 'HIGH',
          organizationId: context?.organizationId,
          userId: context?.userId,
          ip,
          userAgent,
          endpoint: pathname,
          details: { url, reason: 'SQL injection pattern detected in URL' }
        })
      }

      if (this.detectXSS(url)) {
        threats.push({
          type: 'XSS_ATTEMPT',
          severity: 'MEDIUM',
          organizationId: context?.organizationId,
          userId: context?.userId,
          ip,
          userAgent,
          endpoint: pathname,
          details: { url, reason: 'XSS pattern detected in URL' }
        })
      }

      if (this.detectSuspiciousActivity(url)) {
        threats.push({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          organizationId: context?.organizationId,
          userId: context?.userId,
          ip,
          userAgent,
          endpoint: pathname,
          details: { url, reason: 'Suspicious pattern detected in URL' }
        })
      }

      // Analyze request body if present
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.text()
          
          if (this.detectSQLInjection(body)) {
            threats.push({
              type: 'SQL_INJECTION',
              severity: 'CRITICAL',
              organizationId: context?.organizationId,
              userId: context?.userId,
              ip,
              userAgent,
              endpoint: pathname,
              details: { reason: 'SQL injection pattern detected in request body' }
            })
          }

          if (this.detectXSS(body)) {
            threats.push({
              type: 'XSS_ATTEMPT',
              severity: 'HIGH',
              organizationId: context?.organizationId,
              userId: context?.userId,
              ip,
              userAgent,
              endpoint: pathname,
              details: { reason: 'XSS pattern detected in request body' }
            })
          }
        } catch {
          // Ignore body parsing errors
        }
      }

      // Analyze headers for suspicious patterns
      req.headers.forEach((value, key) => {
        if (this.detectSQLInjection(value) || this.detectXSS(value)) {
          threats.push({
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            organizationId: context?.organizationId,
            userId: context?.userId,
            ip,
            userAgent,
            endpoint: pathname,
            details: { header: key, reason: 'Malicious pattern detected in header' }
          })
        }
      })

      // Log all detected threats
      for (const threat of threats) {
        await this.logSecurityEvent(threat)
      }

      return threats
    } catch (error) {
      console.error('Error analyzing request for threats:', error)
      return []
    }
  }

  /**
   * Check rate limit violations
   */
  async checkRateLimitViolations(organizationId: string): Promise<void> {
    try {
      // Check for excessive rate limit violations in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      
      const { data: violations, error } = await supabase
        .from('audit_logs')
        .select('ip_address, COUNT(*) as violation_count')
        .eq('organization_id', organizationId)
        .eq('action', 'rate_limit_exceeded')
        .gte('created_at', oneHourAgo)
        .group('ip_address')
        .having('COUNT(*) > 10')

      if (!error && violations && violations.length > 0) {
        for (const violation of violations) {
          await this.logSecurityEvent({
            type: 'RATE_LIMIT_EXCEEDED',
            severity: 'HIGH',
            organizationId,
            ip: violation.ip_address,
            endpoint: 'multiple',
            details: { 
              violation_count: violation.violation_count,
              time_window: '1 hour',
              reason: 'Excessive rate limit violations detected'
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to check rate limit violations:', error)
    }
  }

  /**
   * Generate security report for organization
   */
  async generateSecurityReport(organizationId: string, days = 7): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: events, error } = await supabase
        .from('security_events')
        .select('type, severity, created_at, ip_address')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to generate security report:', error)
        return null
      }

      // Aggregate events by type and severity
      const report = {
        organization_id: organizationId,
        period_days: days,
        total_events: events?.length || 0,
        events_by_type: {},
        events_by_severity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
        top_threat_ips: {},
        timeline: []
      }

      events?.forEach(event => {
        // Count by type
        report.events_by_type[event.type] = (report.events_by_type[event.type] || 0) + 1
        
        // Count by severity
        report.events_by_severity[event.severity]++
        
        // Track IPs
        if (event.ip_address) {
          report.top_threat_ips[event.ip_address] = (report.top_threat_ips[event.ip_address] || 0) + 1
        }
      })

      return report
    } catch (error) {
      console.error('Failed to generate security report:', error)
      return null
    }
  }
}

/**
 * Security monitoring middleware
 */
export function withSecurityMonitoring(config?: Partial<ThreatDetectionConfig>) {
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      const monitor = SecurityMonitor.getInstance({ ...DEFAULT_THREAT_CONFIG, ...config })
      
      try {
        // Analyze request for threats
        const threats = await monitor.analyzeRequest(req, context)
        
        // Block request if critical threats detected
        const criticalThreats = threats.filter(t => t.severity === 'CRITICAL')
        if (criticalThreats.length > 0) {
          return NextResponse.json(
            { error: 'Request blocked due to security policy' },
            { status: 403 }
          )
        }

        // Check for IP lockout
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                  req.headers.get('x-real-ip') || 
                  'unknown'
        
        if (monitor.isLockedOut(`lockout:${ip}`)) {
          return NextResponse.json(
            { error: 'IP address temporarily blocked due to suspicious activity' },
            { status: 429 }
          )
        }

        // Continue to handler
        const response = await handler(req, context)
        
        // Add security monitoring headers
        response.headers.set('X-Security-Scan', 'enabled')
        if (threats.length > 0) {
          response.headers.set('X-Threats-Detected', threats.length.toString())
        }
        
        return response
      } catch (error) {
        console.error('Security monitoring error:', error)
        
        // Log the error as a security event
        await monitor.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          organizationId: context?.organizationId,
          userId: context?.userId,
          ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
          userAgent: req.headers.get('user-agent') || undefined,
          endpoint: new URL(req.url).pathname,
          details: { error: error.message, reason: 'Security monitoring failure' }
        })
        
        return handler(req, context)
      }
    }
  }
}

/**
 * Brute force protection middleware
 */
export function withBruteForceProtection(key: (req: NextRequest, context?: TenantContext) => string) {
  return function(
    handler: (req: NextRequest, context?: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context?: TenantContext) => {
      const monitor = SecurityMonitor.getInstance()
      const lockoutKey = key(req, context)
      
      // Check if locked out
      if (monitor.isLockedOut(lockoutKey)) {
        return NextResponse.json(
          { 
            error: 'Too many failed attempts. Please try again later.',
            retryAfter: 30 * 60 // 30 minutes
          },
          { status: 429 }
        )
      }
      
      const response = await handler(req, context)
      
      // Record failed attempt for 4xx responses (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const isBruteForce = monitor.recordFailedAttempt(lockoutKey)
        
        if (isBruteForce) {
          await monitor.logSecurityEvent({
            type: 'BRUTE_FORCE',
            severity: 'HIGH',
            organizationId: context?.organizationId,
            userId: context?.userId,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
            userAgent: req.headers.get('user-agent') || undefined,
            endpoint: new URL(req.url).pathname,
            details: { 
              key: lockoutKey,
              reason: 'Brute force attack detected - IP locked out'
            }
          })
        }
      }
      
      return response
    }
  }
}