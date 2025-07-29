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

    // Get dashboard metrics in parallel
    const [
      usersMetrics,
      organizationsMetrics,
      revenueMetrics,
      systemMetrics,
      emailMetrics,
      recentActivity
    ] = await Promise.all([
      getUserMetrics(supabase),
      getOrganizationMetrics(supabase),
      getRevenueMetrics(supabase),
      getSystemMetrics(supabase),
      getEmailMetrics(supabase),
      getRecentActivity(supabase)
    ])

    const dashboardData = {
      // User metrics
      totalUsers: usersMetrics.total,
      activeUsers: usersMetrics.active,
      newUsersToday: usersMetrics.newToday,
      userGrowthRate: usersMetrics.growthRate,
      userRetentionRate: usersMetrics.retentionRate,

      // Organization metrics
      totalOrganizations: organizationsMetrics.total,
      activeOrganizations: organizationsMetrics.active,
      newOrganizationsToday: organizationsMetrics.newToday,
      organizationGrowthRate: organizationsMetrics.growthRate,

      // Revenue metrics (mock data for now)
      monthlyRecurringRevenue: revenueMetrics.mrr,
      totalRevenue: revenueMetrics.total,
      averageRevenuePerUser: revenueMetrics.arpu,
      revenueGrowthRate: revenueMetrics.growthRate,
      churnRate: revenueMetrics.churnRate,

      // System metrics (mock data for now)
      systemUptime: systemMetrics.uptime,
      apiResponseTime: systemMetrics.responseTime,
      errorRate: systemMetrics.errorRate,
      activeConnections: systemMetrics.activeConnections,

      // Email metrics (mock data for now)
      emailsSentToday: emailMetrics.sentToday,
      emailDeliveryRate: emailMetrics.deliveryRate,
      campaignsActive: emailMetrics.activeCampaigns,
      subscriberCount: emailMetrics.subscribers,

      // Recent activity
      recentActivity: recentActivity
    }

    // Log admin dashboard access
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'dashboard_viewed',
      target_type: 'dashboard',
      action_details: { method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: dashboardData,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function getUserMetrics(supabase: any) {
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Get new users today
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today)
    .is('deleted_at', null)

  // Get active users (last 7 days)
  const { count: activeUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .gte('last_seen_at', sevenDaysAgo)
    .is('deleted_at', null)

  return {
    total: totalUsers || 0,
    active: activeUsers || 0,
    newToday: newUsersToday || 0,
    growthRate: 5.2, // Calculate from historical data
    retentionRate: 85.3 // Calculate from user activity
  }
}

async function getOrganizationMetrics(supabase: any) {
  const today = new Date().toISOString().split('T')[0]
  
  // Get total organizations
  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Get new organizations today
  const { count: newOrganizationsToday } = await supabase
    .from('organizations')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today)
    .is('deleted_at', null)

  return {
    total: totalOrganizations || 0,
    active: totalOrganizations || 0, // Assume all non-deleted are active
    newToday: newOrganizationsToday || 0,
    growthRate: 3.8
  }
}

async function getRevenueMetrics(supabase: any) {
  // This would integrate with your billing system
  // For now, return mock data
  return {
    mrr: 125000,
    total: 1500000,
    arpu: 89.50,
    growthRate: 12.5,
    churnRate: 2.1
  }
}

async function getSystemMetrics(supabase: any) {
  // This would integrate with your monitoring system
  // For now, return mock data
  return {
    uptime: 99.95,
    responseTime: 145,
    errorRate: 0.02,
    activeConnections: 1247
  }
}

async function getEmailMetrics(supabase: any) {
  // This would integrate with your email system
  // For now, return mock data
  return {
    sentToday: 15420,
    deliveryRate: 99.2,
    activeCampaigns: 8,
    subscribers: 125000
  }
}

async function getRecentActivity(supabase: any) {
  const { data: activity } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      resource_type,
      created_at,
      user_id,
      details
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  return activity?.map((log: any) => ({
    id: log.id,
    description: `${log.action} ${log.resource_type}`,
    timestamp: log.created_at,
    type: log.resource_type,
    userId: log.user_id,
    metadata: log.details
  })) || []
}