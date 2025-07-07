import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('SearchBox Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-search-searchbox'

  test.describe('Basic SearchBox States', () => {
    test('renders basic search box', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'basic')
    })

    test('renders empty search box', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'empty')
    })

    test('renders search box with placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--with-placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'with-placeholder')
    })

    test('renders search box with value', async ({ page }) => {
      await page.goto(`${baseUrl}--with-value`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'with-value')
    })

    test('renders disabled search box', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'disabled')
    })
  })

  test.describe('SearchBox Sizes', () => {
    test('renders small search box', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'size-small')
    })

    test('renders medium search box', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'size-medium')
    })

    test('renders large search box', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'size-large')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'size-comparison')
    })

    test('shows sizes with content', async ({ page }) => {
      await page.goto(`${baseUrl}--sizes-with-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'sizes-with-content')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('input')
      await takeComponentScreenshot(page, 'search-box', 'interactive-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await takeComponentScreenshot(page, 'search-box', 'interactive-focus')
    })

    test('shows typing state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'search query')
      await takeComponentScreenshot(page, 'search-box', 'interactive-typing')
    })

    test('shows loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'interactive-loading')
    })

    test('shows loading with different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'loading-sizes')
    })
  })

  test.describe('Clear Functionality', () => {
    test('shows clear button', async ({ page }) => {
      await page.goto(`${baseUrl}--clearable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'clearable')
    })

    test('shows clear button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--clearable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has([data-testid="clear-icon"])')
      await takeComponentScreenshot(page, 'search-box', 'clear-hover')
    })

    test('shows non-clearable search box', async ({ page }) => {
      await page.goto(`${baseUrl}--non-clearable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'non-clearable')
    })

    test('shows clear interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--clearable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has([data-testid="clear-icon"])')
      await takeComponentScreenshot(page, 'search-box', 'clear-clicked')
    })

    test('shows clear with different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--clear-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'clear-sizes')
    })
  })

  test.describe('Suggestions Feature', () => {
    test('shows suggestions dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'sea')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'suggestions-dropdown')
    })

    test('shows empty suggestions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'xyz')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'suggestions-empty')
    })

    test('shows suggestion hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'sea')
      await page.waitForTimeout(300)
      await page.hover('li:first-child')
      await takeComponentScreenshot(page, 'search-box', 'suggestion-hover')
    })

    test('shows suggestion selection', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'sea')
      await page.waitForTimeout(300)
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'search-box', 'suggestion-selected')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'sea')
      await page.waitForTimeout(300)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'search-box', 'keyboard-navigation')
    })

    test('shows many suggestions', async ({ page }) => {
      await page.goto(`${baseUrl}--many-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'a')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'many-suggestions')
    })
  })

  test.describe('Search Box Variants', () => {
    test('renders search input variant', async ({ page }) => {
      await page.goto(`${baseUrl}--search-input`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'variant-search-input')
    })

    test('renders filter input variant', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-input`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'variant-filter-input')
    })

    test('renders autocomplete variant', async ({ page }) => {
      await page.goto(`${baseUrl}--autocomplete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'variant-autocomplete')
    })

    test('renders command palette variant', async ({ page }) => {
      await page.goto(`${baseUrl}--command-palette`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'variant-command-palette')
    })

    test('compares search box variants', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'variant-comparison')
    })
  })

  test.describe('Context Usage', () => {
    test('renders in header context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-header')
    })

    test('renders in sidebar context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-sidebar')
    })

    test('renders in toolbar context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-toolbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-toolbar')
    })

    test('renders in modal context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-modal')
    })

    test('renders in table context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-table')
    })

    test('renders in dashboard context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'context-dashboard')
    })
  })

  test.describe('Debouncing and Performance', () => {
    test('shows instant search', async ({ page }) => {
      await page.goto(`${baseUrl}--instant-search`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'query')
      await takeComponentScreenshot(page, 'search-box', 'instant-search')
    })

    test('shows debounced search', async ({ page }) => {
      await page.goto(`${baseUrl}--debounced-search`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'query')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'search-box', 'debounced-search')
    })

    test('shows search with loading delay', async ({ page }) => {
      await page.goto(`${baseUrl}--search-loading`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'query')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'search-box', 'search-loading')
    })

    test('shows rapid typing behavior', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-typing`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'quick')
      await page.fill('input', 'quick search')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'search-box', 'rapid-typing')
    })
  })

  test.describe('Advanced Features', () => {
    test('shows recent searches', async ({ page }) => {
      await page.goto(`${baseUrl}--recent-searches`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'search-box', 'recent-searches')
    })

    test('shows search categories', async ({ page }) => {
      await page.goto(`${baseUrl}--search-categories`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'cat')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'search-categories')
    })

    test('shows search with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--search-with-icons`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'doc')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'search-with-icons')
    })

    test('shows search with descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--search-descriptions`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'user')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'search-descriptions')
    })

    test('shows global search', async ({ page }) => {
      await page.goto(`${baseUrl}--global-search`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'global')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'global-search')
    })
  })

  test.describe('Error and Edge States', () => {
    test('shows no results state', async ({ page }) => {
      await page.goto(`${baseUrl}--no-results`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'nonexistent')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'no-results')
    })

    test('shows search error state', async ({ page }) => {
      await page.goto(`${baseUrl}--search-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'search-error')
    })

    test('shows network error state', async ({ page }) => {
      await page.goto(`${baseUrl}--network-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'network-error')
    })

    test('shows very long query', async ({ page }) => {
      await page.goto(`${baseUrl}--long-query`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'long-query')
    })

    test('shows special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'special-characters')
    })

    test('shows unicode search', async ({ page }) => {
      await page.goto(`${baseUrl}--unicode-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'unicode-search')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'search-box-responsive')
    })

    test('shows mobile search behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'responsive-mobile')
    })

    test('shows tablet search behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-search`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'responsive-tablet')
    })

    test('shows expandable search', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--expandable-search`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button[aria-label="Search"]')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'responsive-expandable')
    })

    test('shows adaptive search layout', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'search-box-color-modes')
    })

    test('shows suggestions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-suggestions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'sea')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'dark-mode-suggestions')
    })

    test('shows loading state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'dark-mode-loading')
    })

    test('shows focus state in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await takeComponentScreenshot(page, 'search-box', 'dark-mode-focus')
    })

    test('shows clear button in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--clearable`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'dark-mode-clear')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'search-box', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.focus('input')
      await page.fill('input', 'nav')
      await page.waitForTimeout(300)
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'search-box', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'accessibility-high-contrast')
    })

    test('shows aria labels', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'accessibility-aria')
    })

    test('shows search announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--search-announcements`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'announce')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'search-box', 'accessibility-announcements')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with minimal configuration', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'edge-minimal')
    })

    test('renders with maximum configuration', async ({ page }) => {
      await page.goto(`${baseUrl}--maximum`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'edge-maximum')
    })

    test('renders with custom styles', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'edge-custom-styles')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'search-box', 'edge-constrained')
    })

    test('renders with dynamic suggestions', async ({ page }) => {
      await page.goto(`${baseUrl}--dynamic-suggestions`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'dyn')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'search-box', 'edge-dynamic-suggestions')
    })

    test('renders with rapid interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-interactions`)
      await page.waitForLoadState('networkidle')
      
      await page.fill('input', 'rapid')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'search-box', 'edge-rapid-interactions')
    })
  })
})