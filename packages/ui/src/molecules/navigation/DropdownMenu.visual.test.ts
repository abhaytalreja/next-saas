import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../test-utils/visual-test-utils'

test.describe('DropdownMenu Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-navigation-dropdownmenu'

  test.describe('Basic States', () => {
    test('renders closed dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dropdown', 'state-closed')
    })

    test('renders open dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'state-open')
    })

    test('shows trigger hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button')
      await takeComponentScreenshot(page, 'dropdown', 'state-trigger-hover')
    })

    test('shows trigger focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'dropdown', 'state-trigger-focus')
    })

    test('shows disabled dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'dropdown', 'state-disabled')
    })
  })

  test.describe('Content Variants', () => {
    test('renders with simple items', async ({ page }) => {
      await page.goto(`${baseUrl}--simple-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'content-simple')
    })

    test('renders with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icons`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'content-icons')
    })

    test('renders with descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-descriptions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'content-descriptions')
    })

    test('renders with shortcuts', async ({ page }) => {
      await page.goto(`${baseUrl}--with-shortcuts`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'content-shortcuts')
    })

    test('renders with badges', async ({ page }) => {
      await page.goto(`${baseUrl}--with-badges`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'content-badges')
    })
  })

  test.describe('Checkbox Items', () => {
    test('renders checkbox items unchecked', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'checkbox-unchecked')
    })

    test('renders checkbox items checked', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-checked`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'checkbox-checked')
    })

    test('shows checkbox interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      
      // Click checkbox item
      await page.click('.dropdown-checkbox-item:first-child')
      await page.waitForTimeout(100)
      
      // Open again to see checked state
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'checkbox-interaction')
    })

    test('renders mixed checkbox states', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-mixed`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'checkbox-mixed')
    })
  })

  test.describe('Structure Elements', () => {
    test('renders with labels', async ({ page }) => {
      await page.goto(`${baseUrl}--with-labels`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'structure-labels')
    })

    test('renders with separators', async ({ page }) => {
      await page.goto(`${baseUrl}--with-separators`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'structure-separators')
    })

    test('renders grouped content', async ({ page }) => {
      await page.goto(`${baseUrl}--grouped-content`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'structure-grouped')
    })

    test('renders complex structure', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-structure`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'structure-complex')
    })
  })

  test.describe('Positioning', () => {
    test('renders bottom alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-bottom`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-bottom')
    })

    test('renders top alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-top`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-top')
    })

    test('renders left alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-left`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-left')
    })

    test('renders right alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-right`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-right')
    })

    test('renders center alignment', async ({ page }) => {
      await page.goto(`${baseUrl}--align-center`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-center')
    })

    test('shows viewport edge adjustment', async ({ page }) => {
      await page.goto(`${baseUrl}--edge-adjustment`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'position-edge-adjustment')
    })
  })

  test.describe('Item States', () => {
    test('shows item hover states', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await page.hover('.dropdown-item:nth-child(2)')
      await takeComponentScreenshot(page, 'dropdown', 'item-hover')
    })

    test('shows item focus states', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'dropdown', 'item-focus')
    })

    test('shows disabled items', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'item-disabled')
    })

    test('shows destructive items', async ({ page }) => {
      await page.goto(`${baseUrl}--destructive-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'item-destructive')
    })

    test('shows selected items', async ({ page }) => {
      await page.goto(`${baseUrl}--selected-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'item-selected')
    })
  })

  test.describe('Animations', () => {
    test('shows open animation', async ({ page }) => {
      await page.goto(`${baseUrl}--animated`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(100) // Mid-animation
      await takeComponentScreenshot(page, 'dropdown', 'animation-open')
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
      await takeComponentScreenshot(page, 'dropdown', 'animation-close')
    })

    test('shows chevron rotation', async ({ page }) => {
      await page.goto(`${baseUrl}--chevron-rotation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'animation-chevron')
    })
  })

  test.describe('Trigger Variants', () => {
    test('renders button trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--button-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'trigger-button')
    })

    test('renders custom trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.custom-trigger')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'trigger-custom')
    })

    test('renders link trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--link-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.click('a')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'trigger-link')
    })

    test('renders icon trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.icon-trigger')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'trigger-icon')
    })

    test('renders avatar trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--avatar-trigger`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.avatar-trigger')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'trigger-avatar')
    })
  })

  test.describe('Sizes', () => {
    test('renders small dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'size-small')
    })

    test('renders default dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--size-default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'size-default')
    })

    test('renders large dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'size-large')
    })

    test('renders wide dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--wide`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'size-wide')
    })

    test('renders narrow dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--narrow`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'size-narrow')
    })
  })

  test.describe('Scrollable Content', () => {
    test('renders scrollable dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'scrollable-default')
    })

    test('shows scroll indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--scroll-indicators`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'scrollable-indicators')
    })

    test('shows scrolled state', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      
      // Scroll down
      await page.evaluate(() => {
        const dropdown = document.querySelector('.dropdown-content')
        if (dropdown) dropdown.scrollTop = 100
      })
      await takeComponentScreenshot(page, 'dropdown', 'scrollable-scrolled')
    })

    test('renders with search', async ({ page }) => {
      await page.goto(`${baseUrl}--with-search`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'scrollable-search')
    })
  })

  test.describe('Special Use Cases', () => {
    test('renders user menu', async ({ page }) => {
      await page.goto(`${baseUrl}--user-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-user-menu')
    })

    test('renders settings menu', async ({ page }) => {
      await page.goto(`${baseUrl}--settings-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-settings')
    })

    test('renders action menu', async ({ page }) => {
      await page.goto(`${baseUrl}--action-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-actions')
    })

    test('renders filter menu', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-filter')
    })

    test('renders sort menu', async ({ page }) => {
      await page.goto(`${baseUrl}--sort-menu`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-sort')
    })

    test('renders language selector', async ({ page }) => {
      await page.goto(`${baseUrl}--language-selector`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'use-case-language')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'dropdown-responsive')
    })

    test('shows mobile dropdown', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'responsive-mobile')
    })

    test('shows tablet dropdown', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'responsive-tablet')
    })

    test('adapts positioning on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-position`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'responsive-adaptive')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'dropdown-color-modes')
    })

    test('shows all content in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--complex-structure`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'dark-mode-content')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--destructive-items`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'dark-mode-contrast')
    })

    test('shows checkboxes in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--checkbox-mixed`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'dark-mode-checkbox')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'dropdown', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'dropdown', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'accessibility-screen-reader')
    })

    test('maintains contrast ratios', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-contrast`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'accessibility-contrast')
    })

    test('shows aria states', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-states`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'accessibility-aria')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders empty dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'edge-empty')
    })

    test('renders single item', async ({ page }) => {
      await page.goto(`${baseUrl}--single-item`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'edge-single-item')
    })

    test('renders very long items', async ({ page }) => {
      await page.goto(`${baseUrl}--long-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'edge-long-items')
    })

    test('renders many items', async ({ page }) => {
      await page.goto(`${baseUrl}--many-items`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'edge-many-items')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'dropdown', 'edge-custom-styling')
    })
  })
})