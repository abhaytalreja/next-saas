import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('Divider Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-dividers-divider'

  test.describe('Divider Orientations', () => {
    test('renders horizontal divider', async ({ page }) => {
      await page.goto(`${baseUrl}--horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'orientation-horizontal')
    })

    test('renders vertical divider', async ({ page }) => {
      await page.goto(`${baseUrl}--vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'orientation-vertical')
    })

    test('compares all orientations', async ({ page }) => {
      await page.goto(`${baseUrl}--all-orientations`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'orientation-comparison')
    })
  })

  test.describe('Divider Variants', () => {
    test('renders default divider', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-default')
    })

    test('renders solid divider', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-solid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-solid')
    })

    test('renders dashed divider', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-dashed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-dashed')
    })

    test('renders dotted divider', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-dotted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-dotted')
    })

    test('renders double divider', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-double`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-double')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'variant-comparison')
    })
  })

  test.describe('Divider Sizes', () => {
    test('renders thin divider', async ({ page }) => {
      await page.goto(`${baseUrl}--size-thin`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'size-thin')
    })

    test('renders default divider', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'size-default')
    })

    test('renders thick divider', async ({ page }) => {
      await page.goto(`${baseUrl}--size-thick`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'size-thick')
    })

    test('renders extra thick divider', async ({ page }) => {
      await page.goto(`${baseUrl}--size-extra-thick`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'size-extra-thick')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'size-comparison')
    })
  })

  test.describe('Divider Colors', () => {
    test('renders default color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-default')
    })

    test('renders subtle color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-subtle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-subtle')
    })

    test('renders strong color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-strong`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-strong')
    })

    test('renders primary color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-primary')
    })

    test('renders success color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-success')
    })

    test('renders warning color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-warning')
    })

    test('renders error color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-error')
    })

    test('compares all colors', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'color-comparison')
    })
  })

  test.describe('Divider with Content', () => {
    test('renders divider with text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'content-text')
    })

    test('renders divider with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'content-icon')
    })

    test('renders divider with badge', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badge`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'content-badge')
    })

    test('renders divider with custom content', async ({ page }) => {
      await page.goto(`${baseUrl}--with-custom-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'content-custom')
    })

    test('compares content alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--content-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'content-alignments')
    })
  })

  test.describe('Content Positions', () => {
    test('renders content left aligned', async ({ page }) => {
      await page.goto(`${baseUrl}--content-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'position-left')
    })

    test('renders content center aligned', async ({ page }) => {
      await page.goto(`${baseUrl}--content-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'position-center')
    })

    test('renders content right aligned', async ({ page }) => {
      await page.goto(`${baseUrl}--content-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'position-right')
    })

    test('compares all positions', async ({ page }) => {
      await page.goto(`${baseUrl}--all-positions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'position-comparison')
    })
  })

  test.describe('Section Dividers', () => {
    test('renders section divider', async ({ page }) => {
      await page.goto(`${baseUrl}--section-divider`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'section-divider')
    })

    test('renders page divider', async ({ page }) => {
      await page.goto(`${baseUrl}--page-divider`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'section-page')
    })

    test('renders content divider', async ({ page }) => {
      await page.goto(`${baseUrl}--content-divider`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'section-content')
    })

    test('renders card divider', async ({ page }) => {
      await page.goto(`${baseUrl}--card-divider`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'section-card')
    })

    test('renders list divider', async ({ page }) => {
      await page.goto(`${baseUrl}--list-divider`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'section-list')
    })
  })

  test.describe('Layout Contexts', () => {
    test('renders in article layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-article`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-article')
    })

    test('renders in sidebar layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-sidebar')
    })

    test('renders in form layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-form')
    })

    test('renders in navigation layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-navigation')
    })

    test('renders in dashboard layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-dashboard`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-dashboard')
    })

    test('renders in modal layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'context-modal')
    })
  })

  test.describe('Spacing Variations', () => {
    test('renders with no spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-none`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-none')
    })

    test('renders with small spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-small')
    })

    test('renders with medium spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-medium')
    })

    test('renders with large spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-large')
    })

    test('renders with extra large spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-extra-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-extra-large')
    })

    test('compares all spacing options', async ({ page }) => {
      await page.goto(`${baseUrl}--all-spacing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'spacing-comparison')
    })
  })

  test.describe('Decorative Elements', () => {
    test('renders ornamental divider', async ({ page }) => {
      await page.goto(`${baseUrl}--ornamental`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'decorative-ornamental')
    })

    test('renders gradient divider', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'decorative-gradient')
    })

    test('renders shadow divider', async ({ page }) => {
      await page.goto(`${baseUrl}--shadow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'decorative-shadow')
    })

    test('renders animated divider', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'divider', 'decorative-animated')
    })

    test('renders patterned divider', async ({ page }) => {
      await page.goto(`${baseUrl}--patterned`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'decorative-patterned')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'divider-responsive')
    })

    test('shows mobile divider behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'responsive-mobile')
    })

    test('shows tablet divider behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'responsive-tablet')
    })

    test('shows adaptive divider styles', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'responsive-adaptive')
    })

    test('shows responsive vertical dividers', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'responsive-vertical')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'divider-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'dark-mode-contrast')
    })

    test('shows content dividers in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--content-alignments`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'dark-mode-content')
    })

    test('shows decorative dividers in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'dark-mode-decorative')
    })
  })

  test.describe('Accessibility', () => {
    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'accessibility-contrast')
    })

    test('shows semantic dividers', async ({ page }) => {
      await page.goto(`${baseUrl}--semantic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'accessibility-semantic')
    })

    test('shows decorative dividers', async ({ page }) => {
      await page.goto(`${baseUrl}--decorative`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'accessibility-decorative')
    })

    test('shows role attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--role-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'accessibility-roles')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with zero width', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-zero-width')
    })

    test('renders with zero height', async ({ page }) => {
      await page.goto(`${baseUrl}--zero-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-zero-height')
    })

    test('renders with very long content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-long-content')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-special-chars')
    })

    test('renders with custom attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-custom-attributes')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'divider', 'edge-constrained')
    })
  })
})