import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type UserActivity = Tables['user_activity']['Row']
type InsertUserActivity = Tables['user_activity']['Insert']

export interface AuditEvent {
  userId?: string
  organizationId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failed' | 'pending' | 'blocked'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface SecurityEvent extends AuditEvent {
  eventType: 'authentication' | 'authorization' | 'data_access' | 'configuration_change' | 'security_violation'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditQuery {
  userId?: string
  organizationId?: string
  action?: string
  resource?: string
  status?: string
  severity?: string
  dateFrom?: Date
  dateTo?: Date
  ipAddress?: string
  limit?: number
  offset?: number
}

export class AuditService {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables')
    }

    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  /**
   * Log a general audit event
   */
  async logEvent(event: AuditEvent): Promise<{ success: boolean; activityId?: string; error?: string }> {
    try {
      const activityData: InsertUserActivity = {
        id: crypto.randomUUID(),
        user_id: event.userId,
        organization_id: event.organizationId,
        action: event.action,
        resource: event.resource,
        resource_id: event.resourceId,
        details: event.details || {},
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        status: event.status,
        severity: event.severity,
        created_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('user_activity')
        .insert(activityData)
        .select('id')
        .single()

      if (error) {
        console.error('Failed to log audit event:', error)
        return { success: false, error: error.message }
      }

      return { success: true, activityId: data.id }
    } catch (error) {
      console.error('Failed to log audit event:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to log event' 
      }
    }
  }

  /**
   * Log a security-specific event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const enhancedDetails = {
      ...event.details,
      event_type: event.eventType,
      risk_level: event.riskLevel,
      security_event: true
    }

    return this.logEvent({
      ...event,
      details: enhancedDetails,
      severity: this.mapRiskToSeverity(event.riskLevel)
    })
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(params: {
    userId?: string
    action: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled'
    ipAddress?: string
    userAgent?: string
    details?: Record<string, any>
    status: 'success' | 'failed' | 'blocked'
  }): Promise<{ success: boolean; activityId?: string; error?: string }> {
    return this.logSecurityEvent({
      userId: params.userId,
      action: params.action,
      resource: 'authentication',
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.status,
      severity: this.getAuthEventSeverity(params.action, params.status),
      eventType: 'authentication',
      riskLevel: this.getAuthEventRiskLevel(params.action, params.status)
    })
  }

  /**
   * Log profile update events
   */
  async logProfileUpdate(params: {
    userId: string
    organizationId?: string
    changes: Record<string, { old: any; new: any }>
    ipAddress?: string
    userAgent?: string
  }): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const sensitiveFields = ['email', 'phone_number', 'avatar_url']
    const hasSensitiveChanges = Object.keys(params.changes).some(field => 
      sensitiveFields.includes(field)
    )

    return this.logEvent({
      userId: params.userId,
      organizationId: params.organizationId,
      action: 'profile_update',
      resource: 'profile',
      details: {
        changes: params.changes,
        has_sensitive_changes: hasSensitiveChanges,
        changed_fields: Object.keys(params.changes)
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: 'success',
      severity: hasSensitiveChanges ? 'medium' : 'low'
    })
  }

  /**
   * Log data access events
   */
  async logDataAccess(params: {
    userId?: string
    organizationId?: string
    action: 'data_export' | 'data_view' | 'data_download'
    resource: string
    resourceId?: string
    ipAddress?: string
    userAgent?: string
    details?: Record<string, any>
  }): Promise<{ success: boolean; activityId?: string; error?: string }> {
    return this.logSecurityEvent({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: 'success',
      severity: 'medium',
      eventType: 'data_access',
      riskLevel: 'medium'
    })
  }

  /**
   * Log security violations
   */
  async logSecurityViolation(params: {
    userId?: string
    organizationId?: string
    violationType: 'rate_limit' | 'unauthorized_access' | 'suspicious_activity' | 'malformed_request'
    resource: string
    ipAddress?: string
    userAgent?: string
    details?: Record<string, any>
  }): Promise<{ success: boolean; activityId?: string; error?: string }> {
    return this.logSecurityEvent({
      userId: params.userId,
      organizationId: params.organizationId,
      action: `security_violation_${params.violationType}`,
      resource: params.resource,
      details: {
        ...params.details,
        violation_type: params.violationType
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: 'blocked',
      severity: 'high',
      eventType: 'security_violation',
      riskLevel: 'high'
    })
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs(query: AuditQuery): Promise<{ success: boolean; activities?: UserActivity[]; total?: number; error?: string }> {
    try {
      let supabaseQuery = this.supabase
        .from('user_activity')
        .select('*', { count: 'exact' })

      // Apply filters
      if (query.userId) {
        supabaseQuery = supabaseQuery.eq('user_id', query.userId)
      }
      if (query.organizationId) {
        supabaseQuery = supabaseQuery.eq('organization_id', query.organizationId)
      }
      if (query.action) {
        supabaseQuery = supabaseQuery.eq('action', query.action)
      }
      if (query.resource) {
        supabaseQuery = supabaseQuery.eq('resource', query.resource)
      }
      if (query.status) {
        supabaseQuery = supabaseQuery.eq('status', query.status)
      }
      if (query.severity) {
        supabaseQuery = supabaseQuery.eq('severity', query.severity)
      }
      if (query.ipAddress) {
        supabaseQuery = supabaseQuery.eq('ip_address', query.ipAddress)
      }
      if (query.dateFrom) {
        supabaseQuery = supabaseQuery.gte('created_at', query.dateFrom.toISOString())
      }
      if (query.dateTo) {
        supabaseQuery = supabaseQuery.lte('created_at', query.dateTo.toISOString())
      }

      // Apply pagination
      const limit = query.limit || 50
      const offset = query.offset || 0
      supabaseQuery = supabaseQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await supabaseQuery

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, activities: data || [], total: count || 0 }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to query audit logs' 
      }
    }
  }

  /**
   * Get security events for a user
   */
  async getUserSecurityEvents(userId: string, limit: number = 20): Promise<{ success: boolean; events?: UserActivity[]; error?: string }> {
    return this.queryAuditLogs({
      userId,
      limit,
      severity: 'high'
    }).then(result => ({
      success: result.success,
      events: result.activities,
      error: result.error
    }))
  }

  /**
   * Get suspicious activities
   */
  async getSuspiciousActivities(organizationId?: string, hours: number = 24): Promise<{ success: boolean; activities?: UserActivity[]; error?: string }> {
    const dateFrom = new Date()
    dateFrom.setHours(dateFrom.getHours() - hours)

    return this.queryAuditLogs({
      organizationId,
      status: 'blocked',
      dateFrom,
      limit: 100
    }).then(result => ({
      success: result.success,
      activities: result.activities,
      error: result.error
    }))
  }

  /**
   * Clean up old audit logs (older than specified days)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const { data, error } = await this.supabase
        .from('user_activity')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) {
        return { success: false, error: error.message }
      }

      const deletedCount = data?.length || 0

      return { success: true, deletedCount }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup logs' 
      }
    }
  }

  /**
   * Helper method to map risk level to severity
   */
  private mapRiskToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      default: return 'low'
    }
  }

  /**
   * Helper method to determine auth event severity
   */
  private getAuthEventSeverity(action: string, status: string): 'low' | 'medium' | 'high' | 'critical' {
    if (status === 'failed' || status === 'blocked') {
      if (action.includes('login')) return 'medium'
      if (action.includes('password')) return 'high'
    }
    if (action.includes('mfa')) return 'medium'
    return 'low'
  }

  /**
   * Helper method to determine auth event risk level
   */
  private getAuthEventRiskLevel(action: string, status: string): 'low' | 'medium' | 'high' | 'critical' {
    if (status === 'failed' || status === 'blocked') {
      if (action.includes('login')) return 'medium'
      if (action.includes('password')) return 'high'
    }
    if (action.includes('mfa')) return 'medium'
    return 'low'
  }
}

// Singleton instance
export const auditService = new AuditService()