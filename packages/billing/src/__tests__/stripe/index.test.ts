import * as stripe from '../../stripe'

describe('Stripe module exports', () => {
  it('should export all stripe-related functions and classes', () => {
    expect(typeof stripe).toBe('object')
    expect(stripe).toBeDefined()
  })

  it('should have getStripeClient', () => {
    expect(stripe.getStripeClient).toBeDefined()
    expect(typeof stripe.getStripeClient).toBe('function')
  })

  it('should have CheckoutService', () => {
    expect(stripe.CheckoutService).toBeDefined()
    expect(typeof stripe.CheckoutService).toBe('function')
  })

  it('should have SubscriptionService', () => {
    expect(stripe.SubscriptionService).toBeDefined()
    expect(typeof stripe.SubscriptionService).toBe('function')
  })

  it('should have CustomerService', () => {
    expect(stripe.CustomerService).toBeDefined()
    expect(typeof stripe.CustomerService).toBe('function')
  })

  it('should have WebhookHandler', () => {
    expect(stripe.WebhookHandler).toBeDefined()
    expect(typeof stripe.WebhookHandler).toBe('function')
  })
})