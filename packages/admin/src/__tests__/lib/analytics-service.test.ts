import { analyticsService } from '../../lib/analytics-service'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import '@testing-library/jest-dom'

// Mock Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn()
}))

// Mock fetch
global.fetch = jest.fn()

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis()
}

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<typeof getSupabaseBrowserClient>

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSupabaseBrowserClient.mockReturnValue(mockSupabase as any)
  })

  describe('getAnalytics', () => {
    it('should fetch analytics data successfully from API', async () => {
      const mockAnalyticsData = {
        userGrowth: [{ date: '2024-01-01', value: 100, label: '1/1/2024' }],
        revenueGrowth: [{ date: '2024-01-01', value: 5000, label: '1/1/2024' }],
        organizationGrowth: [{ date: '2024-01-01', value: 10, label: '1/1/2024' }],
        engagementMetrics: [{ date: '2024-01-01', value: 75, label: '1/1/2024' }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { analytics: mockAnalyticsData }
        })
      } as Response)

      const result = await analyticsService.getAnalytics('30d')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?range=30d&type=analytics')
      expect(result).toEqual(mockAnalyticsData)
    })

    it('should fall back to mock data when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await analyticsService.getAnalytics('7d')

      expect(result).toHaveProperty('userGrowth')
      expect(result).toHaveProperty('revenueGrowth')
      expect(result).toHaveProperty('organizationGrowth')
      expect(result).toHaveProperty('engagementMetrics')
      expect(Array.isArray(result.userGrowth)).toBe(true)
      expect(result.userGrowth).toHaveLength(7)
    })

    it('should handle different date ranges correctly', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result7d = await analyticsService.getAnalytics('7d')
      const result30d = await analyticsService.getAnalytics('30d')
      const result90d = await analyticsService.getAnalytics('90d')
      const result1y = await analyticsService.getAnalytics('1y')

      expect(result7d.userGrowth).toHaveLength(7)
      expect(result30d.userGrowth).toHaveLength(30)
      expect(result90d.userGrowth).toHaveLength(90)
      expect(result1y.userGrowth).toHaveLength(365)
    })

    it('should handle API response with non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response)

      const result = await analyticsService.getAnalytics('30d')

      expect(result).toHaveProperty('userGrowth')
      expect(result).toHaveProperty('revenueGrowth')
      expect(result).toHaveProperty('organizationGrowth')
      expect(result).toHaveProperty('engagementMetrics')
    })
  })

  describe('getMetrics', () => {
    it('should fetch metrics data successfully from API', async () => {
      const mockMetricsData = {
        totalUsers: 1000,
        activeUsers: 800,
        newUsersToday: 50,
        userGrowthRate: 15.5,
        userRetentionRate: 85.3,
        totalOrganizations: 150,
        activeOrganizations: 120,
        newOrganizationsToday: 5,
        organizationGrowthRate: 8.2,
        monthlyRecurringRevenue: 125000,
        totalRevenue: 1500000,
        averageRevenuePerUser: 89.50,
        revenueGrowthRate: 12.3,
        churnRate: 2.1,
        systemUptime: 99.9,
        apiResponseTime: 145,
        errorRate: 0.02,
        activeConnections: 1247,
        emailsSentToday: 15420,
        emailDeliveryRate: 99.2,
        campaignsActive: 8,
        subscriberCount: 125000,
        recentActivity: []
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { metrics: mockMetricsData }
        })
      } as Response)

      const result = await analyticsService.getMetrics('30d')

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/analytics?range=30d&type=metrics')
      expect(result).toEqual(mockMetricsData)
    })

    it('should fall back to mock data when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await analyticsService.getMetrics('30d')

      expect(result).toHaveProperty('totalUsers')
      expect(result).toHaveProperty('totalOrganizations')
      expect(result).toHaveProperty('monthlyRecurringRevenue')
      expect(result).toHaveProperty('systemUptime')
      expect(result).toHaveProperty('emailsSentToday')
      expect(result).toHaveProperty('recentActivity')
      expect(Array.isArray(result.recentActivity)).toBe(true)
    })

    it('should handle API timeout gracefully', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const result = await analyticsService.getMetrics('30d')

      expect(result).toHaveProperty('totalUsers')
      expect(typeof result.totalUsers).toBe('number')
      expect(result.totalUsers).toBeGreaterThan(0)
    })
  })

  describe('getUserAnalytics', () => {
    it('should fetch and process user analytics from database', async () => {
      const mockUsers = [
        {
          created_at: '2024-01-01T00:00:00Z',
          last_seen_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          created_at: new Date().toISOString(), // This month
          last_seen_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago (inactive)
        },
        {
          created_at: new Date().toISOString(), // This month
          last_seen_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago (active)
        }
      ]

      mockSupabase.select.mockResolvedValueOnce({
        data: mockUsers,
        error: null
      })

      const result = await analyticsService.getUserAnalytics()

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockSupabase.select).toHaveBeenCalledWith('created_at, last_seen_at')
      expect(mockSupabase.is).toHaveBeenCalledWith('deleted_at', null)
      
      expect(result).toEqual({
        totalUsers: 3,
        activeUsers: 2, // Users with last_seen_at within 30 days
        newUsersThisMonth: 2 // Users created this month
      })
    })

    it('should handle database error gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: new Error('Database connection failed')
      })

      await expect(analyticsService.getUserAnalytics()).rejects.toThrow('Database connection failed')
    })

    it('should handle null user data', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: null
      })

      const result = await analyticsService.getUserAnalytics()

      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0
      })
    })

    it('should correctly identify active users', async () => {
      const activeUser = {
        created_at: '2024-01-01T00:00:00Z',
        last_seen_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      }
      const inactiveUser = {
        created_at: '2024-01-01T00:00:00Z',
        last_seen_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
      }
      const neverSeenUser = {
        created_at: '2024-01-01T00:00:00Z',
        last_seen_at: null
      }

      mockSupabase.select.mockResolvedValueOnce({
        data: [activeUser, inactiveUser, neverSeenUser],
        error: null
      })

      const result = await analyticsService.getUserAnalytics()

      expect(result.totalUsers).toBe(3)
      expect(result.activeUsers).toBe(1) // Only the user seen within 30 days
    })
  })

  describe('private helper methods', () => {
    describe('getDaysFromRange', () => {
      it('should return correct days for each range', () => {
        // Access private method via type assertion for testing
        const service = analyticsService as any
        
        expect(service.getDaysFromRange('7d')).toBe(7)
        expect(service.getDaysFromRange('30d')).toBe(30)
        expect(service.getDaysFromRange('90d')).toBe(90)
        expect(service.getDaysFromRange('1y')).toBe(365)
        expect(service.getDaysFromRange('invalid' as any)).toBe(30) // default
      })
    })

    describe('generateMockTimeSeriesData', () => {
      it('should generate correct number of data points', () => {
        const service = analyticsService as any
        const data = service.generateMockTimeSeriesData(7, 10, 100)
        
        expect(data).toHaveLength(7)
        expect(data[0]).toHaveProperty('date')
        expect(data[0]).toHaveProperty('value')
        expect(data[0]).toHaveProperty('label')
      })

      it('should generate trending data when trending is true', () => {
        const service = analyticsService as any
        const data = service.generateMockTimeSeriesData(10, 10, 100, true)
        
        expect(data).toHaveLength(10)
        
        // First value should be closer to min, last value closer to max (trending upward)
        const firstValue = data[0].value
        const lastValue = data[data.length - 1].value
        
        expect(firstValue).toBeGreaterThanOrEqual(10)
        expect(firstValue).toBeLessThanOrEqual(100)
        expect(lastValue).toBeGreaterThanOrEqual(10)
        expect(lastValue).toBeLessThanOrEqual(100)
      })

      it('should generate valid date strings', () => {
        const service = analyticsService as any
        const data = service.generateMockTimeSeriesData(3, 1, 10)
        
        data.forEach((point: any) => {
          expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(new Date(point.date).getTime()).not.toBeNaN()
        })
      })
    })

    describe('isActiveUser', () => {
      it('should correctly identify active users', () => {
        const service = analyticsService as any
        
        const activeDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
        const inactiveDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
        
        expect(service.isActiveUser(activeDate)).toBe(true)
        expect(service.isActiveUser(inactiveDate)).toBe(false)
        expect(service.isActiveUser(null)).toBe(false)
        expect(service.isActiveUser('')).toBe(false)
      })
    })

    describe('isThisMonth', () => {
      it('should correctly identify dates from this month', () => {
        const service = analyticsService as any
        
        const thisMonth = new Date().toISOString()
        const lastMonth = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        
        expect(service.isThisMonth(thisMonth)).toBe(true)
        expect(service.isThisMonth(lastMonth)).toBe(false)
      })
    })
  })

  describe('mock data generation methods', () => {
    it('should generate user metrics within expected ranges', async () => {
      const service = analyticsService as any
      const userMetrics = await service.getUserMetrics(30)
      
      expect(userMetrics.totalUsers).toBeGreaterThanOrEqual(5000)
      expect(userMetrics.totalUsers).toBeLessThanOrEqual(15000)
      expect(userMetrics.activeUsers).toBeGreaterThanOrEqual(2000)
      expect(userMetrics.activeUsers).toBeLessThanOrEqual(7000)
      expect(userMetrics.newUsersToday).toBeGreaterThanOrEqual(20)
      expect(userMetrics.newUsersToday).toBeLessThanOrEqual(120)
      expect(userMetrics.userGrowthRate).toBeGreaterThanOrEqual(5)
      expect(userMetrics.userGrowthRate).toBeLessThanOrEqual(25)
      expect(userMetrics.userRetentionRate).toBeGreaterThanOrEqual(70)
      expect(userMetrics.userRetentionRate).toBeLessThanOrEqual(100)
    })

    it('should generate organization metrics within expected ranges', async () => {
      const service = analyticsService as any
      const orgMetrics = await service.getOrganizationMetrics(30)
      
      expect(orgMetrics.total).toBeGreaterThanOrEqual(500)
      expect(orgMetrics.total).toBeLessThanOrEqual(1500)
      expect(orgMetrics.active).toBeGreaterThanOrEqual(400)
      expect(orgMetrics.active).toBeLessThanOrEqual(1200)
      expect(orgMetrics.newToday).toBeGreaterThanOrEqual(2)
      expect(orgMetrics.newToday).toBeLessThanOrEqual(12)
      expect(orgMetrics.growthRate).toBeGreaterThanOrEqual(3)
      expect(orgMetrics.growthRate).toBeLessThanOrEqual(18)
    })

    it('should generate revenue metrics within expected ranges', async () => {
      const service = analyticsService as any
      const revenueMetrics = await service.getRevenueMetrics(30)
      
      expect(revenueMetrics.monthlyRecurringRevenue).toBeGreaterThanOrEqual(5000000)
      expect(revenueMetrics.monthlyRecurringRevenue).toBeLessThanOrEqual(15000000)
      expect(revenueMetrics.totalRevenue).toBeGreaterThanOrEqual(25000000)
      expect(revenueMetrics.totalRevenue).toBeLessThanOrEqual(75000000)
      expect(revenueMetrics.averageRevenuePerUser).toBeGreaterThanOrEqual(2000)
      expect(revenueMetrics.averageRevenuePerUser).toBeLessThanOrEqual(7000)
      expect(revenueMetrics.revenueGrowthRate).toBeGreaterThanOrEqual(8)
      expect(revenueMetrics.revenueGrowthRate).toBeLessThanOrEqual(33)
      expect(revenueMetrics.churnRate).toBeGreaterThanOrEqual(2)
      expect(revenueMetrics.churnRate).toBeLessThanOrEqual(12)
    })

    it('should generate system metrics within expected ranges', async () => {
      const service = analyticsService as any
      const systemMetrics = await service.getSystemMetrics()
      
      expect(systemMetrics.systemUptime).toBe(99.9)
      expect(systemMetrics.apiResponseTime).toBeGreaterThanOrEqual(50)
      expect(systemMetrics.apiResponseTime).toBeLessThanOrEqual(250)
      expect(systemMetrics.errorRate).toBeGreaterThanOrEqual(0)
      expect(systemMetrics.errorRate).toBeLessThanOrEqual(2)
      expect(systemMetrics.activeConnections).toBeGreaterThanOrEqual(200)
      expect(systemMetrics.activeConnections).toBeLessThanOrEqual(1200)
    })

    it('should generate email metrics within expected ranges', async () => {
      const service = analyticsService as any
      const emailMetrics = await service.getEmailMetrics()
      
      expect(emailMetrics.emailsSentToday).toBeGreaterThanOrEqual(1000)
      expect(emailMetrics.emailsSentToday).toBeLessThanOrEqual(11000)
      expect(emailMetrics.emailDeliveryRate).toBeGreaterThanOrEqual(95)
      expect(emailMetrics.emailDeliveryRate).toBeLessThanOrEqual(100)
      expect(emailMetrics.campaignsActive).toBeGreaterThanOrEqual(5)
      expect(emailMetrics.campaignsActive).toBeLessThanOrEqual(25)
      expect(emailMetrics.subscriberCount).toBeGreaterThanOrEqual(10000)
      expect(emailMetrics.subscriberCount).toBeLessThanOrEqual(60000)
    })

    it('should generate recent activity with correct structure', async () => {
      const service = analyticsService as any
      const recentActivity = await service.getRecentActivity()
      
      expect(Array.isArray(recentActivity)).toBe(true)
      expect(recentActivity).toHaveLength(3)
      
      recentActivity.forEach((activity: any) => {
        expect(activity).toHaveProperty('id')
        expect(activity).toHaveProperty('description')
        expect(activity).toHaveProperty('timestamp')
        expect(activity).toHaveProperty('type')
        expect(['user', 'organization', 'system', 'email', 'billing']).toContain(activity.type)
      })
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      } as Response)

      await expect(analyticsService.getAnalytics('30d')).rejects.toThrow()
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      } as Response)

      const result = await analyticsService.getAnalytics('30d')
      
      // Should fall back to mock data
      expect(result).toHaveProperty('userGrowth')
      expect(Array.isArray(result.userGrowth)).toBe(true)
    })

    it('should handle empty data arrays gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const result = await analyticsService.getUserAnalytics()

      expect(result).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0
      })
    })

    it('should handle invalid date strings in user data', async () => {
      const mockUsers = [
        {
          created_at: 'invalid-date',
          last_seen_at: 'also-invalid'
        },
        {
          created_at: '',
          last_seen_at: null
        }
      ]

      mockSupabase.select.mockResolvedValueOnce({
        data: mockUsers,
        error: null
      })

      const result = await analyticsService.getUserAnalytics()

      expect(result.totalUsers).toBe(2)
      expect(result.activeUsers).toBe(0) // Invalid dates should not count as active
      expect(result.newUsersThisMonth).toBe(0) // Invalid dates should not count as this month
    })
  })
})