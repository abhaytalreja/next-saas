import { test, expect, Page } from '@playwright/test'

// Use authenticated state
test.use({ storageState: 'playwright/.auth/user.json' })

class ProfilePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings/profile')
    await this.page.waitForLoadState('networkidle')
  }

  async fillBasicInfo(data: {
    firstName?: string
    lastName?: string
    displayName?: string
    bio?: string
  }) {
    if (data.firstName) {
      await this.page.fill('input[name="first_name"]', data.firstName)
    }
    if (data.lastName) {
      await this.page.fill('input[name="last_name"]', data.lastName)
    }
    if (data.displayName) {
      await this.page.fill('input[name="display_name"]', data.displayName)
    }
    if (data.bio) {
      await this.page.fill('textarea[name="bio"]', data.bio)
    }
  }

  async fillContactInfo(data: {
    phoneNumber?: string
    email?: string
  }) {
    if (data.phoneNumber) {
      await this.page.fill('input[name="phone_number"]', data.phoneNumber)
    }
    if (data.email) {
      await this.page.fill('input[name="email"]', data.email)
    }
  }

  async fillProfessionalInfo(data: {
    company?: string
    jobTitle?: string
  }) {
    if (data.company) {
      await this.page.fill('input[name="company"]', data.company)
    }
    if (data.jobTitle) {
      await this.page.fill('input[name="job_title"]', data.jobTitle)
    }
  }

  async fillLocationInfo(data: {
    location?: string
    timezone?: string
  }) {
    if (data.location) {
      await this.page.fill('input[name="location"]', data.location)
    }
    if (data.timezone) {
      await this.page.selectOption('select[name="timezone"]', data.timezone)
    }
  }

  async uploadAvatar(fileName: string = 'test-avatar.jpg') {
    // Create a test image file
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    )

    await this.page.setInputFiles('input[type="file"]', {
      name: fileName,
      mimeType: 'image/jpeg',
      buffer,
    })

    // Wait for upload to complete
    await expect(this.page.locator('text=Upload successful')).toBeVisible({ timeout: 10000 })
  }

  async saveProfile() {
    await this.page.click('button:has-text("Save Profile")')
    await expect(this.page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10000 })
  }

  async getCompletenessPercentage(): Promise<number> {
    const completenessText = await this.page.locator('[data-testid="profile-completeness-percentage"]').textContent()
    return parseInt(completenessText?.replace('%', '') || '0')
  }

  async getCompletionSuggestions(): Promise<string[]> {
    const suggestions = await this.page.locator('[data-testid="completion-suggestion"]').allTextContents()
    return suggestions
  }
}

class PreferencesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings/preferences')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToSection(section: 'theme' | 'notifications' | 'privacy' | 'accessibility' | 'data') {
    await this.page.click(`button:has-text("${this.getSectionName(section)}")`)
    await this.page.waitForTimeout(500) // Wait for section to load
  }

  private getSectionName(section: string): string {
    const sectionNames = {
      theme: 'Theme & Display',
      notifications: 'Notifications',
      privacy: 'Privacy',
      accessibility: 'Accessibility',
      data: 'Data & Storage'
    }
    return sectionNames[section as keyof typeof sectionNames] || section
  }

  async setTheme(theme: 'light' | 'dark' | 'system') {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="theme"]', theme)
  }

  async setLanguage(language: string) {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="language"]', language)
  }

  async toggleEmailNotifications(enabled: boolean) {
    await this.navigateToSection('notifications')
    const toggle = this.page.locator('input[name="email_notifications_enabled"]')
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  async setEmailFrequency(frequency: 'immediate' | 'hourly' | 'daily' | 'weekly') {
    await this.navigateToSection('notifications')
    await this.page.selectOption('select[name="email_frequency"]', frequency)
  }

  async setProfileVisibility(visibility: 'public' | 'organization' | 'private') {
    await this.navigateToSection('privacy')
    await this.page.selectOption('select[name="profile_visibility"]', visibility)
  }

  async enableHighContrast(enabled: boolean) {
    await this.navigateToSection('accessibility')
    const toggle = this.page.locator('input[name="high_contrast"]')
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  async savePreferences() {
    await this.page.click('button:has-text("Save Preferences")')
    await expect(this.page.locator('text=Preferences updated successfully')).toBeVisible({ timeout: 10000 })
  }
}

class ActivityDashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings/activity')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToTab(tab: 'recent' | 'sessions' | 'security' | 'devices') {
    const tabNames = {
      recent: 'Recent Activity',
      sessions: 'Active Sessions',
      security: 'Security Events',
      devices: 'Devices'
    }
    await this.page.click(`button:has-text("${tabNames[tab]}")`)
    await this.page.waitForTimeout(1000) // Wait for tab content to load
  }

  async filterActivities(action?: string, status?: string) {
    if (action) {
      await this.page.selectOption('select[name="action_filter"]', action)
    }
    if (status) {
      await this.page.selectOption('select[name="status_filter"]', status)
    }
    await this.page.waitForTimeout(500) // Wait for filter to apply
  }

  async getActivityCount(): Promise<number> {
    const activities = await this.page.locator('[data-testid="activity-item"]').count()
    return activities
  }

  async getSessionCount(): Promise<number> {
    await this.navigateToTab('sessions')
    const sessions = await this.page.locator('[data-testid="session-item"]').count()
    return sessions
  }

  async revokeSession(sessionIndex: number = 0) {
    await this.navigateToTab('sessions')
    const revokeButtons = this.page.locator('button:has-text("Revoke")')
    if (await revokeButtons.count() > sessionIndex) {
      await revokeButtons.nth(sessionIndex).click()
      await expect(this.page.locator('text=Session revoked successfully')).toBeVisible({ timeout: 5000 })
    }
  }
}

