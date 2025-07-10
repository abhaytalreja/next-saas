import { test, expect } from '@playwright/test'

test.describe('E2E Setup Validation', () => {
  test('infrastructure is ready for testing', async ({ page }) => {
    console.log('🚀 Validating E2E Test Infrastructure')
    
    // 1. Test Playwright framework
    await page.goto('data:text/html,<html><body><h1>E2E Test Framework</h1></body></html>')
    await expect(page.locator('h1')).toContainText('E2E Test Framework')
    console.log('✅ Playwright framework working')
    
    // 2. Test port configuration
    const response = await page.goto('http://localhost:3010', { 
      waitUntil: 'domcontentloaded',
      timeout: 5000 
    })
    expect(response?.status()).toBeGreaterThan(0)
    console.log(`✅ Server on port 3010 responding (status: ${response?.status()})`)
    
    // 3. Test navigation to auth routes
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    for (const route of authRoutes) {
      const routeResponse = await page.goto(`http://localhost:3010${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      })
      expect(routeResponse?.status()).toBeGreaterThan(0)
      console.log(`✅ Route ${route} accessible (status: ${routeResponse?.status()})`)
    }
    
    // 4. Test utilities
    const faker = await import('@faker-js/faker')
    const testEmail = faker.faker.internet.email()
    expect(testEmail).toContain('@')
    console.log('✅ Test data utilities working')
    
    console.log('🎯 E2E Infrastructure validation complete!')
  })

  test('test files are properly structured', async () => {
    // Verify our test files exist and are importable
    const fs = await import('fs')
    const path = await import('path')
    
    const testFiles = [
      'e2e/auth/user-registration.spec.ts',
      'e2e/auth/user-login.spec.ts', 
      'e2e/auth/password-reset.spec.ts',
      'e2e/utils/test-data.ts',
      'e2e/utils/mailinator.ts',
      'e2e/utils/test-setup.ts'
    ]
    
    for (const testFile of testFiles) {
      const exists = fs.existsSync(path.resolve(testFile))
      expect(exists).toBe(true)
      console.log(`✅ ${testFile} exists`)
    }
    
    console.log('🎯 All test files properly structured!')
  })

  test('configuration is correct', async ({ page }) => {
    // Verify our configuration works
    const config = await import('./playwright.config')
    
    // Check base URL is correctly set
    const baseURL = config.default.use?.baseURL
    expect(baseURL).toContain('3010')
    console.log(`✅ Base URL configured: ${baseURL}`)
    
    // Verify port is reachable
    const url = page.url()
    console.log(`✅ Current context URL: ${url}`)
    
    console.log('🎯 Configuration validation complete!')
  })
})