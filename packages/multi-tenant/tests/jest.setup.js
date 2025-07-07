/**
 * Jest setup file for multi-tenant tests
 * Configures testing environment and global utilities
 */

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Supabase client for testing
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({ data: [], error: null })),
      insert: jest.fn(() => ({ data: [], error: null })),
      update: jest.fn(() => ({ data: [], error: null })),
      delete: jest.fn(() => ({ data: [], error: null })),
      eq: jest.fn(() => ({ data: [], error: null })),
      neq: jest.fn(() => ({ data: [], error: null })),
      in: jest.fn(() => ({ data: [], error: null })),
      single: jest.fn(() => ({ data: {}, error: null })),
      order: jest.fn(() => ({ data: [], error: null })),
      limit: jest.fn(() => ({ data: [], error: null }))
    })),
    auth: {
      getUser: jest.fn(() => ({ data: { user: null }, error: null })),
      signIn: jest.fn(() => ({ data: {}, error: null })),
      signOut: jest.fn(() => ({ error: null }))
    },
    rpc: jest.fn(() => ({ data: [], error: null }))
  }))
}))

// Mock React hooks for testing
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useCallback: jest.fn(),
  useMemo: jest.fn()
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/test',
    query: {},
    asPath: '/test'
  })
}))

// Global test utilities
global.createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

global.createMockOrganization = (overrides = {}) => ({
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  domain: null,
  logo_url: null,
  settings: {},
  subscription_status: 'trial',
  created_by: 'test-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

global.createMockWorkspace = (overrides = {}) => ({
  id: 'test-workspace-id',
  organization_id: 'test-org-id',
  name: 'Test Workspace',
  slug: 'test-workspace',
  description: null,
  is_default: false,
  created_by: 'test-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

global.createMockMembership = (overrides = {}) => ({
  id: 'test-membership-id',
  organization_id: 'test-org-id',
  user_id: 'test-user-id',
  role: 'member',
  joined_at: new Date().toISOString(),
  ...overrides
})

// Mock performance API for performance tests
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn()
}

// Console error/warning suppression for expected test errors
const originalError = console.error
const originalWarn = console.warn

console.error = (...args) => {
  // Suppress specific expected errors in tests
  const message = args[0]
  if (
    message?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    message?.includes?.('Warning: An invalid form control') ||
    message?.includes?.('RLS policy violation') // Expected in security tests
  ) {
    return
  }
  originalError.call(console, ...args)
}

console.warn = (...args) => {
  // Suppress specific expected warnings
  const message = args[0]
  if (
    message?.includes?.('componentWillReceiveProps has been renamed') ||
    message?.includes?.('componentWillMount has been renamed')
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

// Restore console methods after tests
afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Global test timeout for async operations
jest.setTimeout(30000)

// Setup fake timers for time-sensitive tests
beforeEach(() => {
  jest.clearAllTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})