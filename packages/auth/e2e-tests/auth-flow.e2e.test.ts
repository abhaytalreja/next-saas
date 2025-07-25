import { test, expect } from '@playwright/test'

/**
 * End-to-End Authentication Flow Tests
 * Tests complete user authentication journeys in a real browser environment
 */

test.describe('Authentication Flow E2E Tests', () => {
  const testUser = {
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'E2ETestPassword123!',
    firstName: 'E2E',
    lastName: 'TestUser',
    organizationName: 'E2E Test Organization'
  }

  test.beforeEach(async ({ page }) => {
    // Ensure clean state for each test
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test.describe('User Registration Flow', () => {
    test('should complete full user registration with organization', async ({ page }) => {
      // Navigate to signup page
      await page.goto('/auth/signup')
      await expect(page).toHaveTitle(/Sign up/i)

      // Verify signup form is present
      await expect(page.getByTestId('signup-form')).toBeVisible()
      await expect(page.getByTestId('signup-first-name-input')).toBeVisible()
      await expect(page.getByTestId('signup-last-name-input')).toBeVisible()
      await expect(page.getByTestId('signup-email-input')).toBeVisible()
      await expect(page.getByTestId('signup-password-input')).toBeVisible()
      await expect(page.getByTestId('signup-organization-input')).toBeVisible()

      // Fill out registration form
      await page.getByTestId('signup-first-name-input').fill(testUser.firstName)
      await page.getByTestId('signup-last-name-input').fill(testUser.lastName)
      await page.getByTestId('signup-email-input').fill(testUser.email)
      await page.getByTestId('signup-password-input').fill(testUser.password)
      await page.getByTestId('signup-organization-input').fill(testUser.organizationName)

      // Verify password strength indicator appears
      await expect(page.getByTestId('password-strength-indicator')).toBeVisible()

      // Accept terms and conditions
      await page.getByTestId('signup-terms-checkbox').check()
      await expect(page.getByTestId('signup-terms-checkbox')).toBeChecked()

      // Submit registration form
      await page.getByTestId('signup-submit-button').click()

      // Wait for successful registration
      await expect(page).toHaveURL(/\/dashboard|\/verify-email/)
      
      // Should either redirect to dashboard or email verification page
      if (page.url().includes('/verify-email')) {
        await expect(page.getByText(/check your email/i)).toBeVisible()
      } else {
        await expect(page.getByText(/dashboard|welcome/i)).toBeVisible()
      }
    })

    test('should validate required fields in signup form', async ({ page }) => {
      await page.goto('/auth/signup')

      // Try to submit empty form
      await page.getByTestId('signup-submit-button').click()

      // Should show validation errors
      await expect(page.getByText(/first name is required/i)).toBeVisible()
      await expect(page.getByText(/last name is required/i)).toBeVisible()
      await expect(page.getByText(/email is required/i)).toBeVisible()
      await expect(page.getByText(/password is required/i)).toBeVisible()

      // Form should not submit
      await expect(page).toHaveURL(/\/auth\/signup/)
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/signup')

      // Fill form with invalid email
      await page.getByTestId('signup-first-name-input').fill('Test')
      await page.getByTestId('signup-last-name-input').fill('User')
      await page.getByTestId('signup-email-input').fill('invalid-email')
      await page.getByTestId('signup-password-input').fill('Password123!')
      await page.getByTestId('signup-terms-checkbox').check()

      await page.getByTestId('signup-submit-button').click()

      // Should show email validation error
      await expect(page.getByText(/valid email address/i)).toBeVisible()
      await expect(page).toHaveURL(/\/auth\/signup/)
    })
  })

  test.describe('User Login Flow', () => {
    test.beforeEach(async ({ page }) => {
      // For login tests, we assume a user already exists
      // In a real test environment, this would be set up in test fixtures
    })

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/auth/signin')
      await expect(page).toHaveTitle(/Sign in/i)

      // Verify login form is present
      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page.getByTestId('login-email-input')).toBeVisible()
      await expect(page.getByTestId('login-password-input')).toBeVisible()

      // Fill login form
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')

      // Submit login
      await page.getByTestId('login-submit-button').click()

      // Should redirect to dashboard on successful login
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(page.getByText(/dashboard|welcome/i)).toBeVisible()

      // Should show user menu indicating successful authentication
      await expect(page.getByTestId('user-menu')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin')

      // Fill login form with wrong credentials
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('WrongPassword123!')

      await page.getByTestId('login-submit-button').click()

      // Should show authentication error
      await expect(page.getByTestId('login-error-alert')).toBeVisible()
      await expect(page.getByText(/invalid.*credentials/i)).toBeVisible()

      // Should remain on login page
      await expect(page).toHaveURL(/\/auth\/signin/)
    })

    test('should remember me functionality work', async ({ page }) => {
      await page.goto('/auth/signin')

      // Fill login form and check remember me
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')
      await page.getByTestId('login-remember-checkbox').check()

      await page.getByTestId('login-submit-button').click()

      // Should successfully login
      await expect(page).toHaveURL(/\/dashboard/)

      // Verify remember me cookie or session persistence
      // This would need to be checked through browser storage
      const cookies = await page.context().cookies()
      expect(cookies.some(cookie => cookie.name.includes('remember') || cookie.name.includes('session'))).toBe(true)
    })
  })

  test.describe('Profile Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before profile management tests
      await page.goto('/auth/signin')
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')
      await page.getByTestId('login-submit-button').click()
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('should navigate to profile settings', async ({ page }) => {
      // Open user menu
      await page.getByTestId('user-menu').click()

      // Click profile settings
      await page.getByText(/profile.*settings/i).click()

      // Should navigate to profile page
      await expect(page).toHaveURL(/\/profile/)
      await expect(page.getByText(/profile.*settings/i)).toBeVisible()

      // Should show profile form
      await expect(page.getByTestId('profile-form')).toBeVisible()
    })

    test('should update profile information', async ({ page }) => {
      await page.goto('/profile')

      // Fill profile update form
      const updatedFirstName = 'Updated'
      const updatedLastName = 'Name'
      const updatedBio = 'Updated bio for E2E testing'

      await page.getByTestId('profile-first-name-input').fill(updatedFirstName)
      await page.getByTestId('profile-last-name-input').fill(updatedLastName)
      await page.getByTestId('profile-bio-input').fill(updatedBio)

      // Submit profile update
      await page.getByTestId('profile-save-button').click()

      // Should show success message
      await expect(page.getByText(/profile.*updated/i)).toBeVisible()

      // Refresh and verify changes persisted
      await page.reload()
      await expect(page.getByTestId('profile-first-name-input')).toHaveValue(updatedFirstName)
      await expect(page.getByTestId('profile-last-name-input')).toHaveValue(updatedLastName)
      await expect(page.getByTestId('profile-bio-input')).toHaveValue(updatedBio)
    })

    test('should upload and update avatar', async ({ page }) => {
      await page.goto('/profile')

      // Test avatar upload
      const fileInput = page.getByTestId('avatar-upload-input')
      
      // Create a test image file (this would be a real image file in practice)
      await fileInput.setInputFiles({
        name: 'test-avatar.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-content')
      })

      // Submit avatar update
      await page.getByTestId('avatar-save-button').click()

      // Should show upload progress and success
      await expect(page.getByText(/uploading/i)).toBeVisible()
      await expect(page.getByText(/avatar.*updated/i)).toBeVisible()

      // Should show new avatar
      await expect(page.getByTestId('user-avatar')).toHaveAttribute('src', /.+/)
    })
  })

  test.describe('Authentication State Management', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page.getByTestId('login-form')).toBeVisible()
    })

    test('should handle session expiration', async ({ page }) => {
      // Login first
      await page.goto('/auth/signin')
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')
      await page.getByTestId('login-submit-button').click()
      await expect(page).toHaveURL(/\/dashboard/)

      // Simulate session expiration by clearing cookies
      await page.context().clearCookies()

      // Try to access protected resource
      await page.goto('/profile')

      // Should redirect to login due to expired session
      await expect(page).toHaveURL(/\/auth\/signin/)
    })

    test('should logout user properly', async ({ page }) => {
      // Login first
      await page.goto('/auth/signin')
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')
      await page.getByTestId('login-submit-button').click()
      await expect(page).toHaveURL(/\/dashboard/)

      // Logout
      await page.getByTestId('user-menu').click()
      await page.getByText(/sign.*out|logout/i).click()

      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/signin/)
      
      // Should clear authentication state
      const cookies = await page.context().cookies()
      expect(cookies.filter(cookie => cookie.name.includes('session')).length).toBe(0)

      // Should not be able to access protected routes
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/auth\/signin/)
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should initiate password reset', async ({ page }) => {
      await page.goto('/auth/signin')

      // Click forgot password link
      await page.getByTestId('forgot-password-link').click()

      // Should navigate to forgot password page
      await expect(page).toHaveURL(/\/auth\/forgot-password/)
      await expect(page.getByTestId('forgot-password-form')).toBeVisible()

      // Enter email for password reset
      await page.getByTestId('forgot-password-email-input').fill('test@example.com')
      await page.getByTestId('forgot-password-submit-button').click()

      // Should show success message
      await expect(page.getByText(/check.*email.*reset/i)).toBeVisible()
    })

    test('should validate email in password reset form', async ({ page }) => {
      await page.goto('/auth/forgot-password')

      // Try to submit empty form
      await page.getByTestId('forgot-password-submit-button').click()
      await expect(page.getByText(/email.*required/i)).toBeVisible()

      // Try invalid email
      await page.getByTestId('forgot-password-email-input').fill('invalid-email')
      await page.getByTestId('forgot-password-submit-button').click()
      await expect(page.getByText(/valid.*email/i)).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/auth/signin')

      // Form should be responsive
      await expect(page.getByTestId('login-form')).toBeVisible()
      
      // Elements should stack vertically on mobile
      const form = page.getByTestId('login-form')
      const boundingBox = await form.boundingBox()
      expect(boundingBox?.width).toBeLessThan(400)

      // Should be able to complete login on mobile
      await page.getByTestId('login-email-input').fill('test@example.com')
      await page.getByTestId('login-password-input').fill('TestPassword123!')
      await page.getByTestId('login-submit-button').click()

      await expect(page).toHaveURL(/\/dashboard/)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper keyboard navigation', async ({ page }) => {
      await page.goto('/auth/signin')

      // Should be able to navigate form with keyboard
      await page.keyboard.press('Tab')
      await expect(page.getByTestId('login-email-input')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByTestId('login-password-input')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByTestId('login-remember-checkbox')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.getByTestId('login-submit-button')).toBeFocused()
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/auth/signin')

      // Check for proper form labeling
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
      await expect(page.getByLabelText(/password/i)).toBeVisible()
      await expect(page.getByRole('checkbox', { name: /remember/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })
  })
})