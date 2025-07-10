import { config } from 'dotenv'
import { join } from 'path'

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') })

// Extend Jest timeout for integration tests
jest.setTimeout(30000)

// Global test setup
beforeAll(async () => {
  // Ensure test database is available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found. Integration tests will be skipped.')
    return
  }

  // Verify test environment
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    throw new Error('Integration tests should not run in production environment')
  }

  console.log('Integration test environment verified')
})

// Global test cleanup
afterAll(async () => {
  // Any global cleanup logic
  console.log('Integration tests completed')
})

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Mock console.error to filter out expected errors during tests
  jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    // Allow through specific error types we want to see
    if (
      typeof message === 'string' && 
      (message.includes('Integration test') || message.includes('Test error'))
    ) {
      originalConsoleError(message, ...args)
    }
    // Suppress other console.error calls during tests
  })

  // Mock console.warn similarly
  jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
    if (
      typeof message === 'string' && 
      (message.includes('Integration test') || message.includes('Test warning'))
    ) {
      originalConsoleWarn(message, ...args)
    }
  })
})

afterEach(() => {
  // Restore console methods
  jest.restoreAllMocks()
})