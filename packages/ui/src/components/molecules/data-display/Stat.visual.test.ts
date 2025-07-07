import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Stat Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-data-display-stat'

  test.describe('Basic Stats', () => {
    test('renders basic stat', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'basic-default')
    })

    test('renders stat with label and number', async ({ page }) => {
      await page.goto(`${baseUrl}--label-number`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'basic-label-number')
    })

    test('renders stat with help text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-help-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'basic-help-text')
    })

    test('renders complete stat', async ({ page }) => {
      await page.goto(`${baseUrl}--complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'basic-complete')
    })
  })

  test.describe('Stat Sizes', () => {
    test('renders small stat', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'size-small')
    })

    test('renders medium stat', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'size-medium')
    })

    test('renders large stat', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'size-large')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'size-comparison')
    })
  })

  test.describe('Stat Arrows', () => {
    test('renders increase arrow', async ({ page }) => {
      await page.goto(`${baseUrl}--arrow-increase`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'arrow-increase')
    })

    test('renders decrease arrow', async ({ page }) => {
      await page.goto(`${baseUrl}--arrow-decrease`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'arrow-decrease')
    })

    test('renders both arrow types', async ({ page }) => {
      await page.goto(`${baseUrl}--both-arrows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'arrow-both')
    })

    test('renders arrows with percentages', async ({ page }) => {
      await page.goto(`${baseUrl}--arrows-percentages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'arrow-percentages')
    })
  })

  test.describe('Stat Cards', () => {
    test('renders basic stat card', async ({ page }) => {
      await page.goto(`${baseUrl}--card-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'card-basic')
    })

    test('renders stat card with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--card-with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'card-with-icon')
    })

    test('renders stat card with change', async ({ page }) => {
      await page.goto(`${baseUrl}--card-with-change`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'card-with-change')
    })

    test('renders stat card with help text', async ({ page }) => {
      await page.goto(`${baseUrl}--card-with-help`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'card-with-help')
    })

    test('renders complete stat card', async ({ page }) => {
      await page.goto(`${baseUrl}--card-complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'card-complete')
    })
  })

  test.describe('Mini Stats', () => {
    test('renders basic mini stat', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'mini-basic')
    })

    test('renders mini stat with up trend', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-trend-up`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'mini-trend-up')
    })

    test('renders mini stat with down trend', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-trend-down`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'mini-trend-down')
    })

    test('renders mini stat with neutral trend', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-trend-neutral`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'mini-trend-neutral')
    })

    test('compares all mini stat trends', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-all-trends`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'mini-all-trends')
    })
  })

  test.describe('Stat Groups', () => {
    test('renders single column group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-single-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'group-single-column')
    })

    test('renders two column group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-two-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'group-two-columns')
    })

    test('renders three column group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-three-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'group-three-columns')
    })

    test('renders four column group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-four-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'group-four-columns')
    })

    test('renders mixed stat types group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'group-mixed')
    })
  })

  test.describe('Financial Stats', () => {
    test('renders revenue stats', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-revenue`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'financial-revenue')
    })

    test('renders profit stats', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-profit`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'financial-profit')
    })

    test('renders expense stats', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-expenses`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'financial-expenses')
    })

    test('renders growth stats', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-growth`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'financial-growth')
    })

    test('renders complete financial dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'financial-dashboard')
    })
  })

  test.describe('Analytics Stats', () => {
    test('renders website traffic stats', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-traffic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'analytics-traffic')
    })

    test('renders user engagement stats', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-engagement`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'analytics-engagement')
    })

    test('renders conversion stats', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-conversion`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'analytics-conversion')
    })

    test('renders performance stats', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-performance`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'analytics-performance')
    })

    test('renders social media stats', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-social`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'analytics-social')
    })
  })

  test.describe('Data Types', () => {
    test('renders currency values', async ({ page }) => {
      await page.goto(`${baseUrl}--data-currency`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'data-currency')
    })

    test('renders percentage values', async ({ page }) => {
      await page.goto(`${baseUrl}--data-percentages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'data-percentages')
    })

    test('renders large numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--data-large-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'data-large-numbers')
    })

    test('renders time durations', async ({ page }) => {
      await page.goto(`${baseUrl}--data-time`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'data-time')
    })

    test('renders ratios and rates', async ({ page }) => {
      await page.goto(`${baseUrl}--data-ratios`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'data-ratios')
    })
  })

  test.describe('Color Variations', () => {
    test('renders positive stats', async ({ page }) => {
      await page.goto(`${baseUrl}--color-positive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'color-positive')
    })

    test('renders negative stats', async ({ page }) => {
      await page.goto(`${baseUrl}--color-negative`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'color-negative')
    })

    test('renders neutral stats', async ({ page }) => {
      await page.goto(`${baseUrl}--color-neutral`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'color-neutral')
    })

    test('renders warning stats', async ({ page }) => {
      await page.goto(`${baseUrl}--color-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'color-warning')
    })

    test('renders branded stats', async ({ page }) => {
      await page.goto(`${baseUrl}--color-branded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'color-branded')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.stat-card:first-child')
      await takeComponentScreenshot(page, 'stat', 'interactive-hover')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--focusable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'stat', 'interactive-focus')
    })

    test('shows clickable stats', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.stat-card:first-child')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'stat', 'interactive-clicked')
    })

    test('shows loading states', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'interactive-loading')
    })
  })

  test.describe('Animation States', () => {
    test('shows counting animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated-counting`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'stat', 'animation-counting')
    })

    test('shows trend animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated-trend`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'stat', 'animation-trend')
    })

    test('shows pulse animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated-pulse`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'stat', 'animation-pulse')
    })

    test('shows skeleton loading', async ({ page }) => {
      await page.goto(`${baseUrl}--skeleton`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'animation-skeleton')
    })
  })

  test.describe('Context Variations', () => {
    test('renders in dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--context-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'context-dashboard')
    })

    test('renders in card', async ({ page }) => {
      await page.goto(`${baseUrl}--context-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'context-card')
    })

    test('renders in sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--context-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'context-sidebar')
    })

    test('renders in modal', async ({ page }) => {
      await page.goto(`${baseUrl}--context-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'context-modal')
    })

    test('renders in header', async ({ page }) => {
      await page.goto(`${baseUrl}--context-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'context-header')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'stat-responsive')
    })

    test('shows mobile stats', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'responsive-mobile')
    })

    test('shows tablet stats', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'responsive-tablet')
    })

    test('shows mobile stat groups', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'responsive-mobile-groups')
    })

    test('shows adaptive layout', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'stat-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-dashboard`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'dark-mode-contrast')
    })

    test('shows arrows in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--both-arrows`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'dark-mode-arrows')
    })

    test('shows mini stats in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--mini-all-trends`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'dark-mode-mini')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'stat', 'accessibility-focus')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'accessibility-screen-reader')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'stat', 'accessibility-keyboard')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very large numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-large-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-large-numbers')
    })

    test('renders with zero values', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-zero-values`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-zero-values')
    })

    test('renders with negative values', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-negative-values`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-negative-values')
    })

    test('renders with very long labels', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-long-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-long-labels')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-special-chars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-special-chars')
    })

    test('renders error states', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stat', 'edge-error')
    })
  })
})