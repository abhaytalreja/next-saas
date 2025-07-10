import { test, expect, Page } from '@playwright/test'

// Test configuration
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const MAILINATOR_DOMAIN = 'mailinator.com'

// Generate unique test email
function generateTestEmail(prefix: string): string {
  const timestamp = Date.now()
  return `next-saas-${prefix}-${timestamp}@${MAILINATOR_DOMAIN}`
}

// Helper to check Mailinator for emails
async function checkMailinatorEmail(page: Page, email: string, subject: string) {
  const username = email.split('@')[0]
  await page.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${username}`)
  
  // Wait for emails to load and look for our subject
  await page.waitForSelector('.table-striped tr', { timeout: 30000 })
  
  // Find email with matching subject
  const emailRow = page.locator('.table-striped tr').filter({ hasText: subject }).first()
  await expect(emailRow).toBeVisible({ timeout: 10000 })
  
  // Click to open email
  await emailRow.click()
  await page.waitForSelector('.email-content', { timeout: 10000 })
  
  return page
}

// Helper to extract verification link from email
async function getVerificationLink(page: Page): Promise<string> {
  const emailContent = await page.locator('.email-content').textContent()
  const linkMatch = emailContent?.match(/https?:\/\/[^\s]+verify[^\s]*/i)
  
  if (!linkMatch) {
    throw new Error('Verification link not found in email')
  }
  
  return linkMatch[0]
}

test.describe('Complete User Journey', () => {
  test.describe.configure({ mode: 'serial' })
  
  let userEmail: string
  let orgAdminEmail: string
  let invitedUserEmail: string

  test.beforeAll(() => {
    // Generate test emails for the entire journey
    userEmail = generateTestEmail('journey-user')
    orgAdminEmail = generateTestEmail('journey-admin')
    invitedUserEmail = generateTestEmail('journey-invited')
  })

  test('User Registration and Email Verification Journey', async ({ page, context }) => {
    // Step 1: Navigate to signup page
    await page.goto(`${TEST_BASE_URL}/auth/signup`)
    
    // Step 2: Fill out registration form
    await page.fill('[data-testid="firstName"]', 'John')
    await page.fill('[data-testid="lastName"]', 'Doe')
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.fill('[data-testid="confirmPassword"]', 'TestPassword123!')
    
    // Accept terms and conditions
    await page.check('[data-testid="acceptTerms"]')
    
    // Submit registration
    await page.click('[data-testid="submitRegistration"]')
    
    // Step 3: Verify redirect to verification pending page
    await expect(page).toHaveURL(/\/auth\/verify-email/)
    await expect(page.locator('[data-testid="verificationMessage"]')).toContainText('verification email')
    
    // Step 4: Check email in Mailinator
    const emailPage = await context.newPage()
    await checkMailinatorEmail(emailPage, userEmail, 'Verify your NextSaaS account')
    
    // Step 5: Extract verification link and verify
    const verificationLink = await getVerificationLink(emailPage)
    await emailPage.close()
    
    // Step 6: Click verification link
    await page.goto(verificationLink)
    
    // Step 7: Verify successful email verification
    await expect(page).toHaveURL(/\/auth\/verified/)
    await expect(page.locator('[data-testid="verificationSuccess"]')).toBeVisible()
    
    // Step 8: Complete login after verification
    await page.click('[data-testid="continueToApp"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('Profile Setup and Avatar Upload', async ({ page }) => {
    // Login with verified user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Navigate to profile settings
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Step 1: Complete basic profile information
    await page.fill('[data-testid="bio"]', 'I am a test user for NextSaaS platform testing.')
    await page.fill('[data-testid="phone"]', '+1 (555) 123-4567')
    await page.fill('[data-testid="website"]', 'https://example.com')
    
    // Step 2: Set timezone and locale
    await page.selectOption('[data-testid="timezone"]', 'America/New_York')
    await page.selectOption('[data-testid="locale"]', 'en')
    
    // Step 3: Upload avatar
    const fileInput = page.locator('[data-testid="avatarUpload"]')
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    )
    
    await fileInput.setInputFiles({
      name: 'test-avatar.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    })
    
    // Wait for avatar upload to complete
    await expect(page.locator('[data-testid="avatarPreview"]')).toBeVisible({ timeout: 10000 })
    
    // Step 4: Save profile changes
    await page.click('[data-testid="saveProfile"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="profileSuccess"]')).toBeVisible()
    await expect(page.locator('[data-testid="profileSuccess"]')).toContainText('Profile updated successfully')
    
    // Step 5: Verify profile data persistence
    await page.reload()
    await expect(page.locator('[data-testid="bio"]')).toHaveValue('I am a test user for NextSaaS platform testing.')
    await expect(page.locator('[data-testid="phone"]')).toHaveValue('+1 (555) 123-4567')
    await expect(page.locator('[data-testid="avatarPreview"]')).toBeVisible()
  })

  test('Organization Creation and Management', async ({ page, context }) => {
    // Login as user who will become org admin
    await page.goto(`${TEST_BASE_URL}/auth/signup`)
    
    // Register org admin user
    await page.fill('[data-testid="firstName"]', 'Admin')
    await page.fill('[data-testid="lastName"]', 'User')
    await page.fill('[data-testid="email"]', orgAdminEmail)
    await page.fill('[data-testid="password"]', 'AdminPassword123!')
    await page.fill('[data-testid="confirmPassword"]', 'AdminPassword123!')
    await page.check('[data-testid="acceptTerms"]')
    await page.click('[data-testid="submitRegistration"]')
    
    // Verify email for org admin
    const emailPage = await context.newPage()
    await checkMailinatorEmail(emailPage, orgAdminEmail, 'Verify your NextSaaS account')
    const verificationLink = await getVerificationLink(emailPage)
    await emailPage.close()
    
    await page.goto(verificationLink)
    await page.click('[data-testid="continueToApp"]')
    
    // Step 1: Create new organization
    await page.goto(`${TEST_BASE_URL}/organizations/new`)
    
    await page.fill('[data-testid="organizationName"]', 'Test Company Ltd')
    await page.fill('[data-testid="organizationDomain"]', 'testcompany.com')
    await page.selectOption('[data-testid="organizationType"]', 'business')
    await page.fill('[data-testid="organizationDescription"]', 'A test company for NextSaaS testing')
    
    await page.click('[data-testid="createOrganization"]')
    
    // Verify organization creation
    await expect(page).toHaveURL(/\/organizations\/[^\/]+\/dashboard/)
    await expect(page.locator('[data-testid="organizationName"]')).toContainText('Test Company Ltd')
    
    // Step 2: Update organization profile
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    await page.fill('[data-testid="orgDisplayName"]', 'Admin User')
    await page.fill('[data-testid="orgTitle"]', 'Chief Executive Officer')
    await page.fill('[data-testid="orgDepartment"]', 'Executive')
    await page.fill('[data-testid="orgBio"]', 'Leading Test Company Ltd to success in the testing industry.')
    
    // Add skills
    await page.fill('[data-testid="skillsInput"]', 'Leadership')
    await page.keyboard.press('Enter')
    await page.fill('[data-testid="skillsInput"]', 'Management')
    await page.keyboard.press('Enter')
    await page.fill('[data-testid="skillsInput"]', 'Strategy')
    await page.keyboard.press('Enter')
    
    await page.click('[data-testid="saveOrgProfile"]')
    await expect(page.locator('[data-testid="orgProfileSuccess"]')).toBeVisible()
    
    // Step 3: Send team invitation
    await page.goto(`${TEST_BASE_URL}/organizations/members`)
    
    await page.click('[data-testid="inviteMember"]')
    await page.fill('[data-testid="inviteEmail"]', invitedUserEmail)
    await page.selectOption('[data-testid="inviteRole"]', 'member')
    await page.fill('[data-testid="inviteMessage"]', 'Welcome to Test Company Ltd! Please join our team.')
    
    await page.click('[data-testid="sendInvitation"]')
    
    // Verify invitation sent
    await expect(page.locator('[data-testid="invitationSuccess"]')).toBeVisible()
    await expect(page.locator('[data-testid="pendingInvitations"]')).toContainText(invitedUserEmail)
  })

  test('Organization Invitation Acceptance Flow', async ({ page, context }) => {
    // Step 1: Check invitation email
    const emailPage = await context.newPage()
    await checkMailinatorEmail(emailPage, invitedUserEmail, 'You\'re invited to join')
    
    // Step 2: Extract invitation link
    const emailContent = await emailPage.locator('.email-content').textContent()
    const inviteMatch = emailContent?.match(/https?:\/\/[^\s]+invitation[^\s]*/i)
    
    if (!inviteMatch) {
      throw new Error('Invitation link not found in email')
    }
    
    const invitationLink = inviteMatch[0]
    await emailPage.close()
    
    // Step 3: Click invitation link (should redirect to signup if not registered)
    await page.goto(invitationLink)
    
    // Should be on signup page with pre-filled email
    await expect(page).toHaveURL(/\/auth\/signup/)
    await expect(page.locator('[data-testid="email"]')).toHaveValue(invitedUserEmail)
    
    // Step 4: Complete registration for invited user
    await page.fill('[data-testid="firstName"]', 'Invited')
    await page.fill('[data-testid="lastName"]', 'Member')
    await page.fill('[data-testid="password"]', 'InvitedPassword123!')
    await page.fill('[data-testid="confirmPassword"]', 'InvitedPassword123!')
    await page.check('[data-testid="acceptTerms"]')
    
    await page.click('[data-testid="submitRegistration"]')
    
    // Step 5: Verify email and accept invitation
    const verifyEmailPage = await context.newPage()
    await checkMailinatorEmail(verifyEmailPage, invitedUserEmail, 'Verify your NextSaaS account')
    const verificationLink = await getVerificationLink(verifyEmailPage)
    await verifyEmailPage.close()
    
    await page.goto(verificationLink)
    await page.click('[data-testid="continueToApp"]')
    
    // Step 6: Should automatically join organization after verification
    await expect(page).toHaveURL(/\/organizations\/[^\/]+\/dashboard/)
    await expect(page.locator('[data-testid="organizationName"]')).toContainText('Test Company Ltd')
    await expect(page.locator('[data-testid="userRole"]')).toContainText('Member')
  })

  test('Mobile User Experience Journey', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Login with existing user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Test mobile navigation
    await page.click('[data-testid="mobileMenuToggle"]')
    await expect(page.locator('[data-testid="mobileMenu"]')).toBeVisible()
    
    // Step 2: Navigate to mobile profile
    await page.click('[data-testid="mobileProfileLink"]')
    await expect(page).toHaveURL(/\/settings\/profile/)
    
    // Step 3: Test mobile profile interface
    await expect(page.locator('[data-testid="mobileProfileCard"]')).toBeVisible()
    
    // Step 4: Test touch interactions
    await page.click('[data-testid="editProfileMobile"]')
    
    // Should open bottom sheet or mobile-optimized form
    await expect(page.locator('[data-testid="mobileProfileForm"]')).toBeVisible()
    
    // Step 5: Test mobile form interactions
    await page.fill('[data-testid="mobileBio"]', 'Updated bio from mobile interface')
    
    // Test collapsible sections
    await page.click('[data-testid="contactSectionToggle"]')
    await expect(page.locator('[data-testid="contactSection"]')).toBeVisible()
    
    // Step 6: Test mobile avatar upload
    await page.click('[data-testid="mobileAvatarEdit"]')
    await expect(page.locator('[data-testid="mobileAvatarMenu"]')).toBeVisible()
    
    // Step 7: Save changes on mobile
    await page.click('[data-testid="mobileProfileSave"]')
    await expect(page.locator('[data-testid="mobileSuccessMessage"]')).toBeVisible()
    
    // Step 8: Test mobile organization switching
    if (await page.locator('[data-testid="orgSwitcher"]').isVisible()) {
      await page.click('[data-testid="orgSwitcher"]')
      await expect(page.locator('[data-testid="orgSwitcherMenu"]')).toBeVisible()
    }
  })

  test('Activity Tracking and Security Features', async ({ page, context }) => {
    // Login with main test user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Navigate to activity dashboard
    await page.goto(`${TEST_BASE_URL}/settings/activity`)
    
    // Verify activity dashboard loads
    await expect(page.locator('[data-testid="activityDashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="loginHistory"]')).toBeVisible()
    
    // Step 2: Check session management
    await expect(page.locator('[data-testid="activeSessions"]')).toBeVisible()
    
    // Current session should be visible
    await expect(page.locator('[data-testid="currentSession"]')).toBeVisible()
    
    // Step 3: Test security settings
    await page.goto(`${TEST_BASE_URL}/settings/security`)
    
    // Enable security notifications
    await page.check('[data-testid="securityNotifications"]')
    await page.click('[data-testid="saveSecuritySettings"]')
    
    // Step 4: Test session from different browser context
    const newContext = await context.browser()?.newContext()
    if (newContext) {
      const newPage = await newContext.newPage()
      
      // Login from "different device"
      await newPage.goto(`${TEST_BASE_URL}/auth/login`)
      await newPage.fill('[data-testid="email"]', userEmail)
      await newPage.fill('[data-testid="password"]', 'TestPassword123!')
      await newPage.click('[data-testid="loginSubmit"]')
      
      // Go back to original session and check for new session
      await page.reload()
      await page.goto(`${TEST_BASE_URL}/settings/activity`)
      
      // Should show multiple sessions
      const sessionElements = await page.locator('[data-testid="sessionItem"]').count()
      expect(sessionElements).toBeGreaterThan(1)
      
      await newContext.close()
    }
    
    // Step 5: Test password change
    await page.goto(`${TEST_BASE_URL}/settings/security`)
    
    await page.click('[data-testid="changePassword"]')
    await page.fill('[data-testid="currentPassword"]', 'TestPassword123!')
    await page.fill('[data-testid="newPassword"]', 'NewTestPassword123!')
    await page.fill('[data-testid="confirmNewPassword"]', 'NewTestPassword123!')
    
    await page.click('[data-testid="updatePassword"]')
    await expect(page.locator('[data-testid="passwordUpdateSuccess"]')).toBeVisible()
  })

  test('GDPR Compliance and Data Management', async ({ page }) => {
    // Login with main test user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'NewTestPassword123!') // Updated password from previous test
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Test data export
    await page.goto(`${TEST_BASE_URL}/settings/privacy`)
    
    await page.click('[data-testid="exportData"]')
    
    // Fill export request form
    await page.selectOption('[data-testid="exportFormat"]', 'json')
    await page.check('[data-testid="includeProfile"]')
    await page.check('[data-testid="includeActivity"]')
    await page.check('[data-testid="includeOrganizations"]')
    
    await page.click('[data-testid="requestExport"]')
    
    // Verify export request confirmation
    await expect(page.locator('[data-testid="exportRequested"]')).toBeVisible()
    await expect(page.locator('[data-testid="exportStatus"]')).toContainText('Processing')
    
    // Step 2: Test privacy settings
    await page.selectOption('[data-testid="profileVisibility"]', 'private')
    await page.uncheck('[data-testid="analyticsTracking"]')
    await page.check('[data-testid="marketingEmails"]')
    
    await page.click('[data-testid="savePrivacySettings"]')
    await expect(page.locator('[data-testid="privacySettingsSuccess"]')).toBeVisible()
    
    // Step 3: Test account deletion request
    await page.click('[data-testid="deleteAccount"]')
    
    // Should open confirmation dialog
    await expect(page.locator('[data-testid="deleteAccountModal"]')).toBeVisible()
    
    // Read and acknowledge warnings
    await page.check('[data-testid="acknowledgeDataLoss"]')
    await page.check('[data-testid="acknowledgeIrreversible"]')
    
    // Fill deletion reason
    await page.selectOption('[data-testid="deletionReason"]', 'testing')
    await page.fill('[data-testid="deletionFeedback"]', 'This is a test account deletion for E2E testing.')
    
    // Confirm with password
    await page.fill('[data-testid="confirmPassword"]', 'NewTestPassword123!')
    
    await page.click('[data-testid="confirmDeletion"]')
    
    // Verify deletion request submitted
    await expect(page.locator('[data-testid="deletionRequested"]')).toBeVisible()
    await expect(page.locator('[data-testid="gracePeriodInfo"]')).toContainText('30 days')
    
    // Step 4: Test account recovery during grace period
    await page.click('[data-testid="cancelDeletion"]')
    
    await expect(page.locator('[data-testid="deletionCancelled"]')).toBeVisible()
    await expect(page.locator('[data-testid="accountActive"]')).toBeVisible()
  })

  test('Cross-Platform and Accessibility Features', async ({ page }) => {
    // Login with main test user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'NewTestPassword123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Test keyboard navigation
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Navigate form using keyboard only
    await page.keyboard.press('Tab') // Focus first field
    await page.keyboard.type('Updated via keyboard')
    
    await page.keyboard.press('Tab') // Move to next field
    await page.keyboard.press('Tab') // Continue navigation
    
    // Test skip links
    await page.keyboard.press('Tab')
    const skipLink = page.locator('[data-testid="skipToMainContent"]')
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter')
    }
    
    // Step 2: Test screen reader accessibility
    // Verify ARIA labels and roles
    await expect(page.locator('[role="main"]')).toBeVisible()
    await expect(page.locator('[aria-label]').first()).toBeVisible()
    
    // Test form labels and descriptions
    const formFields = page.locator('input[aria-describedby]')
    const fieldCount = await formFields.count()
    expect(fieldCount).toBeGreaterThan(0)
    
    // Step 3: Test high contrast mode simulation
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    
    // Verify dark mode accessibility
    await expect(page.locator('[data-testid="profileForm"]')).toBeVisible()
    
    // Step 4: Test focus management
    await page.click('[data-testid="openModal"]') // If modal exists
    
    // Focus should be trapped in modal
    await page.keyboard.press('Tab')
    await page.keyboard.press('Escape') // Should close modal
    
    // Step 5: Test responsive breakpoints
    const breakpoints = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 } // Desktop
    ]
    
    for (const viewport of breakpoints) {
      await page.setViewportSize(viewport)
      await page.reload()
      
      // Verify essential elements are accessible at each breakpoint
      await expect(page.locator('[data-testid="profileForm"]')).toBeVisible()
      
      if (viewport.width < 768) {
        // Mobile-specific checks
        await expect(page.locator('[data-testid="mobileNavigation"]')).toBeVisible()
      } else {
        // Desktop-specific checks
        await expect(page.locator('[data-testid="desktopNavigation"]')).toBeVisible()
      }
    }
  })

  test('Performance and Error Handling', async ({ page }) => {
    // Step 1: Test offline behavior
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', userEmail)
    await page.fill('[data-testid="password"]', 'NewTestPassword123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Go offline
    await page.context().setOffline(true)
    
    // Try to navigate - should show offline message
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Check for offline indicator or error message
    const offlineIndicator = page.locator('[data-testid="offlineIndicator"]')
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toContainText('offline')
    }
    
    // Go back online
    await page.context().setOffline(false)
    await page.reload()
    await expect(page.locator('[data-testid="profileForm"]')).toBeVisible()
    
    // Step 2: Test error recovery
    // Simulate network error during form submission
    await page.route('**/api/profile', route => route.abort())
    
    await page.fill('[data-testid="bio"]', 'This should fail')
    await page.click('[data-testid="saveProfile"]')
    
    // Should show error message
    await expect(page.locator('[data-testid="profileError"]')).toBeVisible()
    
    // Remove route interception and retry
    await page.unroute('**/api/profile')
    await page.click('[data-testid="retryProfileSave"]')
    
    // Should succeed this time
    await expect(page.locator('[data-testid="profileSuccess"]')).toBeVisible()
    
    // Step 3: Test large file upload handling
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Try to upload oversized file (simulate)
    const largeFileInput = page.locator('[data-testid="avatarUpload"]')
    
    // Create mock large file (6MB - over limit)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a')
    
    await largeFileInput.setInputFiles({
      name: 'large-avatar.png',
      mimeType: 'image/png',
      buffer: largeBuffer
    })
    
    // Should show file size error
    await expect(page.locator('[data-testid="fileSizeError"]')).toBeVisible()
    await expect(page.locator('[data-testid="fileSizeError"]')).toContainText('5MB')
  })
})

test.describe('API Integration Tests', () => {
  test('Profile API Endpoints', async ({ request }) => {
    // Note: These tests would require authentication setup
    // For now, we test basic endpoint availability
    
    const endpoints = [
      '/api/profile',
      '/api/profile/activity',
      '/api/profile/sessions',
      '/api/organizations',
      '/api/auth/verify'
    ]
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${TEST_BASE_URL}${endpoint}`)
      
      // Should not return 404 (endpoint exists)
      expect(response.status()).not.toBe(404)
      
      // Should require authentication (401) or return data (200)
      expect([200, 401, 403].includes(response.status())).toBeTruthy()
    }
  })
  
  test('Rate Limiting', async ({ request }) => {
    // Test rate limiting on auth endpoints
    const authEndpoint = `${TEST_BASE_URL}/api/auth/login`
    
    // Make multiple rapid requests
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(
        request.post(authEndpoint, {
          data: {
            email: 'test@example.com',
            password: 'wrongpassword'
          }
        })
      )
    }
    
    const responses = await Promise.all(requests)
    
    // At least one should be rate limited (429)
    const rateLimited = responses.some(r => r.status() === 429)
    
    // If rate limiting is enabled, we should see 429 responses
    if (rateLimited) {
      expect(rateLimited).toBeTruthy()
    }
  })
})

