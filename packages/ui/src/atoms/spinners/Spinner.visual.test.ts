import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Spinner Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-spinners-spinner'

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'all-sizes')
    })

    test('renders extra small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'size-xs')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'size-sm')
    })

    test('renders default size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'size-default')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'size-lg')
    })

    test('renders extra large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'size-xl')
    })
  })

  test.describe('Colors', () => {
    test('renders all colors', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'all-colors')
    })

    test('renders default color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-default')
    })

    test('renders white color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-white`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-white')
    })

    test('renders muted color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-muted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-muted')
    })

    test('renders primary color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-primary')
    })

    test('renders secondary color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-secondary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-secondary')
    })

    test('renders success color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-success')
    })

    test('renders error color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-error')
    })

    test('renders warning color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'color-warning')
    })
  })

  test.describe('Animation States', () => {
    test('shows spinning animation frame 1', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'animation-frame-1')
    })

    test('shows spinning animation frame 2', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      // Wait for different animation frame
      await page.waitForTimeout(125)
      await takeComponentScreenshot(page, 'spinner', 'animation-frame-2')
    })

    test('shows spinning animation frame 3', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      // Wait for different animation frame
      await page.waitForTimeout(250)
      await takeComponentScreenshot(page, 'spinner', 'animation-frame-3')
    })

    test('shows paused animation', async ({ page }) => {
      await page.goto(`${baseUrl}--paused`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'animation-paused')
    })

    test('shows slow animation', async ({ page }) => {
      await page.goto(`${baseUrl}--slow-animation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'animation-slow')
    })

    test('shows fast animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fast-animation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'animation-fast')
    })
  })

  test.describe('Contexts', () => {
    test('renders in button context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-button`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-button')
    })

    test('renders in card context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-card')
    })

    test('renders in overlay context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-overlay')
    })

    test('renders in modal context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-modal')
    })

    test('renders in table cell', async ({ page }) => {
      await page.goto(`${baseUrl}--in-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-table')
    })

    test('renders in navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'context-navigation')
    })
  })

  test.describe('With Text', () => {
    test('renders with loading text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'with-text')
    })

    test('renders with custom message', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-message`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'custom-message')
    })

    test('renders centered with text', async ({ page }) => {
      await page.goto(`${baseUrl}--centered-with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'centered-with-text')
    })

    test('renders inline with text', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'inline-with-text')
    })
  })

  test.describe('Positioning', () => {
    test('renders centered spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--centered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'position-centered')
    })

    test('renders inline spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'position-inline')
    })

    test('renders fixed spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'position-fixed')
    })

    test('renders absolute spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--absolute`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'position-absolute')
    })
  })

  test.describe('Backgrounds', () => {
    test('renders on light background', async ({ page }) => {
      await page.goto(`${baseUrl}--light-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'background-light')
    })

    test('renders on dark background', async ({ page }) => {
      await page.goto(`${baseUrl}--dark-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'background-dark')
    })

    test('renders on colored background', async ({ page }) => {
      await page.goto(`${baseUrl}--colored-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'background-colored')
    })

    test('renders on gradient background', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'background-gradient')
    })

    test('renders on image background', async ({ page }) => {
      await page.goto(`${baseUrl}--image-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'background-image')
    })
  })

  test.describe('Loading States', () => {
    test('renders page loading', async ({ page }) => {
      await page.goto(`${baseUrl}--page-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'loading-page')
    })

    test('renders content loading', async ({ page }) => {
      await page.goto(`${baseUrl}--content-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'loading-content')
    })

    test('renders form submission', async ({ page }) => {
      await page.goto(`${baseUrl}--form-submission`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'loading-form')
    })

    test('renders data fetching', async ({ page }) => {
      await page.goto(`${baseUrl}--data-fetching`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'loading-data')
    })

    test('renders search loading', async ({ page }) => {
      await page.goto(`${baseUrl}--search-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'loading-search')
    })
  })

  test.describe('Multiple Spinners', () => {
    test('renders multiple sizes together', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'multiple-sizes')
    })

    test('renders multiple colors together', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'multiple-colors')
    })

    test('renders grid of spinners', async ({ page }) => {
      await page.goto(`${baseUrl}--spinner-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'multiple-grid')
    })
  })

  test.describe('Custom Variants', () => {
    test('renders pulsing spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--pulsing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'variant-pulsing')
    })

    test('renders dots spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--dots`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'variant-dots')
    })

    test('renders bars spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--bars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'variant-bars')
    })

    test('renders ring spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--ring`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'variant-ring')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'spinner-responsive')
    })

    test('shows mobile spinner layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'responsive-mobile')
    })

    test('adapts size on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-colors`, 'spinner-color-modes')
    })

    test('shows all colors in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'dark-mode-colors')
    })

    test('maintains visibility in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--color-white`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'dark-mode-white')
    })

    test('shows context in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--in-button`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'dark-mode-context')
    })
  })

  test.describe('Accessibility', () => {
    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'accessibility-screen-reader')
    })

    test('shows reduced motion variant', async ({ page }) => {
      await page.goto(`${baseUrl}--reduced-motion`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'accessibility-reduced-motion')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'accessibility-contrast')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'accessibility-high-contrast')
    })
  })

  test.describe('Performance', () => {
    test('renders many spinners efficiently', async ({ page }) => {
      await page.goto(`${baseUrl}--many-spinners`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'performance-many')
    })

    test('shows GPU acceleration', async ({ page }) => {
      await page.goto(`${baseUrl}--gpu-accelerated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'performance-gpu')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders without size prop', async ({ page }) => {
      await page.goto(`${baseUrl}--no-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'edge-no-size')
    })

    test('renders without color prop', async ({ page }) => {
      await page.goto(`${baseUrl}--no-color`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'edge-no-color')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'edge-custom-class')
    })

    test('renders with very small size', async ({ page }) => {
      await page.goto(`${baseUrl}--tiny-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'edge-tiny')
    })

    test('renders with very large size', async ({ page }) => {
      await page.goto(`${baseUrl}--huge-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'spinner', 'edge-huge')
    })
  })
})