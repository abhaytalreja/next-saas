import { UsageReporter } from '../../usage/usage-reporter'
import { UsageTracker } from '../../usage/usage-tracker'
import { getStripeClient } from '../../stripe/stripe-client'

// Mock dependencies
jest.mock('../../usage/usage-tracker')
jest.mock('../../stripe/stripe-client')

const MockUsageTracker = UsageTracker as jest.MockedClass<typeof UsageTracker>
const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>

const mockStripe = {
  subscriptionItems: {
    createUsageRecord: jest.fn()
  },
  subscriptions: {
    retrieve: jest.fn()
  }
}

describe('UsageReporter', () => {
  let usageReporter: UsageReporter
  let mockUsageTracker: jest.Mocked<UsageTracker>
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUsageTracker = {
      getCurrentUsage: jest.fn(),
      getAllUsageForOrganization: jest.fn(),
      trackUsage: jest.fn(),
      resetUsage: jest.fn(),
      getUsageMetrics: jest.fn()
    } as any

    MockUsageTracker.mockImplementation(() => mockUsageTracker)
    mockGetStripeClient.mockReturnValue(mockStripe as any)
    
    usageReporter = new UsageReporter()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('reportUsageToStripe', () => {
    const organizationId = 'org_123456789'
    const subscriptionItemId = 'si_test123'

    it('should report usage to Stripe successfully', async () => {
      const usageData = [
        {
          id: 'usage_1',
          organization_id: organizationId,
          feature: 'api_calls',
          quantity: 150,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date('2024-01-31'),
          updated_at: new Date('2024-01-31'),
          metadata: {}
        }
      ]

      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue(usageData)
      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({
        id: 'usage_record_123',
        quantity: 150,
        timestamp: Math.floor(Date.now() / 1000)
      })

      const result = await usageReporter.reportUsageToStripe(
        organizationId,
        subscriptionItemId,
        150,
        new Date('2024-01-31')
      )

      expect(result).toBe(true)
      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledWith(
        subscriptionItemId,
        {
          quantity: 150,
          timestamp: Math.floor(new Date('2024-01-31').getTime() / 1000),
          action: 'set' // Default action
        }
      )
    })

    it('should handle custom action parameter', async () => {
      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({
        id: 'usage_record_123',
        quantity: 50,
        timestamp: Math.floor(Date.now() / 1000)
      })

      const result = await usageReporter.reportUsageToStripe(
        organizationId,
        subscriptionItemId,
        50,
        new Date(),
        'increment'
      )

      expect(result).toBe(true)
      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledWith(
        subscriptionItemId,
        expect.objectContaining({
          action: 'increment'
        })
      )
    })

    it('should handle Stripe API errors', async () => {
      mockStripe.subscriptionItems.createUsageRecord.mockRejectedValue(
        new Error('Invalid subscription item')
      )

      const result = await usageReporter.reportUsageToStripe(
        organizationId,
        subscriptionItemId,
        100
      )

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error reporting usage to Stripe:',
        expect.any(Error)
      )
    })

    it('should use current timestamp when timestamp not provided', async () => {
      const now = new Date('2024-02-15T10:30:00Z')
      jest.spyOn(Date, 'now').mockImplementation(() => now.getTime())

      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({
        id: 'usage_record_123',
        quantity: 100,
        timestamp: Math.floor(now.getTime() / 1000)
      })

      await usageReporter.reportUsageToStripe(organizationId, subscriptionItemId, 100)

      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledWith(
        subscriptionItemId,
        expect.objectContaining({
          timestamp: Math.floor(now.getTime() / 1000)
        })
      )
    })
  })

  describe('reportAllUsageForPeriod', () => {
    const organizationId = 'org_123456789'
    const subscriptionId = 'sub_test123'

    it('should report all usage for billing period', async () => {
      const mockSubscription = {
        id: subscriptionId,
        items: {
          data: [
            {
              id: 'si_api_calls',
              price: {
                id: 'price_api_calls',
                metadata: { feature: 'api_calls' }
              }
            },
            {
              id: 'si_storage',
              price: {
                id: 'price_storage',
                metadata: { feature: 'storage_gb' }
              }
            }
          ]
        }
      }

      const usageData = [
        {
          id: 'usage_1',
          organization_id: organizationId,
          feature: 'api_calls',
          quantity: 500,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        },
        {
          id: 'usage_2',
          organization_id: organizationId,
          feature: 'storage_gb',
          quantity: 25,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        }
      ]

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription)
      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue(usageData)
      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({
        id: 'usage_record_123'
      })

      const result = await usageReporter.reportAllUsageForPeriod(
        organizationId,
        subscriptionId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        success: true,
        reportedItems: 2,
        details: [
          {
            feature: 'api_calls',
            subscriptionItemId: 'si_api_calls',
            quantity: 500,
            success: true
          },
          {
            feature: 'storage_gb',
            subscriptionItemId: 'si_storage',
            quantity: 25,
            success: true
          }
        ]
      })

      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledTimes(2)
    })

    it('should handle missing subscription items for features', async () => {
      const mockSubscription = {
        id: subscriptionId,
        items: {
          data: [
            {
              id: 'si_api_calls',
              price: {
                id: 'price_api_calls',
                metadata: { feature: 'api_calls' }
              }
            }
          ]
        }
      }

      const usageData = [
        {
          id: 'usage_1',
          organization_id: organizationId,
          feature: 'api_calls',
          quantity: 500,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        },
        {
          id: 'usage_2',
          organization_id: organizationId,
          feature: 'storage_gb', // No matching subscription item
          quantity: 25,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        }
      ]

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription)
      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue(usageData)
      mockStripe.subscriptionItems.createUsageRecord.mockResolvedValue({
        id: 'usage_record_123'
      })

      const result = await usageReporter.reportAllUsageForPeriod(
        organizationId,
        subscriptionId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        success: false,
        reportedItems: 1,
        details: [
          {
            feature: 'api_calls',
            subscriptionItemId: 'si_api_calls',
            quantity: 500,
            success: true
          },
          {
            feature: 'storage_gb',
            subscriptionItemId: null,
            quantity: 25,
            success: false,
            error: 'No subscription item found for feature: storage_gb'
          }
        ]
      })
    })

    it('should handle subscription retrieval errors', async () => {
      mockStripe.subscriptions.retrieve.mockRejectedValue(
        new Error('Subscription not found')
      )

      const result = await usageReporter.reportAllUsageForPeriod(
        organizationId,
        subscriptionId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        success: false,
        reportedItems: 0,
        details: [],
        error: 'Failed to retrieve subscription: Subscription not found'
      })
    })

    it('should handle usage data retrieval errors', async () => {
      const mockSubscription = {
        id: subscriptionId,
        items: { data: [] }
      }

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription)
      mockUsageTracker.getAllUsageForOrganization.mockRejectedValue(
        new Error('Database error')
      )

      const result = await usageReporter.reportAllUsageForPeriod(
        organizationId,
        subscriptionId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        success: false,
        reportedItems: 0,
        details: [],
        error: 'Failed to get usage data: Database error'
      })
    })

    it('should handle partial failures when reporting individual items', async () => {
      const mockSubscription = {
        id: subscriptionId,
        items: {
          data: [
            {
              id: 'si_api_calls',
              price: {
                id: 'price_api_calls',
                metadata: { feature: 'api_calls' }
              }
            },
            {
              id: 'si_storage',
              price: {
                id: 'price_storage',
                metadata: { feature: 'storage_gb' }
              }
            }
          ]
        }
      }

      const usageData = [
        {
          id: 'usage_1',
          organization_id: organizationId,
          feature: 'api_calls',
          quantity: 500,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        },
        {
          id: 'usage_2',
          organization_id: organizationId,
          feature: 'storage_gb',
          quantity: 25,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        }
      ]

      mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription)
      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue(usageData)
      
      // First call succeeds, second fails
      mockStripe.subscriptionItems.createUsageRecord
        .mockResolvedValueOnce({ id: 'usage_record_123' })
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))

      const result = await usageReporter.reportAllUsageForPeriod(
        organizationId,
        subscriptionId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        success: false,
        reportedItems: 1,
        details: [
          {
            feature: 'api_calls',
            subscriptionItemId: 'si_api_calls',
            quantity: 500,
            success: true
          },
          {
            feature: 'storage_gb',
            subscriptionItemId: 'si_storage',
            quantity: 25,
            success: false,
            error: 'Rate limit exceeded'
          }
        ]
      })
    })
  })

  describe('getUsageReportSummary', () => {
    const organizationId = 'org_123456789'

    it('should generate usage report summary', async () => {
      const usageData = [
        {
          id: 'usage_1',
          organization_id: organizationId,
          feature: 'api_calls',
          quantity: 500,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        },
        {
          id: 'usage_2',
          organization_id: organizationId,
          feature: 'storage_gb',
          quantity: 25,
          period_start: new Date('2024-01-01'),
          period_end: new Date('2024-01-31'),
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {}
        }
      ]

      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue(usageData)

      const result = await usageReporter.getUsageReportSummary(
        organizationId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        organizationId,
        periodStart: expect.any(Date),
        periodEnd: expect.any(Date),
        totalFeatures: 2,
        features: {
          api_calls: { quantity: 500, lastUpdated: expect.any(Date) },
          storage_gb: { quantity: 25, lastUpdated: expect.any(Date) }
        },
        generated: expect.any(Date)
      })
    })

    it('should handle empty usage data', async () => {
      mockUsageTracker.getAllUsageForOrganization.mockResolvedValue([])

      const result = await usageReporter.getUsageReportSummary(
        organizationId,
        new Date('2024-01-01')
      )

      expect(result).toEqual({
        organizationId,
        periodStart: expect.any(Date),
        periodEnd: expect.any(Date),
        totalFeatures: 0,
        features: {},
        generated: expect.any(Date)
      })
    })

    it('should handle errors gracefully', async () => {
      mockUsageTracker.getAllUsageForOrganization.mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(
        usageReporter.getUsageReportSummary(organizationId, new Date('2024-01-01'))
      ).rejects.toThrow('Failed to generate usage report: Database connection failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error generating usage report summary:',
        expect.any(Error)
      )
    })
  })
})