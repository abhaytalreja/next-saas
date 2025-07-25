import { test, expect } from '@playwright/test'

/**
 * Organization-Specific Profile Management E2E Tests
 * Tests profile management within organization contexts
 */

test.describe('Organization Profile Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as organization admin/owner
    await page.goto('/auth/signin')
    await page.getByTestId('login-email-input').fill('admin@testorg.com')
    await page.getByTestId('login-password-input').fill('AdminPassword123!')
    await page.getByTestId('login-submit-button').click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test.describe('Organization-Aware Profile Management', () => {
    test('should display organization context throughout profile management', async ({ page }) => {
      await page.goto('/profile')

      // Should show current organization context
      await expect(page.getByTestId('current-organization-badge')).toBeVisible()
      
      // Should show organization-specific profile fields
      await expect(page.getByTestId('organization-role-display')).toBeVisible()
      await expect(page.getByTestId('organization-join-date')).toBeVisible()

      // Should show organization permissions
      const userRole = await page.getByTestId('user-role-badge').textContent()
      expect(['admin', 'owner', 'member']).toContain(userRole?.toLowerCase())

      // Profile form should include organization-specific fields
      if (userRole === 'admin' || userRole === 'owner') {
        await expect(page.getByTestId('org-admin-profile-section')).toBeVisible()
      }
    })

    test('should manage organization visibility settings', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('privacy-settings-section').click()

      // Should show organization visibility options
      await expect(page.getByTestId('profile-visibility-org-settings')).toBeVisible()

      // Test different visibility levels
      await page.getByTestId('visibility-organization-only').check()
      await page.getByTestId('save-privacy-settings-button').click()
      await expect(page.getByText(/privacy settings updated/i)).toBeVisible()

      // Test department-specific visibility
      await page.getByTestId('visibility-department-only').check()
      await page.getByTestId('save-privacy-settings-button').click()

      // Verify visibility settings are applied
      await page.reload()
      await expect(page.getByTestId('visibility-department-only')).toBeChecked()
    })

    test('should handle organization directory listing preferences', async ({ page }) => {
      await page.goto('/profile')
      await page.getByTestId('directory-settings-section').click()

      // Should show directory listing options
      await expect(page.getByTestId('directory-listing-preferences')).toBeVisible()

      // Test opting out of directory
      await page.getByTestId('include-in-directory-checkbox').uncheck()
      await page.getByTestId('save-directory-settings-button').click()

      // Should confirm directory settings
      await expect(page.getByText(/directory preferences updated/i)).toBeVisible()

      // Test selective field visibility in directory
      await page.getByTestId('include-in-directory-checkbox').check()
      await page.getByTestId('show-email-in-directory').uncheck()
      await page.getByTestId('show-phone-in-directory').check()
      
      await page.getByTestId('save-directory-settings-button').click()
      await expect(page.getByText(/directory preferences updated/i)).toBeVisible()
    })
  })

  test.describe('Multi-Organization Profile Management', () => {
    test('should switch between organization profiles seamlessly', async ({ page }) => {
      // Skip if not in multi-org mode
      const orgMode = await page.locator('[data-organization-mode]').getAttribute('data-organization-mode')
      test.skip(orgMode !== 'multi', 'Multi-org test requires multi-organization mode')

      await page.goto('/profile')

      // Should show organization switcher
      await expect(page.getByTestId('organization-profile-switcher')).toBeVisible()

      // Get current organization
      const currentOrg = await page.getByTestId('current-organization-name').textContent()

      // Switch to different organization
      await page.getByTestId('organization-profile-switcher').click()
      const orgOptions = page.getByTestId('organization-option')
      
      if (await orgOptions.count() > 1) {
        const secondOrg = orgOptions.nth(1)
        const secondOrgName = await secondOrg.textContent()
        
        await secondOrg.click()

        // Profile should update for new organization
        await expect(page.getByTestId('current-organization-name')).not.toContainText(currentOrg || '')
        await expect(page.getByTestId('current-organization-name')).toContainText(secondOrgName || '')

        // Role and permissions should update
        await expect(page.getByTestId('user-role-badge')).toBeVisible()

        // Organization-specific profile data should load
        await expect(page.getByTestId('organization-profile-data')).toBeVisible()
      }
    })

    test('should maintain separate profile data per organization', async ({ page }) => {
      const orgMode = await page.locator('[data-organization-mode]').getAttribute('data-organization-mode')
      test.skip(orgMode !== 'multi', 'Multi-org test requires multi-organization mode')

      await page.goto('/profile')

      // Set bio for first organization
      const firstOrgBio = 'Bio for first organization'
      await page.getByTestId('profile-bio-input').fill(firstOrgBio)
      await page.getByTestId('profile-save-button').click()

      // Switch to second organization
      await page.getByTestId('organization-profile-switcher').click()
      const orgOptions = page.getByTestId('organization-option')
      
      if (await orgOptions.count() > 1) {
        await orgOptions.nth(1).click()

        // Bio should be different (or empty) for second organization
        const secondOrgBio = await page.getByTestId('profile-bio-input').inputValue()
        expect(secondOrgBio).not.toBe(firstOrgBio)

        // Set bio for second organization
        await page.getByTestId('profile-bio-input').fill('Bio for second organization')
        await page.getByTestId('profile-save-button').click()

        // Switch back to first organization
        await page.getByTestId('organization-profile-switcher').click()
        await orgOptions.nth(0).click()

        // First organization bio should be preserved
        const restoredBio = await page.getByTestId('profile-bio-input').inputValue()
        expect(restoredBio).toBe(firstOrgBio)
      }
    })
  })

  test.describe('Organization Admin Profile Features', () => {
    test('should provide organization management capabilities for admins', async ({ page }) => {
      await page.goto('/profile')

      // Check if user has admin privileges
      const userRole = await page.getByTestId('user-role-badge').textContent()
      test.skip(!['admin', 'owner'].includes(userRole?.toLowerCase() || ''), 'Admin-only test')

      // Should show organization management section
      await expect(page.getByTestId('organization-management-section')).toBeVisible()

      // Test organization settings access
      await page.getByTestId('manage-organization-button').click()
      await expect(page.getByTestId('organization-settings-modal')).toBeVisible()

      // Should be able to update organization profile
      await page.getByTestId('org-name-input').fill('Updated Organization Name')
      await page.getByTestId('org-description-input').fill('Updated organization description')
      
      await page.getByTestId('save-org-settings-button').click()
      await expect(page.getByText(/organization.*updated/i)).toBeVisible()

      // Should be able to manage organization branding
      await page.getByTestId('org-branding-tab').click()
      
      // Test logo upload
      const logoInput = page.getByTestId('org-logo-input')
      await logoInput.setInputFiles({
        name: 'org-logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-logo-data')
      })

      await page.getByTestId('save-org-branding-button').click()
      await expect(page.getByText(/branding.*updated/i)).toBeVisible()
    })

    test('should manage team member profiles and permissions', async ({ page }) => {
      await page.goto('/profile')

      const userRole = await page.getByTestId('user-role-badge').textContent()
      test.skip(!['admin', 'owner'].includes(userRole?.toLowerCase() || ''), 'Admin-only test')

      // Navigate to team management
      await page.getByTestId('team-management-section').click()
      await expect(page.getByTestId('team-members-list')).toBeVisible()

      // Should show team member profiles
      const teamMembers = page.getByTestId('team-member-card')
      await expect(teamMembers.first()).toBeVisible()

      // Test member role management
      await teamMembers.first().click()
      await expect(page.getByTestId('member-profile-modal')).toBeVisible()

      // Should be able to update member roles (if owner)
      if (userRole?.toLowerCase() === 'owner') {
        await page.getByTestId('member-role-selector').selectOption('admin')
        await page.getByTestId('update-member-role-button').click()
        await expect(page.getByText(/member role updated/i)).toBeVisible()
      }

      // Should be able to manage member profile visibility
      await page.getByTestId('member-visibility-settings').click()
      await page.getByTestId('hide-member-from-directory').check()
      await page.getByTestId('save-member-visibility-button').click()
    })
  })

  test.describe('Organization Directory Integration', () => {
    test('should display user in organization directory correctly', async ({ page }) => {
      // First, ensure user is visible in directory
      await page.goto('/profile')
      await page.getByTestId('directory-settings-section').click()
      await page.getByTestId('include-in-directory-checkbox').check()
      await page.getByTestId('save-directory-settings-button').click()

      // Navigate to organization directory
      await page.goto('/directory')
      await expect(page.getByTestId('organization-directory')).toBeVisible()

      // User should appear in directory
      const currentUser = await page.getByTestId('current-user-email').textContent()
      await expect(page.getByText(currentUser || '')).toBeVisible()

      // Profile information should be visible based on settings
      await expect(page.getByTestId('directory-user-card')).toBeVisible()
    })

    test('should respect privacy settings in directory display', async ({ page }) => {
      // Set specific privacy settings
      await page.goto('/profile')
      await page.getByTestId('directory-settings-section').click()
      
      // Hide email but show phone in directory
      await page.getByTestId('show-email-in-directory').uncheck()
      await page.getByTestId('show-phone-in-directory').check()
      await page.getByTestId('save-directory-settings-button').click()

      // Check directory display
      await page.goto('/directory')
      
      const userCard = page.getByTestId('directory-user-card').first()
      
      // Email should be hidden
      await expect(userCard.getByTestId('user-email')).not.toBeVisible()
      
      // Phone should be visible (if provided)
      const phoneElement = userCard.getByTestId('user-phone')
      if (await phoneElement.isVisible()) {
        await expect(phoneElement).toBeVisible()
      }
    })

    test('should handle department-based directory filtering', async ({ page }) => {
      await page.goto('/directory')

      // Should show department filter
      await expect(page.getByTestId('department-filter')).toBeVisible()

      // Test filtering by department
      await page.getByTestId('department-filter').selectOption('Engineering')
      
      // Directory should update to show only engineering team
      const engineeringMembers = page.getByTestId('directory-user-card')
      await expect(engineeringMembers.first()).toBeVisible()

      // Verify all visible members are in engineering
      const memberCount = await engineeringMembers.count()
      for (let i = 0; i < memberCount; i++) {
        const member = engineeringMembers.nth(i)
        const department = await member.getByTestId('user-department').textContent()
        expect(department).toContain('Engineering')
      }
    })
  })

  test.describe('Organization Profile Analytics', () => {
    test('should display profile completion analytics for organization', async ({ page }) => {
      const userRole = await page.getByTestId('user-role-badge').textContent()
      test.skip(!['admin', 'owner'].includes(userRole?.toLowerCase() || ''), 'Admin-only analytics')

      await page.goto('/profile')
      await page.getByTestId('org-analytics-section').click()

      // Should show organization-wide profile completion stats
      await expect(page.getByTestId('org-profile-completion-chart')).toBeVisible()

      // Should show department breakdown
      await expect(page.getByTestId('department-completion-breakdown')).toBeVisible()

      // Should show improvement suggestions
      await expect(page.getByTestId('profile-improvement-suggestions')).toBeVisible()

      // Test filtering analytics by date range
      await page.getByTestId('analytics-date-filter').click()
      await page.getByTestId('last-30-days-option').click()

      // Analytics should update
      await expect(page.getByTestId('analytics-loading-indicator')).toBeVisible()
      await expect(page.getByTestId('analytics-loading-indicator')).not.toBeVisible()
    })

    test('should track profile engagement metrics', async ({ page }) => {
      const userRole = await page.getByTestId('user-role-badge').textContent()
      test.skip(!['admin', 'owner'].includes(userRole?.toLowerCase() || ''), 'Admin-only analytics')

      await page.goto('/profile')
      await page.getByTestId('engagement-analytics-section').click()

      // Should show profile view metrics
      await expect(page.getByTestId('profile-views-chart')).toBeVisible()

      // Should show directory interaction stats
      await expect(page.getByTestId('directory-interactions-stats')).toBeVisible()

      // Should show most active profile updaters
      await expect(page.getByTestId('most-active-users-list')).toBeVisible()
    })
  })

  test.describe('Organization Profile Workflows', () => {
    test('should handle employee onboarding profile setup', async ({ page }) => {
      // Simulate new employee onboarding flow
      await page.goto('/profile?onboarding=true')

      // Should show onboarding checklist
      await expect(page.getByTestId('onboarding-checklist')).toBeVisible()

      // Complete profile setup steps
      const steps = [
        'complete-basic-info',
        'upload-profile-photo',
        'set-department-role',
        'configure-privacy-settings',
        'join-team-channels'
      ]

      for (const step of steps) {
        const stepElement = page.getByTestId(step)
        if (await stepElement.isVisible()) {
          await stepElement.click()
          
          // Complete the step (simplified)
          await page.getByTestId(`complete-${step}-button`).click()
          
          // Step should be marked as complete
          await expect(stepElement.getByTestId('step-completed-icon')).toBeVisible()
        }
      }

      // Should show onboarding completion
      await expect(page.getByTestId('onboarding-complete-message')).toBeVisible()
    })

    test('should handle profile verification workflow', async ({ page }) => {
      await page.goto('/profile')

      // Check if profile needs verification
      const verificationBanner = page.getByTestId('profile-verification-banner')
      if (await verificationBanner.isVisible()) {
        await verificationBanner.click()

        // Should show verification requirements
        await expect(page.getByTestId('verification-requirements-modal')).toBeVisible()

        // Complete verification steps
        await page.getByTestId('verify-email-button').click()
        await expect(page.getByText(/verification email sent/i)).toBeVisible()

        // Upload identity verification documents
        const docUpload = page.getByTestId('identity-document-upload')
        if (await docUpload.isVisible()) {
          await docUpload.setInputFiles({
            name: 'id-document.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('document-image-data')
          })

          await page.getByTestId('submit-verification-button').click()
          await expect(page.getByText(/verification submitted/i)).toBeVisible()
        }
      }
    })
  })

  test.describe('Organization Profile Compliance', () => {
    test('should enforce organization profile policies', async ({ page }) => {
      await page.goto('/profile')

      // Should show policy compliance status
      await expect(page.getByTestId('policy-compliance-indicator')).toBeVisible()

      // Test required field enforcement
      if (await page.getByTestId('required-field-warning').isVisible()) {
        // Should prevent saving incomplete profile
        await page.getByTestId('profile-save-button').click()
        await expect(page.getByText(/required fields must be completed/i)).toBeVisible()

        // Complete required fields
        await page.getByTestId('profile-job-title-input').fill('Software Engineer')
        await page.getByTestId('profile-department-select').selectOption('Engineering')

        // Should now allow saving
        await page.getByTestId('profile-save-button').click()
        await expect(page.getByText(/profile updated successfully/i)).toBeVisible()
      }
    })

    test('should audit profile changes for compliance', async ({ page }) => {
      const userRole = await page.getByTestId('user-role-badge').textContent()
      test.skip(!['admin', 'owner'].includes(userRole?.toLowerCase() || ''), 'Admin-only audit access')

      await page.goto('/profile')
      await page.getByTestId('audit-log-section').click()

      // Should show profile change audit log
      await expect(page.getByTestId('profile-audit-log')).toBeVisible()

      // Should show detailed change history
      const auditEntries = page.getByTestId('audit-entry')
      if (await auditEntries.first().isVisible()) {
        await auditEntries.first().click()
        await expect(page.getByTestId('audit-entry-details')).toBeVisible()
        
        // Should show what changed, when, and who made the change
        await expect(page.getByTestId('change-details')).toBeVisible()
        await expect(page.getByTestId('change-timestamp')).toBeVisible()
        await expect(page.getByTestId('change-author')).toBeVisible()
      }
    })
  })
})