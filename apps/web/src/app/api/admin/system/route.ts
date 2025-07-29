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

    let systemData = {}

    switch (type) {
      case 'health':
        systemData = await getSystemHealth(supabase)
        break
      case 'performance':
        systemData = await getPerformanceMetrics(supabase)
        break
      case 'database':
        systemData = await getDatabaseStatus(supabase)
        break
      case 'api':
        systemData = await getAPIStatus(supabase)
        break
      case 'logs':
        systemData = await getSystemLogs(supabase, request)
        break
      case 'overview':
      default:
        systemData = await getSystemOverview(supabase)
        break
    }

    // Log admin system access
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: `system_${type}_viewed`,
      target_type: 'system',
      action_details: { type, method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: systemData,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin system API error:', error)
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
    const { action, service, config } = body

    let result = {}

    switch (action) {
      case 'restart_service':
        result = await restartService(supabase, service, session.user.id)
        break
      case 'update_config':
        result = await updateSystemConfig(supabase, config, session.user.id)
        break
      case 'clear_cache':
        result = await clearSystemCache(supabase, session.user.id)
        break
      case 'run_maintenance':
        result = await runMaintenanceTask(supabase, body.task, session.user.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log admin system action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: `system_${action}`,
      target_type: 'system',
      target_id: service,
      action_details: { action, service, config },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: result,
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin system POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function getSystemOverview(supabase: any) {
  const [healthMetrics, performanceMetrics, databaseStatus] = await Promise.all([
    getSystemHealth(supabase),
    getPerformanceMetrics(supabase),
    getDatabaseStatus(supabase)
  ])

  return {
    overview: {
      systemUptime: 99.95,
      totalRequests: 1247832,
      avgResponseTime: 145,
      errorRate: 0.02,
      activeConnections: 1247
    },
    services: healthMetrics.services,
    performance: {
      cpuUsage: performanceMetrics.cpuUsage,
      memoryUsage: performanceMetrics.memoryUsage,
      diskUsage: performanceMetrics.diskUsage
    },
    database: {
      status: databaseStatus.status,
      connections: databaseStatus.activeConnections,
      queryTime: databaseStatus.avgQueryTime
    },
    recentEvents: [
      {
        id: '1',
        type: 'info',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        service: 'backup'
      },
      {
        id: '2',
        type: 'warning',
        message: 'High memory usage detected on web-server-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        service: 'web-server'
      }
    ]
  }
}

async function getSystemHealth(supabase: any) {
  // Test database connectivity
  const dbStart = Date.now()
  let dbStatus = 'healthy'
  let dbResponseTime = 0
  
  try {
    await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1)
    dbResponseTime = Date.now() - dbStart
    if (dbResponseTime > 1000) dbStatus = 'warning'
    if (dbResponseTime > 3000) dbStatus = 'error'
  } catch (error) {
    dbStatus = 'error'
    dbResponseTime = Date.now() - dbStart
  }

  // Mock other service health checks - would integrate with real monitoring
  return {
    services: {
      database: {
        name: 'Database',
        status: dbStatus,
        responseTime: dbResponseTime,
        uptime: 99.95,
        lastCheck: new Date().toISOString()
      },
      api: {
        name: 'API Gateway',
        status: 'healthy',
        responseTime: 85,
        uptime: 99.98,
        lastCheck: new Date().toISOString()
      },
      email: {
        name: 'Email Service',
        status: 'healthy',
        responseTime: 120,
        uptime: 99.92,
        lastCheck: new Date().toISOString()
      },
      storage: {
        name: 'File Storage',
        status: 'healthy',
        responseTime: 95,
        uptime: 99.99,
        lastCheck: new Date().toISOString()
      },
      cache: {
        name: 'Redis Cache',
        status: 'healthy',
        responseTime: 15,
        uptime: 99.97,
        lastCheck: new Date().toISOString()
      }
    },
    overall: {
      status: dbStatus === 'error' ? 'warning' : 'healthy',
      uptime: 99.95,
      lastUpdated: new Date().toISOString()
    }
  }
}

async function getPerformanceMetrics(supabase: any) {
  // In a real implementation, these would come from system monitoring tools
  const now = new Date()
  const timeSeriesData = []
  
  // Generate mock time series data for the last 24 hours
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    timeSeriesData.push({
      timestamp: time.toISOString(),
      cpuUsage: Math.random() * 40 + 30, // 30-70%
      memoryUsage: Math.random() * 30 + 50, // 50-80%
      diskUsage: Math.random() * 10 + 20, // 20-30%
      networkIO: Math.random() * 1000 + 500, // 500-1500 MB/s
      activeConnections: Math.floor(Math.random() * 500 + 800), // 800-1300
      requestsPerSecond: Math.floor(Math.random() * 100 + 50) // 50-150 req/s
    })
  }

  const current = timeSeriesData[timeSeriesData.length - 1]

  return {
    current: {
      cpuUsage: current.cpuUsage,
      memoryUsage: current.memoryUsage,
      diskUsage: current.diskUsage,
      networkIO: current.networkIO,
      activeConnections: current.activeConnections,
      requestsPerSecond: current.requestsPerSecond
    },
    timeSeries: timeSeriesData,
    thresholds: {
      cpu: { warning: 70, critical: 85 },
      memory: { warning: 80, critical: 90 },
      disk: { warning: 80, critical: 95 },
      connections: { warning: 1000, critical: 1500 }
    }
  }
}

async function getDatabaseStatus(supabase: any) {
  try {
    // Get database statistics
    const statsStart = Date.now()
    
    // Test query performance
    await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1)
    const queryTime = Date.now() - statsStart

    // Get table sizes (would normally use pg_stat_user_tables)
    const { data: userCount } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })

    const { data: orgCount } = await supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true })

    return {
      status: 'healthy',
      avgQueryTime: queryTime,
      activeConnections: 15, // Would get from pg_stat_activity
      maxConnections: 100,
      cacheHitRatio: 0.95,
      tables: {
        users: {
          name: 'users',
          rowCount: userCount || 0,
          size: '2.5 MB', // Would calculate from pg_relation_size
          lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
        },
        organizations: {
          name: 'organizations', 
          rowCount: orgCount || 0,
          size: '512 KB',
          lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
        }
      },
      recentQueries: [
        {
          query: 'SELECT * FROM users WHERE id = $1',
          avgTime: 2.5,
          calls: 15420,
          totalTime: 38550
        },
        {
          query: 'SELECT * FROM organizations WHERE id = $1',
          avgTime: 1.8,
          calls: 8932,
          totalTime: 16077
        }
      ]
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      avgQueryTime: 0,
      activeConnections: 0,
      maxConnections: 100
    }
  }
}

