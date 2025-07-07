import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Alert Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-feedback-alert'

  test.describe('Variants', () => {
    test('renders all alert variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-default')
    })

    test('renders info variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-info`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-info')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-success')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-warning')
    })

    test('renders error variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-error')
    })

    test('renders destructive variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-destructive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'variant-destructive')
    })
  })

  test.describe('Styles', () => {
    test('renders all alert styles', async ({ page }) => {
      await page.goto(`${baseUrl}--all-styles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'all-styles')
    })

    test('renders filled style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-filled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'style-filled')
    })

    test('renders outline style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'style-outline')
    })

    test('renders subtle style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-subtle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'style-subtle')
    })

    test('renders left-accent style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-left-accent`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'style-left-accent')
    })

    test('renders top-accent style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-top-accent`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'style-top-accent')
    })
  })

  test.describe('Content Elements', () => {
    test('renders with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-icon')
    })

    test('renders with custom icon', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'custom-icon')
    })

    test('renders with title only', async ({ page }) => {
      await page.goto(`${baseUrl}--title-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'title-only')
    })

    test('renders with description only', async ({ page }) => {
      await page.goto(`${baseUrl}--description-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'description-only')
    })

    test('renders with title and description', async ({ page }) => {
      await page.goto(`${baseUrl}--title-and-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'title-and-description')
    })

    test('renders with long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'long-content')
    })

    test('renders with list content', async ({ page }) => {
      await page.goto(`${baseUrl}--with-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-list')
    })

    test('renders with code content', async ({ page }) => {
      await page.goto(`${baseUrl}--with-code`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-code')
    })
  })

  test.describe('Actions', () => {
    test('renders with close button', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'dismissible')
    })

    test('renders with action button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-action')
    })

    test('renders with multiple actions', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'multiple-actions')
    })

    test('renders with link action', async ({ page }) => {
      await page.goto(`${baseUrl}--with-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-link')
    })

    test('shows close button hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.waitForLoadState('networkidle')
      
      const closeButton = page.locator('.alert-close-button').first()
      await closeButton.hover()
      await takeComponentScreenshot(page, 'alert', 'close-button-hover')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'size-large')
    })
  })

  test.describe('Special Cases', () => {
    test('renders compact alert', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'compact')
    })

    test('renders inline alert', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'inline')
    })

    test('renders banner alert', async ({ page }) => {
      await page.goto(`${baseUrl}--banner`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'banner')
    })

    test('renders floating alert', async ({ page }) => {
      await page.goto(`${baseUrl}--floating`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'floating')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'custom-class')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'in-form')
    })

    test('renders multiple alerts stacked', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'stacked')
    })
  })

  test.describe('Animation States', () => {
    test('shows entrance animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated-entrance`)
      await page.waitForLoadState('networkidle')
      
      // Trigger animation
      await page.click('.trigger-animation')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'alert', 'animation-entrance')
    })

    test('shows exit animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated-exit`)
      await page.waitForLoadState('networkidle')
      
      // Trigger dismiss
      await page.click('.alert-close-button')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'alert', 'animation-exit')
    })

    test('shows auto-dismiss countdown', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-dismiss`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'auto-dismiss-countdown')
    })
  })

  test.describe('Complex Content', () => {
    test('renders with nested components', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-components`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'nested-components')
    })

    test('renders with form elements', async ({ page }) => {
      await page.goto(`${baseUrl}--with-form-elements`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-form-elements')
    })

    test('renders with progress indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--with-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'with-progress')
    })

    test('renders with expandable details', async ({ page }) => {
      await page.goto(`${baseUrl}--expandable`)
      await page.waitForLoadState('networkidle')
      
      // Capture collapsed state
      await takeComponentScreenshot(page, 'alert', 'expandable-collapsed')
      
      // Expand and capture
      await page.click('.expand-button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'alert', 'expandable-expanded')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'alert-responsive')
    })

    test('handles long content on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'mobile-long-content')
    })

    test('stacks actions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'mobile-stacked-actions')
    })

    test('adjusts banner for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--banner`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'mobile-banner')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'alert-color-modes')
    })

    test('shows all styles in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-styles`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'dark-mode-styles')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--subtle-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'dark-mode-contrast')
    })

    test('shows dismissible in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'dark-mode-dismissible')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.waitForLoadState('networkidle')
      
      // Tab to action button
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'alert', 'accessibility-focus')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'accessibility-contrast')
    })

    test('shows proper role and aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-aria`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'accessibility-aria')
    })

    test('handles keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.waitForLoadState('networkidle')
      
      // Tab to close button
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'alert', 'accessibility-keyboard-nav')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'accessibility-screen-reader')
    })
  })

  test.describe('Icon Animations', () => {
    test('shows pulsing icon for warnings', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-pulse`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'icon-pulse')
    })

    test('shows spinning icon for loading', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-spin`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'alert', 'icon-spin')
    })

    test('shows icon color transitions', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-transition`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.alert-icon')
      await takeComponentScreenshot(page, 'alert', 'icon-hover-transition')
    })
  })
})