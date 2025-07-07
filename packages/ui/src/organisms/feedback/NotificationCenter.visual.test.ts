import { test, expect, takeComponentScreenshot, testColorModes, testResponsive } from '../../../test-utils/visual-test-utils'

test.describe('NotificationCenter Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=organisms-feedback-notificationcenter'

  test.describe('Basic NotificationCenter States', () => {
    test('renders closed notification center', async ({ page }) => {
      await page.goto(`${baseUrl}--closed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'closed')
    })

    test('renders open notification center', async ({ page }) => {
      await page.goto(`${baseUrl}--open`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'open')
    })

    test('renders empty notification center', async ({ page }) => {
      await page.goto(`${baseUrl}--empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'empty')
    })

    test('renders loading notification center', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'loading')
    })

    test('renders with custom empty message', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-empty`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'custom-empty')
    })
  })

  test.describe('Notification Types', () => {
    test('renders info notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--info-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'info-notifications')
    })

    test('renders success notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--success-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'success-notifications')
    })

    test('renders warning notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--warning-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'warning-notifications')
    })

    test('renders error notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--error-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'error-notifications')
    })

    test('renders mixed notification types', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-types`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'mixed-types')
    })

    test('compares all notification types', async ({ page }) => {
      await page.goto(`${baseUrl}--type-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'type-comparison')
    })
  })

  test.describe('Read/Unread States', () => {
    test('renders unread notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--unread-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'unread-notifications')
    })

    test('renders read notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--read-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'read-notifications')
    })

    test('renders mixed read states', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-read-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'mixed-read-states')
    })

    test('shows unread count badge', async ({ page }) => {
      await page.goto(`${baseUrl}--unread-count`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'unread-count')
    })

    test('shows mark as read interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--mark-read-interaction`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.notification-item:first-child button[title="Mark as read"]')
      await takeComponentScreenshot(page, 'notification-center', 'mark-read-hover')
    })
  })

  test.describe('Notification Content', () => {
    test('renders notifications with avatars', async ({ page }) => {
      await page.goto(`${baseUrl}--with-avatars`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'with-avatars')
    })

    test('renders notifications with custom icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'custom-icons')
    })

    test('renders notifications with actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'with-actions')
    })

    test('renders long notification content', async ({ page }) => {
      await page.goto(`${baseUrl}--long-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'long-content')
    })

    test('renders notifications with rich content', async ({ page }) => {
      await page.goto(`${baseUrl}--rich-content`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'rich-content')
    })

    test('renders multiline notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--multiline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'multiline')
    })
  })

  test.describe('Interactive Features', () => {
    test('shows notification hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.notification-item:first-child')
      await takeComponentScreenshot(page, 'notification-center', 'notification-hover')
    })

    test('shows notification click interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.notification-item:first-child')
      await takeComponentScreenshot(page, 'notification-center', 'notification-clicked')
    })

    test('shows action button hover', async ({ page }) => {
      await page.goto(`${baseUrl}--with-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.notification-item:first-child button:has-text("View")')
      await takeComponentScreenshot(page, 'notification-center', 'action-hover')
    })

    test('shows delete notification hover', async ({ page }) => {
      await page.goto(`${baseUrl}--deletable`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('.notification-item:first-child button[title="Delete"]')
      await takeComponentScreenshot(page, 'notification-center', 'delete-hover')
    })

    test('shows more actions menu', async ({ page }) => {
      await page.goto(`${baseUrl}--more-actions`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.notification-item:first-child button:has([data-testid="more-horizontal"])')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'notification-center', 'more-actions-menu')
    })
  })

  test.describe('Filtering Features', () => {
    test('renders with filters enabled', async ({ page }) => {
      await page.goto(`${baseUrl}--with-filters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'with-filters')
    })

    test('shows unread filter active', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-unread`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'filter-unread')
    })

    test('shows read filter active', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-read`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'filter-read')
    })

    test('shows type filter dropdown', async ({ page }) => {
      await page.goto(`${baseUrl}--with-filters`)
      await page.waitForLoadState('networkidle')
      
      await page.click('select:nth-child(2)')
      await takeComponentScreenshot(page, 'notification-center', 'type-filter-dropdown')
    })

    test('shows filtered by type', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-by-type`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'filter-by-type')
    })

    test('shows no results after filtering', async ({ page }) => {
      await page.goto(`${baseUrl}--filter-no-results`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'filter-no-results')
    })
  })

  test.describe('Bulk Actions', () => {
    test('renders mark all read button', async ({ page }) => {
      await page.goto(`${baseUrl}--mark-all-read`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'mark-all-read')
    })

    test('shows mark all read hover', async ({ page }) => {
      await page.goto(`${baseUrl}--mark-all-read`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Mark all read")')
      await takeComponentScreenshot(page, 'notification-center', 'mark-all-read-hover')
    })

    test('renders clear all button', async ({ page }) => {
      await page.goto(`${baseUrl}--clear-all`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'clear-all')
    })

    test('shows clear all hover', async ({ page }) => {
      await page.goto(`${baseUrl}--clear-all`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button:has-text("Clear all")')
      await takeComponentScreenshot(page, 'notification-center', 'clear-all-hover')
    })

    test('shows bulk actions when no unread', async ({ page }) => {
      await page.goto(`${baseUrl}--all-read`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'all-read-no-bulk')
    })

    test('shows bulk actions with mixed states', async ({ page }) => {
      await page.goto(`${baseUrl}--bulk-actions-mixed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'bulk-actions-mixed')
    })
  })

  test.describe('Grouping Features', () => {
    test('renders grouped by date', async ({ page }) => {
      await page.goto(`${baseUrl}--grouped-by-date`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'grouped-by-date')
    })

    test('renders without grouping', async ({ page }) => {
      await page.goto(`${baseUrl}--no-grouping`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'no-grouping')
    })

    test('shows today group', async ({ page }) => {
      await page.goto(`${baseUrl}--today-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'today-group')
    })

    test('shows yesterday group', async ({ page }) => {
      await page.goto(`${baseUrl}--yesterday-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'yesterday-group')
    })

    test('shows this week group', async ({ page }) => {
      await page.goto(`${baseUrl}--this-week-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'this-week-group')
    })

    test('shows earlier group', async ({ page }) => {
      await page.goto(`${baseUrl}--earlier-group`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'earlier-group')
    })

    test('shows all date groups', async ({ page }) => {
      await page.goto(`${baseUrl}--all-date-groups`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'all-date-groups')
    })
  })

  test.describe('Position Variants', () => {
    test('renders top-right position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'position-top-right')
    })

    test('renders top-left position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-top-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'position-top-left')
    })

    test('renders bottom-right position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom-right`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'position-bottom-right')
    })

    test('renders bottom-left position', async ({ page }) => {
      await page.goto(`${baseUrl}--position-bottom-left`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'position-bottom-left')
    })

    test('compares all positions', async ({ page }) => {
      await page.goto(`${baseUrl}--position-comparison`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'position-comparison')
    })
  })

  test.describe('NotificationTrigger Component', () => {
    test('renders basic trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-basic`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-basic')
    })

    test('renders trigger with count', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-with-count`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-with-count')
    })

    test('renders trigger with high count', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-high-count`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-high-count')
    })

    test('renders trigger with max count', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-max-count`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-max-count')
    })

    test('shows trigger hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-hover`)
      await page.waitForLoadState('networkidle')
      
      await page.hover('button')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-hover')
    })

    test('renders trigger without count', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-no-count`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-no-count')
    })

    test('renders custom trigger icon', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-custom-icon`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'trigger-custom-icon')
    })
  })

  test.describe('Scrolling and Height', () => {
    test('renders with scrollable content', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'scrollable')
    })

    test('shows scrolled content', async ({ page }) => {
      await page.goto(`${baseUrl}--scrollable`)
      await page.waitForLoadState('networkidle')
      
      await page.evaluate(() => {
        document.querySelector('.overflow-y-auto')?.scrollTo(0, 200)
      })
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'notification-center', 'scrolled-content')
    })

    test('renders with custom max height', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'custom-height')
    })

    test('renders with small height', async ({ page }) => {
      await page.goto(`${baseUrl}--small-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'small-height')
    })

    test('renders with large height', async ({ page }) => {
      await page.goto(`${baseUrl}--large-height`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'large-height')
    })
  })

  test.describe('Time Display', () => {
    test('shows recent time formats', async ({ page }) => {
      await page.goto(`${baseUrl}--recent-times`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'recent-times')
    })

    test('shows older time formats', async ({ page }) => {
      await page.goto(`${baseUrl}--older-times`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'older-times')
    })

    test('shows mixed time formats', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-times`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'mixed-times')
    })

    test('shows just now notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--just-now`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'just-now')
    })

    test('shows old notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--old-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'old-notifications')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--responsive`, 'notification-center-responsive')
    })

    test('shows mobile notification center', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'responsive-mobile')
    })

    test('shows tablet notification center', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${baseUrl}--tablet`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'responsive-tablet')
    })

    test('shows adaptive positioning', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })
      await page.goto(`${baseUrl}--adaptive-position`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'responsive-adaptive')
    })

    test('shows full screen on small devices', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 })
      await page.goto(`${baseUrl}--full-screen-mobile`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'responsive-full-screen')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--basic`, 'notification-center-color-modes')
    })

    test('shows all notification types in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--mixed-types`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'dark-mode-types')
    })

    test('shows trigger in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--trigger-with-count`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'dark-mode-trigger')
    })

    test('shows grouped notifications in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--grouped-by-date`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'dark-mode-grouped')
    })

    test('shows interactions in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--interactive`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.hover('.notification-item:first-child')
      await takeComponentScreenshot(page, 'notification-center', 'dark-mode-hover')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-focus')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-keyboard')
    })

    test('provides screen reader context', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-screen-reader')
    })

    test('shows high contrast mode', async ({ page }) => {
      await page.goto(`${baseUrl}--high-contrast`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-high-contrast')
    })

    test('shows aria labels and descriptions', async ({ page }) => {
      await page.goto(`${baseUrl}--aria-labels`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-aria')
    })

    test('shows notification announcements', async ({ page }) => {
      await page.goto(`${baseUrl}--notification-announcements`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'accessibility-announcements')
    })
  })

  test.describe('Edge Cases', () => {
    test('renders with single notification', async ({ page }) => {
      await page.goto(`${baseUrl}--single-notification`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'edge-single')
    })

    test('renders with maximum notifications', async ({ page }) => {
      await page.goto(`${baseUrl}--maximum-notifications`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'edge-maximum')
    })

    test('renders with very long titles', async ({ page }) => {
      await page.goto(`${baseUrl}--long-titles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'edge-long-titles')
    })

    test('renders with special characters', async ({ page }) => {
      await page.goto(`${baseUrl}--special-characters`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'edge-special-chars')
    })

    test('renders with custom styling', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-styling`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'notification-center', 'edge-custom-styling')
    })

    test('shows backdrop interaction', async ({ page }) => {
      await page.goto(`${baseUrl}--backdrop-click`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.fixed.inset-0', { position: { x: 100, y: 100 } })
      await takeComponentScreenshot(page, 'notification-center', 'edge-backdrop-click')
    })

    test('renders with rapid updates', async ({ page }) => {
      await page.goto(`${baseUrl}--rapid-updates`)
      await page.waitForLoadState('networkidle')
      
      await page.click('button:has-text("Add Notification")')
      await page.waitForTimeout(100)
      await page.click('button:has-text("Add Notification")')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'notification-center', 'edge-rapid-updates')
    })
  })
})