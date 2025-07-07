import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../../test-utils/visual-test-utils'

test.describe('Header Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=organisms-layout-header'

  test.describe('Basic Layouts', () => {
    test('renders minimal header', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'basic-minimal')
    })

    test('renders with title only', async ({ page }) => {
      await page.goto(`${baseUrl}--title-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'basic-title-only')
    })

    test('renders with title and subtitle', async ({ page }) => {
      await page.goto(`${baseUrl}--title-subtitle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'basic-title-subtitle')
    })

    test('renders with brand only', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'basic-brand-only')
    })

    test('renders full featured header', async ({ page }) => {
      await page.goto(`${baseUrl}--full-featured`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'basic-full-featured')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'variant-default')
    })

    test('renders sticky variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-sticky`)
      await page.waitForLoadState('networkidle')
      
      // Scroll to show sticky behavior
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'variant-sticky-scrolled')
    })

    test('renders floating variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-floating`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'variant-floating')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'size-large')
    })
  })

  test.describe('Brand Configurations', () => {
    test('renders with text brand', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'brand-text')
    })

    test('renders with image logo', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'brand-image')
    })

    test('renders with icon logo', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'brand-icon')
    })

    test('renders with brand link', async ({ page }) => {
      await page.goto(`${baseUrl}--brand-link`)
      await page.waitForLoadState('networkidle')
      
      // Hover on brand
      await page.hover('a:has-text("Brand")')
      await takeComponentScreenshot(page, 'header', 'brand-link-hover')
    })
  })

  test.describe('Search Functionality', () => {
    test('renders with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'search-default')
    })

    test('shows search focused', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await takeComponentScreenshot(page, 'header', 'search-focused')
    })

    test('shows search with value', async ({ page }) => {
      await page.goto(`${baseUrl}--search-with-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'search-with-value')
    })

    test('renders different search sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--search-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'search-sizes')
    })
  })

  test.describe('Actions', () => {
    test('renders with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'actions-default')
    })

    test('renders action variants', async ({ page }) => {
      await page.goto(`${baseUrl}--action-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'actions-variants')
    })

    test('renders actions with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'actions-badges')
    })

    test('shows action hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Notifications")')
      await takeComponentScreenshot(page, 'header', 'actions-hover')
    })

    test('renders icon-only actions', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-only-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'actions-icon-only')
    })
  })

  test.describe('User Menu', () => {
    test('renders with user avatar', async ({ page }) => {
      await page.goto(`${baseUrl}--user-avatar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'user-avatar')
    })

    test('renders with user initials', async ({ page }) => {
      await page.goto(`${baseUrl}--user-initials`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'user-initials')
    })

    test('renders with user details', async ({ page }) => {
      await page.goto(`${baseUrl}--user-details`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'user-details')
    })

    test('shows user menu hover', async ({ page }) => {
      await page.goto(`${baseUrl}--user-details`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has(img)')
      await takeComponentScreenshot(page, 'header', 'user-hover')
    })

    test('shows user menu click', async ({ page }) => {
      await page.goto(`${baseUrl}--user-menu-open`)
      await page.waitForLoadState('networkidle')
      
      // Click user menu
      await page.click('button:has(img)')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'user-menu-open')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders with navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--with-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'layout-navigation')
    })

    test('renders with breadcrumbs', async ({ page }) => {
      await page.goto(`${baseUrl}--with-breadcrumbs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'layout-breadcrumbs')
    })

    test('renders multi-row header', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-row`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'layout-multi-row')
    })

    test('renders with tabs', async ({ page }) => {
      await page.goto(`${baseUrl}--with-tabs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'layout-tabs')
    })

    test('renders with custom content', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'layout-custom')
    })
  })

  test.describe('Interaction States', () => {
    test('shows all interactive elements', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'interaction-default')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'header', 'interaction-focus')
    })

    test('shows loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'interaction-loading')
    })

    test('shows notification updates', async ({ page }) => {
      await page.goto(`${baseUrl}--notification-update`)
      await page.waitForLoadState('networkidle')
      
      // Trigger notification update
      await page.click('.update-notifications')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'interaction-notification-update')
    })
  })

  test.describe('Mobile Behavior', () => {
    test('renders mobile header', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'mobile-default')
    })

    test('shows mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-menu`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'mobile-menu-closed')
      
      // Open menu
      await page.click('button:has(svg)')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'header', 'mobile-menu-open')
    })

    test('shows mobile search', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'mobile-search-closed')
      
      // Open search
      await page.click('button:has-text("Search")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'mobile-search-open')
    })

    test('shows mobile user menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-user`)
      await page.waitForLoadState('networkidle')
      
      // Click user avatar
      await page.click('.user-avatar')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'mobile-user-menu')
    })

    test('shows condensed mobile header', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-condensed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'mobile-condensed')
    })
  })

  test.describe('Advanced Features', () => {
    test('renders with notifications dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--notifications-dropdown`)
      await page.waitForLoadState('networkidle')
      
      // Open notifications
      await page.click('button:has-text("Notifications")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'advanced-notifications')
    })

    test('renders with mega menu', async ({ page }) => {
      await page.goto(`${baseUrl}--mega-menu`)
      await page.waitForLoadState('networkidle')
      
      // Hover to show mega menu
      await page.hover('button:has-text("Products")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'advanced-mega-menu')
    })

    test('renders with language selector', async ({ page }) => {
      await page.goto(`${baseUrl}--language-selector`)
      await page.waitForLoadState('networkidle')
      
      // Open language dropdown
      await page.click('.language-selector')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'advanced-language')
    })

    test('renders with theme toggle', async ({ page }) => {
      await page.goto(`${baseUrl}--theme-toggle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'advanced-theme-toggle')
    })

    test('renders with command palette', async ({ page }) => {
      await page.goto(`${baseUrl}--command-palette`)
      await page.waitForLoadState('networkidle')
      
      // Open command palette
      await page.keyboard.press('Control+K')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'advanced-command-palette')
    })
  })

  test.describe('Header Styles', () => {
    test('renders transparent header', async ({ page }) => {
      await page.goto(`${baseUrl}--transparent`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'style-transparent')
    })

    test('renders bordered header', async ({ page }) => {
      await page.goto(`${baseUrl}--bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'style-bordered')
    })

    test('renders shadowed header', async ({ page }) => {
      await page.goto(`${baseUrl}--shadowed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'style-shadowed')
    })

    test('renders gradient header', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'style-gradient')
    })

    test('renders blurred header', async ({ page }) => {
      await page.goto(`${baseUrl}--blurred`)
      await page.waitForLoadState('networkidle')
      
      // Scroll to show blur effect
      await page.evaluate(() => window.scrollTo(0, 100))
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'style-blurred')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'header-responsive')
    })

    test('shows tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'responsive-tablet')
    })

    test('shows desktop layout', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`${baseUrl}--desktop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'responsive-desktop')
    })

    test('handles content overflow', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow`)
      await page.waitForLoadState('networkidle')
      
      // Test at different widths
      await page.setViewportSize({ width: 1200, height: 800 })
      await takeComponentScreenshot(page, 'header', 'responsive-overflow-1200')
      
      await page.setViewportSize({ width: 900, height: 800 })
      await takeComponentScreenshot(page, 'header', 'responsive-overflow-900')
    })
  })

  test.describe('Scroll Behavior', () => {
    test('shows scroll hide behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-hide`)
      await page.waitForLoadState('networkidle')
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'header', 'scroll-hidden')
      
      // Scroll up
      await page.evaluate(() => window.scrollTo(0, 50))
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'header', 'scroll-shown')
    })

    test('shows scroll shrink behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-shrink`)
      await page.waitForLoadState('networkidle')
      
      // Initial state
      await takeComponentScreenshot(page, 'header', 'scroll-shrink-initial')
      
      // Scrolled state
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'header', 'scroll-shrink-scrolled')
    })

    test('shows scroll progress', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-progress`)
      await page.waitForLoadState('networkidle')
      
      // Scroll to 50%
      await page.evaluate(() => {
        const maxScroll = document.body.scrollHeight - window.innerHeight
        window.scrollTo(0, maxScroll * 0.5)
      })
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'header', 'scroll-progress-50')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'header-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--full-featured`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'dark-mode-contrast')
    })

    test('shows actions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-with-badges`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'dark-mode-actions')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'header', 'accessibility-focus')
    })

    test('shows skip navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--skip-navigation`)
      await page.waitForLoadState('networkidle')
      
      // Focus skip link
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'header', 'accessibility-skip-nav')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'accessibility-contrast')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'accessibility-screen-reader')
    })

    test('shows ARIA labels', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders empty header', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'edge-empty')
    })

    test('renders with long title', async ({ page }) => {
      await page.goto(`${baseUrl}--long-title`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'edge-long-title')
    })

    test('renders with many actions', async ({ page }) => {
      await page.goto(`${baseUrl}--many-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'edge-many-actions')
    })

    test('renders with no user', async ({ page }) => {
      await page.goto(`${baseUrl}--no-user`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'edge-no-user')
    })

    test('renders with all features', async ({ page }) => {
      await page.goto(`${baseUrl}--all-features`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'edge-all-features')
    })
  })

  test.describe('Integration', () => {
    test('renders with sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--with-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'integration-sidebar')
    })

    test('renders in dashboard layout', async ({ page }) => {
      await page.goto(`${baseUrl}--dashboard-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'integration-dashboard')
    })

    test('renders with page content', async ({ page }) => {
      await page.goto(`${baseUrl}--with-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'integration-content')
    })

    test('renders with footer', async ({ page }) => {
      await page.goto(`${baseUrl}--with-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'header', 'integration-footer')
    })
  })
})