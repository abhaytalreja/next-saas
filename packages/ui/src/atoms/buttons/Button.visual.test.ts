import { test, expect } from '../../test-utils/visual-test-utils'
import {
  takeComponentScreenshot,
  testColorModes,
  testResponsive,
  testInteractionStates,
  waitForFontsReady,
} from '../../test-utils/visual-test-utils'

test.describe('Button Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the button component page in docs
    await page.goto('/components/button')
    await waitForFontsReady(page)
  })

  test('Button variants', async ({ page }) => {
    const variants = ['default', 'primary', 'secondary', 'outline', 'ghost', 'link', 'destructive']
    
    for (const variant of variants) {
      const selector = `[data-testid="button-${variant}"]`
      await page.waitForSelector(selector)
      await takeComponentScreenshot(page, 'button', variant)
    }
  })

  test('Button sizes', async ({ page }) => {
    const sizes = ['sm', 'md', 'lg', 'icon']
    
    for (const size of sizes) {
      const selector = `[data-testid="button-size-${size}"]`
      await page.waitForSelector(selector)
      await takeComponentScreenshot(page, 'button', `size-${size}`)
    }
  })

  test('Button states', async ({ page }) => {
    // Loading state
    const loadingSelector = '[data-testid="button-loading"]'
    await page.waitForSelector(loadingSelector)
    await takeComponentScreenshot(page, 'button', 'loading')
    
    // Disabled state
    const disabledSelector = '[data-testid="button-disabled"]'
    await page.waitForSelector(disabledSelector)
    await takeComponentScreenshot(page, 'button', 'disabled')
  })

  test('Button with icons', async ({ page }) => {
    // Left icon
    const leftIconSelector = '[data-testid="button-left-icon"]'
    await page.waitForSelector(leftIconSelector)
    await takeComponentScreenshot(page, 'button', 'left-icon')
    
    // Right icon
    const rightIconSelector = '[data-testid="button-right-icon"]'
    await page.waitForSelector(rightIconSelector)
    await takeComponentScreenshot(page, 'button', 'right-icon')
    
    // Both icons
    const bothIconsSelector = '[data-testid="button-both-icons"]'
    await page.waitForSelector(bothIconsSelector)
    await takeComponentScreenshot(page, 'button', 'both-icons')
  })

  test('Button color modes', async ({ page }) => {
    await testColorModes(page, '/components/button', 'button-color-modes')
  })

  test('Button responsive', async ({ page }) => {
    await testResponsive(page, '/components/button', 'button-responsive')
  })

  test('Button interaction states', async ({ page }) => {
    const buttonSelector = '[data-testid="button-interactive"]'
    await page.waitForSelector(buttonSelector)
    await testInteractionStates(page, buttonSelector, 'button-interactions')
  })

  test('Button group', async ({ page }) => {
    const groupSelector = '[data-testid="button-group"]'
    await page.waitForSelector(groupSelector)
    await takeComponentScreenshot(page, 'button', 'group')
  })
})