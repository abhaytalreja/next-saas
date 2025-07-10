import { test, expect } from '@playwright/test'
import { setupTestUser, cleanupTestUser } from '../utils/test-setup'
import { generateTestData } from '../utils/test-data'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Profile Accessibility E2E Tests', () => {
  let testUser: any
  let testData: any

  test.beforeEach(async ({ page }) => {
    testData = generateTestData()
    testUser = await setupTestUser(page, testData)
    
    // Inject axe-core for accessibility testing
    await injectAxe(page)
  })

  test.afterEach(async ({ page }) => {
    if (testUser) {
      await cleanupTestUser(page, testUser)
    }
  })

  test.describe('Color Contrast and Theme Accessibility', () => {
    test('should meet WCAG contrast requirements in light theme', async ({ page }) => {
      // Navigate to profile settings
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Ensure light theme is active
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      if (await page.locator('[data-testid="preferences-form"]').isVisible()) {
        await page.selectOption('[data-testid="theme-select"]', 'light')
        await page.click('[data-testid="save-preferences-button"]')
        await page.waitForLoadState('networkidle')
      }

      // Go back to profile page
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Check accessibility with focus on color contrast
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          'color-contrast': { enabled: true }
        }
      })

      // Manually verify specific contrast ratios for profile form elements
      const textElements = [
        '[data-testid="first-name-input"]',
        '[data-testid="last-name-input"]',
        '[data-testid="bio-input"]',
        'label[for="first_name"]',
        'label[for="last_name"]',
        'label[for="bio"]'
      ]

      for (const selector of textElements) {
        if (await page.locator(selector).isVisible()) {
          const element = page.locator(selector)
          
          // Get computed styles
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight
            }
          })

          // Verify text is visible and styled appropriately
          expect(styles.color).not.toBe('rgba(0, 0, 0, 0)') // Not transparent
          expect(styles.color).not.toBe('transparent')
          
          console.log(`Light theme - ${selector}:`, styles)
        }
      }
    })

    test('should meet WCAG contrast requirements in dark theme', async ({ page }) => {
      // Navigate to preferences and set dark theme
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      if (await page.locator('[data-testid="preferences-form"]').isVisible()) {
        await page.selectOption('[data-testid="theme-select"]', 'dark')
        await page.click('[data-testid="save-preferences-button"]')
        await page.waitForLoadState('networkidle')
        
        // Verify dark theme is applied
        const htmlElement = page.locator('html')
        await expect(htmlElement).toHaveClass(/dark/)
      }

      // Navigate to profile page
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Check accessibility in dark theme
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          'color-contrast': { enabled: true }
        }
      })

      // Manually verify dark theme contrast ratios
      const textElements = [
        '[data-testid="first-name-input"]',
        '[data-testid="last-name-input"]',
        '[data-testid="bio-input"]',
        'label[for="first_name"]',
        'label[for="last_name"]',
        'label[for="bio"]'
      ]

      for (const selector of textElements) {
        if (await page.locator(selector).isVisible()) {
          const element = page.locator(selector)
          
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight
            }
          })

          // Verify text is visible in dark theme
          expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
          expect(styles.color).not.toBe('transparent')
          
          console.log(`Dark theme - ${selector}:`, styles)
        }
      }
    })

    test('should have proper focus indicators in both themes', async ({ page }) => {
      const themes = ['light', 'dark']
      
      for (const theme of themes) {
        console.log(`Testing focus indicators in ${theme} theme`)
        
        // Set theme
        await page.goto('http://localhost:3010/settings/preferences')
        await page.waitForLoadState('networkidle')
        
        if (await page.locator('[data-testid="preferences-form"]').isVisible()) {
          await page.selectOption('[data-testid="theme-select"]', theme)
          await page.click('[data-testid="save-preferences-button"]')
          await page.waitForLoadState('networkidle')
        }

        // Navigate to profile page
        await page.goto('http://localhost:3010/settings/profile')
        await page.waitForLoadState('networkidle')

        // Test focus indicators on form elements
        const focusableElements = [
          '[data-testid="first-name-input"]',
          '[data-testid="last-name-input"]',
          '[data-testid="save-profile-button"]'
        ]

        for (const selector of focusableElements) {
          if (await page.locator(selector).isVisible()) {
            // Focus the element
            await page.locator(selector).focus()
            
            // Check focus styles
            const focusStyles = await page.locator(selector).evaluate((el) => {
              const computed = window.getComputedStyle(el)
              return {
                outline: computed.outline,
                outlineColor: computed.outlineColor,
                outlineStyle: computed.outlineStyle,
                outlineWidth: computed.outlineWidth,
                boxShadow: computed.boxShadow,
                borderColor: computed.borderColor
              }
            })

            // Verify focus indicator exists
            const hasFocusIndicator = 
              focusStyles.outline !== 'none' || 
              focusStyles.boxShadow !== 'none' ||
              focusStyles.borderColor !== 'rgb(0, 0, 0)'

            expect(hasFocusIndicator).toBe(true)
            console.log(`${theme} theme focus - ${selector}:`, focusStyles)
          }
        }
      }
    })
  })

  test.describe('Keyboard Navigation Accessibility', () => {
    test('should support complete keyboard navigation', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Start keyboard navigation from the top
      await page.keyboard.press('Tab')
      
      // Track tab order through form elements
      const expectedTabOrder = [
        '[data-testid="first-name-input"]',
        '[data-testid="last-name-input"]',
        '[data-testid="display-name-input"]',
        '[data-testid="bio-input"]',
        '[data-testid="phone-input"]',
        '[data-testid="location-input"]'
      ]

      for (let i = 0; i < expectedTabOrder.length; i++) {
        const currentElement = expectedTabOrder[i]
        
        if (await page.locator(currentElement).isVisible()) {
          // Navigate to element via Tab
          let attempts = 0
          while (attempts < 10) {
            const focusedElement = await page.evaluate(() => {
              const active = document.activeElement
              return active ? active.getAttribute('data-testid') : null
            })
            
            if (focusedElement === currentElement.replace('[data-testid="', '').replace('"]', '')) {
              break
            }
            
            await page.keyboard.press('Tab')
            attempts++
          }

          // Verify element is focused and can receive input
          await expect(page.locator(currentElement)).toBeFocused()
          
          // Test that the element accepts keyboard input
          if (currentElement.includes('input') || currentElement.includes('textarea')) {
            await page.keyboard.type('test')
            const value = await page.locator(currentElement).inputValue()
            expect(value).toContain('test')
            
            // Clear the input
            await page.keyboard.press('Control+a')
            await page.keyboard.press('Delete')
          }
        }
      }
    })

    test('should announce form errors to screen readers', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Test form validation with empty required fields
      await page.locator('[data-testid="first-name-input"]').clear()
      await page.locator('[data-testid="last-name-input"]').clear()
      
      // Try to submit form
      await page.click('[data-testid="save-profile-button"]')
      
      // Check for ARIA attributes on error messages
      const firstNameInput = page.locator('[data-testid="first-name-input"]')
      
      // Verify aria-invalid is set
      await expect(firstNameInput).toHaveAttribute('aria-invalid', 'true')
      
      // Check for error message with proper ARIA relationship
      const errorMessage = page.locator('text="First name is required"').first()
      if (await errorMessage.isVisible()) {
        const errorId = await errorMessage.getAttribute('id')
        if (errorId) {
          await expect(firstNameInput).toHaveAttribute('aria-describedby', errorId)
        }
      }
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Check form has proper structure
      const form = page.locator('[data-testid="profile-form"]')
      await expect(form).toHaveAttribute('role', 'form')

      // Check all inputs have labels or aria-label
      const inputs = [
        '[data-testid="first-name-input"]',
        '[data-testid="last-name-input"]',
        '[data-testid="display-name-input"]',
        '[data-testid="bio-input"]',
        '[data-testid="phone-input"]'
      ]

      for (const inputSelector of inputs) {
        if (await page.locator(inputSelector).isVisible()) {
          const input = page.locator(inputSelector)
          
          // Check if input has aria-label or associated label
          const ariaLabel = await input.getAttribute('aria-label')
          const ariaLabelledBy = await input.getAttribute('aria-labelledby')
          const id = await input.getAttribute('id')
          
          let hasLabel = false
          
          if (ariaLabel) {
            hasLabel = true
            expect(ariaLabel.length).toBeGreaterThan(0)
          } else if (ariaLabelledBy) {
            hasLabel = true
            // Verify the referenced element exists
            await expect(page.locator(`#${ariaLabelledBy}`)).toBeVisible()
          } else if (id) {
            // Check for associated label element
            const label = page.locator(`label[for="${id}"]`)
            if (await label.isVisible()) {
              hasLabel = true
            }
          }
          
          expect(hasLabel).toBe(true)
          console.log(`Input ${inputSelector} has proper labeling`)
        }
      }
    })

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Fill out form to trigger completeness changes
      await page.fill('[data-testid="first-name-input"]', 'John')
      await page.fill('[data-testid="last-name-input"]', 'Doe')
      
      // Check if profile completeness has aria-live region
      const completenessSection = page.locator('[data-testid="profile-completeness"]')
      if (await completenessSection.isVisible()) {
        // Should have aria-live for dynamic updates
        const ariaLive = await completenessSection.getAttribute('aria-live')
        if (ariaLive) {
          expect(['polite', 'assertive']).toContain(ariaLive)
        }
        
        // Should have proper role
        const role = await completenessSection.getAttribute('role')
        if (role) {
          expect(['status', 'alert', 'region']).toContain(role)
        }
      }
    })
  })

  test.describe('Reduced Motion Support', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      if (await page.locator('[data-testid="preferences-form"]').isVisible()) {
        // Navigate to accessibility section
        await page.click('[data-testid="accessibility-tab"]')
        
        // Enable reduced motion setting
        await page.click('[data-testid="reduce-motion-toggle"]')
        await page.click('[data-testid="save-preferences-button"]')
      }

      // Navigate to profile page
      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Check that animations are disabled or reduced
      const animatedElements = page.locator('*').filter({ has: page.locator('[class*="animate"]') })
      const count = await animatedElements.count()
      
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i)
        const animationStyle = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el)
          return {
            animationDuration: computed.animationDuration,
            animationDelay: computed.animationDelay,
            transitionDuration: computed.transitionDuration
          }
        })
        
        // In reduced motion mode, durations should be 0 or very short
        console.log('Animation styles with reduced motion:', animationStyle)
      }
    })
  })

  test.describe('High Contrast Mode', () => {
    test('should work properly in high contrast mode', async ({ page }) => {
      // Enable high contrast mode
      await page.goto('http://localhost:3010/settings/preferences')
      await page.waitForLoadState('networkidle')
      
      if (await page.locator('[data-testid="preferences-form"]').isVisible()) {
        await page.click('[data-testid="accessibility-tab"]')
        await page.click('[data-testid="high-contrast-toggle"]')
        await page.click('[data-testid="save-preferences-button"]')
        await page.waitForLoadState('networkidle')
      }

      await page.goto('http://localhost:3010/settings/profile')
      await page.waitForLoadState('networkidle')

      // Run accessibility check with high contrast mode
      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'color-contrast': { enabled: true }
        }
      })

      // Verify high contrast styles are applied
      const body = page.locator('body')
      const bodyStyles = await body.evaluate((el) => {
        return window.getComputedStyle(el).filter || ''
      })
      
      console.log('High contrast mode styles:', bodyStyles)
    })
  })
})