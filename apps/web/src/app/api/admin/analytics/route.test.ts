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

// Mock getSupabaseServerClient
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseServerClient: () => mockSupabaseClient
}))

// Mock NextRequest
const createMockRequest = (
  url: string = 'http://localhost:3000/api/admin/analytics',
  method: string = 'GET',
  headers?: Record<string, string>
): NextRequest => {
  const request = {
    url,
    method,
    headers: new Map(Object.entries(headers || {})),
    ip: '127.0.0.1',
    nextUrl: new URL(url)
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

describe('/api/admin/analytics', () => {
  describe('GET method', () => {
    describe('query parameters', () => {
      it('should handle default parameters', async () => {
        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        // Default should be both analytics and metrics for 30 days
        expect(data.data).toHaveProperty('analytics')
        expect(data.data).toHaveProperty('metrics')
      })

      it('should handle range parameter - 7d', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?range=7d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.analytics.userGrowth).toHaveLength(7)
        expect(data.data.analytics.revenueGrowth).toHaveLength(7)
        expect(data.data.analytics.organizationGrowth).toHaveLength(7)
        expect(data.data.analytics.engagementMetrics).toHaveLength(7)
      })

      it('should handle range parameter - 90d', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?range=90d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.analytics.userGrowth).toHaveLength(90)
      })

      it('should handle range parameter - 1y', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?range=1y'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.analytics.userGrowth).toHaveLength(365)
      })

      it('should handle invalid range parameter with default', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?range=invalid'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.analytics.userGrowth).toHaveLength(30) // Default to 30d
      })

      it('should handle type parameter - analytics only', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('analytics')
        expect(data.data).not.toHaveProperty('metrics')
      })

      it('should handle type parameter - metrics only', async () => {
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
                neq: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('metrics')
        expect(data.data).not.toHaveProperty('analytics')
      })

      it('should handle combined parameters', async () => {
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
                neq: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?range=7d&type=both'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data).toHaveProperty('analytics')
        expect(data.data).toHaveProperty('metrics')
        expect(data.data.analytics.userGrowth).toHaveLength(7)
      })
    })

    describe('analytics data generation', () => {
      it('should generate valid time series data', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics&range=7d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.analytics.userGrowth).toHaveLength(7)
        
        // Check data structure
        const userGrowthPoint = data.data.analytics.userGrowth[0]
        expect(userGrowthPoint).toHaveProperty('date')
        expect(userGrowthPoint).toHaveProperty('value')
        expect(userGrowthPoint).toHaveProperty('label')
        expect(typeof userGrowthPoint.value).toBe('number')
        expect(userGrowthPoint.value).toBeGreaterThanOrEqual(50)
        expect(userGrowthPoint.value).toBeLessThanOrEqual(200)

        // Check revenue growth has trending pattern
        const revenueGrowth = data.data.analytics.revenueGrowth
        expect(revenueGrowth).toHaveLength(7)
        expect(revenueGrowth[0].value).toBeLessThanOrEqual(revenueGrowth[revenueGrowth.length - 1].value)
      })

      it('should generate engagement metrics within valid range', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        const engagementMetrics = data.data.analytics.engagementMetrics
        
        engagementMetrics.forEach(point => {
          expect(point.value).toBeGreaterThanOrEqual(65)
          expect(point.value).toBeLessThanOrEqual(95)
        })
      })

      it('should generate chronological data points', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics&range=7d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        const userGrowth = data.data.analytics.userGrowth
        
        // Check that dates are in chronological order
        for (let i = 1; i < userGrowth.length; i++) {
          const prevDate = new Date(userGrowth[i - 1].date)
          const currDate = new Date(userGrowth[i].date)
          expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
        }
      })
    })

    describe('metrics data generation', () => {
      beforeEach(() => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 1000 })),
                gte: jest.fn(() => Promise.resolve({ count: 800 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ count: 150 })),
                gte: jest.fn(() => Promise.resolve({ count: 5 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })
      })

      it('should generate user metrics from database', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('totalUsers', 1000)
        expect(data.data.metrics).toHaveProperty('activeUsers', 800)
        expect(data.data.metrics).toHaveProperty('newUsersToday')
        expect(data.data.metrics).toHaveProperty('userGrowthRate')
        expect(data.data.metrics).toHaveProperty('userRetentionRate')
      })

      it('should generate organization metrics from database', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('totalOrganizations', 150)
        expect(data.data.metrics).toHaveProperty('activeOrganizations', 150)
        expect(data.data.metrics).toHaveProperty('newOrganizationsToday', 5)
        expect(data.data.metrics).toHaveProperty('organizationGrowthRate')
      })

      it('should generate mock revenue metrics', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('monthlyRecurringRevenue')
        expect(data.data.metrics).toHaveProperty('totalRevenue')
        expect(data.data.metrics).toHaveProperty('averageRevenuePerUser')
        expect(data.data.metrics).toHaveProperty('revenueGrowthRate')
        expect(data.data.metrics).toHaveProperty('churnRate')
        
        expect(typeof data.data.metrics.monthlyRecurringRevenue).toBe('number')
        expect(data.data.metrics.monthlyRecurringRevenue).toBeGreaterThan(0)
      })

      it('should generate system metrics', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('systemUptime', 99.9)
        expect(data.data.metrics).toHaveProperty('apiResponseTime')
        expect(data.data.metrics).toHaveProperty('errorRate')
        expect(data.data.metrics).toHaveProperty('activeConnections')
        
        expect(data.data.metrics.apiResponseTime).toBeGreaterThan(0)
        expect(data.data.metrics.errorRate).toBeGreaterThanOrEqual(0)
        expect(data.data.metrics.activeConnections).toBeGreaterThan(0)
      })

      it('should generate email metrics', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('emailsSentToday')
        expect(data.data.metrics).toHaveProperty('emailDeliveryRate')
        expect(data.data.metrics).toHaveProperty('campaignsActive')
        expect(data.data.metrics).toHaveProperty('subscriberCount')
        
        expect(data.data.metrics.emailsSentToday).toBeGreaterThan(0)
        expect(data.data.metrics.emailDeliveryRate).toBeGreaterThan(90)
        expect(data.data.metrics.campaignsActive).toBeGreaterThan(0)
        expect(data.data.metrics.subscriberCount).toBeGreaterThan(0)
      })

      it('should generate recent activity', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.metrics).toHaveProperty('recentActivity')
        expect(Array.isArray(data.data.metrics.recentActivity)).toBe(true)
        expect(data.data.metrics.recentActivity).toHaveLength(3)
        
        const activity = data.data.metrics.recentActivity[0]
        expect(activity).toHaveProperty('id')
        expect(activity).toHaveProperty('description')
        expect(activity).toHaveProperty('timestamp')
        expect(activity).toHaveProperty('type')
      })
    })

    describe('database error handling', () => {
      it('should handle user metrics database errors', async () => {
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
                neq: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        // Should return mock data when database fails
        expect(data.data.metrics).toHaveProperty('totalUsers')
        expect(typeof data.data.metrics.totalUsers).toBe('number')
        expect(data.data.metrics.totalUsers).toBeGreaterThan(0)
      })

      it('should handle organization metrics database errors', async () => {
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
                neq: jest.fn(() => Promise.reject(new Error('Database error'))),
                gte: jest.fn(() => Promise.reject(new Error('Database error')))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        // Should return mock data when database fails
        expect(data.data.metrics).toHaveProperty('totalOrganizations')
        expect(typeof data.data.metrics.totalOrganizations).toBe('number')
        expect(data.data.metrics.totalOrganizations).toBeGreaterThan(0)
      })
    })

    describe('data consistency and validation', () => {
      beforeEach(() => {
        mockSupabaseClient.from.mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              select: jest.fn(() => ({
                is: jest.fn(() => Promise.resolve({ count: 1000 })),
                gte: jest.fn(() => Promise.resolve({ count: 800 }))
              }))
            }
          }
          
          if (table === 'organizations') {
            return {
              select: jest.fn(() => ({
                neq: jest.fn(() => Promise.resolve({ count: 150 })),
                gte: jest.fn(() => Promise.resolve({ count: 5 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })
      })

      it('should return consistent data structure', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=both&range=30d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data).toHaveProperty('success', true)
        expect(data).toHaveProperty('data')
        expect(data.data).toHaveProperty('analytics')
        expect(data.data).toHaveProperty('metrics')
        
        // Analytics structure
        expect(data.data.analytics).toHaveProperty('userGrowth')
        expect(data.data.analytics).toHaveProperty('revenueGrowth')
        expect(data.data.analytics).toHaveProperty('organizationGrowth')
        expect(data.data.analytics).toHaveProperty('engagementMetrics')
        
        // Metrics structure
        expect(data.data.metrics).toHaveProperty('totalUsers')
        expect(data.data.metrics).toHaveProperty('totalOrganizations')
        expect(data.data.metrics).toHaveProperty('monthlyRecurringRevenue')
        expect(data.data.metrics).toHaveProperty('recentActivity')
      })

      it('should validate time series data points', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics&range=7d'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        
        // Validate all time series have correct length
        expect(data.data.analytics.userGrowth).toHaveLength(7)
        expect(data.data.analytics.revenueGrowth).toHaveLength(7)
        expect(data.data.analytics.organizationGrowth).toHaveLength(7)
        expect(data.data.analytics.engagementMetrics).toHaveLength(7)
        
        // Validate data point structure
        data.data.analytics.userGrowth.forEach(point => {
          expect(point).toHaveProperty('date')
          expect(point).toHaveProperty('value')
          expect(point).toHaveProperty('label')
          expect(typeof point.value).toBe('number')
          expect(new Date(point.date).toString()).not.toBe('Invalid Date')
        })
      })

      it('should have valid metric ranges', async () => {
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        const metrics = data.data.metrics
        
        // User metrics validation
        expect(metrics.totalUsers).toBeGreaterThanOrEqual(0)
        expect(metrics.activeUsers).toBeGreaterThanOrEqual(0)
        expect(metrics.activeUsers).toBeLessThanOrEqual(metrics.totalUsers)
        expect(metrics.userRetentionRate).toBeGreaterThanOrEqual(0)
        expect(metrics.userRetentionRate).toBeLessThanOrEqual(100)
        
        // Revenue metrics validation
        expect(metrics.monthlyRecurringRevenue).toBeGreaterThan(0)
        expect(metrics.totalRevenue).toBeGreaterThan(0)
        expect(metrics.averageRevenuePerUser).toBeGreaterThan(0)
        expect(metrics.churnRate).toBeGreaterThanOrEqual(0)
        expect(metrics.churnRate).toBeLessThan(100)
        
        // System metrics validation
        expect(metrics.systemUptime).toBe(99.9)
        expect(metrics.apiResponseTime).toBeGreaterThan(0)
        expect(metrics.errorRate).toBeGreaterThanOrEqual(0)
        expect(metrics.activeConnections).toBeGreaterThan(0)
        
        // Email metrics validation
        expect(metrics.emailDeliveryRate).toBeGreaterThan(90)
        expect(metrics.emailDeliveryRate).toBeLessThanOrEqual(100)
      })
    })

    describe('performance and edge cases', () => {
      it('should handle large date ranges efficiently', async () => {
        const startTime = Date.now()
        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=analytics&range=1y'
        )
        const response = await GET(request)
        const endTime = Date.now()

        expect(response.status).toBe(200)
        expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
      })

      it('should handle null database responses', async () => {
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
                neq: jest.fn(() => Promise.resolve({ count: null })),
                gte: jest.fn(() => Promise.resolve({ count: null }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const request = createMockRequest(
          'http://localhost:3000/api/admin/analytics?type=metrics'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.metrics.totalUsers).toBeGreaterThanOrEqual(0)
        expect(data.data.metrics.totalOrganizations).toBeGreaterThanOrEqual(0)
      })

      it('should handle concurrent requests', async () => {
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
                neq: jest.fn(() => Promise.resolve({ count: 25 })),
                gte: jest.fn(() => Promise.resolve({ count: 3 }))
              }))
            }
          }
          
          return { select: jest.fn() }
        })

        const requests = [
          createMockRequest('http://localhost:3000/api/admin/analytics?type=metrics'),
          createMockRequest('http://localhost:3000/api/admin/analytics?type=analytics'),
          createMockRequest('http://localhost:3000/api/admin/analytics?type=both')
        ]

        const responses = await Promise.all(requests.map(request => GET(request)))
        
        responses.forEach(async (response) => {
          expect(response.status).toBe(200)
          const data = await response.json()
          expect(data.success).toBe(true)
        })
      })
    })

    describe('error handling', () => {
      it('should handle unexpected errors', async () => {
        mockSupabaseClient.from.mockImplementation(() => {
          throw new Error('Unexpected error')
        })

        const request = createMockRequest()
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.success).toBe(false)
        expect(data.error).toBe('Failed to fetch analytics data')
      })

      it('should handle invalid URL parsing', async () => {
        const request = {
          url: 'invalid-url',
          method: 'GET',
          headers: new Map(),
          ip: '127.0.0.1',
          nextUrl: { searchParams: new URLSearchParams() }
        } as unknown as NextRequest

        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        // Should use default parameters
      })
    })
  })
})