import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('Skeleton Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-skeletons-skeleton'

  test.describe('Skeleton Variants', () => {
    test('renders text skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'variant-text')
    })

    test('renders circular skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-circular`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'variant-circular')
    })

    test('renders rectangular skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-rectangular`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'variant-rectangular')
    })

    test('renders rounded skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-rounded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'variant-rounded')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'variant-comparison')
    })
  })

  test.describe('Skeleton Animations', () => {
    test('shows pulse animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-pulse`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'animation-pulse')
    })

    test('shows wave animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-wave`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'animation-wave')
    })

    test('shows no animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animation-none`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'animation-none')
    })

    test('compares all animations', async ({ page }) => {
      await page.goto(`${baseUrl}--all-animations`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'animation-comparison')
    })
  })

  test.describe('Skeleton Sizes', () => {
    test('renders small skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'size-small')
    })

    test('renders medium skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'size-medium')
    })

    test('renders large skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'size-large')
    })

    test('renders custom sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--size-custom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'size-custom')
    })

    test('compares different aspect ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--aspect-ratios`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'size-aspect-ratios')
    })
  })

  test.describe('Skeleton Text', () => {
    test('renders single line text', async ({ page }) => {
      await page.goto(`${baseUrl}--text-single-line`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-single-line')
    })

    test('renders multiple lines text', async ({ page }) => {
      await page.goto(`${baseUrl}--text-multiple-lines`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-multiple-lines')
    })

    test('renders with small spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--text-spacing-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-spacing-small')
    })

    test('renders with medium spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--text-spacing-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-spacing-medium')
    })

    test('renders with large spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--text-spacing-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-spacing-large')
    })

    test('compares different line counts', async ({ page }) => {
      await page.goto(`${baseUrl}--text-line-counts`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'text-line-counts')
    })
  })

  test.describe('Component Skeletons', () => {
    test('renders card skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-card')
    })

    test('renders list item skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-list-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-list-item')
    })

    test('renders avatar skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-avatar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-avatar')
    })

    test('renders button skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-button`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-button')
    })

    test('renders table skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-table')
    })

    test('renders form skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--component-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'component-form')
    })
  })

  test.describe('Layout Skeletons', () => {
    test('renders header skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-header')
    })

    test('renders sidebar skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-sidebar')
    })

    test('renders dashboard skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-dashboard')
    })

    test('renders article skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-article`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-article')
    })

    test('renders grid skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-grid')
    })

    test('renders page skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'layout-page')
    })
  })

  test.describe('Content Patterns', () => {
    test('renders user profile skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-user-profile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-user-profile')
    })

    test('renders news feed skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-news-feed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-news-feed')
    })

    test('renders product listing skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-product-listing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-product-listing')
    })

    test('renders chat interface skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-chat`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-chat')
    })

    test('renders analytics dashboard skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-analytics`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-analytics')
    })

    test('renders calendar skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-calendar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'pattern-calendar')
    })
  })

  test.describe('Progressive Loading', () => {
    test('shows loading progression step 1', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-step-1`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'progressive-step-1')
    })

    test('shows loading progression step 2', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-step-2`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'progressive-step-2')
    })

    test('shows loading progression step 3', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-step-3`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'progressive-step-3')
    })

    test('shows complete loading progression', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'progressive-complete')
    })

    test('shows staggered loading', async ({ page }) => {
      await page.goto(`${baseUrl}--staggered-loading`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'progressive-staggered')
    })
  })

  test.describe('Skeleton Groups', () => {
    test('renders skeleton list', async ({ page }) => {
      await page.goto(`${baseUrl}--group-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'group-list')
    })

    test('renders skeleton grid', async ({ page }) => {
      await page.goto(`${baseUrl}--group-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'group-grid')
    })

    test('renders skeleton cards', async ({ page }) => {
      await page.goto(`${baseUrl}--group-cards`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'group-cards')
    })

    test('renders skeleton rows', async ({ page }) => {
      await page.goto(`${baseUrl}--group-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'group-rows')
    })

    test('renders mixed skeleton group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'group-mixed')
    })
  })

  test.describe('Interactive States', () => {
    test('shows skeleton to content transition', async ({ page }) => {
      await page.goto(`${baseUrl}--transition-to-content`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Load Content")')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'skeleton', 'interactive-transition')
    })

    test('shows loading state toggle', async ({ page }) => {
      await page.goto(`${baseUrl}--toggle-loading`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Toggle")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'skeleton', 'interactive-toggle')
    })

    test('shows partial loading states', async ({ page }) => {
      await page.goto(`${baseUrl}--partial-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'interactive-partial')
    })

    test('shows refresh loading states', async ({ page }) => {
      await page.goto(`${baseUrl}--refresh-loading`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Refresh")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'skeleton', 'interactive-refresh')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders with custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'style-custom-colors')
    })

    test('renders with gradient backgrounds', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient-backgrounds`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'style-gradients')
    })

    test('renders with custom animations', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-animations`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'style-custom-animations')
    })

    test('renders with borders and shadows', async ({ page }) => {
      await page.goto(`${baseUrl}--borders-shadows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'style-borders-shadows')
    })

    test('renders with themed variations', async ({ page }) => {
      await page.goto(`${baseUrl}--themed-variations`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'style-themed')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'skeleton-responsive')
    })

    test('shows mobile skeleton layouts', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'responsive-mobile')
    })

    test('shows tablet skeleton layouts', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'responsive-tablet')
    })

    test('shows adaptive skeleton sizing', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-sizing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'responsive-adaptive')
    })

    test('shows responsive grid skeletons', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'responsive-grid')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'skeleton-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-dashboard`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'dark-mode-contrast')
    })

    test('shows animations in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-animations`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'skeleton', 'dark-mode-animations')
    })

    test('shows content patterns in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern-user-profile`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'dark-mode-patterns')
    })
  })

  test.describe('Accessibility', () => {
    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'accessibility-contrast')
    })

    test('shows reduced motion variant', async ({ page }) => {
      await page.goto(`${baseUrl}--reduced-motion`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'accessibility-reduced-motion')
    })

    test('shows aria live regions', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-live`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'accessibility-aria-live')
    })

    test('shows loading announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-announcements`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'accessibility-announcements')
    })
  })

  test.describe('Performance Patterns', () => {
    test('shows lazy loading skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--lazy-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'performance-lazy')
    })

    test('shows infinite scroll skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--infinite-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'performance-infinite-scroll')
    })

    test('shows optimistic loading', async ({ page }) => {
      await page.goto(`${baseUrl}--optimistic-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'performance-optimistic')
    })

    test('shows batch loading skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--batch-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'performance-batch')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders zero-width skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-zero-width')
    })

    test('renders zero-height skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-zero-height')
    })

    test('renders very large skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--very-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-very-large')
    })

    test('renders very small skeleton', async ({ page }) => {
      await page.goto(`${baseUrl}--very-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-very-small')
    })

    test('renders with overflow content', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-overflow')
    })

    test('renders nested skeletons', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-skeletons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'skeleton', 'edge-nested')
    })
  })
})