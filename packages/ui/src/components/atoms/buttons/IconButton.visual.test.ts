import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('IconButton Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=components-atoms-buttons-iconbutton'

  test.describe('Basic IconButton States', () => {
    test('renders basic icon button', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'basic')
    })

    test('renders loading icon button', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'loading')
    })

    test('renders disabled icon button', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'disabled')
    })

    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-states`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button')
      await takeComponentScreenshot(page, 'icon-button', 'hover-state')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-states`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon-button', 'focus-state')
    })

    test('shows active state', async ({ page }) => {
      await page.goto(`${baseUrl}--active-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await takeComponentScreenshot(page, 'icon-button', 'active-state')
    })
  })

  test.describe('Variant Styles', () => {
    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--primary-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'primary-variant')
    })

    test('renders secondary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--secondary-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'secondary-variant')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--outline-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'outline-variant')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--ghost-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'ghost-variant')
    })

    test('renders destructive variant', async ({ page }) => {
      await page.goto(`${baseUrl}--destructive-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'destructive-variant')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'variant-comparison')
    })
  })

  test.describe('Size Variations', () => {
    test('renders xs size', async ({ page }) => {
      await page.goto(`${baseUrl}--xs-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'xs-size')
    })

    test('renders sm size', async ({ page }) => {
      await page.goto(`${baseUrl}--sm-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'sm-size')
    })

    test('renders md size', async ({ page }) => {
      await page.goto(`${baseUrl}--md-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'md-size')
    })

    test('renders lg size', async ({ page }) => {
      await page.goto(`${baseUrl}--lg-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'lg-size')
    })

    test('renders xl size', async ({ page }) => {
      await page.goto(`${baseUrl}--xl-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'xl-size')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--size-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'size-comparison')
    })
  })

  test.describe('Icon Types', () => {
    test('renders with common icons', async ({ page }) => {
      await page.goto(`${baseUrl}--common-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'common-icons')
    })

    test('renders with navigation icons', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'navigation-icons')
    })

    test('renders with action icons', async ({ page }) => {
      await page.goto(`${baseUrl}--action-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'action-icons')
    })

    test('renders with social icons', async ({ page }) => {
      await page.goto(`${baseUrl}--social-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'social-icons')
    })

    test('renders with file icons', async ({ page }) => {
      await page.goto(`${baseUrl}--file-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'file-icons')
    })

    test('renders with custom SVG icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-svg-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'custom-svg-icons')
    })
  })

  test.describe('Loading States', () => {
    test('renders loading with spinner', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-spinner`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'loading-spinner')
    })

    test('shows loading in different variants', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'loading-variants')
    })

    test('shows loading in different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'loading-sizes')
    })

    test('compares normal vs loading states', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'loading-comparison')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover effects on all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-effects`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:first-child')
      await takeComponentScreenshot(page, 'icon-button', 'hover-effects')
    })

    test('shows focus rings on all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-rings`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon-button', 'focus-rings')
    })

    test('shows active (pressed) states', async ({ page }) => {
      await page.goto(`${baseUrl}--active-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:first-child')
      await takeComponentScreenshot(page, 'icon-button', 'active-states')
    })

    test('shows disabled states', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'disabled-states')
    })
  })

  test.describe('Preset Components', () => {
    test('renders CloseButton preset', async ({ page }) => {
      await page.goto(`${baseUrl}--close-button`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'close-button')
    })

    test('renders MenuButton preset', async ({ page }) => {
      await page.goto(`${baseUrl}--menu-button`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'menu-button')
    })

    test('shows preset button interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--preset-interactions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:first-child')
      await takeComponentScreenshot(page, 'icon-button', 'preset-interactions')
    })

    test('compares preset buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--preset-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'preset-comparison')
    })

    test('shows preset buttons in different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--preset-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'preset-sizes')
    })
  })

  test.describe('Usage Patterns', () => {
    test('renders in toolbar context', async ({ page }) => {
      await page.goto(`${baseUrl}--toolbar-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'toolbar-context')
    })

    test('renders in card actions', async ({ page }) => {
      await page.goto(`${baseUrl}--card-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'card-actions')
    })

    test('renders in navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'navigation-context')
    })

    test('renders in form controls', async ({ page }) => {
      await page.goto(`${baseUrl}--form-controls`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'form-controls')
    })

    test('renders as floating action button', async ({ page }) => {
      await page.goto(`${baseUrl}--floating-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'floating-action')
    })

    test('renders in button groups', async ({ page }) => {
      await page.goto(`${baseUrl}--button-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'button-groups')
    })
  })

  test.describe('Accessibility Features', () => {
    test('shows aria-label indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'aria-labels')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon-button', 'keyboard-navigation')
    })

    test('shows high contrast compatibility', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'high-contrast')
    })

    test('shows focus management', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-management`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon-button', 'focus-management')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'icon-button-responsive')
    })

    test('shows mobile icon button behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-behavior`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'responsive-mobile')
    })

    test('shows tablet icon button behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-behavior`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'responsive-tablet')
    })

    test('shows touch-friendly sizing', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--touch-friendly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'responsive-touch')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'icon-button-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-comparison`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'dark-mode-variants')
    })

    test('shows interactions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-effects`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:first-child')
      await takeComponentScreenshot(page, 'icon-button', 'dark-mode-hover')
    })

    test('shows loading states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'dark-mode-loading')
    })

    test('shows disabled states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'dark-mode-disabled')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'edge-custom-styling')
    })

    test('renders with complex icons', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'edge-complex-icons')
    })

    test('renders with icon and text', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'edge-icon-with-text')
    })

    test('renders in constrained spaces', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'edge-constrained-space')
    })

    test('renders with very long aria-labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon-button', 'edge-long-aria-labels')
    })

    test('renders rapidly changing states', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-state-changes`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Toggle Loading")')
      await page.waitForTimeout(100)
      await page.click('button:has-text("Toggle Loading")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'icon-button', 'edge-rapid-changes')
    })
  })
})