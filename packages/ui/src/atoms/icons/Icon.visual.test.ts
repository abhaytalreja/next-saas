import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('Icon Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-icons-icon'

  test.describe('Icon Sizes', () => {
    test('renders extra small icon', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-xs')
    })

    test('renders small icon', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-sm')
    })

    test('renders medium icon', async ({ page }) => {
      await page.goto(`${baseUrl}--size-md`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-md')
    })

    test('renders large icon', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-lg')
    })

    test('renders extra large icon', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-xl')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'size-comparison')
    })
  })

  test.describe('Icon Variants', () => {
    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-default')
    })

    test('renders muted variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-muted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-muted')
    })

    test('renders destructive variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-destructive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-destructive')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-success')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-warning')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'variant-comparison')
    })
  })

  test.describe('Common Icons', () => {
    test('renders action icons', async ({ page }) => {
      await page.goto(`${baseUrl}--action-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-actions')
    })

    test('renders navigation icons', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-navigation')
    })

    test('renders status icons', async ({ page }) => {
      await page.goto(`${baseUrl}--status-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-status')
    })

    test('renders ui icons', async ({ page }) => {
      await page.goto(`${baseUrl}--ui-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-ui')
    })

    test('renders social icons', async ({ page }) => {
      await page.goto(`${baseUrl}--social-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-social')
    })

    test('renders media icons', async ({ page }) => {
      await page.goto(`${baseUrl}--media-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'common-media')
    })
  })

  test.describe('Icon Usage Contexts', () => {
    test('renders icons in buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--in-buttons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-buttons')
    })

    test('renders icons in inputs', async ({ page }) => {
      await page.goto(`${baseUrl}--in-inputs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-inputs')
    })

    test('renders icons in cards', async ({ page }) => {
      await page.goto(`${baseUrl}--in-cards`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-cards')
    })

    test('renders icons in lists', async ({ page }) => {
      await page.goto(`${baseUrl}--in-lists`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-lists')
    })

    test('renders icons in navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-navigation')
    })

    test('renders icons in alerts', async ({ page }) => {
      await page.goto(`${baseUrl}--in-alerts`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'context-alerts')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.icon-interactive:first-child')
      await takeComponentScreenshot(page, 'icon', 'interactive-hover')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--focusable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon', 'interactive-focus')
    })

    test('shows active states', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.icon-clickable:first-child')
      await takeComponentScreenshot(page, 'icon', 'interactive-active')
    })

    test('shows disabled states', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'interactive-disabled')
    })

    test('shows selected states', async ({ page }) => {
      await page.goto(`${baseUrl}--selectable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'interactive-selected')
    })
  })

  test.describe('Icon Combinations', () => {
    test('renders icon pairs', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-pairs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'combinations-pairs')
    })

    test('renders icon with text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'combinations-with-text')
    })

    test('renders icon with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'combinations-with-badges')
    })

    test('renders icon grids', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'combinations-grid')
    })

    test('renders icon groups', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'combinations-groups')
    })
  })

  test.describe('Icon Animations', () => {
    test('shows spin animation', async ({ page }) => {
      await page.goto(`${baseUrl}--spin-animation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'icon', 'animation-spin')
    })

    test('shows pulse animation', async ({ page }) => {
      await page.goto(`${baseUrl}--pulse-animation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'icon', 'animation-pulse')
    })

    test('shows bounce animation', async ({ page }) => {
      await page.goto(`${baseUrl}--bounce-animation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'icon', 'animation-bounce')
    })

    test('shows fade animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fade-animation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'icon', 'animation-fade')
    })

    test('shows scale animation', async ({ page }) => {
      await page.goto(`${baseUrl}--scale-animation`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'icon', 'animation-scale')
    })
  })

  test.describe('Custom Styling', () => {
    test('renders with custom colors', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'style-custom-colors')
    })

    test('renders with gradients', async ({ page }) => {
      await page.goto(`${baseUrl}--gradients`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'style-gradients')
    })

    test('renders with backgrounds', async ({ page }) => {
      await page.goto(`${baseUrl}--with-backgrounds`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'style-backgrounds')
    })

    test('renders with borders', async ({ page }) => {
      await page.goto(`${baseUrl}--with-borders`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'style-borders')
    })

    test('renders with shadows', async ({ page }) => {
      await page.goto(`${baseUrl}--with-shadows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'style-shadows')
    })
  })

  test.describe('Icon Categories', () => {
    test('renders file icons', async ({ page }) => {
      await page.goto(`${baseUrl}--file-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-files')
    })

    test('renders communication icons', async ({ page }) => {
      await page.goto(`${baseUrl}--communication-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-communication')
    })

    test('renders weather icons', async ({ page }) => {
      await page.goto(`${baseUrl}--weather-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-weather')
    })

    test('renders business icons', async ({ page }) => {
      await page.goto(`${baseUrl}--business-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-business')
    })

    test('renders technology icons', async ({ page }) => {
      await page.goto(`${baseUrl}--technology-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-technology')
    })

    test('renders shopping icons', async ({ page }) => {
      await page.goto(`${baseUrl}--shopping-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'category-shopping')
    })
  })

  test.describe('Icon Layouts', () => {
    test('renders inline icons', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'layout-inline')
    })

    test('renders stacked icons', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'layout-stacked')
    })

    test('renders centered icons', async ({ page }) => {
      await page.goto(`${baseUrl}--centered-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'layout-centered')
    })

    test('renders floating icons', async ({ page }) => {
      await page.goto(`${baseUrl}--floating-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'layout-floating')
    })

    test('renders overlapping icons', async ({ page }) => {
      await page.goto(`${baseUrl}--overlapping-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'layout-overlapping')
    })
  })

  test.describe('Icon States', () => {
    test('renders loading icons', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'state-loading')
    })

    test('renders error icons', async ({ page }) => {
      await page.goto(`${baseUrl}--error-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'state-error')
    })

    test('renders success icons', async ({ page }) => {
      await page.goto(`${baseUrl}--success-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'state-success')
    })

    test('renders warning icons', async ({ page }) => {
      await page.goto(`${baseUrl}--warning-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'state-warning')
    })

    test('renders info icons', async ({ page }) => {
      await page.goto(`${baseUrl}--info-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'state-info')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'icon-responsive')
    })

    test('shows mobile icon sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'responsive-mobile')
    })

    test('shows tablet icon sizes', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'responsive-tablet')
    })

    test('shows adaptive icon scaling', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-scaling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'icon-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--in-buttons`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'dark-mode-contrast')
    })

    test('shows status icons in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--status-icons`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'dark-mode-status')
    })

    test('shows custom colors in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-colors`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'dark-mode-custom')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon', 'accessibility-focus')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'accessibility-screen-reader')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'icon', 'accessibility-keyboard')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'accessibility-contrast')
    })

    test('shows decorative vs meaningful icons', async ({ page }) => {
      await page.goto(`${baseUrl}--decorative-meaningful`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'accessibility-decorative')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very large size', async ({ page }) => {
      await page.goto(`${baseUrl}--very-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-very-large')
    })

    test('renders with very small size', async ({ page }) => {
      await page.goto(`${baseUrl}--very-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-very-small')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-custom-class')
    })

    test('renders with stroke variations', async ({ page }) => {
      await page.goto(`${baseUrl}--stroke-variations`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-stroke-variations')
    })

    test('renders with fill variations', async ({ page }) => {
      await page.goto(`${baseUrl}--fill-variations`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-fill-variations')
    })

    test('renders high density icon sets', async ({ page }) => {
      await page.goto(`${baseUrl}--high-density`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'icon', 'edge-high-density')
    })
  })
})