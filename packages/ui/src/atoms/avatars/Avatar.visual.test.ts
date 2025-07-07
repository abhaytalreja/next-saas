import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Avatar Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-avatars-avatar'

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'all-sizes')
    })

    test('renders extra small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-xs')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-sm')
    })

    test('renders default size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-default')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-lg')
    })

    test('renders extra large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-xl')
    })

    test('renders 2xl size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-2xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'size-2xl')
    })
  })

  test.describe('With Images', () => {
    test('renders with valid image', async ({ page }) => {
      await page.goto(`${baseUrl}--with-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'with-image')
    })

    test('renders with loading image', async ({ page }) => {
      await page.goto(`${baseUrl}--loading-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'loading-image')
    })

    test('renders with broken image fallback', async ({ page }) => {
      await page.goto(`${baseUrl}--broken-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'broken-image-fallback')
    })

    test('renders different image aspect ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--image-aspect-ratios`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'image-aspect-ratios')
    })
  })

  test.describe('Fallbacks', () => {
    test('renders with text fallback', async ({ page }) => {
      await page.goto(`${baseUrl}--text-fallback`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'text-fallback')
    })

    test('renders with initials', async ({ page }) => {
      await page.goto(`${baseUrl}--initials`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'initials')
    })

    test('renders with icon fallback', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-fallback`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'icon-fallback')
    })

    test('renders with custom fallback', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-fallback`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'custom-fallback')
    })

    test('renders empty fallback', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-fallback`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'empty-fallback')
    })
  })

  test.describe('Groups', () => {
    test('renders avatar group', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'group-basic')
    })

    test('renders overlapping avatar group', async ({ page }) => {
      await page.goto(`${baseUrl}--overlapping-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'group-overlapping')
    })

    test('renders group with overflow count', async ({ page }) => {
      await page.goto(`${baseUrl}--group-overflow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'group-overflow')
    })

    test('renders stacked group', async ({ page }) => {
      await page.goto(`${baseUrl}--stacked-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'group-stacked')
    })

    test('renders group with different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--group-mixed-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'group-mixed-sizes')
    })
  })

  test.describe('States', () => {
    test('renders online status', async ({ page }) => {
      await page.goto(`${baseUrl}--status-online`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'status-online')
    })

    test('renders offline status', async ({ page }) => {
      await page.goto(`${baseUrl}--status-offline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'status-offline')
    })

    test('renders busy status', async ({ page }) => {
      await page.goto(`${baseUrl}--status-busy`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'status-busy')
    })

    test('renders away status', async ({ page }) => {
      await page.goto(`${baseUrl}--status-away`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'status-away')
    })

    test('renders with notification badge', async ({ page }) => {
      await page.goto(`${baseUrl}--notification-badge`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'notification-badge')
    })
  })

  test.describe('Interactive', () => {
    test('renders clickable avatar', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'interactive-default')
    })

    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.avatar-clickable')
      await takeComponentScreenshot(page, 'avatar', 'interactive-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'avatar', 'interactive-focus')
    })

    test('shows pressed state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.locator('.avatar-clickable').evaluate(el => el.classList.add('pressed'))
      await takeComponentScreenshot(page, 'avatar', 'interactive-pressed')
    })

    test('renders with tooltip', async ({ page }) => {
      await page.goto(`${baseUrl}--with-tooltip`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.avatar-with-tooltip')
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'avatar', 'interactive-tooltip')
    })
  })

  test.describe('Variants', () => {
    test('renders square variant', async ({ page }) => {
      await page.goto(`${baseUrl}--square`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'variant-square')
    })

    test('renders rounded variant', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'variant-rounded')
    })

    test('renders with border', async ({ page }) => {
      await page.goto(`${baseUrl}--with-border`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'variant-bordered')
    })

    test('renders with shadow', async ({ page }) => {
      await page.goto(`${baseUrl}--with-shadow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'variant-shadow')
    })

    test('renders gradient background', async ({ page }) => {
      await page.goto(`${baseUrl}--gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'variant-gradient')
    })
  })

  test.describe('Content Types', () => {
    test('renders with emoji', async ({ page }) => {
      await page.goto(`${baseUrl}--emoji`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'content-emoji')
    })

    test('renders with number', async ({ page }) => {
      await page.goto(`${baseUrl}--number`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'content-number')
    })

    test('renders with logo', async ({ page }) => {
      await page.goto(`${baseUrl}--logo`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'content-logo')
    })

    test('renders with pattern', async ({ page }) => {
      await page.goto(`${baseUrl}--pattern`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'content-pattern')
    })
  })

  test.describe('Special Cases', () => {
    test('renders loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'special-loading')
    })

    test('renders placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'special-placeholder')
    })

    test('renders with very long text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'special-long-text')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-chars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'special-characters')
    })

    test('renders animated avatar', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'special-animated')
    })
  })

  test.describe('Layouts', () => {
    test('renders in list layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'layout-list')
    })

    test('renders in card layout', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'layout-card')
    })

    test('renders in navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'layout-navigation')
    })

    test('renders in comment thread', async ({ page }) => {
      await page.goto(`${baseUrl}--comment-thread`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'layout-comments')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'avatar-responsive')
    })

    test('shows mobile avatar sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'responsive-mobile')
    })

    test('shows tablet avatar layouts', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'responsive-tablet')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-sizes`, 'avatar-color-modes')
    })

    test('shows fallbacks in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--text-fallback`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'dark-mode-fallback')
    })

    test('shows groups in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-group`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'dark-mode-group')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-border`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'dark-mode-contrast')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'avatar', 'accessibility-focus')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'accessibility-contrast')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'accessibility-high-contrast')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders without any props', async ({ page }) => {
      await page.goto(`${baseUrl}--no-props`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'edge-no-props')
    })

    test('renders with invalid image src', async ({ page }) => {
      await page.goto(`${baseUrl}--invalid-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'edge-invalid-image')
    })

    test('renders with very small content', async ({ page }) => {
      await page.goto(`${baseUrl}--tiny-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'edge-tiny-content')
    })

    test('renders with Unicode characters', async ({ page }) => {
      await page.goto(`${baseUrl}--unicode`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'avatar', 'edge-unicode')
    })
  })
})