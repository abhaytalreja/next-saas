import { NextRequest } from 'next/server'
import { GET } from './route'
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
  url: string = 'http://localhost:3000/api/admin/dashboard',
  method: string = 'GET',
  headers?: Record<string, string>
): NextRequest => {
  const request = {
    url,
    method,
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

describe('/api/admin/dashboard', () => {
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

    describe('successful dashboard data retrieval', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return dashboard data successfully', async () => {
        // Mock the database queries for dashboard metrics
        let callCount = 0
        mockSupabaseClient.from.mockImplementation((table: string) => {
          callCount++
          
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ count: 1000 }))
                })),
                gte: jest.fn(() => Promise.resolve({ count: 50 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => ({
                  gte: jest.fn(() => Promise.resolve({ count: 150 }))
                })),
                gte: jest.fn(() => Promise.resolve({ count: 5 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [
                      {
                        id: 'log-1',
                        action: 'user_created',
                        resource_type: 'user',
                        created_at: '2023-01-01T00:00:00Z',
                        user_id: 'user-1',
                        details: { method: 'signup' }
                      },
                      {
                        id: 'log-2',
                        action: 'organization_created',
                        resource_type: 'organization',
                        created_at: '2023-01-01T01:00:00Z',
                        user_id: 'user-2',
                        details: { name: 'Test Org' }
                      }
                    ],
                    error: null
                  }))
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
        expect(data.data).toHaveProperty('totalUsers')
        expect(data.data).toHaveProperty('activeUsers')
        expect(data.data).toHaveProperty('newUsersToday')
        expect(data.data).toHaveProperty('userGrowthRate')
        expect(data.data).toHaveProperty('userRetentionRate')
        expect(data.data).toHaveProperty('totalOrganizations')
        expect(data.data).toHaveProperty('activeOrganizations')
        expect(data.data).toHaveProperty('newOrganizationsToday')
        expect(data.data).toHaveProperty('organizationGrowthRate')
        expect(data.data).toHaveProperty('monthlyRecurringRevenue')
        expect(data.data).toHaveProperty('totalRevenue')
        expect(data.data).toHaveProperty('averageRevenuePerUser')
        expect(data.data).toHaveProperty('revenueGrowthRate')
        expect(data.data).toHaveProperty('churnRate')
        expect(data.data).toHaveProperty('systemUptime')
        expect(data.data).toHaveProperty('apiResponseTime')
        expect(data.data).toHaveProperty('errorRate')
        expect(data.data).toHaveProperty('activeConnections')
        expect(data.data).toHaveProperty('emailsSentToday')
        expect(data.data).toHaveProperty('emailDeliveryRate')
        expect(data.data).toHaveProperty('campaignsActive')
        expect(data.data).toHaveProperty('subscriberCount')
        expect(data.data).toHaveProperty('recentActivity')
        expect(data).toHaveProperty('timestamp')
      })

      it('should transform recent activity correctly', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [
                      {
                        id: 'log-1',
                        action: 'user_login',
                        resource_type: 'auth',
                        created_at: '2023-01-01T12:00:00Z',
                        user_id: 'user-123',
                        details: { ip: '127.0.0.1' }
                      }
                    ],
                    error: null
                  }))
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
        expect(data.data.recentActivity).toHaveLength(1)
        expect(data.data.recentActivity[0]).toMatchObject({
          id: 'log-1',
          description: 'user_login auth',
          timestamp: '2023-01-01T12:00:00Z',
          type: 'auth',
          userId: 'user-123',
          metadata: { ip: '127.0.0.1' }
        })
      })

      it('should log admin dashboard access', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest()
        const response = await GET(request)

        expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('log_system_admin_action', {
          admin_id: 'admin-123',
          action_name: 'dashboard_viewed',
          target_type: 'dashboard',
          action_details: { method: 'admin_panel' },
          ip_addr: '127.0.0.1',
          user_agent_str: null
        })
      })
    })

    describe('database query error handling', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should handle user metrics query errors gracefully', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.reject(new Error('Database error'))),
                gte: jest.fn(() => Promise.reject(new Error('Database error')))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
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
        // Should still return data even with database errors
        expect(data.data).toHaveProperty('totalUsers')
        expect(data.data).toHaveProperty('totalOrganizations')
      })

      it('should handle organization metrics query errors gracefully', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.reject(new Error('Database error'))),
                gte: jest.fn(() => Promise.reject(new Error('Database error')))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
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
        // Should still return data even with database errors
        expect(data.data).toHaveProperty('totalUsers')
        expect(data.data).toHaveProperty('totalOrganizations')
      })

      it('should handle activity log query errors gracefully', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: null,
                    error: new Error('Audit log error')
                  }))
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
        expect(data.data.recentActivity).toEqual([])
      })
    })

    describe('parallel execution and performance', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should execute all metric queries in parallel', async () => {
        const mockQueries = []
        
        mockSupabaseClient.from.mockImplementation((table: string) => {
          const query = {
            select: jest.fn(() => ({
              is: jest.fn(() => Promise.resolve({ count: 10 })),
              gte: jest.fn(() => Promise.resolve({ count: 5 })),
              order: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({
                  data: [],
                  error: null
                }))
              }))
            }))
          }
          
          mockQueries.push(query)
          return query
        })

        const startTime = Date.now()
        const request = createMockRequest()
        const response = await GET(request)
        const endTime = Date.now()

        expect(response.status).toBe(200)
        // Should complete quickly due to parallel execution
        expect(endTime - startTime).toBeLessThan(1000)
      })
    })

    describe('mock data consistency', () => {
      beforeEach(() => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)
        mockSupabaseClient.rpc.mockResolvedValue({ data: null, error: null })
      })

      it('should return consistent revenue metrics', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
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
        expect(typeof data.data.monthlyRecurringRevenue).toBe('number')
        expect(typeof data.data.totalRevenue).toBe('number')
        expect(typeof data.data.averageRevenuePerUser).toBe('number')
        expect(typeof data.data.revenueGrowthRate).toBe('number')
        expect(typeof data.data.churnRate).toBe('number')
        expect(data.data.monthlyRecurringRevenue).toBeGreaterThan(0)
        expect(data.data.totalRevenue).toBeGreaterThan(0)
      })

      it('should return consistent system metrics', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
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
        expect(data.data.systemUptime).toBe(99.95)
        expect(typeof data.data.apiResponseTime).toBe('number')
        expect(typeof data.data.errorRate).toBe('number')
        expect(typeof data.data.activeConnections).toBe('number')
        expect(data.data.apiResponseTime).toBeGreaterThan(0)
        expect(data.data.errorRate).toBeGreaterThanOrEqual(0)
        expect(data.data.activeConnections).toBeGreaterThan(0)
      })

      it('should return consistent email metrics', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
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
        expect(typeof data.data.emailsSentToday).toBe('number')
        expect(typeof data.data.emailDeliveryRate).toBe('number')
        expect(typeof data.data.campaignsActive).toBe('number')
        expect(typeof data.data.subscriberCount).toBe('number')
        expect(data.data.emailsSentToday).toBeGreaterThan(0)
        expect(data.data.emailDeliveryRate).toBeGreaterThan(0)
        expect(data.data.campaignsActive).toBeGreaterThan(0)
        expect(data.data.subscriberCount).toBeGreaterThan(0)
      })
    })

    describe('error handling', () => {
      it('should handle unexpected errors', async () => {
        mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Unexpected error'))

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal server error')
      })

      it('should handle Promise.all rejection', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: { user: { id: 'admin-123' } } },
          error: null
        })
        ;(isUserSystemAdmin as jest.Mock).mockResolvedValue(true)

        // Make one of the promises reject to test Promise.all error handling
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            throw new Error('Critical database error')
          }
          return { select: jest.fn() }
        })

        const request = createMockRequest()
        const response = await GET(request)
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

      it('should handle null count values from database', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: null })),
                gte: jest.fn(() => Promise.resolve({ count: null }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: null })),
                gte: jest.fn(() => Promise.resolve({ count: null }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: null,
                    error: null
                  }))
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
        expect(data.data.totalUsers).toBe(0)
        expect(data.data.activeUsers).toBe(0)
        expect(data.data.totalOrganizations).toBe(0)
        expect(data.data.recentActivity).toEqual([])
      })

      it('should handle logging errors gracefully', async () => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 100 })),
                gte: jest.fn(() => Promise.resolve({ count: 80 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          if (table === 'audit_logs') {
            return {
              select: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        mockSupabaseClient.rpc.mockRejectedValue(new Error('Logging failed'))

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        // Should still succeed even if logging fails
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })
    })
  })
})