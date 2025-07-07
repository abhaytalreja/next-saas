import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Stack Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=components-atoms-layout-stack'

  test.describe('Basic Stack States', () => {
    test('renders basic vertical stack', async ({ page }) => {
      await page.goto(`${baseUrl}--basic-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'basic-vertical')
    })

    test('renders basic horizontal stack', async ({ page }) => {
      await page.goto(`${baseUrl}--basic-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'basic-horizontal')
    })

    test('renders empty stack', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'empty')
    })

    test('renders single item stack', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'single-item')
    })
  })

  test.describe('Direction Variations', () => {
    test('renders vertical stack', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vertical')
    })

    test('renders horizontal stack', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'horizontal')
    })

    test('renders vertical reverse stack', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-reverse`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vertical-reverse')
    })

    test('renders horizontal reverse stack', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-reverse`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'horizontal-reverse')
    })

    test('compares all directions', async ({ page }) => {
      await page.goto(`${baseUrl}--direction-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'direction-comparison')
    })
  })

  test.describe('Spacing Variations', () => {
    test('renders with no spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--no-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'no-spacing')
    })

    test('renders with xs spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--xs-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'xs-spacing')
    })

    test('renders with sm spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--sm-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'sm-spacing')
    })

    test('renders with md spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--md-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'md-spacing')
    })

    test('renders with lg spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--lg-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'lg-spacing')
    })

    test('renders with xl spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--xl-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'xl-spacing')
    })

    test('renders with 2xl spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--2xl-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', '2xl-spacing')
    })

    test('compares vertical spacing sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vertical-spacing-comparison')
    })

    test('compares horizontal spacing sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'horizontal-spacing-comparison')
    })
  })

  test.describe('Alignment Options', () => {
    test('renders with start alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-start`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'align-start')
    })

    test('renders with center alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'align-center')
    })

    test('renders with end alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-end`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'align-end')
    })

    test('renders with stretch alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-stretch`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'align-stretch')
    })

    test('renders with baseline alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-baseline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'align-baseline')
    })

    test('compares vertical alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical-alignment-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vertical-alignment-comparison')
    })

    test('compares horizontal alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal-alignment-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'horizontal-alignment-comparison')
    })
  })

  test.describe('Justify Options', () => {
    test('renders with start justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-start`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-start')
    })

    test('renders with center justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-center')
    })

    test('renders with end justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-end`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-end')
    })

    test('renders with between justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-between`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-between')
    })

    test('renders with around justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-around`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-around')
    })

    test('renders with evenly justify', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-evenly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-evenly')
    })

    test('compares justify options', async ({ page }) => {
      await page.goto(`${baseUrl}--justify-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'justify-comparison')
    })
  })

  test.describe('Wrap Options', () => {
    test('renders without wrap', async ({ page }) => {
      await page.goto(`${baseUrl}--no-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'no-wrap')
    })

    test('renders with wrap', async ({ page }) => {
      await page.goto(`${baseUrl}--with-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'with-wrap')
    })

    test('shows wrap behavior with many items', async ({ page }) => {
      await page.goto(`${baseUrl}--wrap-many-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'wrap-many-items')
    })

    test('compares wrap vs no-wrap', async ({ page }) => {
      await page.goto(`${baseUrl}--wrap-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'wrap-comparison')
    })
  })

  test.describe('HStack Component', () => {
    test('renders basic HStack', async ({ page }) => {
      await page.goto(`${baseUrl}--hstack-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'hstack-basic')
    })

    test('renders HStack with different spacings', async ({ page }) => {
      await page.goto(`${baseUrl}--hstack-spacings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'hstack-spacings')
    })

    test('renders HStack with alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--hstack-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'hstack-alignments')
    })

    test('renders HStack with justify options', async ({ page }) => {
      await page.goto(`${baseUrl}--hstack-justify`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'hstack-justify')
    })

    test('renders HStack with wrap', async ({ page }) => {
      await page.goto(`${baseUrl}--hstack-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'hstack-wrap')
    })
  })

  test.describe('VStack Component', () => {
    test('renders basic VStack', async ({ page }) => {
      await page.goto(`${baseUrl}--vstack-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vstack-basic')
    })

    test('renders VStack with different spacings', async ({ page }) => {
      await page.goto(`${baseUrl}--vstack-spacings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vstack-spacings')
    })

    test('renders VStack with alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--vstack-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vstack-alignments')
    })

    test('renders VStack with justify options', async ({ page }) => {
      await page.goto(`${baseUrl}--vstack-justify`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vstack-justify')
    })

    test('renders VStack with reverse', async ({ page }) => {
      await page.goto(`${baseUrl}--vstack-reverse`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'vstack-reverse')
    })
  })

  test.describe('Content Variations', () => {
    test('renders with text content', async ({ page }) => {
      await page.goto(`${baseUrl}--text-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'text-content')
    })

    test('renders with button content', async ({ page }) => {
      await page.goto(`${baseUrl}--button-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'button-content')
    })

    test('renders with card content', async ({ page }) => {
      await page.goto(`${baseUrl}--card-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'card-content')
    })

    test('renders with input content', async ({ page }) => {
      await page.goto(`${baseUrl}--input-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'input-content')
    })

    test('renders with mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'mixed-content')
    })

    test('renders with varying content sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--varying-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'varying-sizes')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders nested stacks', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-stacks`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'nested-stacks')
    })

    test('renders form layout', async ({ page }) => {
      await page.goto(`${baseUrl}--form-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'form-layout')
    })

    test('renders sidebar layout', async ({ page }) => {
      await page.goto(`${baseUrl}--sidebar-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'sidebar-layout')
    })

    test('renders header layout', async ({ page }) => {
      await page.goto(`${baseUrl}--header-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'header-layout')
    })

    test('renders dashboard layout', async ({ page }) => {
      await page.goto(`${baseUrl}--dashboard-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'dashboard-layout')
    })

    test('renders toolbar layout', async ({ page }) => {
      await page.goto(`${baseUrl}--toolbar-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'toolbar-layout')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'stack-responsive')
    })

    test('shows mobile stack layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--responsive-direction`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'responsive-mobile')
    })

    test('shows tablet stack layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--responsive-direction`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'responsive-tablet')
    })

    test('shows responsive wrap behavior', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'responsive-wrap')
    })

    test('shows adaptive spacing', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'responsive-spacing')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic-vertical`, 'stack-color-modes')
    })

    test('shows content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--card-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'dark-mode-content')
    })

    test('shows buttons in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--button-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'dark-mode-buttons')
    })

    test('shows form in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--form-layout`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'dark-mode-form')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-many-items')
    })

    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-long-content')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-custom-styling')
    })

    test('renders with overflow content', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-overflow-content')
    })

    test('renders with minimal space', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-minimal-space')
    })

    test('renders deeply nested stacks', async ({ page }) => {
      await page.goto(`${baseUrl}--deeply-nested`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'stack', 'edge-deeply-nested')
    })
  })
})