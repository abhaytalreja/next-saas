import { UsageTracker } from '../../usage/usage-tracker'

// Mock the Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn()
  }))
}))

import { getSupabaseBrowserClient } from '@nextsaas/supabase'

const mockSupabase = getSupabaseBrowserClient as jest.MockedFunction<typeof getSupabaseBrowserClient>

describe('UsageTracker', () => {
  let usageTracker: UsageTracker
  const organizationId = 'org_test123'

  beforeEach(() => {
    usageTracker = new UsageTracker()
    jest.clearAllMocks()
  })

  describe('getUsageMetrics', () => {
    it('fetches and returns usage metrics', async () => {
      const mockUsageData = [
        {
          feature: 'api_calls',
          usage_count: 150,
          usage_limit: 1000,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        },
        {
          feature: 'storage_gb',
          usage_count: 2.5,
          usage_limit: 10,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.getUsageMetrics(organizationId)

      expect(result).toEqual([
        {
          feature: 'api_calls',
          current_usage: 150,
          limit: 1000,
          percentage_used: 15,
          is_over_limit: false,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        },
        {
          feature: 'storage_gb',
          current_usage: 2.5,
          limit: 10,
          percentage_used: 25,
          is_over_limit: false,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        }
      ])

      expect(mockClient.from).toHaveBeenCalledWith('usage_tracking')
      expect(mockClient.eq).toHaveBeenCalledWith('organization_id', organizationId)
    })

    it('handles empty usage data', async () => {
      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.getUsageMetrics(organizationId)

      expect(result).toEqual({})
    })

    it('handles database errors', async () => {
      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      await expect(usageTracker.getUsageMetrics(organizationId)).rejects.toThrow('Database error')
    })
  })

  describe('trackUsage', () => {
    it('tracks usage for a feature', async () => {
      const mockClient = {
        rpc: jest.fn().mockResolvedValue({
          data: { success: true },
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const usageEvent = {
        organization_id: organizationId,
        feature: 'api_calls',
        quantity: 5,
        timestamp: new Date('2023-01-15')
      }

      await usageTracker.trackUsage(usageEvent)

      expect(mockClient.rpc).toHaveBeenCalledWith('increment_usage', {
        p_organization_id: organizationId,
        p_feature: 'api_calls',
        p_quantity: 5,
        p_period_start: expect.any(String),
        p_period_end: expect.any(String),
        p_metadata: {}
      })
    })

    it('handles tracking errors', async () => {
      const mockClient = {
        rpc: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to track usage' }
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const usageEvent = {
        organization_id: organizationId,
        feature: 'api_calls',
        quantity: 5
      }

      await expect(
        usageTracker.trackUsage(usageEvent)
      ).rejects.toThrow('Failed to track usage')
    })
  })

  describe('checkQuota', () => {
    it('returns quota information for available feature', async () => {
      const mockUsageData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 500,
          limit_quantity: 1000,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.checkQuota(organizationId, 'api_calls', 100)

      expect(result).toEqual({
        allowed: true,
        reason: null,
        current_usage: 500,
        limit: 1000,
        requested: 100,
        available: 500
      })
    })

    it('prevents usage when quota would be exceeded', async () => {
      const mockUsageData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 950,
          limit_quantity: 1000,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.checkQuota(organizationId, 'api_calls', 100)

      expect(result).toEqual({
        allowed: false,
        reason: 'quota_exceeded',
        current_usage: 950,
        limit: 1000,
        requested: 100,
        available: 50
      })
    })

    it('handles feature not found', async () => {
      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.checkQuota(organizationId, 'unknown_feature', 10)

      expect(result).toEqual({
        allowed: false,
        reason: 'feature_not_found',
        current_usage: 0,
        limit: 0,
        requested: 10,
        available: 0
      })
    })
  })

  describe('getUsageHistory', () => {
    it('fetches usage history for a time period', async () => {
      const mockHistoryData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 100,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-07T23:59:59Z',
          created_at: '2023-01-07T12:00:00Z'
        },
        {
          feature_slug: 'api_calls',
          used_quantity: 200,
          period_start: '2023-01-08T00:00:00Z',
          period_end: '2023-01-14T23:59:59Z',
          created_at: '2023-01-14T12:00:00Z'
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockHistoryData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-01-31')
      
      const result = await usageTracker.getUsageHistory(
        organizationId, 
        'api_calls', 
        startDate, 
        endDate
      )

      expect(result).toEqual(mockHistoryData)
      expect(mockClient.gte).toHaveBeenCalledWith('period_start', startDate.toISOString())
      expect(mockClient.lte).toHaveBeenCalledWith('period_end', endDate.toISOString())
    })
  })

  describe('getCurrentPeriodUsage', () => {
    it('gets current billing period usage', async () => {
      const mockUsageData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 350,
          limit_quantity: 1000,
          period_start: '2023-01-01T00:00:00Z',
          period_end: '2023-01-31T23:59:59Z'
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.getCurrentPeriodUsage(organizationId, 'api_calls')

      expect(result).toEqual({
        used: 350,
        limit: 1000,
        percentage: 35,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      })
    })

    it('returns null for feature not found', async () => {
      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.getCurrentPeriodUsage(organizationId, 'unknown_feature')

      expect(result).toBeNull()
    })
  })

  describe('resetUsage', () => {
    it('resets usage for a feature', async () => {
      const mockClient = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: { used_quantity: 0 },
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      await usageTracker.resetUsage(organizationId, 'api_calls')

      expect(mockClient.from).toHaveBeenCalledWith('usage_tracking')
      expect(mockClient.update).toHaveBeenCalledWith({ used_quantity: 0 })
      expect(mockClient.eq).toHaveBeenCalledWith('organization_id', organizationId)
    })
  })

  describe('isWithinQuota', () => {
    it('returns true when usage is within quota', async () => {
      const mockUsageData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 500,
          limit_quantity: 1000
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.isWithinQuota(organizationId, 'api_calls')

      expect(result).toBe(true)
    })

    it('returns false when quota is exceeded', async () => {
      const mockUsageData = [
        {
          feature_slug: 'api_calls',
          used_quantity: 1000,
          limit_quantity: 1000
        }
      ]

      const mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUsageData,
          error: null
        })
      }

      mockSupabase.mockReturnValue(mockClient as any)

      const result = await usageTracker.isWithinQuota(organizationId, 'api_calls')

      expect(result).toBe(false)
    })
  })
})