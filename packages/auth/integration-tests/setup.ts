// Integration test setup
// Note: jest-extended is not available due to dependency conflicts

// Global test timeout for integration tests
jest.setTimeout(30000)

// Console suppression for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Suppress console noise during integration tests
  console.error = (...args: any[]) => {
    // Only show critical errors
    const message = args[0]
    if (message && typeof message === 'string' && (message.includes('CRITICAL') || message.includes('FATAL'))) {
      originalConsoleError(...args)
    }
  }
  
  console.warn = (...args: any[]) => {
    // Suppress warnings unless specifically needed
    const message = args[0]
    if (message && typeof message === 'string' && message.includes('IMPORTANT')) {
      originalConsoleWarn(...args)
    }
  }
})

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Global cleanup function for integration tests
global.afterEach(() => {
  // Reset any global state between tests
  jest.clearAllTimers()
})

// Mock crypto.randomUUID for consistent test results
global.crypto = global.crypto || {}
global.crypto.randomUUID = global.crypto.randomUUID || jest.fn(() => `test-uuid-${Date.now()}`)

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit the process during tests
})

export {}