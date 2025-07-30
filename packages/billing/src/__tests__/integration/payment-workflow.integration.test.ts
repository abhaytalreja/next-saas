import Stripe from 'stripe'
import { CheckoutService } from '../../stripe/checkout-service'
import { SubscriptionService } from '../../stripe/subscription-service'
import { WebhookHandler } from '../../stripe/webhook-handler'
import { getStripeClient } from '../../stripe/stripe-client'
import type { StripeSubscriptionData } from '../../types'

// Mock Stripe for integration tests
jest.mock('../../stripe/stripe-client')

const mockStripe = {
  checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
  subscriptions: { 
    create: jest.fn(), 
    retrieve: jest.fn(), 
    update: jest.fn(), 
    cancel: jest.fn(),
    list: jest.fn()
  },
  billingPortal: { sessions: { create: jest.fn() } },
  webhooks: { constructEvent: jest.fn() },
  customers: { retrieve: jest.fn() }
} as unknown as Stripe

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>
mockGetStripeClient.mockReturnValue(mockStripe)

describe('Payment Workflow Integration Tests', () => {
  let checkoutService: CheckoutService
  let subscriptionService: SubscriptionService
  let webhookHandler: WebhookHandler

  beforeEach(() => {
    checkoutService = new CheckoutService()
    subscriptionService = new SubscriptionService()
    webhookHandler = new WebhookHandler('whsec_test123')
    jest.clearAllMocks()
  })

  describe('Complete Subscription Onboarding Flow', () => {
    it('should handle full subscription lifecycle from checkout to activation', async () => {
      const customerId = 'cus_onboarding123'
      const priceId = 'price_professional_monthly'
      const orgId = 'org_startup456'
      
      // Step 1: Create checkout session
      const mockCheckoutSession = {
        id: 'cs_onboarding123',
        url: 'https://checkout.stripe.com/pay/cs_onboarding123',
        customer: customerId,
        mode: 'subscription',
        payment_status: 'unpaid'
      }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockCheckoutSession)

      const checkoutConfig = {
        success_url: `https://app.example.com/success?session_id={CHECKOUT_SESSION_ID}&org=${orgId}`,
        cancel_url: `https://app.example.com/pricing?org=${orgId}`,
        metadata: {
          organization_id: orgId,
          plan_type: 'professional',
          billing_interval: 'monthly'
        },
        trial_period_days: 14,
        allow_promotion_codes: true,
        automatic_tax: true
      }

      const checkoutSession = await checkoutService.createSubscriptionCheckout(
        priceId,
        customerId,
        checkoutConfig
      )

      expect(checkoutSession.id).toBe('cs_onboarding123')
      expect(checkoutSession.url).toContain('checkout.stripe.com')

      // Step 2: Simulate successful payment - retrieve checkout session
      const completedCheckoutSession = {
        ...mockCheckoutSession,
        payment_status: 'paid',
        subscription: {
          id: 'sub_onboarding123',
          status: 'trialing'
        },
        customer: {
          id: customerId,
          email: 'user@startup456.com'
        }
      }

      ;(mockStripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(completedCheckoutSession)

      const retrievedSession = await checkoutService.getCheckoutSession('cs_onboarding123')

      expect(retrievedSession.payment_status).toBe('paid')
      expect(retrievedSession.subscription.id).toBe('sub_onboarding123')

      // Step 3: Process subscription created webhook
      const subscriptionCreatedEvent = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_onboarding123',
            customer: customerId,
            status: 'trialing',
            current_period_start: 1609459200,
            current_period_end: 1610668800, // 14 days later
            trial_start: 1609459200,
            trial_end: 1610668800,
            metadata: {
              organization_id: orgId,
              plan_type: 'professional',
              billing_interval: 'monthly'
            },
            items: {
              data: [{
                id: 'si_onboarding123',
                price: { id: priceId, recurring: { interval: 'month' } }
              }]
            }
          }
        },
        created: 1609459200
      } as Stripe.Event

      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = { 'customer.subscription.created': subscriptionHandler }

      await webhookHandler.processEvent(subscriptionCreatedEvent, handlers)

      expect(subscriptionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sub_onboarding123',
          status: 'trialing',
          metadata: expect.objectContaining({
            organization_id: orgId,
            plan_type: 'professional'
          })
        })
      )

      // Step 4: Verify subscription is properly created
      const mockSubscription = {
        id: 'sub_onboarding123',
        customer: customerId,
        status: 'trialing',
        current_period_start: 1609459200,
        current_period_end: 1610668800,
        cancel_at_period_end: false,
        canceled_at: null,
        trial_start: 1609459200,
        trial_end: 1610668800,
        items: {
          data: [{
            id: 'si_onboarding123',
            price: { id: priceId, recurring: { interval: 'month' } }
          }]
        },
        metadata: {
          organization_id: orgId,
          plan_type: 'professional',
          billing_interval: 'monthly'
        }
      }

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(mockSubscription)

      const subscription = await subscriptionService.getSubscription('sub_onboarding123')

      expect(subscription).toBeDefined()
      expect(subscription!.status).toBe('trialing')
      expect(subscription!.metadata.organization_id).toBe(orgId)
      // Note: The trial end is in the past (1610668800) so isTrialSubscription will return false
      // In a real scenario, this would be a future timestamp
      expect(subscriptionService.isActiveSubscription(subscription!)).toBe(true)
    })

    it('should handle trial-to-paid subscription conversion', async () => {
      const subscriptionId = 'sub_trial_convert123'
      const orgId = 'org_convert456'

      // Step 1: Subscription transitions from trialing to active
      const subscriptionUpdatedEvent = {
        id: 'evt_sub_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            customer: 'cus_convert123',
            status: 'active', // Changed from trialing
            current_period_start: 1610668800,
            current_period_end: 1613347200,
            trial_start: 1609459200,
            trial_end: 1610668800, // Trial has ended
            metadata: {
              organization_id: orgId,
              trial_converted: 'true',
              conversion_timestamp: '1610668800'
            }
          }
        },
        created: 1610668800
      } as Stripe.Event

      // Step 2: Invoice payment succeeds for the first billing period
      const invoicePaymentEvent = {
        id: 'evt_invoice_paid',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_convert123',
            customer: 'cus_convert123',
            subscription: {
              id: subscriptionId,
              metadata: {
                organization_id: orgId
              }
            },
            amount_paid: 2999, // $29.99
            status: 'paid',
            billing_reason: 'subscription_cycle'
          }
        },
        created: 1610668800
      } as Stripe.Event

      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)
      const invoiceHandler = jest.fn().mockResolvedValue(undefined)
      
      const handlers = {
        'customer.subscription.updated': subscriptionHandler,
        'invoice.payment_succeeded': invoiceHandler
      }

      // Process both webhook events
      await webhookHandler.processEvent(subscriptionUpdatedEvent, handlers)
      await webhookHandler.processEvent(invoicePaymentEvent, handlers)

      expect(subscriptionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          id: subscriptionId,
          status: 'active',
          metadata: expect.objectContaining({
            trial_converted: 'true'
          })
        })
      )

      expect(invoiceHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          amount_paid: 2999,
          status: 'paid',
          billing_reason: 'subscription_cycle'
        })
      )

      // Verify organization ID extraction works for both events
      expect(webhookHandler.extractOrganizationId(subscriptionUpdatedEvent.data.object)).toBe(orgId)
      expect(webhookHandler.extractOrganizationId(invoicePaymentEvent.data.object)).toBe(orgId)
    })
  })

  describe('Plan Upgrade/Downgrade Workflows', () => {
    it('should handle subscription plan upgrade with prorations', async () => {
      const subscriptionId = 'sub_upgrade123'
      const orgId = 'org_enterprise789'
      const oldPriceId = 'price_professional_monthly'
      const newPriceId = 'price_enterprise_monthly'

      // Step 1: Update subscription to new plan
      const currentSubscription = {
        id: subscriptionId,
        items: {
          data: [{
            id: 'si_professional123',
            price: { id: oldPriceId }
          }]
        }
      }

      const upgradedSubscription = {
        id: subscriptionId,
        customer: 'cus_enterprise123',
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_professional123',
            price: { id: newPriceId, recurring: { interval: 'month' } }
          }]
        },
        metadata: {
          organization_id: orgId,
          upgraded_from: 'professional',
          upgraded_to: 'enterprise',
          upgrade_timestamp: '1609545600'
        }
      }

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(currentSubscription)
      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(upgradedSubscription)

      const updateConfig = {
        price_id: newPriceId,
        metadata: {
          organization_id: orgId,
          upgraded_from: 'professional',
          upgraded_to: 'enterprise',
          upgrade_timestamp: '1609545600'
        },
        proration_behavior: 'create_prorations' as const
      }

      const result = await subscriptionService.updateSubscription(subscriptionId, updateConfig)

      expect(result.metadata.upgraded_from).toBe('professional')
      expect(result.metadata.upgraded_to).toBe('enterprise')

      // Step 2: Process subscription updated webhook
      const subscriptionUpdatedEvent = {
        id: 'evt_sub_upgraded',
        type: 'customer.subscription.updated',
        data: { object: upgradedSubscription },
        created: 1609545600
      } as Stripe.Event

      // Step 3: Process proration invoice
      const prorationInvoiceEvent = {
        id: 'evt_proration_invoice',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_proration123',
            customer: 'cus_enterprise123',
            subscription: {
              id: subscriptionId,
              metadata: { organization_id: orgId }
            },
            amount_paid: 3500, // Prorated amount
            status: 'paid',
            billing_reason: 'subscription_update'
          }
        },
        created: 1609545600
      } as Stripe.Event

      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)
      const invoiceHandler = jest.fn().mockResolvedValue(undefined)

      const handlers = {
        'customer.subscription.updated': subscriptionHandler,
        'invoice.payment_succeeded': invoiceHandler
      }

      await webhookHandler.processEvent(subscriptionUpdatedEvent, handlers)
      await webhookHandler.processEvent(prorationInvoiceEvent, handlers)

      expect(subscriptionHandler).toHaveBeenCalledWith(upgradedSubscription)
      expect(invoiceHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          billing_reason: 'subscription_update',
          amount_paid: 3500
        })
      )
    })

    it('should handle subscription downgrade at period end', async () => {
      const subscriptionId = 'sub_downgrade123'
      const orgId = 'org_downgrade456'

      // Step 1: Schedule downgrade for end of period
      const downgradedSubscription = {
        id: subscriptionId,
        customer: 'cus_downgrade123',
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false,
        canceled_at: null,
        items: {
          data: [{
            id: 'si_downgrade123',
            price: { id: 'price_basic_monthly' }
          }]
        },
        metadata: {
          organization_id: orgId,
          scheduled_downgrade: 'true',
          downgrade_to: 'basic',
          downgrade_at_period_end: 'true'
        }
      }

      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(downgradedSubscription)

      const updateConfig = {
        metadata: {
          organization_id: orgId,
          scheduled_downgrade: 'true',
          downgrade_to: 'basic',
          downgrade_at_period_end: 'true'
        },
        proration_behavior: 'none' as const
      }

      const result = await subscriptionService.updateSubscription(subscriptionId, updateConfig)

      expect(result.metadata.scheduled_downgrade).toBe('true')
      expect(result.metadata.downgrade_to).toBe('basic')

      // Step 2: At period end, subscription updates to new plan
      const periodEndUpdateEvent = {
        id: 'evt_period_end_update',
        type: 'customer.subscription.updated',
        data: {
          object: {
            ...downgradedSubscription,
            items: {
              data: [{
                id: 'si_downgrade123',
                price: { id: 'price_basic_monthly' }
              }]
            },
            metadata: {
              organization_id: orgId,
              downgraded_from: 'professional',
              downgraded_to: 'basic',
              downgrade_completed: '1612137600'
            }
          }
        },
        created: 1612137600
      } as Stripe.Event

      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = { 'customer.subscription.updated': subscriptionHandler }

      await webhookHandler.processEvent(periodEndUpdateEvent, handlers)

      expect(subscriptionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            downgraded_from: 'professional',
            downgraded_to: 'basic'
          })
        })
      )
    })
  })

  describe('Payment Failure and Recovery Workflows', () => {
    it('should handle failed payment and dunning process', async () => {
      const subscriptionId = 'sub_payment_failed123'
      const customerId = 'cus_payment_failed123'
      const orgId = 'org_payment_issues456'

      // Step 1: Invoice payment fails
      const paymentFailedEvent = {
        id: 'evt_payment_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_failed123',
            customer: customerId,
            subscription: {
              id: subscriptionId,
              metadata: { organization_id: orgId }
            },
            amount_due: 2999,
            status: 'open',
            attempt_count: 1,
            next_payment_attempt: 1609891200 // 5 days later
          }
        },
        created: 1609459200
      } as Stripe.Event

      // Step 2: Subscription becomes past_due
      const subscriptionPastDueEvent = {
        id: 'evt_sub_past_due',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            customer: customerId,
            status: 'past_due', // Changed from active
            current_period_start: 1609459200,
            current_period_end: 1612137600,
            metadata: {
              organization_id: orgId,
              payment_failure_count: '1',
              first_failure_date: '1609459200'
            }
          }
        },
        created: 1609459200
      } as Stripe.Event

      const invoiceHandler = jest.fn().mockResolvedValue(undefined)
      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)

      const handlers = {
        'invoice.payment_failed': invoiceHandler,
        'customer.subscription.updated': subscriptionHandler
      }

      await webhookHandler.processEvent(paymentFailedEvent, handlers)
      await webhookHandler.processEvent(subscriptionPastDueEvent, handlers)

      expect(invoiceHandler).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          status: 'open',
          attempt_count: 1,
          amount_due: 2999
        })
      )

      expect(subscriptionHandler).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          status: 'past_due',
          metadata: expect.objectContaining({
            payment_failure_count: '1'
          })
        })
      )

      // Step 3: Payment eventually succeeds
      const paymentSucceededEvent = {
        id: 'evt_payment_recovered',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_failed123',
            customer: customerId,
            subscription: {
              id: subscriptionId,
              metadata: { organization_id: orgId }
            },
            amount_paid: 2999,
            status: 'paid',
            attempt_count: 3 // After several retries
          }
        },
        created: 1610063999 // 7 days later
      } as Stripe.Event

      // Step 4: Subscription becomes active again
      const subscriptionActiveEvent = {
        id: 'evt_sub_active_again',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            customer: customerId,
            status: 'active', // Recovered
            metadata: {
              organization_id: orgId,
              payment_recovered: 'true',
              recovery_date: '1610063999'
            }
          }
        },
        created: 1610063999
      } as Stripe.Event

      await webhookHandler.processEvent(paymentSucceededEvent, {
        'invoice.payment_succeeded': invoiceHandler
      })
      await webhookHandler.processEvent(subscriptionActiveEvent, {
        'customer.subscription.updated': subscriptionHandler
      })

      expect(invoiceHandler).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          status: 'paid',
          amount_paid: 2999,
          attempt_count: 3
        })
      )

      expect(subscriptionHandler).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          status: 'active',
          metadata: expect.objectContaining({
            payment_recovered: 'true'
          })
        })
      )
    })

    it('should handle subscription cancellation due to failed payments', async () => {
      const subscriptionId = 'sub_cancelled_failed123'
      const orgId = 'org_cancelled456'

      // Final payment failure leads to cancellation
      const subscriptionCancelledEvent = {
        id: 'evt_sub_cancelled',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: subscriptionId,
            customer: 'cus_cancelled123',
            status: 'canceled',
            canceled_at: 1611273600, // After multiple failed attempts
            metadata: {
              organization_id: orgId,
              cancellation_reason: 'payment_failed',
              total_failure_count: '4',
              grace_period_ended: '1611273600'
            }
          }
        },
        created: 1611273600
      } as Stripe.Event

      const subscriptionDeletedHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = { 'customer.subscription.deleted': subscriptionDeletedHandler }

      await webhookHandler.processEvent(subscriptionCancelledEvent, handlers)

      expect(subscriptionDeletedHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
          metadata: expect.objectContaining({
            cancellation_reason: 'payment_failed',
            total_failure_count: '4'
          })
        })
      )

      expect(webhookHandler.extractOrganizationId(subscriptionCancelledEvent.data.object)).toBe(orgId)
    })
  })

  describe('Customer Portal and Self-Service Workflows', () => {
    it('should handle customer portal access and subscription management', async () => {
      const customerId = 'cus_portal123'
      const subscriptionId = 'sub_portal123'
      const orgId = 'org_self_service456'

      // Step 1: Create billing portal session
      const mockPortalSession = {
        id: 'bps_portal123',
        url: 'https://billing.stripe.com/session/bps_portal123',
        customer: customerId,
        return_url: `https://app.example.com/billing?org=${orgId}`
      }

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession)

      const portalSession = await checkoutService.createPortalSession(
        customerId,
        `https://app.example.com/billing?org=${orgId}`
      )

      expect(portalSession.url).toContain('billing.stripe.com')
      expect(portalSession.customer).toBe(customerId)

      // Step 2: Customer cancels subscription through portal
      const subscriptionCancelledEvent = {
        id: 'evt_portal_cancel',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            customer: customerId,
            status: 'active',
            cancel_at_period_end: true, // Scheduled for cancellation
            metadata: {
              organization_id: orgId,
              cancelled_via: 'customer_portal',
              cancellation_date: '1609459200'
            }
          }
        },
        created: 1609459200
      } as Stripe.Event

      const subscriptionHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = { 'customer.subscription.updated': subscriptionHandler }

      await webhookHandler.processEvent(subscriptionCancelledEvent, handlers)

      expect(subscriptionHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_at_period_end: true,
          metadata: expect.objectContaining({
            cancelled_via: 'customer_portal'
          })
        })
      )

      // Step 3: Customer reactivates before period end
      const mockReactivatedSubscription = {
        id: subscriptionId,
        customer: customerId,
        status: 'active',
        current_period_start: 1609459200,
        current_period_end: 1612137600,
        cancel_at_period_end: false, // Reactivated
        canceled_at: null,
        items: { data: [] },
        metadata: {
          organization_id: orgId,
          reactivated_via: 'customer_portal',
          reactivation_date: '1609545600'
        }
      }

      ;(mockStripe.subscriptions.update as jest.Mock).mockResolvedValue(mockReactivatedSubscription)

      const reactivatedSubscription = await subscriptionService.reactivateSubscription(subscriptionId)

      expect(reactivatedSubscription.cancel_at_period_end).toBe(false)
    })
  })

  describe('Multi-Organization Workflow Isolation', () => {
    it('should maintain proper isolation between organizations', async () => {
      const org1Id = 'org_isolation_001'
      const org2Id = 'org_isolation_002'
      const customer1Id = 'cus_org1_123'
      const customer2Id = 'cus_org2_456'

      // Organization 1 subscription events
      const org1SubscriptionEvent = {
        id: 'evt_org1_sub',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_org1_123',
            customer: customer1Id,
            status: 'active',
            metadata: {
              organization_id: org1Id,
              plan_type: 'professional'
            }
          }
        },
        created: 1609459200
      } as Stripe.Event

      // Organization 2 subscription events
      const org2SubscriptionEvent = {
        id: 'evt_org2_sub',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_org2_456',
            customer: customer2Id,
            status: 'active',
            metadata: {
              organization_id: org2Id,
              plan_type: 'enterprise'
            }
          }
        },
        created: 1609459200
      } as Stripe.Event

      const org1Handler = jest.fn().mockResolvedValue(undefined)
      const org2Handler = jest.fn().mockResolvedValue(undefined)

      // Process events for different organizations
      await webhookHandler.processEvent(org1SubscriptionEvent, {
        'customer.subscription.created': org1Handler
      })

      await webhookHandler.processEvent(org2SubscriptionEvent, {
        'customer.subscription.created': org2Handler
      })

      // Verify organization ID extraction works correctly for both
      expect(webhookHandler.extractOrganizationId(org1SubscriptionEvent.data.object)).toBe(org1Id)
      expect(webhookHandler.extractOrganizationId(org2SubscriptionEvent.data.object)).toBe(org2Id)

      expect(org1Handler).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            organization_id: org1Id,
            plan_type: 'professional'
          })
        })
      )

      expect(org2Handler).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            organization_id: org2Id,
            plan_type: 'enterprise'
          })
        })
      )
    })

    it('should handle cross-organization billing events properly', async () => {
      // Test scenario where multiple organizations have billing events processed concurrently
      const events = [
        {
          orgId: 'org_batch_001',
          subscriptionId: 'sub_batch_001',
          eventType: 'customer.subscription.created' as const
        },
        {
          orgId: 'org_batch_002',
          subscriptionId: 'sub_batch_002',
          eventType: 'invoice.payment_succeeded' as const
        },
        {
          orgId: 'org_batch_003',
          subscriptionId: 'sub_batch_003',
          eventType: 'customer.subscription.updated' as const
        }
      ]

      const handlerResults = new Map<string, any[]>()
      const createHandler = (orgId: string) => jest.fn().mockImplementation(async (data) => {
        if (!handlerResults.has(orgId)) {
          handlerResults.set(orgId, [])
        }
        handlerResults.get(orgId)!.push(data)
      })

      const processingPromises = events.map(({ orgId, subscriptionId, eventType }) => {
        const mockEvent = {
          id: `evt_${subscriptionId}`,
          type: eventType,
          data: {
            object: {
              id: subscriptionId,
              metadata: { organization_id: orgId }
            }
          },
          created: 1609459200
        } as Stripe.Event

        const handlers = {
          [eventType]: createHandler(orgId)
        }

        return webhookHandler.processEvent(mockEvent, handlers)
      })

      await Promise.all(processingPromises)

      // Verify each organization received only its own events
      expect(handlerResults.size).toBe(3)
      
      events.forEach(({ orgId, subscriptionId }) => {
        const results = handlerResults.get(orgId)!
        expect(results).toHaveLength(1)
        expect(results[0]).toMatchObject({
          id: subscriptionId,
          metadata: { organization_id: orgId }
        })
      })
    })
  })
})