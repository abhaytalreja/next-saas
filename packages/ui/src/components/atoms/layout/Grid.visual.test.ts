import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Grid Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=components-atoms-layout-grid'

  test.describe('Basic Grid States', () => {
    test('renders basic grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'basic')
    })

    test('renders auto columns grid', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'auto-columns')
    })

    test('renders empty grid', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'empty')
    })

    test('renders single item grid', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'single-item')
    })
  })

  test.describe('Column Configurations', () => {
    test('renders 1 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--1-column`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '1-column')
    })

    test('renders 2 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--2-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '2-columns')
    })

    test('renders 3 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--3-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '3-columns')
    })

    test('renders 4 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--4-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '4-columns')
    })

    test('renders 6 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--6-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '6-columns')
    })

    test('renders 12 column grid', async ({ page }) => {
      await page.goto(`${baseUrl}--12-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '12-columns')
    })

    test('compares all column counts', async ({ page }) => {
      await page.goto(`${baseUrl}--column-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'column-comparison')
    })
  })

  test.describe('Row Configurations', () => {
    test('renders with fixed row count', async ({ page }) => {
      await page.goto(`${baseUrl}--fixed-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'fixed-rows')
    })

    test('renders 2 row grid', async ({ page }) => {
      await page.goto(`${baseUrl}--2-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '2-rows')
    })

    test('renders 3 row grid', async ({ page }) => {
      await page.goto(`${baseUrl}--3-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '3-rows')
    })

    test('renders auto rows grid', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-rows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'auto-rows')
    })

    test('renders mixed row heights', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-row-heights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'mixed-row-heights')
    })
  })

  test.describe('Gap Variations', () => {
    test('renders with no gap', async ({ page }) => {
      await page.goto(`${baseUrl}--no-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'no-gap')
    })

    test('renders with xs gap', async ({ page }) => {
      await page.goto(`${baseUrl}--xs-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'xs-gap')
    })

    test('renders with sm gap', async ({ page }) => {
      await page.goto(`${baseUrl}--sm-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'sm-gap')
    })

    test('renders with md gap', async ({ page }) => {
      await page.goto(`${baseUrl}--md-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'md-gap')
    })

    test('renders with lg gap', async ({ page }) => {
      await page.goto(`${baseUrl}--lg-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'lg-gap')
    })

    test('renders with xl gap', async ({ page }) => {
      await page.goto(`${baseUrl}--xl-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'xl-gap')
    })

    test('renders with 2xl gap', async ({ page }) => {
      await page.goto(`${baseUrl}--2xl-gap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', '2xl-gap')
    })

    test('compares all gap sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--gap-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'gap-comparison')
    })
  })

  test.describe('Alignment Options', () => {
    test('renders with start alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-start`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'align-start')
    })

    test('renders with center alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'align-center')
    })

    test('renders with end alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-end`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'align-end')
    })

    test('renders with stretch alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-stretch`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'align-stretch')
    })

    test('compares all alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--alignment-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'alignment-comparison')
    })
  })

  test.describe('Justify Options', () => {
    test('renders with start justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-start`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-start')
    })

    test('renders with center justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-center')
    })

    test('renders with end justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-end`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-end')
    })

    test('renders with between justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-between`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-between')
    })

    test('renders with around justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-around`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-around')
    })

    test('renders with evenly justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-evenly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-evenly')
    })

    test('compares all justify options', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'justify-comparison')
    })
  })

  test.describe('GridItem Component', () => {
    test('renders basic grid items', async ({ page }) => {
      await page.goto(`${baseUrl}--basic-grid-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'basic-grid-items')
    })

    test('renders grid items with column spans', async ({ page }) => {
      await page.goto(`${baseUrl}--column-spans`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'column-spans')
    })

    test('renders grid items with row spans', async ({ page }) => {
      await page.goto(`${baseUrl}--row-spans`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'row-spans')
    })

    test('renders full span grid items', async ({ page }) => {
      await page.goto(`${baseUrl}--full-spans`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'full-spans')
    })

    test('renders auto grid items', async ({ page }) => {
      await page.goto(`${baseUrl}--auto-grid-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'auto-grid-items')
    })

    test('renders complex grid item layout', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-grid-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'complex-grid-items')
    })
  })

  test.describe('Content Variations', () => {
    test('renders with text content', async ({ page }) => {
      await page.goto(`${baseUrl}--text-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'text-content')
    })

    test('renders with image content', async ({ page }) => {
      await page.goto(`${baseUrl}--image-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'image-content')
    })

    test('renders with card content', async ({ page }) => {
      await page.goto(`${baseUrl}--card-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'card-content')
    })

    test('renders with mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'mixed-content')
    })

    test('renders with varying content heights', async ({ page }) => {
      await page.goto(`${baseUrl}--varying-heights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'varying-heights')
    })

    test('renders with long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'long-content')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'grid-responsive')
    })

    test('shows mobile grid layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--responsive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'responsive-mobile')
    })

    test('shows tablet grid layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--responsive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'responsive-tablet')
    })

    test('shows desktop grid layout', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 })
      await page.goto(`${baseUrl}--responsive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'responsive-desktop')
    })

    test('shows adaptive column counts', async ({ page }) => {
      await page.goto(`${baseUrl}--adaptive-columns`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'adaptive-columns')
    })

    test('shows responsive gap behavior', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-gaps`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'responsive-gaps')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'grid-color-modes')
    })

    test('shows grid with content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--card-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'dark-mode-content')
    })

    test('shows gap visualization in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--gap-comparison`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'dark-mode-gaps')
    })

    test('shows grid items in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-grid-items`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'dark-mode-grid-items')
    })
  })

  test.describe('Layout Patterns', () => {
    test('renders dashboard grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--dashboard-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'dashboard-layout')
    })

    test('renders gallery grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--gallery-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'gallery-layout')
    })

    test('renders product grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--product-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'product-grid')
    })

    test('renders blog grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--blog-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'blog-grid')
    })

    test('renders sidebar grid layout', async ({ page }) => {
      await page.goto(`${baseUrl}--sidebar-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'sidebar-layout')
    })

    test('renders masonry-style grid', async ({ page }) => {
      await page.goto(`${baseUrl}--masonry-style`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'masonry-style')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-many-items')
    })

    test('renders with nested grids', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-grids`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-nested-grids')
    })

    test('renders with minimal space', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-minimal-space')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-custom-styling')
    })

    test('renders with overflow content', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-overflow-content')
    })

    test('renders with grid areas', async ({ page }) => {
      await page.goto(`${baseUrl}--grid-areas`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'grid', 'edge-grid-areas')
    })
  })
})