import { test, expect } from '@playwright/test'
import { MailinatorAPI } from '../utils/mailinator'
import { getPredefinedTestUsers, generateTestUser } from '../utils/test-data'

test.describe('Password Reset Flow', () => {
  let mailinator: MailinatorAPI
  const testUsers = getPredefinedTestUsers()

  test.beforeEach(async () => {
    mailinator = new MailinatorAPI()
  })

  test('should complete full password reset flow', async ({ page }) => {
    const testUser = generateTestUser()
    
    // Navigate to forgot password page
    await page.goto('/auth/forgot-password')
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/Forgot Password/i)
    await expect(page.getByTestId('forgot-password-form')).toBeVisible()
    
    // Fill email field
    await page.getByTestId('forgot-password-email-input').fill(testUser.email)
    
    // Submit reset request
    await page.getByTestId('send-reset-link-button').click()
    
    // Verify success message
    await expect(page.getByTestId('forgot-password-success')).toBeVisible()
    await expect(page.getByText(/Check your email/i)).toBeVisible()
    
    // Wait for password reset email
    const emailContent = await mailinator.waitForEmail(
      testUser.email.split('@')[0],
      'Reset your password',
      30000
    )
    
    expect(emailContent).toBeDefined()
    
    // Extract reset link from email
    const resetLinkMatch = emailContent.match(/href="([^"]*reset-password[^"]*)"/)
    expect(resetLinkMatch).toBeDefined()
    
    const resetLink = resetLinkMatch![1]
    
    // Navigate to reset link
    await page.goto(resetLink)
    
    // Verify reset password page loads
    await expect(page.getByTestId('reset-password-form')).toBeVisible()
    await expect(page.getByTestId('reset-password-header')).toBeVisible()
    
    // Fill new password
    const newPassword = 'NewStrongPassword123!@#'
    await page.getByTestId('reset-password-new-password-input').fill(newPassword)
    
    // Verify password strength indicator
    await expect(page.getByTestId('reset-password-strength-indicator')).toBeVisible()
    await expect(page.getByTestId('reset-password-strength-indicator')).toContainText('Strong')
    
    // Fill confirm password
    await page.getByTestId('reset-password-confirm-password-input').fill(newPassword)
    
    // Submit password reset
    await page.getByTestId('reset-password-submit-button').click()
    
    // Verify redirect to login with success message
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByText(/Password reset successful/i)).toBeVisible()
    
    // Test login with new password
    await page.getByTestId('login-email-input').fill(testUser.email)
    await page.getByTestId('login-password-input').fill(newPassword)
    await page.getByTestId('login-submit-button').click()
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('should validate email format on forgot password page', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Try invalid email format
    await page.getByTestId('forgot-password-email-input').fill('invalid-email')
    await page.getByTestId('send-reset-link-button').click()
    
    // Verify validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible()
    
    // Try empty email
    await page.getByTestId('forgot-password-email-input').fill('')
    await page.getByTestId('send-reset-link-button').click()
    
    // Verify required field error
    await expect(page.getByTestId('forgot-password-email-input')).toHaveAttribute('aria-invalid', 'true')
  })

  test('should handle non-existent email address', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Fill with non-existent email
    await page.getByTestId('forgot-password-email-input').fill('nonexistent@example.com')
    await page.getByTestId('send-reset-link-button').click()
    
    // Should still show success message for security reasons
    await expect(page.getByTestId('forgot-password-success')).toBeVisible()
    await expect(page.getByText(/Check your email/i)).toBeVisible()
  })

  test('should validate password strength on reset page', async ({ page }) => {
    // Navigate directly to reset page with token
    await page.goto('/auth/reset-password?token=mock-token')
    
    await expect(page.getByTestId('reset-password-form')).toBeVisible()
    
    // Test weak password
    await page.getByTestId('reset-password-new-password-input').fill('123')
    await expect(page.getByTestId('reset-password-strength-indicator')).toContainText('Weak')
    
    // Test medium password
    await page.getByTestId('reset-password-new-password-input').fill('Password123')
    await expect(page.getByTestId('reset-password-strength-indicator')).toContainText('Fair')
    
    // Test strong password
    await page.getByTestId('reset-password-new-password-input').fill('StrongPassword123!@#')
    await expect(page.getByTestId('reset-password-strength-indicator')).toContainText('Strong')
  })

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/auth/reset-password?token=mock-token')
    
    // Fill passwords that don't match
    await page.getByTestId('reset-password-new-password-input').fill('Password123!@#')
    await page.getByTestId('reset-password-confirm-password-input').fill('DifferentPassword123')
    
    // Try to submit
    await page.getByTestId('reset-password-submit-button').click()
    
    // Verify mismatch error
    await expect(page.getByText(/Passwords don't match/i)).toBeVisible()
  })

  test('should handle expired reset token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=expired-token')
    
    // Fill valid passwords
    await page.getByTestId('reset-password-new-password-input').fill('NewPassword123!@#')
    await page.getByTestId('reset-password-confirm-password-input').fill('NewPassword123!@#')
    
    // Submit reset
    await page.getByTestId('reset-password-submit-button').click()
    
    // Verify error message
    await expect(page.getByTestId('reset-password-error-alert')).toBeVisible()
    await expect(page.getByText(/expired or invalid/i)).toBeVisible()
  })

  test('should handle invalid reset token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=invalid-token')
    
    // Should show error immediately or after form submission
    await expect(page.getByTestId('reset-password-error-alert')).toBeVisible()
    await expect(page.getByText(/invalid.*token/i)).toBeVisible()
  })

  test('should navigate back to login from forgot password page', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Click back to login link
    await page.getByTestId('back-to-login-link').click()
    
    // Verify navigation
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('should navigate back to login from reset password page', async ({ page }) => {
    await page.goto('/auth/reset-password?token=mock-token')
    
    // Click back to login link
    await page.getByTestId('back-to-login-link').click()
    
    // Verify navigation
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('should handle rate limiting on reset requests', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    const email = 'test@example.com'
    
    // Send multiple reset requests quickly
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('forgot-password-email-input').fill(email)
      await page.getByTestId('send-reset-link-button').click()
      
      // Wait for success message
      await expect(page.getByTestId('forgot-password-success')).toBeVisible()
      
      // Navigate back to form
      await page.getByTestId('back-to-login-link').click()
      await page.getByTestId('forgot-password-link').click()
    }
    
    // Next request should be rate limited
    await page.getByTestId('forgot-password-email-input').fill(email)
    await page.getByTestId('send-reset-link-button').click()
    
    // Should show rate limit error
    await expect(page.getByTestId('forgot-password-error-alert')).toBeVisible()
    await expect(page.getByText(/too many requests/i)).toBeVisible()
  })

  test('should show loading states during password reset', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    
    // Fill email
    await page.getByTestId('forgot-password-email-input').fill('test@example.com')
    
    // Submit and check loading state
    await page.getByTestId('send-reset-link-button').click()
    
    // Button should be disabled and show loading text
    await expect(page.getByTestId('send-reset-link-button')).toBeDisabled()
    await expect(page.getByTestId('send-reset-link-button')).toContainText(/sending/i)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/auth/forgot-password', route => route.abort())
    
    await page.goto('/auth/forgot-password')
    
    // Fill and submit form
    await page.getByTestId('forgot-password-email-input').fill('test@example.com')
    await page.getByTestId('send-reset-link-button').click()
    
    // Should show network error
    await expect(page.getByTestId('forgot-password-error-alert')).toBeVisible()
    await expect(page.getByText(/network error/i)).toBeVisible()
  })

  test('should prevent reuse of reset token', async ({ page }) => {
    const testUser = generateTestUser()
    
    // Complete password reset flow
    await page.goto('/auth/forgot-password')
    await page.getByTestId('forgot-password-email-input').fill(testUser.email)
    await page.getByTestId('send-reset-link-button').click()
    
    // Wait for email and get reset link
    const emailContent = await mailinator.waitForEmail(
      testUser.email.split('@')[0],
      'Reset your password',
      30000
    )
    
    const resetLinkMatch = emailContent.match(/href="([^"]*reset-password[^"]*)"/)
    const resetLink = resetLinkMatch![1]
    
    // Use the token to reset password
    await page.goto(resetLink)
    await page.getByTestId('reset-password-new-password-input').fill('NewPassword123!@#')
    await page.getByTestId('reset-password-confirm-password-input').fill('NewPassword123!@#')
    await page.getByTestId('reset-password-submit-button').click()
    
    // Verify success
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Try to use the same token again
    await page.goto(resetLink)
    
    // Should show error that token is already used
    await expect(page.getByTestId('reset-password-error-alert')).toBeVisible()
    await expect(page.getByText(/already used|expired/i)).toBeVisible()
  })
})