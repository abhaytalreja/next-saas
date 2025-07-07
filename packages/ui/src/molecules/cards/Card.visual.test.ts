import { test, expect } from '@playwright/test'

test.describe('Card Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the card documentation page
    await page.goto('/components/card')
  })

  test('renders default card correctly', async ({ page }) => {
    const card = page.locator('[data-testid="card-default"]').first()
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('card-default.png')
  })

  test('renders card with header and footer', async ({ page }) => {
    const card = page.locator('[data-testid="card-with-header-footer"]').first()
    await expect(card).toBeVisible()
    await expect(card).toHaveScreenshot('card-with-header-footer.png')
  })

  test('renders card variants', async ({ page }) => {
    // Test elevated variant
    const elevatedCard = page.locator('[data-testid="card-elevated"]').first()
    await expect(elevatedCard).toBeVisible()
    await expect(elevatedCard).toHaveScreenshot('card-elevated.png')

    // Test outlined variant
    const outlinedCard = page.locator('[data-testid="card-outlined"]').first()
    await expect(outlinedCard).toBeVisible()
    await expect(outlinedCard).toHaveScreenshot('card-outlined.png')
  })

  test('renders card sizes', async ({ page }) => {
    // Test small size
    const smallCard = page.locator('[data-testid="card-small"]').first()
    await expect(smallCard).toBeVisible()
    await expect(smallCard).toHaveScreenshot('card-small.png')

    // Test medium size
    const mediumCard = page.locator('[data-testid="card-medium"]').first()
    await expect(mediumCard).toBeVisible()
    await expect(mediumCard).toHaveScreenshot('card-medium.png')

    // Test large size
    const largeCard = page.locator('[data-testid="card-large"]').first()
    await expect(largeCard).toBeVisible()
    await expect(largeCard).toHaveScreenshot('card-large.png')
  })

  test('renders interactive card states', async ({ page }) => {
    const interactiveCard = page.locator('[data-testid="card-interactive"]').first()
    
    // Default state
    await expect(interactiveCard).toBeVisible()
    await expect(interactiveCard).toHaveScreenshot('card-interactive-default.png')
    
    // Hover state
    await interactiveCard.hover()
    await expect(interactiveCard).toHaveScreenshot('card-interactive-hover.png')
  })

  test('renders card with complex content', async ({ page }) => {
    const complexCard = page.locator('[data-testid="card-complex"]').first()
    await expect(complexCard).toBeVisible()
    await expect(complexCard).toHaveScreenshot('card-complex-content.png')
  })

  test('renders responsive card layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    const mobileCard = page.locator('[data-testid="card-responsive"]').first()
    await expect(mobileCard).toBeVisible()
    await expect(mobileCard).toHaveScreenshot('card-mobile.png')

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(mobileCard).toHaveScreenshot('card-tablet.png')

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(mobileCard).toHaveScreenshot('card-desktop.png')
  })

  test('renders card in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.addStyleTag({
      content: `
        html { color-scheme: dark; }
        body { background: #0f0f0f; color: #fff; }
      `
    })
    
    const darkCard = page.locator('[data-testid="card-default"]').first()
    await expect(darkCard).toBeVisible()
    await expect(darkCard).toHaveScreenshot('card-dark-mode.png')
  })

  test('renders card accessibility states', async ({ page }) => {
    const accessibleCard = page.locator('[data-testid="card-accessible"]').first()
    
    // Focus state
    await accessibleCard.focus()
    await expect(accessibleCard).toHaveScreenshot('card-focus.png')
    
    // Check for proper ARIA attributes
    await expect(accessibleCard).toHaveAttribute('role')
    await expect(accessibleCard).toHaveAttribute('aria-label')
  })

  test('renders card loading state', async ({ page }) => {
    const loadingCard = page.locator('[data-testid="card-loading"]').first()
    await expect(loadingCard).toBeVisible()
    await expect(loadingCard).toHaveScreenshot('card-loading.png')
  })

  test('renders card error state', async ({ page }) => {
    const errorCard = page.locator('[data-testid="card-error"]').first()
    await expect(errorCard).toBeVisible()
    await expect(errorCard).toHaveScreenshot('card-error.png')
  })
})