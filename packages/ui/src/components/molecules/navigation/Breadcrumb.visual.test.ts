import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Breadcrumb Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-breadcrumb'

  test.describe('Basic Breadcrumbs', () => {
    test('renders simple breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'simple-default')
    })

    test('renders two-level breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--two-level`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'two-level')
    })

    test('renders multi-level breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-level`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'multi-level')
    })

    test('renders with custom separator', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-separator`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'custom-separator')
    })

    test('renders with chevron separator', async ({ page }) => {
      await page.goto(`${baseUrl}--chevron-separator`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'chevron-separator')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a:first-child')
      await takeComponentScreenshot(page, 'breadcrumb', 'hover-state')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'breadcrumb', 'focus-state')
    })

    test('shows active page item', async ({ page }) => {
      await page.goto(`${baseUrl}--active-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'active-item')
    })

    test('shows clickable items', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:first-child')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'breadcrumb', 'clickable-interaction')
    })
  })

  test.describe('With Icons', () => {
    test('renders with home icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-home-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'with-home-icon')
    })

    test('renders with mixed icons', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'mixed-icons')
    })

    test('renders with all icons', async ({ page }) => {
      await page.goto(`${baseUrl}--all-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'all-icons')
    })

    test('renders with large icons', async ({ page }) => {
      await page.goto(`${baseUrl}--large-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'large-icons')
    })

    test('renders with custom icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'custom-icons')
    })
  })

  test.describe('Truncated Breadcrumbs', () => {
    test('renders with max items', async ({ page }) => {
      await page.goto(`${baseUrl}--max-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'max-items')
    })

    test('renders with ellipsis', async ({ page }) => {
      await page.goto(`${baseUrl}--with-ellipsis`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'with-ellipsis')
    })

    test('renders collapsed long path', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsed-long`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsed-long')
    })

    test('renders truncated beginning', async ({ page }) => {
      await page.goto(`${baseUrl}--truncated-beginning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'truncated-beginning')
    })

    test('renders truncated middle', async ({ page }) => {
      await page.goto(`${baseUrl}--truncated-middle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'truncated-middle')
    })
  })

  test.describe('Collapsible Breadcrumbs', () => {
    test('renders collapsible breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsible-default')
    })

    test('shows expanded state', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("more")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsible-expanded')
    })

    test('renders collapsible with few items', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-few`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsible-few-items')
    })

    test('renders collapsible with many items', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible-many`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsible-many-items')
    })

    test('shows collapsible hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("more")')
      await takeComponentScreenshot(page, 'breadcrumb', 'collapsible-hover')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders with custom item styles', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-item-styles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'custom-item-styles')
    })

    test('renders with custom active styles', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-active-styles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'custom-active-styles')
    })

    test('renders with custom separators', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-separators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'custom-separators')
    })

    test('renders with larger text', async ({ page }) => {
      await page.goto(`${baseUrl}--large-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'large-text')
    })

    test('renders with compact style', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'compact-style')
    })
  })

  test.describe('Different Contexts', () => {
    test('renders in page header', async ({ page }) => {
      await page.goto(`${baseUrl}--in-page-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'in-page-header')
    })

    test('renders in sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'in-sidebar')
    })

    test('renders in card', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'in-card')
    })

    test('renders in modal', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'in-modal')
    })

    test('renders in navigation bar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'in-navbar')
    })
  })

  test.describe('Special Cases', () => {
    test('renders single item', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'single-item')
    })

    test('renders with very long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'long-labels')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'special-characters')
    })

    test('renders with numbers and symbols', async ({ page }) => {
      await page.goto(`${baseUrl}--numbers-symbols`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'numbers-symbols')
    })

    test('renders with mixed link types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-link-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'mixed-link-types')
    })
  })

  test.describe('Loading States', () => {
    test('renders loading breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'loading-state')
    })

    test('renders skeleton breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--skeleton`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'skeleton-state')
    })

    test('renders partial loading', async ({ page }) => {
      await page.goto(`${baseUrl}--partial-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'partial-loading')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'breadcrumb-responsive')
    })

    test('shows mobile breadcrumb', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'responsive-mobile')
    })

    test('shows tablet breadcrumb', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'responsive-tablet')
    })

    test('shows mobile truncation', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-truncation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'responsive-mobile-truncation')
    })

    test('shows adaptive layout', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'breadcrumb-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'dark-mode-contrast')
    })

    test('shows separators in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-separators`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'dark-mode-separators')
    })

    test('shows collapsible in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--collapsible`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'dark-mode-collapsible')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'breadcrumb', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'breadcrumb', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'accessibility-aria')
    })
  })

  test.describe('Navigation Patterns', () => {
    test('renders file system navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--file-system`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'pattern-file-system')
    })

    test('renders ecommerce navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--ecommerce`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'pattern-ecommerce')
    })

    test('renders documentation navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--documentation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'pattern-documentation')
    })

    test('renders admin panel navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--admin-panel`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'pattern-admin-panel')
    })

    test('renders multi-tenant navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-tenant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'pattern-multi-tenant')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders empty breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'edge-empty')
    })

    test('renders with null items', async ({ page }) => {
      await page.goto(`${baseUrl}--null-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'edge-null-items')
    })

    test('renders with undefined href', async ({ page }) => {
      await page.goto(`${baseUrl}--undefined-href`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'edge-undefined-href')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'edge-custom-class')
    })

    test('renders with zero max items', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-max-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'breadcrumb', 'edge-zero-max-items')
    })
  })
})