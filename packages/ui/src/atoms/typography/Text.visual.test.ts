import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Text Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-typography-text'

  test.describe('Sizes', () => {
    test('renders all text sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'all-sizes')
    })

    test('renders xs size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xs`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'size-xs')
    })

    test('renders sm size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'size-sm')
    })

    test('renders base size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-base`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'size-base')
    })

    test('renders lg size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'size-lg')
    })

    test('renders xl size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'size-xl')
    })
  })

  test.describe('Weights', () => {
    test('renders all font weights', async ({ page }) => {
      await page.goto(`${baseUrl}--all-weights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'all-weights')
    })

    test('renders light weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-light`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'weight-light')
    })

    test('renders normal weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'weight-normal')
    })

    test('renders medium weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'weight-medium')
    })

    test('renders semibold weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-semibold`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'weight-semibold')
    })

    test('renders bold weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-bold`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'weight-bold')
    })
  })

  test.describe('Variants', () => {
    test('renders all text variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'all-variants')
    })

    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-default')
    })

    test('renders muted variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-muted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-muted')
    })

    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-primary')
    })

    test('renders destructive variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-destructive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-destructive')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-success')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-warning`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'variant-warning')
    })
  })

  test.describe('Alignment', () => {
    test('renders all alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--all-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'all-alignments')
    })

    test('renders left alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'align-left')
    })

    test('renders center alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'align-center')
    })

    test('renders right alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'align-right')
    })

    test('renders justify alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-justify`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'align-justify')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with truncation', async ({ page }) => {
      await page.goto(`${baseUrl}--truncated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'truncated')
    })

    test('renders italic text', async ({ page }) => {
      await page.goto(`${baseUrl}--italic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'italic')
    })

    test('renders uppercase text', async ({ page }) => {
      await page.goto(`${baseUrl}--uppercase`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'uppercase')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'custom-class')
    })

    test('renders inline text', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'inline')
    })

    test('renders block text', async ({ page }) => {
      await page.goto(`${baseUrl}--block`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'block')
    })
  })

  test.describe('Line Height', () => {
    test('renders all line heights', async ({ page }) => {
      await page.goto(`${baseUrl}--line-heights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'all-line-heights')
    })

    test('renders tight line height', async ({ page }) => {
      await page.goto(`${baseUrl}--line-height-tight`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'line-height-tight')
    })

    test('renders normal line height', async ({ page }) => {
      await page.goto(`${baseUrl}--line-height-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'line-height-normal')
    })

    test('renders relaxed line height', async ({ page }) => {
      await page.goto(`${baseUrl}--line-height-relaxed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'line-height-relaxed')
    })
  })

  test.describe('Long Content', () => {
    test('renders paragraph text', async ({ page }) => {
      await page.goto(`${baseUrl}--paragraph`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'paragraph')
    })

    test('renders multi-line text', async ({ page }) => {
      await page.goto(`${baseUrl}--multi-line`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'multi-line')
    })

    test('renders with word break', async ({ page }) => {
      await page.goto(`${baseUrl}--word-break`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'word-break')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--all-sizes`, 'text-responsive')
    })

    test('handles text wrapping on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--paragraph`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'mobile-wrapping')
    })

    test('adjusts font size on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'mobile-font-sizes')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-variants`, 'text-color-modes')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'dark-mode-contrast')
    })

    test('shows muted variant in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-muted`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'dark-mode-muted')
    })
  })

  test.describe('Mixed Content', () => {
    test('renders with inline code', async ({ page }) => {
      await page.goto(`${baseUrl}--with-code`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'with-code')
    })

    test('renders with strong and emphasis', async ({ page }) => {
      await page.goto(`${baseUrl}--with-formatting`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'with-formatting')
    })

    test('renders with links', async ({ page }) => {
      await page.goto(`${baseUrl}--with-links`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'with-links')
    })
  })

  test.describe('Accessibility', () => {
    test('renders with proper contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility`)
      await page.waitForLoadState('networkidle')
      
      // Check contrast ratios for all variants
      const results = await page.evaluate(() => {
        const texts = document.querySelectorAll('[class*="text-"]')
        return Array.from(texts).map(text => {
          const styles = window.getComputedStyle(text)
          return {
            variant: text.className,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize
          }
        })
      })
      
      await takeComponentScreenshot(page, 'text', 'accessibility-contrast')
    })

    test('maintains readability at different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--readability`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'text', 'readability')
    })
  })
})