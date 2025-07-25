import { test, expect } from '@playwright/test'

/**
 * Comprehensive Profile Management E2E Tests
 * Tests the complete profile management workflow including organization modes
 */

test.describe('Profile Management E2E Tests', () => {
  const testUser = {
    email: `profile-test-${Date.now()}@example.com`,
    password: 'ProfileTest123!',
    firstName: 'Profile',
    lastName: 'TestUser',
    organizationName: 'Profile Test Org'
  }

  test.beforeEach(async ({ page }) => {
    // Login before each profile test
    await page.goto('/auth/signin')
    await page.getByTestId('login-email-input').fill('test@example.com')
    await page.getByTestId('login-password-input').fill('TestPassword123!')
    await page.getByTestId('login-submit-button').click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test.describe('Profile Mode Detection and Switching', () => {
    test('should detect and display correct profile mode', async ({ page }) => {
      await page.goto('/profile')

      // Should show profile mode indicator
      await expect(page.getByTestId('profile-mode-detector')).toBeVisible()
      
      // Should show organization context if in org mode
      const orgMode = await page.locator('[data-organization-mode]').getAttribute('data-organization-mode')
      if (orgMode === 'single' || orgMode === 'multi') {
        await expect(page.getByTestId('organization-context')).toBeVisible()
      }
    })

    test('should switch between basic and organization-aware profile managers', async ({ page }) => {
      await page.goto('/profile')

      // Check if organization switcher is present (for multi-org mode)
      const orgSwitcher = page.getByTestId('organization-profile-switcher')
      if (await orgSwitcher.isVisible()) {
        // Test switching between organizations
        await orgSwitcher.click()
        await page.getByRole('option').first().click()
        
        // Profile should update with new organization context
        await expect(page.getByTestId('profile-form')).toBeVisible()
      }
    })

    test('should handle organization permissions correctly', async ({ page }) => {
      await page.goto('/profile')

      // Check for role-based UI elements
      const userRole = await page.locator('[data-user-role]').getAttribute('data-user-role')
      
      if (userRole === 'admin' || userRole === 'owner') {
        // Admin/Owner should see organization settings
        await expect(page.getByTestId('organization-settings-section')).toBeVisible()
      } else {
        // Regular users should not see org admin features
        await expect(page.getByTestId('organization-settings-section')).not.toBeVisible()
      }
    })
  })

  test.describe('Enhanced Profile Form Management', () => {
    test('should complete comprehensive profile update workflow', async ({ page }) => {
      await page.goto('/profile')
      await expect(page.getByTestId('enhanced-profile-form')).toBeVisible()

      // Update personal information
      await page.getByTestId('profile-first-name-input').fill('Updated')
      await page.getByTestId('profile-last-name-input').fill('Name')
      await page.getByTestId('profile-display-name-input').fill('UpdatedUser')
      await page.getByTestId('profile-bio-input').fill('Updated bio for comprehensive testing')

      // Update contact information
      await page.getByTestId('profile-phone-input').fill('+1-555-0123')
      await page.getByTestId('profile-website-input').fill('https://updated-website.com')
      await page.getByTestId('profile-location-input').fill('San Francisco, CA')

      // Update professional information
      await page.getByTestId('profile-job-title-input').fill('Senior Developer')
      await page.getByTestId('profile-company-input').fill('Tech Company Inc')
      await page.getByTestId('profile-department-input').fill('Engineering')

      // Save profile changes
      await page.getByTestId('profile-save-button').click()

      // Should show success notification
      await expect(page.getByText(/profile.*updated.*successfully/i)).toBeVisible()

      // Should show profile completeness indicator
      const completeness = page.getByTestId('profile-completeness-indicator')
      await expect(completeness).toBeVisible()
      
      // Completeness should be high after filling all fields
      const completenessText = await completeness.textContent()
      expect(completenessText).toMatch(/[8-9][0-9]%|100%/) // Should be 80%+ complete
    })

    test('should validate profile form fields with real-time feedback', async ({ page }) => {
      await page.goto('/profile')

      // Test email validation
      await page.getByTestId('profile-email-input').fill('invalid-email')
      await page.getByTestId('profile-email-input').blur()
      await expect(page.getByText(/valid email address/i)).toBeVisible()

      // Test phone validation
      await page.getByTestId('profile-phone-input').fill('invalid-phone')
      await page.getByTestId('profile-phone-input').blur()
      await expect(page.getByText(/valid phone number/i)).toBeVisible()

      // Test website URL validation
      await page.getByTestId('profile-website-input').fill('not-a-url')
      await page.getByTestId('profile-website-input').blur()
      await expect(page.getByText(/valid website URL/i)).toBeVisible()

      // Test character limits
      const longBio = 'A'.repeat(1001) // Assuming 1000 char limit
      await page.getByTestId('profile-bio-input').fill(longBio)
      await expect(page.getByText(/character limit/i)).toBeVisible()
    })

    test('should track profile completeness dynamically', async ({ page }) => {
      await page.goto('/profile')

      // Start with minimal profile
      await page.getByTestId('profile-first-name-input').clear()
      await page.getByTestId('profile-last-name-input').clear()
      
      // Check initial completeness (should be low)
      let completeness = await page.getByTestId('profile-completeness-percentage').textContent()
      const initialScore = parseInt(completeness || '0')

      // Add information progressively
      await page.getByTestId('profile-first-name-input').fill('John')
      await page.getByTestId('profile-last-name-input').fill('Doe')
      
      // Completeness should increase
      completeness = await page.getByTestId('profile-completeness-percentage').textContent()
      const afterNameScore = parseInt(completeness || '0')
      expect(afterNameScore).toBeGreaterThan(initialScore)

      // Add bio and verify further increase
      await page.getByTestId('profile-bio-input').fill('Software developer with passion for testing')
      
      completeness = await page.getByTestId('profile-completeness-percentage').textContent()
      const afterBioScore = parseInt(completeness || '0')
      expect(afterBioScore).toBeGreaterThan(afterNameScore)

      // Should show completion suggestions
      await expect(page.getByTestId('completion-suggestions')).toBeVisible()
    })
  })

  test.describe('Avatar Management Workflow', () => {
    test('should complete full avatar upload and management cycle', async ({ page }) => {
      await page.goto('/profile')

      // Open avatar management section
      await page.getByTestId('avatar-section').click()
      await expect(page.getByTestId('avatar-upload-component')).toBeVisible()

      // Test avatar upload
      const fileInput = page.getByTestId('avatar-file-input')
      
      // Create test image file
      await fileInput.setInputFiles({
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      })

      // Should show upload preview
      await expect(page.getByTestId('avatar-upload-preview')).toBeVisible()

      // Verify file validation feedback
      await expect(page.getByText(/image uploaded successfully/i)).toBeVisible()

      // Submit avatar upload
      await page.getByTestId('avatar-upload-submit-button').click()

      // Should show upload progress
      await expect(page.getByTestId('avatar-upload-progress')).toBeVisible()

      // Should show success and update avatar display
      await expect(page.getByText(/avatar updated/i)).toBeVisible()
      await expect(page.getByTestId('current-user-avatar')).toBeVisible()

      // Test avatar history
      await page.getByTestId('avatar-history-button').click()
      await expect(page.getByTestId('avatar-history-modal')).toBeVisible()
      
      // Should show previous avatars
      const avatarHistory = page.getByTestId('avatar-history-list')
      await expect(avatarHistory).toBeVisible()
      
      // Should be able to select previous avatar
      const firstHistoryAvatar = avatarHistory.locator('.avatar-history-item').first()
      if (await firstHistoryAvatar.isVisible()) {
        await firstHistoryAvatar.click()
        await page.getByTestId('use-previous-avatar-button').click()
        await expect(page.getByText(/avatar reverted/i)).toBeVisible()
      }
    })

    test('should validate avatar file constraints', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('avatar-section').click()

      // Test file size validation
      const fileInput = page.getByTestId('avatar-file-input')
      
      // Try to upload oversized file
      await fileInput.setInputFiles({
        name: 'large-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(6 * 1024 * 1024) // 6MB file
      })

      await expect(page.getByText(/file too large/i)).toBeVisible()

      // Test invalid file type
      await fileInput.setInputFiles({
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('not-an-image')
      })

      await expect(page.getByText(/invalid file type/i)).toBeVisible()
    })

    test('should handle avatar deletion properly', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('avatar-section').click()

      // If avatar exists, test deletion
      const deleteButton = page.getByTestId('delete-avatar-button')
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        
        // Should show confirmation dialog
        await expect(page.getByTestId('delete-avatar-confirmation')).toBeVisible()
        
        await page.getByTestId('confirm-delete-avatar-button').click()
        
        // Should show success and revert to default avatar
        await expect(page.getByText(/avatar deleted/i)).toBeVisible()
        await expect(page.getByTestId('default-avatar-placeholder')).toBeVisible()
      }
    })
  })

  test.describe('Activity Dashboard Integration', () => {
    test('should display comprehensive activity dashboard', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('activity-tab').click()

      // Should show activity dashboard
      await expect(page.getByTestId('activity-dashboard')).toBeVisible()

      // Should have multiple activity tabs
      await expect(page.getByTestId('activity-tab-general')).toBeVisible()
      await expect(page.getByTestId('activity-tab-security')).toBeVisible()
      await expect(page.getByTestId('activity-tab-sessions')).toBeVisible()

      // Test each tab
      await page.getByTestId('activity-tab-security').click()
      await expect(page.getByTestId('security-activities-list')).toBeVisible()

      await page.getByTestId('activity-tab-sessions').click()
      await expect(page.getByTestId('active-sessions-list')).toBeVisible()

      // Should show activity statistics
      await expect(page.getByTestId('activity-stats-summary')).toBeVisible()
    })

    test('should handle activity filtering and search', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('activity-tab').click()

      // Test activity filtering
      await page.getByTestId('activity-filter-dropdown').click()
      await page.getByRole('option', { name: 'Profile Updates' }).click()

      // Should filter activities
      await expect(page.getByTestId('filtered-activities-list')).toBeVisible()

      // Test date range filtering
      await page.getByTestId('activity-date-range-picker').click()
      await page.getByTestId('last-7-days-option').click()

      // Should update activity list
      const activityItems = page.getByTestId('activity-item')
      await expect(activityItems.first()).toBeVisible()

      // Test activity search
      await page.getByTestId('activity-search-input').fill('profile update')
      await expect(page.getByText(/profile.*update/i)).toBeVisible()
    })
  })

  test.describe('Data Export and Account Management', () => {
    test('should complete data export workflow', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('data-export-tab').click()

      // Should show data export options
      await expect(page.getByTestId('data-export-manager')).toBeVisible()

      // Test different export formats
      await page.getByTestId('export-format-json').check()
      await page.getByTestId('export-data-button').click()

      // Should show export progress
      await expect(page.getByTestId('export-progress-indicator')).toBeVisible()

      // Should provide download link
      await expect(page.getByTestId('download-export-link')).toBeVisible()

      // Test CSV export
      await page.getByTestId('export-format-csv').check()
      await page.getByTestId('export-data-button').click()

      await expect(page.getByTestId('download-export-link')).toBeVisible()
    })

    test('should handle account deletion workflow with safeguards', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('account-deletion-tab').click()

      // Should show account deletion manager
      await expect(page.getByTestId('account-deletion-manager')).toBeVisible()

      // Should require confirmation steps
      await page.getByTestId('delete-account-button').click()
      
      // Should show warning dialog
      await expect(page.getByTestId('delete-account-warning')).toBeVisible()
      
      // Should require typing confirmation
      await page.getByTestId('delete-confirmation-input').fill('DELETE')
      
      // Should require password verification
      await page.getByTestId('password-verification-input').fill('TestPassword123!')
      
      // Cancel instead of actually deleting
      await page.getByTestId('cancel-deletion-button').click()
      
      // Should close dialog and remain on profile page
      await expect(page.getByTestId('delete-account-warning')).not.toBeVisible()
      await expect(page).toHaveURL(/\/profile/)
    })
  })

  test.describe('User Preferences Management', () => {
    test('should manage comprehensive user preferences', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('preferences-tab').click()

      // Should show preferences form
      await expect(page.getByTestId('preferences-form')).toBeVisible()

      // Test theme selection
      await page.getByTestId('theme-selector').selectOption('dark')
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

      // Test language selection
      await page.getByTestId('language-selector').selectOption('es')
      await expect(page.getByText(/configuración/i)).toBeVisible() // Spanish text

      // Test notification preferences
      await page.getByTestId('email-notifications-checkbox').check()
      await page.getByTestId('push-notifications-checkbox').uncheck()

      // Test privacy settings
      await page.getByTestId('profile-visibility-selector').selectOption('private')
      
      // Save preferences
      await page.getByTestId('save-preferences-button').click()
      await expect(page.getByText(/preferences.*saved/i)).toBeVisible()

      // Verify persistence
      await page.reload()
      await expect(page.getByTestId('theme-selector')).toHaveValue('dark')
      await expect(page.getByTestId('profile-visibility-selector')).toHaveValue('private')
    })

    test('should handle quiet hours and notification scheduling', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('preferences-tab').click()

      // Configure quiet hours
      await page.getByTestId('quiet-hours-toggle').check()
      await page.getByTestId('quiet-hours-start').fill('22:00')
      await page.getByTestId('quiet-hours-end').fill('08:00')

      // Set notification frequency
      await page.getByTestId('digest-frequency').selectOption('weekly')

      await page.getByTestId('save-preferences-button').click()
      await expect(page.getByText(/quiet hours configured/i)).toBeVisible()
    })
  })

  test.describe('Organization Context Management', () => {
    test('should manage organization-specific profile settings', async ({ page }) => {
      // Skip if not in organization mode
      const orgMode = await page.locator('[data-organization-mode]').getAttribute('data-organization-mode')
      test.skip(orgMode === 'none', 'Skipping org tests for personal mode')

      await page.goto('/profile')

      // Should show organization context
      await expect(page.getByTestId('organization-context-panel')).toBeVisible()

      // Test organization role display
      await expect(page.getByTestId('user-organization-role')).toBeVisible()

      // Test organization-specific settings (if admin/owner)
      const userRole = await page.locator('[data-user-role]').getAttribute('data-user-role')
      
      if (userRole === 'admin' || userRole === 'owner') {
        await page.getByTestId('organization-settings-section').click()
        await expect(page.getByTestId('org-profile-settings')).toBeVisible()
        
        // Test organization profile updates
        await page.getByTestId('org-display-name-input').fill('Updated Org Name')
        await page.getByTestId('save-org-profile-button').click()
        await expect(page.getByText(/organization.*updated/i)).toBeVisible()
      }
    })

    test('should handle organization switching in multi-org mode', async ({ page }) => {
      const orgMode = await page.locator('[data-organization-mode]').getAttribute('data-organization-mode')
      test.skip(orgMode !== 'multi', 'Skipping multi-org test for single-org mode')

      await page.goto('/profile')

      // Should show organization switcher
      const orgSwitcher = page.getByTestId('organization-switcher')
      await expect(orgSwitcher).toBeVisible()

      // Test switching organizations
      await orgSwitcher.click()
      
      const orgOptions = page.getByTestId('organization-option')
      if (await orgOptions.count() > 1) {
        await orgOptions.nth(1).click()
        
        // Profile should update with new org context
        await expect(page.getByTestId('profile-form')).toBeVisible()
        
        // Organization name should be updated
        const newOrgName = await page.getByTestId('current-organization-name').textContent()
        expect(newOrgName).toBeTruthy()
      }
    })
  })

  test.describe('Mobile Profile Management', () => {
    test('should work seamlessly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto('/profile')

      // Profile should be responsive
      await expect(page.getByTestId('mobile-profile-container')).toBeVisible()

      // Tab navigation should work on mobile
      await page.getByTestId('mobile-tab-nav').click()
      await page.getByTestId('preferences-mobile-tab').click()
      
      await expect(page.getByTestId('preferences-form')).toBeVisible()

      // Mobile avatar upload should work
      await page.getByTestId('mobile-avatar-section').click()
      await expect(page.getByTestId('mobile-avatar-upload')).toBeVisible()
    })
  })

  test.describe('Profile Security and Privacy', () => {
    test('should handle security settings properly', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('security-tab').click()

      // Should show security dashboard
      await expect(page.getByTestId('security-dashboard')).toBeVisible()

      // Test two-factor authentication setup
      if (await page.getByTestId('setup-2fa-button').isVisible()) {
        await page.getByTestId('setup-2fa-button').click()
        await expect(page.getByTestId('2fa-setup-modal')).toBeVisible()
      }

      // Test password change
      await page.getByTestId('change-password-section').click()
      await page.getByTestId('current-password-input').fill('TestPassword123!')
      await page.getByTestId('new-password-input').fill('NewPassword456!')
      await page.getByTestId('confirm-password-input').fill('NewPassword456!')
      
      await page.getByTestId('update-password-button').click()
      await expect(page.getByText(/password.*updated/i)).toBeVisible()

      // Test session management
      await page.getByTestId('active-sessions-section').click()
      await expect(page.getByTestId('sessions-list')).toBeVisible()
      
      // Should be able to revoke sessions
      const revokeButton = page.getByTestId('revoke-session-button').first()
      if (await revokeButton.isVisible()) {
        await revokeButton.click()
        await expect(page.getByText(/session.*revoked/i)).toBeVisible()
      }
    })
  })
})