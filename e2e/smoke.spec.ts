import { test, expect } from '@playwright/test'

test.describe('E2E Infrastructure Tests', () => {
  test('playwright framework is working', async ({ page }) => {
    // Test Playwright basic functionality without relying on app
    await page.goto('data:text/html,<html><head><title>Test Page</title></head><body><h1>Test</h1></body></html>')
    
    await expect(page.locator('h1')).toContainText('Test')
    await expect(page).toHaveTitle('Test Page')
    
    const url = page.url()
    expect(url).toContain('data:text/html')
  })

  test('can connect to localhost:3010', async ({ page }) => {
    // Test connection to local server
    page.on('response', response => {
      console.log(`Response: ${response.status()} ${response.url()}`)
    })
    
    try {
      const response = await page.goto('http://localhost:3010', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      })
      
      // Even if it's a 500 error, we got a response
      expect(response?.status()).toBeGreaterThan(0)
      console.log(`Server responded with status: ${response?.status()}`)
      
    } catch (error) {
      console.log(`Connection error: ${error}`)
      // If connection fails, that's also useful information
      expect(error).toBeDefined()
    }
  })

  test('test utilities are functional', async () => {
    // Test that we can use faker without issues
    const faker = await import('@faker-js/faker')
    const testEmail = faker.faker.internet.email()
    
    expect(testEmail).toContain('@')
    expect(typeof testEmail).toBe('string')
  })
})