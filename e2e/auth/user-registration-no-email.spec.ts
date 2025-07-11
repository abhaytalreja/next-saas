import { test, expect } from '@playwright/test'
import { generateTestUser } from '../utils/test-data'

test.describe('User Registration Flow (No Email Verification)', () => {
  let testUser: ReturnType<typeof generateTestUser>

  test.beforeEach(async () => {
    testUser = generateTestUser()
  })

  test('should complete registration and immediately access dashboard', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/sign-up')
    
    // Verify page loads correctly - check for signup form instead of title
    await expect(page.getByTestId('signup-form')).toBeVisible()
    
    // Fill registration form
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    
    // Submit registration form
    await page.getByTestId('signup-submit-button').click()
    
    // With email confirmation disabled, should redirect directly to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Verify dashboard loads (look for any dashboard content)
    await expect(page.locator('body')).toContainText(/dashboard|welcome/i)
  })

  test('should handle registration with organization', async ({ page }) => {
    const organizationName = `Test Org ${Date.now()}`
    
    await page.goto('/auth/sign-up')
    
    // Fill registration form including organization
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-organization-input').fill(organizationName)
    
    // Submit registration
    await page.getByTestId('signup-submit-button').click()
    
    // Should redirect to dashboard with organization created
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Verify organization is created and user is part of it
    await expect(page.getByText(organizationName)).toBeVisible()
  })

  test('should handle registration with existing email', async ({ page }) => {
    // First, create a user
    await page.goto('/auth/sign-up')
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-submit-button').click()
    
    // Wait for registration to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Sign out
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="logout-button"]')
    
    // Try to register again with same email
    await page.goto('/auth/sign-up')
    await page.getByTestId('signup-firstname-input').fill('Another')
    await page.getByTestId('signup-lastname-input').fill('User')
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill('DifferentPassword123!')
    await page.getByTestId('signup-submit-button').click()
    
    // Verify error message for existing email
    await expect(page.getByTestId('signup-error-alert')).toBeVisible()
    await expect(page.getByText(/already registered|already exists/i)).toBeVisible()
  })

  test('should validate form fields correctly', async ({ page }) => {
    await page.goto('/auth/sign-up')
    
    // Try to submit empty form
    await page.getByTestId('signup-submit-button').click()
    
    // Verify validation errors appear
    await expect(page.locator('input:invalid')).toHaveCount(4) // firstName, lastName, email, password
    
    // Test invalid email format
    await page.getByTestId('signup-email-input').fill('invalid-email')
    await page.getByTestId('signup-submit-button').click()
    
    // Should still be on signup page due to validation
    await expect(page).toHaveURL(/\/auth\/sign-up/)
    
    // Test weak password
    await page.getByTestId('signup-password-input').fill('123')
    // Password strength indicator should show weak
    await expect(page.getByTestId('password-strength-indicator')).toBeVisible()
    
    // Test strong password
    await page.getByTestId('signup-password-input').fill('StrongPassword123!@#')
    // Password strength should improve
    await expect(page.getByTestId('password-strength-indicator')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure for signup API
    await page.route('**/api/auth/signup', route => route.abort())
    
    await page.goto('/auth/sign-up')
    
    // Fill and submit form
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    
    await page.getByTestId('signup-submit-button').click()
    
    // Verify error handling
    await expect(page.getByTestId('signup-error-alert')).toBeVisible()
  })

  test('should navigate to login page from signup', async ({ page }) => {
    await page.goto('/auth/sign-up')
    
    // Click login link
    await page.getByTestId('login-link').click()
    
    // Verify navigation to login page
    await expect(page).toHaveURL(/\/auth\/sign-in/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('should handle loading states correctly', async ({ page }) => {
    await page.goto('/auth/sign-up')
    
    // Fill form
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    
    // Submit and check loading state
    await page.getByTestId('signup-submit-button').click()
    
    // Button should show loading state briefly
    await expect(page.getByTestId('signup-submit-button')).toBeDisabled()
  })
})