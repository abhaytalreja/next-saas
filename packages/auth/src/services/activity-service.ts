import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { auditService, createAuditService, AuditEvent } from './audit-service'

type Tables = Database['public']['Tables']
type UserActivity = Tables['user_activity']['Row']

export interface ActivityContext {
  userId: string
  organizationId?: string
  ipAddress?: string
  userAgent?: string
}

export interface ProfileActivityEvent {
  action: 'profile_update' | 'avatar_upload' | 'avatar_delete' | 'preferences_update' | 'password_change' | 'email_change'
  details?: Record<string, any>
  metadata?: Record<string, any>
}

export interface AuthActivityEvent {
  action: 'login' | 'logout' | 'signup' | 'password_reset' | 'email_verification' | 'mfa_enable' | 'mfa_disable'
  status: 'success' | 'failed' | 'pending' | 'blocked'
  details?: Record<string, any>
}

export interface DataActivityEvent {
  action: 'data_export' | 'data_download' | 'account_deletion_requested' | 'account_deletion_cancelled'
  resourceId?: string
  details?: Record<string, any>
}

export interface OrganizationActivityEvent {
  action: 'org_joined' | 'org_left' | 'role_changed' | 'permission_granted' | 'permission_revoked'
  organizationId: string
  details?: Record<string, any>
}

export class ActivityService {
  private audit: ReturnType<typeof createAuditService>

  constructor(supabase?: ReturnType<typeof createClient<Database>>) {
    this.audit = supabase ? createAuditService(supabase) : auditService
  }

