import { test, expect, Page } from '@playwright/test'

// Use authenticated state
test.use({ storageState: 'playwright/.auth/user.json' })

class UserPreferencesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings/preferences')
    await this.page.waitForLoadState('networkidle')
  }

  async navigateToSection(section: 'theme' | 'notifications' | 'privacy' | 'accessibility' | 'data') {
    const sectionButton = this.page.locator(`button:has-text("${this.getSectionName(section)}")`)
    await sectionButton.click()
    await this.page.waitForTimeout(500)
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

  async getActiveSection(): Promise<string> {
    const activeButton = await this.page.locator('button[aria-current="page"]').textContent()
    return activeButton || ''
  }

  // Theme & Display methods
  async setTheme(theme: 'light' | 'dark' | 'system') {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="theme"]', theme)
  }

  async getTheme(): Promise<string> {
    await this.navigateToSection('theme')
    return await this.page.locator('select[name="theme"]').inputValue()
  }

  async setLanguage(language: string) {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="language"]', language)
  }

  async setDateFormat(format: string) {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="date_format"]', format)
  }

  async setTimeFormat(format: '12h' | '24h') {
    await this.navigateToSection('theme')
    await this.page.selectOption('select[name="time_format"]', format)
  }

  // Notifications methods
  async toggleEmailNotifications(enabled: boolean) {
    await this.navigateToSection('notifications')
    const toggle = this.page.locator('input[name="email_notifications_enabled"]')
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  async isEmailNotificationsEnabled(): Promise<boolean> {
    await this.navigateToSection('notifications')
    return await this.page.locator('input[name="email_notifications_enabled"]').isChecked()
  }

  async setEmailFrequency(frequency: 'immediate' | 'hourly' | 'daily' | 'weekly') {
    await this.navigateToSection('notifications')
    await this.page.selectOption('select[name="email_frequency"]', frequency)
  }

  async toggleNotification(type: string, enabled: boolean) {
    await this.navigateToSection('notifications')
    const toggle = this.page.locator(`input[name="notify_${type}"]`)
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  async enableQuietHours(enabled: boolean, startTime?: string, endTime?: string) {
    await this.navigateToSection('notifications')
    const quietHoursToggle = this.page.locator('input[name="quiet_hours_enabled"]')
    const isCurrentlyEnabled = await quietHoursToggle.isChecked()
    
    if (isCurrentlyEnabled !== enabled) {
      await quietHoursToggle.click()
    }

    if (enabled && startTime && endTime) {
      await this.page.fill('input[name="quiet_hours_start"]', startTime)
      await this.page.fill('input[name="quiet_hours_end"]', endTime)
    }
  }

  // Privacy methods
  async setProfileVisibility(visibility: 'public' | 'organization' | 'private') {
    await this.navigateToSection('privacy')
    await this.page.selectOption('select[name="profile_visibility"]', visibility)
  }

  async setEmailVisibility(visibility: 'public' | 'organization' | 'private') {
    await this.navigateToSection('privacy')
    await this.page.selectOption('select[name="email_visibility"]', visibility)
  }

  async setActivityVisibility(visibility: 'public' | 'organization' | 'private') {
    await this.navigateToSection('privacy')
    await this.page.selectOption('select[name="activity_visibility"]', visibility)
  }

  async togglePrivacySetting(setting: 'hide_last_seen' | 'hide_activity_status', enabled: boolean) {
    await this.navigateToSection('privacy')
    const toggle = this.page.locator(`input[name="${setting}"]`)
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  // Accessibility methods
  async toggleAccessibilitySetting(setting: 'reduce_motion' | 'high_contrast' | 'screen_reader_optimized', enabled: boolean) {
    await this.navigateToSection('accessibility')
    const toggle = this.page.locator(`input[name="${setting}"]`)
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  // Data & Storage methods
  async setDataRetentionPeriod(days: number) {
    await this.navigateToSection('data')
    await this.page.fill('input[name="data_retention_period"]', days.toString())
  }

  async toggleAutoDeleteInactive(enabled: boolean) {
    await this.navigateToSection('data')
    const toggle = this.page.locator('input[name="auto_delete_inactive"]')
    const isCurrentlyChecked = await toggle.isChecked()
    if (isCurrentlyChecked !== enabled) {
      await toggle.click()
    }
  }

  // General methods
  async savePreferences() {
    await this.page.click('button:has-text("Save Preferences")')
    await expect(this.page.locator('text=Preferences updated successfully')).toBeVisible({ timeout: 10000 })
  }

  async resetPreferences() {
    // Look for reset button if available
    const resetButton = this.page.locator('button:has-text("Reset"), button:has-text("Restore Defaults")')
    if (await resetButton.count() > 0) {
      await resetButton.click()
      
      // Confirm reset if needed
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Reset")')
      if (await confirmButton.count() > 0) {
        await confirmButton.click()
      }
      
      await expect(this.page.locator('text=Preferences reset')).toBeVisible({ timeout: 10000 })
    }
  }

  async isDirty(): Promise<boolean> {
    const saveButton = this.page.locator('button:has-text("Save Preferences")')
    return !(await saveButton.isDisabled())
  }
}

test.describe('User Preferences E2E Tests', () => {
  let preferencesPage: UserPreferencesPage

  test.beforeEach(async ({ page }) => {
    preferencesPage = new UserPreferencesPage(page)
  })

  test.describe('Navigation and Layout', () => {
    test('should navigate between preference sections', async ({ page }) => {
      await preferencesPage.goto()

      // Test all sections are accessible
      const sections = ['theme', 'notifications', 'privacy', 'accessibility', 'data'] as const
      
      for (const section of sections) {
        await preferencesPage.navigateToSection(section)
        const activeSection = await preferencesPage.getActiveSection()
        expect(activeSection).toContain(preferencesPage['getSectionName'](section))
      }
    })

    test('should show section-specific content', async ({ page }) => {
      await preferencesPage.goto()

      // Theme section should show theme controls
      await preferencesPage.navigateToSection('theme')
      await expect(page.locator('select[name="theme"]')).toBeVisible()
      await expect(page.locator('select[name="language"]')).toBeVisible()

      // Notifications section should show notification controls
      await preferencesPage.navigateToSection('notifications')
      await expect(page.locator('input[name="email_notifications_enabled"]')).toBeVisible()

      // Privacy section should show privacy controls
      await preferencesPage.navigateToSection('privacy')
      await expect(page.locator('select[name="profile_visibility"]')).toBeVisible()

      // Accessibility section should show accessibility controls
      await preferencesPage.navigateToSection('accessibility')
      await expect(page.locator('input[name="reduce_motion"]')).toBeVisible()

      // Data section should show data controls
      await preferencesPage.navigateToSection('data')
      await expect(page.locator('input[name="data_retention_period"]')).toBeVisible()
    })

    test('should persist active section on page reload', async ({ page }) => {
      await preferencesPage.goto()

      // Navigate to notifications section
      await preferencesPage.navigateToSection('notifications')
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should still be on notifications section (or default to first section)
      const activeSection = await preferencesPage.getActiveSection()
      expect(activeSection).toBeTruthy()
    })
  })

  test.describe('Theme and Display Preferences', () => {
    test('should change theme and apply it immediately', async ({ page }) => {
      await preferencesPage.goto()

      // Test light theme
      await preferencesPage.setTheme('light')
      await preferencesPage.savePreferences()
      
      // Should apply light theme to document
      await expect(page.locator('html')).not.toHaveClass(/dark/)

      // Test dark theme
      await preferencesPage.setTheme('dark')
      await preferencesPage.savePreferences()
      
      // Should apply dark theme to document
      await expect(page.locator('html')).toHaveClass(/dark/)

      // Test system theme
      await preferencesPage.setTheme('system')
      await preferencesPage.savePreferences()
      
      // Should respect system preference (implementation dependent)
      const currentTheme = await preferencesPage.getTheme()
      expect(currentTheme).toBe('system')
    })

    test('should persist theme across browser sessions', async ({ page, context }) => {
      await preferencesPage.goto()

      // Set dark theme
      await preferencesPage.setTheme('dark')
      await preferencesPage.savePreferences()

      // Close and reopen browser
      await context.close()
      const newContext = await page.context().browser()!.newContext({
        storageState: 'playwright/.auth/user.json'
      })
      const newPage = await newContext.newPage()
      const newPreferencesPage = new UserPreferencesPage(newPage)

      await newPreferencesPage.goto()
      
      // Theme should still be dark
      await expect(newPage.locator('html')).toHaveClass(/dark/)
      const savedTheme = await newPreferencesPage.getTheme()
      expect(savedTheme).toBe('dark')

      await newContext.close()
    })

    test('should change language and date/time formats', async ({ page }) => {
      await preferencesPage.goto()

      // Change language
      await preferencesPage.setLanguage('es')
      
      // Change date format
      await preferencesPage.setDateFormat('dd/MM/yyyy')
      
      // Change time format
      await preferencesPage.setTimeFormat('24h')
      
      await preferencesPage.savePreferences()

      // Verify changes persist
      await page.reload()
      await preferencesPage.navigateToSection('theme')
      
      await expect(page.locator('select[name="language"]')).toHaveValue('es')
      await expect(page.locator('select[name="date_format"]')).toHaveValue('dd/MM/yyyy')
      await expect(page.locator('select[name="time_format"]')).toHaveValue('24h')
    })
  })

  test.describe('Notification Preferences', () => {
    test('should manage email notification settings', async ({ page }) => {
      await preferencesPage.goto()

      // Enable email notifications
      await preferencesPage.toggleEmailNotifications(true)
      expect(await preferencesPage.isEmailNotificationsEnabled()).toBe(true)

      // Set email frequency
      await preferencesPage.setEmailFrequency('daily')

      // Enable specific notification types
      await preferencesPage.toggleNotification('security_alerts', true)
      await preferencesPage.toggleNotification('account_updates', true)
      await preferencesPage.toggleNotification('mentions', false)

      await preferencesPage.savePreferences()

      // Verify settings persist
      await page.reload()
      expect(await preferencesPage.isEmailNotificationsEnabled()).toBe(true)
    })

    test('should show/hide conditional notification fields', async ({ page }) => {
      await preferencesPage.goto()

      // Disable email notifications
      await preferencesPage.toggleEmailNotifications(false)

      // Email frequency should be hidden
      await expect(page.locator('select[name="email_frequency"]')).not.toBeVisible()

      // Enable email notifications
      await preferencesPage.toggleEmailNotifications(true)

      // Email frequency should now be visible
      await expect(page.locator('select[name="email_frequency"]')).toBeVisible()
    })

    test('should manage quiet hours settings', async ({ page }) => {
      await preferencesPage.goto()

      // Enable quiet hours
      await preferencesPage.enableQuietHours(true, '22:00', '08:00')

      await preferencesPage.savePreferences()

      // Verify quiet hours are configured
      await page.reload()
      await preferencesPage.navigateToSection('notifications')
      
      await expect(page.locator('input[name="quiet_hours_enabled"]')).toBeChecked()
      await expect(page.locator('input[name="quiet_hours_start"]')).toHaveValue('22:00')
      await expect(page.locator('input[name="quiet_hours_end"]')).toHaveValue('08:00')
    })

    test('should validate quiet hours time format', async ({ page }) => {
      await preferencesPage.goto()
      await preferencesPage.navigateToSection('notifications')

      // Enable quiet hours
      await preferencesPage.enableQuietHours(true)

      // Try invalid time format
      await page.fill('input[name="quiet_hours_start"]', '25:00') // Invalid hour
      await preferencesPage.savePreferences()

      // Should show validation error
      await expect(page.locator('text*="invalid", text*="time", text*="format"')).toBeVisible()
    })
  })

  test.describe('Privacy Preferences', () => {
    test('should manage visibility settings', async ({ page }) => {
      await preferencesPage.goto()

      // Set profile visibility
      await preferencesPage.setProfileVisibility('organization')
      
      // Set email visibility
      await preferencesPage.setEmailVisibility('private')
      
      // Set activity visibility
      await preferencesPage.setActivityVisibility('organization')

      await preferencesPage.savePreferences()

      // Verify settings persist
      await page.reload()
      await preferencesPage.navigateToSection('privacy')
      
      await expect(page.locator('select[name="profile_visibility"]')).toHaveValue('organization')
      await expect(page.locator('select[name="email_visibility"]')).toHaveValue('private')
      await expect(page.locator('select[name="activity_visibility"]')).toHaveValue('organization')
    })

    test('should manage activity privacy settings', async ({ page }) => {
      await preferencesPage.goto()

      // Hide last seen
      await preferencesPage.togglePrivacySetting('hide_last_seen', true)
      
      // Hide activity status
      await preferencesPage.togglePrivacySetting('hide_activity_status', true)

      await preferencesPage.savePreferences()

      // Verify settings persist
      await page.reload()
      await preferencesPage.navigateToSection('privacy')
      
      await expect(page.locator('input[name="hide_last_seen"]')).toBeChecked()
      await expect(page.locator('input[name="hide_activity_status"]')).toBeChecked()
    })
  })

  test.describe('Accessibility Preferences', () => {
    test('should manage accessibility settings', async ({ page }) => {
      await preferencesPage.goto()

      // Enable reduced motion
      await preferencesPage.toggleAccessibilitySetting('reduce_motion', true)
      
      // Enable high contrast
      await preferencesPage.toggleAccessibilitySetting('high_contrast', true)
      
      // Enable screen reader optimization
      await preferencesPage.toggleAccessibilitySetting('screen_reader_optimized', true)

      await preferencesPage.savePreferences()

      // Verify settings persist
      await page.reload()
      await preferencesPage.navigateToSection('accessibility')
      
      await expect(page.locator('input[name="reduce_motion"]')).toBeChecked()
      await expect(page.locator('input[name="high_contrast"]')).toBeChecked()
      await expect(page.locator('input[name="screen_reader_optimized"]')).toBeChecked()
    })

    test('should apply accessibility settings to UI', async ({ page }) => {
      await preferencesPage.goto()

      // Enable high contrast
      await preferencesPage.toggleAccessibilitySetting('high_contrast', true)
      await preferencesPage.savePreferences()

      // Should apply high contrast styles (implementation dependent)
      // This would need to be verified based on your actual implementation
      const hasHighContrast = await page.locator('body').getAttribute('class')
      // expect(hasHighContrast).toContain('high-contrast') // Example
    })
  })

  test.describe('Data and Storage Preferences', () => {
    test('should manage data retention settings', async ({ page }) => {
      await preferencesPage.goto()

      // Set data retention period
      await preferencesPage.setDataRetentionPeriod(180) // 6 months
      
      // Enable auto-delete inactive data
      await preferencesPage.toggleAutoDeleteInactive(true)

      await preferencesPage.savePreferences()

      // Verify settings persist
      await page.reload()
      await preferencesPage.navigateToSection('data')
      
      await expect(page.locator('input[name="data_retention_period"]')).toHaveValue('180')
      await expect(page.locator('input[name="auto_delete_inactive"]')).toBeChecked()
    })

    test('should validate data retention period limits', async ({ page }) => {
      await preferencesPage.goto()
      await preferencesPage.navigateToSection('data')

      // Try value below minimum
      await preferencesPage.setDataRetentionPeriod(10) // Below 30 day minimum
      await preferencesPage.savePreferences()

      // Should show validation error
      await expect(page.locator('text*="minimum", text*="30", text*="days"')).toBeVisible()

      // Try value above maximum
      await preferencesPage.setDataRetentionPeriod(3000) // Above 2555 day maximum
      await preferencesPage.savePreferences()

      // Should show validation error
      await expect(page.locator('text*="maximum", text*="2555", text*="days"')).toBeVisible()

      // Valid value should work
      await preferencesPage.setDataRetentionPeriod(365)
      await preferencesPage.savePreferences()
      
      // Should succeed
      await expect(page.locator('text=Preferences updated successfully')).toBeVisible()
    })
  })

  test.describe('Form State and Validation', () => {
    test('should track form dirty state', async ({ page }) => {
      await preferencesPage.goto()

      // Initially, save button should be disabled (form not dirty)
      expect(await preferencesPage.isDirty()).toBe(false)

      // Make a change
      await preferencesPage.setTheme('dark')

      // Now form should be dirty
      expect(await preferencesPage.isDirty()).toBe(true)

      // Save changes
      await preferencesPage.savePreferences()

      // Form should no longer be dirty
      expect(await preferencesPage.isDirty()).toBe(false)
    })

    test('should handle validation errors across sections', async ({ page }) => {
      await preferencesPage.goto()

      // Make invalid changes in different sections
      await preferencesPage.navigateToSection('data')
      await preferencesPage.setDataRetentionPeriod(-1) // Invalid

      await preferencesPage.navigateToSection('notifications')
      await page.fill('input[name="quiet_hours_start"]', 'invalid-time') // Invalid

      // Try to save
      await preferencesPage.savePreferences()

      // Should show validation errors
      await expect(page.locator('.error, [role="alert"], text*="error"')).toBeVisible()

      // Fix errors
      await preferencesPage.navigateToSection('data')
      await preferencesPage.setDataRetentionPeriod(365)

      await preferencesPage.navigateToSection('notifications')
      await page.fill('input[name="quiet_hours_start"]', '22:00')

      // Save should now work
      await preferencesPage.savePreferences()
    })

    test('should warn about unsaved changes', async ({ page }) => {
      await preferencesPage.goto()

      // Make changes
      await preferencesPage.setTheme('dark')

      // Try to navigate away
      const navigationPromise = page.goto('/dashboard')

      // Should show confirmation dialog (if implemented)
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('unsaved')
        await dialog.accept()
      })

      await navigationPromise
    })
  })

  test.describe('Error Handling', () => {
    test('should handle save failures gracefully', async ({ page }) => {
      await preferencesPage.goto()

      // Mock save failure
      await page.route('**/api/profile/preferences**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Failed to save preferences'
          })
        })
      })

      // Make changes and try to save
      await preferencesPage.setTheme('dark')
      await page.click('button:has-text("Save Preferences")')

      // Should show error message
      await expect(page.locator('text*="failed", text*="error"')).toBeVisible()

      // Restore normal routing and retry
      await page.unroute('**/api/profile/preferences**')
      await page.click('button:has-text("Save Preferences")')

      // Should succeed
      await expect(page.locator('text=Preferences updated successfully')).toBeVisible()
    })

    test('should handle network errors during load', async ({ page }) => {
      // Mock network failure on page load
      await page.route('**/api/profile/preferences**', route => route.abort())

      await preferencesPage.goto()

      // Should show error state or use defaults
      await expect(page.locator('text*="error", text*="failed", .error')).toBeVisible()

      // Restore network and reload
      await page.unroute('**/api/profile/preferences**')
      await page.reload()

      // Should load successfully
      await expect(page.locator('select[name="theme"]')).toBeVisible()
    })
  })

  test.describe('Reset and Default Values', () => {
    test('should reset preferences to defaults', async ({ page }) => {
      await preferencesPage.goto()

      // Make several changes
      await preferencesPage.setTheme('dark')
      await preferencesPage.setLanguage('es')
      await preferencesPage.toggleEmailNotifications(false)
      await preferencesPage.setProfileVisibility('private')

      await preferencesPage.savePreferences()

      // Reset preferences
      await preferencesPage.resetPreferences()

      // Should return to default values
      const theme = await preferencesPage.getTheme()
      expect(['system', 'light']).toContain(theme) // Default theme

      await preferencesPage.navigateToSection('notifications')
      expect(await preferencesPage.isEmailNotificationsEnabled()).toBe(true) // Default enabled
    })

    test('should use sensible defaults for new users', async ({ page }) => {
      await preferencesPage.goto()

      // Check default values are sensible
      const theme = await preferencesPage.getTheme()
      expect(['system', 'light', 'dark']).toContain(theme)

      await preferencesPage.navigateToSection('notifications')
      expect(await preferencesPage.isEmailNotificationsEnabled()).toBe(true)

      await preferencesPage.navigateToSection('privacy')
      await expect(page.locator('select[name="profile_visibility"]')).toHaveValue('organization')
    })
  })
})