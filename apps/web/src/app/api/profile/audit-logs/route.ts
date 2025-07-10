import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { auditService } from '@/packages/auth/src/services/audit-service'
import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

const auditQuerySchema = z.object({
  action: z.string().optional(),
  resource: z.string().optional(),
  status: z.enum(['success', 'failed', 'pending', 'blocked']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  include_security_only: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    const {
      action,
      resource,
      status,
      severity,
      date_from,
      date_to,
      limit,
      offset,
      include_security_only
    } = auditQuerySchema.parse(queryParams)

    // Build audit query
    const auditQuery: any = {
      userId: session.user.id,
      action,
      resource,
      status,
      severity,
      limit,
      offset
    }

    if (date_from) {
      auditQuery.dateFrom = new Date(date_from)
    }

    if (date_to) {
      auditQuery.dateTo = new Date(date_to)
    }

    // Get audit logs
    const result = await auditService.queryAuditLogs(auditQuery)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Filter security events if requested
    let activities = result.activities || []
    if (include_security_only) {
      activities = activities.filter(activity => 
        activity.details && 
        typeof activity.details === 'object' && 
        'security_event' in activity.details
      )
    }

    // Format activities for client
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      resource: activity.resource,
      resourceId: activity.resource_id,
      status: activity.status,
      severity: activity.severity,
      ipAddress: activity.ip_address,
      userAgent: activity.user_agent,
      details: activity.details,
      createdAt: activity.created_at,
      // Add computed fields for better UX
      actionDisplay: formatActionDisplay(activity.action),
      resourceDisplay: formatResourceDisplay(activity.resource),
      statusIcon: getStatusIcon(activity.status),
      severityColor: getSeverityColor(activity.severity || 'low'),
      isSecurityEvent: activity.details && 
        typeof activity.details === 'object' && 
        'security_event' in activity.details
    }))

    // Log the audit log access
    await auditService.logEvent({
      userId: session.user.id,
      action: 'audit_logs_viewed',
      resource: 'audit_logs',
      details: {
        filters: {
          action,
          resource,
          status,
          severity,
          security_only: include_security_only
        },
        result_count: formattedActivities.length
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined,
      status: 'success',
      severity: 'low'
    })

    return NextResponse.json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          total: result.total || 0,
          limit,
          offset,
          hasMore: (result.total || 0) > offset + limit
        },
        filters: {
          action,
          resource,
          status,
          severity,
          dateFrom: date_from,
          dateTo: date_to,
          securityOnly: include_security_only
        }
      }
    })

  } catch (error) {
    console.error('Audit logs fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for formatting
function formatActionDisplay(action: string): string {
  const actionMap: Record<string, string> = {
    'login_success': 'Successful Login',
    'login_failed': 'Failed Login',
    'logout': 'Logout',
    'password_change': 'Password Changed',
    'profile_update': 'Profile Updated',
    'avatar_upload': 'Avatar Uploaded',
    'session_revoked': 'Session Revoked',
    'sessions_bulk_revoked': 'Multiple Sessions Revoked',
    'data_export': 'Data Exported',
    'preferences_update': 'Preferences Updated',
    'security_violation_rate_limit': 'Rate Limit Exceeded',
    'security_violation_unauthorized_access': 'Unauthorized Access Attempt',
    'mfa_enabled': 'Two-Factor Authentication Enabled',
    'mfa_disabled': 'Two-Factor Authentication Disabled',
  }

  return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatResourceDisplay(resource: string): string {
  const resourceMap: Record<string, string> = {
    'authentication': 'Authentication',
    'profile': 'Profile',
    'sessions': 'Sessions',
    'preferences': 'Preferences',
    'avatar': 'Avatar',
    'data_export': 'Data Export',
    'audit_logs': 'Audit Logs',
  }

  return resourceMap[resource] || resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    'success': '✅',
    'failed': '❌', 
    'blocked': '🚫',
    'pending': '⏳'
  }

  return iconMap[status] || '❓'
}

function getSeverityColor(severity: string): string {
  const colorMap: Record<string, string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-orange-600',
    'critical': 'text-red-600'
  }

  return colorMap[severity] || 'text-gray-600'
}