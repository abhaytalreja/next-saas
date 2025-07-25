// Global setup for integration tests
export default async function globalSetup() {
  console.log('🚀 Setting up integration test environment...')
  
  // Validate required environment variables
  const requiredEnvVars = [
    'SUPABASE_TEST_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Warning: ${envVar} not set - using default test values`)
    }
  }
  
  // Set up test database connection
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.SUPABASE_TEST_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
    )
    
    // Verify connection (optional)
    // const { data, error } = await supabase.from('profiles').select('count').limit(1)
    // if (error) console.warn('Database connection test failed:', error.message)
    
    console.log('✅ Integration test environment ready')
  } catch (error) {
    console.warn('⚠️  Could not verify database connection:', error)
  }
  
  // Set global test start time
  global.__INTEGRATION_TEST_START__ = Date.now()
}