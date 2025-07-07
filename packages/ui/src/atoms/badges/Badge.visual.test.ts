import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Badge Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-badges-badge'

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-default')
    })

    test('renders secondary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-secondary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-secondary')
    })

    test('renders destructive variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-destructive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-destructive')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-success')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-warning')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-outline')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'variant-ghost')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'size-small')
    })

    test('renders default size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'size-default')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'size-large')
    })
  })

  test.describe('Content Types', () => {
    test('renders with text', async ({ page }) => {
      await page.goto(`${baseUrl}--text-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-text')
    })

    test('renders with numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--number-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-numbers')
    })

    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-icons')
    })

    test('renders with emoji', async ({ page }) => {
      await page.goto(`${baseUrl}--emoji-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-emoji')
    })

    test('renders with long text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-long-text')
    })

    test('renders empty badge', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'content-empty')
    })
  })

  test.describe('Removable Badges', () => {
    test('renders removable badge', async ({ page }) => {
      await page.goto(`${baseUrl}--removable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'removable-default')
    })

    test('shows remove button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--removable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button[aria-label="Remove"]')
      await takeComponentScreenshot(page, 'badge', 'removable-hover')
    })

    test('shows remove button focus', async ({ page }) => {
      await page.goto(`${baseUrl}--removable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'badge', 'removable-focus')
    })

    test('renders removable with different variants', async ({ page }) => {
      await page.goto(`${baseUrl}--removable-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'removable-variants')
    })

    test('shows removal animation', async ({ page }) => {
      await page.goto(`${baseUrl}--removal-animation`)
      await page.waitForLoadState('networkidle')
      
      // Click remove button
      await page.click('button[aria-label="Remove"]')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'badge', 'removable-animation')
    })
  })

  test.describe('Interactive States', () => {
    test('renders clickable badges', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'interactive-default')
    })

    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.badge-clickable')
      await takeComponentScreenshot(page, 'badge', 'interactive-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'badge', 'interactive-focus')
    })

    test('shows active state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.locator('.badge-clickable').evaluate(el => el.classList.add('active'))
      await takeComponentScreenshot(page, 'badge', 'interactive-active')
    })

    test('shows disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'interactive-disabled')
    })
  })

  test.describe('Grouped Badges', () => {
    test('renders badge group', async ({ page }) => {
      await page.goto(`${baseUrl}--badge-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'group-basic')
    })

    test('renders spaced badge group', async ({ page }) => {
      await page.goto(`${baseUrl}--spaced-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'group-spaced')
    })

    test('renders connected badge group', async ({ page }) => {
      await page.goto(`${baseUrl}--connected-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'group-connected')
    })

    test('renders mixed variant group', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'group-mixed')
    })

    test('renders wrapped badge group', async ({ page }) => {
      await page.goto(`${baseUrl}--wrapped-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'group-wrapped')
    })
  })

  test.describe('Special Use Cases', () => {
    test('renders notification badges', async ({ page }) => {
      await page.goto(`${baseUrl}--notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-notifications')
    })

    test('renders status badges', async ({ page }) => {
      await page.goto(`${baseUrl}--status-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-status')
    })

    test('renders tag badges', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-tags')
    })

    test('renders count badges', async ({ page }) => {
      await page.goto(`${baseUrl}--count-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-counts')
    })

    test('renders category badges', async ({ page }) => {
      await page.goto(`${baseUrl}--category-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-categories')
    })

    test('renders priority badges', async ({ page }) => {
      await page.goto(`${baseUrl}--priority-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'use-case-priority')
    })
  })

  test.describe('Layouts', () => {
    test('renders in list context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'layout-list')
    })

    test('renders in card context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'layout-card')
    })

    test('renders in table context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-table`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'layout-table')
    })

    test('renders in navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'layout-navigation')
    })

    test('renders with avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--with-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'layout-avatars')
    })
  })

  test.describe('Animations', () => {
    test('shows pulse animation', async ({ page }) => {
      await page.goto(`${baseUrl}--pulse-animation`)
      await page.waitForLoadState('networkidle')
      
      // Capture mid-animation
      await page.waitForTimeout(500)
      await takeComponentScreenshot(page, 'badge', 'animation-pulse')
    })

    test('shows bounce animation', async ({ page }) => {
      await page.goto(`${baseUrl}--bounce-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'badge', 'animation-bounce')
    })

    test('shows fade in animation', async ({ page }) => {
      await page.goto(`${baseUrl}--fade-in`)
      await page.waitForLoadState('networkidle')
      
      // Trigger animation
      await page.click('.trigger-fade')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'badge', 'animation-fade-in')
    })

    test('shows scale animation', async ({ page }) => {
      await page.goto(`${baseUrl}--scale-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.trigger-scale')
      await page.waitForTimeout(150)
      await takeComponentScreenshot(page, 'badge', 'animation-scale')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'badge-responsive')
    })

    test('shows mobile badge layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-layout`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'responsive-mobile')
    })

    test('shows badge wrapping on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--wrapping-behavior`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'responsive-wrapping')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'badge-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-outline`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'dark-mode-contrast')
    })

    test('shows removable badges in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--removable-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'dark-mode-removable')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'badge', 'accessibility-focus')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'accessibility-contrast')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'accessibility-high-contrast')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      // Navigate through badges
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'badge', 'accessibility-keyboard-nav')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders without content', async ({ page }) => {
      await page.goto(`${baseUrl}--no-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'edge-no-content')
    })

    test('renders with very long text', async ({ page }) => {
      await page.goto(`${baseUrl}--very-long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'edge-long-text')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'edge-special-chars')
    })

    test('renders with mixed content', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'edge-mixed-content')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'badge', 'edge-custom-styling')
    })
  })
})