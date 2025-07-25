// Simple test to verify Jest configuration works

describe('Jest Configuration Test', () => {
  it('can run basic tests', () => {
    expect(true).toBe(true)
  })

  it('can handle basic TypeScript', () => {
    const testObject: { name: string; value: number } = {
      name: 'test',
      value: 42
    }
    
    expect(testObject.name).toBe('test')
    expect(testObject.value).toBe(42)
  })

  it('can handle async operations', async () => {
    const promise = Promise.resolve('success')
    const result = await promise
    expect(result).toBe('success')
  })
})