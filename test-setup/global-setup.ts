import { config } from 'dotenv'
import { join } from 'path'

export default async function globalSetup() {
  // Load test environment variables
  config({ path: join(__dirname, '..', '.env.test') })

  console.log('🚀 Starting integration test suite...')

  // Verify required environment variables
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`)
    console.warn('Some integration tests will be skipped')
  } else {
    console.log('✅ Environment variables verified')
  }

  // Additional setup for storage tests
  if (process.env.BACKBLAZE_APPLICATION_KEY_ID && process.env.BACKBLAZE_APPLICATION_KEY) {
    console.log('✅ Storage credentials found - avatar tests will run')
  } else {
    console.warn('⚠️  Storage credentials not found - avatar storage tests will be skipped')
  }

  // Verify test database connection
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      )

      // Test connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (error && !error.message.includes('permission denied')) {
        console.error('❌ Database connection failed:', error.message)
      } else {
        console.log('✅ Database connection verified')
      }
    } catch (error) {
      console.warn('⚠️  Could not verify database connection:', error)
    }
  }

  console.log('🎯 Integration test environment ready\n')
}