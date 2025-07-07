import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('FormField Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-forms-formfield'

  test.describe('Basic FormField States', () => {
    test('renders basic form field', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'basic')
    })

    test('renders form field with label', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'with-label')
    })

    test('renders form field with description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'with-description')
    })

    test('renders form field with error', async ({ page }) => {
      await page.goto(`${baseUrl}--with-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'with-error')
    })

    test('renders required form field', async ({ page }) => {
      await page.goto(`${baseUrl}--required`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'required')
    })

    test('renders disabled form field', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'disabled')
    })
  })

  test.describe('FormField Combinations', () => {
    test('renders complete form field', async ({ page }) => {
      await page.goto(`${baseUrl}--complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'complete')
    })

    test('renders required field with description', async ({ page }) => {
      await page.goto(`${baseUrl}--required-with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'required-with-description')
    })

    test('renders field with error and description', async ({ page }) => {
      await page.goto(`${baseUrl}--error-with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'error-with-description')
    })

    test('renders disabled field with all elements', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'disabled-complete')
    })

    test('renders required field with error', async ({ page }) => {
      await page.goto(`${baseUrl}--required-with-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'required-with-error')
    })
  })

  test.describe('FormField with Different Input Types', () => {
    test('renders with text input', async ({ page }) => {
      await page.goto(`${baseUrl}--text-input`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'text-input')
    })

    test('renders with textarea', async ({ page }) => {
      await page.goto(`${baseUrl}--textarea`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'textarea')
    })

    test('renders with select', async ({ page }) => {
      await page.goto(`${baseUrl}--select`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'select')
    })

    test('renders with checkbox', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'checkbox')
    })

    test('renders with radio group', async ({ page }) => {
      await page.goto(`${baseUrl}--radio-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'radio-group')
    })

    test('renders with switch', async ({ page }) => {
      await page.goto(`${baseUrl}--switch`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'switch')
    })

    test('renders with file input', async ({ page }) => {
      await page.goto(`${baseUrl}--file-input`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'file-input')
    })

    test('renders with date picker', async ({ page }) => {
      await page.goto(`${baseUrl}--date-picker`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'date-picker')
    })
  })

  test.describe('Interactive States', () => {
    test('shows input focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await takeComponentScreenshot(page, 'form-field', 'input-focused')
    })

    test('shows input hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('input')
      await takeComponentScreenshot(page, 'form-field', 'input-hover')
    })

    test('shows filled input state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'Sample text input')
      await takeComponentScreenshot(page, 'form-field', 'input-filled')
    })

    test('shows label click interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label`)
      await page.waitForLoadState('networkidle')
      
      await page.click('label')
      await takeComponentScreenshot(page, 'form-field', 'label-clicked')
    })

    test('shows validation error state', async ({ page }) => {
      await page.goto(`${baseUrl}--validation`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'invalid@')
      await page.blur('input')
      await takeComponentScreenshot(page, 'form-field', 'validation-error')
    })
  })

  test.describe('FormField Layouts', () => {
    test('renders horizontal layout', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'horizontal-layout')
    })

    test('renders inline layout', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'inline-layout')
    })

    test('renders compact layout', async ({ page }) => {
      await page.goto(`${baseUrl}--compact-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'compact-layout')
    })

    test('renders spacious layout', async ({ page }) => {
      await page.goto(`${baseUrl}--spacious-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'spacious-layout')
    })

    test('compares layout variations', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'layout-comparison')
    })
  })

  test.describe('FormSection Component', () => {
    test('renders basic form section', async ({ page }) => {
      await page.goto(`${baseUrl}--section-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'section-basic')
    })

    test('renders form section with title', async ({ page }) => {
      await page.goto(`${baseUrl}--section-with-title`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'section-with-title')
    })

    test('renders form section with description', async ({ page }) => {
      await page.goto(`${baseUrl}--section-with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'section-with-description')
    })

    test('renders complete form section', async ({ page }) => {
      await page.goto(`${baseUrl}--section-complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'section-complete')
    })

    test('renders nested form sections', async ({ page }) => {
      await page.goto(`${baseUrl}--section-nested`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'section-nested')
    })

    test('renders form with multiple sections', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'multiple-sections')
    })
  })

  test.describe('Error States and Validation', () => {
    test('renders field with multiple errors', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-errors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'multiple-errors')
    })

    test('renders field with warning state', async ({ page }) => {
      await page.goto(`${baseUrl}--warning-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'warning-state')
    })

    test('renders field with success state', async ({ page }) => {
      await page.goto(`${baseUrl}--success-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'success-state')
    })

    test('renders field with loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'loading-state')
    })

    test('renders real-time validation', async ({ page }) => {
      await page.goto(`${baseUrl}--realtime-validation`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'test')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'form-field', 'realtime-validation')
    })
  })

  test.describe('Field Groups and Complex Forms', () => {
    test('renders field group', async ({ page }) => {
      await page.goto(`${baseUrl}--field-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'field-group')
    })

    test('renders address form', async ({ page }) => {
      await page.goto(`${baseUrl}--address-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'address-form')
    })

    test('renders profile form', async ({ page }) => {
      await page.goto(`${baseUrl}--profile-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'profile-form')
    })

    test('renders settings form', async ({ page }) => {
      await page.goto(`${baseUrl}--settings-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'settings-form')
    })

    test('renders registration form', async ({ page }) => {
      await page.goto(`${baseUrl}--registration-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'registration-form')
    })

    test('renders payment form', async ({ page }) => {
      await page.goto(`${baseUrl}--payment-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'payment-form')
    })
  })

  test.describe('Field Sizes and Spacing', () => {
    test('renders compact fields', async ({ page }) => {
      await page.goto(`${baseUrl}--compact-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'compact-fields')
    })

    test('renders default fields', async ({ page }) => {
      await page.goto(`${baseUrl}--default-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'default-fields')
    })

    test('renders spacious fields', async ({ page }) => {
      await page.goto(`${baseUrl}--spacious-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'spacious-fields')
    })

    test('renders mixed field sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'mixed-sizes')
    })

    test('compares field spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'spacing-comparison')
    })
  })

  test.describe('Label and Help Text Variations', () => {
    test('renders with long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'long-labels')
    })

    test('renders with long descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--long-descriptions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'long-descriptions')
    })

    test('renders with formatted help text', async ({ page }) => {
      await page.goto(`${baseUrl}--formatted-help`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'formatted-help')
    })

    test('renders with icon labels', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'icon-labels')
    })

    test('renders with tooltip help', async ({ page }) => {
      await page.goto(`${baseUrl}--tooltip-help`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('[data-tooltip]')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'form-field', 'tooltip-help')
    })
  })

  test.describe('Conditional Fields', () => {
    test('renders conditional field hidden', async ({ page }) => {
      await page.goto(`${baseUrl}--conditional-hidden`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'conditional-hidden')
    })

    test('renders conditional field shown', async ({ page }) => {
      await page.goto(`${baseUrl}--conditional-shown`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'conditional-shown')
    })

    test('shows conditional field animation', async ({ page }) => {
      await page.goto(`${baseUrl}--conditional-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.check('input[type="checkbox"]')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'form-field', 'conditional-animation')
    })

    test('renders dependent fields', async ({ page }) => {
      await page.goto(`${baseUrl}--dependent-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'dependent-fields')
    })

    test('shows field dependency chain', async ({ page }) => {
      await page.goto(`${baseUrl}--dependency-chain`)
      await page.waitForLoadState('networkidle')
      
      await page.selectOption('select', 'option1')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'form-field', 'dependency-chain')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'form-field-responsive')
    })

    test('shows mobile form layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'responsive-mobile')
    })

    test('shows tablet form layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'responsive-tablet')
    })

    test('shows adaptive field sizing', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-sizing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'responsive-adaptive')
    })

    test('shows responsive label behavior', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'responsive-labels')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--complete`, 'form-field-color-modes')
    })

    test('shows all states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'dark-mode-states')
    })

    test('shows error states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-error`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'dark-mode-error')
    })

    test('shows form sections in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-sections`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'dark-mode-sections')
    })

    test('shows focus states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await takeComponentScreenshot(page, 'form-field', 'dark-mode-focus')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-high-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-aria')
    })

    test('shows error announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--error-announcements`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'accessibility-error-announcements')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with no label or description', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'edge-minimal')
    })

    test('renders with very long error text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'edge-long-error')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'edge-special-chars')
    })

    test('renders with custom attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'edge-custom-attributes')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form-field', 'edge-constrained')
    })

    test('renders with dynamic content', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-content`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Add Field")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'form-field', 'edge-dynamic')
    })
  })
})