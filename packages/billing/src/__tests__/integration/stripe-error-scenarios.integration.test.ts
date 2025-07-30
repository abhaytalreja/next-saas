import Stripe from 'stripe'
import { CheckoutService } from '../../stripe/checkout-service'
import { SubscriptionService } from '../../stripe/subscription-service'
import { WebhookHandler } from '../../stripe/webhook-handler'
import { getStripeClient } from '../../stripe/stripe-client'

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
  webhookEndpoints: { retrieve: jest.fn(), list: jest.fn() }
} as unknown as Stripe

const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>
mockGetStripeClient.mockReturnValue(mockStripe)

describe('Stripe Error Scenarios Integration Tests', () => {
  let checkoutService: CheckoutService
  let subscriptionService: SubscriptionService
  let webhookHandler: WebhookHandler

  beforeEach(() => {
    checkoutService = new CheckoutService()
    subscriptionService = new SubscriptionService()
    webhookHandler = new WebhookHandler('whsec_test123')
    jest.clearAllMocks()
  })

  describe('Payment Processing Error Scenarios', () => {
    it('should handle card declined errors during checkout', async () => {
      const cardDeclinedError = new Error('Your card was declined.') as any
      cardDeclinedError.type = 'card_error'
      cardDeclinedError.code = 'card_declined'
      cardDeclinedError.decline_code = 'generic_decline'
      cardDeclinedError.payment_method = { type: 'card' }

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(cardDeclinedError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout('price_test123', 'cus_test123', config)
      ).rejects.toMatchObject({
        type: 'card_error',
        code: 'card_declined',
        decline_code: 'generic_decline'
      })
    })

    it('should handle insufficient funds errors', async () => {
      const insufficientFundsError = new Error('Your card has insufficient funds.') as any
      insufficientFundsError.type = 'card_error'
      insufficientFundsError.code = 'card_declined'
      insufficientFundsError.decline_code = 'insufficient_funds'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(insufficientFundsError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout('price_test123', 'cus_test123', config)
      ).rejects.toMatchObject({
        type: 'card_error',
        code: 'card_declined',
        decline_code: 'insufficient_funds'
      })
    })

    it('should handle expired card errors', async () => {
      const expiredCardError = new Error('Your card has expired.') as any
      expiredCardError.type = 'card_error'
      expiredCardError.code = 'expired_card'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(expiredCardError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createPaymentCheckout(5000, 'usd', config)
      ).rejects.toMatchObject({
        type: 'card_error',
        code: 'expired_card'
      })
    })

    it('should handle incorrect CVC errors', async () => {
      const incorrectCvcError = new Error('Your card\'s security code is incorrect.') as any
      incorrectCvcError.type = 'card_error'
      incorrectCvcError.code = 'incorrect_cvc'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(incorrectCvcError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createEmailCheckout('price_test123', 'test@example.com', config)
      ).rejects.toMatchObject({
        type: 'card_error',
        code: 'incorrect_cvc'
      })
    })

    it('should handle processing errors from payment processor', async () => {
      const processingError = new Error('An error occurred while processing your card.') as any
      processingError.type = 'card_error'
      processingError.code = 'processing_error'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(processingError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout('price_test123', 'cus_test123', config)
      ).rejects.toMatchObject({
        type: 'card_error',
        code: 'processing_error'
      })
    })
  })

  describe('Subscription Management Error Scenarios', () => {
    it('should handle customer not found errors', async () => {
      const customerNotFoundError = new Error('No such customer: cus_invalid') as any
      customerNotFoundError.type = 'invalid_request_error'
      customerNotFoundError.code = 'resource_missing'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(customerNotFoundError)

      await expect(
        subscriptionService.createSubscription('cus_invalid', 'price_test123')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })

    it('should handle price not found errors', async () => {
      const priceNotFoundError = new Error('No such price: price_invalid') as any
      priceNotFoundError.type = 'invalid_request_error'
      priceNotFoundError.code = 'resource_missing'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(priceNotFoundError)

      await expect(
        subscriptionService.createSubscription('cus_test123', 'price_invalid')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })

    it('should handle subscription not found during retrieval', async () => {
      const subscriptionNotFoundError = new Error('No such subscription: sub_invalid') as any
      subscriptionNotFoundError.message = 'No such subscription: sub_invalid'

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockRejectedValue(subscriptionNotFoundError)

      const result = await subscriptionService.getSubscription('sub_invalid')

      expect(result).toBeNull()
    })

    it('should handle subscription already canceled errors', async () => {
      const alreadyCanceledError = new Error('This subscription has already been canceled.') as any
      alreadyCanceledError.type = 'invalid_request_error'
      alreadyCanceledError.code = 'resource_invalid_state'

      ;(mockStripe.subscriptions.cancel as jest.Mock).mockRejectedValue(alreadyCanceledError)

      await expect(
        subscriptionService.cancelSubscription('sub_already_canceled', false)
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_invalid_state'
      })
    })

    it('should handle customer without payment method errors', async () => {
      const noPaymentMethodError = new Error('This customer has no attached payment source or default payment method.') as any
      noPaymentMethodError.type = 'invalid_request_error'
      noPaymentMethodError.code = 'resource_missing'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(noPaymentMethodError)

      await expect(
        subscriptionService.createSubscription('cus_no_payment_method', 'price_test123')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })

    it('should handle incomplete subscription creation', async () => {
      const incompleteSubscription = {
        id: 'sub_incomplete123',
        customer: 'cus_test123',
        status: 'incomplete',
        latest_invoice: {
          payment_intent: {
            status: 'requires_payment_method'
          }
        }
      }

      ;(mockStripe.subscriptions.create as jest.Mock).mockResolvedValue(incompleteSubscription)

      const result = await subscriptionService.createSubscription('cus_test123', 'price_test123')

      expect(result.status).toBe('incomplete')
      expect(result.id).toBe('sub_incomplete123')
    })
  })

  describe('Billing Portal Error Scenarios', () => {
    it('should handle customer not found in portal creation', async () => {
      const customerNotFoundError = new Error('No such customer: cus_invalid') as any
      customerNotFoundError.type = 'invalid_request_error'
      customerNotFoundError.code = 'resource_missing'

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(customerNotFoundError)

      await expect(
        checkoutService.createPortalSession('cus_invalid', 'https://example.com/return')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })

    it('should handle invalid return URL errors', async () => {
      const invalidUrlError = new Error('Invalid return_url: must be a valid URL.') as any
      invalidUrlError.type = 'invalid_request_error'
      invalidUrlError.param = 'return_url'

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(invalidUrlError)

      await expect(
        checkoutService.createPortalSession('cus_test123', 'invalid-url')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        param: 'return_url'
      })
    })

    it('should handle billing portal configuration not found', async () => {
      const configNotFoundError = new Error('No such configuration: bpc_invalid') as any
      configNotFoundError.type = 'invalid_request_error'
      configNotFoundError.code = 'resource_missing'

      ;(mockStripe.billingPortal.sessions.create as jest.Mock).mockRejectedValue(configNotFoundError)

      await expect(
        checkoutService.createPortalSession('cus_test123', 'https://example.com/return', 'bpc_invalid')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })
  })

  describe('Webhook Processing Error Scenarios', () => {
    it('should handle invalid webhook signature', () => {
      const invalidSignatureError = new Error('Invalid signature.') as any
      invalidSignatureError.type = 'StripeSignatureVerificationError'

      ;(mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw invalidSignatureError
      })

      expect(() => {
        webhookHandler.constructEvent('payload', 'invalid_signature')
      }).toThrow('Invalid signature.')
    })

    it('should handle malformed webhook payload', () => {
      const malformedPayloadError = new Error('Invalid JSON in request body.') as any
      malformedPayloadError.type = 'StripeInvalidRequestError'

      ;(mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw malformedPayloadError
      })

      expect(() => {
        webhookHandler.constructEvent('invalid_json', 'signature')
      }).toThrow('Invalid JSON in request body.')
    })

    it('should handle webhook event processing failures', async () => {
      const mockEvent = {
        id: 'evt_test123',
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_test123' } },
        created: 1609459200
      } as Stripe.Event

      const processingError = new Error('Database connection failed')
      const failingHandler = jest.fn().mockRejectedValue(processingError)
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const handlers = {
        'customer.subscription.created': failingHandler
      }

      await expect(
        webhookHandler.processEvent(mockEvent, handlers)
      ).rejects.toThrow('Database connection failed')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing webhook customer.subscription.created:',
        processingError
      )

      consoleSpy.mockRestore()
    })

    it('should handle webhook endpoint retrieval errors', async () => {
      const endpointNotFoundError = new Error('No such webhook endpoint: we_invalid') as any
      endpointNotFoundError.type = 'invalid_request_error'
      endpointNotFoundError.code = 'resource_missing'

      ;(mockStripe.webhookEndpoints.retrieve as jest.Mock).mockRejectedValue(endpointNotFoundError)

      await expect(
        webhookHandler.getWebhookEndpoint('we_invalid')
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_missing'
      })
    })
  })

  describe('Network and API Error Scenarios', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout') as any
      timeoutError.type = 'StripeConnectionError'
      timeoutError.code = 'network_error'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(timeoutError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createSubscriptionCheckout('price_test123', 'cus_test123', config)
      ).rejects.toMatchObject({
        type: 'StripeConnectionError',
        code: 'network_error'
      })
    })

    it('should handle API key authentication errors', async () => {
      const authError = new Error('Invalid API Key provided') as any
      authError.type = 'authentication_error'
      authError.code = 'api_key_invalid'

      ;(mockStripe.subscriptions.list as jest.Mock).mockRejectedValue(authError)

      await expect(
        subscriptionService.getCustomerSubscriptions('cus_test123')
      ).rejects.toMatchObject({
        type: 'authentication_error',
        code: 'api_key_invalid'
      })
    })

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Too many requests in a short period of time.') as any
      rateLimitError.type = 'rate_limit_error'
      rateLimitError.headers = { 'retry-after': '60' }

      ;(mockStripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValue(rateLimitError)

      await expect(
        checkoutService.getCheckoutSession('cs_test123')
      ).rejects.toMatchObject({
        type: 'rate_limit_error'
      })
    })

    it('should handle Stripe API unavailable errors', async () => {
      const apiUnavailableError = new Error('Stripe is temporarily unavailable.') as any
      apiUnavailableError.type = 'api_error'
      apiUnavailableError.statusCode = 503

      ;(mockStripe.subscriptions.update as jest.Mock).mockRejectedValue(apiUnavailableError)

      await expect(
        subscriptionService.updateSubscription('sub_test123', { metadata: { test: 'value' } })
      ).rejects.toMatchObject({
        type: 'api_error',
        statusCode: 503
      })
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle extremely large amounts in payment checkout', async () => {
      const largeAmountError = new Error('Amount must be no more than $999,999.99.') as any
      largeAmountError.type = 'invalid_request_error'
      largeAmountError.param = 'amount'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(largeAmountError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createPaymentCheckout(10000000, 'usd', config) // $100,000
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        param: 'amount'
      })
    })

    it('should handle invalid currency codes', async () => {
      const invalidCurrencyError = new Error('Invalid currency: xyz') as any
      invalidCurrencyError.type = 'invalid_request_error'
      invalidCurrencyError.param = 'currency'

      ;(mockStripe.checkout.sessions.create as jest.Mock).mockRejectedValue(invalidCurrencyError)

      const config = {
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel'
      }

      await expect(
        checkoutService.createPaymentCheckout(1000, 'xyz', config)
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        param: 'currency'
      })
    })

    it('should handle metadata size limits', async () => {
      const metadataTooLargeError = new Error('Metadata is too large.') as any
      metadataTooLargeError.type = 'invalid_request_error'
      metadataTooLargeError.param = 'metadata'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(metadataTooLargeError)

      const largeMetadata = {}
      // Create metadata that exceeds Stripe's 500 character limit per value
      for (let i = 0; i < 10; i++) {
        largeMetadata[`key_${i}`] = 'x'.repeat(600)
      }

      await expect(
        subscriptionService.createSubscription('cus_test123', 'price_test123', {
          metadata: largeMetadata
        })
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        param: 'metadata'
      })
    })

    it('should handle concurrent subscription modifications', async () => {
      const currentSubscription = {
        id: 'sub_test123',
        items: {
          data: [{
            id: 'si_test123',
            price: { id: 'price_old123' }
          }]
        }
      }

      const concurrencyError = new Error('This subscription has been modified since you last retrieved it.') as any
      concurrencyError.type = 'invalid_request_error'
      concurrencyError.code = 'resource_invalid_state'

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(currentSubscription)
      ;(mockStripe.subscriptions.update as jest.Mock).mockRejectedValue(concurrencyError)

      await expect(
        subscriptionService.updateSubscription('sub_test123', {
          price_id: 'price_new123'
        })
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        code: 'resource_invalid_state'
      })
    })

    it('should handle trial period edge cases', async () => {
      const trialTooLongError = new Error('Trial period cannot exceed 365 days.') as any
      trialTooLongError.type = 'invalid_request_error'
      trialTooLongError.param = 'trial_period_days'

      ;(mockStripe.subscriptions.create as jest.Mock).mockRejectedValue(trialTooLongError)

      await expect(
        subscriptionService.createSubscription('cus_test123', 'price_test123', {
          trial_period_days: 400 // Exceeds 365 day limit
        })
      ).rejects.toMatchObject({
        type: 'invalid_request_error',
        param: 'trial_period_days'
      })
    })
  })

  describe('Multi-tenant Error Scenarios', () => {
    it('should handle organization isolation failures', async () => {
      // Simulate attempting to access a subscription from another organization
      const unauthorizedAccessError = new Error('No such subscription: sub_other_org') as any
      unauthorizedAccessError.type = 'invalid_request_error'
      unauthorizedAccessError.code = 'resource_missing'

      ;(mockStripe.subscriptions.retrieve as jest.Mock).mockRejectedValue(unauthorizedAccessError)

      const result = await subscriptionService.getSubscription('sub_other_org')

      expect(result).toBeNull()
    })

    it('should handle organization metadata corruption', () => {
      const corruptedWebhookData = {
        id: 'sub_corrupted123',
        metadata: {
          organization_id: null, // Corrupted metadata
          plan_type: 'professional'
        }
      }

      const orgId = webhookHandler.extractOrganizationId(corruptedWebhookData)

      expect(orgId).toBeNull()
    })

    it('should handle missing organization context in webhooks', async () => {
      const mockEvent = {
        id: 'evt_no_org',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_no_org123',
            customer: 'cus_test123',
            metadata: {} // No organization_id
          }
        },
        created: 1609459200
      } as Stripe.Event

      const handler = jest.fn().mockResolvedValue(undefined)
      const handlers = { 'customer.subscription.created': handler }

      await webhookHandler.processEvent(mockEvent, handlers)

      // Webhook should still process, but organization extraction should return null
      expect(handler).toHaveBeenCalledWith(mockEvent.data.object)
      expect(webhookHandler.extractOrganizationId(mockEvent.data.object)).toBeNull()
    })
  })
})