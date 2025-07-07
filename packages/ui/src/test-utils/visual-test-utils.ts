import { test as base, expect } from '@playwright/test'
import { Page } from '@playwright/test'

// Extend base test with custom fixtures
export const test = base.extend({
  // Add custom fixtures here if needed
})

export { expect }

// Visual regression test helpers
export async function takeComponentScreenshot(
  page: Page,
  componentName: string,
  variantName?: string
) {
  const screenshotName = variantName
    ? `${componentName}-${variantName}.png`
    : `${componentName}.png`
  
  await expect(page).toHaveScreenshot(screenshotName, {
    animations: 'disabled',
    caret: 'hide',
  })
}

// Wait for fonts to load
export async function waitForFontsReady(page: Page) {
  await page.evaluateHandle(() => document.fonts.ready)
}

// Set viewport for different device sizes
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  wide: { width: 1920, height: 1080 },
}

// Test component in different color modes
export async function testColorModes(
  page: Page,
  componentPath: string,
  componentName: string
) {
  // Light mode
  await page.goto(componentPath)
  await waitForFontsReady(page)
  await takeComponentScreenshot(page, componentName, 'light')
  
  // Dark mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-color-mode', 'dark')
  })
  await page.waitForTimeout(100) // Wait for transitions
  await takeComponentScreenshot(page, componentName, 'dark')
}

// Test component in different viewports
export async function testResponsive(
  page: Page,
  componentPath: string,
  componentName: string
) {
  for (const [size, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport)
    await page.goto(componentPath)
    await waitForFontsReady(page)
    await takeComponentScreenshot(page, componentName, size)
  }
}

// Test component states (hover, focus, active)
export async function testInteractionStates(
  page: Page,
  selector: string,
  componentName: string
) {
  const element = page.locator(selector)
  
  // Normal state
  await takeComponentScreenshot(page, componentName, 'normal')
  
  // Hover state
  await element.hover()
  await takeComponentScreenshot(page, componentName, 'hover')
  
  // Focus state
  await element.focus()
  await takeComponentScreenshot(page, componentName, 'focus')
  
  // Active state (if applicable)
  await element.click({ force: true, trial: true })
  await takeComponentScreenshot(page, componentName, 'active')
}