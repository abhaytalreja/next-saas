import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../../test-utils/visual-test-utils'

test.describe('Sidebar Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-sidebar'

  test.describe('States', () => {
    test('renders expanded state', async ({ page }) => {
      await page.goto(`${baseUrl}--expanded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'state-expanded')
    })

    test('renders collapsed state', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'state-collapsed')
    })

    test('shows toggle animation', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      // Capture expanded
      await takeComponentScreenshot(page, 'sidebar', 'animation-expanded')
      
      // Toggle to collapsed
      await page.click('[aria-label*="Collapse sidebar"]')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'sidebar', 'animation-transitioning')
      
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'sidebar', 'animation-collapsed')
    })

    test('renders with active items', async ({ page }) => {
      await page.goto(`${baseUrl}--with-active`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'state-active-items')
    })

    test('renders with disabled items', async ({ page }) => {
      await page.goto(`${baseUrl}--with-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'state-disabled-items')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'variant-default')
    })

    test('renders floating variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-floating`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'variant-floating')
    })

    test('renders inset variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-inset`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'variant-inset')
    })
  })

  test.describe('Sides', () => {
    test('renders left sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--side-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'side-left')
    })

    test('renders right sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--side-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'side-right')
    })

    test('renders dual sidebars', async ({ page }) => {
      await page.goto(`${baseUrl}--dual-sidebars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'dual-sidebars')
    })
  })

  test.describe('Structure', () => {
    test('renders with all sections', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'structure-all-sections')
    })

    test('renders header section', async ({ page }) => {
      await page.goto(`${baseUrl}--with-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'structure-header')
    })

    test('renders footer section', async ({ page }) => {
      await page.goto(`${baseUrl}--with-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'structure-footer')
    })

    test('renders with logo', async ({ page }) => {
      await page.goto(`${baseUrl}--with-logo`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'structure-logo')
    })

    test('renders with user profile', async ({ page }) => {
      await page.goto(`${baseUrl}--with-profile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'structure-profile')
    })
  })

  test.describe('Groups', () => {
    test('renders grouped items', async ({ page }) => {
      await page.goto(`${baseUrl}--with-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'groups-basic')
    })

    test('renders collapsible groups', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'groups-collapsible')
    })

    test('shows group expand/collapse', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-groups`)
      await page.waitForLoadState('networkidle')
      
      // Click to collapse a group
      await page.click('.sidebar-group-label')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'sidebar', 'groups-collapsed')
    })

    test('renders nested groups', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'groups-nested')
    })

    test('renders groups without labels', async ({ page }) => {
      await page.goto(`${baseUrl}--groups-no-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'groups-no-labels')
    })
  })

  test.describe('Items', () => {
    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'items-with-icons')
    })

    test('renders without icons', async ({ page }) => {
      await page.goto(`${baseUrl}--no-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'items-no-icons')
    })

    test('renders with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'items-with-badges')
    })

    test('renders with notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--with-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'items-with-notifications')
    })

    test('renders with tooltips on collapsed', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsed-tooltips`)
      await page.waitForLoadState('networkidle')
      
      // Hover over an item
      await page.hover('.sidebar-item:first-child')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'sidebar', 'items-collapsed-tooltip')
    })
  })

  test.describe('Content Types', () => {
    test('renders navigation menu', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation-menu`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'content-navigation')
    })

    test('renders with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'content-search')
    })

    test('renders with custom content', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'content-custom')
    })

    test('renders with widgets', async ({ page }) => {
      await page.goto(`${baseUrl}--with-widgets`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'content-widgets')
    })

    test('renders with quick actions', async ({ page }) => {
      await page.goto(`${baseUrl}--quick-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'content-quick-actions')
    })
  })

  test.describe('Scrolling', () => {
    test('renders with scrollable content', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'scrolling-default')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'scrolling-indicators')
    })

    test('shows scrolled state', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      // Scroll down
      const content = page.locator('.sidebar-content')
      await content.evaluate(el => el.scrollTop = 200)
      await takeComponentScreenshot(page, 'sidebar', 'scrolling-scrolled')
    })

    test('maintains header/footer on scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky-sections`)
      await page.waitForLoadState('networkidle')
      
      const content = page.locator('.sidebar-content')
      await content.evaluate(el => el.scrollTop = 300)
      await takeComponentScreenshot(page, 'sidebar', 'scrolling-sticky')
    })
  })

  test.describe('Interaction States', () => {
    test('shows item hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.sidebar-item:nth-child(2)')
      await takeComponentScreenshot(page, 'sidebar', 'interaction-item-hover')
    })

    test('shows item focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'sidebar', 'interaction-item-focus')
    })

    test('shows toggle button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('[aria-label*="sidebar"]')
      await takeComponentScreenshot(page, 'sidebar', 'interaction-toggle-hover')
    })

    test('shows group hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-groups`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.sidebar-group-label')
      await takeComponentScreenshot(page, 'sidebar', 'interaction-group-hover')
    })
  })

  test.describe('Advanced Features', () => {
    test('renders with submenus', async ({ page }) => {
      await page.goto(`${baseUrl}--with-submenus`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'advanced-submenus')
    })

    test('shows submenu expansion', async ({ page }) => {
      await page.goto(`${baseUrl}--with-submenus`)
      await page.waitForLoadState('networkidle')
      
      // Click to expand submenu
      await page.click('.has-submenu')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'sidebar', 'advanced-submenu-expanded')
    })

    test('renders multi-level navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-level`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'advanced-multi-level')
    })

    test('renders with drag handles', async ({ page }) => {
      await page.goto(`${baseUrl}--draggable-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'advanced-draggable')
    })

    test('renders with context menus', async ({ page }) => {
      await page.goto(`${baseUrl}--context-menus`)
      await page.waitForLoadState('networkidle')
      
      // Right-click on item
      await page.click('.sidebar-item:first-child', { button: 'right' })
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'sidebar', 'advanced-context-menu')
    })
  })

  test.describe('Layouts', () => {
    test('renders in dashboard layout', async ({ page }) => {
      await page.goto(`${baseUrl}--dashboard-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'layout-dashboard')
    })

    test('renders with top navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--with-top-nav`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'layout-with-top-nav')
    })

    test('renders in split view', async ({ page }) => {
      await page.goto(`${baseUrl}--split-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'layout-split-view')
    })

    test('renders with content overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--overlay-mode`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'layout-overlay')
    })
  })

  test.describe('Mobile Behavior', () => {
    test('renders mobile sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'mobile-default')
    })

    test('shows mobile overlay', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'mobile-overlay')
    })

    test('shows mobile slide-in', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-slide`)
      await page.waitForLoadState('networkidle')
      
      // Open sidebar
      await page.click('.mobile-menu-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'sidebar', 'mobile-slide-in')
    })

    test('shows mobile bottom sheet', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-bottom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'mobile-bottom-sheet')
    })

    test('shows swipe gesture hints', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-swipe`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'mobile-swipe-hint')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'sidebar-responsive')
    })

    test('shows tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'tablet-layout')
    })

    test('auto-collapses on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 900, height: 600 })
      await page.goto(`${baseUrl}--auto-collapse`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'responsive-auto-collapse')
    })

    test('shows responsive breakpoints', async ({ page }) => {
      await page.goto(`${baseUrl}--breakpoints`)
      await page.waitForLoadState('networkidle')
      
      // Large screen
      await page.setViewportSize({ width: 1400, height: 800 })
      await takeComponentScreenshot(page, 'sidebar', 'responsive-large')
      
      // Medium screen
      await page.setViewportSize({ width: 1024, height: 768 })
      await takeComponentScreenshot(page, 'sidebar', 'responsive-medium')
      
      // Small screen
      await page.setViewportSize({ width: 768, height: 600 })
      await takeComponentScreenshot(page, 'sidebar', 'responsive-small')
    })
  })

  test.describe('Themes', () => {
    test('renders with custom theme', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-theme`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'theme-custom')
    })

    test('renders with brand colors', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'theme-brand')
    })

    test('renders with gradient background', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient-bg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'theme-gradient')
    })

    test('renders with pattern background', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-bg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'theme-pattern')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'sidebar-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'dark-mode-contrast')
    })

    test('shows collapsed state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsed`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'dark-mode-collapsed')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'sidebar', 'accessibility-focus')
    })

    test('maintains contrast for disabled items', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'accessibility-disabled')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-keyboard`)
      await page.waitForLoadState('networkidle')
      
      // Navigate through items
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'sidebar', 'accessibility-keyboard-nav')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'accessibility-screen-reader')
    })

    test('shows ARIA landmarks', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-landmarks`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'accessibility-landmarks')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders empty sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'edge-empty')
    })

    test('renders with single item', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'edge-single-item')
    })

    test('renders with many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'edge-many-items')
    })

    test('renders with long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'edge-long-labels')
    })

    test('renders without collapsible option', async ({ page }) => {
      await page.goto(`${baseUrl}--non-collapsible`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'edge-non-collapsible')
    })
  })

  test.describe('Performance', () => {
    test('renders with virtual scrolling', async ({ page }) => {
      await page.goto(`${baseUrl}--virtual-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'sidebar', 'performance-virtual-scroll')
    })

    test('handles dynamic content updates', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-updates`)
      await page.waitForLoadState('networkidle')
      
      // Trigger update
      await page.click('.update-content')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'sidebar', 'performance-dynamic-update')
    })
  })
})