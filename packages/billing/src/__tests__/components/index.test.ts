import * as components from '../../components'

describe('Components module exports', () => {
  it('should export all component functions', () => {
    expect(typeof components).toBe('object')
    expect(components).toBeDefined()
  })

  it('should have BillingDashboard component', () => {
    expect(components.BillingDashboard).toBeDefined()
    expect(typeof components.BillingDashboard).toBe('function')
  })

  it('should have CheckoutButton component', () => {
    expect(components.CheckoutButton).toBeDefined()
    expect(typeof components.CheckoutButton).toBe('function')
  })

  it('should have PricingTable component', () => {
    expect(components.PricingTable).toBeDefined()
    expect(typeof components.PricingTable).toBe('function')
  })

  it('should have SubscriptionStatus component', () => {
    expect(components.SubscriptionStatus).toBeDefined()
    expect(typeof components.SubscriptionStatus).toBe('function')
  })

  it('should have UsageDashboard component', () => {
    expect(components.UsageDashboard).toBeDefined()
    expect(typeof components.UsageDashboard).toBe('function')
  })
})