import Stripe from 'stripe'
import { SubscriptionService } from '../../stripe/subscription-service'
import { getStripeClient } from '../../stripe/stripe-client'
import type { StripeSubscriptionData } from '../../types'

// Mock Stripe for integration tests
jest.mock('../../stripe/stripe-client')

const mockStripe = {
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    list: jest.fn()
  },
  subscriptionItems: {
    listUsageRecordSummaries: jest.fn(),
    createUsageRecord: jest.fn()
  }
} as unknown as Stripe

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>
mockGetStripeClient.mockReturnValue(mockStripe)

describe('SubscriptionService Integration Tests', () => {
  let subscriptionService: SubscriptionService
  const testCustomerId = 'cus_test123'
  const testPriceId = 'price_test123'
  const testSubscriptionId = 'sub_test123'

  beforeEach(() => {
    subscriptionService = new SubscriptionService()
    jest.clearAllMocks()
  })

  describe('Subscription Lifecycle Management', () => {
    it('should create a new subscription with trial', async () => {
      const mockSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_test123',
            price: {
              id: testPriceId,
              recurring: { interval: 'month' }
            }
          }]
        },
        trial_start: 1609459200,
        trial_end: 1612137600,
        metadata: {
          organization_id: 'org_123',
          plan_type: 'professional'
        },
        latest_invoice: {
          payment_intent: {
            id: 'pi_test123',
            status: 'succeeded'
          }
        }
      }

      ;(mockStripe.subscriptions.create as jest.Mock).mockResolvedValue(mockSubscription)

      const options = {
        trial_period_days: 30,
        metadata: {
          organization_id: 'org_123',
          plan_type: 'professional'
        },
        automatic_tax: true
      }

      const result = await subscriptionService.createSubscription(
        testCustomerId,
        testPriceId,
        options
      )

      expect(result).toEqual({
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: mockSubscription.items,
        trial_start: 1609459200,
        trial_end: 1612137600,
        metadata: {
          organization_id: 'org_123',
          plan_type: 'professional'
        }
      })

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: testCustomerId,
        items: [{ price: testPriceId }],
        trial_period_days: 30,
        metadata: {
          organization_id: 'org_123',
          plan_type: 'professional'
        },
        automatic_tax: { enabled: true },
        expand: ['latest_invoice.payment_intent']
      })
    })

    it('should retrieve subscription by ID', async () => {
      const mockSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_test123',
            price: { id: testPriceId }
          }]
        },
        metadata: {}
      }

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(mockSubscription)

      const result = await subscriptionService.getSubscription(testSubscriptionId)

      expect(result).toBeDefined()
      expect(result!.id).toBe(testSubscriptionId)
      expect(result!.status).toBe('active')
      expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith(testSubscriptionId)
    })

    it('should return null for non-existent subscription', async () => {
      const error = new Error('No such subscription: sub_invalid') as any
      error.message = 'No such subscription: sub_invalid'
      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockRejectedValue(error)

      const result = await subscriptionService.getSubscription('sub_invalid')

      expect(result).toBeNull()
    })

    it('should update subscription with new price', async () => {
      const currentSubscription = {
        id: testSubscriptionId,
        items: {
          data: [{
            id: 'si_current123',
            price: { id: 'price_old123' }
          }]
        }
      }

      const updatedSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_current123',
            price: { id: 'price_new123' }
          }]
        },
        metadata: { upgraded: 'true' }
      }

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(currentSubscription)
      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(updatedSubscription)

      const updates = {
        price_id: 'price_new123',
        quantity: 2,
        metadata: { upgraded: 'true' },
        proration_behavior: 'create_prorations' as const
      }

      const result = await subscriptionService.updateSubscription(testSubscriptionId, updates)

      expect(result.id).toBe(testSubscriptionId)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(testSubscriptionId, {
        metadata: { upgraded: 'true' },
        proration_behavior: 'create_prorations',
        items: [{
          id: 'si_current123',
          price: 'price_new123',
          quantity: 2
        }]
      })
    })

    it('should cancel subscription at period end', async () => {
      const canceledSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: true,
        canceled_at: null,
        items: { data: [] },
        metadata: {}
      }

      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(canceledSubscription)

      const result = await subscriptionService.cancelSubscription(testSubscriptionId, true)

      expect(result.cancel_at_period_end).toBe(true)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(testSubscriptionId, {
        cancel_at_period_end: true
      })
    })

    it('should cancel subscription immediately', async () => {
      const canceledSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'canceled',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: 1609545600,
        items: { data: [] },
        metadata: {}
      }

      ;(mockStripe.subscriptions.cancel as jest.Mock).mockResolvedValue(canceledSubscription)

      const result = await subscriptionService.cancelSubscription(testSubscriptionId, false)

      expect(result.status).toBe('canceled')
      expect(result.canceled_at).toBe(1609545600)
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(testSubscriptionId)
    })

    it('should reactivate canceled subscription', async () => {
      const reactivatedSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: { data: [] },
        metadata: {}
      }

      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(reactivatedSubscription)

      const result = await subscriptionService.reactivateSubscription(testSubscriptionId)

      expect(result.cancel_at_period_end).toBe(false)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(testSubscriptionId, {
        cancel_at_period_end: false
      })
    })
  })

  describe('Customer Subscription Management', () => {
    it('should get all subscriptions for a customer', async () => {
      const mockSubscriptions = {
        data: [
          {
            id: 'sub_1',
            customer: testCustomerId,
            status: 'active',
            current_period_start: 1609459200,
            current_period_end: 1612137600,
            cancel_at_period_end: false,
            canceled_at: null,
            items: { data: [] },
            metadata: {}
          },
          {
            id: 'sub_2',
            customer: testCustomerId,
            status: 'canceled',
            current_period_start: 1606867200,
            current_period_end: 1609459200,
            cancel_at_period_end: false,
            canceled_at: 1609459200,
            items: { data: [] },
            metadata: {}
          }
        ]
      }

      ;(mockStripe.subscriptions.list as jest.Mock).mockResolvedValue(mockSubscriptions)

      const result = await subscriptionService.getCustomerSubscriptions(testCustomerId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('sub_1')
      expect(result[0].status).toBe('active')
      expect(result[1].id).toBe('sub_2')
      expect(result[1].status).toBe('canceled')
      expect(mockStripe.subscriptions.list).toHaveBeenCalledWith({
        customer: testCustomerId,
        status: 'all'
      })
    })

    it('should identify active subscriptions correctly', () => {
      const activeSubscription: StripeSubscriptionData = {
        id: 'sub_active',
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        items: { data: [] },
        metadata: {}
      }

      const trialingSubscription: StripeSubscriptionData = {
        id: 'sub_trial',
        customer: testCustomerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        items: { data: [] },
        metadata: {}
      }

      const canceledSubscription: StripeSubscriptionData = {
        id: 'sub_canceled',
        customer: testCustomerId,
        status: 'canceled',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        items: { data: [] },
        metadata: {}
      }

      expect(subscriptionService.isActiveSubscription(activeSubscription)).toBe(true)
      expect(subscriptionService.isActiveSubscription(trialingSubscription)).toBe(true)
      expect(subscriptionService.isActiveSubscription(canceledSubscription)).toBe(false)
    })

    it('should identify trial subscriptions correctly', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 86400 // 1 day from now
      const pastTimestamp = Math.floor(Date.now() / 1000) - 86400 // 1 day ago

      const activeTrialSubscription: StripeSubscriptionData = {
        id: 'sub_trial_active',
        customer: testCustomerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        trial_end: futureTimestamp,
        items: { data: [] },
        metadata: {}
      }

      const expiredTrialSubscription: StripeSubscriptionData = {
        id: 'sub_trial_expired',
        customer: testCustomerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        trial_end: pastTimestamp,
        items: { data: [] },
        metadata: {}
      }

      const nonTrialSubscription: StripeSubscriptionData = {
        id: 'sub_active',
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        items: { data: [] },
        metadata: {}
      }

      expect(subscriptionService.isTrialSubscription(activeTrialSubscription)).toBe(true)
      expect(subscriptionService.isTrialSubscription(expiredTrialSubscription)).toBe(false)
      expect(subscriptionService.isTrialSubscription(nonTrialSubscription)).toBe(false)
    })
  })

  describe('Usage-Based Billing', () => {
    const subscriptionItemId = 'si_usage123'

    it('should get subscription usage records', async () => {
      const mockUsageRecords = {
        data: [
          {
            id: 'urs_1',
            period: {
              start: 1609459200,
              end: 1612137600
            },
            total_usage: 1500
          },
          {
            id: 'urs_2',
            period: {
              start: 1612137600,
              end: 1614556800
            },
            total_usage: 2300
          }
        ]
      }

      ;(mockStripe.subscriptionItems.listUsageRecordSummaries as jest.Mock).mockResolvedValue(mockUsageRecords)

      const timestamp = 1609459200
      const result = await subscriptionService.getSubscriptionUsage(subscriptionItemId, timestamp)

      expect(result).toEqual(mockUsageRecords)
      expect(mockStripe.subscriptionItems.listUsageRecordSummaries).toHaveBeenCalledWith(
        subscriptionItemId,
        {
          limit: 100,
          starting_after: new Date(timestamp * 1000).toISOString()
        }
      )
    })

    it('should report usage with custom timestamp', async () => {
      const mockUsageRecord = {
        id: 'ur_test123',
        quantity: 100,
        timestamp: 1609459200,
        subscription_item: subscriptionItemId
      }

      ;(mockStripe.subscriptionItems.createUsageRecord as jest.Mock).mockResolvedValue(mockUsageRecord)

      const quantity = 100
      const timestamp = 1609459200
      const result = await subscriptionService.reportUsage(subscriptionItemId, quantity, timestamp)

      expect(result).toEqual(mockUsageRecord)
      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledWith(
        subscriptionItemId,
        {
          quantity,
          timestamp,
          action: 'set'
        }
      )
    })

    it('should report usage with current timestamp when not provided', async () => {
      const mockUsageRecord = {
        id: 'ur_current123',
        quantity: 50,
        subscription_item: subscriptionItemId
      }

      ;(mockStripe.subscriptionItems.createUsageRecord as jest.Mock).mockResolvedValue(mockUsageRecord)

      const quantity = 50
      await subscriptionService.reportUsage(subscriptionItemId, quantity)

      expect(mockStripe.subscriptionItems.createUsageRecord).toHaveBeenCalledWith(
        subscriptionItemId,
        {
          quantity,
          timestamp: expect.any(Number),
          action: 'set'
        }
      )

      const callArgs = (mockStripe.subscriptionItems.createUsageRecord as jest.Mock).mock.calls[0][1]
      expect(callArgs.timestamp).toBeGreaterThan(Math.floor(Date.now() / 1000) - 10) // Within last 10 seconds
    })
  })

  describe('Multi-tenant Subscription Scenarios', () => {
    it('should handle organization-specific subscriptions', async () => {
      const orgId = 'org_enterprise123'
      const mockSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: { data: [] },
        metadata: {
          organization_id: orgId,
          seat_count: '50',
          plan_tier: 'enterprise'
        }
      }

      ;(mockStripe.subscriptions.create as jest.Mock).mockResolvedValue(mockSubscription)

      const options = {
        metadata: {
          organization_id: orgId,
          seat_count: '50',
          plan_tier: 'enterprise'
        }
      }

      const result = await subscriptionService.createSubscription(
        testCustomerId,
        testPriceId,
        options
      )

      expect(result.metadata).toEqual({
        organization_id: orgId,
        seat_count: '50',
        plan_tier: 'enterprise'
      })
    })

    it('should handle subscription upgrades with prorations', async () => {
      const currentSubscription = {
        id: testSubscriptionId,
        items: {
          data: [{
            id: 'si_basic123',
            price: { id: 'price_basic_monthly' }
          }]
        }
      }

      const upgradedSubscription = {
        id: testSubscriptionId,
        customer: testCustomerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_basic123',
            price: { id: 'price_pro_monthly' }
          }]
        },
        metadata: {
          upgraded_from: 'basic',
          upgraded_to: 'professional',
          upgrade_timestamp: '1609545600'
        }
      }

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(currentSubscription)
      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(upgradedSubscription)

      const updates = {
        price_id: 'price_pro_monthly',
        metadata: {
          upgraded_from: 'basic',
          upgraded_to: 'professional',
          upgrade_timestamp: '1609545600'
        },
        proration_behavior: 'create_prorations' as const
      }

      const result = await subscriptionService.updateSubscription(testSubscriptionId, updates)

      expect(result.metadata.upgraded_from).toBe('basic')
      expect(result.metadata.upgraded_to).toBe('professional')
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        testSubscriptionId,
        expect.objectContaining({
          proration_behavior: 'create_prorations'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle Stripe API errors during subscription creation', async () => {
      const stripeError = new Error('The customer does not have a payment method.') as any
      stripeError.type = 'card_error'
      stripeError.code = 'resource_missing'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(stripeError)

      await expect(
        subscriptionService.createSubscription(testCustomerId, testPriceId)
      ).rejects.toThrow('The customer does not have a payment method.')
    })

    it('should rethrow unexpected errors during subscription retrieval', async () => {
      const networkError = new Error('Connection timeout')
      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockRejectedValue(networkError)

      await expect(
        subscriptionService.getSubscription(testSubscriptionId)
      ).rejects.toThrow('Connection timeout')
    })
  })
})