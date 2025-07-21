import { vi } from 'vitest'

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    NODE_ENV: 'test'
  }
})

// Mock crypto.subtle for API key hashing in tests
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
})

// Mock TextEncoder for hashing
Object.defineProperty(global, 'TextEncoder', {
  value: class TextEncoder {
    encode(input: string) {
      return new Uint8Array(Buffer.from(input))
    }
  }
})

// Mock console methods to reduce test noise
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError  
  console.warn = originalConsoleWarn
})

// Global test utilities
declare global {
  var mockSupabaseClient: any
  var mockTenantContext: any
}

globalThis.mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
  channel: vi.fn(),
  auth: {
    admin: {
      getUserById: vi.fn()
    }
  }
}

globalThis.mockTenantContext = {
  organizationId: 'test-org-123',
  userId: 'test-user-123',
  role: 'admin',
  permissions: ['*']
}