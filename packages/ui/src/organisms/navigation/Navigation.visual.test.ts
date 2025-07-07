import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../test-utils/visual-test-utils'

test.describe('Navigation Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=organisms-navigation-navigation'

  test.describe('Orientations', () => {
    test('renders horizontal orientation', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'orientation-horizontal')
    })

    test('renders vertical orientation', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'orientation-vertical')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'variant-default')
    })

    test('renders pills variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-pills`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'variant-pills')
    })

    test('renders underline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-underline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'variant-underline')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'size-large')
    })
  })

  test.describe('Brand', () => {
    test('renders with brand name only', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-name`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'brand-name-only')
    })

    test('renders with brand logo', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-logo`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'brand-with-logo')
    })

    test('renders with brand link', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'brand-with-link')
    })

    test('renders with custom brand component', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-custom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'brand-custom')
    })
  })

  test.describe('Items', () => {
    test('renders simple items', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'items-simple')
    })

    test('renders items with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'items-with-icons')
    })

    test('renders items with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'items-with-badges')
    })

    test('renders active items', async ({ page }) => {
      await page.goto(`${baseUrl}--active-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'items-active')
    })

    test('renders disabled items', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'items-disabled')
    })
  })

  test.describe('Nested Navigation', () => {
    test('renders nested items', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'nested-collapsed')
    })

    test('shows expanded nested items', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-items`)
      await page.waitForLoadState('networkidle')
      
      // Click to expand
      await page.click('button:has-text("Products")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'nested-expanded')
    })

    test('renders multi-level nesting', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-level`)
      await page.waitForLoadState('networkidle')
      
      // Expand all levels
      await page.click('button:has-text("Services")')
      await page.waitForTimeout(200)
      await page.click('button:has-text("Development")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'nested-multi-level')
    })

    test('shows nested with active child', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-active-child`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'nested-active-child')
    })
  })

  test.describe('Collapsible', () => {
    test('renders collapsible navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'collapsible-expanded')
    })

    test('shows collapsed state', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      
      // Click menu button
      await page.click('button:has(svg)')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'collapsible-collapsed')
    })

    test('shows menu toggle animation', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      
      // Start animation
      await page.click('button:has(svg)')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'navigation', 'collapsible-animating')
    })

    test('renders default collapsed', async ({ page }) => {
      await page.goto(`${baseUrl}--default-collapsed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'collapsible-default-collapsed')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a:has-text("About")')
      await takeComponentScreenshot(page, 'navigation', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'navigation', 'interaction-focus')
    })

    test('shows nested hover', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Products")')
      await page.waitForTimeout(200)
      await page.hover('a:has-text("Hardware")')
      await takeComponentScreenshot(page, 'navigation', 'interaction-nested-hover')
    })

    test('shows badge hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a:has-text("Messages")')
      await takeComponentScreenshot(page, 'navigation', 'interaction-badge-hover')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'layout-with-search')
    })

    test('renders with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'layout-with-actions')
    })

    test('renders with user menu', async ({ page }) => {
      await page.goto(`${baseUrl}--with-user-menu`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'layout-with-user-menu')
    })

    test('renders split navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--split-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'layout-split')
    })

    test('renders mega menu', async ({ page }) => {
      await page.goto(`${baseUrl}--mega-menu`)
      await page.waitForLoadState('networkidle')
      
      // Hover to show mega menu
      await page.hover('button:has-text("Products")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'layout-mega-menu')
    })
  })

  test.describe('Mobile Navigation', () => {
    test('renders mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'mobile-default')
    })

    test('shows mobile menu open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      
      // Open menu
      await page.click('button:has(svg)')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'navigation', 'mobile-menu-open')
    })

    test('renders mobile dropdown', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-dropdown`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'mobile-dropdown')
    })

    test('renders mobile drawer', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-drawer`)
      await page.waitForLoadState('networkidle')
      
      // Open drawer
      await page.click('button:has(svg)')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'navigation', 'mobile-drawer')
    })

    test('renders mobile bottom nav', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-bottom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'mobile-bottom-nav')
    })
  })

  test.describe('Advanced Features', () => {
    test('renders with dropdown menus', async ({ page }) => {
      await page.goto(`${baseUrl}--dropdown-menus`)
      await page.waitForLoadState('networkidle')
      
      // Open dropdown
      await page.click('button:has-text("Resources")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'advanced-dropdown')
    })

    test('renders with notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--with-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'advanced-notifications')
    })

    test('renders with language selector', async ({ page }) => {
      await page.goto(`${baseUrl}--language-selector`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'advanced-language')
    })

    test('renders with theme toggle', async ({ page }) => {
      await page.goto(`${baseUrl}--theme-toggle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'advanced-theme-toggle')
    })

    test('renders sticky navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky`)
      await page.waitForLoadState('networkidle')
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'advanced-sticky')
    })
  })

  test.describe('Navigation Styles', () => {
    test('renders transparent navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--transparent`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'style-transparent')
    })

    test('renders bordered navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'style-bordered')
    })

    test('renders shadowed navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--shadowed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'style-shadowed')
    })

    test('renders gradient navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'style-gradient')
    })

    test('renders dark navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--dark-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'style-dark')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'navigation-responsive')
    })

    test('shows tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'responsive-tablet')
    })

    test('shows desktop layout', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`${baseUrl}--desktop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'responsive-desktop')
    })

    test('handles breakpoint transitions', async ({ page }) => {
      await page.goto(`${baseUrl}--breakpoints`)
      await page.waitForLoadState('networkidle')
      
      // Just above mobile breakpoint
      await page.setViewportSize({ width: 640, height: 800 })
      await takeComponentScreenshot(page, 'navigation', 'responsive-breakpoint-640')
      
      // Just above tablet breakpoint
      await page.setViewportSize({ width: 1024, height: 800 })
      await takeComponentScreenshot(page, 'navigation', 'responsive-breakpoint-1024')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'navigation-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'dark-mode-contrast')
    })

    test('shows nested items in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-items`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Products")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'navigation', 'dark-mode-nested')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'navigation', 'accessibility-focus')
    })

    test('maintains contrast for disabled', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'accessibility-disabled')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-keyboard`)
      await page.waitForLoadState('networkidle')
      
      // Navigate through items
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'navigation', 'accessibility-keyboard-nav')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'accessibility-screen-reader')
    })

    test('shows ARIA states', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders single item', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'edge-single-item')
    })

    test('renders many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'edge-many-items')
    })

    test('renders long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'edge-long-labels')
    })

    test('renders without brand', async ({ page }) => {
      await page.goto(`${baseUrl}--no-brand`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'edge-no-brand')
    })

    test('renders empty navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'navigation', 'edge-empty')
    })

    test('renders deeply nested items', async ({ page }) => {
      await page.goto(`${baseUrl}--deep-nesting`)
      await page.waitForLoadState('networkidle')
      
      // Expand all levels
      await page.click('button:nth-child(1)')
      await page.waitForTimeout(100)
      await page.click('button:nth-child(2)')
      await page.waitForTimeout(100)
      await page.click('button:nth-child(3)')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'navigation', 'edge-deep-nesting')
    })
  })
})