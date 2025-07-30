import * as pricing from '../../pricing'

describe('Pricing module exports', () => {
  it('should export pricing-related functions and classes', () => {
    expect(typeof pricing).toBe('object')
    expect(pricing).toBeDefined()
  })

  it('should have PricingService', () => {
    expect(pricing.PricingService).toBeDefined()
    expect(typeof pricing.PricingService).toBe('function')
  })
})