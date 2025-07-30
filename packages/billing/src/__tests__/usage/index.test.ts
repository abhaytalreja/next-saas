import * as usage from '../../usage'

describe('Usage module exports', () => {
  it('should export usage-related functions and classes', () => {
    expect(typeof usage).toBe('object')
    expect(usage).toBeDefined()
  })

  it('should have UsageTracker', () => {
    expect(usage.UsageTracker).toBeDefined()
    expect(typeof usage.UsageTracker).toBe('function')
  })

  it('should have QuotaEnforcer', () => {
    expect(usage.QuotaEnforcer).toBeDefined()
    expect(typeof usage.QuotaEnforcer).toBe('function')
  })
})