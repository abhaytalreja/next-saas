import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Textarea Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-inputs-textarea'

  test.describe('Sizes', () => {
    test('renders all textarea sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'size-large')
    })
  })

  test.describe('States', () => {
    test('renders all states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'all-states')
    })

    test('renders default state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-default')
    })

    test('renders with placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-placeholder')
    })

    test('renders with value', async ({ page }) => {
      await page.goto(`${baseUrl}--with-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-with-value')
    })

    test('renders disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-disabled')
    })

    test('renders disabled with value', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-with-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-disabled-with-value')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-error')
    })

    test('renders readonly state', async ({ page }) => {
      await page.goto(`${baseUrl}--readonly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'state-readonly')
    })
  })

  test.describe('Rows and Resize', () => {
    test('renders different row counts', async ({ page }) => {
      await page.goto(`${baseUrl}--row-counts`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'row-counts')
    })

    test('renders 2 rows', async ({ page }) => {
      await page.goto(`${baseUrl}--rows-2`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'rows-2')
    })

    test('renders 5 rows', async ({ page }) => {
      await page.goto(`${baseUrl}--rows-5`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'rows-5')
    })

    test('renders 10 rows', async ({ page }) => {
      await page.goto(`${baseUrl}--rows-10`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'rows-10')
    })

    test('renders with resize vertical', async ({ page }) => {
      await page.goto(`${baseUrl}--resize-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'resize-vertical')
    })

    test('renders with resize horizontal', async ({ page }) => {
      await page.goto(`${baseUrl}--resize-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'resize-horizontal')
    })

    test('renders with resize both', async ({ page }) => {
      await page.goto(`${baseUrl}--resize-both`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'resize-both')
    })

    test('renders with resize none', async ({ page }) => {
      await page.goto(`${baseUrl}--resize-none`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'resize-none')
    })
  })

  test.describe('Auto-resize', () => {
    test('renders with auto-resize', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-resize`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'auto-resize-empty')
    })

    test('shows auto-resize with content', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-resize`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'textarea', 'auto-resize-expanded')
    })

    test('shows auto-resize with max height', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-resize-max`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'textarea', 'auto-resize-max-height')
    })
  })

  test.describe('Character Counter', () => {
    test('renders with character counter', async ({ page }) => {
      await page.goto(`${baseUrl}--with-counter`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'with-counter')
    })

    test('shows counter near limit', async ({ page }) => {
      await page.goto(`${baseUrl}--counter-near-limit`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'counter-near-limit')
    })

    test('shows counter at limit', async ({ page }) => {
      await page.goto(`${baseUrl}--counter-at-limit`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'counter-at-limit')
    })

    test('shows counter over limit', async ({ page }) => {
      await page.goto(`${baseUrl}--counter-over-limit`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'counter-over-limit')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'all-variants')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'variant-outline')
    })

    test('renders filled variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-filled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'variant-filled')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'variant-ghost')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.hover()
      await takeComponentScreenshot(page, 'textarea', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.focus()
      await takeComponentScreenshot(page, 'textarea', 'interaction-focus')
    })

    test('shows focus with error', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.focus()
      await takeComponentScreenshot(page, 'textarea', 'interaction-focus-error')
    })

    test('shows typing state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.focus()
      await textarea.type('Typing in progress...')
      await takeComponentScreenshot(page, 'textarea', 'interaction-typing')
    })

    test('interaction states sequence', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await testInteractionStates(page, 'textarea', 'textarea')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with long placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--long-placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'long-placeholder')
    })

    test('renders with multiline content', async ({ page }) => {
      await page.goto(`${baseUrl}--multiline-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'multiline-content')
    })

    test('renders with code content', async ({ page }) => {
      await page.goto(`${baseUrl}--code-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'code-content')
    })

    test('renders with monospace font', async ({ page }) => {
      await page.goto(`${baseUrl}--monospace`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'monospace')
    })

    test('renders full width', async ({ page }) => {
      await page.goto(`${baseUrl}--full-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'full-width')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'custom-class')
    })

    test('renders in form layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'in-form')
    })

    test('renders with label and helper text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-label-helper`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'with-label-helper')
    })
  })

  test.describe('Scrolling Behavior', () => {
    test('shows vertical scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'vertical-scroll')
    })

    test('shows horizontal scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'horizontal-scroll')
    })

    test('shows word wrap behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--word-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'word-wrap')
    })

    test('shows no wrap behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--no-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'no-wrap')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'textarea-responsive')
    })

    test('handles touch interaction on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const textarea = page.locator('textarea').first()
      await textarea.tap()
      await takeComponentScreenshot(page, 'textarea', 'mobile-focused')
    })

    test('shows mobile-friendly sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'mobile-sizes')
    })

    test('adapts counter for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--with-counter`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'mobile-counter')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'textarea-color-modes')
    })

    test('shows all states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'dark-mode-states')
    })

    test('shows variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-value`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'dark-mode-contrast')
    })

    test('shows counter in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-counter`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'dark-mode-counter')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus ring clearly', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      // Tab to focus
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'textarea', 'accessibility-focus-ring')
    })

    test('maintains contrast in disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'accessibility-disabled-contrast')
    })

    test('shows error state clearly', async ({ page }) => {
      await page.goto(`${baseUrl}--error-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'accessibility-error-contrast')
    })

    test('handles screen reader announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'accessibility-screen-reader')
    })

    test('shows required indicator', async ({ page }) => {
      await page.goto(`${baseUrl}--required`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'accessibility-required')
    })
  })

  test.describe('Performance', () => {
    test('handles large text efficiently', async ({ page }) => {
      await page.goto(`${baseUrl}--large-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'performance-large-text')
    })

    test('shows performance with syntax highlighting', async ({ page }) => {
      await page.goto(`${baseUrl}--syntax-highlighting`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'textarea', 'performance-syntax-highlighting')
    })
  })
})