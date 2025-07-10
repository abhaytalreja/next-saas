import { test, expect } from '@playwright/test'
import { MailinatorAPI } from '../utils/mailinator'
import { generateTestUser } from '../utils/test-data'

test.describe('User Registration Flow', () => {
  let mailinator: MailinatorAPI
  let testUser: ReturnType<typeof generateTestUser>

  test.beforeEach(async () => {
    mailinator = new MailinatorAPI()
    testUser = generateTestUser()
  })

  test.afterEach(async () => {
    // Clean up test data after each test
    await mailinator.deleteInbox(testUser.email.split('@')[0])
  })

  test('should complete full registration and email verification flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/register')
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/Sign up/i)
    await expect(page.getByTestId('signup-form')).toBeVisible()
    
    // Fill registration form
    await page.getByTestId('signup-first-name-input').fill(testUser.firstName)
    await page.getByTestId('signup-last-name-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-confirm-password-input').fill(testUser.password)
    
    // Verify password strength indicator appears
    await expect(page.getByTestId('signup-password-strength-indicator')).toBeVisible()
    
    // Accept terms and conditions
    await page.getByTestId('signup-terms-checkbox').check()
    
    // Submit registration form
    await page.getByTestId('signup-submit-button').click()
    
    // Verify registration success message
    await expect(page.getByTestId('signup-success-message')).toBeVisible()
    await expect(page.getByText(/Check your email/i)).toBeVisible()
    
    // Wait for email to arrive (max 30 seconds)
    const emailContent = await mailinator.waitForEmail(
      testUser.email.split('@')[0],
      'Verify your email address',
      30000
    )
    
    expect(emailContent).toBeDefined()
    
    // Extract verification link from email
    const verificationLinkMatch = emailContent.match(/href="([^"]*verify-email[^"]*)"/)
    expect(verificationLinkMatch).toBeDefined()
    
    const verificationLink = verificationLinkMatch![1]
    
    // Navigate to verification link
    await page.goto(verificationLink)
    
    // Verify email verification page loads
    await expect(page.getByTestId('verify-email-container')).toBeVisible()
    
    // Wait for verification to complete
    await expect(page.getByTestId('verify-email-success')).toBeVisible({ timeout: 10000 })
    
    // Verify success message
    await expect(page.getByText(/Email verified successfully/i)).toBeVisible()
    
    // Navigate to login page
    await page.getByTestId('proceed-to-login-button').click()
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByTestId('login-form')).toBeVisible()
    
    // Test login with verified account
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    await page.getByTestId('login-submit-button').click()
    
    // Verify successful login and redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible()
  })

  test('should handle registration with existing email', async ({ page }) => {
    // Use existing test user email
    const existingUser = {
      ...testUser,
      email: 'existing-user@mailinator.com'
    }

    await page.goto('/auth/register')
    
    // Fill form with existing email
    await page.getByTestId('signup-first-name-input').fill(existingUser.firstName)
    await page.getByTestId('signup-last-name-input').fill(existingUser.lastName)
    await page.getByTestId('signup-email-input').fill(existingUser.email)
    await page.getByTestId('signup-password-input').fill(existingUser.password)
    await page.getByTestId('signup-confirm-password-input').fill(existingUser.password)
    await page.getByTestId('signup-terms-checkbox').check()
    
    await page.getByTestId('signup-submit-button').click()
    
    // Verify error message for existing email
    await expect(page.getByTestId('signup-error-alert')).toBeVisible()
    await expect(page.getByText(/already registered/i)).toBeVisible()
  })

  test('should validate form fields correctly', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Try to submit empty form
    await page.getByTestId('signup-submit-button').click()
    
    // Verify validation errors
    await expect(page.getByTestId('signup-first-name-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('signup-last-name-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('signup-email-input')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('signup-password-input')).toHaveAttribute('aria-invalid', 'true')
    
    // Test invalid email format
    await page.getByTestId('signup-email-input').fill('invalid-email')
    await page.getByTestId('signup-submit-button').click()
    
    await expect(page.getByText(/invalid email/i)).toBeVisible()
    
    // Test weak password
    await page.getByTestId('signup-password-input').fill('123')
    await expect(page.getByTestId('signup-password-strength-indicator')).toContainText('Weak')
    
    // Test strong password
    await page.getByTestId('signup-password-input').fill('StrongPassword123!@#')
    await expect(page.getByTestId('signup-password-strength-indicator')).toContainText('Strong')
    
    // Test password mismatch
    await page.getByTestId('signup-confirm-password-input').fill('DifferentPassword')
    await expect(page.getByText(/Passwords don't match/i)).toBeVisible()
  })

  test('should handle email verification timeout', async ({ page }) => {
    await page.goto('/auth/verify-email?token=invalid-token')
    
    // Verify error state
    await expect(page.getByTestId('verify-email-error')).toBeVisible()
    await expect(page.getByText(/verification failed/i)).toBeVisible()
    
    // Test resend verification
    await page.getByTestId('resend-verification-button').click()
    
    await expect(page.getByTestId('resend-verification-success')).toBeVisible()
    await expect(page.getByText(/verification email sent/i)).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/auth/register', route => route.abort())
    
    await page.goto('/auth/register')
    
    // Fill and submit form
    await page.getByTestId('signup-first-name-input').fill(testUser.firstName)
    await page.getByTestId('signup-last-name-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-confirm-password-input').fill(testUser.password)
    await page.getByTestId('signup-terms-checkbox').check()
    
    await page.getByTestId('signup-submit-button').click()
    
    // Verify error handling
    await expect(page.getByTestId('signup-error-alert')).toBeVisible()
    await expect(page.getByText(/network error/i)).toBeVisible()
  })

  test('should redirect authenticated users from registration page', async ({ page }) => {
    // First, complete a registration to get authenticated
    await page.goto('/auth/register')
    
    // Fill and submit registration form
    await page.getByTestId('signup-first-name-input').fill(testUser.firstName)
    await page.getByTestId('signup-last-name-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-confirm-password-input').fill(testUser.password)
    await page.getByTestId('signup-terms-checkbox').check()
    
    await page.getByTestId('signup-submit-button').click()
    
    // Complete email verification
    const emailContent = await mailinator.waitForEmail(
      testUser.email.split('@')[0],
      'Verify your email address',
      30000
    )
    
    const verificationLinkMatch = emailContent.match(/href="([^"]*verify-email[^"]*)"/)
    const verificationLink = verificationLinkMatch![1]
    
    await page.goto(verificationLink)
    await expect(page.getByTestId('verify-email-success')).toBeVisible()
    
    // Now try to access registration page while authenticated
    await page.goto('/auth/register')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should handle concurrent registrations', async ({ browser }) => {
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    const user1 = generateTestUser()
    const user2 = generateTestUser()

    // Start both registrations simultaneously
    await Promise.all([
      page1.goto('/auth/register'),
      page2.goto('/auth/register')
    ])

    // Fill forms simultaneously
    await Promise.all([
      // User 1 registration
      (async () => {
        await page1.getByTestId('signup-first-name-input').fill(user1.firstName)
        await page1.getByTestId('signup-last-name-input').fill(user1.lastName)
        await page1.getByTestId('signup-email-input').fill(user1.email)
        await page1.getByTestId('signup-password-input').fill(user1.password)
        await page1.getByTestId('signup-confirm-password-input').fill(user1.password)
        await page1.getByTestId('signup-terms-checkbox').check()
        await page1.getByTestId('signup-submit-button').click()
      })(),
      
      // User 2 registration
      (async () => {
        await page2.getByTestId('signup-first-name-input').fill(user2.firstName)
        await page2.getByTestId('signup-last-name-input').fill(user2.lastName)
        await page2.getByTestId('signup-email-input').fill(user2.email)
        await page2.getByTestId('signup-password-input').fill(user2.password)
        await page2.getByTestId('signup-confirm-password-input').fill(user2.password)
        await page2.getByTestId('signup-terms-checkbox').check()
        await page2.getByTestId('signup-submit-button').click()
      })()
    ])

    // Verify both registrations succeeded
    await expect(page1.getByTestId('signup-success-message')).toBeVisible()
    await expect(page2.getByTestId('signup-success-message')).toBeVisible()

    // Clean up
    await context1.close()
    await context2.close()
  })
})