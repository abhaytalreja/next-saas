import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Modal Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-feedback-modal'

  test.describe('Basic States', () => {
    test('renders open modal', async ({ page }) => {
      await page.goto(`${baseUrl}--open`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'open')
    })

    test('renders closed state', async ({ page }) => {
      await page.goto(`${baseUrl}--closed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'closed')
    })

    test('renders with backdrop', async ({ page }) => {
      await page.goto(`${baseUrl}--with-backdrop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-backdrop')
    })

    test('renders without backdrop', async ({ page }) => {
      await page.goto(`${baseUrl}--no-backdrop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'no-backdrop')
    })

    test('renders with blur backdrop', async ({ page }) => {
      await page.goto(`${baseUrl}--blur-backdrop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'blur-backdrop')
    })
  })

  test.describe('Sizes', () => {
    test('renders all modal sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'size-large')
    })

    test('renders extra large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'size-xl')
    })

    test('renders full screen', async ({ page }) => {
      await page.goto(`${baseUrl}--fullscreen`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'fullscreen')
    })

    test('renders custom width', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'custom-width')
    })
  })

  test.describe('Content Structure', () => {
    test('renders with header only', async ({ page }) => {
      await page.goto(`${baseUrl}--header-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'header-only')
    })

    test('renders with header and body', async ({ page }) => {
      await page.goto(`${baseUrl}--header-body`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'header-body')
    })

    test('renders with all sections', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'all-sections')
    })

    test('renders with close button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-close`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-close')
    })

    test('renders without close button', async ({ page }) => {
      await page.goto(`${baseUrl}--no-close`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'no-close')
    })

    test('renders with icon in header', async ({ page }) => {
      await page.goto(`${baseUrl}--header-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'header-icon')
    })

    test('renders with subtitle', async ({ page }) => {
      await page.goto(`${baseUrl}--with-subtitle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-subtitle')
    })
  })

  test.describe('Scrolling', () => {
    test('renders with scrollable content', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'scrollable')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'scroll-indicators')
    })

    test('renders with sticky header', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky-header`)
      await page.waitForLoadState('networkidle')
      
      // Scroll down
      await page.evaluate(() => {
        const modalBody = document.querySelector('.modal-body')
        if (modalBody) modalBody.scrollTop = 100
      })
      await takeComponentScreenshot(page, 'modal', 'sticky-header-scrolled')
    })

    test('renders with sticky footer', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky-footer`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => {
        const modalBody = document.querySelector('.modal-body')
        if (modalBody) modalBody.scrollTop = 100
      })
      await takeComponentScreenshot(page, 'modal', 'sticky-footer-scrolled')
    })
  })

  test.describe('Footer Actions', () => {
    test('renders with single action', async ({ page }) => {
      await page.goto(`${baseUrl}--single-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'single-action')
    })

    test('renders with multiple actions', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'multiple-actions')
    })

    test('renders with action alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--action-alignment`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'action-alignment')
    })

    test('renders with loading action', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'loading-action')
    })

    test('renders with disabled actions', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'disabled-actions')
    })
  })

  test.describe('Modal Types', () => {
    test('renders alert modal', async ({ page }) => {
      await page.goto(`${baseUrl}--alert-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-alert')
    })

    test('renders confirmation modal', async ({ page }) => {
      await page.goto(`${baseUrl}--confirmation-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-confirmation')
    })

    test('renders form modal', async ({ page }) => {
      await page.goto(`${baseUrl}--form-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-form')
    })

    test('renders image modal', async ({ page }) => {
      await page.goto(`${baseUrl}--image-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-image')
    })

    test('renders video modal', async ({ page }) => {
      await page.goto(`${baseUrl}--video-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-video')
    })

    test('renders drawer modal', async ({ page }) => {
      await page.goto(`${baseUrl}--drawer-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'type-drawer')
    })
  })

  test.describe('Animations', () => {
    test('shows fade animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-fade`)
      await page.waitForLoadState('networkidle')
      
      // Trigger open
      await page.click('.trigger-modal')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'modal', 'animation-fade-in')
    })

    test('shows scale animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-scale`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-modal')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'modal', 'animation-scale-in')
    })

    test('shows slide animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-slide`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-modal')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'modal', 'animation-slide-in')
    })

    test('shows exit animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-exit`)
      await page.waitForLoadState('networkidle')
      
      // Close modal
      await page.click('.modal-close')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'modal', 'animation-exit')
    })
  })

  test.describe('Positions', () => {
    test('renders centered modal', async ({ page }) => {
      await page.goto(`${baseUrl}--position-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'position-center')
    })

    test('renders top modal', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'position-top')
    })

    test('renders right drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'position-right')
    })

    test('renders bottom sheet', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'position-bottom')
    })

    test('renders left drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'position-left')
    })
  })

  test.describe('Interactive States', () => {
    test('shows close button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--open`)
      await page.waitForLoadState('networkidle')
      
      const closeButton = page.locator('.modal-close').first()
      await closeButton.hover()
      await takeComponentScreenshot(page, 'modal', 'close-hover')
    })

    test('shows action button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      
      const primaryButton = page.locator('.modal-action-primary').first()
      await primaryButton.hover()
      await takeComponentScreenshot(page, 'modal', 'action-hover')
    })

    test('shows focus trap behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-trap`)
      await page.waitForLoadState('networkidle')
      
      // Tab through elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'modal', 'focus-trap')
    })

    test('shows backdrop click behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--backdrop-click`)
      await page.waitForLoadState('networkidle')
      
      // Show click indicator
      await page.click('.modal-backdrop', { position: { x: 100, y: 100 } })
      await takeComponentScreenshot(page, 'modal', 'backdrop-click')
    })
  })

  test.describe('Complex Content', () => {
    test('renders with tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--with-tabs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-tabs')
    })

    test('renders with stepper', async ({ page }) => {
      await page.goto(`${baseUrl}--with-stepper`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-stepper')
    })

    test('renders with data table', async ({ page }) => {
      await page.goto(`${baseUrl}--with-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'with-table')
    })

    test('renders with nested modals', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-modals`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'nested-modals')
    })

    test('renders with rich editor', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-editor`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'rich-editor')
    })
  })

  test.describe('Loading States', () => {
    test('renders loading overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'loading-overlay')
    })

    test('renders skeleton content', async ({ page }) => {
      await page.goto(`${baseUrl}--skeleton-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'skeleton-content')
    })

    test('renders progress indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-indicator`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'progress-indicator')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--open`, 'modal-responsive')
    })

    test('shows mobile fullscreen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-fullscreen`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'mobile-fullscreen')
    })

    test('shows mobile bottom sheet', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-bottom-sheet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'mobile-bottom-sheet')
    })

    test('stacks actions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'mobile-stacked-actions')
    })

    test('handles swipe gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-swipe`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'mobile-swipe-indicator')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--open`, 'modal-color-modes')
    })

    test('shows backdrop in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-backdrop`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'dark-mode-backdrop')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sections`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'dark-mode-contrast')
    })

    test('shows form modal in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--form-modal`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'dark-mode-form')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'modal', 'accessibility-focus')
    })

    test('maintains focus trap', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-trap-demo`)
      await page.waitForLoadState('networkidle')
      
      // Tab through all elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
      }
      await takeComponentScreenshot(page, 'modal', 'accessibility-focus-trap')
    })

    test('shows proper contrast', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'accessibility-contrast')
    })

    test('handles escape key', async ({ page }) => {
      await page.goto(`${baseUrl}--escape-key`)
      await page.waitForLoadState('networkidle')
      
      // Press escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'modal', 'accessibility-escape')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'accessibility-screen-reader')
    })
  })

  test.describe('Error States', () => {
    test('shows error content', async ({ page }) => {
      await page.goto(`${baseUrl}--error-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'error-content')
    })

    test('shows validation errors', async ({ page }) => {
      await page.goto(`${baseUrl}--validation-errors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'validation-errors')
    })

    test('shows error banner', async ({ page }) => {
      await page.goto(`${baseUrl}--error-banner`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'modal', 'error-banner')
    })
  })
})