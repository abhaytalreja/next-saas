import { test, expect } from '@playwright/test'
import { setupTestUser, cleanupTestUser } from '../utils/test-setup'
import { generateTestData } from '../utils/test-data'
import { waitForEmailAndExtractLink } from '../utils/mailinator'
import path from 'path'

test.describe('Profile Management E2E Tests', () => {
  let testUser: any
  let testData: any

  test.beforeEach(async ({ page }) => {
    testData = generateTestData()
    testUser = await setupTestUser(page, testData)
    
    // Navigate to profile settings
    await page.goto('http://localhost:3010/settings/profile')
    await page.waitForLoadState('networkidle')
  })

  test.afterEach(async ({ page }) => {
    if (testUser) {
      await cleanupTestUser(page, testUser)
    }
  })

  test.describe('Profile Information Management', () => {
    test('should complete entire profile setup workflow', async ({ page }) => {
      // Verify we're on the profile page
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Profile Settings')

      // Step 1: Check initial profile completeness
      const completenessSection = page.locator('[data-testid="profile-completeness"]')
      await expect(completenessSection).toBeVisible()
      
      // Should show incomplete initially
      await expect(completenessSection.locator('[data-testid="completeness-percentage"]')).toContainText('%')
      await expect(completenessSection.locator('[data-testid="completeness-suggestions"]')).toBeVisible()

      // Step 2: Update basic profile information
      await page.fill('[data-testid="first-name-input"]', testData.profile.firstName)
      await page.fill('[data-testid="last-name-input"]', testData.profile.lastName)
      await page.fill('[data-testid="display-name-input"]', testData.profile.displayName)
      await page.fill('[data-testid="bio-input"]', testData.profile.bio)
      await page.fill('[data-testid="phone-input"]', testData.profile.phone)
      await page.fill('[data-testid="company-input"]', testData.profile.company)
      await page.fill('[data-testid="job-title-input"]', testData.profile.jobTitle)
      await page.fill('[data-testid="location-input"]', testData.profile.location)
      
      // Select timezone
      await page.selectOption('[data-testid="timezone-select"]', 'America/New_York')

      // Step 3: Upload avatar
      const avatarUpload = page.locator('[data-testid="avatar-upload-input"]')
      const testImagePath = path.join(__dirname, '../fixtures/test-avatar.jpg')
      
      // Create a test image file if it doesn't exist
      await page.evaluate(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 200
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#4F46E5'
          ctx.fillRect(0, 0, 200, 200)
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '20px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('TEST', 100, 100)
        }
      })
      
      // Upload avatar (simulate file upload)
      await avatarUpload.setInputFiles({
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
      })

      // Wait for upload to complete
      await expect(page.locator('[data-testid="avatar-upload-success"]')).toBeVisible({ timeout: 10000 })
      
      // Verify avatar preview is shown
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()

      // Step 4: Save profile
      await page.click('[data-testid="save-profile-button"]')
      
      // Wait for loading state
      await expect(page.locator('[data-testid="save-profile-button"]')).toContainText('Saving...')
      
      // Wait for success message
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="profile-save-success"]')).toContainText('Profile updated successfully')

      // Step 5: Verify profile completeness improved
      const updatedCompleteness = page.locator('[data-testid="completeness-percentage"]')
      const completenessText = await updatedCompleteness.textContent()
      const completenessValue = parseInt(completenessText?.replace('%', '') || '0')
      expect(completenessValue).toBeGreaterThan(70) // Should be significantly improved

      // Step 6: Refresh page and verify data persistence
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verify all data persisted
      await expect(page.locator('[data-testid="first-name-input"]')).toHaveValue(testData.profile.firstName)
      await expect(page.locator('[data-testid="last-name-input"]')).toHaveValue(testData.profile.lastName)
      await expect(page.locator('[data-testid="display-name-input"]')).toHaveValue(testData.profile.displayName)
      await expect(page.locator('[data-testid="bio-input"]')).toHaveValue(testData.profile.bio)
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()
    })

    test('should handle profile validation errors gracefully', async ({ page }) => {
      // Test invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email')
      await page.click('[data-testid="save-profile-button"]')
      
      await expect(page.locator('[data-testid="email-validation-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-validation-error"]')).toContainText('Please enter a valid email address')

      // Test phone number validation
      await page.fill('[data-testid="phone-input"]', '123') // Too short
      await page.click('[data-testid="save-profile-button"]')
      
      await expect(page.locator('[data-testid="phone-validation-error"]')).toBeVisible()

      // Test display name uniqueness (simulate conflict)
      await page.fill('[data-testid="display-name-input"]', 'admin') // Common conflicting name
      await page.click('[data-testid="save-profile-button"]')
      
      // Should show error if display name is taken
      await expect(page.locator('[data-testid="profile-save-error"]')).toBeVisible({ timeout: 10000 })
    })

    test('should validate avatar uploads properly', async ({ page }) => {
      const avatarUpload = page.locator('[data-testid="avatar-upload-input"]')
      
      // Test file size validation (too large)
      await avatarUpload.setInputFiles({
        name: 'large-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(10 * 1024 * 1024) // 10MB file
      })
      
      await expect(page.locator('[data-testid="avatar-upload-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="avatar-upload-error"]')).toContainText('File size must be less than 5MB')

      // Test invalid file type
      await avatarUpload.setInputFiles({
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content')
      })
      
      await expect(page.locator('[data-testid="avatar-upload-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="avatar-upload-error"]')).toContainText('Please upload a valid image file')

      // Test valid upload
      await avatarUpload.setInputFiles({
        name: 'valid-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
      })
      
      await expect(page.locator('[data-testid="avatar-upload-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()
    })

    test('should support avatar removal', async ({ page }) => {
      // First upload an avatar
      const avatarUpload = page.locator('[data-testid="avatar-upload-input"]')
      await avatarUpload.setInputFiles({
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
      })
      
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()
      
      // Remove avatar
      await page.click('[data-testid="remove-avatar-button"]')
      
      // Confirm removal
      await expect(page.locator('[data-testid="remove-avatar-confirm"]')).toBeVisible()
      await page.click('[data-testid="confirm-remove-avatar"]')
      
      // Verify avatar is removed
      await expect(page.locator('[data-testid="avatar-preview"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="avatar-upload-placeholder"]')).toBeVisible()
    })
  })

  test.describe('User Preferences Management', () => {
    test('should navigate to preferences and update all sections', async ({ page }) => {
      // Navigate to preferences
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      await expect(page.locator('[data-testid="preferences-form"]')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Preferences')

      // Test Theme & Display section (default)
      await expect(page.locator('[data-testid="theme-section"]')).toBeVisible()
      
      // Change theme
      await page.selectOption('[data-testid="theme-select"]', 'dark')
      await page.selectOption('[data-testid="language-select"]', 'es')
      await page.selectOption('[data-testid="date-format-select"]', 'dd/MM/yyyy')
      await page.selectOption('[data-testid="time-format-select"]', '24h')

      // Navigate to Notifications section
      await page.click('[data-testid="notifications-tab"]')
      await expect(page.locator('[data-testid="notifications-section"]')).toBeVisible()
      
      // Toggle email notifications
      await page.click('[data-testid="email-notifications-toggle"]')
      await page.selectOption('[data-testid="email-frequency-select"]', 'daily')
      
      // Configure specific notification types
      await page.click('[data-testid="notify-security-alerts-toggle"]')
      await page.click('[data-testid="notify-mentions-toggle"]')
      await page.click('[data-testid="marketing-emails-toggle"]')

      // Configure quiet hours
      await page.click('[data-testid="quiet-hours-toggle"]')
      await page.fill('[data-testid="quiet-hours-start"]', '22:00')
      await page.fill('[data-testid="quiet-hours-end"]', '08:00')

      // Navigate to Privacy section
      await page.click('[data-testid="privacy-tab"]')
      await expect(page.locator('[data-testid="privacy-section"]')).toBeVisible()
      
      // Update privacy settings
      await page.selectOption('[data-testid="profile-visibility-select"]', 'private')
      await page.selectOption('[data-testid="email-visibility-select"]', 'organization')
      await page.selectOption('[data-testid="activity-visibility-select"]', 'private')
      await page.click('[data-testid="hide-last-seen-toggle"]')
      await page.click('[data-testid="hide-activity-status-toggle"]')

      // Navigate to Accessibility section
      await page.click('[data-testid="accessibility-tab"]')
      await expect(page.locator('[data-testid="accessibility-section"]')).toBeVisible()
      
      // Update accessibility settings
      await page.click('[data-testid="reduce-motion-toggle"]')
      await page.click('[data-testid="high-contrast-toggle"]')
      await page.click('[data-testid="screen-reader-optimized-toggle"]')

      // Navigate to Data & Storage section
      await page.click('[data-testid="data-storage-tab"]')
      await expect(page.locator('[data-testid="data-storage-section"]')).toBeVisible()
      
      // Update data retention settings
      await page.fill('[data-testid="data-retention-period"]', '730') // 2 years
      await page.click('[data-testid="auto-delete-inactive-toggle"]')

      // Save preferences
      await page.click('[data-testid="save-preferences-button"]')
      
      // Wait for success message
      await expect(page.locator('[data-testid="preferences-save-success"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="preferences-save-success"]')).toContainText('Preferences updated successfully')

      // Verify theme change applied immediately
      await expect(page.locator('html')).toHaveClass(/dark/)
    })

    test('should handle preferences validation errors', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      // Navigate to data section
      await page.click('[data-testid="data-storage-tab"]')
      
      // Test invalid retention period
      await page.fill('[data-testid="data-retention-period"]', '10') // Too short
      await page.click('[data-testid="save-preferences-button"]')
      
      await expect(page.locator('[data-testid="data-retention-validation-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="data-retention-validation-error"]')).toContainText('Must be between 30 and 2555 days')
      
      // Test too long retention period
      await page.fill('[data-testid="data-retention-period"]', '10000') // Too long
      await page.click('[data-testid="save-preferences-button"]')
      
      await expect(page.locator('[data-testid="data-retention-validation-error"]')).toBeVisible()
    })

    test('should show conditional fields based on preferences', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      // Navigate to notifications
      await page.click('[data-testid="notifications-tab"]')
      
      // Initially email notifications should be enabled (default)
      await expect(page.locator('[data-testid="email-frequency-select"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-digest-toggle"]')).toBeVisible()
      
      // Disable email notifications
      await page.click('[data-testid="email-notifications-toggle"]')
      
      // Frequency options should be hidden
      await expect(page.locator('[data-testid="email-frequency-select"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="email-digest-toggle"]')).not.toBeVisible()
      
      // Test quiet hours conditional fields
      await expect(page.locator('[data-testid="quiet-hours-start"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="quiet-hours-end"]')).not.toBeVisible()
      
      // Enable quiet hours
      await page.click('[data-testid="quiet-hours-toggle"]')
      
      // Time fields should appear
      await expect(page.locator('[data-testid="quiet-hours-start"]')).toBeVisible()
      await expect(page.locator('[data-testid="quiet-hours-end"]')).toBeVisible()
    })
  })

  test.describe('Cross-Component Integration', () => {
    test('should reflect profile changes across the application', async ({ page }) => {
      // Update profile information
      await page.fill('[data-testid="first-name-input"]', 'John')
      await page.fill('[data-testid="last-name-input"]', 'Smith')
      await page.fill('[data-testid="display-name-input"]', 'johnsmith')
      
      // Upload avatar
      const avatarUpload = page.locator('[data-testid="avatar-upload-input"]')
      await avatarUpload.setInputFiles({
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
      })
      
      await page.click('[data-testid="save-profile-button"]')
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible()
      
      // Navigate to dashboard
      await page.goto('http://localhost:3010/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Verify profile changes are reflected in navigation
      await expect(page.locator('[data-testid="user-display-name"]')).toContainText('John Smith')
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible()
      
      // Navigate to settings navigation
      await page.goto('http://localhost:3010/settings')
      await page.waitForLoadState('networkidle')
      
      // Verify user info in settings sidebar
      await expect(page.locator('[data-testid="settings-user-info"]')).toContainText('John Smith')
      await expect(page.locator('[data-testid="settings-user-avatar"]')).toBeVisible()
    })

    test('should handle theme changes across application', async ({ page }) => {
      // Navigate to preferences
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      // Change to dark theme
      await page.selectOption('[data-testid="theme-select"]', 'dark')
      await page.click('[data-testid="save-preferences-button"]')
      
      await expect(page.locator('[data-testid="preferences-save-success"]')).toBeVisible()
      
      // Verify dark theme is applied
      await expect(page.locator('html')).toHaveClass(/dark/)
      
      // Navigate to different pages and verify theme persistence
      await page.goto('http://localhost:3010/dashboard')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('html')).toHaveClass(/dark/)
      
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('html')).toHaveClass(/dark/)
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true)
      
      // Try to save profile
      await page.fill('[data-testid="first-name-input"]', 'Test')
      await page.click('[data-testid="save-profile-button"]')
      
      // Should show network error
      await expect(page.locator('[data-testid="profile-save-error"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="profile-save-error"]')).toContainText('network')
      
      // Restore connection
      await page.context().setOffline(false)
      
      // Retry should work
      await page.click('[data-testid="save-profile-button"]')
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible({ timeout: 10000 })
    })

    test('should handle concurrent form submissions', async ({ page }) => {
      // Fill out profile form
      await page.fill('[data-testid="first-name-input"]', 'Concurrent')
      await page.fill('[data-testid="last-name-input"]', 'Test')
      
      // Click save button multiple times quickly
      await Promise.all([
        page.click('[data-testid="save-profile-button"]'),
        page.click('[data-testid="save-profile-button"]'),
        page.click('[data-testid="save-profile-button"]')
      ])
      
      // Should only show one success message
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible()
      
      // Button should be disabled during submission
      await expect(page.locator('[data-testid="save-profile-button"]')).toBeDisabled()
    })

    test('should handle session expiration', async ({ page }) => {
      // Clear session cookies to simulate expiration
      await page.context().clearCookies()
      
      // Try to save profile
      await page.fill('[data-testid="first-name-input"]', 'Session')
      await page.click('[data-testid="save-profile-button"]')
      
      // Should redirect to login or show auth error
      await expect(page).toHaveURL(/\/(auth|login)/)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work properly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Navigate to profile
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible()
      
      // Test form interactions on mobile
      await page.fill('[data-testid="first-name-input"]', 'Mobile')
      await page.fill('[data-testid="last-name-input"]', 'User')
      
      // Test avatar upload on mobile
      const avatarUpload = page.locator('[data-testid="avatar-upload-input"]')
      await avatarUpload.setInputFiles({
        name: 'mobile-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
      })
      
      await expect(page.locator('[data-testid="avatar-preview"]')).toBeVisible()
      
      // Save profile
      await page.click('[data-testid="save-profile-button"]')
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be fully accessible via keyboard navigation', async ({ page }) => {
      // Navigate to profile
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')
      
      // Test keyboard navigation through form
      await page.keyboard.press('Tab') // Focus first input
      await page.keyboard.type('Keyboard')
      
      await page.keyboard.press('Tab') // Next input
      await page.keyboard.type('User')
      
      await page.keyboard.press('Tab') // Next input
      await page.keyboard.type('keyboarduser')
      
      // Navigate to save button using keyboard
      let tabCount = 0
      while (tabCount < 20) { // Prevent infinite loop
        await page.keyboard.press('Tab')
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
        if (focusedElement === 'save-profile-button') {
          break
        }
        tabCount++
      }
      
      // Activate save button with Enter
      await page.keyboard.press('Enter')
      
      // Verify save worked
      await expect(page.locator('[data-testid="profile-save-success"]')).toBeVisible()
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')
      
      // Check form has proper role
      await expect(page.locator('[data-testid="profile-form"]')).toHaveAttribute('role', 'form')
      
      // Check inputs have proper labels
      await expect(page.locator('[data-testid="first-name-input"]')).toHaveAttribute('aria-label')
      await expect(page.locator('[data-testid="last-name-input"]')).toHaveAttribute('aria-label')
      
      // Check file upload has proper accessibility
      await expect(page.locator('[data-testid="avatar-upload-input"]')).toHaveAttribute('aria-label')
      
      // Check save button has proper attributes
      await expect(page.locator('[data-testid="save-profile-button"]')).toHaveAttribute('type', 'submit')
    })
  })
})