  /**
   * Track profile-related activities
   */
  async trackProfileActivity(
    context: ActivityContext, 
    event: ProfileActivityEvent
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const severity = this.getProfileActivitySeverity(event.action)
    
    const auditEvent: AuditEvent = {
      userId: context.userId,
      organizationId: context.organizationId,
      action: event.action,
      resource: 'profile',
      resourceId: context.userId,
      details: {
        ...event.details,
        metadata: event.metadata,
        activity_type: 'profile_management'
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status: 'success',
      severity
    }

    return await this.audit.logEvent(auditEvent)
  }

  /**
   * Track authentication activities
   */
  async trackAuthActivity(
    context: ActivityContext,
    event: AuthActivityEvent
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    return await this.audit.logAuthEvent({
      userId: context.userId,
      organizationId: context.organizationId,
      action: event.action,
      status: event.status,
      details: event.details,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    })
  }

  /**
   * Track data-related activities (export, deletion, etc.)
   */
  async trackDataActivity(
    context: ActivityContext,
    event: DataActivityEvent
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const severity = this.getDataActivitySeverity(event.action)
    
    return await this.audit.logDataAccess({
      userId: context.userId,
      organizationId: context.organizationId,
      action: event.action,
      resource: 'user_data',
      resourceId: event.resourceId || context.userId,
      details: {
        ...event.details,
        activity_type: 'data_management'
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity
    })
  }

  /**
   * Track organization-related activities
   */
  async trackOrganizationActivity(
    context: ActivityContext,
    event: OrganizationActivityEvent
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const severity = this.getOrgActivitySeverity(event.action)
    
    const auditEvent: AuditEvent = {
      userId: context.userId,
      organizationId: event.organizationId,
      action: event.action,
      resource: 'organization',
      resourceId: event.organizationId,
      details: {
        ...event.details,
        activity_type: 'organization_management'
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status: 'success',
      severity
    }

    return await this.audit.logEvent(auditEvent)
  }

  /**
   * Track general user activities
   */
  async trackUserActivity(
    context: ActivityContext,
    action: string,
    resource: string,
    details?: Record<string, any>
  ): Promise<{ success: boolean; activityId?: string; error?: string }> {
    const auditEvent: AuditEvent = {
      userId: context.userId,
      organizationId: context.organizationId,
      action,
      resource,
      resourceId: context.userId,
      details: {
        ...details,
        activity_type: 'general_activity'
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status: 'success',
      severity: 'low'
    }

    return await this.audit.logEvent(auditEvent)
  }

  /**
   * Get user's recent activities with filtering
   */
  async getUserActivities(
    userId: string,
    options: {
      organizationId?: string
      limit?: number
      offset?: number
      dateFrom?: Date
      dateTo?: Date
      actions?: string[]
      resources?: string[]
    } = {}
  ): Promise<{ success: boolean; activities?: UserActivity[]; total?: number; error?: string }> {
    return await this.audit.queryAuditLogs({
      userId,
      organizationId: options.organizationId,
      limit: options.limit || 50,
      offset: options.offset || 0,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      action: options.actions?.join(','),
      // Note: The audit service expects single values, this is a simplified implementation
    })
  }

  /**
   * Get activity statistics for a user
   */
  async getUserActivityStats(
    userId: string,
    organizationId?: string,
    days: number = 30
  ): Promise<{
    success: boolean
    stats?: {
      totalActivities: number
      profileUpdates: number
      authEvents: number
      dataEvents: number
      organizationEvents: number
      lastActivity?: string
      mostActiveDay?: string
      activityByDay: { date: string; count: number }[]
    }
    error?: string
  }> {
    try {
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - days)

      const result = await this.audit.queryAuditLogs({
        userId,
        organizationId,
        dateFrom,
        limit: 1000 // Get a large sample for statistics
      })

      if (!result.success || !result.activities) {
        return { success: false, error: result.error || 'Failed to fetch activities' }
      }

      const activities = result.activities
      const stats = {
        totalActivities: activities.length,
        profileUpdates: activities.filter(a => 
          ['profile_update', 'avatar_upload', 'avatar_delete', 'preferences_update'].includes(a.action)
        ).length,
        authEvents: activities.filter(a => 
          ['login', 'logout', 'signup', 'password_reset'].includes(a.action)
        ).length,
        dataEvents: activities.filter(a => 
          ['data_export', 'data_download', 'account_deletion_requested'].includes(a.action)
        ).length,
        organizationEvents: activities.filter(a => 
          ['org_joined', 'org_left', 'role_changed'].includes(a.action)
        ).length,
        lastActivity: activities.length > 0 ? activities[0].created_at : undefined,
        mostActiveDay: undefined as string | undefined,
        activityByDay: [] as { date: string; count: number }[]
      }

      // Calculate activity by day
      const activityCounts: Record<string, number> = {}
      let maxCount = 0
      let mostActiveDate = ''

      activities.forEach(activity => {
        const date = new Date(activity.created_at).toISOString().split('T')[0]
        activityCounts[date] = (activityCounts[date] || 0) + 1
        
        if (activityCounts[date] > maxCount) {
          maxCount = activityCounts[date]
          mostActiveDate = date
        }
      })

      stats.mostActiveDay = mostActiveDate
      stats.activityByDay = Object.entries(activityCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return { success: true, stats }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate activity statistics'
      }
    }
  }

  /**
   * Get security-related activities for a user
   */
  async getUserSecurityActivities(
    userId: string,
    limit: number = 20
  ): Promise<{ success: boolean; events?: UserActivity[]; error?: string }> {
    return await this.audit.getUserSecurityEvents(userId, limit)
  }

  /**
   * Track bulk activities (useful for migrations or batch operations)
   */
  async trackBulkActivities(
    activities: Array<{
      context: ActivityContext
      action: string
      resource: string
      details?: Record<string, any>
    }>
  ): Promise<{ success: boolean; results?: Array<{ success: boolean; activityId?: string; error?: string }>; error?: string }> {
    try {
      const results = await Promise.all(
        activities.map(activity => 
          this.trackUserActivity(
            activity.context,
            activity.action,
            activity.resource,
            activity.details
          )
        )
      )

      const hasErrors = results.some(result => !result.success)
      
      return {
        success: !hasErrors,
        results,
        error: hasErrors ? 'Some activities failed to log' : undefined
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track bulk activities'
      }
    }
  }

  /**
   * Helper method to determine profile activity severity
   */
  private getProfileActivitySeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'password_change':
      case 'email_change':
        return 'high'
      case 'avatar_upload':
      case 'avatar_delete':
        return 'medium'
      case 'profile_update':
      case 'preferences_update':
        return 'low'
      default:
        return 'low'
    }
  }

  /**
   * Helper method to determine data activity severity
   */
  private getDataActivitySeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'account_deletion_requested':
        return 'critical'
      case 'data_export':
      case 'data_download':
        return 'medium'
      case 'account_deletion_cancelled':
        return 'high'
      default:
        return 'low'
    }
  }

  /**
   * Helper method to determine organization activity severity
   */
  private getOrgActivitySeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'role_changed':
      case 'permission_granted':
      case 'permission_revoked':
        return 'medium'
      case 'org_joined':
      case 'org_left':
        return 'low'
      default:
        return 'low'
    }
  }
}

// Singleton instance
export const activityService = new ActivityService()

// Factory function for custom supabase client
export function createActivityService(supabase: ReturnType<typeof createClient<Database>>) {
  return new ActivityService(supabase)
}