import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Drawer Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-feedback-drawer'

  test.describe('Drawer Positions', () => {
    test('renders left drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'position-left')
    })

    test('renders right drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'position-right')
    })

    test('renders top drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'position-top')
    })

    test('renders bottom drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'position-bottom')
    })

    test('compares all positions', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'position-all')
    })
  })

  test.describe('Drawer Sizes', () => {
    test('renders small drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-small')
    })

    test('renders medium drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-medium')
    })

    test('renders large drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-large')
    })

    test('renders extra large drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-xl')
    })

    test('renders full size drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--size-full`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-full')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'size-comparison')
    })
  })

  test.describe('Drawer Content', () => {
    test('renders basic drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'content-basic')
    })

    test('renders drawer with title', async ({ page }) => {
      await page.goto(`${baseUrl}--with-title`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'content-title')
    })

    test('renders drawer with description', async ({ page }) => {
      await page.goto(`${baseUrl}--with-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'content-description')
    })

    test('renders drawer with header and footer', async ({ page }) => {
      await page.goto(`${baseUrl}--with-header-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'content-header-footer')
    })

    test('renders drawer with scrollable content', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'content-scrollable')
    })
  })

  test.describe('Drawer States', () => {
    test('shows opening animation', async ({ page }) => {
      await page.goto(`${baseUrl}--opening-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'drawer', 'state-opening')
    })

    test('shows closing animation', async ({ page }) => {
      await page.goto(`${baseUrl}--closing-animation`)
      await page.waitForLoadState('networkidle')
      
      // Open first
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(300)
      
      // Close
      await page.keyboard.press('Escape')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'drawer', 'state-closing')
    })

    test('shows fully open state', async ({ page }) => {
      await page.goto(`${baseUrl}--open`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'state-open')
    })

    test('shows closed state', async ({ page }) => {
      await page.goto(`${baseUrl}--closed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'state-closed')
    })

    test('shows loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'state-loading')
    })
  })

  test.describe('Interactive Behavior', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button[aria-label="Close drawer"]')
      await takeComponentScreenshot(page, 'drawer', 'interactive-hover')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'drawer', 'interactive-focus')
    })

    test('shows overlay interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--overlay-interaction`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.drawer-overlay')
      await takeComponentScreenshot(page, 'drawer', 'interactive-overlay')
    })

    test('shows scroll behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-behavior`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => {
        const content = document.querySelector('.drawer-content')
        if (content) content.scrollTop = 200
      })
      await takeComponentScreenshot(page, 'drawer', 'interactive-scroll')
    })
  })

  test.describe('Drawer Components', () => {
    test('renders drawer header', async ({ page }) => {
      await page.goto(`${baseUrl}--drawer-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'component-header')
    })

    test('renders drawer body', async ({ page }) => {
      await page.goto(`${baseUrl}--drawer-body`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'component-body')
    })

    test('renders drawer footer', async ({ page }) => {
      await page.goto(`${baseUrl}--drawer-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'component-footer')
    })

    test('renders complex drawer layout', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'component-complex')
    })
  })

  test.describe('Use Cases', () => {
    test('renders navigation drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-navigation')
    })

    test('renders settings drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--settings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-settings')
    })

    test('renders filter drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--filter`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-filter')
    })

    test('renders form drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-form')
    })

    test('renders details drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--details`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-details')
    })

    test('renders cart drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--cart`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-cart')
    })

    test('renders notification drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'use-case-notifications')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders with custom overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'style-custom-overlay')
    })

    test('renders with rounded corners', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'style-rounded')
    })

    test('renders with no shadow', async ({ page }) => {
      await page.goto(`${baseUrl}--no-shadow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'style-no-shadow')
    })

    test('renders with colored background', async ({ page }) => {
      await page.goto(`${baseUrl}--colored-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'style-colored')
    })

    test('renders with custom border', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-border`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'style-border')
    })
  })

  test.describe('Overlay Variations', () => {
    test('renders with light overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--light-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'overlay-light')
    })

    test('renders with dark overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--dark-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'overlay-dark')
    })

    test('renders with blurred overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--blurred-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'overlay-blurred')
    })

    test('renders without overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--no-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'overlay-none')
    })

    test('renders with gradient overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'overlay-gradient')
    })
  })

  test.describe('Animation Variants', () => {
    test('shows slide animation', async ({ page }) => {
      await page.goto(`${baseUrl}--slide-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'drawer', 'animation-slide')
    })

    test('shows fade animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fade-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'drawer', 'animation-fade')
    })

    test('shows scale animation', async ({ page }) => {
      await page.goto(`${baseUrl}--scale-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'drawer', 'animation-scale')
    })

    test('shows bounce animation', async ({ page }) => {
      await page.goto(`${baseUrl}--bounce-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Open")')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'drawer', 'animation-bounce')
    })
  })

  test.describe('Nested Drawers', () => {
    test('renders drawer within drawer', async ({ page }) => {
      await page.goto(`${baseUrl}--nested`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'nested-basic')
    })

    test('shows multiple drawer levels', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-levels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'nested-multiple')
    })

    test('shows drawer z-index stacking', async ({ page }) => {
      await page.goto(`${baseUrl}--z-index-stacking`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'nested-stacking')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'drawer-responsive')
    })

    test('shows mobile drawer behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'responsive-mobile')
    })

    test('shows tablet drawer behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'responsive-tablet')
    })

    test('shows full-width on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-full`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'responsive-mobile-full')
    })

    test('shows adaptive positioning', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-position`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'drawer-color-modes')
    })

    test('shows all positions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'dark-mode-positions')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-layout`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'dark-mode-contrast')
    })

    test('shows overlay in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--dark-overlay`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'dark-mode-overlay')
    })

    test('shows form content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--form`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'dark-mode-form')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-contrast')
    })

    test('shows focus trap behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-trap`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-focus-trap')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with no content', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-empty')
    })

    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-long-content')
    })

    test('renders with dynamic content', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-dynamic')
    })

    test('renders with images and media', async ({ page }) => {
      await page.goto(`${baseUrl}--media-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-media')
    })

    test('renders with custom close behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-close`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-custom-close')
    })

    test('renders with disabled interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-interactions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'drawer', 'edge-disabled')
    })
  })
})