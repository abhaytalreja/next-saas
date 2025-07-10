import { chromium, FullConfig } from '@playwright/test'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test suite setup...')
  
  try {
    // 1. Set up test database
    console.log('📊 Setting up test database...')
    await execAsync('npm run test:e2e:setup', { cwd: process.cwd() })
    
    // 2. Create a browser instance for setup
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    try {
      // Check if the application is running
      const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
      console.log(`📡 Checking application availability at ${baseURL}`)
      
      await page.goto(baseURL, { timeout: 30000 })
      
      // Verify the application is responsive
      await page.waitForSelector('body', { timeout: 10000 })
      
      console.log('✅ Application is running and responsive')
      
      // Set up test environment
      console.log('🔧 Setting up test environment...')
    
    // Check if we're in test mode
    const isTestMode = await page.evaluate(() => {
      return (window as any).location.hostname === 'localhost' || 
             (window as any).location.hostname === '127.0.0.1'
    })
    
    if (!isTestMode) {
      console.warn('⚠️  Warning: Not running on localhost. Test data may affect production.')
    }
    
    // Verify Mailinator is accessible (for email testing)
    try {
      await page.goto('https://www.mailinator.com', { timeout: 15000 })
      console.log('✅ Mailinator is accessible for email testing')
    } catch (error) {
      console.warn('⚠️  Warning: Mailinator is not accessible. Email tests may fail.')
    }
    
    // Return to base URL
    await page.goto(baseURL)
    
    // Clear any existing localStorage/sessionStorage
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    console.log('🧹 Cleared browser storage')
    
    // Check database connectivity (if we have a health endpoint)
    try {
      const response = await page.goto(`${baseURL}/api/health`)
      if (response?.ok()) {
        console.log('✅ Database connectivity verified')
      }
    } catch (error) {
      console.log('ℹ️  Database health check endpoint not available')
    }
    
      console.log('🎯 E2E test environment setup complete')
      
    } finally {
      await browser.close()
    }
    
  } catch (error) {
    console.error('❌ E2E setup failed:', error)
    throw error
  }
}

export default globalSetup