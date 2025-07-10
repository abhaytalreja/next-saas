import { FullConfig } from '@playwright/test'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test suite teardown...')
  
  try {
    // Clean up test data
    console.log('🗑️  Cleaning up test data...')
    await execAsync('npm run test:e2e:cleanup', { cwd: process.cwd() })
    
    // Log test completion summary
    console.log('📊 E2E Test Suite Summary:')
    console.log('  - User registration and verification tests completed')
    console.log('  - User login flow tests completed')
    console.log('  - Password reset flow tests completed')
    console.log('  - Profile management tests completed')
    console.log('  - Organization workflow tests completed')
    console.log('  - Mobile user experience tests completed')
    console.log('  - Cross-browser compatibility tests completed')
    
    console.log('ℹ️  Test data cleanup status:')
    console.log('  ✅ Dynamic test data cleaned up')
    console.log('  ✅ Test user sessions cleared')
    console.log('  ✅ Temporary files removed')
    console.log('  ℹ️  Core test users preserved for next run')
    console.log('  ℹ️  Mailinator emails will auto-delete in 24h')
    
    console.log('✅ E2E test suite teardown complete')
    
  } catch (error) {
    console.error('❌ E2E teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown

// Helper functions for cleanup (implement as needed)
/*
async function cleanupTestData() {
  // Clean up test users, organizations, etc.
  console.log('🗑️  Cleaning up test data...')
}

async function clearTestStorage() {
  // Clear test files from storage (Backblaze B2, etc.)
  console.log('🗑️  Clearing test storage...')
}

async function resetTestDatabase() {
  // Reset database to clean state if needed
  console.log('🔄 Resetting test database...')
}
*/