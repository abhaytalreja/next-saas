import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('List Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-data-display-list'

  test.describe('Basic Lists', () => {
    test('renders unordered list', async ({ page }) => {
      await page.goto(`${baseUrl}--unordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'basic-unordered')
    })

    test('renders ordered list', async ({ page }) => {
      await page.goto(`${baseUrl}--ordered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'basic-ordered')
    })

    test('renders unstyled list', async ({ page }) => {
      await page.goto(`${baseUrl}--unstyled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'basic-unstyled')
    })

    test('renders simple list', async ({ page }) => {
      await page.goto(`${baseUrl}--simple`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'basic-simple')
    })

    test('renders nested lists', async ({ page }) => {
      await page.goto(`${baseUrl}--nested`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'basic-nested')
    })
  })

  test.describe('List Spacing', () => {
    test('renders tight spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-tight`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'spacing-tight')
    })

    test('renders normal spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'spacing-normal')
    })

    test('renders loose spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--spacing-loose`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'spacing-loose')
    })

    test('compares all spacings', async ({ page }) => {
      await page.goto(`${baseUrl}--all-spacings`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'spacing-comparison')
    })
  })

  test.describe('Lists with Icons', () => {
    test('renders with leading icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'icons-leading')
    })

    test('renders with mixed icons', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'icons-mixed')
    })

    test('renders with status icons', async ({ page }) => {
      await page.goto(`${baseUrl}--status-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'icons-status')
    })

    test('renders with colorful icons', async ({ page }) => {
      await page.goto(`${baseUrl}--colorful-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'icons-colorful')
    })

    test('renders with large icons', async ({ page }) => {
      await page.goto(`${baseUrl}--large-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'icons-large')
    })
  })

  test.describe('Description Lists', () => {
    test('renders vertical description list', async ({ page }) => {
      await page.goto(`${baseUrl}--description-vertical`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'description-vertical')
    })

    test('renders horizontal description list', async ({ page }) => {
      await page.goto(`${baseUrl}--description-horizontal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'description-horizontal')
    })

    test('renders striped description list', async ({ page }) => {
      await page.goto(`${baseUrl}--description-striped`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'description-striped')
    })

    test('renders compact description list', async ({ page }) => {
      await page.goto(`${baseUrl}--description-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'description-compact')
    })

    test('renders description list with long content', async ({ page }) => {
      await page.goto(`${baseUrl}--description-long`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'description-long')
    })
  })

  test.describe('Inline Lists', () => {
    test('renders inline list with dots', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-dots`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'inline-dots')
    })

    test('renders inline list with pipes', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-pipes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'inline-pipes')
    })

    test('renders inline list with arrows', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-arrows`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'inline-arrows')
    })

    test('renders inline list without separators', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-no-separator`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'inline-no-separator')
    })

    test('renders inline list with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--inline-badges`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'inline-badges')
    })
  })

  test.describe('Checklists', () => {
    test('renders basic checklist', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'checklist-basic')
    })

    test('renders checklist with mixed states', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'checklist-mixed')
    })

    test('renders checklist all checked', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-all-checked`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'checklist-all-checked')
    })

    test('renders disabled checklist items', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'checklist-disabled')
    })

    test('shows checklist interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="checkbox"]:first-child')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'list', 'checklist-interaction')
    })
  })

  test.describe('Complex Lists', () => {
    test('renders feature list', async ({ page }) => {
      await page.goto(`${baseUrl}--feature-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'complex-feature')
    })

    test('renders navigation list', async ({ page }) => {
      await page.goto(`${baseUrl}--navigation-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'complex-navigation')
    })

    test('renders task list', async ({ page }) => {
      await page.goto(`${baseUrl}--task-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'complex-task')
    })

    test('renders contact list', async ({ page }) => {
      await page.goto(`${baseUrl}--contact-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'complex-contact')
    })

    test('renders menu list', async ({ page }) => {
      await page.goto(`${baseUrl}--menu-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'complex-menu')
    })
  })

  test.describe('Interactive States', () => {
    test('shows hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--hoverable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('li:nth-child(2)')
      await takeComponentScreenshot(page, 'list', 'interactive-hover')
    })

    test('shows focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--focusable`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'list', 'interactive-focus')
    })

    test('shows selected states', async ({ page }) => {
      await page.goto(`${baseUrl}--selectable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'interactive-selected')
    })

    test('shows clickable states', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('li:first-child')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'list', 'interactive-clicked')
    })
  })

  test.describe('List with Actions', () => {
    test('renders list with action buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'actions-buttons')
    })

    test('renders list with links', async ({ page }) => {
      await page.goto(`${baseUrl}--with-links`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'actions-links')
    })

    test('renders list with dropdown actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-dropdown`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'actions-dropdown')
    })

    test('renders list with remove actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-remove`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'actions-remove')
    })

    test('shows action hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:first-child')
      await takeComponentScreenshot(page, 'list', 'actions-hover')
    })
  })

  test.describe('List Variants', () => {
    test('renders bulleted list', async ({ page }) => {
      await page.goto(`${baseUrl}--bullets`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'variant-bullets')
    })

    test('renders numbered list', async ({ page }) => {
      await page.goto(`${baseUrl}--numbered`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'variant-numbered')
    })

    test('renders timeline list', async ({ page }) => {
      await page.goto(`${baseUrl}--timeline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'variant-timeline')
    })

    test('renders progress list', async ({ page }) => {
      await page.goto(`${baseUrl}--progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'variant-progress')
    })

    test('renders card list', async ({ page }) => {
      await page.goto(`${baseUrl}--card-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'variant-cards')
    })
  })

  test.describe('Empty States', () => {
    test('renders empty list', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'empty-default')
    })

    test('renders empty with message', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-with-message`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'empty-with-message')
    })

    test('renders empty with action', async ({ page }) => {
      await page.goto(`${baseUrl}--empty-with-action`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'empty-with-action')
    })

    test('renders loading list', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'empty-loading')
    })
  })

  test.describe('List with Avatars', () => {
    test('renders list with user avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--with-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'avatars-users')
    })

    test('renders list with avatar groups', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'avatars-groups')
    })

    test('renders list with large avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--large-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'avatars-large')
    })

    test('renders list with status indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-status`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'avatars-status')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'list-responsive')
    })

    test('shows mobile list', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'responsive-mobile')
    })

    test('shows tablet list', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'responsive-tablet')
    })

    test('shows adaptive stacking', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--adaptive-stacking`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'responsive-stacking')
    })

    test('shows mobile description list', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--mobile-description`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'responsive-mobile-description')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'list-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--feature-list`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'dark-mode-contrast')
    })

    test('shows checklist in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--checklist-mixed`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'dark-mode-checklist')
    })

    test('shows description list in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--description-striped`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'dark-mode-description')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'list', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'list', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'accessibility-aria')
    })
  })

  test.describe('Performance', () => {
    test('renders large lists efficiently', async ({ page }) => {
      await page.goto(`${baseUrl}--large-list`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'performance-large')
    })

    test('handles virtualized lists', async ({ page }) => {
      await page.goto(`${baseUrl}--virtualized`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'performance-virtualized')
    })

    test('shows lazy loaded items', async ({ page }) => {
      await page.goto(`${baseUrl}--lazy-loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'performance-lazy')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders single item list', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'edge-single-item')
    })

    test('renders very long items', async ({ page }) => {
      await page.goto(`${baseUrl}--long-items`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'edge-long-items')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'edge-special-chars')
    })

    test('renders with mixed content types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'edge-mixed-content')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'list', 'edge-custom-styling')
    })
  })
})