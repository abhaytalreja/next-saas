import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import '@testing-library/jest-dom'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn()
  },
  from: jest.fn(),
  rpc: jest.fn()
}

// Mock isUserSystemAdmin
jest.mock('@nextsaas/auth/middleware/admin-middleware', () => ({
  isUserSystemAdmin: jest.fn()
}))

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/system',
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): NextRequest => {
  const request = {
    url,
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    headers: new Map(Object.entries(headers || {})),
    ip: '127.0.0.1'
  } as unknown as NextRequest
  
  return request
}

// Mock console methods
const originalConsoleError = console.error
beforeEach(() => {
  console.error = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('/api/admin/system', () => {
  describe('GET method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 401 when no session exists', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('system overview', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return system overview by default', async () => {
        // Mock database queries for system overview
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ count: 0 }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('overview')
        expect(data.data).toHaveProperty('services')
        expect(data.data).toHaveProperty('performance')
        expect(data.data).toHaveProperty('database')
        expect(data.data).toHaveProperty('recentEvents')
        expect(data.data).toHaveProperty('timestamp')
        
        expect(data.data.overview).toMatchObject({
          systemUptime: 99.95,
          totalRequests: 1247832,
          avgResponseTime: 145,
          errorRate: 0.02,
          activeConnections: 1247
        })
      })

      it('should handle type parameter for overview', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ count: 0 }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=overview'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('overview')
      })
    })

    describe('system health', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return system health data', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ count: 0 }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=health'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('services')
        expect(data.data).toHaveProperty('overall')
        
        expect(data.data.services).toHaveProperty('database')
        expect(data.data.services).toHaveProperty('api')
        expect(data.data.services).toHaveProperty('email')
        expect(data.data.services).toHaveProperty('storage')
        expect(data.data.services).toHaveProperty('cache')
        
        expect(data.data.services.database).toMatchObject({
          name: 'Database',
          status: 'healthy',
          uptime: 99.95
        })
      })

      it('should handle database connectivity issues', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.reject(new Error('Connection timeout')))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=health'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.services.database.status).toBe('error')
        expect(data.data.overall.status).toBe('warning')
      })

      it('should measure database response time', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            limit: jest.fn(() => {
              // Simulate a delay
              return new Promise(resolve => {
                setTimeout(() => resolve({ count: 0 }), 100)
              })
            })
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=health'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.services.database.responseTime).toBeGreaterThan(50)
      })
    })

    describe('performance metrics', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return performance metrics', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=performance'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('current')
        expect(data.data).toHaveProperty('timeSeries')
        expect(data.data).toHaveProperty('thresholds')
        
        expect(data.data.current).toHaveProperty('cpuUsage')
        expect(data.data.current).toHaveProperty('memoryUsage')
        expect(data.data.current).toHaveProperty('diskUsage')
        expect(data.data.current).toHaveProperty('networkIO')
        expect(data.data.current).toHaveProperty('activeConnections')
        expect(data.data.current).toHaveProperty('requestsPerSecond')
        
        expect(data.data.timeSeries).toHaveLength(24) // 24 hours
        expect(data.data.thresholds).toHaveProperty('cpu')
        expect(data.data.thresholds).toHaveProperty('memory')
        expect(data.data.thresholds).toHaveProperty('disk')
        expect(data.data.thresholds).toHaveProperty('connections')
      })

      it('should generate valid time series data', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=performance'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        
        // Validate time series structure
        data.data.timeSeries.forEach(point => {
          expect(point).toHaveProperty('timestamp')
          expect(point).toHaveProperty('cpuUsage')
          expect(point).toHaveProperty('memoryUsage')
          expect(point).toHaveProperty('diskUsage')
          expect(point).toHaveProperty('networkIO')
          expect(point).toHaveProperty('activeConnections')
          expect(point).toHaveProperty('requestsPerSecond')
          
          expect(point.cpuUsage).toBeGreaterThanOrEqual(30)
          expect(point.cpuUsage).toBeLessThanOrEqual(70)
          expect(point.memoryUsage).toBeGreaterThanOrEqual(50)
          expect(point.memoryUsage).toBeLessThanOrEqual(80)
        })
      })
    })

    describe('database status', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return database status', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ count: 1000 }))
              }))
            }
          }
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ count: 150 }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=database'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('status', 'healthy')
        expect(data.data).toHaveProperty('avgQueryTime')
        expect(data.data).toHaveProperty('activeConnections')
        expect(data.data).toHaveProperty('maxConnections')
        expect(data.data).toHaveProperty('cacheHitRatio')
        expect(data.data).toHaveProperty('tables')
        expect(data.data).toHaveProperty('recentQueries')
        
        expect(data.data.tables).toHaveProperty('users')
        expect(data.data.tables).toHaveProperty('organizations')
        expect(data.data.tables.users.rowCount).toBe(1000)
        expect(data.data.tables.organizations.rowCount).toBe(150)
      })

      it('should handle database errors', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            limit: jest.fn(() => Promise.reject(new Error('Database error')))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=database'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.status).toBe('error')
        expect(data.data).toHaveProperty('error')
      })
    })

    describe('API status', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return API status', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=api'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('endpoints')
        expect(data.data).toHaveProperty('rateLimiting')
        expect(data.data).toHaveProperty('errors')
        
        expect(data.data.endpoints).toHaveLength(3)
        expect(data.data.endpoints[0]).toMatchObject({
          path: '/api/auth',
          method: 'POST',
          status: 'healthy',
          avgResponseTime: 145,
          requestCount: 15420,
          errorRate: 0.01
        })
        
        expect(data.data.rateLimiting).toMatchObject({
          enabled: true,
          defaultLimit: 100,
          windowSize: 900
        })
      })
    })

    describe('system logs', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return system logs with filtering', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=logs&level=error&service=database&page=1&limit=50'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('logs')
        expect(data.data).toHaveProperty('pagination')
        expect(data.data).toHaveProperty('filters')
        
        expect(data.data.pagination).toMatchObject({
          page: 1,
          limit: 50
        })
        
        expect(data.data.filters).toHaveProperty('levels')
        expect(data.data.filters).toHaveProperty('services')
        expect(data.data.filters.levels).toContain('error')
        expect(data.data.filters.services).toContain('database')
      })

      it('should handle log filtering', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system?type=logs&level=warning&service=email'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        // Should filter logs by level and service
        data.data.logs.forEach(log => {
          if (log.level !== 'all') {
            expect(log.level).toBe('warning')
          }
          if (log.service !== 'all') {
            expect(log.service).toBe('email')
          }
        })
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })
  })

  describe('POST method', () => {
    describe('authentication and authorization', () => {
      it('should return 401 when session error occurs', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error')
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'restart_service', service: 'api-gateway' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 when user is not admin', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'user-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'restart_service', service: 'api-gateway' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('system actions', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should restart service', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'restart_service', service: 'api-gateway' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          service: 'api-gateway',
          action: 'restart',
          status: 'initiated',
          message: 'Service api-gateway restart initiated',
          estimatedTime: '30 seconds'
        })
        expect(data.data).toHaveProperty('restartId')
      })

      it('should update system config', async () => {
        const config = {
          maxConnections: 1000,
          timeout: 30000,
          logLevel: 'info'
        }

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'update_config', config }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          action: 'update_config',
          status: 'success',
          message: 'System configuration updated successfully',
          updatedFields: ['maxConnections', 'timeout', 'logLevel']
        })
        expect(data.data).toHaveProperty('appliedAt')
      })

      it('should clear system cache', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'clear_cache' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          action: 'clear_cache',
          status: 'success',
          message: 'System cache cleared successfully',
          cacheSize: '2.3 GB'
        })
        expect(data.data).toHaveProperty('clearedAt')
      })

      it('should run maintenance task', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'run_maintenance', task: 'database_vacuum' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          task: 'database_vacuum',
          action: 'run_maintenance',
          status: 'initiated',
          message: 'Maintenance task database_vacuum initiated',
          estimatedTime: '5 minutes'
        })
        expect(data.data).toHaveProperty('taskId')
      })

      it('should return 400 for invalid action', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'invalid_action' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid action')
      })
    })

    describe('logging and audit', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should log admin system actions', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'restart_service', service: 'api-gateway' }
        )
        const response = await POST(request)

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'system_restart_service',
          target_type: 'system',
          target_id: 'api-gateway',
          action_details: {
            action: 'restart_service',
            service: 'api-gateway',
            config: undefined
          },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })

      it('should handle logging errors gracefully', async () => {
        mockSupabaseClient.rpc.mockRejectedValue(new Error('Logging failed'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'clear_cache' }
        )
        const response = await POST(request)
        const data = await response.json()

        // Should still succeed even if logging fails
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
      })

      it('should handle JSON parsing errors', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/system',
          method: 'POST',
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'restart_service', service: 'api-gateway' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })
    })

    describe('edge cases', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should handle null body', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/system',
          method: 'POST',
          json: jest.fn().mockResolvedValue(null),
          headers: new Map(),
          ip: '127.0.0.1'
        } as unknown as NextRequest

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid action')
      })

      it('should handle missing action parameters', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { service: 'api-gateway' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid action')
      })

      it('should handle empty config object', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'update_config', config: {} }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.updatedFields).toEqual([])
      })

      it('should handle missing task for maintenance', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/system',
          'POST',
          { action: 'run_maintenance' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.task).toBeUndefined()
      })
    })
  })
})