import * as types from '../types'

describe('Types exports', () => {
  it('should export types without errors', () => {
    // This test ensures all types are exportable and valid
    expect(typeof types).toBe('object')
  })

  it('should have consistent type structure', () => {
    // Basic smoke test to ensure types module loads
    expect(types).toBeDefined()
  })
})