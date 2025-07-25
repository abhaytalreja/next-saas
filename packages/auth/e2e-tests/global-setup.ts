import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🎭 Setting up Playwright E2E test environment...')
  
  // Launch browser for setup tasks
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Verify the application is running
    const baseURL = config.use?.baseURL || 'http://localhost:3000'
    console.log(`🔍 Checking application at ${baseURL}`)
    
    // Try to access the homepage
    await page.goto(baseURL, { timeout: 30000 })
    
    // Check if auth pages are accessible
    await page.goto(`${baseURL}/auth/signin`)
    await page.goto(`${baseURL}/auth/signup`)
    
    console.log('✅ Application is accessible for E2E testing')
    
    // Set up any test data or authentication state if needed
    // This is where you might create test users or set up test database
    
    // Create test environment file
    const testEnv = {
      E2E_TEST_START_TIME: Date.now(),
      BASE_URL: baseURL,
      TEST_USER_EMAIL: `e2e-test-${Date.now()}@example.com`,
      TEST_USER_PASSWORD: 'E2ETestPassword123!'
    }
    
    // Store test environment (could save to file or environment variables)
    process.env.E2E_TEST_USER_EMAIL = testEnv.TEST_USER_EMAIL
    process.env.E2E_TEST_USER_PASSWORD = testEnv.TEST_USER_PASSWORD
    
    console.log('🎯 E2E test environment configured')
    
  } catch (error) {
    console.error('❌ E2E setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup