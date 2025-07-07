import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../../test-utils/visual-test-utils'

test.describe('Tag Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=components-atoms-data-display-tag'

  test.describe('Basic Tag States', () => {
    test('renders basic tag', async ({ page }) => {
      await page.goto(`${baseUrl}--basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'basic')
    })

    test('renders tag with icon', async ({ page }) => {
      await page.goto(`${baseUrl}--with-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'with-icon')
    })

    test('renders removable tag', async ({ page }) => {
      await page.goto(`${baseUrl}--removable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'removable')
    })

    test('renders tag with icon and remove', async ({ page }) => {
      await page.goto(`${baseUrl}--icon-removable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'icon-removable')
    })

    test('shows remove button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--removable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button[aria-label="Remove tag"]')
      await takeComponentScreenshot(page, 'tag', 'remove-hover')
    })
  })

  test.describe('Variant Styles', () => {
    test('renders default variant', async ({ page }) => {
      await page.goto(`${baseUrl}--default-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'default-variant')
    })

    test('renders primary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--primary-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'primary-variant')
    })

    test('renders secondary variant', async ({ page }) => {
      await page.goto(`${baseUrl}--secondary-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'secondary-variant')
    })

    test('renders success variant', async ({ page }) => {
      await page.goto(`${baseUrl}--success-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'success-variant')
    })

    test('renders warning variant', async ({ page }) => {
      await page.goto(`${baseUrl}--warning-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'warning-variant')
    })

    test('renders error variant', async ({ page }) => {
      await page.goto(`${baseUrl}--error-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'error-variant')
    })

    test('renders outline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--outline-variant`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'outline-variant')
    })

    test('compares all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'variant-comparison')
    })
  })

  test.describe('Size Variations', () => {
    test('renders sm size', async ({ page }) => {
      await page.goto(`${baseUrl}--sm-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'sm-size')
    })

    test('renders md size', async ({ page }) => {
      await page.goto(`${baseUrl}--md-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'md-size')
    })

    test('renders lg size', async ({ page }) => {
      await page.goto(`${baseUrl}--lg-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'lg-size')
    })

    test('compares all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--size-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'size-comparison')
    })

    test('compares sizes with icons', async ({ page }) => {
      await page.goto(`${baseUrl}--size-with-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'size-with-icons')
    })

    test('compares sizes with remove buttons', async ({ page }) => {
      await page.goto(`${baseUrl}--size-with-remove`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'size-with-remove')
    })
  })

  test.describe('Icon Types', () => {
    test('renders with status icons', async ({ page }) => {
      await page.goto(`${baseUrl}--status-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'status-icons')
    })

    test('renders with action icons', async ({ page }) => {
      await page.goto(`${baseUrl}--action-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'action-icons')
    })

    test('renders with category icons', async ({ page }) => {
      await page.goto(`${baseUrl}--category-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'category-icons')
    })

    test('renders with user icons', async ({ page }) => {
      await page.goto(`${baseUrl}--user-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'user-icons')
    })

    test('renders with file type icons', async ({ page }) => {
      await page.goto(`${baseUrl}--file-type-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'file-type-icons')
    })

    test('renders with custom SVG icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-svg-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'custom-svg-icons')
    })
  })

  test.describe('Interactive States', () => {
    test('shows remove button interactions', async ({ page }) => {
      await page.goto(`${baseUrl}--remove-interactions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button[aria-label="Remove tag"]:first-child')
      await takeComponentScreenshot(page, 'tag', 'remove-interactions')
    })

    test('shows remove button focus', async ({ page }) => {
      await page.goto(`${baseUrl}--remove-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'tag', 'remove-focus')
    })

    test('shows tag clickable state', async ({ page }) => {
      await page.goto(`${baseUrl}--clickable-tags`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('span.cursor-pointer:first-child')
      await takeComponentScreenshot(page, 'tag', 'clickable-hover')
    })

    test('shows remove animation', async ({ page }) => {
      await page.goto(`${baseUrl}--remove-animation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button[aria-label="Remove tag"]:first-child')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tag', 'remove-animation')
    })
  })

  test.describe('TagGroup Component', () => {
    test('renders basic tag group', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-basic')
    })

    test('renders tag group with tight spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-tight`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-tight')
    })

    test('renders tag group with normal spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-normal`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-normal')
    })

    test('renders tag group with loose spacing', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-loose`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-loose')
    })

    test('renders tag group with wrapping', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-wrap')
    })

    test('renders tag group without wrapping', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-no-wrap`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-no-wrap')
    })

    test('compares spacing options', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-spacing-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'tag-group-spacing-comparison')
    })
  })

  test.describe('Content Variations', () => {
    test('renders with short text', async ({ page }) => {
      await page.goto(`${baseUrl}--short-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'short-text')
    })

    test('renders with long text', async ({ page }) => {
      await page.goto(`${baseUrl}--long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'long-text')
    })

    test('renders with numbers', async ({ page }) => {
      await page.goto(`${baseUrl}--with-numbers`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'with-numbers')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'special-characters')
    })

    test('renders with emojis', async ({ page }) => {
      await page.goto(`${baseUrl}--with-emojis`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'with-emojis')
    })

    test('renders with mixed content', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'mixed-content')
    })
  })

  test.describe('Usage Patterns', () => {
    test('renders status tags', async ({ page }) => {
      await page.goto(`${baseUrl}--status-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'status-tags')
    })

    test('renders category tags', async ({ page }) => {
      await page.goto(`${baseUrl}--category-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'category-tags')
    })

    test('renders skill tags', async ({ page }) => {
      await page.goto(`${baseUrl}--skill-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'skill-tags')
    })

    test('renders filter tags', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'filter-tags')
    })

    test('renders label tags', async ({ page }) => {
      await page.goto(`${baseUrl}--label-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'label-tags')
    })

    test('renders priority tags', async ({ page }) => {
      await page.goto(`${baseUrl}--priority-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'priority-tags')
    })
  })

  test.describe('Complex Layouts', () => {
    test('renders in card context', async ({ page }) => {
      await page.goto(`${baseUrl}--card-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'card-context')
    })

    test('renders in list context', async ({ page }) => {
      await page.goto(`${baseUrl}--list-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'list-context')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--form-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'form-context')
    })

    test('renders in table context', async ({ page }) => {
      await page.goto(`${baseUrl}--table-context`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'table-context')
    })

    test('renders with mixed sizes in group', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-sizes-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'mixed-sizes-group')
    })

    test('renders with mixed variants in group', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-variants-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'mixed-variants-group')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'tag-responsive')
    })

    test('shows mobile tag behavior', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-behavior`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'responsive-mobile')
    })

    test('shows tablet tag behavior', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet-behavior`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'responsive-tablet')
    })

    test('shows responsive wrapping', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--responsive-wrapping`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'responsive-wrapping')
    })

    test('shows responsive tag group', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 })
      await page.goto(`${baseUrl}--responsive-tag-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'responsive-tag-group')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'tag-color-modes')
    })

    test('shows all variants in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-comparison`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'dark-mode-variants')
    })

    test('shows interactive states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--remove-interactions`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('button[aria-label="Remove tag"]:first-child')
      await takeComponentScreenshot(page, 'tag', 'dark-mode-interactions')
    })

    test('shows tag group in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--tag-group-basic`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'dark-mode-tag-group')
    })

    test('shows outline variant in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--outline-variant`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'dark-mode-outline')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with very long text', async ({ page }) => {
      await page.goto(`${baseUrl}--very-long-text`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'edge-very-long-text')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'edge-custom-styling')
    })

    test('renders many tags in group', async ({ page }) => {
      await page.goto(`${baseUrl}--many-tags`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'edge-many-tags')
    })

    test('renders in constrained space', async ({ page }) => {
      await page.goto(`${baseUrl}--constrained-space`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'edge-constrained-space')
    })

    test('renders with rapid add/remove operations', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-operations`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Add Tag")')
      await page.waitForTimeout(100)
      await page.click('button[aria-label="Remove tag"]:first-child')
      await page.waitForTimeout(100)
      await page.click('button:has-text("Add Tag")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'tag', 'edge-rapid-operations')
    })

    test('renders with nested interactive elements', async ({ page }) => {
      await page.goto(`${baseUrl}--nested-interactive`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'tag', 'edge-nested-interactive')
    })
  })
})