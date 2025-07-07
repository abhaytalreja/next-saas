import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Tabs Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-tabs'

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'variant-default')
    })

    test('renders pills variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-pills`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'variant-pills')
    })

    test('renders underline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-underline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'variant-underline')
    })

    test('renders bordered variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'variant-bordered')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'size-large')
    })
  })

  test.describe('Orientation', () => {
    test('renders horizontal orientation', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'orientation-horizontal')
    })

    test('renders vertical orientation', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'orientation-vertical')
    })

    test('renders vertical with all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'vertical-all-variants')
    })
  })

  test.describe('States', () => {
    test('shows active state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      // Click second tab
      await page.click('[role="tab"]:nth-child(2)')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tabs', 'state-active')
    })

    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const tab = page.locator('[role="tab"]:nth-child(2)')
      await tab.hover()
      await takeComponentScreenshot(page, 'tabs', 'state-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'tabs', 'state-focus')
    })

    test('shows disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--with-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'state-disabled')
    })

    test('shows loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'state-loading')
    })
  })

  test.describe('Content', () => {
    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'with-icons')
    })

    test('renders with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'with-badges')
    })

    test('renders with closeable tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--closeable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'closeable-tabs')
    })

    test('renders with counters', async ({ page }) => {
      await page.goto(`${baseUrl}--with-counters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'with-counters')
    })

    test('renders with subtitles', async ({ page }) => {
      await page.goto(`${baseUrl}--with-subtitles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'with-subtitles')
    })
  })

  test.describe('Tab Content', () => {
    test('renders simple content', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'content-simple')
    })

    test('renders complex content', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'content-complex')
    })

    test('renders form content', async ({ page }) => {
      await page.goto(`${baseUrl}--form-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'content-form')
    })

    test('renders table content', async ({ page }) => {
      await page.goto(`${baseUrl}--table-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'content-table')
    })

    test('renders lazy loaded content', async ({ page }) => {
      await page.goto(`${baseUrl}--lazy-content`)
      await page.waitForLoadState('networkidle')
      
      // Click tab to load content
      await page.click('[role="tab"]:nth-child(2)')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'tabs', 'content-lazy-loaded')
    })
  })

  test.describe('Scrollable Tabs', () => {
    test('renders scrollable horizontal tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'scrollable-horizontal')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'scroll-indicators')
    })

    test('shows scrolled state', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-horizontal`)
      await page.waitForLoadState('networkidle')
      
      // Scroll tabs
      const tabsList = page.locator('[role="tablist"]')
      await tabsList.evaluate(el => el.scrollLeft = 200)
      await takeComponentScreenshot(page, 'tabs', 'scrolled-state')
    })

    test('renders scrollable vertical tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'scrollable-vertical')
    })
  })

  test.describe('Animations', () => {
    test('shows tab switch animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      // Click tab
      await page.click('[role="tab"]:nth-child(2)')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'tabs', 'animation-switch')
    })

    test('shows content fade animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fade-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('[role="tab"]:nth-child(2)')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'tabs', 'animation-fade')
    })

    test('shows slide animation', async ({ page }) => {
      await page.goto(`${baseUrl}--slide-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('[role="tab"]:nth-child(2)')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'tabs', 'animation-slide')
    })

    test('shows underline move animation', async ({ page }) => {
      await page.goto(`${baseUrl}--underline-animated`)
      await page.waitForLoadState('networkidle')
      
      await page.click('[role="tab"]:nth-child(3)')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'tabs', 'animation-underline')
    })
  })

  test.describe('SimpleTabs', () => {
    test('renders simple tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-tabs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'simple-tabs')
    })

    test('renders simple tabs with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'simple-tabs-icons')
    })

    test('renders simple tabs with disabled', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-with-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'simple-tabs-disabled')
    })
  })

  test.describe('Layouts', () => {
    test('renders tabs in card', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'layout-in-card')
    })

    test('renders tabs with sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--with-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'layout-with-sidebar')
    })

    test('renders full width tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--full-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'layout-full-width')
    })

    test('renders centered tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--centered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'layout-centered')
    })

    test('renders tabs with header', async ({ page }) => {
      await page.goto(`${baseUrl}--with-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'layout-with-header')
    })
  })

  test.describe('Advanced Features', () => {
    test('renders nested tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-tabs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'advanced-nested')
    })

    test('renders tabs with panels', async ({ page }) => {
      await page.goto(`${baseUrl}--with-panels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'advanced-panels')
    })

    test('renders tabs with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'advanced-actions')
    })

    test('renders draggable tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--draggable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'advanced-draggable')
    })

    test('renders tabs with dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--with-dropdown`)
      await page.waitForLoadState('networkidle')
      
      // Open dropdown
      await page.click('.tabs-dropdown-trigger')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tabs', 'advanced-dropdown')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('shows keyboard focus', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'tabs', 'keyboard-focus')
    })

    test('navigates with arrow keys', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
      await takeComponentScreenshot(page, 'tabs', 'keyboard-arrow-nav')
    })

    test('activates with enter key', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('Enter')
      await takeComponentScreenshot(page, 'tabs', 'keyboard-enter-activate')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'tabs-responsive')
    })

    test('shows mobile tabs layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'mobile-layout')
    })

    test('shows mobile dropdown tabs', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-dropdown`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'mobile-dropdown')
    })

    test('shows mobile accordion style', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-accordion`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'mobile-accordion')
    })

    test('shows stacked tabs on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-stacked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'mobile-stacked')
    })

    test('shows scrollable tabs on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-scrollable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'mobile-scrollable')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'tabs-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'dark-mode-contrast')
    })

    test('shows vertical tabs in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'dark-mode-vertical')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'tabs', 'accessibility-focus')
    })

    test('maintains contrast for disabled', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'accessibility-disabled')
    })

    test('shows screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'accessibility-screen-reader')
    })

    test('handles keyboard navigation properly', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-keyboard`)
      await page.waitForLoadState('networkidle')
      
      // Tab to tabs list
      await page.keyboard.press('Tab')
      // Navigate with arrows
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowRight')
      await takeComponentScreenshot(page, 'tabs', 'accessibility-keyboard-nav')
    })

    test('shows ARIA states', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-aria`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'accessibility-aria-states')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders single tab', async ({ page }) => {
      await page.goto(`${baseUrl}--single-tab`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'edge-single-tab')
    })

    test('renders many tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--many-tabs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'edge-many-tabs')
    })

    test('renders long tab labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'edge-long-labels')
    })

    test('renders empty content', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tabs', 'edge-empty-content')
    })

    test('handles dynamic tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-tabs`)
      await page.waitForLoadState('networkidle')
      
      // Add a tab
      await page.click('.add-tab')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tabs', 'edge-dynamic-add')
      
      // Remove a tab
      await page.click('.remove-tab')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tabs', 'edge-dynamic-remove')
    })
  })
})