test.describe('Profile Management E2E Tests', () => {
  let profilePage: ProfilePage
  let preferencesPage: PreferencesPage
  let activityPage: ActivityDashboardPage

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page)
    preferencesPage = new PreferencesPage(page)
    activityPage = new ActivityDashboardPage(page)
  })

  test.describe('Complete Profile Setup Journey', () => {
    test('should guide user through complete profile setup', async ({ page }) => {
      await profilePage.goto()

      // Step 1: Check initial profile completeness
      const initialCompleteness = await profilePage.getCompletenessPercentage()
      expect(initialCompleteness).toBeGreaterThanOrEqual(0)

      // Step 2: Fill in basic information
      await profilePage.fillBasicInfo({
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'johndoe',
        bio: 'Full-stack developer with 5+ years of experience'
      })

      // Step 3: Add contact information
      await profilePage.fillContactInfo({
        phoneNumber: '+1234567890'
      })

      // Step 4: Add professional information
      await profilePage.fillProfessionalInfo({
        company: 'Tech Corp',
        jobTitle: 'Senior Developer'
      })

      // Step 5: Add location information
      await profilePage.fillLocationInfo({
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles'
      })

      // Step 6: Upload avatar
      await profilePage.uploadAvatar()

      // Step 7: Save profile
      await profilePage.saveProfile()

      // Step 8: Verify completeness improved
      const finalCompleteness = await profilePage.getCompletenessPercentage()
      expect(finalCompleteness).toBeGreaterThan(initialCompleteness)
      expect(finalCompleteness).toBeGreaterThanOrEqual(90)

      // Step 9: Verify profile data persists after page reload
      await page.reload()
      await expect(page.locator('input[name="first_name"]')).toHaveValue('John')
      await expect(page.locator('input[name="last_name"]')).toHaveValue('Doe')
      await expect(page.locator('textarea[name="bio"]')).toHaveValue('Full-stack developer with 5+ years of experience')
    })

    test('should show completion suggestions and hide them as user progresses', async ({ page }) => {
      await profilePage.goto()

      // Get initial suggestions
      const initialSuggestions = await profilePage.getCompletionSuggestions()
      expect(initialSuggestions.length).toBeGreaterThan(0)

      // Fill in some information
      await profilePage.fillBasicInfo({
        bio: 'Adding a bio to improve profile completeness'
      })
      await profilePage.saveProfile()

      // Verify suggestions updated
      const updatedSuggestions = await profilePage.getCompletionSuggestions()
      expect(updatedSuggestions.length).toBeLessThanOrEqual(initialSuggestions.length)
    })

    test('should handle validation errors gracefully', async ({ page }) => {
      await profilePage.goto()

      // Try to save with invalid data
      await profilePage.fillBasicInfo({
        firstName: '', // Empty first name should be invalid
        displayName: 'invalid@name' // Invalid display name format
      })

      await page.click('button:has-text("Save Profile")')

      // Should show validation errors
      await expect(page.locator('text=First name is required')).toBeVisible()
      await expect(page.locator('text=Invalid display name')).toBeVisible()

      // Fix the errors
      await profilePage.fillBasicInfo({
        firstName: 'John',
        displayName: 'johndoe'
      })

      await profilePage.saveProfile()
      // Should succeed now
    })
  })

  test.describe('Preferences Management Journey', () => {
    test('should manage preferences across all sections', async ({ page }) => {
      await preferencesPage.goto()

      // Theme & Display preferences
      await preferencesPage.setTheme('dark')
      await preferencesPage.setLanguage('en')

      // Notification preferences
      await preferencesPage.toggleEmailNotifications(true)
      await preferencesPage.setEmailFrequency('daily')

      // Privacy preferences
      await preferencesPage.setProfileVisibility('organization')

      // Accessibility preferences
      await preferencesPage.enableHighContrast(true)

      // Save all preferences
      await preferencesPage.savePreferences()

      // Verify theme change is applied immediately
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Verify preferences persist after page reload
      await page.reload()
      await preferencesPage.navigateToSection('theme')
      await expect(page.locator('select[name="theme"]')).toHaveValue('dark')

      await preferencesPage.navigateToSection('privacy')
      await expect(page.locator('select[name="profile_visibility"]')).toHaveValue('organization')
    })

    test('should show conditional fields based on preferences', async ({ page }) => {
      await preferencesPage.goto()

      // Navigate to notifications
      await preferencesPage.navigateToSection('notifications')

      // Disable email notifications
      await preferencesPage.toggleEmailNotifications(false)

      // Email frequency should be hidden
      await expect(page.locator('select[name="email_frequency"]')).not.toBeVisible()

      // Enable email notifications
      await preferencesPage.toggleEmailNotifications(true)

      // Email frequency should now be visible
      await expect(page.locator('select[name="email_frequency"]')).toBeVisible()
    })

    test('should handle theme switching correctly', async ({ page }) => {
      await preferencesPage.goto()

      // Test light theme
      await preferencesPage.setTheme('light')
      await preferencesPage.savePreferences()
      await expect(page.locator('html')).not.toHaveClass(/dark/)

      // Test dark theme
      await preferencesPage.setTheme('dark')
      await preferencesPage.savePreferences()
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Test system theme (should detect system preference)
      await preferencesPage.setTheme('system')
      await preferencesPage.savePreferences()
      // Theme class should match system preference
    })
  })

  test.describe('Activity Monitoring Journey', () => {
    test('should display user activity across different tabs', async ({ page }) => {
      await activityPage.goto()

      // Recent Activity tab (default)
      const activityCount = await activityPage.getActivityCount()
      expect(activityCount).toBeGreaterThanOrEqual(0)

      // Active Sessions tab
      const sessionCount = await activityPage.getSessionCount()
      expect(sessionCount).toBeGreaterThanOrEqual(1) // At least current session

      // Security Events tab
      await activityPage.navigateToTab('security')
      await expect(page.locator('[data-testid="activity-item"]')).toBeVisible({ timeout: 5000 })

      // Devices tab
      await activityPage.navigateToTab('devices')
      await expect(page.locator('[data-testid="device-item"]')).toBeVisible({ timeout: 5000 })
    })

    test('should filter activities correctly', async ({ page }) => {
      await activityPage.goto()

      // Apply action filter
      await activityPage.filterActivities('login')
      
      // Should show only login activities
      const loginActivities = page.locator('[data-testid="activity-item"]:has-text("login")')
      const totalActivities = page.locator('[data-testid="activity-item"]')
      
      const loginCount = await loginActivities.count()
      const totalCount = await totalActivities.count()
      
      if (totalCount > 0) {
        expect(loginCount).toBe(totalCount) // All visible activities should be login activities
      }

      // Apply status filter
      await activityPage.filterActivities(undefined, 'success')
      
      // Should show only successful activities
      const successActivities = page.locator('[data-testid="activity-item"]:has-text("success")')
      const newTotalCount = await totalActivities.count()
      const successCount = await successActivities.count()
      
      if (newTotalCount > 0) {
        expect(successCount).toBe(newTotalCount)
      }
    })

    test('should handle session management', async ({ page }) => {
      await activityPage.goto()
      await activityPage.navigateToTab('sessions')

      const initialSessionCount = await activityPage.getSessionCount()
      
      // Current session should be marked and not revocable
      await expect(page.locator('text=Current')).toBeVisible()
      await expect(page.locator('button:has-text("Revoke")').first()).not.toBeVisible()

      // If there are other sessions, test revocation
      if (initialSessionCount > 1) {
        await activityPage.revokeSession(1) // Revoke second session
        
        // Session count should decrease
        const newSessionCount = await activityPage.getSessionCount()
        expect(newSessionCount).toBeLessThan(initialSessionCount)
      }
    })
  })

  test.describe('Cross-Component Integration', () => {
    test('should track profile updates in activity log', async ({ page }) => {
      // Start on activity page to get baseline
      await activityPage.goto()
      const initialActivityCount = await activityPage.getActivityCount()

      // Make profile updates
      await profilePage.goto()
      await profilePage.fillBasicInfo({
        bio: `Updated bio at ${new Date().toISOString()}`
      })
      await profilePage.saveProfile()

      // Return to activity page and verify new activity
      await activityPage.goto()
      const newActivityCount = await activityPage.getActivityCount()
      expect(newActivityCount).toBeGreaterThan(initialActivityCount)

      // Should see profile update activity
      await expect(page.locator('text=profile_update')).toBeVisible()
    })

    test('should reflect preference changes in activity log', async ({ page }) => {
      // Get baseline activity count
      await activityPage.goto()
      const initialActivityCount = await activityPage.getActivityCount()

      // Change preferences
      await preferencesPage.goto()
      await preferencesPage.setTheme('light')
      await preferencesPage.savePreferences()

      // Verify activity was logged
      await activityPage.goto()
      const newActivityCount = await activityPage.getActivityCount()
      expect(newActivityCount).toBeGreaterThan(initialActivityCount)

      // Should see preferences update activity
      await expect(page.locator('text=preferences_update')).toBeVisible()
    })

    test('should maintain consistent state across page navigation', async ({ page }) => {
      // Set theme to dark
      await preferencesPage.goto()
      await preferencesPage.setTheme('dark')
      await preferencesPage.savePreferences()

      // Navigate to profile page - should maintain dark theme
      await profilePage.goto()
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Navigate to activity page - should maintain dark theme
      await activityPage.goto()
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Update profile - theme should persist
      await profilePage.goto()
      await profilePage.fillBasicInfo({ bio: 'Testing theme persistence' })
      await profilePage.saveProfile()
      await expect(page.locator('html')).toHaveClass(/dark/)
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await profilePage.goto()

      // Simulate network failure
      await page.route('**/api/profile**', route => route.abort())

      await profilePage.fillBasicInfo({ firstName: 'Network Test' })
      await page.click('button:has-text("Save Profile")')

      // Should show error message
      await expect(page.locator('text=failed')).toBeVisible({ timeout: 10000 })

      // Restore network and retry
      await page.unroute('**/api/profile**')
      await page.click('button:has-text("Save Profile")')

      // Should succeed
      await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10000 })
    })

    test('should handle large file uploads appropriately', async ({ page }) => {
      await profilePage.goto()

      // Try to upload a file that's too large (simulate 6MB file)
      const largeBuffer = Buffer.alloc(1024) // Smaller buffer for test, but we'll mock the size check

      await page.setInputFiles('input[type="file"]', {
        name: 'large-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: largeBuffer,
      })

      // Should show appropriate error message
      await expect(page.locator('text=too large')).toBeVisible({ timeout: 5000 })
    })

    test('should handle concurrent operations correctly', async ({ page, context }) => {
      // Open two tabs
      const page1 = page
      const page2 = await context.newPage()

      // Navigate both to profile page
      await profilePage.goto()
      const profilePage2 = new ProfilePage(page2)
      await profilePage2.goto()

      // Make different changes in each tab
      await profilePage.fillBasicInfo({ firstName: 'Tab1User' })
      await profilePage2.fillBasicInfo({ firstName: 'Tab2User' })

      // Save both (one should override the other)
      await Promise.all([
        profilePage.saveProfile(),
        profilePage2.saveProfile()
      ])

      // Both should complete without errors
      await expect(page1.locator('text=Profile updated successfully')).toBeVisible()
      await expect(page2.locator('text=Profile updated successfully')).toBeVisible()

      // Reload to see final state
      await page1.reload()
      const finalValue = await page1.locator('input[name="first_name"]').inputValue()
      expect(['Tab1User', 'Tab2User']).toContain(finalValue)

      await page2.close()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size

      await profilePage.goto()

      // Mobile navigation should work
      await expect(page.locator('h1')).toBeVisible()

      // Form should be usable on mobile
      await profilePage.fillBasicInfo({
        firstName: 'Mobile',
        lastName: 'User'
      })

      // Save button should be accessible
      await profilePage.saveProfile()

      // Preferences should work on mobile
      await preferencesPage.goto()
      await preferencesPage.setTheme('dark')
      await preferencesPage.savePreferences()

      // Activity dashboard should work on mobile
      await activityPage.goto()
      await activityPage.navigateToTab('sessions')
      await expect(page.locator('[data-testid="session-item"]')).toBeVisible()
    })
  })
})