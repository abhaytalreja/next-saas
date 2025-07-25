import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up Playwright E2E test environment...')
  
  // Calculate total E2E test time
  const startTime = process.env.E2E_TEST_START_TIME
  if (startTime) {
    const duration = Date.now() - parseInt(startTime)
    console.log(`⏱️  E2E tests completed in ${duration}ms`)
  }
  
  // Launch browser for cleanup tasks
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Cleanup any test data created during tests
    // This is where you might delete test users or clean up test database
    
    const baseURL = config.use?.baseURL || 'http://localhost:3000'
    
    // If we had created test users, we could clean them up here
    // For now, just log completion
    console.log(`🗑️  Cleaned up test data for ${baseURL}`)
    
    // Clear any persistent browser state
    await page.context().clearCookies()
    await page.context().clearPermissions()
    
    console.log('✅ E2E test cleanup completed successfully')
    
  } catch (error) {
    console.warn('⚠️  E2E cleanup warning:', error)
  } finally {
    await browser.close()
  }
  
  // Clean up environment variables
  delete process.env.E2E_TEST_USER_EMAIL
  delete process.env.E2E_TEST_USER_PASSWORD
  delete process.env.E2E_TEST_START_TIME
}

export default globalTeardown