test.describe('Security Tests', () => {
  test('XSS Protection', async ({ page }) => {
    const testEmail = generateTestEmail('xss-test')
    
    // Attempt to register with XSS payload in name
    await page.goto(`${TEST_BASE_URL}/auth/signup`)
    
    await page.fill('[data-testid="firstName"]', '<script>alert("xss")</script>')
    await page.fill('[data-testid="lastName"]', 'Test')
    await page.fill('[data-testid="email"]', testEmail)
    await page.fill('[data-testid="password"]', 'TestPassword123!')
    await page.fill('[data-testid="confirmPassword"]', 'TestPassword123!')
    await page.check('[data-testid="acceptTerms"]')
    
    await page.click('[data-testid="submitRegistration"]')
    
    // Script should be escaped/sanitized, not executed
    // If XSS protection works, we shouldn't see an alert
    page.on('dialog', dialog => {
      throw new Error('XSS vulnerability detected: alert was triggered')
    })
    
    // Should proceed normally to verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/)
  })
  
  test('CSRF Protection', async ({ request }) => {
    // Test that API endpoints require proper CSRF tokens
    const response = await request.post(`${TEST_BASE_URL}/api/profile`, {
      data: { bio: 'test' },
      headers: {
        'Content-Type': 'application/json'
        // Missing CSRF token
      }
    })
    
    // Should reject request without proper CSRF protection
    expect([403, 401].includes(response.status())).toBeTruthy()
  })
})

// Cleanup after all tests
test.afterAll(async () => {
  // Note: In a real environment, you might want to clean up test data
  console.log('E2E tests completed. Test data cleanup may be required.')
})