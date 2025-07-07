import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Section Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=components-atoms-layout-section'

  test.describe('Basic Section States', () => {
    test('renders basic section', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'basic')
    })

    test('renders empty section', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'empty')
    })

    test('renders section with minimal content', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'minimal-content')
    })

    test('renders section with rich content', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'rich-content')
    })
  })

  test.describe('Spacing Variations', () => {
    test('renders with no spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--no-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'no-spacing')
    })

    test('renders with sm spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--sm-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'sm-spacing')
    })

    test('renders with md spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--md-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'md-spacing')
    })

    test('renders with lg spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--lg-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'lg-spacing')
    })

    test('renders with xl spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--xl-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'xl-spacing')
    })

    test('renders with 2xl spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--2xl-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', '2xl-spacing')
    })

    test('compares all spacing sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'spacing-comparison')
    })
  })

  test.describe('Background Variations', () => {
    test('renders with default background', async ({ page }) => {
      await page.goto(`${baseUrl}--default-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'default-background')
    })

    test('renders with muted background', async ({ page }) => {
      await page.goto(`${baseUrl}--muted-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'muted-background')
    })

    test('renders with subtle background', async ({ page }) => {
      await page.goto(`${baseUrl}--subtle-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'subtle-background')
    })

    test('renders with canvas background', async ({ page }) => {
      await page.goto(`${baseUrl}--canvas-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'canvas-background')
    })

    test('renders with accent background', async ({ page }) => {
      await page.goto(`${baseUrl}--accent-background`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'accent-background')
    })

    test('compares all background variants', async ({ page }) => {
      await page.goto(`${baseUrl}--background-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'background-comparison')
    })
  })

  test.describe('Full Height Sections', () => {
    test('renders full height section', async ({ page }) => {
      await page.goto(`${baseUrl}--full-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'full-height')
    })

    test('renders regular height section', async ({ page }) => {
      await page.goto(`${baseUrl}--regular-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'regular-height')
    })

    test('compares height variants', async ({ page }) => {
      await page.goto(`${baseUrl}--height-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'height-comparison')
    })
  })

  test.describe('HeroSection Component', () => {
    test('renders basic hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-basic')
    })

    test('renders sm hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-sm')
    })

    test('renders md hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-md`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-md')
    })

    test('renders lg hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-lg')
    })

    test('renders xl hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-xl')
    })

    test('renders full hero section', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-full`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-full')
    })

    test('renders hero with background image', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-background-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-background-image')
    })

    test('renders hero with overlay', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-overlay`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-overlay')
    })

    test('renders hero with different overlay opacity', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-overlay-opacity`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-overlay-opacity')
    })

    test('compares all hero sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-size-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'hero-size-comparison')
    })
  })

  test.describe('PageHeader Component', () => {
    test('renders basic page header', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-basic')
    })

    test('renders page header with description', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-description')
    })

    test('renders page header with breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-breadcrumb`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-breadcrumb')
    })

    test('renders page header with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-actions')
    })

    test('renders complete page header', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-complete`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-complete')
    })

    test('renders page header with long title', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-long-title`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-long-title')
    })

    test('renders page header with multiple actions', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-multiple-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'page-header-multiple-actions')
    })
  })

  test.describe('Content Patterns', () => {
    test('renders with text content', async ({ page }) => {
      await page.goto(`${baseUrl}--text-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'text-content')
    })

    test('renders with grid content', async ({ page }) => {
      await page.goto(`${baseUrl}--grid-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'grid-content')
    })

    test('renders with card content', async ({ page }) => {
      await page.goto(`${baseUrl}--card-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'card-content')
    })

    test('renders with form content', async ({ page }) => {
      await page.goto(`${baseUrl}--form-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'form-content')
    })

    test('renders with image content', async ({ page }) => {
      await page.goto(`${baseUrl}--image-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'image-content')
    })

    test('renders with mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'mixed-content')
    })
  })

  test.describe('Layout Combinations', () => {
    test('renders stacked sections', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'stacked-sections')
    })

    test('renders alternating backgrounds', async ({ page }) => {
      await page.goto(`${baseUrl}--alternating-backgrounds`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'alternating-backgrounds')
    })

    test('renders with different spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--varied-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'varied-spacing')
    })

    test('renders landing page layout', async ({ page }) => {
      await page.goto(`${baseUrl}--landing-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'landing-page')
    })

    test('renders dashboard sections', async ({ page }) => {
      await page.goto(`${baseUrl}--dashboard-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'dashboard-sections')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'section-responsive')
    })

    test('shows mobile section layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--responsive-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'responsive-mobile')
    })

    test('shows tablet section layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--responsive-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'responsive-tablet')
    })

    test('shows responsive spacing', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'responsive-spacing')
    })

    test('shows responsive hero section', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--hero-responsive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'responsive-hero')
    })

    test('shows responsive page header', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 })
      await page.goto(`${baseUrl}--page-header-responsive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'responsive-page-header')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'section-color-modes')
    })

    test('shows all backgrounds in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--background-comparison`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'dark-mode-backgrounds')
    })

    test('shows hero section in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--hero-overlay`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'dark-mode-hero')
    })

    test('shows page header in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--page-header-complete`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'dark-mode-page-header')
    })

    test('shows content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'dark-mode-content')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-long-content')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-custom-styling')
    })

    test('renders with nested sections', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-nested-sections')
    })

    test('renders with overflow content', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-overflow-content')
    })

    test('renders with minimal height', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-minimal-height')
    })

    test('renders with many stacked sections', async ({ page }) => {
      await page.goto(`${baseUrl}--many-sections`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'section', 'edge-many-sections')
    })
  })
})