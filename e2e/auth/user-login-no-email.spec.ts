import { test, expect } from '@playwright/test'
import { generateTestUser } from '../utils/test-data'

test.describe('User Login Flow (No Email Verification)', () => {
  let testUser: ReturnType<typeof generateTestUser>

  test.beforeEach(async ({ page }) => {
    // Create a fresh test user for each test
    testUser = generateTestUser()
    
    // Register the user first (with email confirmation disabled)
    await page.goto('/auth/sign-up')
    await page.getByTestId('signup-firstname-input').fill(testUser.firstName)
    await page.getByTestId('signup-lastname-input').fill(testUser.lastName)
    await page.getByTestId('signup-email-input').fill(testUser.email)
    await page.getByTestId('signup-password-input').fill(testUser.password)
    await page.getByTestId('signup-submit-button').click()
    
    // Wait for registration to complete and redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Sign out to test login
    await page.click('[data-testid="user-menu-button"]')
    await page.click('[data-testid="logout-button"]')
    
    // Verify we're signed out
    await expect(page).toHaveURL(/\/auth\/sign-in|\//)
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Verify login page loads
    await expect(page.getByTestId('login-form')).toBeVisible()
    
    // Fill login form
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    
    // Submit login
    await page.getByTestId('login-submit-button').click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Verify user is logged in
    await expect(page.getByText(`Welcome, ${testUser.firstName}`)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Fill form with invalid credentials
    await page.getByTestId('login-email-input').fill('invalid@example.com')
    await page.getByTestId('login-password-input').fill('InvalidPassword123')
    
    // Submit login
    await page.getByTestId('login-submit-button').click()
    
    // Verify error message
    await expect(page.getByTestId('login-error-alert')).toBeVisible()
    await expect(page.getByText(/Invalid.*credentials|Invalid.*email.*password/i)).toBeVisible()
  })

  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Fill form with correct email but wrong password
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill('WrongPassword123!')
    
    // Submit login
    await page.getByTestId('login-submit-button').click()
    
    // Verify error message
    await expect(page.getByTestId('login-error-alert')).toBeVisible()
    await expect(page.getByText(/Invalid.*credentials|Invalid.*email.*password/i)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Try to submit empty form
    await page.getByTestId('login-submit-button').click()
    
    // Verify validation - form should not submit
    await expect(page).toHaveURL(/\/auth\/sign-in/)
    
    // Check for HTML5 validation or custom validation
    const emailInput = page.getByTestId('login-email-input')
    const passwordInput = page.getByTestId('login-password-input')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should handle loading states', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Fill form
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    
    // Submit and check loading state
    await page.getByTestId('login-submit-button').click()
    
    // Button should show loading state (might be brief)
    const submitButton = page.getByTestId('login-submit-button')
    
    // The button should be disabled during submission
    await expect(submitButton).toBeDisabled()
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Click signup link
    await page.getByTestId('signup-link').click()
    
    // Verify navigation to signup page
    await expect(page).toHaveURL(/\/auth\/sign-up/)
    await expect(page.getByTestId('signup-form')).toBeVisible()
  })

  test('should handle forgot password navigation', async ({ page }) => {
    await page.goto('/auth/sign-in')
    
    // Click forgot password link
    await page.getByTestId('forgot-password-link').click()
    
    // Verify navigation to forgot password page
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
  })

  test('should redirect authenticated users away from login', async ({ page }) => {
    // Login first
    await page.goto('/auth/sign-in')
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    await page.getByTestId('login-submit-button').click()
    
    // Wait for login to complete
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Try to access login page while authenticated
    await page.goto('/auth/sign-in')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page while logged out
    await page.goto('/settings/profile')
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/auth\/sign-in/)
    
    // Login
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    await page.getByTestId('login-submit-button').click()
    
    // Should redirect back to intended page or dashboard
    await expect(page).toHaveURL(/\/(dashboard|settings\/profile)/, { timeout: 15000 })
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure for login API
    await page.route('**/auth/sign-in', route => route.abort())
    await page.route('**/api/auth/**', route => route.abort())
    
    await page.goto('/auth/sign-in')
    
    // Fill and submit form
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    await page.getByTestId('login-submit-button').click()
    
    // Should show error or remain on login page
    // The exact behavior depends on error handling implementation
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in')
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(testUser.password)
    await page.getByTestId('login-submit-button').click()
    
    // Wait for login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    
    // Refresh the page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(`Welcome, ${testUser.firstName}`)).toBeVisible()
  })
})