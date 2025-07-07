import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../test-utils/visual-test-utils'

test.describe('DatePicker Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-inputs-datepicker'

  test.describe('States', () => {
    test('renders all states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'all-states')
    })

    test('renders default state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-default')
    })

    test('renders with placeholder', async ({ page }) => {
      await page.goto(`${baseUrl}--placeholder`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-placeholder')
    })

    test('renders with selected date', async ({ page }) => {
      await page.goto(`${baseUrl}--selected-date`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-selected')
    })

    test('renders disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-disabled')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-error')
    })

    test('renders loading state', async ({ page }) => {
      await page.goto(`${baseUrl}--loading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-loading')
    })

    test('renders readonly state', async ({ page }) => {
      await page.goto(`${baseUrl}--readonly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'state-readonly')
    })
  })

  test.describe('Calendar Popup', () => {
    test('shows calendar popup open', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'calendar-open')
    })

    test('shows calendar with current month', async ({ page }) => {
      await page.goto(`${baseUrl}--current-month`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'calendar-current-month')
    })

    test('shows calendar with selected date highlighted', async ({ page }) => {
      await page.goto(`${baseUrl}--selected-highlighted`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'calendar-selected-highlighted')
    })

    test('shows calendar with today marked', async ({ page }) => {
      await page.goto(`${baseUrl}--today-marked`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'calendar-today-marked')
    })

    test('shows calendar month navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--month-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Click next month
      await page.click('.calendar-next-month')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'datepicker', 'calendar-next-month')
    })

    test('shows calendar year navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--year-navigation`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Click year selector
      await page.click('.calendar-year-select')
      await page.waitForTimeout(200)
      await takeComponentScreenshot(page, 'datepicker', 'calendar-year-dropdown')
    })
  })

  test.describe('Date Formats', () => {
    test('renders all date formats', async ({ page }) => {
      await page.goto(`${baseUrl}--all-formats`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'all-formats')
    })

    test('renders US format (MM/DD/YYYY)', async ({ page }) => {
      await page.goto(`${baseUrl}--format-us`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'format-us')
    })

    test('renders EU format (DD/MM/YYYY)', async ({ page }) => {
      await page.goto(`${baseUrl}--format-eu`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'format-eu')
    })

    test('renders ISO format (YYYY-MM-DD)', async ({ page }) => {
      await page.goto(`${baseUrl}--format-iso`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'format-iso')
    })

    test('renders custom format', async ({ page }) => {
      await page.goto(`${baseUrl}--format-custom`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'format-custom')
    })
  })

  test.describe('Date Ranges', () => {
    test('renders date range picker', async ({ page }) => {
      await page.goto(`${baseUrl}--date-range`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'date-range')
    })

    test('shows date range selection', async ({ page }) => {
      await page.goto(`${baseUrl}--date-range`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.date-range-input')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Select start date
      await page.click('.calendar-day-15')
      // Select end date
      await page.click('.calendar-day-20')
      await takeComponentScreenshot(page, 'datepicker', 'date-range-selected')
    })

    test('shows date range hover preview', async ({ page }) => {
      await page.goto(`${baseUrl}--date-range`)
      await page.waitForLoadState('networkidle')
      
      await page.click('.date-range-input')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Select start date
      await page.click('.calendar-day-15')
      // Hover over end date
      await page.hover('.calendar-day-20')
      await takeComponentScreenshot(page, 'datepicker', 'date-range-hover')
    })
  })

  test.describe('Date Restrictions', () => {
    test('shows min date restriction', async ({ page }) => {
      await page.goto(`${baseUrl}--min-date`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'min-date-restriction')
    })

    test('shows max date restriction', async ({ page }) => {
      await page.goto(`${baseUrl}--max-date`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'max-date-restriction')
    })

    test('shows disabled dates', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled-dates`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'disabled-dates')
    })

    test('shows weekends disabled', async ({ page }) => {
      await page.goto(`${baseUrl}--weekends-disabled`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'weekends-disabled')
    })

    test('shows only future dates', async ({ page }) => {
      await page.goto(`${baseUrl}--future-only`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'future-only')
    })
  })

  test.describe('Time Selection', () => {
    test('renders with time picker', async ({ page }) => {
      await page.goto(`${baseUrl}--with-time`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'with-time')
    })

    test('shows time selection UI', async ({ page }) => {
      await page.goto(`${baseUrl}--with-time`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'time-selection-ui')
    })

    test('shows 12-hour format', async ({ page }) => {
      await page.goto(`${baseUrl}--time-12hour`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'time-12hour')
    })

    test('shows 24-hour format', async ({ page }) => {
      await page.goto(`${baseUrl}--time-24hour`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'time-24hour')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'size-large')
    })
  })

  test.describe('Interaction States', () => {
    test('shows hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const input = page.locator('input[type="text"]').first()
      await input.hover()
      await takeComponentScreenshot(page, 'datepicker', 'interaction-hover')
    })

    test('shows focus state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const input = page.locator('input[type="text"]').first()
      await input.focus()
      await takeComponentScreenshot(page, 'datepicker', 'interaction-focus')
    })

    test('shows date hover in calendar', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await page.hover('.calendar-day-15')
      await takeComponentScreenshot(page, 'datepicker', 'interaction-date-hover')
    })

    test('shows keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--keyboard-nav`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowDown')
      await takeComponentScreenshot(page, 'datepicker', 'interaction-keyboard-nav')
    })
  })

  test.describe('Special Cases', () => {
    test('renders inline calendar', async ({ page }) => {
      await page.goto(`${baseUrl}--inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'inline-calendar')
    })

    test('renders with preset dates', async ({ page }) => {
      await page.goto(`${baseUrl}--presets`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'with-presets')
    })

    test('renders with clear button', async ({ page }) => {
      await page.goto(`${baseUrl}--with-clear`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'with-clear-button')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'in-form')
    })

    test('renders with custom trigger', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-trigger`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'custom-trigger')
    })

    test('renders multiple months', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-months`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'multiple-months')
    })
  })

  test.describe('Localization', () => {
    test('renders with different locales', async ({ page }) => {
      await page.goto(`${baseUrl}--locales`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'all-locales')
    })

    test('shows French locale', async ({ page }) => {
      await page.goto(`${baseUrl}--locale-fr`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'locale-french')
    })

    test('shows Japanese locale', async ({ page }) => {
      await page.goto(`${baseUrl}--locale-ja`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'locale-japanese')
    })

    test('shows RTL locale', async ({ page }) => {
      await page.goto(`${baseUrl}--locale-ar`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'locale-rtl')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'datepicker-responsive')
    })

    test('shows mobile calendar layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'mobile-calendar')
    })

    test('shows touch-friendly controls on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-friendly`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'mobile-touch-friendly')
    })

    test('shows fullscreen calendar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--mobile-fullscreen`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'mobile-fullscreen')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'datepicker-color-modes')
    })

    test('shows calendar in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'dark-mode-calendar')
    })

    test('shows all states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'dark-mode-states')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--selected-date`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'dark-mode-contrast')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'datepicker', 'accessibility-focus')
    })

    test('shows calendar keyboard navigation', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-keyboard`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      
      // Navigate in calendar
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowRight')
      await takeComponentScreenshot(page, 'datepicker', 'accessibility-calendar-nav')
    })

    test('maintains contrast for disabled dates', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      
      await page.click('input[type="text"]')
      await page.waitForSelector('.calendar-popup', { state: 'visible' })
      await takeComponentScreenshot(page, 'datepicker', 'accessibility-disabled-dates')
    })

    test('shows screen reader labels', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'datepicker', 'accessibility-screen-reader')
    })
  })
})