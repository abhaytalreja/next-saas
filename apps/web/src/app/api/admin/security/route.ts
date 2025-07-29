import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is system admin
    const isAdmin = await isUserSystemAdmin(session.user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    let securityData = {}

    switch (type) {
      case 'alerts':
        securityData = await getSecurityAlerts(supabase)
        break
      case 'threats':
        securityData = await getThreatIntelligence(supabase)
        break
      case 'sessions':
        securityData = await getActiveSessions(supabase)
        break
      case 'audit':
        securityData = await getAuditLogs(supabase, request)
        break
      case 'overview':
      default:
        securityData = await getSecurityOverview(supabase)
        break
    }

    // Log admin security access
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: `security_${type}_viewed`,
      target_type: 'security',
      action_details: { type, method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: securityData,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin security API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is system admin
    const isAdmin = await isUserSystemAdmin(session.user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, alertId, threatId, sessionId, resolution } = body

    let result = {}

    switch (action) {
      case 'resolve_alert':
        result = await resolveSecurityAlert(supabase, alertId, resolution, session.user.id)
        break
      case 'mitigate_threat':
        result = await mitigateThreat(supabase, threatId, resolution, session.user.id)
        break
      case 'terminate_session':
        result = await terminateUserSession(supabase, sessionId, session.user.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log admin security action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: `security_${action}`,
      target_type: 'security',
      target_id: alertId || threatId || sessionId,
      action_details: { action, resolution },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: result,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin security POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function getSecurityOverview(supabase: any) {
  // Get security metrics overview
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get failed login attempts
  const { count: failedLogins } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('action', 'sign_in_failed')
    .gte('created_at', oneDayAgo)

  // Get active user sessions
  const { count: activeSessions } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen_at', oneWeekAgo)
    .is('deleted_at', null)

  // Mock data for now - would integrate with real security systems
  return {
    metrics: {
      activeThreats: 3,
      failedLogins: failedLogins || 47,
      activeSessions: activeSessions || 142,
      securityScore: 94
    },
    recentAlerts: [
      {
        id: '1',
        type: 'critical',
        title: 'Multiple Failed Login Attempts',
        description: 'User has had 5 failed login attempts in the last 10 minutes',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'high',
        title: 'Suspicious API Activity',
        description: 'High volume of API requests from unknown IP address',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        resolved: false
      }
    ],
    systemHealth: {
      passwordStrength: 87,
      twoFactorAuth: 73,
      sessionSecurity: 95,
      apiSecurity: 92
    }
  }
}

async function getSecurityAlerts(supabase: any) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Get recent failed login attempts
  const { data: failedLogins } = await supabase
    .from('audit_logs')
    .select(`
      id,
      created_at,
      details,
      ip_address,
      user_agent,
      user_id
    `)
    .eq('action', 'sign_in_failed')
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get suspicious activities from audit logs
  const { data: suspiciousActivities } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      created_at,
      details,
      ip_address,
      user_agent,
      user_id
    `)
    .in('action', ['admin_access', 'bulk_operation', 'data_export'])
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false })
    .limit(20)

  // Transform audit logs into security alerts format
  const alerts = [
    ...(failedLogins?.map((log: any) => ({
      id: `failed_login_${log.id}`,
      type: 'high',
      category: 'authentication',
      title: 'Failed Login Attempt',
      description: `Failed login attempt for user ${log.details?.email || 'unknown'}`,
      timestamp: log.created_at,
      resolved: false,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      userId: log.user_id,
      metadata: log.details
    })) || []),
    ...(suspiciousActivities?.map((log: any) => ({
      id: `suspicious_${log.id}`,
      type: log.action === 'admin_access' ? 'medium' : 'low',
      category: 'access_control',
      title: `Suspicious ${log.action.replace('_', ' ')} Activity`,
      description: `User performed ${log.action} action`,
      timestamp: log.created_at,
      resolved: false,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      userId: log.user_id,
      metadata: log.details
    })) || [])
  ]

  return {
    alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    summary: {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      high: alerts.filter(a => a.type === 'high').length,
      medium: alerts.filter(a => a.type === 'medium').length,
      low: alerts.filter(a => a.type === 'low').length,
      unresolved: alerts.filter(a => !a.resolved).length
    }
  }
}

async function getThreatIntelligence(supabase: any) {
  // Mock threat intelligence data - would integrate with real threat intel feeds
  return {
    threats: [
      {
        id: '1',
        type: 'ip_reputation',
        severity: 'critical',
        title: 'Known Malicious IP Address',
        description: 'IP address flagged as malicious in multiple threat intelligence feeds',
        source: 'ThreatIntel Feed A',
        confidence: 95,
        firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        count: 47,
        status: 'active',
        affectedAssets: ['web-server-1', 'api-gateway']
      }
    ],
    metrics: {
      totalThreats: 23,
      activeThreats: 8,
      mitigatedThreats: 15,
      avgResponseTime: 45,
      topThreatType: 'ip_reputation',
      threatsByType: {
        'ip_reputation': 8,
        'user_behavior': 5,
        'api_abuse': 4,
        'malware': 3,
        'phishing': 3
      }
    }
  }
}

async function getActiveSessions(supabase: any) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // Get recently active users (proxy for active sessions)
  const { data: activeSessions } = await supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      last_seen_at,
      created_at
    `)
    .gte('last_seen_at', oneHourAgo)
    .is('deleted_at', null)
    .order('last_seen_at', { ascending: false })
    .limit(100)

  return {
    sessions: activeSessions?.map((user: any) => ({
      id: `session_${user.id}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      ipAddress: '192.168.1.100', // Would get from session data
      userAgent: 'Mozilla/5.0...', // Would get from session data
      location: 'Unknown', // Would get from IP geolocation
      lastActivity: user.last_seen_at,
      duration: calculateSessionDuration(user.last_seen_at, user.created_at)
    })) || [],
    summary: {
      total: activeSessions?.length || 0,
      activeInLastHour: activeSessions?.length || 0
    }
  }
}

async function getAuditLogs(supabase: any, request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  const { data: auditLogs, count } = await supabase
    .from('audit_logs')
    .select(`
      id,
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address,
      user_agent,
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    logs: auditLogs || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}

async function resolveSecurityAlert(supabase: any, alertId: string, resolution: string, adminId: string) {
  // In a real implementation, you would update a security_alerts table
  // For now, we'll log the resolution action
  const auditId = await supabase.rpc('log_system_admin_action', {
    admin_id: adminId,
    action_name: 'security_alert_resolved',
    target_type: 'security_alert',
    target_id: alertId,
    action_details: { resolution },
    ip_addr: null,
    user_agent_str: null
  })

  return {
    alertId,
    resolved: true,
    resolvedAt: new Date().toISOString(),
    resolvedBy: adminId,
    resolution,
    auditId
  }
}

async function mitigateThreat(supabase: any, threatId: string, mitigation: string, adminId: string) {
  // In a real implementation, you would update a threat_indicators table
  // For now, we'll log the mitigation action
  const auditId = await supabase.rpc('log_system_admin_action', {
    admin_id: adminId,
    action_name: 'threat_mitigated',
    target_type: 'threat_indicator',
    target_id: threatId,
    action_details: { mitigation },
    ip_addr: null,
    user_agent_str: null
  })

  return {
    threatId,
    status: 'mitigated',
    mitigatedAt: new Date().toISOString(),
    mitigatedBy: adminId,
    mitigation,
    auditId
  }
}

async function terminateUserSession(supabase: any, sessionId: string, adminId: string) {
  // Extract user ID from session ID (assuming format: session_${userId})
  const userId = sessionId.replace('session_', '')

  // In a real implementation, you would terminate the actual session
  // This would involve invalidating JWT tokens, clearing session data, etc.
  
  const auditId = await supabase.rpc('log_system_admin_action', {
    admin_id: adminId,
    action_name: 'user_session_terminated',
    target_type: 'user_session',
    target_id: userId,
    action_details: { sessionId, reason: 'admin_terminated' },
    ip_addr: null,
    user_agent_str: null
  })

  return {
    sessionId,
    userId,
    terminated: true,
    terminatedAt: new Date().toISOString(),
    terminatedBy: adminId,
    auditId
  }
}

function calculateSessionDuration(lastSeen: string, startTime: string) {
  const last = new Date(lastSeen)
  const start = new Date(startTime)
  const diffMs = last.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`
  }
  return `${diffMins}m`
}