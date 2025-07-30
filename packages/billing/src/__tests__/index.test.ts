import * as billing from '../index'

describe('Main billing module exports', () => {
  it('should export all sub-modules', () => {
    expect(typeof billing).toBe('object')
    expect(billing).toBeDefined()
  })

  it('should have stripe exports', () => {
    expect(billing.getStripeClient).toBeDefined()
    expect(billing.CheckoutService).toBeDefined()
    expect(billing.SubscriptionService).toBeDefined()
    expect(billing.CustomerService).toBeDefined()
    expect(billing.WebhookHandler).toBeDefined()
  })

  it('should have pricing exports', () => {
    expect(billing.PricingService).toBeDefined()
  })

  it('should have usage exports', () => {
    expect(billing.UsageTracker).toBeDefined()
    expect(billing.QuotaEnforcer).toBeDefined()
  })

  it('should have component exports', () => {
    expect(billing.BillingDashboard).toBeDefined()
    expect(billing.CheckoutButton).toBeDefined()
    expect(billing.PricingTable).toBeDefined()
    expect(billing.SubscriptionStatus).toBeDefined()
    expect(billing.UsageDashboard).toBeDefined()
  })

  it('should have gating exports', () => {
    expect(billing.FeatureGate).toBeDefined()
    expect(billing.PlanChecker).toBeDefined()
    expect(billing.SubscriptionGuard).toBeDefined()
  })

  it('should have hook exports', () => {
    expect(billing.useBillingSubscription).toBeDefined()
    expect(billing.useBillingCustomer).toBeDefined()
    expect(billing.useCheckout).toBeDefined()
    expect(billing.usePlanFeatures).toBeDefined()
    expect(billing.useUsageTracking).toBeDefined()
  })
})