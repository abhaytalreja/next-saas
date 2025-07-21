import { test, expect, Page } from '@playwright/test'

// Test user credentials
const TEST_USER = {
  email: 'test@nextsaas.test',
  password: 'TestPassword123!',
  firstName: 'John',
  lastName: 'Doe',
}

const PROJECT_URL = 'http://localhost:3010/dashboard/projects/d98ae559-7842-4fa4-893f-a9f4538688c9'

test.describe('Authentication Flow - Fixed Issues', () => {
  test.describe.configure({ mode: 'serial' })

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('should redirect unauthenticated users to sign-in page (not login)', async () => {
    // Go to protected project page
    await page.goto(PROJECT_URL)

    // Should redirect to sign-in (not login) with proper redirect parameter
    await expect(page).toHaveURL(/\/auth\/sign-in/)
    await expect(page.url()).toContain('redirect=')
    
    // Should NOT redirect to the old /auth/login route
    expect(page.url()).not.toContain('/auth/login')
  })

  test('should display sign-in page with marketing layout', async () => {
    await page.goto('http://localhost:3010/auth/sign-in')

    // Verify page loads without module resolution errors
    await expect(page.locator('[data-testid="auth-layout"]')).toBeVisible()
    await expect(page.locator('[data-testid="auth-form-card"]')).toBeVisible()
    
    // Verify sign-in form is present
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Verify marketing content is visible
    await expect(page.locator('[data-testid="auth-sidebar"]')).toBeVisible()
  })

  test('should handle sign-in with unified Supabase client', async () => {
    await page.goto('http://localhost:3010/auth/sign-in')

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    
    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or originally requested page
    // Note: This might redirect back to the project URL if that was the original request
    await page.waitForURL(/dashboard|projects/)
    
    // Verify no authentication errors
    const errorMessage = page.locator('[data-testid="error-message"]')
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent()
      expect(errorText).not.toContain('401')
      expect(errorText).not.toContain('Unauthorized')
    }
  })

  test('should access protected project page after authentication', async () => {
    // Ensure user is signed in from previous test
    await page.goto(PROJECT_URL)

    // Should NOT get 401 errors
    await page.waitForLoadState('networkidle')
    
    // Check for authentication error indicators
    const errorText = await page.textContent('body')
    expect(errorText).not.toContain('401')
    expect(errorText).not.toContain('Unauthorized')
    expect(errorText).not.toContain('Authentication required')
    
    // Should show project content
    await expect(page.locator('[data-testid="project-container"]')).toBeVisible()
    
    // Verify project header is visible
    const projectHeader = page.locator('h1')
    await expect(projectHeader).toBeVisible()
  })

  test('should display project activity without database column errors', async () => {
    await page.goto(PROJECT_URL)

    // Click on Activity tab
    await page.click('button:has-text("Activity")')
    
    // Should not show database column errors
    const errorText = await page.textContent('body')
    expect(errorText).not.toContain('full_name does not exist')
    expect(errorText).not.toContain('column users_1.full_name does not exist')
    
    // Should show activity content or empty state
    const activityContent = page.locator('[data-testid="activity-content"]')
    const noActivityMessage = page.locator('text=No activity yet')
    
    // Either activities should be visible or empty state should be shown
    const hasActivity = await activityContent.isVisible()
    const hasEmptyState = await noActivityMessage.isVisible()
    
    expect(hasActivity || hasEmptyState).toBe(true)
  })

  test('should handle activity user names correctly', async () => {
    await page.goto(PROJECT_URL)
    await page.click('button:has-text("Activity")')
    
    // Look for any activity items
    const activityItems = page.locator('[data-testid="activity-item"]')
    const activityCount = await activityItems.count()
    
    if (activityCount > 0) {
      // Check that user names are displayed properly (not "Unknown")
      const firstActivity = activityItems.first()
      const activityText = await firstActivity.textContent()
      
      // Should not show malformed text like "tappect+org1@gmail.comCreated projects Unknown"
      expect(activityText).not.toMatch(/[a-zA-Z]+@[a-zA-Z]+\.[a-zA-Z]+[A-Z][a-z]+\s+[a-z]+\s+Unknown/)
      
      // Should show proper formatting
      if (activityText?.includes('created') || activityText?.includes('updated')) {
        expect(activityText).toMatch(/^[A-Za-z\s@.]+\s+(created|updated)\s+/)
      }
    }
  })

  test('should display proper project layout with padding', async () => {
    await page.goto(PROJECT_URL)
    
    // Check that the project container has proper padding
    const projectContainer = page.locator('[data-testid="project-container"]')
    await expect(projectContainer).toBeVisible()
    
    // Verify responsive design classes are applied
    const containerClasses = await projectContainer.getAttribute('class')
    expect(containerClasses).toContain('p-6') // Padding
    expect(containerClasses).toContain('max-w-7xl') // Max width
    expect(containerClasses).toContain('mx-auto') // Center alignment
  })

  test('should show properly styled activity cards', async () => {
    await page.goto(PROJECT_URL)
    await page.click('button:has-text("Activity")')
    
    // Check for activity card styling
    const activityCards = page.locator('[data-testid="activity-card"]')
    const cardCount = await activityCards.count()
    
    if (cardCount > 0) {
      const firstCard = activityCards.first()
      const cardClasses = await firstCard.getAttribute('class')
      
      // Verify proper styling classes
      expect(cardClasses).toContain('border') // Has border
      expect(cardClasses).toContain('rounded') // Rounded corners
      expect(cardClasses).toContain('p-4') // Padding
      expect(cardClasses).toContain('hover:bg-gray-50') // Hover effect
    }
  })

  test('should handle sign-out and redirect correctly', async () => {
    // Ensure we're on a protected page
    await page.goto(PROJECT_URL)
    
    // Find and click sign-out button (usually in account dropdown)
    const accountDropdown = page.locator('[data-testid="account-dropdown"]')
    if (await accountDropdown.isVisible()) {
      await accountDropdown.click()
      await page.click('button:has-text("Sign Out")')
    } else {
      // Alternative: look for sign-out in navigation
      await page.click('text=Sign Out')
    }
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/sign-in/)
    
    // Verify we can't access protected content anymore
    await page.goto(PROJECT_URL)
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })

  test('should prevent access with expired/invalid tokens', async () => {
    // Clear all browser storage to simulate expired session
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // Clear cookies
    await page.context().clearCookies()
    
    // Try to access protected page
    await page.goto(PROJECT_URL)
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/sign-in/)
  })

  test('should maintain consistent session state across tabs', async () => {
    // Sign in first
    await page.goto('http://localhost:3010/auth/sign-in')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/)
    
    // Open new tab
    const newTab = await page.context().newPage()
    
    // Both tabs should have consistent authentication state
    await page.goto(PROJECT_URL)
    await newTab.goto(PROJECT_URL)
    
    // Both should be able to access the project
    await expect(page.locator('[data-testid="project-container"]')).toBeVisible()
    await expect(newTab.locator('[data-testid="project-container"]')).toBeVisible()
    
    await newTab.close()
  })
})

