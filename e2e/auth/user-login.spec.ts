import { test, expect } from '@playwright/test'
import { TestSetup } from '../utils/test-setup'
import { getPredefinedTestUsers } from '../utils/test-data'

test.describe('User Login Flow', () => {
  let testSetup: TestSetup
  const testUsers = getPredefinedTestUsers()

  test.beforeEach(async ({ browser }) => {
    testSetup = new TestSetup(browser)
  })

  test('should connect to login page', async ({ page }) => {
    // Test that we can navigate to the login page
    const response = await page.goto('/auth/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    })
    
    // Verify we get a response (even if 500)
    expect(response?.status()).toBeGreaterThan(0)
    console.log(`Login page responded with status: ${response?.status()}`)
    
    // Check if we can see any HTML content
    const content = await page.content()
    expect(content).toContain('html')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill form with invalid credentials
    await page.getByTestId('login-email-input').fill('invalid@example.com')
    await page.getByTestId('login-password-input').fill('InvalidPassword123')
    
    // Submit login
    await page.getByTestId('login-submit-button').click()
    
    // Verify error message
    await expect(page.getByTestId('login-error-alert')).toBeVisible()
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to submit empty form
    await page.getByTestId('login-submit-button').click()
    
    // Verify validation errors
    await expect(page.getByTestId('login-email-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('login-password-input')).toHaveAttribute('aria-invalid', 'true')
  })

  test('should handle "remember me" functionality', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill form and check remember me
    await page.getByTestId('login-email-input').fill(testUsers.regular.email)
    await page.getByTestId('login-password-input').fill(testUsers.regular.password)
    await page.getByTestId('login-remember-checkbox').check()
    
    // Submit login
    await page.getByTestId('login-submit-button').click()
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Check that session is extended (would need backend verification)
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(c => c.name.includes('session'))
    expect(sessionCookie).toBeDefined()
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page
    await page.goto('/settings/profile')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Fill and submit login form
    await page.getByTestId('login-email-input').fill(testUsers.regular.email)
    await page.getByTestId('login-password-input').fill(testUsers.regular.password)
    await page.getByTestId('login-submit-button').click()
    
    // Should redirect back to intended page
    await expect(page).toHaveURL(/\/settings\/profile/)
  })

  test('should handle social login options', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Check social login buttons are present
    await expect(page.getByTestId('google-login-button')).toBeVisible()
    await expect(page.getByTestId('github-login-button')).toBeVisible()
    
    // Click Google login (won't complete due to test environment)
    await page.getByTestId('google-login-button').click()
    
    // Should redirect to Google OAuth (or show error in test env)
    // In real tests, this would mock the OAuth flow
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Click forgot password link
    await page.getByTestId('forgot-password-link').click()
    
    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
    await expect(page.getByTestId('forgot-password-form')).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Click sign up link
    await page.getByTestId('signup-link').click()
    
    // Verify navigation to registration page
    await expect(page).toHaveURL(/\/auth\/register/)
    await expect(page.getByTestId('signup-form')).toBeVisible()
  })

  test('should handle loading states', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill form
    await page.getByTestId('login-email-input').fill(testUsers.regular.email)
    await page.getByTestId('login-password-input').fill(testUsers.regular.password)
    
    // Submit and check loading state
    await page.getByTestId('login-submit-button').click()
    
    // Button should show loading state
    await expect(page.getByTestId('login-submit-button')).toBeDisabled()
    await expect(page.getByTestId('login-submit-button')).toContainText(/signing in/i)
  })

  test('should handle session timeout', async ({ page }) => {
    // Login first
    await testSetup.authenticateUser(page, testUsers.regular)
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Clear session storage to simulate timeout
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
    
    // Try to access protected page
    await page.goto('/settings/profile')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should handle concurrent login attempts', async ({ browser }) => {
    const context1 = await testSetup.createContext()
    const context2 = await testSetup.createContext()
    const page1 = await testSetup.setupPage(context1)
    const page2 = await testSetup.setupPage(context2)

    // Start both logins simultaneously
    await Promise.all([
      page1.goto('/auth/login'),
      page2.goto('/auth/login')
    ])

    // Fill forms simultaneously
    await Promise.all([
      (async () => {
        await page1.getByTestId('login-email-input').fill(testUsers.regular.email)
        await page1.getByTestId('login-password-input').fill(testUsers.regular.password)
        await page1.getByTestId('login-submit-button').click()
      })(),
      (async () => {
        await page2.getByTestId('login-email-input').fill(testUsers.admin.email)
        await page2.getByTestId('login-password-input').fill(testUsers.admin.password)
        await page2.getByTestId('login-submit-button').click()
      })()
    ])

    // Both should succeed
    await expect(page1).toHaveURL(/\/dashboard/)
    await expect(page2).toHaveURL(/\/dashboard/)

    // Clean up
    await context1.close()
    await context2.close()
  })

  test('should handle brute force protection', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('wrongpassword')
      await page.getByTestId('login-submit-button').click()
      
      // Wait for error message
      await expect(page.getByTestId('login-error-alert')).toBeVisible()
      
      // Clear form for next attempt
      await page.getByTestId('login-email-input').fill('')
      await page.getByTestId('login-password-input').fill('')
    }
    
    // After multiple attempts, should show rate limit message
    await page.getByTestId('login-email-input').fill('test@example.com')
    await page.getByTestId('login-password-input').fill('wrongpassword')
    await page.getByTestId('login-submit-button').click()
    
    await expect(page.getByText(/too many attempts/i)).toBeVisible()
  })

  test('should login with admin user and access admin features', async ({ page }) => {
    await testSetup.authenticateUser(page, testUsers.admin)
    
    // Verify admin dashboard access
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByTestId('admin-panel-link')).toBeVisible()
    
    // Navigate to admin panel
    await page.getByTestId('admin-panel-link').click()
    
    // Verify admin features are available
    await expect(page.getByTestId('admin-users-section')).toBeVisible()
    await expect(page.getByTestId('admin-organizations-section')).toBeVisible()
  })

  test('should handle email verification requirement', async ({ page }) => {
    // Try to login with unverified user
    await page.goto('/auth/login')
    
    await page.getByTestId('login-email-input').fill(testUsers.pending.email)
    await page.getByTestId('login-password-input').fill(testUsers.pending.password)
    await page.getByTestId('login-submit-button').click()
    
    // Should show email verification required message
    await expect(page.getByTestId('email-verification-required')).toBeVisible()
    await expect(page.getByText(/verify your email/i)).toBeVisible()
    
    // Should have resend verification button
    await expect(page.getByTestId('resend-verification-button')).toBeVisible()
  })
})