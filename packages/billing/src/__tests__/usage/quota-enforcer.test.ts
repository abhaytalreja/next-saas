import { QuotaEnforcer } from '../../usage/quota-enforcer'
import { UsageTracker } from '../../usage/usage-tracker'

// Mock the UsageTracker
jest.mock('../../usage/usage-tracker')

const MockUsageTracker = UsageTracker as jest.MockedClass<typeof UsageTracker>

describe('QuotaEnforcer', () => {
  let quotaEnforcer: QuotaEnforcer
  let mockUsageTracker: jest.Mocked<UsageTracker>
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUsageTracker = {
      getCurrentUsage: jest.fn(),
      trackUsage: jest.fn(),
      getAllUsageForOrganization: jest.fn(),
      resetUsage: jest.fn(),
      getUsageMetrics: jest.fn()
    } as any

    MockUsageTracker.mockImplementation(() => mockUsageTracker)
    
    quotaEnforcer = new QuotaEnforcer()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('canPerformAction', () => {
    const organizationId = 'org_123456789'
    const feature = 'api_calls'

    it('should allow action when no usage limit is set', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      })

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 5)

      expect(result).toEqual({
        allowed: true
      })
    })

    it('should allow action when usage is null', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue(null)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 5)

      expect(result).toEqual({
        allowed: true
      })
    })

    it('should allow action when within quota limits', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 250,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 50)

      expect(result).toEqual({
        allowed: true,
        currentUsage: 250,
        limit: 1000,
        remaining: 700 // 750 - 50
      })
    })

    it('should deny action when quota would be exceeded', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 950,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 100)

      expect(result).toEqual({
        allowed: false,
        reason: 'Quota exceeded. Current: 950, Limit: 1000, Requested: 100',
        currentUsage: 950,
        limit: 1000,
        remaining: 50
      })
    })

    it('should allow action exactly at the limit', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 950,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 50)

      expect(result).toEqual({
        allowed: true,
        currentUsage: 950,
        limit: 1000,
        remaining: 0
      })
    })

    it('should use default quantity of 1 when not provided', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 999,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature)

      expect(result).toEqual({
        allowed: true,
        currentUsage: 999,
        limit: 1000,
        remaining: 0
      })
    })

    it('should handle errors gracefully', async () => {
      mockUsageTracker.getCurrentUsage.mockRejectedValue(new Error('Database error'))

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 5)

      expect(result).toEqual({
        allowed: false,
        reason: 'Error checking quota limits'
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Quota enforcement error:', expect.any(Error))
    })

    it('should handle remaining calculation correctly for zero remaining', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 1000,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.canPerformAction(organizationId, feature, 1)

      expect(result).toEqual({
        allowed: false,
        reason: 'Quota exceeded. Current: 1000, Limit: 1000, Requested: 1',
        currentUsage: 1000,
        limit: 1000,
        remaining: 0
      })
    })
  })

  describe('enforceQuotaAndTrack', () => {
    const organizationId = 'org_123456789'
    const feature = 'api_calls'

    it('should track usage when quota allows', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 500,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      mockUsageTracker.trackUsage.mockResolvedValue()

      const usageEvent = {
        organization_id: organizationId,
        feature,
        quantity: 10,
        metadata: { test: 'data' }
      }

      const result = await quotaEnforcer.enforceQuotaAndTrack(usageEvent)

      expect(result).toEqual({
        success: true,
        tracked: true,
        quotaCheck: {
          allowed: true,
          currentUsage: 500,
          limit: 1000,
          remaining: 490
        }
      })

      expect(mockUsageTracker.trackUsage).toHaveBeenCalledWith(usageEvent)
    })

    it('should not track usage when quota is exceeded', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 995,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const usageEvent = {
        organization_id: organizationId,
        feature,
        quantity: 10,
        metadata: { test: 'data' }
      }

      const result = await quotaEnforcer.enforceQuotaAndTrack(usageEvent)

      expect(result).toEqual({
        success: false,
        tracked: false,
        quotaCheck: {
          allowed: false,
          reason: 'Quota exceeded. Current: 995, Limit: 1000, Requested: 10',
          currentUsage: 995,
          limit: 1000,
          remaining: 5
        }
      })

      expect(mockUsageTracker.trackUsage).not.toHaveBeenCalled()
    })

    it('should handle tracking errors after successful quota check', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 500,
        usage_limit: 1000,
        period_start: new Date(),
        period_end: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      mockUsageTracker.trackUsage.mockRejectedValue(new Error('Tracking failed'))

      const usageEvent = {
        organization_id: organizationId,
        feature,
        quantity: 10
      }

      const result = await quotaEnforcer.enforceQuotaAndTrack(usageEvent)

      expect(result).toEqual({
        success: false,
        tracked: false,
        quotaCheck: {
          allowed: true,
          currentUsage: 500,
          limit: 1000,
          remaining: 490
        },
        error: 'Failed to track usage after quota check'
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Usage tracking error after quota check:', expect.any(Error))
    })
  })

  describe('getQuotaStatus', () => {
    const organizationId = 'org_123456789'
    const feature = 'api_calls'

    it('should return quota status with usage and limits', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 750,
        usage_limit: 1000,
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31'),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.getQuotaStatus(organizationId, feature)

      expect(result).toEqual({
        feature,
        currentUsage: 750,
        limit: 1000,
        remaining: 250,
        percentageUsed: 75,
        periodStart: expect.any(Date),
        periodEnd: expect.any(Date),
        isNearLimit: false,
        isAtLimit: false
      })
    })

    it('should indicate near limit when usage is above 80%', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 850,
        usage_limit: 1000,
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31'),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.getQuotaStatus(organizationId, feature)

      expect(result).toEqual(expect.objectContaining({
        percentageUsed: 85,
        isNearLimit: true,
        isAtLimit: false
      }))
    })

    it('should indicate at limit when usage equals or exceeds limit', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue({
        id: 'usage_123',
        organization_id: organizationId,
        feature,
        quantity: 100,
        usage_count: 1000,
        usage_limit: 1000,
        period_start: new Date('2024-01-01'),
        period_end: new Date('2024-01-31'),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {}
      } as any)

      const result = await quotaEnforcer.getQuotaStatus(organizationId, feature)

      expect(result).toEqual(expect.objectContaining({
        percentageUsed: 100,
        isNearLimit: true,
        isAtLimit: true
      }))
    })

    it('should return null when no usage data exists', async () => {
      mockUsageTracker.getCurrentUsage.mockResolvedValue(null)

      const result = await quotaEnforcer.getQuotaStatus(organizationId, feature)

      expect(result).toBeNull()
    })

    it('should handle errors and return null', async () => {
      mockUsageTracker.getCurrentUsage.mockRejectedValue(new Error('Database error'))

      const result = await quotaEnforcer.getQuotaStatus(organizationId, feature)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting quota status:', expect.any(Error))
    })
  })

  describe('setQuotaLimit', () => {
    const organizationId = 'org_123456789'
    const feature = 'api_calls'
    const newLimit = 2000

    it('should set quota limit successfully', async () => {
      mockUsageTracker.setQuotaLimit = jest.fn().mockResolvedValue()

      const result = await quotaEnforcer.setQuotaLimit(organizationId, feature, newLimit)

      expect(result).toBe(true)
      expect(mockUsageTracker.setQuotaLimit).toHaveBeenCalledWith(organizationId, feature, newLimit)
    })

    it('should handle errors when setting quota limit', async () => {
      mockUsageTracker.setQuotaLimit = jest.fn().mockRejectedValue(new Error('Update failed'))

      const result = await quotaEnforcer.setQuotaLimit(organizationId, feature, newLimit)

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting quota limit:', expect.any(Error))
    })
  })
})