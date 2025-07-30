import { getStripeClient, validateStripeConfig } from '../stripe/stripe-client'

// Mock environment variables
const originalEnv = process.env

describe('StripeClient', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('validateStripeConfig', () => {
    it('should return true when all required env vars are present', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'

      expect(validateStripeConfig()).toBe(true)
    })

    it('should return false when stripe secret key is missing', () => {
      delete process.env.STRIPE_SECRET_KEY
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'

      expect(validateStripeConfig()).toBe(false)
    })

    it('should return false when publishable key is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'

      expect(validateStripeConfig()).toBe(false)
    })

    it('should return false when webhook secret is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'
      delete process.env.STRIPE_WEBHOOK_SECRET

      expect(validateStripeConfig()).toBe(false)
    })
  })

  describe('getStripeClient', () => {
    it('should throw error when secret key is missing', () => {
      delete process.env.STRIPE_SECRET_KEY

      expect(() => getStripeClient()).toThrow('Stripe secret key is required')
    })

    it('should create stripe client with provided config', () => {
      const config = {
        secret_key: 'sk_test_custom',
        publishable_key: 'pk_test_custom',
        webhook_secret: 'whsec_custom'
      }

      expect(() => getStripeClient(config)).not.toThrow()
    })
  })
})