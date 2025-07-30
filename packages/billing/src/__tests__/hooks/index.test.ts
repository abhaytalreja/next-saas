import * as hooks from '../../hooks'

describe('Hooks module exports', () => {
  it('should export all hook functions', () => {
    expect(typeof hooks).toBe('object')
    expect(hooks).toBeDefined()
  })

  it('should have billing hooks', () => {
    expect(hooks.useBillingSubscription).toBeDefined()
    expect(typeof hooks.useBillingSubscription).toBe('function')
    
    expect(hooks.useBillingCustomer).toBeDefined()
    expect(typeof hooks.useBillingCustomer).toBe('function')
    
    expect(hooks.useCheckout).toBeDefined()
    expect(typeof hooks.useCheckout).toBe('function')
    
    expect(hooks.usePlanFeatures).toBeDefined()  
    expect(typeof hooks.usePlanFeatures).toBe('function')
    
    expect(hooks.useUsageTracking).toBeDefined()
    expect(typeof hooks.useUsageTracking).toBe('function')
  })
})