import { Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CreateUserParams {
  email: string
  password: string
  name?: string
  role?: string
}

export async function createTestUser(params: CreateUserParams) {
  try {
    const { email, password, name, role = 'member' } = params
    
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0]
      }
    })
    
    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }
    
    if (!authUser.user) {
      throw new Error('No user returned from auth creation')
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: authUser.user.id,
        email,
        name: name || email.split('@')[0],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.warn('Failed to create user profile:', profileError.message)
    }
    
    return {
      id: authUser.user.id,
      email,
      name: name || email.split('@')[0],
      role
    }
  } catch (error) {
    console.error('Failed to create test user:', error)
    throw error
  }
}

export async function loginUser(page: Page, email: string, password: string) {
  try {
    // Navigate to login page
    await page.goto('/auth/sign-in')
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', password)
    
    // Submit login
    await page.click('[data-testid="sign-in-button"]')
    
    // Wait for successful login (redirect to dashboard)
    await page.waitForURL('**/dashboard**', { timeout: 10000 })
    
    // Verify we're logged in by checking for user menu
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 })
    
    console.log(`Successfully logged in user: ${email}`)
  } catch (error) {
    console.error(`Failed to login user ${email}:`, error)
    throw error
  }
}

export async function logoutUser(page: Page) {
  try {
    // Click user menu
    await page.click('[data-testid="user-menu"]')
    
    // Click logout
    await page.click('[data-testid="logout-button"]')
    
    // Wait for redirect to login page
    await page.waitForURL('**/auth/**', { timeout: 5000 })
    
    console.log('Successfully logged out user')
  } catch (error) {
    console.error('Failed to logout user:', error)
    throw error
  }
}

export async function deleteTestUser(userId: string) {
  try {
    // Delete user profile
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    
    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(userId)
    
    if (error) {
      console.warn(`Failed to delete auth user ${userId}:`, error.message)
    }
    
    console.log(`Successfully deleted test user: ${userId}`)
  } catch (error) {
    console.error(`Failed to delete test user ${userId}:`, error)
  }
}

export async function createUserSession(page: Page, user: any) {
  try {
    // Create a session token for the user
    const { data: session, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email
    })
    
    if (error || !session.properties) {
      throw new Error(`Failed to generate session: ${error?.message}`)
    }
    
    // Navigate to the magic link URL to auto-login
    const url = new URL(session.properties.action_link)
    await page.goto(url.toString())
    
    // Wait for successful login
    await page.waitForURL('**/dashboard**', { timeout: 10000 })
    
    console.log(`Successfully created session for user: ${user.email}`)
  } catch (error) {
    console.error(`Failed to create user session:`, error)
    throw error
  }
}

export async function switchUser(page: Page, fromUser: any, toUser: any) {
  try {
    // Logout current user
    await logoutUser(page)
    
    // Login new user
    await loginUser(page, toUser.email, 'TestPassword123!')
    
    console.log(`Successfully switched from ${fromUser.email} to ${toUser.email}`)
  } catch (error) {
    console.error(`Failed to switch users:`, error)
    throw error
  }
}

export async function impersonateUser(page: Page, targetUserId: string) {
  try {
    // This would be used for admin impersonation features
    // Navigate to admin panel
    await page.goto('/dashboard/admin/users')
    
    // Find user in list
    const userRow = page.locator('[data-testid="user-row"]').filter({ hasText: targetUserId })
    
    // Click impersonate button
    await userRow.locator('[data-testid="impersonate-user"]').click()
    
    // Confirm impersonation
    await page.click('[data-testid="confirm-impersonate"]')
    
    // Wait for impersonation to take effect
    await page.waitForSelector('[data-testid="impersonation-banner"]', { timeout: 5000 })
    
    console.log(`Successfully impersonating user: ${targetUserId}`)
  } catch (error) {
    console.error(`Failed to impersonate user:`, error)
    throw error
  }
}

export async function stopImpersonation(page: Page) {
  try {
    // Click stop impersonation button in banner
    await page.click('[data-testid="stop-impersonation"]')
    
    // Wait for banner to disappear
    await page.waitForSelector('[data-testid="impersonation-banner"]', { state: 'hidden', timeout: 5000 })
    
    console.log('Successfully stopped impersonation')
  } catch (error) {
    console.error('Failed to stop impersonation:', error)
    throw error
  }
}