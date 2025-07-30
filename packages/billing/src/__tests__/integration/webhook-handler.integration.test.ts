import Stripe from 'stripe'
import { WebhookHandler } from '../../stripe/webhook-handler'
import { getStripeClient } from '../../stripe/stripe-client'
import type { SupportedWebhookEvents } from '../../types'

// Mock Stripe for integration tests
jest.mock('../../stripe/stripe-client')

const mockStripe = {
  webhooks: {
    constructEvent: jest.fn()
  },
  webhookEndpoints: {
    retrieve: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    del: jest.fn()
  }
} as unknown as Stripe

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>
mockGetStripeClient.mockReturnValue(mockStripe)

describe('WebhookHandler Integration Tests', () => {
  let webhookHandler: WebhookHandler
  const testWebhookSecret = 'whsec_test123'
  
  // Mock environment
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, STRIPE_WEBHOOK_SECRET: testWebhookSecret }
    webhookHandler = new WebhookHandler()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('Webhook Event Construction and Validation', () => {
    it('should construct event from valid payload and signature', () => {
      const payload = JSON.stringify({ type: 'customer.subscription.created' })
      const signature = 'valid_signature'
      const mockEvent = {
        id: 'evt_test123',
        type: 'customer.subscription.created',
        data: { object: {} },
        created: 1609459200
      } as Stripe.Event

      ;(mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      const result = webhookHandler.constructEvent(payload, signature)

      expect(result).toEqual(mockEvent)
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        testWebhookSecret
      )
    })

    it('should validate webhook signature correctly', () => {
      const payload = JSON.stringify({ type: 'invoice.payment_succeeded' })
      const validSignature = 'valid_signature'
      const invalidSignature = 'invalid_signature'

      ;(mockStripe.webhooks.constructEvent as jest.Mock)
        .mockReturnValueOnce({ id: 'evt_valid' })
        .mockImplementationOnce(() => {
          throw new Error('Invalid signature')
        })

      expect(webhookHandler.validateSignature(payload, validSignature)).toBe(true)
      expect(webhookHandler.validateSignature(payload, invalidSignature)).toBe(false)
    })

    it('should throw error when webhook secret is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      expect(() => new WebhookHandler()).toThrow('Stripe webhook secret is required')
    })

    it('should use custom webhook secret when provided', () => {
      const customSecret = 'whsec_custom123'
      const customHandler = new WebhookHandler(customSecret)
      const payload = 'test payload'
      const signature = 'test signature'

      customHandler.constructEvent(payload, signature)

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        customSecret
      )
    })
  })

  describe('Event Processing Workflows', () => {
    it('should process subscription created webhook', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active',
        metadata: {
          organization_id: 'org_123'
        }
      }

      const mockEvent = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: { object: mockSubscription },
        created: 1609459200
      } as Stripe.Event

      const mockHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = {
        'customer.subscription.created': mockHandler
      }

      await webhookHandler.processEvent(mockEvent, handlers)

      expect(mockHandler).toHaveBeenCalledWith(mockSubscription)
    })

    it('should process invoice payment succeeded webhook', async () => {
      const mockInvoice = {
        id: 'in_test123',
        customer: 'cus_test123',
        status: 'paid',
        amount_paid: 2999,
        subscription: 'sub_test123',
        metadata: {
          organization_id: 'org_123'
        }
      }

      const mockEvent = {
        id: 'evt_invoice_paid',
        type: 'invoice.payment_succeeded',
        data: { object: mockInvoice },
        created: 1609459200
      } as Stripe.Event

      const mockHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = {
        'invoice.payment_succeeded': mockHandler
      }

      await webhookHandler.processEvent(mockEvent, handlers)

      expect(mockHandler).toHaveBeenCalledWith(mockInvoice)
    })

    it('should process invoice payment failed webhook', async () => {
      const mockInvoice = {
        id: 'in_failed123',
        customer: 'cus_test123',
        status: 'open',
        amount_due: 2999,
        subscription: 'sub_test123',
        metadata: {
          organization_id: 'org_123'
        }
      }

      const mockEvent = {
        id: 'evt_invoice_failed',
        type: 'invoice.payment_failed',
        data: { object: mockInvoice },
        created: 1609459200
      } as Stripe.Event

      const mockHandler = jest.fn().mockResolvedValue(undefined)
      const handlers = {
        'invoice.payment_failed': mockHandler
      }

      await webhookHandler.processEvent(mockEvent, handlers)

      expect(mockHandler).toHaveBeenCalledWith(mockInvoice)
    })

    it('should handle customer lifecycle webhooks', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        metadata: {
          organization_id: 'org_123',
          user_id: 'user_123'
        }
      }

      const customerCreatedEvent = {
        id: 'evt_cust_created',
        type: 'customer.created',
        data: { object: mockCustomer },
        created: 1609459200
      } as Stripe.Event

      const customerUpdatedEvent = {
        id: 'evt_cust_updated',
        type: 'customer.updated',
        data: { object: { ...mockCustomer, email: 'updated@example.com' } },
        created: 1609459200
      } as Stripe.Event

      const customerDeletedEvent = {
        id: 'evt_cust_deleted',
        type: 'customer.deleted',
        data: { object: mockCustomer },
        created: 1609459200
      } as Stripe.Event

      const createdHandler = jest.fn().mockResolvedValue(undefined)
      const updatedHandler = jest.fn().mockResolvedValue(undefined)
      const deletedHandler = jest.fn().mockResolvedValue(undefined)

      const handlers = {
        'customer.created': createdHandler,
        'customer.updated': updatedHandler,
        'customer.deleted': deletedHandler
      }

      await webhookHandler.processEvent(customerCreatedEvent, handlers)
      await webhookHandler.processEvent(customerUpdatedEvent, handlers)
      await webhookHandler.processEvent(customerDeletedEvent, handlers)

      expect(createdHandler).toHaveBeenCalledWith(mockCustomer)
      expect(updatedHandler).toHaveBeenCalledWith({ ...mockCustomer, email: 'updated@example.com' })
      expect(deletedHandler).toHaveBeenCalledWith(mockCustomer)
    })

    it('should handle unregistered webhook events gracefully', async () => {
      const mockEvent = {
        id: 'evt_unhandled',
        type: 'charge.dispute.created',
        data: { object: {} },
        created: 1609459200
      } as Stripe.Event

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await webhookHandler.processEvent(mockEvent, {})

      expect(consoleSpy).toHaveBeenCalledWith('Unhandled webhook event type: charge.dispute.created')
      consoleSpy.mockRestore()
    })

    it('should use default handlers with callbacks', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active'
      }

      const mockEvent = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: { object: mockSubscription },
        created: 1609459200
      } as Stripe.Event

      const onSubscriptionCreated = jest.fn().mockResolvedValue(undefined)
      const defaultHandlers = webhookHandler.getDefaultHandlers({
        onSubscriptionCreated
      })

      await webhookHandler.processEvent(mockEvent, defaultHandlers)

      expect(onSubscriptionCreated).toHaveBeenCalledWith(mockSubscription)
    })
  })

  describe('Multi-tenant Organization ID Extraction', () => {
    it('should extract organization ID from subscription metadata', () => {
      const webhookData = {
        id: 'sub_test123',
        metadata: {
          organization_id: 'org_enterprise123',
          plan_type: 'enterprise'
        }
      }

      const orgId = webhookHandler.extractOrganizationId(webhookData)

      expect(orgId).toBe('org_enterprise123')
    })

    it('should extract organization ID from customer metadata', () => {
      const webhookData = {
        id: 'cus_test123',
        customer: {
          metadata: {
            organization_id: 'org_startup456',
            tier: 'startup'
          }
        }
      }

      const orgId = webhookHandler.extractOrganizationId(webhookData)

      expect(orgId).toBe('org_startup456')
    })

    it('should extract organization ID from invoice subscription metadata', () => {
      const webhookData = {
        id: 'in_test123',
        subscription: {
          metadata: {
            organization_id: 'org_professional789',
            billing_interval: 'monthly'
          }
        }
      }

      const orgId = webhookHandler.extractOrganizationId(webhookData)

      expect(orgId).toBe('org_professional789')
    })

    it('should return null when no organization ID is found', () => {
      const webhookData = {
        id: 'obj_test123',
        metadata: {
          user_id: 'user_123',
          plan_type: 'basic'
        }
      }

      const orgId = webhookHandler.extractOrganizationId(webhookData)

      expect(orgId).toBeNull()
    })

    it('should prioritize direct metadata over nested metadata', () => {
      const webhookData = {
        id: 'sub_test123',
        metadata: {
          organization_id: 'org_direct123'
        },
        customer: {
          metadata: {
            organization_id: 'org_nested456'
          }
        }
      }

      const orgId = webhookHandler.extractOrganizationId(webhookData)

      expect(orgId).toBe('org_direct123')
    })
  })

  describe('Webhook Endpoint Management', () => {
    it('should retrieve webhook endpoint information', async () => {
      const endpointId = 'we_test123'
      const mockEndpoint = {
        id: endpointId,
        url: 'https://example.com/webhooks/stripe',
        enabled_events: ['customer.subscription.created', 'invoice.payment_succeeded'],
        status: 'enabled'
      }

      ;(mockStripe.webhookEndpoints.retrieve as jest.Mock).mockResolvedValue(mockEndpoint)

      const result = await webhookHandler.getWebhookEndpoint(endpointId)

      expect(result).toEqual(mockEndpoint)
      expect(mockStripe.webhookEndpoints.retrieve).toHaveBeenCalledWith(endpointId)
    })

    it('should list all webhook endpoints', async () => {
      const mockEndpoints = {
        data: [
          {
            id: 'we_1',
            url: 'https://example.com/webhooks/stripe',
            enabled_events: ['customer.subscription.created']
          },
          {
            id: 'we_2',
            url: 'https://staging.example.com/webhooks/stripe',
            enabled_events: ['invoice.payment_succeeded']
          }
        ]
      }

      ;(mockStripe.webhookEndpoints.list as jest.Mock).mockResolvedValue(mockEndpoints)

      const result = await webhookHandler.listWebhookEndpoints()

      expect(result).toEqual(mockEndpoints)
      expect(mockStripe.webhookEndpoints.list).toHaveBeenCalled()
    })

    it('should create new webhook endpoint', async () => {
      const url = 'https://example.com/webhooks/stripe'
      const enabledEvents: SupportedWebhookEvents[] = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'invoice.payment_succeeded'
      ]
      const description = 'NextSaaS Production Webhooks'

      const mockEndpoint = {
        id: 'we_new123',
        url,
        enabled_events: enabledEvents,
        description
      }

      ;(mockStripe.webhookEndpoints.create as jest.Mock).mockResolvedValue(mockEndpoint)

      const result = await webhookHandler.createWebhookEndpoint(url, enabledEvents, description)

      expect(result).toEqual(mockEndpoint)
      expect(mockStripe.webhookEndpoints.create).toHaveBeenCalledWith({
        url,
        enabled_events: enabledEvents,
        description
      })
    })

    it('should delete webhook endpoint', async () => {
      const endpointId = 'we_delete123'
      const mockDeletedEndpoint = {
        id: endpointId,
        deleted: true
      }

      ;(mockStripe.webhookEndpoints.del as jest.Mock).mockResolvedValue(mockDeletedEndpoint)

      const result = await webhookHandler.deleteWebhookEndpoint(endpointId)

      expect(result).toEqual(mockDeletedEndpoint)
      expect(mockStripe.webhookEndpoints.del).toHaveBeenCalledWith(endpointId)
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle webhook processing errors and rethrow', async () => {
      const mockEvent = {
        id: 'evt_error',
        type: 'customer.subscription.created',
        data: { object: {} },
        created: 1609459200
      } as Stripe.Event

      const errorHandler = jest.fn().mockRejectedValue(new Error('Database connection failed'))
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const handlers = {
        'customer.subscription.created': errorHandler
      }

      await expect(webhookHandler.processEvent(mockEvent, handlers)).rejects.toThrow('Database connection failed')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing webhook customer.subscription.created:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle Stripe signature validation errors', () => {
      const payload = 'invalid payload'
      const signature = 'invalid signature'

      ;(mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      expect(() => webhookHandler.constructEvent(payload, signature)).toThrow('Invalid signature')
    })

    it('should handle malformed webhook data gracefully', () => {
      const malformedData = {
        // Missing expected fields
        id: 'obj_malformed'
      }

      const orgId = webhookHandler.extractOrganizationId(malformedData)

      expect(orgId).toBeNull()
    })
  })

  describe('Complex Webhook Scenarios', () => {
    it('should process subscription lifecycle with organization context', async () => {
      const orgId = 'org_lifecycle123'
      
      // Subscription created
      const subscriptionCreated = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_lifecycle123',
            customer: 'cus_test123',
            metadata: { organization_id: orgId }
          }
        },
        created: 1609459200
      } as Stripe.Event

      // Subscription updated (plan change)
      const subscriptionUpdated = {
        id: 'evt_sub_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_lifecycle123',
            customer: 'cus_test123',
            metadata: { 
              organization_id: orgId,
              plan_changed: 'true',
              previous_plan: 'basic',
              current_plan: 'professional'
            }
          }
        },
        created: 1609459300
      } as Stripe.Event

      // Invoice payment succeeded
      const invoicePaymentSucceeded = {
        id: 'evt_invoice_paid',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_lifecycle123',
            subscription: {
              metadata: { organization_id: orgId }
            },
            amount_paid: 4999
          }
        },
        created: 1609459400
      } as Stripe.Event

      const subscriptionCreatedHandler = jest.fn().mockResolvedValue(undefined)
      const subscriptionUpdatedHandler = jest.fn().mockResolvedValue(undefined)
      const invoiceSucceededHandler = jest.fn().mockResolvedValue(undefined)

      const handlers = {
        'customer.subscription.created': subscriptionCreatedHandler,
        'customer.subscription.updated': subscriptionUpdatedHandler,
        'invoice.payment_succeeded': invoiceSucceededHandler
      }

      await webhookHandler.processEvent(subscriptionCreated, handlers)
      await webhookHandler.processEvent(subscriptionUpdated, handlers)
      await webhookHandler.processEvent(invoicePaymentSucceeded, handlers)

      expect(subscriptionCreatedHandler).toHaveBeenCalledTimes(1)
      expect(subscriptionUpdatedHandler).toHaveBeenCalledTimes(1)
      expect(invoiceSucceededHandler).toHaveBeenCalledTimes(1)

      // Verify organization ID extraction works for all events
      expect(webhookHandler.extractOrganizationId(subscriptionCreated.data.object)).toBe(orgId)
      expect(webhookHandler.extractOrganizationId(subscriptionUpdated.data.object)).toBe(orgId)
      expect(webhookHandler.extractOrganizationId(invoicePaymentSucceeded.data.object)).toBe(orgId)
    })

    it('should handle concurrent webhook processing', async () => {
      const createEventOfType = (type: SupportedWebhookEvents, id: string) => ({
        id: `evt_${id}`,
        type,
        data: { object: { id, metadata: { organization_id: 'org_concurrent' } } },
        created: 1609459200
      } as Stripe.Event)

      const events = [
        createEventOfType('customer.subscription.created', 'sub_1'),
        createEventOfType('customer.subscription.updated', 'sub_2'),
        createEventOfType('invoice.payment_succeeded', 'inv_1'),
        createEventOfType('customer.created', 'cus_1'),
        createEventOfType('customer.updated', 'cus_2')
      ]

      const handlerCallCounts = new Map<string, number>()
      const createHandler = (eventType: string) => 
        jest.fn().mockImplementation(async () => {
          handlerCallCounts.set(eventType, (handlerCallCounts.get(eventType) || 0) + 1)
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 10))
        })

      const handlers = {
        'customer.subscription.created': createHandler('subscription.created'),
        'customer.subscription.updated': createHandler('subscription.updated'),
        'invoice.payment_succeeded': createHandler('invoice.succeeded'),
        'customer.created': createHandler('customer.created'),
        'customer.updated': createHandler('customer.updated')
      }

      // Process all events concurrently
      const processingPromises = events.map(event => 
        webhookHandler.processEvent(event, handlers)
      )

      await Promise.all(processingPromises)

      // Verify all handlers were called
      expect(handlerCallCounts.get('subscription.created')).toBe(1)
      expect(handlerCallCounts.get('subscription.updated')).toBe(1)
      expect(handlerCallCounts.get('invoice.succeeded')).toBe(1)
      expect(handlerCallCounts.get('customer.created')).toBe(1)
      expect(handlerCallCounts.get('customer.updated')).toBe(1)
    })
  })
})