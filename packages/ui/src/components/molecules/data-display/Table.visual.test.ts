import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Table Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-data-display-table'

  test.describe('Basic Table', () => {
    test('renders basic table', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'basic-default')
    })

    test('renders table with header', async ({ page }) => {
      await page.goto(`${baseUrl}--with-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'with-header')
    })

    test('renders table with footer', async ({ page }) => {
      await page.goto(`${baseUrl}--with-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'with-footer')
    })

    test('renders table with caption', async ({ page }) => {
      await page.goto(`${baseUrl}--with-caption`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'with-caption')
    })

    test('renders minimal table', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'minimal')
    })
  })

  test.describe('Table Variants', () => {
    test('renders striped table', async ({ page }) => {
      await page.goto(`${baseUrl}--striped`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'variant-striped')
    })

    test('renders hoverable table', async ({ page }) => {
      await page.goto(`${baseUrl}--hoverable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'variant-hoverable')
    })

    test('renders bordered table', async ({ page }) => {
      await page.goto(`${baseUrl}--bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'variant-bordered')
    })

    test('renders compact table', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'variant-compact')
    })

    test('renders all variants combined', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'variant-combined')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--hoverable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:nth-child(2)')
      await takeComponentScreenshot(page, 'table', 'state-hover')
    })

    test('shows selected rows', async ({ page }) => {
      await page.goto(`${baseUrl}--selectable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'state-selected')
    })

    test('shows multiple selected rows', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-select`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'state-multi-selected')
    })

    test('shows row interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'table', 'state-interactive')
    })
  })

  test.describe('Sortable Tables', () => {
    test('renders sortable headers', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'sortable-default')
    })

    test('shows ascending sort', async ({ page }) => {
      await page.goto(`${baseUrl}--sorted-asc`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'sortable-asc')
    })

    test('shows descending sort', async ({ page }) => {
      await page.goto(`${baseUrl}--sorted-desc`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'sortable-desc')
    })

    test('shows sort hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('th:nth-child(2)')
      await takeComponentScreenshot(page, 'table', 'sortable-hover')
    })

    test('shows multi-column sort', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-sort`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'sortable-multi')
    })
  })

  test.describe('Column Alignment', () => {
    test('renders left aligned columns', async ({ page }) => {
      await page.goto(`${baseUrl}--align-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'align-left')
    })

    test('renders center aligned columns', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'align-center')
    })

    test('renders right aligned columns', async ({ page }) => {
      await page.goto(`${baseUrl}--align-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'align-right')
    })

    test('renders mixed alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'align-mixed')
    })
  })

  test.describe('Data Types', () => {
    test('renders text data', async ({ page }) => {
      await page.goto(`${baseUrl}--data-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-text')
    })

    test('renders numeric data', async ({ page }) => {
      await page.goto(`${baseUrl}--data-numeric`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-numeric')
    })

    test('renders date data', async ({ page }) => {
      await page.goto(`${baseUrl}--data-dates`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-dates')
    })

    test('renders status badges', async ({ page }) => {
      await page.goto(`${baseUrl}--data-status`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-status')
    })

    test('renders avatars and images', async ({ page }) => {
      await page.goto(`${baseUrl}--data-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-avatars')
    })

    test('renders action buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--data-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'data-actions')
    })
  })

  test.describe('Complex Tables', () => {
    test('renders user management table', async ({ page }) => {
      await page.goto(`${baseUrl}--users-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'complex-users')
    })

    test('renders financial data table', async ({ page }) => {
      await page.goto(`${baseUrl}--financial-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'complex-financial')
    })

    test('renders product catalog table', async ({ page }) => {
      await page.goto(`${baseUrl}--products-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'complex-products')
    })

    test('renders analytics table', async ({ page }) => {
      await page.goto(`${baseUrl}--analytics-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'complex-analytics')
    })

    test('renders nested data table', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'complex-nested')
    })
  })

  test.describe('Empty States', () => {
    test('renders empty table', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'empty-default')
    })

    test('renders empty with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'empty-with-icon')
    })

    test('renders empty with action', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-with-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'empty-with-action')
    })

    test('renders no results state', async ({ page }) => {
      await page.goto(`${baseUrl}--no-results`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'empty-no-results')
    })

    test('renders loading empty state', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'empty-loading')
    })
  })

  test.describe('Loading States', () => {
    test('renders loading table', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'loading-default')
    })

    test('renders skeleton rows', async ({ page }) => {
      await page.goto(`${baseUrl}--skeleton`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'loading-skeleton')
    })

    test('renders partial loading', async ({ page }) => {
      await page.goto(`${baseUrl}--partial-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'loading-partial')
    })

    test('renders lazy loading', async ({ page }) => {
      await page.goto(`${baseUrl}--lazy-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'loading-lazy')
    })
  })

  test.describe('Error States', () => {
    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'error-default')
    })

    test('renders connection error', async ({ page }) => {
      await page.goto(`${baseUrl}--connection-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'error-connection')
    })

    test('renders permission error', async ({ page }) => {
      await page.goto(`${baseUrl}--permission-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'error-permission')
    })

    test('renders data validation error', async ({ page }) => {
      await page.goto(`${baseUrl}--validation-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'error-validation')
    })
  })

  test.describe('Table Sizes', () => {
    test('renders small table', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'size-small')
    })

    test('renders large table', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'size-large')
    })

    test('renders dense table', async ({ page }) => {
      await page.goto(`${baseUrl}--dense`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'size-dense')
    })

    test('renders spacious table', async ({ page }) => {
      await page.goto(`${baseUrl}--spacious`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'size-spacious')
    })
  })

  test.describe('Scrollable Tables', () => {
    test('renders horizontal scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'scroll-horizontal')
    })

    test('renders vertical scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'scroll-vertical')
    })

    test('renders fixed header scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'scroll-fixed-header')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'scroll-indicators')
    })

    test('shows scrolled state', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-scroll`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => {
        const table = document.querySelector('.table-container')
        if (table) table.scrollLeft = 200
      })
      await takeComponentScreenshot(page, 'table', 'scroll-scrolled')
    })
  })

  test.describe('Selection Features', () => {
    test('renders row selection', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'selection-rows')
    })

    test('renders header checkbox', async ({ page }) => {
      await page.goto(`${baseUrl}--header-checkbox`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'selection-header-checkbox')
    })

    test('shows bulk selection', async ({ page }) => {
      await page.goto(`${baseUrl}--bulk-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'selection-bulk')
    })

    test('shows selection toolbar', async ({ page }) => {
      await page.goto(`${baseUrl}--selection-toolbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'selection-toolbar')
    })

    test('shows indeterminate selection', async ({ page }) => {
      await page.goto(`${baseUrl}--indeterminate-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'selection-indeterminate')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'table-responsive')
    })

    test('shows mobile table', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'responsive-mobile')
    })

    test('shows tablet table', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'responsive-tablet')
    })

    test('shows mobile card layout', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-cards`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'responsive-mobile-cards')
    })

    test('shows adaptive columns', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'table-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--users-table`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'dark-mode-contrast')
    })

    test('shows selection in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'dark-mode-selection')
    })

    test('shows sorting in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'dark-mode-sorting')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'table', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'table', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-long-content')
    })

    test('renders with many columns', async ({ page }) => {
      await page.goto(`${baseUrl}--many-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-many-columns')
    })

    test('renders with many rows', async ({ page }) => {
      await page.goto(`${baseUrl}--many-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-many-rows')
    })

    test('renders single column', async ({ page }) => {
      await page.goto(`${baseUrl}--single-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-single-column')
    })

    test('renders single row', async ({ page }) => {
      await page.goto(`${baseUrl}--single-row`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-single-row')
    })

    test('renders with mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'table', 'edge-mixed-content')
    })
  })
})