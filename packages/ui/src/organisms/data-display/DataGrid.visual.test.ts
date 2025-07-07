import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('DataGrid Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=organisms-data-display-datagrid'

  test.describe('Basic DataGrid States', () => {
    test('renders basic data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'basic')
    })

    test('renders empty data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'empty')
    })

    test('renders loading data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'loading')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'error')
    })

    test('renders minimal grid without toolbar', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'minimal')
    })
  })

  test.describe('DataGrid Styling Options', () => {
    test('renders striped data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--striped`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'striped')
    })

    test('renders bordered data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--bordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'bordered')
    })

    test('renders hoverable data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--hoverable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-grid', 'hoverable')
    })

    test('renders compact data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'compact')
    })

    test('renders comfortable data grid', async ({ page }) => {
      await page.goto(`${baseUrl}--comfortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'comfortable')
    })

    test('compares styling variations', async ({ page }) => {
      await page.goto(`${baseUrl}--styling-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'styling-comparison')
    })
  })

  test.describe('Column Configuration', () => {
    test('renders with different column alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--column-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'column-alignments')
    })

    test('renders with fixed column widths', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed-widths`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'fixed-widths')
    })

    test('renders with custom cell renderers', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-cells`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'custom-cells')
    })

    test('renders with many columns', async ({ page }) => {
      await page.goto(`${baseUrl}--many-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'many-columns')
    })

    test('renders with complex content', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'complex-content')
    })
  })

  test.describe('Sorting Features', () => {
    test('renders with sortable columns', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'sortable')
    })

    test('shows ascending sort state', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-ascending`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'sort-ascending')
    })

    test('shows descending sort state', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-descending`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'sort-descending')
    })

    test('shows multi-column sorting', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-sort`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'multi-sort')
    })

    test('shows sort interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('th:has-text("Name") button')
      await takeComponentScreenshot(page, 'data-grid', 'sort-hover')
    })

    test('shows mixed sortable columns', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-sortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'mixed-sortable')
    })
  })

  test.describe('Filtering Features', () => {
    test('renders with global filter', async ({ page }) => {
      await page.goto(`${baseUrl}--global-filter`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'global-filter')
    })

    test('shows global filter in action', async ({ page }) => {
      await page.goto(`${baseUrl}--global-filter`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[placeholder="Search all columns..."]', 'John')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'data-grid', 'global-filter-active')
    })

    test('renders with column filters', async ({ page }) => {
      await page.goto(`${baseUrl}--column-filters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'column-filters')
    })

    test('shows no results after filtering', async ({ page }) => {
      await page.goto(`${baseUrl}--global-filter`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[placeholder="Search all columns..."]', 'nonexistent')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'data-grid', 'filter-no-results')
    })

    test('shows combined filters and search', async ({ page }) => {
      await page.goto(`${baseUrl}--combined-filters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'combined-filters')
    })
  })

  test.describe('Selection Features', () => {
    test('renders with row selection', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'row-selection')
    })

    test('shows selected rows', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await page.check('tbody tr:nth-child(2) input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'rows-selected')
    })

    test('shows select all state', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('thead input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'all-selected')
    })

    test('shows indeterminate select state', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'indeterminate-selection')
    })

    test('shows selection count', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await page.check('tbody tr:nth-child(2) input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'selection-count')
    })

    test('shows single row selection', async ({ page }) => {
      await page.goto(`${baseUrl}--single-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'single-selection')
    })
  })

  test.describe('Pagination Features', () => {
    test('renders with pagination', async ({ page }) => {
      await page.goto(`${baseUrl}--with-pagination`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'with-pagination')
    })

    test('shows pagination controls', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-controls`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'pagination-controls')
    })

    test('shows first page state', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-first-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'pagination-first-page')
    })

    test('shows last page state', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-last-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'pagination-last-page')
    })

    test('shows page size selector', async ({ page }) => {
      await page.goto(`${baseUrl}--with-pagination`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await takeComponentScreenshot(page, 'data-grid', 'page-size-selector')
    })

    test('shows pagination info', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-info`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'pagination-info')
    })
  })

  test.describe('Toolbar Features', () => {
    test('renders with full toolbar', async ({ page }) => {
      await page.goto(`${baseUrl}--full-toolbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'full-toolbar')
    })

    test('shows refresh button loading', async ({ page }) => {
      await page.goto(`${baseUrl}--refresh-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'refresh-loading')
    })

    test('shows export functionality', async ({ page }) => {
      await page.goto(`${baseUrl}--with-export`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Export")')
      await takeComponentScreenshot(page, 'data-grid', 'export-hover')
    })

    test('renders with custom toolbar actions', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-toolbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'custom-toolbar')
    })

    test('shows toolbar with selection actions', async ({ page }) => {
      await page.goto(`${baseUrl}--toolbar-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'toolbar-selection')
    })
  })

  test.describe('Row Interactions', () => {
    test('shows clickable rows', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-rows`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-grid', 'clickable-rows-hover')
    })

    test('shows row click interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-rows`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-grid', 'row-clicked')
    })

    test('shows row actions menu', async ({ page }) => {
      await page.goto(`${baseUrl}--row-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'data-grid', 'row-actions-menu')
    })

    test('shows row actions hover', async ({ page }) => {
      await page.goto(`${baseUrl}--row-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child button')
      await takeComponentScreenshot(page, 'data-grid', 'row-actions-hover')
    })

    test('shows expandable rows', async ({ page }) => {
      await page.goto(`${baseUrl}--expandable-rows`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child button[aria-label="Expand"]')
      await takeComponentScreenshot(page, 'data-grid', 'expandable-rows')
    })
  })

  test.describe('Data Types and Content', () => {
    test('renders with different data types', async ({ page }) => {
      await page.goto(`${baseUrl}--data-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'data-types')
    })

    test('renders with status badges', async ({ page }) => {
      await page.goto(`${baseUrl}--status-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'status-badges')
    })

    test('renders with user avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--user-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'user-avatars')
    })

    test('renders with action buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--action-buttons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'action-buttons')
    })

    test('renders with progress indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-indicators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'progress-indicators')
    })

    test('renders with formatted numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--formatted-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'formatted-numbers')
    })

    test('renders with links and external content', async ({ page }) => {
      await page.goto(`${baseUrl}--links-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'links-content')
    })
  })

  test.describe('Advanced Features', () => {
    test('shows all features combined', async ({ page }) => {
      await page.goto(`${baseUrl}--all-features`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'all-features')
    })

    test('shows grouped columns', async ({ page }) => {
      await page.goto(`${baseUrl}--grouped-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'grouped-columns')
    })

    test('shows pinned columns', async ({ page }) => {
      await page.goto(`${baseUrl}--pinned-columns`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => document.querySelector('.overflow-x-auto')?.scrollTo(200, 0))
      await takeComponentScreenshot(page, 'data-grid', 'pinned-columns')
    })

    test('shows virtual scrolling', async ({ page }) => {
      await page.goto(`${baseUrl}--virtual-scrolling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'virtual-scrolling')
    })

    test('shows resizable columns', async ({ page }) => {
      await page.goto(`${baseUrl}--resizable-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'resizable-columns')
    })
  })

  test.describe('Performance and Large Data', () => {
    test('renders with large dataset', async ({ page }) => {
      await page.goto(`${baseUrl}--large-dataset`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'large-dataset')
    })

    test('shows loading performance', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-performance`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'loading-performance')
    })

    test('shows progressive loading', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'progressive-loading')
    })

    test('shows infinite scroll', async ({ page }) => {
      await page.goto(`${baseUrl}--infinite-scroll`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'infinite-scroll')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'data-grid-responsive')
    })

    test('shows mobile data grid behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'responsive-mobile')
    })

    test('shows tablet data grid behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'responsive-tablet')
    })

    test('shows horizontal scroll behavior', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--many-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'responsive-scroll')
    })

    test('shows responsive column hiding', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'responsive-columns')
    })

    test('shows responsive toolbar', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-toolbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'responsive-toolbar')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'data-grid-color-modes')
    })

    test('shows all features in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-features`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'dark-mode-features')
    })

    test('shows selection in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--row-selection`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-grid', 'dark-mode-selection')
    })

    test('shows hover states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--hoverable`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-grid', 'dark-mode-hover')
    })

    test('shows loading state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'dark-mode-loading')
    })

    test('shows toolbar in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--full-toolbar`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'dark-mode-toolbar')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-high-contrast')
    })

    test('shows aria labels and descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-aria')
    })

    test('shows table navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--table-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowRight')
      await takeComponentScreenshot(page, 'data-grid', 'accessibility-table-navigation')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with single row', async ({ page }) => {
      await page.goto(`${baseUrl}--single-row`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-single-row')
    })

    test('renders with single column', async ({ page }) => {
      await page.goto(`${baseUrl}--single-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-single-column')
    })

    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-long-content')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-special-chars')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-custom-styling')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-grid', 'edge-constrained')
    })

    test('renders with dynamic data updates', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-updates`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Add Row")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'data-grid', 'edge-dynamic-updates')
    })
  })
})