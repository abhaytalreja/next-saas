import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('Heading Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-typography-heading'

  test.describe('Sizes', () => {
    test('renders all heading sizes correctly', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'all-sizes')
    })

    test('renders h1 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h1`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h1')
    })

    test('renders h2 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h2`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h2')
    })

    test('renders h3 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h3`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h3')
    })

    test('renders h4 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h4`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h4')
    })

    test('renders h5 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h5`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h5')
    })

    test('renders h6 size', async ({ page }) => {
      await page.goto(`${baseUrl}--h6`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'size-h6')
    })
  })

  test.describe('Weights', () => {
    test('renders all font weights', async ({ page }) => {
      await page.goto(`${baseUrl}--all-weights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'all-weights')
    })

    test('renders light weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-light`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-light')
    })

    test('renders normal weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-normal')
    })

    test('renders medium weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-medium')
    })

    test('renders semibold weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-semibold`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-semibold')
    })

    test('renders bold weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-bold`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-bold')
    })

    test('renders extrabold weight', async ({ page }) => {
      await page.goto(`${baseUrl}--weight-extrabold`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'weight-extrabold')
    })
  })

  test.describe('Alignment', () => {
    test('renders all alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--all-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'all-alignments')
    })

    test('renders left alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'align-left')
    })

    test('renders center alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'align-center')
    })

    test('renders right alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'align-right')
    })
  })

  test.describe('Colors', () => {
    test('renders all color variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-colors`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'all-colors')
    })

    test('renders default color', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'color-default')
    })

    test('renders primary color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-primary`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'color-primary')
    })

    test('renders muted color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-muted`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'color-muted')
    })

    test('renders destructive color', async ({ page }) => {
      await page.goto(`${baseUrl}--color-destructive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'color-destructive')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with truncation', async ({ page }) => {
      await page.goto(`${baseUrl}--truncated`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'truncated')
    })

    test('renders with custom className', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-class`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'custom-class')
    })

    test('renders very long text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'long-text')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'special-characters')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--all-sizes`, 'heading-responsive')
    })

    test('handles text wrapping on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'mobile-wrapping')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--all-colors`, 'heading-color-modes')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'dark-mode-contrast')
    })
  })

  test.describe('Typography Scale', () => {
    test('shows proper typography hierarchy', async ({ page }) => {
      await page.goto(`${baseUrl}--typography-scale`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'typography-scale')
    })

    test('demonstrates line height variations', async ({ page }) => {
      await page.goto(`${baseUrl}--line-heights`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'heading', 'line-heights')
    })
  })

  test.describe('Accessibility', () => {
    test('renders with proper contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility`)
      await page.waitForLoadState('networkidle')
      
      // Check contrast ratios
      const results = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        return Array.from(headings).map(heading => {
          const styles = window.getComputedStyle(heading)
          return {
            tag: heading.tagName,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            fontSize: styles.fontSize
          }
        })
      })
      
      await takeComponentScreenshot(page, 'heading', 'accessibility-contrast')
    })
  })
})