async function getAPIStatus(supabase: any) {
  // Mock API endpoint monitoring data
  return {
    endpoints: [
      {
        path: '/api/auth',
        method: 'POST',
        status: 'healthy',
        avgResponseTime: 145,
        requestCount: 15420,
        errorRate: 0.01,
        lastError: null
      },
      {
        path: '/api/users',
        method: 'GET',
        status: 'healthy',
        avgResponseTime: 89,
        requestCount: 28340,
        errorRate: 0.005,
        lastError: null
      },
      {
        path: '/api/organizations',
        method: 'GET',
        status: 'warning',
        avgResponseTime: 250,
        requestCount: 12450,
        errorRate: 0.02,
        lastError: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ],
    rateLimiting: {
      enabled: true,
      defaultLimit: 100,
      windowSize: 900, // 15 minutes in seconds
      currentRequests: 847,
      blockedRequests: 23
    },
    errors: [
      {
        id: '1',
        endpoint: '/api/organizations',
        method: 'GET',
        statusCode: 500,
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        count: 3
      },
      {
        id: '2',
        endpoint: '/api/auth',
        method: 'POST',
        statusCode: 429,
        message: 'Rate limit exceeded',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        count: 12
      }
    ]
  }
}

async function getSystemLogs(supabase: any, request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level') || 'all'
  const service = searchParams.get('service') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '100')

  // Mock system logs - would integrate with log aggregation system
  const mockLogs = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
      level: 'info',
      service: 'api-gateway',
      message: 'Request processed successfully',
      metadata: { endpoint: '/api/users', responseTime: 89, statusCode: 200 }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      level: 'warning',
      service: 'database',
      message: 'Slow query detected',
      metadata: { query: 'SELECT * FROM users...', duration: 1250 }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: 'error',
      service: 'email',
      message: 'Failed to send email notification',
      metadata: { recipient: 'user@example.com', error: 'SMTP timeout' }
    }
  ]

  const filteredLogs = mockLogs.filter(log => {
    if (level !== 'all' && log.level !== level) return false
    if (service !== 'all' && log.service !== service) return false
    return true
  })

  const startIndex = (page - 1) * limit
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit)

  return {
    logs: paginatedLogs,
    pagination: {
      page,
      limit,
      total: filteredLogs.length,
      totalPages: Math.ceil(filteredLogs.length / limit)
    },
    filters: {
      levels: ['info', 'warning', 'error'],
      services: ['api-gateway', 'database', 'email', 'auth', 'storage']
    }
  }
}

async function restartService(supabase: any, service: string, adminId: string) {
  // Mock service restart - would integrate with container orchestration
  return {
    service,
    action: 'restart',
    status: 'initiated',
    message: `Service ${service} restart initiated`,
    estimatedTime: '30 seconds',
    restartId: `restart_${Date.now()}`
  }
}

async function updateSystemConfig(supabase: any, config: any, adminId: string) {
  // Mock config update - would update actual system configuration
  return {
    action: 'update_config',
    status: 'success',
    message: 'System configuration updated successfully',
    updatedFields: Object.keys(config),
    appliedAt: new Date().toISOString()
  }
}

async function clearSystemCache(supabase: any, adminId: string) {
  // Mock cache clear - would clear Redis/Memcached
  return {
    action: 'clear_cache',
    status: 'success',
    message: 'System cache cleared successfully',
    clearedAt: new Date().toISOString(),
    cacheSize: '2.3 GB'
  }
}

async function runMaintenanceTask(supabase: any, task: string, adminId: string) {
  // Mock maintenance task - would run actual maintenance operations
  return {
    task,
    action: 'run_maintenance',
    status: 'initiated',
    message: `Maintenance task ${task} initiated`,
    estimatedTime: '5 minutes',
    taskId: `maintenance_${Date.now()}`
  }
}