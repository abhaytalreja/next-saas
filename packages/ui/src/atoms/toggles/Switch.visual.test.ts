import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('Switch Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-toggles-switch'

  test.describe('Switch States', () => {
    test('renders unchecked switch', async ({ page }) => {
      await page.goto(`${baseUrl}--unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'state-unchecked')
    })

    test('renders checked switch', async ({ page }) => {
      await page.goto(`${baseUrl}--checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'state-checked')
    })

    test('renders disabled unchecked switch', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'state-disabled-unchecked')
    })

    test('renders disabled checked switch', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'state-disabled-checked')
    })

    test('compares all states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'state-comparison')
    })
  })

  test.describe('Switch Sizes', () => {
    test('renders small switch', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'size-small')
    })

    test('renders default switch', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'size-default')
    })

    test('renders large switch', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'size-large')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'size-comparison')
    })

    test('shows size variations in checked state', async ({ page }) => {
      await page.goto(`${baseUrl}--sizes-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'size-checked-comparison')
    })
  })

  test.describe('Switch Colors', () => {
    test('renders default color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'color-default')
    })

    test('renders success color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'color-success')
    })

    test('renders error color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'color-error')
    })

    test('compares all colors', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'color-comparison')
    })

    test('shows colors in unchecked state', async ({ page }) => {
      await page.goto(`${baseUrl}--colors-unchecked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'color-unchecked-comparison')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('label')
      await takeComponentScreenshot(page, 'switch', 'interactive-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'switch', 'interactive-focus')
    })

    test('shows active state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await takeComponentScreenshot(page, 'switch', 'interactive-active')
    })

    test('shows keyboard interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await takeComponentScreenshot(page, 'switch', 'interactive-keyboard')
    })

    test('shows toggle interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--toggle`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'switch', 'interactive-toggle')
    })
  })

  test.describe('Switch Animations', () => {
    test('shows toggle on animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-on`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'switch', 'animation-toggle-on')
    })

    test('shows toggle off animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-off`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'switch', 'animation-toggle-off')
    })

    test('shows smooth transitions', async ({ page }) => {
      await page.goto(`${baseUrl}--smooth-transition`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'switch', 'animation-smooth')
    })

    test('shows spring animation', async ({ page }) => {
      await page.goto(`${baseUrl}--spring-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'switch', 'animation-spring')
    })
  })

  test.describe('Switch with Labels', () => {
    test('renders with text label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-text-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'label-text')
    })

    test('renders with left and right labels', async ({ page }) => {
      await page.goto(`${baseUrl}--with-side-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'label-sides')
    })

    test('renders with description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'label-description')
    })

    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'label-icons')
    })

    test('renders with status text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-status`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'label-status')
    })
  })

  test.describe('Switch Groups', () => {
    test('renders switch group vertical', async ({ page }) => {
      await page.goto(`${baseUrl}--group-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'group-vertical')
    })

    test('renders switch group horizontal', async ({ page }) => {
      await page.goto(`${baseUrl}--group-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'group-horizontal')
    })

    test('renders switch group with mixed states', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'group-mixed')
    })

    test('renders switch group with dividers', async ({ page }) => {
      await page.goto(`${baseUrl}--group-dividers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'group-dividers')
    })

    test('renders settings panel switches', async ({ page }) => {
      await page.goto(`${baseUrl}--settings-panel`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'group-settings')
    })
  })

  test.describe('Use Cases', () => {
    test('renders notification settings', async ({ page }) => {
      await page.goto(`${baseUrl}--notification-settings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-notifications')
    })

    test('renders privacy settings', async ({ page }) => {
      await page.goto(`${baseUrl}--privacy-settings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-privacy')
    })

    test('renders feature toggles', async ({ page }) => {
      await page.goto(`${baseUrl}--feature-toggles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-features')
    })

    test('renders theme toggle', async ({ page }) => {
      await page.goto(`${baseUrl}--theme-toggle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-theme')
    })

    test('renders availability toggle', async ({ page }) => {
      await page.goto(`${baseUrl}--availability-toggle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-availability')
    })

    test('renders form switches', async ({ page }) => {
      await page.goto(`${baseUrl}--form-switches`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'use-case-form')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders with custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'style-custom-colors')
    })

    test('renders with rounded style', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'style-rounded')
    })

    test('renders with pill style', async ({ page }) => {
      await page.goto(`${baseUrl}--pill-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'style-pill')
    })

    test('renders with border style', async ({ page }) => {
      await page.goto(`${baseUrl}--border-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'style-border')
    })

    test('renders with shadow style', async ({ page }) => {
      await page.goto(`${baseUrl}--shadow-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'style-shadow')
    })
  })

  test.describe('Error States', () => {
    test('renders with validation error', async ({ page }) => {
      await page.goto(`${baseUrl}--validation-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'error-validation')
    })

    test('renders with helper text', async ({ page }) => {
      await page.goto(`${baseUrl}--helper-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'error-helper')
    })

    test('renders with warning state', async ({ page }) => {
      await page.goto(`${baseUrl}--warning-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'error-warning')
    })

    test('renders in loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'error-loading')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'switch-responsive')
    })

    test('shows mobile switch behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'responsive-mobile')
    })

    test('shows tablet switch behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'responsive-tablet')
    })

    test('shows touch-friendly sizing', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--touch-friendly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'responsive-touch')
    })

    test('shows adaptive layouts', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'switch-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'dark-mode-contrast')
    })

    test('shows disabled states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'dark-mode-disabled')
    })

    test('shows form context in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--form-switches`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'dark-mode-form')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'switch', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await takeComponentScreenshot(page, 'switch', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'accessibility-contrast')
    })

    test('shows aria states', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'accessibility-aria')
    })

    test('shows reduced motion variant', async ({ page }) => {
      await page.goto(`${baseUrl}--reduced-motion`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'accessibility-reduced-motion')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'edge-long-labels')
    })

    test('renders with no labels', async ({ page }) => {
      await page.goto(`${baseUrl}--no-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'edge-no-labels')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'edge-special-chars')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'edge-constrained')
    })

    test('renders with custom attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'switch', 'edge-custom-attributes')
    })

    test('renders rapid toggling', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-toggle`)
      await page.waitForLoadState('networkidle')
      
      // Rapid clicks
      await page.click('label')
      await page.waitForTimeout(50)
      await page.click('label')
      await page.waitForTimeout(50)
      await page.click('label')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'switch', 'edge-rapid-toggle')
    })
  })
})