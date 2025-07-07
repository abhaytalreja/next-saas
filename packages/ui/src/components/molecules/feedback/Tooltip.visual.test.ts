import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Tooltip Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-feedback-tooltip'

  test.describe('Positions', () => {
    test('renders all positions', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.waitForLoadState('networkidle')
      
      // Hover to show all tooltips
      await page.hover('.tooltip-trigger:first-child')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'all-positions')
    })

    test('renders top position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'position-top')
    })

    test('renders bottom position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'position-bottom')
    })

    test('renders left position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-left`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'position-left')
    })

    test('renders right position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-right`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'position-right')
    })
  })

  test.describe('Content Types', () => {
    test('renders with text content', async ({ page }) => {
      await page.goto(`${baseUrl}--text-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-text')
    })

    test('renders with rich content', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-rich')
    })

    test('renders with long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-long')
    })

    test('renders with multiline content', async ({ page }) => {
      await page.goto(`${baseUrl}--multiline-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-multiline')
    })

    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-icons')
    })

    test('renders with formatted content', async ({ page }) => {
      await page.goto(`${baseUrl}--formatted-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'content-formatted')
    })
  })

  test.describe('Trigger Elements', () => {
    test('renders on button trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--button-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'trigger-button')
    })

    test('renders on icon trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.icon-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'trigger-icon')
    })

    test('renders on text trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--text-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.text-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'trigger-text')
    })

    test('renders on image trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--image-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('img')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'trigger-image')
    })

    test('renders on input trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--input-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('input')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'trigger-input')
    })
  })

  test.describe('States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--hover-state`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'state-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-state`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'state-focus')
    })

    test('shows disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'state-disabled')
    })

    test('shows delayed appearance', async ({ page }) => {
      await page.goto(`${baseUrl}--delayed`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(100) // Before delay completes
      await takeComponentScreenshot(page, 'tooltip', 'state-delayed-pending')
      
      await page.waitForTimeout(300) // After delay completes
      await takeComponentScreenshot(page, 'tooltip', 'state-delayed-shown')
    })

    test('shows instant appearance', async ({ page }) => {
      await page.goto(`${baseUrl}--instant`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(50)
      await takeComponentScreenshot(page, 'tooltip', 'state-instant')
    })
  })

  test.describe('Animations', () => {
    test('shows fade in animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fade-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'tooltip', 'animation-fade-in')
    })

    test('shows scale animation', async ({ page }) => {
      await page.goto(`${baseUrl}--scale-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'tooltip', 'animation-scale')
    })

    test('shows slide animation', async ({ page }) => {
      await page.goto(`${baseUrl}--slide-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'tooltip', 'animation-slide')
    })

    test('shows exit animation', async ({ page }) => {
      await page.goto(`${baseUrl}--exit-animation`)
      await page.waitForLoadState('networkidle')
      
      // Show tooltip
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      
      // Start exit animation
      await page.hover('body')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'tooltip', 'animation-exit')
    })
  })

  test.describe('Positioning Edge Cases', () => {
    test('shows viewport edge adjustment - top', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-top`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-top-adjustment')
    })

    test('shows viewport edge adjustment - bottom', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-bottom`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-bottom-adjustment')
    })

    test('shows viewport edge adjustment - left', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-left`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-left-adjustment')
    })

    test('shows viewport edge adjustment - right', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-right`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-right-adjustment')
    })

    test('shows auto-positioning', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-position`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-auto-position')
    })
  })

  test.describe('Multiple Tooltips', () => {
    test('renders multiple tooltips', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple`)
      await page.waitForLoadState('networkidle')
      
      // Show all tooltips by hovering quickly
      await page.hover('.tooltip-trigger:nth-child(1)')
      await page.waitForTimeout(150)
      await page.hover('.tooltip-trigger:nth-child(2)')
      await page.waitForTimeout(150)
      await page.hover('.tooltip-trigger:nth-child(3)')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'multiple-tooltips')
    })

    test('shows tooltip collision handling', async ({ page }) => {
      await page.goto(`${baseUrl}--collision`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger:first-child')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'multiple-collision')
    })

    test('shows tooltip z-index ordering', async ({ page }) => {
      await page.goto(`${baseUrl}--z-index`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'multiple-z-index')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders in scrollable container', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'layout-scrollable')
    })

    test('renders in modal context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'layout-modal')
    })

    test('renders in dropdown context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-dropdown`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'layout-dropdown')
    })

    test('renders in table context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-table`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'layout-table')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'layout-form')
    })
  })

  test.describe('Interactive Behaviors', () => {
    test('shows click to show tooltip', async ({ page }) => {
      await page.goto(`${baseUrl}--click-to-show`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'behavior-click-show')
    })

    test('shows persistent tooltip', async ({ page }) => {
      await page.goto(`${baseUrl}--persistent`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      // Move mouse away but tooltip should remain
      await page.hover('body')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tooltip', 'behavior-persistent')
    })

    test('shows tooltip with close button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-close`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'behavior-closeable')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'tooltip-responsive')
    })

    test('shows mobile tooltip behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'responsive-mobile')
    })

    test('shows tablet tooltip positioning', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'responsive-tablet')
    })

    test('shows tooltip text scaling', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--text-scaling`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'responsive-text-scaling')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'tooltip-color-modes')
    })

    test('shows all positions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger:first-child')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'dark-mode-positions')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'dark-mode-contrast')
    })

    test('shows arrows in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-arrows`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'dark-mode-arrows')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'accessibility-focus')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'accessibility-screen-reader')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Space')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'accessibility-keyboard')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'accessibility-contrast')
    })

    test('shows reduced motion variant', async ({ page }) => {
      await page.goto(`${baseUrl}--reduced-motion`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'accessibility-reduced-motion')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with empty content', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-empty-content')
    })

    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--very-long-content`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-long-content')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'tooltip', 'edge-special-chars')
    })

    test('renders with zero delay', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-delay`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(50)
      await takeComponentScreenshot(page, 'tooltip', 'edge-zero-delay')
    })

    test('renders with very long delay', async ({ page }) => {
      await page.goto(`${baseUrl}--long-delay`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.tooltip-trigger')
      await page.waitForTimeout(1000)
      await takeComponentScreenshot(page, 'tooltip', 'edge-long-delay')
    })
  })
})