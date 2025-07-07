import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Form Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-forms-form'

  test.describe('Basic Forms', () => {
    test('renders basic form', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'basic-default')
    })

    test('renders simple form', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'basic-simple')
    })

    test('renders form with sections', async ({ page }) => {
      await page.goto(`${baseUrl}--with-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'basic-sections')
    })

    test('renders form with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'basic-actions')
    })

    test('renders minimal form', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'basic-minimal')
    })
  })

  test.describe('Form States', () => {
    test('renders loading form', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'state-loading')
    })

    test('renders disabled form', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'state-disabled')
    })

    test('renders readonly form', async ({ page }) => {
      await page.goto(`${baseUrl}--readonly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'state-readonly')
    })

    test('shows form submission state', async ({ page }) => {
      await page.goto(`${baseUrl}--submitting`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'state-submitting')
    })
  })

  test.describe('Form Fields', () => {
    test('renders form with text fields', async ({ page }) => {
      await page.goto(`${baseUrl}--text-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-text')
    })

    test('renders form with input types', async ({ page }) => {
      await page.goto(`${baseUrl}--input-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-input-types')
    })

    test('renders form with selects', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selects`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-selects')
    })

    test('renders form with checkboxes', async ({ page }) => {
      await page.goto(`${baseUrl}--with-checkboxes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-checkboxes')
    })

    test('renders form with radio buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-radios`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-radios')
    })

    test('renders form with textareas', async ({ page }) => {
      await page.goto(`${baseUrl}--with-textareas`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'fields-textareas')
    })
  })

  test.describe('Form Sections', () => {
    test('renders section with title', async ({ page }) => {
      await page.goto(`${baseUrl}--section-title`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'section-title')
    })

    test('renders section with description', async ({ page }) => {
      await page.goto(`${baseUrl}--section-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'section-description')
    })

    test('renders multiple sections', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'section-multiple')
    })

    test('renders nested sections', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'section-nested')
    })

    test('renders collapsible sections', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'section-collapsible')
    })
  })

  test.describe('Form Actions', () => {
    test('renders left aligned actions', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-left')
    })

    test('renders center aligned actions', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-center')
    })

    test('renders right aligned actions', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-right')
    })

    test('renders spaced between actions', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-between`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-between')
    })

    test('renders multiple action buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-multiple')
    })

    test('renders action button states', async ({ page }) => {
      await page.goto(`${baseUrl}--action-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'actions-states')
    })
  })

  test.describe('Form Validation', () => {
    test('renders form with errors', async ({ page }) => {
      await page.goto(`${baseUrl}--with-errors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'validation-errors')
    })

    test('renders field-level errors', async ({ page }) => {
      await page.goto(`${baseUrl}--field-errors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'validation-field-errors')
    })

    test('renders form-level error', async ({ page }) => {
      await page.goto(`${baseUrl}--form-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'validation-form-error')
    })

    test('renders success message', async ({ page }) => {
      await page.goto(`${baseUrl}--success-message`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'validation-success')
    })

    test('renders mixed validation states', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-validation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'validation-mixed')
    })

    test('shows validation on interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive-validation`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[name="email"]', 'invalid-email')
      await page.blur('input[name="email"]')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'form', 'validation-interactive')
    })
  })

  test.describe('Form Layouts', () => {
    test('renders single column layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-single-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-single-column')
    })

    test('renders two column layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-two-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-two-columns')
    })

    test('renders grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-grid')
    })

    test('renders inline layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-inline')
    })

    test('renders horizontal layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-horizontal')
    })

    test('renders compact layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'layout-compact')
    })
  })

  test.describe('Complex Forms', () => {
    test('renders user registration form', async ({ page }) => {
      await page.goto(`${baseUrl}--user-registration`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-registration')
    })

    test('renders contact form', async ({ page }) => {
      await page.goto(`${baseUrl}--contact-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-contact')
    })

    test('renders profile settings form', async ({ page }) => {
      await page.goto(`${baseUrl}--profile-settings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-profile')
    })

    test('renders checkout form', async ({ page }) => {
      await page.goto(`${baseUrl}--checkout-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-checkout')
    })

    test('renders survey form', async ({ page }) => {
      await page.goto(`${baseUrl}--survey-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-survey')
    })

    test('renders application form', async ({ page }) => {
      await page.goto(`${baseUrl}--application-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'complex-application')
    })
  })

  test.describe('Interactive States', () => {
    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-states`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'form', 'interactive-focus')
    })

    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-states`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('input:first-child')
      await takeComponentScreenshot(page, 'form', 'interactive-hover')
    })

    test('shows active states', async ({ page }) => {
      await page.goto(`${baseUrl}--active-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input:first-child')
      await takeComponentScreenshot(page, 'form', 'interactive-active')
    })

    test('shows form interaction flow', async ({ page }) => {
      await page.goto(`${baseUrl}--interaction-flow`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[name="name"]', 'John Doe')
      await page.fill('input[name="email"]', 'john@example.com')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'form', 'interactive-flow')
    })
  })

  test.describe('Form Progress', () => {
    test('renders form with progress indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--with-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'progress-indicator')
    })

    test('renders multi-step form', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-step`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'progress-multi-step')
    })

    test('renders wizard form', async ({ page }) => {
      await page.goto(`${baseUrl}--wizard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'progress-wizard')
    })

    test('shows step navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--step-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'progress-navigation')
    })
  })

  test.describe('Form Styling', () => {
    test('renders bordered form', async ({ page }) => {
      await page.goto(`${baseUrl}--bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'style-bordered')
    })

    test('renders card form', async ({ page }) => {
      await page.goto(`${baseUrl}--card-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'style-card')
    })

    test('renders flat form', async ({ page }) => {
      await page.goto(`${baseUrl}--flat`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'style-flat')
    })

    test('renders modern form', async ({ page }) => {
      await page.goto(`${baseUrl}--modern`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'style-modern')
    })

    test('renders classic form', async ({ page }) => {
      await page.goto(`${baseUrl}--classic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'style-classic')
    })
  })

  test.describe('Form Context', () => {
    test('renders form in modal', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'context-modal')
    })

    test('renders form in sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'context-sidebar')
    })

    test('renders form in drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--in-drawer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'context-drawer')
    })

    test('renders inline form', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'context-inline')
    })

    test('renders form in card', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'context-card')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'form-responsive')
    })

    test('shows mobile form layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'responsive-mobile')
    })

    test('shows tablet form layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'responsive-tablet')
    })

    test('shows mobile stacking', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-stacking`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'responsive-stacking')
    })

    test('shows adaptive columns', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'form-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--user-registration`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'dark-mode-contrast')
    })

    test('shows validation in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-errors`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'dark-mode-validation')
    })

    test('shows form sections in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-sections`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'dark-mode-sections')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'form', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'form', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'accessibility-contrast')
    })

    test('shows error announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--error-announcements`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'accessibility-errors')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders very long form', async ({ page }) => {
      await page.goto(`${baseUrl}--very-long`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-long-form')
    })

    test('renders form with many fields', async ({ page }) => {
      await page.goto(`${baseUrl}--many-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-many-fields')
    })

    test('renders minimal required form', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-required`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-minimal')
    })

    test('renders form with dynamic fields', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-fields`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-dynamic')
    })

    test('renders form with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-custom-styling')
    })

    test('renders empty form', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'form', 'edge-empty')
    })
  })
})