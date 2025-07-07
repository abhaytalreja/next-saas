import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Select Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-inputs-select'

  test.describe('Sizes', () => {
    test('renders all select sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'size-large')
    })
  })

  test.describe('States', () => {
    test('renders default state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-default')
    })

    test('renders with placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-placeholder')
    })

    test('renders selected state', async ({ page }) => {
      await page.goto(`${baseUrl}--selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-selected')
    })

    test('renders disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-disabled')
    })

    test('renders disabled with value', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-with-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-disabled-with-value')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-error')
    })

    test('renders loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'state-loading')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const select = page.locator('select').first()
      await select.hover()
      await takeComponentScreenshot(page, 'select', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const select = page.locator('select').first()
      await select.focus()
      await takeComponentScreenshot(page, 'select', 'interaction-focus')
    })

    test('shows focus with error', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      
      const select = page.locator('select').first()
      await select.focus()
      await takeComponentScreenshot(page, 'select', 'interaction-focus-error')
    })

    test('interaction states sequence', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await testInteractionStates(page, 'select', 'select')
    })
  })

  test.describe('Dropdown States', () => {
    test('shows open dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      // Click to open dropdown
      await page.click('select')
      await page.waitForTimeout(200) // Wait for animation
      await takeComponentScreenshot(page, 'select', 'dropdown-open')
    })

    test('shows dropdown with many options', async ({ page }) => {
      await page.goto(`${baseUrl}--many-options`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'dropdown-many-options')
    })

    test('shows dropdown with grouped options', async ({ page }) => {
      await page.goto(`${baseUrl}--grouped-options`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'dropdown-grouped')
    })

    test('shows dropdown with long option text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-options`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'dropdown-long-options')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'all-variants')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'variant-outline')
    })

    test('renders filled variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-filled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'variant-filled')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'variant-ghost')
    })
  })

  test.describe('With Icons', () => {
    test('renders with left icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-left-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'with-left-icon')
    })

    test('renders with custom arrow icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-custom-arrow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'with-custom-arrow')
    })

    test('renders with icons in different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--icons-all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'icons-all-sizes')
    })
  })

  test.describe('Multiple Select', () => {
    test('renders multiple select default', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'multiple-default')
    })

    test('renders multiple select with selections', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'multiple-selected')
    })

    test('renders multiple select with many selections', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-many-selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'multiple-many-selected')
    })

    test('shows multiple select open state', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select[multiple]')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'multiple-open')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with custom width', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'custom-width')
    })

    test('renders full width', async ({ page }) => {
      await page.goto(`${baseUrl}--full-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'full-width')
    })

    test('renders with long placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--long-placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'long-placeholder')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'custom-class')
    })

    test('renders in a form layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'in-form')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'select-responsive')
    })

    test('handles dropdown on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'mobile-dropdown')
    })

    test('shows touch-friendly sizes on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'mobile-sizes')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'select-color-modes')
    })

    test('shows variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'dark-mode-variants')
    })

    test('shows states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'dark-mode-states')
    })

    test('shows dropdown in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'select', 'dark-mode-dropdown')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus ring clearly', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'select', 'accessibility-focus-ring')
    })

    test('maintains contrast in disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'accessibility-disabled-contrast')
    })

    test('shows error state clearly', async ({ page }) => {
      await page.goto(`${baseUrl}--error-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'select', 'accessibility-error-contrast')
    })

    test('keyboard navigation through options', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      // Focus and open
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await page.waitForTimeout(200)
      
      // Navigate through options
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'select', 'accessibility-keyboard-nav')
    })
  })
})