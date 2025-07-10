import { test as setup, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const authFile = 'playwright/.auth/user.json'

// Test user credentials
const TEST_USER_EMAIL = process.env.E2E_TEST_EMAIL || `e2e-test-${Date.now()}@example.com`
const TEST_USER_PASSWORD = process.env.E2E_TEST_PASSWORD || 'e2e-test-password-123'

setup('authenticate user', async ({ page }) => {
  // Skip setup if no Supabase credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Skipping E2E auth setup - Supabase credentials not provided')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Create test user using admin API
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    })

    if (createError && !createError.message.includes('already exists')) {
      throw createError
    }

    const userId = userData?.user?.id || 'existing-user'

    // Create or update test profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: TEST_USER_EMAIL,
      first_name: 'E2E',
      last_name: 'Test',
      display_name: 'e2etest',
      bio: 'E2E test user profile',
    })

    console.log(`Test user created/verified: ${TEST_USER_EMAIL}`)
  } catch (error) {
    console.warn('Failed to create test user:', error)
  }

  // Navigate to sign-in page
  await page.goto('/auth/sign-in')

  // Fill in credentials
  await page.fill('input[name="email"]', TEST_USER_EMAIL)
  await page.fill('input[name="password"]', TEST_USER_PASSWORD)

  // Click sign in button
  await page.click('button[type="submit"]')

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

  // Verify user is logged in by checking for user-specific content
  await expect(page.locator('text=E2E Test')).toBeVisible({ timeout: 5000 })

  // Save signed-in state to reuse in other tests
  await page.context().storageState({ path: authFile })

  console.log('Authentication setup completed successfully')
})

setup.describe.configure({ mode: 'serial' })