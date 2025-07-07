import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('Dashboard Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=organisms-layout-dashboard'

  test.describe('Basic Dashboard States', () => {
    test('renders basic dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'basic')
    })

    test('renders empty dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'empty')
    })

    test('renders loading dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'loading')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'error')
    })

    test('renders minimal dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'minimal')
    })
  })

  test.describe('Dashboard Layouts', () => {
    test('renders default layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'layout-default')
    })

    test('renders compact layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'layout-compact')
    })

    test('renders minimal layout', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'layout-minimal')
    })

    test('compares all layouts', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'layout-comparison')
    })
  })

  test.describe('Dashboard Header', () => {
    test('renders with title only', async ({ page }) => {
      await page.goto(`${baseUrl}--title-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'title-only')
    })

    test('renders with title and subtitle', async ({ page }) => {
      await page.goto(`${baseUrl}--title-subtitle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'title-subtitle')
    })

    test('renders with quick actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'with-actions')
    })

    test('shows action button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Add New")')
      await takeComponentScreenshot(page, 'dashboard', 'action-hover')
    })

    test('renders with refresh button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-refresh`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'with-refresh')
    })

    test('shows refresh loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--refresh-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'refresh-loading')
    })
  })

  test.describe('Metric Cards', () => {
    test('renders basic metric cards', async ({ page }) => {
      await page.goto(`${baseUrl}--metric-cards`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'metric-cards')
    })

    test('renders metric cards with positive trends', async ({ page }) => {
      await page.goto(`${baseUrl}--positive-trends`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'positive-trends')
    })

    test('renders metric cards with negative trends', async ({ page }) => {
      await page.goto(`${baseUrl}--negative-trends`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'negative-trends')
    })

    test('renders metric cards with neutral trends', async ({ page }) => {
      await page.goto(`${baseUrl}--neutral-trends`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'neutral-trends')
    })

    test('renders loading metric cards', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-metrics`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'loading-metrics')
    })

    test('shows metric card hover', async ({ page }) => {
      await page.goto(`${baseUrl}--metric-cards`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.bg-card:first-child')
      await takeComponentScreenshot(page, 'dashboard', 'metric-hover')
    })

    test('renders mixed metric trends', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-trends`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'mixed-trends')
    })

    test('renders large numbers formatting', async ({ page }) => {
      await page.goto(`${baseUrl}--large-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'large-numbers')
    })
  })

  test.describe('Chart Widgets', () => {
    test('renders chart widgets', async ({ page }) => {
      await page.goto(`${baseUrl}--chart-widgets`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'chart-widgets')
    })

    test('renders different chart types', async ({ page }) => {
      await page.goto(`${baseUrl}--chart-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'chart-types')
    })

    test('renders loading charts', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-charts`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'loading-charts')
    })

    test('shows chart expand button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--chart-widgets`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.bg-card button:has([data-testid="arrow-up-right"])')
      await takeComponentScreenshot(page, 'dashboard', 'chart-expand-hover')
    })

    test('renders charts with descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--charts-with-descriptions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'charts-with-descriptions')
    })

    test('renders custom chart heights', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-chart-heights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'custom-chart-heights')
    })
  })

  test.describe('Activity Feed', () => {
    test('renders activity feed', async ({ page }) => {
      await page.goto(`${baseUrl}--activity-feed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'activity-feed')
    })

    test('renders different activity types', async ({ page }) => {
      await page.goto(`${baseUrl}--activity-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'activity-types')
    })

    test('renders activities with avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--activities-with-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'activities-with-avatars')
    })

    test('renders loading activities', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-activities`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'loading-activities')
    })

    test('renders empty activity feed', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-activities`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'empty-activities')
    })

    test('renders scrollable activities', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-activities`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'scrollable-activities')
    })

    test('shows activity scroll behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable-activities`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => {
        document.querySelector('.overflow-y-auto')?.scrollTo(0, 200)
      })
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dashboard', 'activity-scrolled')
    })
  })

  test.describe('Complete Dashboard Variations', () => {
    test('renders full dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--full-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'full-dashboard')
    })

    test('renders analytics dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'analytics-dashboard')
    })

    test('renders sales dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--sales-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'sales-dashboard')
    })

    test('renders admin dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--admin-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'admin-dashboard')
    })

    test('renders user dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--user-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'user-dashboard')
    })

    test('renders executive dashboard', async ({ page }) => {
      await page.goto(`${baseUrl}--executive-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'executive-dashboard')
    })
  })

  test.describe('Custom Widgets', () => {
    test('renders with custom widgets', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-widgets`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'custom-widgets')
    })

    test('renders mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'mixed-content')
    })

    test('renders dashboard with tables', async ({ page }) => {
      await page.goto(`${baseUrl}--with-tables`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'with-tables')
    })

    test('renders dashboard with forms', async ({ page }) => {
      await page.goto(`${baseUrl}--with-forms`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'with-forms')
    })

    test('renders dashboard with calendars', async ({ page }) => {
      await page.goto(`${baseUrl}--with-calendars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'with-calendars')
    })
  })

  test.describe('Interactive Features', () => {
    test('shows refresh interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive-refresh`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button[title="Refresh dashboard"]')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dashboard', 'refresh-clicked')
    })

    test('shows action button clicks', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Export")')
      await takeComponentScreenshot(page, 'dashboard', 'action-clicked')
    })

    test('shows error retry interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--error-retry`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Try again")')
      await takeComponentScreenshot(page, 'dashboard', 'error-retry-hover')
    })

    test('shows metric card interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--metric-interactions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.bg-card:first-child')
      await takeComponentScreenshot(page, 'dashboard', 'metric-clicked')
    })
  })

  test.describe('Data States', () => {
    test('renders with real-time data', async ({ page }) => {
      await page.goto(`${baseUrl}--realtime-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'realtime-data')
    })

    test('renders with historical data', async ({ page }) => {
      await page.goto(`${baseUrl}--historical-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'historical-data')
    })

    test('renders with stale data indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--stale-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'stale-data')
    })

    test('renders with data warnings', async ({ page }) => {
      await page.goto(`${baseUrl}--data-warnings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'data-warnings')
    })

    test('renders with partial data', async ({ page }) => {
      await page.goto(`${baseUrl}--partial-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'partial-data')
    })
  })

  test.describe('Time Periods and Ranges', () => {
    test('renders with time period selectors', async ({ page }) => {
      await page.goto(`${baseUrl}--time-periods`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'time-periods')
    })

    test('renders daily view', async ({ page }) => {
      await page.goto(`${baseUrl}--daily-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'daily-view')
    })

    test('renders weekly view', async ({ page }) => {
      await page.goto(`${baseUrl}--weekly-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'weekly-view')
    })

    test('renders monthly view', async ({ page }) => {
      await page.goto(`${baseUrl}--monthly-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'monthly-view')
    })

    test('renders yearly view', async ({ page }) => {
      await page.goto(`${baseUrl}--yearly-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'yearly-view')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'dashboard-responsive')
    })

    test('shows mobile dashboard layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'responsive-mobile')
    })

    test('shows tablet dashboard layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'responsive-tablet')
    })

    test('shows responsive metric grid', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-metrics`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'responsive-metrics')
    })

    test('shows responsive chart layout', async ({ page }) => {
      await page.setViewportSize({ width: 600, height: 900 })
      await page.goto(`${baseUrl}--responsive-charts`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'responsive-charts')
    })

    test('shows adaptive header', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'responsive-header')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--full-dashboard`, 'dashboard-color-modes')
    })

    test('shows metrics in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--metric-cards`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'dark-mode-metrics')
    })

    test('shows charts in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--chart-widgets`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'dark-mode-charts')
    })

    test('shows activities in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--activity-feed`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'dark-mode-activities')
    })

    test('shows error state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'dark-mode-error')
    })

    test('shows loading state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'dark-mode-loading')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-high-contrast')
    })

    test('shows aria labels and descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-aria')
    })

    test('shows skip navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--skip-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'dashboard', 'accessibility-skip-nav')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with no data', async ({ page }) => {
      await page.goto(`${baseUrl}--no-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-no-data')
    })

    test('renders with extreme values', async ({ page }) => {
      await page.goto(`${baseUrl}--extreme-values`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-extreme-values')
    })

    test('renders with long text content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-long-content')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-special-chars')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-custom-styling')
    })

    test('renders with many widgets', async ({ page }) => {
      await page.goto(`${baseUrl}--many-widgets`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dashboard', 'edge-many-widgets')
    })

    test('renders with rapid updates', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-updates`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Update Data")')
      await page.waitForTimeout(100)
      await page.click('button:has-text("Update Data")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dashboard', 'edge-rapid-updates')
    })
  })
})