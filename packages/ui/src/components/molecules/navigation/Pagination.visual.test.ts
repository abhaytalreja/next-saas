import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Pagination Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-pagination'

  test.describe('Basic States', () => {
    test('renders first page', async ({ page }) => {
      await page.goto(`${baseUrl}--first-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-first-page')
    })

    test('renders middle page', async ({ page }) => {
      await page.goto(`${baseUrl}--middle-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-middle-page')
    })

    test('renders last page', async ({ page }) => {
      await page.goto(`${baseUrl}--last-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-last-page')
    })

    test('renders single page', async ({ page }) => {
      await page.goto(`${baseUrl}--single-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-single-page')
    })

    test('renders few pages', async ({ page }) => {
      await page.goto(`${baseUrl}--few-pages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-few-pages')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'variant-default')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'variant-outline')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'variant-ghost')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'size-large')
    })
  })

  test.describe('Page Ranges', () => {
    test('renders with ellipsis left', async ({ page }) => {
      await page.goto(`${baseUrl}--ellipsis-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'range-ellipsis-left')
    })

    test('renders with ellipsis right', async ({ page }) => {
      await page.goto(`${baseUrl}--ellipsis-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'range-ellipsis-right')
    })

    test('renders with ellipsis both sides', async ({ page }) => {
      await page.goto(`${baseUrl}--ellipsis-both`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'range-ellipsis-both')
    })

    test('renders with no ellipsis', async ({ page }) => {
      await page.goto(`${baseUrl}--no-ellipsis`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'range-no-ellipsis')
    })

    test('renders many pages', async ({ page }) => {
      await page.goto(`${baseUrl}--many-pages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'range-many-pages')
    })
  })

  test.describe('Navigation Controls', () => {
    test('renders with all controls', async ({ page }) => {
      await page.goto(`${baseUrl}--all-controls`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'controls-all')
    })

    test('renders without first/last', async ({ page }) => {
      await page.goto(`${baseUrl}--no-first-last`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'controls-no-first-last')
    })

    test('renders without prev/next', async ({ page }) => {
      await page.goto(`${baseUrl}--no-prev-next`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'controls-no-prev-next')
    })

    test('renders minimal controls', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-controls`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'controls-minimal')
    })

    test('shows disabled states', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'controls-disabled')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("3")')
      await takeComponentScreenshot(page, 'pagination', 'interactive-hover')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'pagination', 'interactive-focus')
    })

    test('shows active page', async ({ page }) => {
      await page.goto(`${baseUrl}--active-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'interactive-active')
    })

    test('shows disabled navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'interactive-disabled')
    })
  })

  test.describe('Configuration Options', () => {
    test('renders with custom sibling count', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-siblings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'config-siblings')
    })

    test('renders with custom boundary count', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-boundary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'config-boundary')
    })

    test('renders compact layout', async ({ page }) => {
      await page.goto(`${baseUrl}--compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'config-compact')
    })

    test('renders expanded layout', async ({ page }) => {
      await page.goto(`${baseUrl}--expanded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'config-expanded')
    })
  })

  test.describe('Simple Pagination', () => {
    test('renders simple pagination', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'simple-default')
    })

    test('renders simple first page', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-first`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'simple-first')
    })

    test('renders simple last page', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-last`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'simple-last')
    })

    test('shows simple hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Next")')
      await takeComponentScreenshot(page, 'pagination', 'simple-hover')
    })
  })

  test.describe('Page Information', () => {
    test('renders with page info', async ({ page }) => {
      await page.goto(`${baseUrl}--with-page-info`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'info-page-details')
    })

    test('renders with total results', async ({ page }) => {
      await page.goto(`${baseUrl}--with-total-results`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'info-total-results')
    })

    test('renders with range info', async ({ page }) => {
      await page.goto(`${baseUrl}--with-range`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'info-range')
    })

    test('renders with per-page selector', async ({ page }) => {
      await page.goto(`${baseUrl}--with-per-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'info-per-page')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders in table context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'layout-table')
    })

    test('renders in card layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'layout-card')
    })

    test('renders with search results', async ({ page }) => {
      await page.goto(`${baseUrl}--search-results`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'layout-search')
    })

    test('renders in sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'layout-sidebar')
    })

    test('renders in modal', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'layout-modal')
    })
  })

  test.describe('Loading States', () => {
    test('renders loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-loading')
    })

    test('renders skeleton state', async ({ page }) => {
      await page.goto(`${baseUrl}--skeleton`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'state-skeleton')
    })

    test('shows page transition', async ({ page }) => {
      await page.goto(`${baseUrl}--transition`)
      await page.waitForLoadState('networkidle')
      
      // Click next page
      await page.click('button:has-text("3")')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'pagination', 'state-transition')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders rounded style', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'style-rounded')
    })

    test('renders pill style', async ({ page }) => {
      await page.goto(`${baseUrl}--pill`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'style-pill')
    })

    test('renders square style', async ({ page }) => {
      await page.goto(`${baseUrl}--square`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'style-square')
    })

    test('renders connected style', async ({ page }) => {
      await page.goto(`${baseUrl}--connected`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'style-connected')
    })

    test('renders custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'style-custom-colors')
    })
  })

  test.describe('Error States', () => {
    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'error-default')
    })

    test('renders invalid page', async ({ page }) => {
      await page.goto(`${baseUrl}--invalid-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'error-invalid-page')
    })

    test('renders no results', async ({ page }) => {
      await page.goto(`${baseUrl}--no-results`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'error-no-results')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'pagination-responsive')
    })

    test('shows mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'responsive-mobile')
    })

    test('shows compact mobile', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'responsive-mobile-compact')
    })

    test('shows tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'responsive-tablet')
    })

    test('adapts to container width', async ({ page }) => {
      await page.goto(`${baseUrl}--adaptive-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'pagination-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'dark-mode-contrast')
    })

    test('shows simple pagination in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'dark-mode-simple')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'pagination', 'accessibility-focus')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'accessibility-screen-reader')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      // Navigate with keyboard
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'pagination', 'accessibility-keyboard')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'accessibility-contrast')
    })

    test('shows aria states', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders zero pages', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-pages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'edge-zero-pages')
    })

    test('renders negative page', async ({ page }) => {
      await page.goto(`${baseUrl}--negative-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'edge-negative-page')
    })

    test('renders huge page numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--huge-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'edge-huge-numbers')
    })

    test('renders with very long page counts', async ({ page }) => {
      await page.goto(`${baseUrl}--very-long`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'edge-very-long')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'edge-custom-class')
    })
  })

  test.describe('Performance', () => {
    test('renders large page sets efficiently', async ({ page }) => {
      await page.goto(`${baseUrl}--large-page-set`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'pagination', 'performance-large-set')
    })

    test('handles rapid page changes', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-changes`)
      await page.waitForLoadState('networkidle')
      
      // Click through pages quickly
      await page.click('button:has-text("3")')
      await page.waitForTimeout(50)
      await page.click('button:has-text("4")')
      await page.waitForTimeout(50)
      await page.click('button:has-text("5")')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'pagination', 'performance-rapid')
    })
  })
})