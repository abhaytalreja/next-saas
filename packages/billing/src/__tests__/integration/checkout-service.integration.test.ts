import Stripe from 'stripe'
import { CheckoutService } from '../../stripe/checkout-service'
import { getStripeClient } from '../../stripe/stripe-client'

// Mock Stripe for integration tests
jest.mock('../../stripe/stripe-client')

const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn()
    }
  },
  billingPortal: {
    sessions: {
      create: jest.fn()
    },
    configurations: {
      list: jest.fn(),
      create: jest.fn()
    }
  }
} as unknown as Stripe

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>
mockGetStripeClient.mockReturnValue(mockStripe)

describe('CheckoutService Integration Tests', () => {
  let checkoutService: CheckoutService
  const testCustomerId = 'cus_test123'
  const testPriceId = 'price_test123'
  const testEmail = 'test@example.com'

  beforeEach(() => {
    checkoutService = new CheckoutService()
    jest.clearAllMocks()
  })

  describe('Payment Processing Workflow', () => {
    it('should create subscription checkout session with customer', async () => {
      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
        customer: testCustomerId,
        mode: 'subscription',
        payment_status: 'unpaid'
      }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: { organization_id: 'org_123' },
        trial_period_days: 7,
        allow_promotion_codes: true,
        automatic_tax: true,
        tax_id_collection: true
      }

      const result = await checkoutService.createSubscriptionCheckout(
        testPriceId,
        testCustomerId,
        config
      )

      expect(result).toEqual(mockSession)
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer: testCustomerId,
        line_items: [{ price: testPriceId, quantity: 1 }],
        success_url: config.success_url,
        cancel_url: config.cancel_url,
        subscription_data: {
          metadata: config.metadata,
          trial_period_days: config.trial_period_days
        },
        allow_promotion_codes: true,
        automatic_tax: { enabled: true },
        tax_id_collection: { enabled: true },
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      })
    })

    it('should create subscription checkout session with email only', async () => {
      const mockSession = {
        id: 'cs_test456',
        url: 'https://checkout.stripe.com/pay/cs_test456',
        customer_email: testEmail,
        mode: 'subscription',
        payment_status: 'unpaid'
      }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: { organization_id: 'org_123' },
        trial_period_days: 14
      }

      const result = await checkoutService.createEmailCheckout(
        testPriceId,
        testEmail,
        config
      )

      expect(result).toEqual(mockSession)
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: testEmail,
        line_items: [{ price: testPriceId, quantity: 1 }],
        success_url: config.success_url,
        cancel_url: config.cancel_url,
        subscription_data: {
          metadata: config.metadata,
          trial_period_days: config.trial_period_days
        },
        allow_promotion_codes: true,
        automatic_tax: undefined,
        billing_address_collection: 'required'
      })
    })

    it('should create one-time payment checkout session', async () => {
      const amount = 5000 // $50.00
      const currency = 'usd'
      const mockSession = {
        id: 'cs_payment123',
        url: 'https://checkout.stripe.com/pay/cs_payment123',
        mode: 'payment',
        payment_status: 'unpaid'
      }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      const config = {
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        customer_id: testCustomerId,
        metadata: { order_id: 'order_123' },
        description: 'One-time consulting fee'
      }

      const result = await checkoutService.createPaymentCheckout(amount, currency, config)

      expect(result).toEqual(mockSession)
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        customer: testCustomerId,
        line_items: [{
          price_data: {
            currency,
            product_data: {
              name: 'One-time consulting fee'
            },
            unit_amount: amount
          },
          quantity: 1
        }],
        success_url: config.success_url,
        cancel_url: config.cancel_url,
        metadata: config.metadata,
        billing_address_collection: 'required'
      })
    })

    it('should retrieve checkout session with expanded data', async () => {
      const sessionId = 'cs_test123'
      const mockExpandedSession = {
        id: sessionId,
        mode: 'subscription',
        payment_status: 'paid',
        subscription: {
          id: 'sub_test123',
          status: 'active'
        },
        customer: {
          id: testCustomerId,
          email: testEmail
        }
      }

      ;(mockStripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(mockExpandedSession)

      const result = await checkoutService.getCheckoutSession(sessionId)

      expect(result).toEqual(mockExpandedSession)
      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith(sessionId, {
        expand: ['subscription', 'customer']
      })
    })
  })

  describe('Customer Portal Integration', () => {
    it('should create billing portal session', async () => {
      const returnUrl = 'https://example.com/billing'
      const mockPortalSession = {
        id: 'bps_test123',
        url: 'https://billing.stripe.com/session/bps_test123'
      }

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession)

      const result = await checkoutService.createPortalSession(testCustomerId, returnUrl)

      expect(result).toEqual(mockPortalSession)
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: testCustomerId,
        return_url: returnUrl,
        configuration: undefined
      })
    })

    it('should create portal session with custom configuration', async () => {
      const returnUrl = 'https://example.com/billing'
      const configId = 'bpc_test123'
      const mockPortalSession = {
        id: 'bps_test456',
        url: 'https://billing.stripe.com/session/bps_test456'
      }

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue(mockPortalSession)

      const result = await checkoutService.createPortalSession(testCustomerId, returnUrl, configId)

      expect(result).toEqual(mockPortalSession)
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: testCustomerId,
        return_url: returnUrl,
        configuration: configId
      })
    })

    it('should list portal configurations', async () => {
      const mockConfigurations = {
        data: [
          { id: 'bpc_1', business_profile: { headline: 'Test Portal' } },
          { id: 'bpc_2', business_profile: { headline: 'Custom Portal' } }
        ]
      }

      ;(mockStripe.billingPortal.configurations.list as jest.Mock).mockResolvedValue(mockConfigurations)

      const result = await checkoutService.listPortalConfigurations()

      expect(result).toEqual(mockConfigurations)
      expect(mockStripe.billingPortal.configurations.list).toHaveBeenCalled()
    })

    it('should create custom portal configuration', async () => {
      const config = {
        business_profile: {
          headline: 'Manage your subscription'
        },
        features: {
          payment_method_update: { enabled: true },
          invoice_history: { enabled: true }
        }
      }

      const mockConfiguration = {
        id: 'bpc_custom123',
        ...config
      }

      ;(mockStripe.billingPortal.configurations.create as jest.Mock).mockResolvedValue(mockConfiguration)

      const result = await checkoutService.createPortalConfiguration(config)

      expect(result).toEqual(mockConfiguration)
      expect(mockStripe.billingPortal.configurations.create).toHaveBeenCalledWith(config)
    })
  })

  describe('Error Handling', () => {
    it('should handle Stripe API errors during checkout creation', async () => {
      const stripeError = new Error('Your card was declined.') as any
      stripeError.type = 'card_error'
      stripeError.code = 'card_declined'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(stripeError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout(testPriceId, testCustomerId, config)
      ).rejects.toThrow('Your card was declined.')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed')
      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(networkError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout(testPriceId, testCustomerId, config)
      ).rejects.toThrow('Network request failed')
    })
  })

  describe('Multi-tenant Workflow', () => {
    it('should handle organization metadata in checkout session', async () => {
      const orgId = 'org_enterprise123'
      const mockSession = {
        id: 'cs_org123',
        url: 'https://checkout.stripe.com/pay/cs_org123'
      }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      const config = {
        success_url: `https://example.com/success?org=${orgId}`,
        cancel_url: `https://example.com/cancel?org=${orgId}`,
        metadata: {
          organization_id: orgId,
          environment: 'production',
          plan_type: 'enterprise'
        },
        trial_period_days: 30
      }

      await checkoutService.createSubscriptionCheckout(testPriceId, testCustomerId, config)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: expect.objectContaining({
            metadata: {
              organization_id: orgId,
              environment: 'production',
              plan_type: 'enterprise'
            }
          })
        })
      )
    })

    it('should support different billing intervals for organizations', async () => {
      const mockSession = { id: 'cs_interval123' }
      ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue(mockSession)

      // Test yearly billing
      const yearlyConfig = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          billing_interval: 'yearly',
          discount_applied: 'true'
        }
      }

      await checkoutService.createSubscriptionCheckout('price_yearly_123', testCustomerId, yearlyConfig)

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_yearly_123', quantity: 1 }],
          subscription_data: expect.objectContaining({
            metadata: expect.objectContaining({
              billing_interval: 'yearly',
              discount_applied: 'true'
            })
          })
        })
      )
    })
  })
})