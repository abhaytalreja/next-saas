import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Progress Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-feedback-progress'

  test.describe('Linear Progress - Values', () => {
    test('renders all progress values', async ({ page }) => {
      await page.goto(`${baseUrl}--all-values`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-all-values')
    })

    test('renders 0% progress', async ({ page }) => {
      await page.goto(`${baseUrl}--value-0`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-value-0')
    })

    test('renders 25% progress', async ({ page }) => {
      await page.goto(`${baseUrl}--value-25`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-value-25')
    })

    test('renders 50% progress', async ({ page }) => {
      await page.goto(`${baseUrl}--value-50`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-value-50')
    })

    test('renders 75% progress', async ({ page }) => {
      await page.goto(`${baseUrl}--value-75`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-value-75')
    })

    test('renders 100% progress', async ({ page }) => {
      await page.goto(`${baseUrl}--value-100`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-value-100')
    })
  })

  test.describe('Linear Progress - Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-variant-default')
    })

    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-variant-primary')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-variant-success')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-variant-warning')
    })

    test('renders error variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-variant-error')
    })
  })

  test.describe('Linear Progress - Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-size-large')
    })
  })

  test.describe('Linear Progress - Features', () => {
    test('renders with label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-with-label')
    })

    test('renders with value display', async ({ page }) => {
      await page.goto(`${baseUrl}--show-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-show-value')
    })

    test('renders with label and value', async ({ page }) => {
      await page.goto(`${baseUrl}--label-and-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-label-and-value')
    })

    test('renders indeterminate state', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-indeterminate')
    })

    test('renders indeterminate with label', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'linear-indeterminate-label')
    })
  })

  test.describe('Linear Progress - Animations', () => {
    test('shows progress animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      // Capture initial state
      await takeComponentScreenshot(page, 'progress', 'linear-animation-start')
      
      // Trigger animation
      await page.click('.animate-progress')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'linear-animation-mid')
      
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'linear-animation-end')
    })

    test('shows indeterminate animation', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate-animated`)
      await page.waitForLoadState('networkidle')
      
      // Capture multiple frames of the animation
      await takeComponentScreenshot(page, 'progress', 'linear-indeterminate-frame1')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'linear-indeterminate-frame2')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'linear-indeterminate-frame3')
    })

    test('shows smooth transitions', async ({ page }) => {
      await page.goto(`${baseUrl}--smooth-transition`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.progress-25')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'progress', 'linear-transition-25')
      
      await page.click('.progress-75')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'progress', 'linear-transition-75')
    })
  })

  test.describe('Circular Progress - Values', () => {
    test('renders all circular values', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-all-values`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-all-values')
    })

    test('renders circular 0%', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-0`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-value-0')
    })

    test('renders circular 25%', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-25`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-value-25')
    })

    test('renders circular 50%', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-50`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-value-50')
    })

    test('renders circular 75%', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-75`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-value-75')
    })

    test('renders circular 100%', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-100`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-value-100')
    })
  })

  test.describe('Circular Progress - Variants', () => {
    test('renders all circular variants', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-all-variants')
    })

    test('renders circular default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-variant-default')
    })

    test('renders circular primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-variant-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-variant-primary')
    })

    test('renders circular success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-variant-success')
    })

    test('renders circular warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-variant-warning')
    })

    test('renders circular error variant', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-variant-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-variant-error')
    })
  })

  test.describe('Circular Progress - Sizes', () => {
    test('renders all circular sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-all-sizes')
    })

    test('renders circular small size', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-size-small')
    })

    test('renders circular medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-size-medium')
    })

    test('renders circular large size', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-size-large')
    })

    test('renders circular extra large size', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-size-xl')
    })
  })

  test.describe('Circular Progress - Features', () => {
    test('renders circular with value display', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-show-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-show-value')
    })

    test('renders circular indeterminate', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-indeterminate`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-indeterminate')
    })

    test('renders circular with custom stroke width', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-custom-stroke`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-custom-stroke')
    })

    test('renders circular with all features', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-all-features`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'circular-all-features')
    })
  })

  test.describe('Circular Progress - Animations', () => {
    test('shows circular progress animation', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-animated`)
      await page.waitForLoadState('networkidle')
      
      // Capture initial state
      await takeComponentScreenshot(page, 'progress', 'circular-animation-start')
      
      // Trigger animation
      await page.click('.animate-circular')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'circular-animation-mid')
      
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'circular-animation-end')
    })

    test('shows circular indeterminate spin', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-indeterminate`)
      await page.waitForLoadState('networkidle')
      
      // Capture multiple frames of the spin animation
      await takeComponentScreenshot(page, 'progress', 'circular-spin-frame1')
      await page.waitForTimeout(333)
      await takeComponentScreenshot(page, 'progress', 'circular-spin-frame2')
      await page.waitForTimeout(333)
      await takeComponentScreenshot(page, 'progress', 'circular-spin-frame3')
    })
  })

  test.describe('Use Cases', () => {
    test('renders file upload progress', async ({ page }) => {
      await page.goto(`${baseUrl}--file-upload`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-file-upload')
    })

    test('renders loading states', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-loading-states')
    })

    test('renders task progress', async ({ page }) => {
      await page.goto(`${baseUrl}--task-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-task-progress')
    })

    test('renders multi-step progress', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-step`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-multi-step')
    })

    test('renders stacked progress bars', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-stacked')
    })

    test('renders progress with status indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--with-status`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'use-case-status-indicators')
    })
  })

  test.describe('Special States', () => {
    test('renders buffering state', async ({ page }) => {
      await page.goto(`${baseUrl}--buffering`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-buffering')
    })

    test('renders paused state', async ({ page }) => {
      await page.goto(`${baseUrl}--paused`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-paused')
    })

    test('renders error state with retry', async ({ page }) => {
      await page.goto(`${baseUrl}--error-retry`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-error-retry')
    })

    test('renders segmented progress', async ({ page }) => {
      await page.goto(`${baseUrl}--segmented`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-segmented')
    })

    test('renders gradient progress', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-gradient')
    })

    test('renders striped progress', async ({ page }) => {
      await page.goto(`${baseUrl}--striped`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'state-striped')
    })
  })

  test.describe('Layouts', () => {
    test('renders inline progress', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'layout-inline')
    })

    test('renders vertical layout', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'layout-vertical')
    })

    test('renders progress grid', async ({ page }) => {
      await page.goto(`${baseUrl}--grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'layout-grid')
    })

    test('renders progress in card', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'layout-in-card')
    })

    test('renders progress in form', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'layout-in-form')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'progress-responsive')
    })

    test('shows mobile-friendly progress', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'mobile-progress')
    })

    test('shows mobile circular progress', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--circular-mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'mobile-circular')
    })

    test('shows stacked layout on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-stacked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'mobile-stacked')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'progress-color-modes')
    })

    test('shows circular in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--circular-all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'dark-mode-circular')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'dark-mode-contrast')
    })

    test('shows indeterminate in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'dark-mode-indeterminate')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'progress', 'accessibility-focus')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'accessibility-contrast')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'accessibility-screen-reader')
    })

    test('shows live region updates', async ({ page }) => {
      await page.goto(`${baseUrl}--live-region`)
      await page.waitForLoadState('networkidle')
      
      // Trigger progress update
      await page.click('.update-progress')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'progress', 'accessibility-live-update')
    })
  })

  test.describe('Performance', () => {
    test('renders many progress bars efficiently', async ({ page }) => {
      await page.goto(`${baseUrl}--many-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'progress', 'performance-many')
    })

    test('handles rapid updates', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-updates`)
      await page.waitForLoadState('networkidle')
      
      // Start rapid updates
      await page.click('.start-rapid')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'progress', 'performance-rapid-updates')
    })
  })
})