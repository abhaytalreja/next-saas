// Test environment setup - loads before all tests

// Load test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOuoJuXx-f9MorIFvM-YbMVd7gIzfvhmdS8g'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:54322/postgres'
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'multi'
process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = 'true'
process.env.TZ = 'UTC'

// Mock crypto.randomUUID for Node.js environments
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {
    randomUUID: () => 'mock-uuid-1234-5678-9012-123456789012',
    subtle: {
      digest: async () => new ArrayBuffer(32)
    },
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }
  } as any
} else {
  globalThis.crypto.randomUUID = globalThis.crypto.randomUUID || (() => 'mock-uuid-1234-5678-9012-123456789012')
}

// Suppress console output in tests
const originalError = console.error
const originalWarn = console.warn
const originalLog = console.log

// Only show errors that we explicitly want to see
console.error = (...args) => {
  const message = String(args[0] || '')
  if (message.includes('Warning:') || message.includes('Error:')) {
    originalError(...args)
  }
}

console.warn = () => {
  // Suppress warnings in tests
}

console.log = (...args) => {
  // Only show logs if TEST_VERBOSE is set
  if (process.env.TEST_VERBOSE) {
    originalLog(...args)
  }
}