import * as gating from '../../gating'

describe('Gating module exports', () => {
  it('should export all gating functions and components', () => {
    expect(typeof gating).toBe('object')
    expect(gating).toBeDefined()
  })

  it('should have FeatureGate component', () => {
    expect(gating.FeatureGate).toBeDefined()
    expect(typeof gating.FeatureGate).toBe('function')
  })

  it('should have PlanChecker class', () => {
    expect(gating.PlanChecker).toBeDefined()
    expect(typeof gating.PlanChecker).toBe('function')
  })

  it('should have SubscriptionGuard class', () => {
    expect(gating.SubscriptionGuard).toBeDefined()
    expect(typeof gating.SubscriptionGuard).toBe('function')
  })
})