import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Radio Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-inputs-radio'

  test.describe('States', () => {
    test('renders all radio states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'all-states')
    })

    test('renders unselected state', async ({ page }) => {
      await page.goto(`${baseUrl}--unselected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-unselected')
    })

    test('renders selected state', async ({ page }) => {
      await page.goto(`${baseUrl}--selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-selected')
    })

    test('renders disabled unselected', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-unselected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-disabled-unselected')
    })

    test('renders disabled selected', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-disabled-selected')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-error')
    })

    test('renders required state', async ({ page }) => {
      await page.goto(`${baseUrl}--required`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'state-required')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'size-large')
    })

    test('shows all sizes selected', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes-selected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'all-sizes-selected')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'variant-default')
    })

    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'variant-primary')
    })

    test('renders secondary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-secondary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'variant-secondary')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'variant-outline')
    })
  })

  test.describe('With Labels', () => {
    test('renders with label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'with-label')
    })

    test('renders with long label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-long-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'with-long-label')
    })

    test('renders with label and description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'with-description')
    })

    test('renders with label on right', async ({ page }) => {
      await page.goto(`${baseUrl}--label-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'label-right')
    })

    test('renders with label on left', async ({ page }) => {
      await page.goto(`${baseUrl}--label-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'label-left')
    })

    test('shows disabled with label', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'disabled-with-label')
    })
  })

  test.describe('Radio Groups', () => {
    test('renders radio group vertical', async ({ page }) => {
      await page.goto(`${baseUrl}--group-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-vertical')
    })

    test('renders radio group horizontal', async ({ page }) => {
      await page.goto(`${baseUrl}--group-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-horizontal')
    })

    test('renders radio group grid', async ({ page }) => {
      await page.goto(`${baseUrl}--group-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-grid')
    })

    test('shows group with selection', async ({ page }) => {
      await page.goto(`${baseUrl}--group-with-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-with-selection')
    })

    test('shows group with mixed states', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-mixed-states')
    })

    test('shows group with error', async ({ page }) => {
      await page.goto(`${baseUrl}--group-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-error')
    })

    test('shows group with descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--group-with-descriptions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'group-with-descriptions')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.hover()
      await takeComponentScreenshot(page, 'radio', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.focus()
      await takeComponentScreenshot(page, 'radio', 'interaction-focus')
    })

    test('shows focus on selected', async ({ page }) => {
      await page.goto(`${baseUrl}--selected`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.focus()
      await takeComponentScreenshot(page, 'radio', 'interaction-focus-selected')
    })

    test('shows active/pressed state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.click({ force: true, trial: true })
      await takeComponentScreenshot(page, 'radio', 'interaction-active')
    })

    test('shows selection animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.click()
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'radio', 'interaction-animating')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'custom-colors')
    })

    test('renders in card layout', async ({ page }) => {
      await page.goto(`${baseUrl}--card-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'card-layout')
    })

    test('renders in button style', async ({ page }) => {
      await page.goto(`${baseUrl}--button-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'button-style')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'in-form')
    })

    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'with-icons')
    })

    test('renders segmented control style', async ({ page }) => {
      await page.goto(`${baseUrl}--segmented-control`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'segmented-control')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--group-vertical`, 'radio-responsive')
    })

    test('handles touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'mobile-touch-targets')
    })

    test('shows mobile-friendly group layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--group-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'mobile-group-horizontal')
    })

    test('adapts card layout for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--card-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'mobile-card-layout')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-states`, 'radio-color-modes')
    })

    test('shows variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--group-with-descriptions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'dark-mode-contrast')
    })

    test('shows disabled states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'dark-mode-disabled')
    })

    test('shows card layout in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--card-layout`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'dark-mode-card-layout')
    })
  })

  test.describe('Accessibility', () => {
    test('shows clear focus indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'radio', 'accessibility-focus-indicator')
    })

    test('maintains contrast for disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'accessibility-disabled')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus first radio
      await page.keyboard.press('Tab')
      // Arrow down to navigate
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'radio', 'accessibility-keyboard-nav')
    })

    test('shows fieldset and legend', async ({ page }) => {
      await page.goto(`${baseUrl}--with-fieldset`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'accessibility-fieldset')
    })

    test('shows error announcement', async ({ page }) => {
      await page.goto(`${baseUrl}--error-announcement`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'radio', 'accessibility-error')
    })
  })

  test.describe('Animations', () => {
    test('captures selection animation frames', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      
      // Capture before click
      await takeComponentScreenshot(page, 'radio', 'animation-before')
      
      // Click and capture during animation
      await radio.click()
      await page.waitForTimeout(50)
      await takeComponentScreenshot(page, 'radio', 'animation-during')
      
      // Wait for animation to complete
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'radio', 'animation-after')
    })

    test('shows ripple effect on click', async ({ page }) => {
      await page.goto(`${baseUrl}--ripple-effect`)
      await page.waitForLoadState('networkidle')
      
      const radio = page.locator('input[type="radio"]').first()
      await radio.click()
      await page.waitForTimeout(100) // Mid-ripple
      await takeComponentScreenshot(page, 'radio', 'animation-ripple')
    })
  })
})