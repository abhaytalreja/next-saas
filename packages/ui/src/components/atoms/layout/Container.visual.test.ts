import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Container Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=atoms-layout-container'

  test.describe('Container Sizes', () => {
    test('renders small container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-sm')
    })

    test('renders medium container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-md`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-md')
    })

    test('renders large container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-lg')
    })

    test('renders extra large container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-xl')
    })

    test('renders 2xl container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-2xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-2xl')
    })

    test('renders full width container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-full`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-full')
    })

    test('renders prose container', async ({ page }) => {
      await page.goto(`${baseUrl}--size-prose`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-prose')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'size-comparison')
    })
  })

  test.describe('Container Padding', () => {
    test('renders with no padding', async ({ page }) => {
      await page.goto(`${baseUrl}--padding-none`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-none')
    })

    test('renders with small padding', async ({ page }) => {
      await page.goto(`${baseUrl}--padding-sm`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-sm')
    })

    test('renders with medium padding', async ({ page }) => {
      await page.goto(`${baseUrl}--padding-md`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-md')
    })

    test('renders with large padding', async ({ page }) => {
      await page.goto(`${baseUrl}--padding-lg`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-lg')
    })

    test('renders with extra large padding', async ({ page }) => {
      await page.goto(`${baseUrl}--padding-xl`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-xl')
    })

    test('compares all padding options', async ({ page }) => {
      await page.goto(`${baseUrl}--all-padding`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'padding-comparison')
    })
  })

  test.describe('Container Alignment', () => {
    test('renders centered container', async ({ page }) => {
      await page.goto(`${baseUrl}--centered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'alignment-centered')
    })

    test('renders left-aligned container', async ({ page }) => {
      await page.goto(`${baseUrl}--left-aligned`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'alignment-left')
    })

    test('renders right-aligned container', async ({ page }) => {
      await page.goto(`${baseUrl}--right-aligned`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'alignment-right')
    })

    test('compares alignment options', async ({ page }) => {
      await page.goto(`${baseUrl}--all-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'alignment-comparison')
    })
  })

  test.describe('Fluid Container', () => {
    test('renders basic fluid container', async ({ page }) => {
      await page.goto(`${baseUrl}--fluid-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'fluid-basic')
    })

    test('renders fluid container with max width', async ({ page }) => {
      await page.goto(`${baseUrl}--fluid-max-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'fluid-max-width')
    })

    test('renders fluid container with custom width', async ({ page }) => {
      await page.goto(`${baseUrl}--fluid-custom-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'fluid-custom-width')
    })

    test('renders fluid container with different padding', async ({ page }) => {
      await page.goto(`${baseUrl}--fluid-padding`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'fluid-padding')
    })

    test('compares fluid container variants', async ({ page }) => {
      await page.goto(`${baseUrl}--fluid-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'fluid-comparison')
    })
  })

  test.describe('Container Content Types', () => {
    test('renders with text content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-text')
    })

    test('renders with card content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-cards`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-cards')
    })

    test('renders with form content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-form')
    })

    test('renders with grid content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-grid')
    })

    test('renders with navigation content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-navigation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-navigation')
    })

    test('renders with hero content', async ({ page }) => {
      await page.goto(`${baseUrl}--content-hero`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'content-hero')
    })
  })

  test.describe('Container Layouts', () => {
    test('renders page layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-page`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-page')
    })

    test('renders section layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-section`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-section')
    })

    test('renders article layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-article`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-article')
    })

    test('renders sidebar layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-sidebar`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-sidebar')
    })

    test('renders modal layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-modal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-modal')
    })

    test('renders header layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-header`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-header')
    })

    test('renders footer layout container', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-footer`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'layout-footer')
    })
  })

  test.describe('Nested Containers', () => {
    test('renders nested containers', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-containers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'nested-basic')
    })

    test('renders containers with different sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'nested-sizes')
    })

    test('renders containers with different alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-alignments`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'nested-alignments')
    })

    test('renders complex nested structure', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-complex`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'nested-complex')
    })
  })

  test.describe('Container Breakpoints', () => {
    test('shows container at mobile breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--breakpoint-mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'breakpoint-mobile')
    })

    test('shows container at tablet breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--breakpoint-tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'breakpoint-tablet')
    })

    test('shows container at laptop breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 })
      await page.goto(`${baseUrl}--breakpoint-laptop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'breakpoint-laptop')
    })

    test('shows container at desktop breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`${baseUrl}--breakpoint-desktop`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'breakpoint-desktop')
    })

    test('shows container at wide desktop breakpoint', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(`${baseUrl}--breakpoint-wide`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'breakpoint-wide')
    })
  })

  test.describe('Container Spacing', () => {
    test('renders with tight spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-tight`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'spacing-tight')
    })

    test('renders with normal spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'spacing-normal')
    })

    test('renders with loose spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-loose`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'spacing-loose')
    })

    test('renders with custom spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-custom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'spacing-custom')
    })

    test('compares spacing options', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'spacing-comparison')
    })
  })

  test.describe('Container Backgrounds', () => {
    test('renders with transparent background', async ({ page }) => {
      await page.goto(`${baseUrl}--background-transparent`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'background-transparent')
    })

    test('renders with colored background', async ({ page }) => {
      await page.goto(`${baseUrl}--background-colored`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'background-colored')
    })

    test('renders with gradient background', async ({ page }) => {
      await page.goto(`${baseUrl}--background-gradient`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'background-gradient')
    })

    test('renders with pattern background', async ({ page }) => {
      await page.goto(`${baseUrl}--background-pattern`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'background-pattern')
    })

    test('renders with image background', async ({ page }) => {
      await page.goto(`${baseUrl}--background-image`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'background-image')
    })
  })

  test.describe('Container Borders', () => {
    test('renders with border', async ({ page }) => {
      await page.goto(`${baseUrl}--with-border`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'border-basic')
    })

    test('renders with rounded corners', async ({ page }) => {
      await page.goto(`${baseUrl}--rounded-corners`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'border-rounded')
    })

    test('renders with shadow', async ({ page }) => {
      await page.goto(`${baseUrl}--with-shadow`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'border-shadow')
    })

    test('renders with card-like styling', async ({ page }) => {
      await page.goto(`${baseUrl}--card-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'border-card')
    })

    test('compares border variations', async ({ page }) => {
      await page.goto(`${baseUrl}--border-variations`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'border-comparison')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'container-responsive')
    })

    test('shows adaptive padding behavior', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-padding`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'responsive-adaptive-padding')
    })

    test('shows responsive max-width behavior', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.goto(`${baseUrl}--responsive-max-width`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'responsive-max-width')
    })

    test('shows fluid responsive behavior', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--fluid-responsive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'responsive-fluid')
    })

    test('shows responsive nested containers', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--responsive-nested`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'responsive-nested')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'container-color-modes')
    })

    test('shows backgrounds in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--background-colored`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'dark-mode-backgrounds')
    })

    test('shows borders in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--border-variations`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'dark-mode-borders')
    })

    test('shows content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--content-cards`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'dark-mode-content')
    })

    test('shows layouts in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--layout-page`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'dark-mode-layouts')
    })
  })

  test.describe('Accessibility', () => {
    test('provides semantic structure', async ({ page }) => {
      await page.goto(`${baseUrl}--semantic-structure`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'accessibility-semantic')
    })

    test('maintains proper landmark roles', async ({ page }) => {
      await page.goto(`${baseUrl}--landmark-roles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'accessibility-landmarks')
    })

    test('shows skip navigation support', async ({ page }) => {
      await page.goto(`${baseUrl}--skip-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'container', 'accessibility-skip-nav')
    })

    test('maintains focus management', async ({ page }) => {
      await page.goto(`${baseUrl}--focus-management`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'container', 'accessibility-focus')
    })

    test('shows screen reader friendly structure', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'accessibility-screen-reader')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with no content', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-empty')
    })

    test('renders with minimal content', async ({ page }) => {
      await page.goto(`${baseUrl}--minimal-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-minimal')
    })

    test('renders with overflow content', async ({ page }) => {
      await page.goto(`${baseUrl}--overflow-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-overflow')
    })

    test('renders with very wide content', async ({ page }) => {
      await page.goto(`${baseUrl}--wide-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-wide')
    })

    test('renders with custom attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-custom-attributes')
    })

    test('renders in extremely small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 280, height: 500 })
      await page.goto(`${baseUrl}--small-viewport`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'container', 'edge-small-viewport')
    })
  })
})