import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Link Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-navigation-link'

  test.describe('Link Variants', () => {
    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'variant-default')
    })

    test('renders muted variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-muted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'variant-muted')
    })

    test('renders subtle variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-subtle`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'variant-subtle')
    })

    test('renders ghost variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'variant-ghost')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'variant-comparison')
    })
  })

  test.describe('Link Sizes', () => {
    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'size-large')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'size-comparison')
    })
  })

  test.describe('Link Underlines', () => {
    test('renders always underlined', async ({ page }) => {
      await page.goto(`${baseUrl}--underline-always`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'underline-always')
    })

    test('renders hover underlined', async ({ page }) => {
      await page.goto(`${baseUrl}--underline-hover`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'underline-hover')
    })

    test('renders no underlined', async ({ page }) => {
      await page.goto(`${baseUrl}--underline-none`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'underline-none')
    })

    test('shows hover underline effect', async ({ page }) => {
      await page.goto(`${baseUrl}--underline-hover`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a')
      await takeComponentScreenshot(page, 'link', 'underline-hover-effect')
    })

    test('compares all underline types', async ({ page }) => {
      await page.goto(`${baseUrl}--all-underlines`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'underline-comparison')
    })
  })

  test.describe('External Links', () => {
    test('renders external link with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--external-with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'external-with-icon')
    })

    test('renders external link without icon', async ({ page }) => {
      await page.goto(`${baseUrl}--external-without-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'external-without-icon')
    })

    test('renders target blank link', async ({ page }) => {
      await page.goto(`${baseUrl}--target-blank`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'external-target-blank')
    })

    test('compares external link styles', async ({ page }) => {
      await page.goto(`${baseUrl}--external-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'external-comparison')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a')
      await takeComponentScreenshot(page, 'link', 'interactive-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'link', 'interactive-focus')
    })

    test('shows active state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.click('a')
      await takeComponentScreenshot(page, 'link', 'interactive-active')
    })

    test('shows disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'interactive-disabled')
    })

    test('shows visited state', async ({ page }) => {
      await page.goto(`${baseUrl}--visited`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'interactive-visited')
    })
  })

  test.describe('Link Types', () => {
    test('renders breadcrumb link', async ({ page }) => {
      await page.goto(`${baseUrl}--breadcrumb-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'type-breadcrumb')
    })

    test('renders nav link', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'type-nav')
    })

    test('renders footer link', async ({ page }) => {
      await page.goto(`${baseUrl}--footer-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'type-footer')
    })

    test('renders text link', async ({ page }) => {
      await page.goto(`${baseUrl}--text-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'type-text')
    })

    test('renders button link', async ({ page }) => {
      await page.goto(`${baseUrl}--button-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'type-button')
    })
  })

  test.describe('Breadcrumb Links', () => {
    test('renders active breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--breadcrumb-active`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'breadcrumb-active')
    })

    test('renders inactive breadcrumb', async ({ page }) => {
      await page.goto(`${baseUrl}--breadcrumb-inactive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'breadcrumb-inactive')
    })

    test('renders breadcrumb chain', async ({ page }) => {
      await page.goto(`${baseUrl}--breadcrumb-chain`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'breadcrumb-chain')
    })

    test('shows breadcrumb hover', async ({ page }) => {
      await page.goto(`${baseUrl}--breadcrumb-hover`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('a:first-child')
      await takeComponentScreenshot(page, 'link', 'breadcrumb-hover')
    })
  })

  test.describe('Nav Links', () => {
    test('renders active nav link', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-active`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'nav-active')
    })

    test('renders inactive nav link', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-inactive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'nav-inactive')
    })

    test('renders nav link group', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'nav-group')
    })

    test('shows nav link hover', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-hover`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.nav-link:nth-child(2)')
      await takeComponentScreenshot(page, 'link', 'nav-hover')
    })

    test('renders vertical nav links', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'nav-vertical')
    })
  })

  test.describe('Button Links', () => {
    test('renders primary button link', async ({ page }) => {
      await page.goto(`${baseUrl}--button-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-primary')
    })

    test('renders secondary button link', async ({ page }) => {
      await page.goto(`${baseUrl}--button-secondary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-secondary')
    })

    test('renders outline button link', async ({ page }) => {
      await page.goto(`${baseUrl}--button-outline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-outline')
    })

    test('renders ghost button link', async ({ page }) => {
      await page.goto(`${baseUrl}--button-ghost`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-ghost')
    })

    test('compares button link variants', async ({ page }) => {
      await page.goto(`${baseUrl}--button-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-variants')
    })

    test('compares button link sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--button-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'button-sizes')
    })
  })

  test.describe('Link Content', () => {
    test('renders link with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-with-icon')
    })

    test('renders link with leading icon', async ({ page }) => {
      await page.goto(`${baseUrl}--leading-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-leading-icon')
    })

    test('renders link with trailing icon', async ({ page }) => {
      await page.goto(`${baseUrl}--trailing-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-trailing-icon')
    })

    test('renders link with badge', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badge`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-with-badge')
    })

    test('renders multiline link', async ({ page }) => {
      await page.goto(`${baseUrl}--multiline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-multiline')
    })

    test('renders long link text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'content-long-text')
    })
  })

  test.describe('Context Usage', () => {
    test('renders links in paragraph', async ({ page }) => {
      await page.goto(`${baseUrl}--in-paragraph`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-paragraph')
    })

    test('renders links in list', async ({ page }) => {
      await page.goto(`${baseUrl}--in-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-list')
    })

    test('renders links in card', async ({ page }) => {
      await page.goto(`${baseUrl}--in-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-card')
    })

    test('renders links in navigation bar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-navbar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-navbar')
    })

    test('renders links in footer', async ({ page }) => {
      await page.goto(`${baseUrl}--in-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-footer')
    })

    test('renders links in sidebar', async ({ page }) => {
      await page.goto(`${baseUrl}--in-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'context-sidebar')
    })
  })

  test.describe('Special Link Types', () => {
    test('renders email link', async ({ page }) => {
      await page.goto(`${baseUrl}--email-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'special-email')
    })

    test('renders phone link', async ({ page }) => {
      await page.goto(`${baseUrl}--phone-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'special-phone')
    })

    test('renders download link', async ({ page }) => {
      await page.goto(`${baseUrl}--download-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'special-download')
    })

    test('renders anchor link', async ({ page }) => {
      await page.goto(`${baseUrl}--anchor-link`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'special-anchor')
    })

    test('renders protocol links', async ({ page }) => {
      await page.goto(`${baseUrl}--protocol-links`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'special-protocols')
    })
  })

  test.describe('Link Groups', () => {
    test('renders horizontal link group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'group-horizontal')
    })

    test('renders vertical link group', async ({ page }) => {
      await page.goto(`${baseUrl}--group-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'group-vertical')
    })

    test('renders link grid', async ({ page }) => {
      await page.goto(`${baseUrl}--group-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'group-grid')
    })

    test('renders link with separators', async ({ page }) => {
      await page.goto(`${baseUrl}--group-separators`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'group-separators')
    })

    test('renders social links', async ({ page }) => {
      await page.goto(`${baseUrl}--group-social`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'group-social')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'link-responsive')
    })

    test('shows mobile link behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'responsive-mobile')
    })

    test('shows tablet link behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'responsive-tablet')
    })

    test('shows touch-friendly links', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--touch-friendly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'responsive-touch')
    })

    test('shows adaptive navigation', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-nav`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'link-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--in-paragraph`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'dark-mode-contrast')
    })

    test('shows button links in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--button-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'dark-mode-button')
    })

    test('shows navigation links in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--nav-group`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'dark-mode-nav')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'link', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'link', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'accessibility-aria')
    })

    test('shows skip links', async ({ page }) => {
      await page.goto(`${baseUrl}--skip-links`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'link', 'accessibility-skip')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very long URL', async ({ page }) => {
      await page.goto(`${baseUrl}--long-url`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-long-url')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-special-chars')
    })

    test('renders with unicode text', async ({ page }) => {
      await page.goto(`${baseUrl}--unicode-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-unicode')
    })

    test('renders without href', async ({ page }) => {
      await page.goto(`${baseUrl}--no-href`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-no-href')
    })

    test('renders with custom attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-custom-attributes')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'link', 'edge-constrained')
    })
  })
})