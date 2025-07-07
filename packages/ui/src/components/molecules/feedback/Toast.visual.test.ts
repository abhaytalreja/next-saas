import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Toast Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-feedback-toast'

  test.describe('Variants', () => {
    test('renders all toast variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-default')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-success')
    })

    test('renders error variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-error')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-warning')
    })

    test('renders info variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-info`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-info')
    })

    test('renders loading variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'variant-loading')
    })
  })

  test.describe('Positions', () => {
    test('shows all toast positions', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'all-positions')
    })

    test('renders top-left position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-top-left')
    })

    test('renders top-center position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-top-center')
    })

    test('renders top-right position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-top-right')
    })

    test('renders bottom-left position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-bottom-left')
    })

    test('renders bottom-center position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-bottom-center')
    })

    test('renders bottom-right position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'position-bottom-right')
    })
  })

  test.describe('Content', () => {
    test('renders with title only', async ({ page }) => {
      await page.goto(`${baseUrl}--title-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'title-only')
    })

    test('renders with description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'with-description')
    })

    test('renders with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'with-icon')
    })

    test('renders with custom icon', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'custom-icon')
    })

    test('renders with action button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'with-action')
    })

    test('renders with close button', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'dismissible')
    })

    test('renders with progress bar', async ({ page }) => {
      await page.goto(`${baseUrl}--with-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'with-progress')
    })

    test('renders with long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'long-content')
    })
  })

  test.describe('Stacking', () => {
    test('shows multiple toasts stacked', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'stacked')
    })

    test('shows stacking with different positions', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked-positions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'stacked-positions')
    })

    test('shows stack limit behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--stack-limit`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'stack-limit')
    })

    test('shows newest on top stacking', async ({ page }) => {
      await page.goto(`${baseUrl}--newest-on-top`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'newest-on-top')
    })

    test('shows oldest on top stacking', async ({ page }) => {
      await page.goto(`${baseUrl}--oldest-on-top`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'oldest-on-top')
    })
  })

  test.describe('Animations', () => {
    test('shows slide-in animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-slide`)
      await page.waitForLoadState('networkidle')
      
      // Trigger toast
      await page.click('.trigger-toast')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'toast', 'animation-slide-in')
    })

    test('shows fade-in animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-fade`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-toast')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'toast', 'animation-fade-in')
    })

    test('shows pop-in animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-pop`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-toast')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'toast', 'animation-pop-in')
    })

    test('shows exit animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-exit`)
      await page.waitForLoadState('networkidle')
      
      // Close toast
      await page.click('.toast-close')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'toast', 'animation-exit')
    })

    test('shows auto-dismiss progress', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-dismiss-progress`)
      await page.waitForLoadState('networkidle')
      
      // Wait for partial progress
      await page.waitForTimeout(1500)
      await takeComponentScreenshot(page, 'toast', 'auto-dismiss-progress')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover pause behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-pause`)
      await page.waitForLoadState('networkidle')
      
      const toast = page.locator('.toast').first()
      await toast.hover()
      await takeComponentScreenshot(page, 'toast', 'hover-pause')
    })

    test('shows action button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.waitForLoadState('networkidle')
      
      const actionButton = page.locator('.toast-action').first()
      await actionButton.hover()
      await takeComponentScreenshot(page, 'toast', 'action-hover')
    })

    test('shows close button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--dismissible`)
      await page.waitForLoadState('networkidle')
      
      const closeButton = page.locator('.toast-close').first()
      await closeButton.hover()
      await takeComponentScreenshot(page, 'toast', 'close-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'toast', 'focus-state')
    })
  })

  test.describe('Special Types', () => {
    test('renders promise toast states', async ({ page }) => {
      await page.goto(`${baseUrl}--promise-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'promise-states')
    })

    test('renders loading to success transition', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-success`)
      await page.waitForLoadState('networkidle')
      
      // Show loading state
      await page.click('.trigger-loading')
      await takeComponentScreenshot(page, 'toast', 'loading-state')
      
      // Transition to success
      await page.click('.trigger-success')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'toast', 'success-transition')
    })

    test('renders loading to error transition', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-error`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-loading')
      await takeComponentScreenshot(page, 'toast', 'loading-state-error')
      
      await page.click('.trigger-error')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'toast', 'error-transition')
    })

    test('renders custom toast component', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-component`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'custom-component')
    })

    test('renders rich content toast', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'rich-content')
    })
  })

  test.describe('Sizes and Styles', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'all-sizes')
    })

    test('renders compact size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'size-compact')
    })

    test('renders default size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'size-default')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'size-large')
    })

    test('renders minimal style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'style-minimal')
    })

    test('renders filled style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-filled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'style-filled')
    })

    test('renders outline style', async ({ page }) => {
      await page.goto(`${baseUrl}--style-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'style-outline')
    })
  })

  test.describe('Advanced Features', () => {
    test('renders with countdown timer', async ({ page }) => {
      await page.goto(`${baseUrl}--countdown-timer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'countdown-timer')
    })

    test('renders with undo action', async ({ page }) => {
      await page.goto(`${baseUrl}--undo-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'undo-action')
    })

    test('renders expandable toast', async ({ page }) => {
      await page.goto(`${baseUrl}--expandable`)
      await page.waitForLoadState('networkidle')
      
      // Collapsed state
      await takeComponentScreenshot(page, 'toast', 'expandable-collapsed')
      
      // Expanded state
      await page.click('.expand-button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'toast', 'expandable-expanded')
    })

    test('renders with inline actions', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'inline-actions')
    })

    test('renders swipeable toast', async ({ page }) => {
      await page.goto(`${baseUrl}--swipeable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'swipeable')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'toast-responsive')
    })

    test('adapts position on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--all-positions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'mobile-positions')
    })

    test('shows full-width on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-fullwidth`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'mobile-fullwidth')
    })

    test('stacks vertically on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--stacked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'mobile-stacked')
    })

    test('shows swipe gesture on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-swipe`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'mobile-swipe-hint')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'toast-color-modes')
    })

    test('shows positions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'dark-mode-positions')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-style`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'dark-mode-contrast')
    })

    test('shows action buttons in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-action`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'dark-mode-actions')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'toast', 'accessibility-focus')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'accessibility-contrast')
    })

    test('shows screen reader announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'accessibility-screen-reader')
    })

    test('handles keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      // Tab through toast elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'toast', 'accessibility-keyboard-nav')
    })

    test('shows pause on focus', async ({ page }) => {
      await page.goto(`${baseUrl}--pause-on-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'toast', 'accessibility-pause-focus')
    })
  })

  test.describe('Container States', () => {
    test('shows empty container', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-container`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'container-empty')
    })

    test('shows container with offset', async ({ page }) => {
      await page.goto(`${baseUrl}--container-offset`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'container-offset')
    })

    test('shows container z-index layering', async ({ page }) => {
      await page.goto(`${baseUrl}--z-index-layering`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'toast', 'container-z-index')
    })
  })
})