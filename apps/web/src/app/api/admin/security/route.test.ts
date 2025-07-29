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
  url: string = 'http://localhost:3000/api/admin/security',
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

describe('/api/admin/security', () => {
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

    describe('security overview', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return security overview by default', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ count: 47 }))
                }))
              }))
            }
          }
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                gte: jest.fn(() => ({
                  is: jest.fn(() => Promise.resolve({ count: 142 }))
                }))
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
        expect(data.data).toHaveProperty('metrics')
        expect(data.data).toHaveProperty('recentAlerts')
        expect(data.data).toHaveProperty('systemHealth')
        expect(data.data).toHaveProperty('timestamp')
        
        expect(data.data.metrics).toMatchObject({
          activeThreats: 3,
          failedLogins: 47,
          activeSessions: 142,
          securityScore: 94
        })
      })

      it('should handle type parameter for overview', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ count: 25 }))
                }))
              }))
            }
          }
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                gte: jest.fn(() => ({
                  is: jest.fn(() => Promise.resolve({ count: 100 }))
                }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=overview'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.metrics.failedLogins).toBe(25)
        expect(data.data.metrics.activeSessions).toBe(100)
      })
    })

    describe('security alerts', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return security alerts', async () => {
        const mockFailedLogins = [
          {
            id: 'log-1',
            created_at: '2023-01-01T00:00:00Z',
            details: { email: 'user@example.com' },
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            user_id: 'user-1'
          }
        ]

        const mockSuspiciousActivities = [
          {
            id: 'log-2',
            action: 'admin_access',
            created_at: '2023-01-01T01:00:00Z',
            details: { resource: 'users' },
            ip_address: '192.168.1.1',
            user_agent: 'Chrome/95.0',
            user_id: 'admin-1'
          }
        ]

        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'audit_logs') {
            let callCount = 0
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    order: jest.fn(() => ({
                      limit: jest.fn(() => {
                        callCount++
                        if (callCount === 1) {
                          return Promise.resolve({
                            data: mockFailedLogins,
                            error: null
                          })
                        } else {
                          return Promise.resolve({
                            data: mockSuspiciousActivities,
                            error: null
                          })
                        }
                      })
                    }))
                  }))
                })),
                in: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    order: jest.fn(() => ({
                      limit: jest.fn(() => Promise.resolve({
                        data: mockSuspiciousActivities,
                        error: null
                      }))
                    }))
                  }))
                }))
              }))
            }
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=alerts'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('alerts')
        expect(data.data).toHaveProperty('summary')
        
        expect(data.data.alerts).toHaveLength(2)
        expect(data.data.alerts[0]).toMatchObject({
          id: 'failed_login_log-1',
          type: 'high',
          category: 'authentication',
          title: 'Failed Login Attempt',
          resolved: false
        })
        
        expect(data.data.summary).toHaveProperty('total', 2)
        expect(data.data.summary).toHaveProperty('high', 1)
        expect(data.data.summary).toHaveProperty('medium', 1)
      })

      it('should handle empty alerts gracefully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            })),
            in: jest.fn(() => ({
              gte: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=alerts'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.alerts).toHaveLength(0)
        expect(data.data.summary.total).toBe(0)
      })
    })

    describe('threat intelligence', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return threat intelligence data', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=threats'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('threats')
        expect(data.data).toHaveProperty('metrics')
        
        expect(data.data.threats).toHaveLength(1)
        expect(data.data.threats[0]).toMatchObject({
          id: '1',
          type: 'ip_reputation',
          severity: 'critical',
          title: 'Known Malicious IP Address',
          status: 'active'
        })
        
        expect(data.data.metrics).toMatchObject({
          totalThreats: 23,
          activeThreats: 8,
          mitigatedThreats: 15,
          avgResponseTime: 45
        })
      })
    })

    describe('active sessions', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return active sessions', async () => {
        const mockActiveSessions = [
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User One',
            last_seen_at: '2023-01-01T12:00:00Z',
            created_at: '2023-01-01T10:00:00Z'
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            name: 'User Two',
            last_seen_at: '2023-01-01T11:30:00Z',
            created_at: '2023-01-01T09:00:00Z'
          }
        ]

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              is: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: mockActiveSessions,
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=sessions'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('sessions')
        expect(data.data).toHaveProperty('summary')
        
        expect(data.data.sessions).toHaveLength(2)
        expect(data.data.sessions[0]).toMatchObject({
          id: 'session_user-1',
          userId: 'user-1',
          userEmail: 'user1@example.com',
          userName: 'User One',
          ipAddress: '192.168.1.100',
          lastActivity: '2023-01-01T12:00:00Z'
        })
        
        expect(data.data.summary.total).toBe(2)
        expect(data.data.summary.activeInLastHour).toBe(2)
      })

      it('should handle empty sessions', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              is: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=sessions'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.sessions).toHaveLength(0)
        expect(data.data.summary.total).toBe(0)
      })
    })

    describe('audit logs', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return audit logs with pagination', async () => {
        const mockAuditLogs = [
          {
            id: 'log-1',
            user_id: 'user-1',
            action: 'user_login',
            resource_type: 'auth',
            resource_id: 'session-1',
            details: { ip: '127.0.0.1' },
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            created_at: '2023-01-01T12:00:00Z'
          }
        ]

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => Promise.resolve({
                data: mockAuditLogs,
                count: 1,
                error: null
              }))
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=audit&page=1&limit=50'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('logs')
        expect(data.data).toHaveProperty('pagination')
        
        expect(data.data.logs).toHaveLength(1)
        expect(data.data.logs[0]).toMatchObject({
          id: 'log-1',
          user_id: 'user-1',
          action: 'user_login',
          resource_type: 'auth'
        })
        
        expect(data.data.pagination).toMatchObject({
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1
        })
      })

      it('should handle pagination parameters', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn((start, end) => {
                expect(start).toBe(50) // (page 2 - 1) * limit 25
                expect(end).toBe(74)   // start + limit - 1
                return Promise.resolve({
                  data: [],
                  count: 100,
                  error: null
                })
              })
            }))
          }))
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security?type=audit&page=3&limit=25'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.pagination.page).toBe(3)
        expect(data.data.pagination.limit).toBe(25)
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

      it('should handle database errors gracefully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => Promise.reject(new Error('Database error')))
            }))
          }))
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        // Should return mock data despite database errors
        expect(data.data).toHaveProperty('metrics')
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
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1' }
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
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('security actions', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: 'log-id-123', error: null })
      })

      it('should resolve security alert', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1', resolution: 'False positive' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          alertId: 'alert-1',
          resolved: true,
          resolvedBy: 'admin-123',
          resolution: 'False positive'
        })
        expect(data.data).toHaveProperty('resolvedAt')
        expect(data.data).toHaveProperty('auditId')
      })

      it('should mitigate threat', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'mitigate_threat', threatId: 'threat-1', resolution: 'IP blocked' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          threatId: 'threat-1',
          status: 'mitigated',
          mitigatedBy: 'admin-123',
          mitigation: 'IP blocked'
        })
        expect(data.data).toHaveProperty('mitigatedAt')
        expect(data.data).toHaveProperty('auditId')
      })

      it('should terminate user session', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'terminate_session', sessionId: 'session_user-123' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toMatchObject({
          sessionId: 'session_user-123',
          userId: 'user-123',
          terminated: true,
          terminatedBy: 'admin-123'
        })
        expect(data.data).toHaveProperty('terminatedAt')
        expect(data.data).toHaveProperty('auditId')
      })

      it('should return 400 for invalid action', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
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
        mockSupabaseClient.rpc.mockResolvedValue({ data: 'log-id-123', error: null })
      })

      it('should log admin security actions', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1', resolution: 'Resolved' }
        )
        const response = await POST(request)

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'security_resolve_alert',
          target_type: 'security',
          target_id: 'alert-1',
          action_details: { action: 'resolve_alert', resolution: 'Resolved' },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })

      it('should handle logging errors gracefully', async () => {
        mockSupabaseClient.rpc
          .mockResolvedValueOnce({ data: 'log-id-123', error: null }) // First call for action function
          .mockRejectedValueOnce(new Error('Logging failed')) // Second call for admin action logging

        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1', resolution: 'Resolved' }
        )
        const response = await POST(request)
        const data = await response.json()

        // Should still succeed even if admin action logging fails
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
          url: 'http://localhost:3000/api/admin/security',
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
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'resolve_alert', alertId: 'alert-1' }
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
        mockSupabaseClient.rpc.mockResolvedValue({ data: 'log-id-123', error: null })
      })

      it('should handle null body', async () => {
        const request = {
          url: 'http://localhost:3000/api/admin/security',
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
          'http://localhost:3000/api/admin/security',
          'POST',
          { resolution: 'Resolved' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Invalid action')
      })

      it('should handle session termination with malformed session ID', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/security',
          'POST',
          { action: 'terminate_session', sessionId: 'malformed_id' }
        )
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.userId).toBe('malformed_id') // Should handle gracefully
      })
    })
  })
})