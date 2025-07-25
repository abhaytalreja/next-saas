// Integration test environment setup
process.env.NODE_ENV = 'test'
process.env.SUPABASE_TEST_URL = process.env.SUPABASE_TEST_URL || 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key'

// Organization mode for testing
process.env.NEXT_PUBLIC_ORGANIZATION_MODE = 'multi'

// Test-specific configuration
process.env.INTEGRATION_TEST = 'true'
process.env.LOG_LEVEL = 'error' // Reduce noise in integration tests

// Set timezone for consistent test results
process.env.TZ = 'UTC'