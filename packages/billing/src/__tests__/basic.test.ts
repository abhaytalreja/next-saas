describe('Basic test setup', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have working jest environment', () => {
    expect(typeof jest).toBe('object')
    expect(typeof expect).toBe('function')
  })
})