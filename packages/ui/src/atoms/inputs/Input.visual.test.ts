import { test, expect } from '@playwright/test'

test.describe('Input Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the input documentation page
    await page.goto('/components/input')
  })

  test('renders default input correctly', async ({ page }) => {
    const input = page.locator('[data-testid="input-default"]').first()
    await expect(input).toBeVisible()
    await expect(input).toHaveScreenshot('input-default.png')
  })

  test('renders input variants', async ({ page }) => {
    // Test outlined variant
    const outlinedInput = page.locator('[data-testid="input-outlined"]').first()
    await expect(outlinedInput).toBeVisible()
    await expect(outlinedInput).toHaveScreenshot('input-outlined.png')

    // Test filled variant
    const filledInput = page.locator('[data-testid="input-filled"]').first()
    await expect(filledInput).toBeVisible()
    await expect(filledInput).toHaveScreenshot('input-filled.png')
  })

  test('renders input sizes', async ({ page }) => {
    // Test small size
    const smallInput = page.locator('[data-testid="input-small"]').first()
    await expect(smallInput).toBeVisible()
    await expect(smallInput).toHaveScreenshot('input-small.png')

    // Test medium size
    const mediumInput = page.locator('[data-testid="input-medium"]').first()
    await expect(mediumInput).toBeVisible()
    await expect(mediumInput).toHaveScreenshot('input-medium.png')

    // Test large size
    const largeInput = page.locator('[data-testid="input-large"]').first()
    await expect(largeInput).toBeVisible()
    await expect(largeInput).toHaveScreenshot('input-large.png')
  })

  test('renders input states', async ({ page }) => {
    // Test normal state
    const normalInput = page.locator('[data-testid="input-normal"]').first()
    await expect(normalInput).toBeVisible()
    await expect(normalInput).toHaveScreenshot('input-normal.png')

    // Test focus state
    await normalInput.focus()
    await expect(normalInput).toHaveScreenshot('input-focus.png')

    // Test disabled state
    const disabledInput = page.locator('[data-testid="input-disabled"]').first()
    await expect(disabledInput).toBeVisible()
    await expect(disabledInput).toHaveScreenshot('input-disabled.png')

    // Test error state
    const errorInput = page.locator('[data-testid="input-error"]').first()
    await expect(errorInput).toBeVisible()
    await expect(errorInput).toHaveScreenshot('input-error.png')

    // Test success state
    const successInput = page.locator('[data-testid="input-success"]').first()
    await expect(successInput).toBeVisible()
    await expect(successInput).toHaveScreenshot('input-success.png')
  })

  test('renders input with label and help text', async ({ page }) => {
    const inputWithLabel = page.locator('[data-testid="input-with-label"]').first()
    await expect(inputWithLabel).toBeVisible()
    await expect(inputWithLabel).toHaveScreenshot('input-with-label.png')

    const inputWithHelp = page.locator('[data-testid="input-with-help"]').first()
    await expect(inputWithHelp).toBeVisible()
    await expect(inputWithHelp).toHaveScreenshot('input-with-help.png')
  })

  test('renders input with icons', async ({ page }) => {
    // Test left icon
    const leftIconInput = page.locator('[data-testid="input-left-icon"]').first()
    await expect(leftIconInput).toBeVisible()
    await expect(leftIconInput).toHaveScreenshot('input-left-icon.png')

    // Test right icon
    const rightIconInput = page.locator('[data-testid="input-right-icon"]').first()
    await expect(rightIconInput).toBeVisible()
    await expect(rightIconInput).toHaveScreenshot('input-right-icon.png')

    // Test both icons
    const bothIconsInput = page.locator('[data-testid="input-both-icons"]').first()
    await expect(bothIconsInput).toBeVisible()
    await expect(bothIconsInput).toHaveScreenshot('input-both-icons.png')
  })

  test('renders different input types', async ({ page }) => {
    // Test password input
    const passwordInput = page.locator('[data-testid="input-password"]').first()
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveScreenshot('input-password.png')

    // Test email input
    const emailInput = page.locator('[data-testid="input-email"]').first()
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveScreenshot('input-email.png')

    // Test number input
    const numberInput = page.locator('[data-testid="input-number"]').first()
    await expect(numberInput).toBeVisible()
    await expect(numberInput).toHaveScreenshot('input-number.png')

    // Test search input
    const searchInput = page.locator('[data-testid="input-search"]').first()
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveScreenshot('input-search.png')
  })

  test('renders input with value and placeholder', async ({ page }) => {
    // Test with placeholder
    const placeholderInput = page.locator('[data-testid="input-placeholder"]').first()
    await expect(placeholderInput).toBeVisible()
    await expect(placeholderInput).toHaveScreenshot('input-placeholder.png')

    // Test with value
    const valueInput = page.locator('[data-testid="input-value"]').first()
    await expect(valueInput).toBeVisible()
    await expect(valueInput).toHaveScreenshot('input-value.png')
  })

  test('renders input responsive behavior', async ({ page }) => {
    const responsiveInput = page.locator('[data-testid="input-responsive"]').first()
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(responsiveInput).toBeVisible()
    await expect(responsiveInput).toHaveScreenshot('input-mobile.png')

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(responsiveInput).toHaveScreenshot('input-tablet.png')

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(responsiveInput).toHaveScreenshot('input-desktop.png')
  })

  test('renders input in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.addStyleTag({
      content: `
        html { color-scheme: dark; }
        body { background: #0f0f0f; color: #fff; }
      `
    })
    
    const darkInput = page.locator('[data-testid="input-default"]').first()
    await expect(darkInput).toBeVisible()
    await expect(darkInput).toHaveScreenshot('input-dark-mode.png')
  })

  test('renders input interaction states', async ({ page }) => {
    const interactiveInput = page.locator('[data-testid="input-interactive"]').first()
    
    // Hover state
    await interactiveInput.hover()
    await expect(interactiveInput).toHaveScreenshot('input-hover.png')
    
    // Active state (click and hold)
    await interactiveInput.click()
    await expect(interactiveInput).toHaveScreenshot('input-active.png')
    
    // Type some text
    await interactiveInput.fill('Sample text')
    await expect(interactiveInput).toHaveScreenshot('input-with-text.png')
  })

  test('renders input loading state', async ({ page }) => {
    const loadingInput = page.locator('[data-testid="input-loading"]').first()
    await expect(loadingInput).toBeVisible()
    await expect(loadingInput).toHaveScreenshot('input-loading.png')
  })

  test('renders input accessibility features', async ({ page }) => {
    const accessibleInput = page.locator('[data-testid="input-accessible"]').first()
    
    // Check focus ring
    await accessibleInput.focus()
    await expect(accessibleInput).toHaveScreenshot('input-accessibility-focus.png')
    
    // Verify proper contrast
    await expect(accessibleInput).toHaveCSS('color')
    await expect(accessibleInput).toHaveAttribute('aria-label')
  })
})