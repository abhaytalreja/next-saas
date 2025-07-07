import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Menu Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-menu'

  test.describe('Basic Menu', () => {
    test('renders closed menu', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'basic-closed')
    })

    test('renders open menu', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'basic-open')
    })

    test('renders simple menu items', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'basic-simple-items')
    })

    test('renders menu with separators', async ({ page }) => {
      await page.goto(`${baseUrl}--with-separators`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'basic-separators')
    })

    test('renders menu with labels', async ({ page }) => {
      await page.goto(`${baseUrl}--with-labels`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'basic-labels')
    })
  })

  test.describe('Menu Content Types', () => {
    test('renders menu with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'content-icons')
    })

    test('renders menu with descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-descriptions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'content-descriptions')
    })

    test('renders menu with shortcuts', async ({ page }) => {
      await page.goto(`${baseUrl}--with-shortcuts`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'content-shortcuts')
    })

    test('renders menu with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'content-badges')
    })

    test('renders mixed content menu', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'content-mixed')
    })
  })

  test.describe('Menu Item States', () => {
    test('shows item hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--item-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-item:nth-child(2)')
      await takeComponentScreenshot(page, 'menu', 'item-hover')
    })

    test('shows item focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--item-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'menu', 'item-focus')
    })

    test('shows disabled items', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'item-disabled')
    })

    test('shows destructive items', async ({ page }) => {
      await page.goto(`${baseUrl}--destructive-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'item-destructive')
    })

    test('shows active items', async ({ page }) => {
      await page.goto(`${baseUrl}--active-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'item-active')
    })
  })

  test.describe('Checkbox Items', () => {
    test('renders unchecked checkbox items', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'checkbox-unchecked')
    })

    test('renders checked checkbox items', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-checked`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'checkbox-checked')
    })

    test('shows checkbox interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.click('.menu-checkbox-item:first-child')
      await page.waitForTimeout(100)
      
      // Reopen to see updated state
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'checkbox-interaction')
    })

    test('renders mixed checkbox states', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-mixed`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'checkbox-mixed')
    })
  })

  test.describe('Radio Items', () => {
    test('renders radio group', async ({ page }) => {
      await page.goto(`${baseUrl}--radio-group`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'radio-group')
    })

    test('shows radio selection', async ({ page }) => {
      await page.goto(`${baseUrl}--radio-group`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.click('.menu-radio-item:nth-child(2)')
      await page.waitForTimeout(100)
      
      // Reopen to see updated state
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'radio-selected')
    })

    test('renders multiple radio groups', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-radio-groups`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'radio-multiple-groups')
    })

    test('shows radio hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--radio-group`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-radio-item:nth-child(2)')
      await takeComponentScreenshot(page, 'menu', 'radio-hover')
    })
  })

  test.describe('Submenu', () => {
    test('renders submenu trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--submenu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'submenu-trigger')
    })

    test('shows open submenu', async ({ page }) => {
      await page.goto(`${baseUrl}--submenu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'menu', 'submenu-open')
    })

    test('renders nested submenus', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-submenus`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger:first-child')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger:nth-child(2)')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'menu', 'submenu-nested')
    })

    test('shows submenu positioning', async ({ page }) => {
      await page.goto(`${baseUrl}--submenu-positioning`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'menu', 'submenu-positioning')
    })
  })

  test.describe('Menu Alignment', () => {
    test('renders start aligned menu', async ({ page }) => {
      await page.goto(`${baseUrl}--align-start`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'align-start')
    })

    test('renders center aligned menu', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'align-center')
    })

    test('renders end aligned menu', async ({ page }) => {
      await page.goto(`${baseUrl}--align-end`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'align-end')
    })

    test('compares all alignments', async ({ page }) => {
      await page.goto(`${baseUrl}--all-alignments`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:first-child')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'align-comparison')
    })
  })

  test.describe('Menu Triggers', () => {
    test('renders button trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--button-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'trigger-button')
    })

    test('renders icon trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'trigger-icon')
    })

    test('renders text trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--text-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'trigger-text')
    })

    test('renders custom trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'trigger-custom')
    })

    test('renders avatar trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'menu', 'trigger-avatar')
    })
  })

  test.describe('Menu Sizes', () => {
    test('renders compact menu', async ({ page }) => {
      await page.goto(`${baseUrl}--size-compact`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'size-compact')
    })

    test('renders default menu', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'size-default')
    })

    test('renders large menu', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'size-large')
    })

    test('renders wide menu', async ({ page }) => {
      await page.goto(`${baseUrl}--size-wide`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'size-wide')
    })
  })

  test.describe('Use Cases', () => {
    test('renders user menu', async ({ page }) => {
      await page.goto(`${baseUrl}--user-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-user-menu')
    })

    test('renders context menu', async ({ page }) => {
      await page.goto(`${baseUrl}--context-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-context')
    })

    test('renders actions menu', async ({ page }) => {
      await page.goto(`${baseUrl}--actions-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-actions')
    })

    test('renders settings menu', async ({ page }) => {
      await page.goto(`${baseUrl}--settings-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-settings')
    })

    test('renders filter menu', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-filter')
    })

    test('renders sort menu', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'use-case-sort')
    })
  })

  test.describe('Animations', () => {
    test('shows open animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'menu', 'animation-open')
    })

    test('shows close animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      // Open first
      await page.click('button')
      await page.waitForTimeout(300)
      
      // Close
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'menu', 'animation-close')
    })

    test('shows submenu animation', async ({ page }) => {
      await page.goto(`${baseUrl}--submenu-animated`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger')
      await page.waitForTimeout(150) // Mid-animation
      await takeComponentScreenshot(page, 'menu', 'animation-submenu')
    })

    test('shows item highlight animation', async ({ page }) => {
      await page.goto(`${baseUrl}--item-animations`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-item:nth-child(2)')
      await page.waitForTimeout(100)
      await takeComponentScreenshot(page, 'menu', 'animation-item-highlight')
    })
  })

  test.describe('Scrollable Menu', () => {
    test('renders scrollable menu', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'scrollable-default')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'scrollable-indicators')
    })

    test('shows scrolled state', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      
      // Scroll down
      await page.evaluate(() => {
        const menu = document.querySelector('.menu-content')
        if (menu) menu.scrollTop = 100
      })
      await takeComponentScreenshot(page, 'menu', 'scrollable-scrolled')
    })

    test('renders with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'scrollable-search')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'menu-responsive')
    })

    test('shows mobile menu behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'responsive-mobile')
    })

    test('shows tablet menu behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'responsive-tablet')
    })

    test('adapts positioning on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-position`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'menu-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'dark-mode-variants')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'dark-mode-contrast')
    })

    test('shows destructive items in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--destructive-items`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'dark-mode-destructive')
    })

    test('shows submenu in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--submenu`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.menu-sub-trigger')
      await page.waitForTimeout(300)
      await takeComponentScreenshot(page, 'menu', 'dark-mode-submenu')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'menu', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'menu', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'accessibility-contrast')
    })

    test('shows aria attributes', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-attributes`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders empty menu', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'edge-empty')
    })

    test('renders single item menu', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'edge-single-item')
    })

    test('renders very long items', async ({ page }) => {
      await page.goto(`${baseUrl}--long-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'edge-long-items')
    })

    test('renders many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'edge-many-items')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'menu', 'edge-custom-styling')
    })
  })
})