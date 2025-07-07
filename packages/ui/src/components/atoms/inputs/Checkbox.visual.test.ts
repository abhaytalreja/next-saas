import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Checkbox Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-inputs-checkbox'

  test.describe('States', () => {
    test('renders all checkbox states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'all-states')
    })

    test('renders unchecked state', async ({ page }) => {
      await page.goto(`${baseUrl}--unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-unchecked')
    })

    test('renders checked state', async ({ page }) => {
      await page.goto(`${baseUrl}--checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-checked')
    })

    test('renders indeterminate state', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-indeterminate')
    })

    test('renders disabled unchecked', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-disabled-unchecked')
    })

    test('renders disabled checked', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-disabled-checked')
    })

    test('renders disabled indeterminate', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-indeterminate`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-disabled-indeterminate')
    })

    test('renders error state unchecked', async ({ page }) => {
      await page.goto(`${baseUrl}--error-unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-error-unchecked')
    })

    test('renders error state checked', async ({ page }) => {
      await page.goto(`${baseUrl}--error-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'state-error-checked')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'size-large')
    })

    test('shows all sizes checked', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'all-sizes-checked')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'variant-default')
    })

    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'variant-primary')
    })

    test('renders secondary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-secondary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'variant-secondary')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'variant-outline')
    })
  })

  test.describe('With Labels', () => {
    test('renders with label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'with-label')
    })

    test('renders with long label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-long-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'with-long-label')
    })

    test('renders with label and description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'with-description')
    })

    test('renders with label on right', async ({ page }) => {
      await page.goto(`${baseUrl}--label-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'label-right')
    })

    test('renders with label on left', async ({ page }) => {
      await page.goto(`${baseUrl}--label-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'label-left')
    })

    test('shows disabled with label', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'disabled-with-label')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.hover()
      await takeComponentScreenshot(page, 'checkbox', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.focus()
      await takeComponentScreenshot(page, 'checkbox', 'interaction-focus')
    })

    test('shows focus on checked', async ({ page }) => {
      await page.goto(`${baseUrl}--checked`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.focus()
      await takeComponentScreenshot(page, 'checkbox', 'interaction-focus-checked')
    })

    test('shows active/pressed state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.click({ force: true, trial: true })
      await takeComponentScreenshot(page, 'checkbox', 'interaction-active')
    })

    test('shows click animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      await checkbox.click()
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'checkbox', 'interaction-animating')
    })
  })

  test.describe('Group Layouts', () => {
    test('renders checkbox group vertical', async ({ page }) => {
      await page.goto(`${baseUrl}--group-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'group-vertical')
    })

    test('renders checkbox group horizontal', async ({ page }) => {
      await page.goto(`${baseUrl}--group-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'group-horizontal')
    })

    test('renders checkbox group grid', async ({ page }) => {
      await page.goto(`${baseUrl}--group-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'group-grid')
    })

    test('shows group with mixed states', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'group-mixed-states')
    })

    test('shows group with error', async ({ page }) => {
      await page.goto(`${baseUrl}--group-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'group-error')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with custom icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'custom-icons')
    })

    test('renders with custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'custom-colors')
    })

    test('renders rounded variant', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'rounded')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'in-form')
    })

    test('renders with required indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--required`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'required')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--with-label`, 'checkbox-responsive')
    })

    test('handles touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'mobile-touch-targets')
    })

    test('shows mobile-friendly group layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--group-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'mobile-group')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-states`, 'checkbox-color-modes')
    })

    test('shows variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'dark-mode-contrast')
    })

    test('shows disabled states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'dark-mode-disabled')
    })
  })

  test.describe('Accessibility', () => {
    test('shows clear focus indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'checkbox', 'accessibility-focus-indicator')
    })

    test('maintains contrast for disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'accessibility-disabled')
    })

    test('shows keyboard interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-interaction`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus first checkbox
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await takeComponentScreenshot(page, 'checkbox', 'accessibility-keyboard')
    })

    test('shows screen reader labels', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'accessibility-screen-reader')
    })
  })

  test.describe('Animations', () => {
    test('captures check animation frames', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      const checkbox = page.locator('input[type="checkbox"]').first()
      
      // Capture before click
      await takeComponentScreenshot(page, 'checkbox', 'animation-before')
      
      // Click and capture during animation
      await checkbox.click()
      await page.waitForTimeout(50)
      await takeComponentScreenshot(page, 'checkbox', 'animation-during')
      
      // Wait for animation to complete
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'checkbox', 'animation-after')
    })

    test('shows indeterminate animation', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate-animated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'checkbox', 'animation-indeterminate')
    })
  })
})