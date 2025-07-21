import { createHash } from 'crypto'
import type { 
  SecurityPolicy, 
  SecurityPolicyConfig, 
  SecurityEvent,
  SecurityPolicyViolationError 
} from '../types/sso'

export class SecurityPolicyEngine {
  private policies: Map<string, SecurityPolicy[]> = new Map()
  private geoip: any // Would integrate with a GeoIP service

  constructor() {
    // Initialize GeoIP service (would be configured with actual service)
    this.geoip = null
  }

  /**
   * Load security policies for an organization
   */
  async loadPolicies(organizationId: string): Promise<SecurityPolicy[]> {
    // In real implementation, this would fetch from database
    const cached = this.policies.get(organizationId)
    if (cached) {
      return cached.filter(p => p.is_active)
    }

    // Mock policies for now - would be replaced with actual database query
    const mockPolicies: SecurityPolicy[] = []
    this.policies.set(organizationId, mockPolicies)
    
    return mockPolicies
  }

  /**
   * Validate IP address against whitelist policies
   */
  async validateIPAccess(
    organizationId: string, 
    ipAddress: string,
    userAgent?: string
  ): Promise<{ allowed: boolean; reason?: string; event?: SecurityEvent }> {
    const policies = await this.loadPolicies(organizationId)
    const ipPolicies = policies.filter(p => p.policy_type === 'ip_whitelist')

    if (ipPolicies.length === 0) {
      return { allowed: true }
    }

    for (const policy of ipPolicies) {
      const config = policy.configuration
      
      // Check IP whitelist
      if (config.allowed_ips?.length) {
        const isAllowed = config.allowed_ips.some(allowedIp => 
          this.isIPInRange(ipAddress, allowedIp)
        )
        
        if (!isAllowed) {
          const event = await this.createSecurityEvent(organizationId, {
            event_type: 'ip_blocked',
            severity: 'medium',
            description: `IP address ${ipAddress} blocked by whitelist policy`,
            metadata: { 
              policy_id: policy.id,
              blocked_ip: ipAddress,
              user_agent: userAgent 
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          })

          return { 
            allowed: false, 
            reason: `IP address not in whitelist`,
            event 
          }
        }
      }

      // Check country restrictions
      if (config.allowed_countries?.length) {
        const location = await this.getIPLocation(ipAddress)
        
        if (location?.country && !config.allowed_countries.includes(location.country)) {
          const event = await this.createSecurityEvent(organizationId, {
            event_type: 'ip_blocked',
            severity: 'medium',
            description: `Access blocked from country: ${location.country}`,
            metadata: { 
              policy_id: policy.id,
              blocked_country: location.country,
              ip_address: ipAddress 
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          })

          return { 
            allowed: false, 
            reason: `Access not allowed from ${location.country}`,
            event 
          }
        }
      }

      // Check VPN/Proxy blocking
      if (config.block_vpn) {
        const isVPN = await this.detectVPN(ipAddress)
        
        if (isVPN) {
          const event = await this.createSecurityEvent(organizationId, {
            event_type: 'ip_blocked',
            severity: 'high',
            description: `VPN/Proxy access blocked`,
            metadata: { 
              policy_id: policy.id,
              detection_reason: 'vpn_proxy',
              ip_address: ipAddress 
            },
            ip_address: ipAddress,
            user_agent: userAgent,
          })

          return { 
            allowed: false, 
            reason: 'VPN/Proxy access not allowed',
            event 
          }
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Validate MFA requirements
   */
  async validateMFARequirement(
    organizationId: string,
    userId: string,
    hasMFA: boolean,
    lastMFATime?: Date
  ): Promise<{ required: boolean; gracePeriod?: Date; reason?: string }> {
    const policies = await this.loadPolicies(organizationId)
    const mfaPolicies = policies.filter(p => p.policy_type === 'mfa_enforcement')

    if (mfaPolicies.length === 0) {
      return { required: false }
    }

    for (const policy of mfaPolicies) {
      const config = policy.configuration

      if (config.require_mfa && !hasMFA) {
        // Check grace period
        if (config.mfa_grace_period_hours && lastMFATime) {
          const gracePeriodEnd = new Date(lastMFATime)
          gracePeriodEnd.setHours(gracePeriodEnd.getHours() + config.mfa_grace_period_hours)

          if (new Date() < gracePeriodEnd) {
            return { 
              required: false, 
              gracePeriod: gracePeriodEnd,
              reason: 'Within MFA grace period'
            }
          }
        }

        await this.createSecurityEvent(organizationId, {
          event_type: 'mfa_challenge',
          severity: 'medium',
          description: 'MFA required by security policy',
          metadata: { 
            policy_id: policy.id,
            user_id: userId,
            reason: 'policy_enforcement'
          },
        })

        return { 
          required: true,
          reason: 'MFA required by security policy'
        }
      }
    }

    return { required: false }
  }

  /**
   * Validate session timeout policies
   */
  async validateSessionTimeout(
    organizationId: string,
    sessionStart: Date,
    lastActivity: Date
  ): Promise<{ valid: boolean; reason?: string; maxIdleTime?: number; maxSessionTime?: number }> {
    const policies = await this.loadPolicies(organizationId)
    const sessionPolicies = policies.filter(p => p.policy_type === 'session_timeout')

    if (sessionPolicies.length === 0) {
      return { valid: true }
    }

    const now = new Date()

    for (const policy of sessionPolicies) {
      const config = policy.configuration

      // Check idle timeout
      if (config.idle_timeout_minutes) {
        const idleTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
        
        if (idleTime > config.idle_timeout_minutes) {
          return { 
            valid: false, 
            reason: 'Session idle timeout exceeded',
            maxIdleTime: config.idle_timeout_minutes
          }
        }
      }

      // Check absolute timeout
      if (config.absolute_timeout_hours) {
        const sessionTime = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60)
        
        if (sessionTime > config.absolute_timeout_hours) {
          return { 
            valid: false, 
            reason: 'Maximum session time exceeded',
            maxSessionTime: config.absolute_timeout_hours
          }
        }
      }
    }

    return { valid: true }
  }

  /**
   * Validate password against password policies
   */
  async validatePassword(
    organizationId: string,
    password: string,
    previousPasswords?: string[]
  ): Promise<{ valid: boolean; errors: string[] }> {
    const policies = await this.loadPolicies(organizationId)
    const passwordPolicies = policies.filter(p => p.policy_type === 'password_policy')

    if (passwordPolicies.length === 0) {
      return { valid: true, errors: [] }
    }

    const errors: string[] = []

    for (const policy of passwordPolicies) {
      const config = policy.configuration

      // Check minimum length
      if (config.min_length && password.length < config.min_length) {
        errors.push(`Password must be at least ${config.min_length} characters long`)
      }

      // Check uppercase requirement
      if (config.require_uppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
      }

      // Check lowercase requirement
      if (config.require_lowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
      }

      // Check numbers requirement
      if (config.require_numbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number')
      }

      // Check symbols requirement
      if (config.require_symbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
      }

      // Check password reuse
      if (config.prevent_reuse_count && previousPasswords) {
        const passwordHash = this.hashPassword(password)
        const recentHashes = previousPasswords.slice(0, config.prevent_reuse_count)
        
        if (recentHashes.includes(passwordHash)) {
          errors.push(`Password cannot be one of the last ${config.prevent_reuse_count} passwords`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Check for suspicious activity patterns
   */
  async detectSuspiciousActivity(
    organizationId: string,
    userId: string,
    activityData: {
      ipAddress: string
      userAgent: string
      location?: { country?: string; city?: string }
      loginAttempts?: number
      timeSinceLastLogin?: number
    }
  ): Promise<{ suspicious: boolean; reasons: string[]; riskScore: number }> {
    const reasons: string[] = []
    let riskScore = 0

    // Check for multiple rapid login attempts
    if (activityData.loginAttempts && activityData.loginAttempts > 5) {
      reasons.push('Multiple rapid login attempts detected')
      riskScore += 30
    }

    // Check for unusual location
    if (activityData.location?.country) {
      // In real implementation, would check against user's typical locations
      const isUnusualLocation = await this.isUnusualLocation(userId, activityData.location)
      
      if (isUnusualLocation) {
        reasons.push('Login from unusual location')
        riskScore += 20
      }
    }

    // Check for time-based anomalies
    if (activityData.timeSinceLastLogin) {
      const isUnusualTime = await this.isUnusualLoginTime(userId, new Date())
      
      if (isUnusualTime) {
        reasons.push('Login at unusual time')
        riskScore += 10
      }
    }

    // Check for device/browser changes
    const isNewDevice = await this.isNewDevice(userId, activityData.userAgent)
    
    if (isNewDevice) {
      reasons.push('Login from new device/browser')
      riskScore += 15
    }

    const suspicious = riskScore >= 50

    if (suspicious) {
      await this.createSecurityEvent(organizationId, {
        event_type: 'suspicious_activity',
        severity: riskScore >= 70 ? 'high' : 'medium',
        description: 'Suspicious activity detected',
        metadata: {
          user_id: userId,
          risk_score: riskScore,
          reasons,
          activity_data: activityData
        },
        ip_address: activityData.ipAddress,
        user_agent: activityData.userAgent,
      })
    }

    return { suspicious, reasons, riskScore }
  }

  // Private helper methods

  private isIPInRange(ip: string, range: string): boolean {
    // Handle single IP
    if (!range.includes('/')) {
      return ip === range
    }

    // Handle CIDR notation
    const [rangeIP, prefixLength] = range.split('/')
    const mask = -1 << (32 - parseInt(prefixLength))
    
    const ipNum = this.ipToNumber(ip)
    const rangeNum = this.ipToNumber(rangeIP)
    
    return (ipNum & mask) === (rangeNum & mask)
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
  }

  private async getIPLocation(ipAddress: string): Promise<{ country?: string; region?: string; city?: string } | null> {
    try {
      // In real implementation, would use GeoIP service
      // For now, return mock data
      return null
    } catch {
      return null
    }
  }

  private async detectVPN(ipAddress: string): Promise<boolean> {
    try {
      // In real implementation, would use VPN/Proxy detection service
      return false
    } catch {
      return false
    }
  }

  private async isUnusualLocation(userId: string, location: { country?: string; city?: string }): Promise<boolean> {
    // In real implementation, would check against user's location history
    return false
  }

  private async isUnusualLoginTime(userId: string, loginTime: Date): Promise<boolean> {
    // In real implementation, would analyze user's typical login patterns
    return false
  }

  private async isNewDevice(userId: string, userAgent: string): Promise<boolean> {
    // In real implementation, would check against user's device history
    return false
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex')
  }

  private async createSecurityEvent(
    organizationId: string,
    eventData: Omit<SecurityEvent, 'id' | 'organization_id' | 'created_at'>
  ): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      id: this.generateId(),
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      ...eventData,
    }

    // In real implementation, would save to database
    console.log('Security event created:', event)

    return event
  }

  private generateId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}