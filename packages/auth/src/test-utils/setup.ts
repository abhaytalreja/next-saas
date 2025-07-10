import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { setupTestEnvironment } from './index'

// Setup test environment
setupTestEnvironment()

// Mock console methods to reduce noise
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((message) => {
    // Allow React error boundary errors to be logged
    if (typeof message === 'string' && message.includes('Error boundary')) {
      originalError(message)
    }
    // Suppress other console.error calls during tests
  })
  
  jest.spyOn(console, 'warn').mockImplementation(() => {
    // Suppress console.warn calls during tests
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  console.error = originalError
  console.warn = originalWarn
})

// Global test configuration
beforeAll(() => {
  // Set timezone for consistent date formatting in tests
  process.env.TZ = 'UTC'
})

afterAll(() => {
  // Cleanup
  delete process.env.TZ
})