test.describe('Route Configuration Tests', () => {
  test('should use correct auth routes throughout the app', async ({ page }) => {
    // Test that all auth links point to correct routes
    await page.goto('http://localhost:3010/')
    
    // Look for sign-in links (should be /auth/sign-in, not /auth/login)
    const signInLinks = page.locator('a[href*="/auth/sign-in"]')
    const loginLinks = page.locator('a[href*="/auth/login"]') // Old incorrect route
    
    const signInCount = await signInLinks.count()
    const loginCount = await loginLinks.count()
    
    // Should have sign-in links but no login links
    expect(loginCount).toBe(0)
    
    if (signInCount > 0) {
      const firstSignInLink = await signInLinks.first().getAttribute('href')
      expect(firstSignInLink).toContain('/auth/sign-in')
    }
  })

  test('should use correct sign-up route', async ({ page }) => {
    await page.goto('http://localhost:3010/auth/sign-in')
    
    // Look for sign-up link
    const signUpLink = page.locator('a[href*="/auth/sign-up"]')
    await expect(signUpLink).toBeVisible()
    
    // Click it and verify it loads correctly
    await signUpLink.click()
    await expect(page).toHaveURL(/\/auth\/sign-up/)
    
    // Verify page loads without errors
    await expect(page.locator('[data-testid="auth-layout"]')).toBeVisible()
  })
})