import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('DataTable Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-data-display-datatable'

  test.describe('Basic Table States', () => {
    test('renders basic data table', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'basic')
    })

    test('renders empty table', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'empty')
    })

    test('renders loading table', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'loading')
    })

    test('renders table with custom empty state', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-empty-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'custom-empty-state')
    })

    test('renders table with different loading rows', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'loading-rows')
    })
  })

  test.describe('Column Configurations', () => {
    test('renders table with different column alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--column-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'column-alignments')
    })

    test('renders table with fixed column widths', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed-widths`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'fixed-widths')
    })

    test('renders table with min column widths', async ({ page }) => {
      await page.goto(`${baseUrl}--min-widths`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'min-widths')
    })

    test('renders table with custom column renderers', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-renderers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'custom-renderers')
    })

    test('renders table with complex column content', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'complex-content')
    })
  })

  test.describe('Sorting Features', () => {
    test('renders table with sortable columns', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'sortable')
    })

    test('shows ascending sort state', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-ascending`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'sort-ascending')
    })

    test('shows descending sort state', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-descending`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'sort-descending')
    })

    test('shows sort interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--sortable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('th:has-text("Name")')
      await takeComponentScreenshot(page, 'data-table', 'sort-hover')
    })

    test('shows mixed sortable and non-sortable columns', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-sortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'mixed-sortable')
    })
  })

  test.describe('Search and Filter Features', () => {
    test('renders table with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-search')
    })

    test('shows search in action', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[placeholder="Search..."]', 'John')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'data-table', 'search-active')
    })

    test('renders table with filters', async ({ page }) => {
      await page.goto(`${baseUrl}--with-filters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-filters')
    })

    test('shows filter button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-filters`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Filters")')
      await takeComponentScreenshot(page, 'data-table', 'filter-hover')
    })

    test('renders table with both search and filters', async ({ page }) => {
      await page.goto(`${baseUrl}--search-and-filters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'search-and-filters')
    })

    test('shows no results state after search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[placeholder="Search..."]', 'nonexistent')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'data-table', 'search-no-results')
    })
  })

  test.describe('Selection Features', () => {
    test('renders table with row selection', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-selection')
    })

    test('shows selected rows', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await page.check('tbody tr:nth-child(2) input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-table', 'rows-selected')
    })

    test('shows select all state', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('thead input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-table', 'all-selected')
    })

    test('shows indeterminate select all state', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-table', 'indeterminate-selection')
    })

    test('shows selection with hover effects', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-table', 'selection-hover')
    })
  })

  test.describe('Row Actions', () => {
    test('renders table with row actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-actions')
    })

    test('shows action button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child button')
      await takeComponentScreenshot(page, 'data-table', 'action-hover')
    })

    test('renders table with dropdown actions', async ({ page }) => {
      await page.goto(`${baseUrl}--dropdown-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'dropdown-actions')
    })

    test('shows dropdown menu opened', async ({ page }) => {
      await page.goto(`${baseUrl}--dropdown-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child button:has-text("⋯")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'data-table', 'dropdown-opened')
    })

    test('renders table with multiple action types', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'multiple-actions')
    })
  })

  test.describe('Pagination Features', () => {
    test('renders table with pagination', async ({ page }) => {
      await page.goto(`${baseUrl}--with-pagination`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-pagination')
    })

    test('shows pagination controls', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-controls`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'pagination-controls')
    })

    test('shows disabled pagination states', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-first-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'pagination-first-page')
    })

    test('shows pagination last page', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-last-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'pagination-last-page')
    })

    test('shows page size selector', async ({ page }) => {
      await page.goto(`${baseUrl}--with-pagination`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select')
      await takeComponentScreenshot(page, 'data-table', 'page-size-selector')
    })

    test('shows pagination info', async ({ page }) => {
      await page.goto(`${baseUrl}--pagination-info`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'pagination-info')
    })
  })

  test.describe('Interactive Features', () => {
    test('shows clickable rows', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-rows`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-table', 'clickable-rows-hover')
    })

    test('shows row click interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-rows`)
      await page.waitForLoadState('networkidle')
      
      await page.click('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-table', 'row-clicked')
    })

    test('shows combined interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--all-features`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'all-features')
    })

    test('shows search with selection', async ({ page }) => {
      await page.goto(`${baseUrl}--search-with-selection`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[placeholder="Search..."]', 'John')
      await page.waitForTimeout(300)
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-table', 'search-with-selection')
    })
  })

  test.describe('Data Types and Content', () => {
    test('renders table with different data types', async ({ page }) => {
      await page.goto(`${baseUrl}--data-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'data-types')
    })

    test('renders table with badges and status', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-badges')
    })

    test('renders table with avatars and images', async ({ page }) => {
      await page.goto(`${baseUrl}--with-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-avatars')
    })

    test('renders table with icons and buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'with-icons')
    })

    test('renders table with links and formatted text', async ({ page }) => {
      await page.goto(`${baseUrl}--formatted-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'formatted-content')
    })

    test('renders table with numeric data', async ({ page }) => {
      await page.goto(`${baseUrl}--numeric-data`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'numeric-data')
    })
  })

  test.describe('Table Sizes and Density', () => {
    test('renders compact table', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'compact')
    })

    test('renders comfortable table', async ({ page }) => {
      await page.goto(`${baseUrl}--comfortable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'comfortable')
    })

    test('renders spacious table', async ({ page }) => {
      await page.goto(`${baseUrl}--spacious`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'spacious')
    })

    test('compares table densities', async ({ page }) => {
      await page.goto(`${baseUrl}--density-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'density-comparison')
    })
  })

  test.describe('Table Layouts', () => {
    test('renders fixed layout table', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'fixed-layout')
    })

    test('renders auto layout table', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'auto-layout')
    })

    test('renders table with sticky header', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky-header`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => window.scrollTo(0, 200))
      await takeComponentScreenshot(page, 'data-table', 'sticky-header')
    })

    test('renders table with sticky columns', async ({ page }) => {
      await page.goto(`${baseUrl}--sticky-columns`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => document.querySelector('.overflow-x-auto')?.scrollTo(200, 0))
      await takeComponentScreenshot(page, 'data-table', 'sticky-columns')
    })
  })

  test.describe('Error and Edge States', () => {
    test('renders table with error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error-state`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'error-state')
    })

    test('renders table with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'long-content')
    })

    test('renders table with many columns', async ({ page }) => {
      await page.goto(`${baseUrl}--many-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'many-columns')
    })

    test('renders table with single row', async ({ page }) => {
      await page.goto(`${baseUrl}--single-row`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'single-row')
    })

    test('renders table with single column', async ({ page }) => {
      await page.goto(`${baseUrl}--single-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'single-column')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'data-table-responsive')
    })

    test('shows mobile table behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'responsive-mobile')
    })

    test('shows tablet table behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-view`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'responsive-tablet')
    })

    test('shows horizontal scroll behavior', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--many-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'responsive-scroll')
    })

    test('shows responsive column hiding', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'responsive-columns')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'data-table-color-modes')
    })

    test('shows all features in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-features`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'dark-mode-features')
    })

    test('shows selection in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-selection`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.check('tbody tr:first-child input[type="checkbox"]')
      await takeComponentScreenshot(page, 'data-table', 'dark-mode-selection')
    })

    test('shows hover states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-rows`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('tbody tr:first-child')
      await takeComponentScreenshot(page, 'data-table', 'dark-mode-hover')
    })

    test('shows loading state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'dark-mode-loading')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'data-table', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await takeComponentScreenshot(page, 'data-table', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'accessibility-high-contrast')
    })

    test('shows aria labels and descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'accessibility-aria')
    })
  })

  test.describe('Performance and Large Data', () => {
    test('renders table with large dataset', async ({ page }) => {
      await page.goto(`${baseUrl}--large-dataset`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'large-dataset')
    })

    test('shows virtualized table', async ({ page }) => {
      await page.goto(`${baseUrl}--virtualized`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'virtualized')
    })

    test('shows table with lazy loading', async ({ page }) => {
      await page.goto(`${baseUrl}--lazy-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'lazy-loading')
    })

    test('shows progressive loading', async ({ page }) => {
      await page.goto(`${baseUrl}--progressive-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'data-table', 'progressive-loading')
    })
  })
})