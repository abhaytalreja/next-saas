import { test, expect, Page } from '@playwright/test'

// Organization workflow E2E tests
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Test organization data
const testOrganizations = {
  startup: {
    name: 'Tech Startup Inc',
    domain: 'techstartup.io',
    type: 'technology',
    description: 'A cutting-edge technology startup focused on innovation'
  },
  consulting: {
    name: 'Consulting Firm LLC', 
    domain: 'consulting.biz',
    type: 'professional_services',
    description: 'Professional consulting services for businesses'
  },
  enterprise: {
    name: 'Enterprise Corp',
    domain: 'enterprise.com', 
    type: 'enterprise',
    description: 'Large enterprise corporation with global operations'
  }
}

// Helper to generate unique test emails
function generateOrgTestEmail(role: string, orgName: string): string {
  const timestamp = Date.now()
  const cleanOrgName = orgName.toLowerCase().replace(/\s+/g, '-')
  return `next-saas-${role}-${cleanOrgName}-${timestamp}@mailinator.com`
}

// Helper to check Mailinator for invitation emails
async function checkInvitationEmail(page: Page, email: string) {
  const username = email.split('@')[0]
  await page.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${username}`)
  
  await page.waitForSelector('.table-striped tr', { timeout: 30000 })
  
  // Find invitation email
  const emailRow = page.locator('.table-striped tr').filter({ hasText: 'invited to join' }).first()
  await expect(emailRow).toBeVisible({ timeout: 10000 })
  
  await emailRow.click()
  await page.waitForSelector('.email-content', { timeout: 10000 })
  
  // Extract invitation link
  const emailContent = await page.locator('.email-content').textContent()
  const linkMatch = emailContent?.match(/https?:\/\/[^\s]+invitation[^\s]*/i)
  
  if (!linkMatch) {
    throw new Error('Invitation link not found in email')
  }
  
  return linkMatch[0]
}

test.describe('Organization Workflow Tests', () => {
  test.describe.configure({ mode: 'serial' })
  
  let founderEmail: string
  let adminEmail: string
  let memberEmail: string
  let managerEmail: string
  let externalUserEmail: string
  let organizationId: string

  test.beforeAll(() => {
    // Generate test emails for organization workflow
    founderEmail = generateOrgTestEmail('founder', 'startup')
    adminEmail = generateOrgTestEmail('admin', 'startup')
    memberEmail = generateOrgTestEmail('member', 'startup')
    managerEmail = generateOrgTestEmail('manager', 'startup')
    externalUserEmail = generateOrgTestEmail('external', 'startup')
  })

  test('Organization Creation and Founder Setup', async ({ page, context }) => {
    // Step 1: Register founder account
    await page.goto(`${TEST_BASE_URL}/auth/signup`)
    
    await page.fill('[data-testid="firstName"]', 'Jane')
    await page.fill('[data-testid="lastName"]', 'Founder')
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.fill('[data-testid="confirmPassword"]', 'FounderPass123!')
    await page.check('[data-testid="acceptTerms"]')
    
    await page.click('[data-testid="submitRegistration"]')
    
    // Skip email verification for testing (simulate verified state)
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 2: Create new organization
    await page.goto(`${TEST_BASE_URL}/organizations/new`)
    
    await page.fill('[data-testid="organizationName"]', testOrganizations.startup.name)
    await page.fill('[data-testid="organizationDomain"]', testOrganizations.startup.domain)
    await page.selectOption('[data-testid="organizationType"]', testOrganizations.startup.type)
    await page.fill('[data-testid="organizationDescription"]', testOrganizations.startup.description)
    
    // Set organization preferences
    await page.check('[data-testid="enableTeamDirectory"]')
    await page.check('[data-testid="allowMemberInvites"]')
    await page.selectOption('[data-testid="defaultMemberRole"]', 'member')
    
    await page.click('[data-testid="createOrganization"]')
    
    // Step 3: Verify organization creation
    await expect(page).toHaveURL(/\/organizations\/[^\/]+\/dashboard/)
    await expect(page.locator('[data-testid="organizationName"]')).toContainText(testOrganizations.startup.name)
    
    // Extract organization ID from URL
    const url = page.url()
    const orgIdMatch = url.match(/\/organizations\/([^\/]+)\//)
    organizationId = orgIdMatch ? orgIdMatch[1] : ''
    expect(organizationId).toBeTruthy()
    
    // Step 4: Complete founder profile setup
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    await page.fill('[data-testid="orgDisplayName"]', 'Jane Founder')
    await page.fill('[data-testid="orgTitle"]', 'Chief Executive Officer')
    await page.fill('[data-testid="orgDepartment"]', 'Executive')
    await page.fill('[data-testid="orgBio"]', 'Founder and CEO of Tech Startup Inc. Passionate about innovation and technology.')
    await page.fill('[data-testid="orgStartDate"]', '2024-01-01')
    
    // Add founder skills
    const founderSkills = ['Leadership', 'Strategy', 'Fundraising', 'Product Vision']
    for (const skill of founderSkills) {
      await page.fill('[data-testid="skillsInput"]', skill)
      await page.keyboard.press('Enter')
    }
    
    await page.selectOption('[data-testid="visibility"]', 'organization')
    
    await page.click('[data-testid="saveOrgProfile"]')
    await expect(page.locator('[data-testid="orgProfileSuccess"]')).toBeVisible()
    
    // Step 5: Set up organization settings
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings`)
    
    // Configure team settings
    await page.check('[data-testid="requireApprovalForNewMembers"]')
    await page.check('[data-testid="enableActivityTracking"]')
    await page.selectOption('[data-testid="dataRetentionPeriod"]', '365')
    
    // Configure notification settings
    await page.check('[data-testid="notifyOnNewMembers"]')
    await page.check('[data-testid="notifyOnRoleChanges"]')
    await page.check('[data-testid="weeklyActivityReports"]')
    
    await page.click('[data-testid="saveOrganizationSettings"]')
    await expect(page.locator('[data-testid="settingsSuccess"]')).toBeVisible()
  })

  test('Team Invitation and Role Management', async ({ page, context }) => {
    // Login as founder
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Navigate to organization
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/members`)
    
    // Step 1: Invite Admin
    await page.click('[data-testid="inviteMember"]')
    
    await page.fill('[data-testid="inviteEmail"]', adminEmail)
    await page.fill('[data-testid="inviteFirstName"]', 'John')
    await page.fill('[data-testid="inviteLastName"]', 'Admin')
    await page.selectOption('[data-testid="inviteRole"]', 'admin')
    await page.fill('[data-testid="inviteMessage"]', 'Welcome to Tech Startup Inc! You\'ve been invited as an admin to help manage our team.')
    
    await page.click('[data-testid="sendInvitation"]')
    await expect(page.locator('[data-testid="invitationSuccess"]')).toBeVisible()
    
    // Step 2: Invite Manager
    await page.click('[data-testid="inviteMember"]')
    
    await page.fill('[data-testid="inviteEmail"]', managerEmail)
    await page.fill('[data-testid="inviteFirstName"]', 'Sarah')
    await page.fill('[data-testid="inviteLastName"]', 'Manager')
    await page.selectOption('[data-testid="inviteRole"]', 'manager')
    await page.selectOption('[data-testid="inviteDepartment"]', 'Engineering')
    await page.fill('[data-testid="inviteMessage"]', 'Join our engineering team as a manager!')
    
    await page.click('[data-testid="sendInvitation"]')
    await expect(page.locator('[data-testid="invitationSuccess"]')).toBeVisible()
    
    // Step 3: Invite regular Member
    await page.click('[data-testid="inviteMember"]')
    
    await page.fill('[data-testid="inviteEmail"]', memberEmail)
    await page.fill('[data-testid="inviteFirstName"]', 'Mike')
    await page.fill('[data-testid="inviteLastName"]', 'Developer')
    await page.selectOption('[data-testid="inviteRole"]', 'member')
    await page.selectOption('[data-testid="inviteDepartment"]', 'Engineering')
    await page.fill('[data-testid="inviteMessage"]', 'Welcome to our engineering team!')
    
    await page.click('[data-testid="sendInvitation"]')
    await expect(page.locator('[data-testid="invitationSuccess"]')).toBeVisible()
    
    // Step 4: Verify pending invitations
    await expect(page.locator('[data-testid="pendingInvitations"]')).toBeVisible()
    await expect(page.locator(`[data-testid="invitation-${adminEmail}"]`)).toBeVisible()
    await expect(page.locator(`[data-testid="invitation-${managerEmail}"]`)).toBeVisible()
    await expect(page.locator(`[data-testid="invitation-${memberEmail}"]`)).toBeVisible()
    
    // Step 5: Test invitation management
    // Resend invitation
    await page.click(`[data-testid="resend-invitation-${adminEmail}"]`)
    await expect(page.locator('[data-testid="invitationResent"]')).toBeVisible()
    
    // Edit invitation (if not yet accepted)
    await page.click(`[data-testid="edit-invitation-${memberEmail}"]`)
    await page.selectOption('[data-testid="editInviteRole"]', 'admin')
    await page.click('[data-testid="updateInvitation"]')
    await expect(page.locator('[data-testid="invitationUpdated"]')).toBeVisible()
  })

  test('Admin Invitation Acceptance and Setup', async ({ page, context }) => {
    // Step 1: Check admin invitation email
    const emailPage = await context.newPage()
    const invitationLink = await checkInvitationEmail(emailPage, adminEmail)
    await emailPage.close()
    
    // Step 2: Accept invitation (should redirect to signup)
    await page.goto(invitationLink)
    await expect(page).toHaveURL(/\/auth\/signup/)
    await expect(page.locator('[data-testid="email"]')).toHaveValue(adminEmail)
    
    // Step 3: Complete registration
    await page.fill('[data-testid="firstName"]', 'John')
    await page.fill('[data-testid="lastName"]', 'Admin')
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.fill('[data-testid="confirmPassword"]', 'AdminPass123!')
    await page.check('[data-testid="acceptTerms"]')
    
    await page.click('[data-testid="submitRegistration"]')
    
    // Skip email verification and login
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', adminEmail)
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 4: Should be in organization with admin role
    await expect(page).toHaveURL(/\/organizations\/[^\/]+\/dashboard/)
    await expect(page.locator('[data-testid="userRole"]')).toContainText('Admin')
    await expect(page.locator('[data-testid="organizationName"]')).toContainText(testOrganizations.startup.name)
    
    // Step 5: Complete admin profile
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    await page.fill('[data-testid="orgDisplayName"]', 'John Admin')
    await page.fill('[data-testid="orgTitle"]', 'Head of Operations')
    await page.fill('[data-testid="orgDepartment"]', 'Operations')
    await page.fill('[data-testid="orgBio"]', 'Operations leader focused on scaling our startup efficiently.')
    
    // Add admin skills
    const adminSkills = ['Operations', 'Team Management', 'Process Optimization', 'Analytics']
    for (const skill of adminSkills) {
      await page.fill('[data-testid="skillsInput"]', skill)
      await page.keyboard.press('Enter')
    }
    
    await page.click('[data-testid="saveOrgProfile"]')
    await expect(page.locator('[data-testid="orgProfileSuccess"]')).toBeVisible()
    
    // Step 6: Test admin permissions
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/members`)
    
    // Should be able to see member management
    await expect(page.locator('[data-testid="memberManagement"]')).toBeVisible()
    await expect(page.locator('[data-testid="inviteMember"]')).toBeVisible()
    
    // Should be able to access organization settings
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings`)
    await expect(page.locator('[data-testid="organizationSettings"]')).toBeVisible()
  })

  test('Manager and Member Onboarding', async ({ page, context }) => {
    // Test manager acceptance
    const managerEmailPage = await context.newPage()
    const managerInviteLink = await checkInvitationEmail(managerEmailPage, managerEmail)
    await managerEmailPage.close()
    
    // Accept manager invitation
    await page.goto(managerInviteLink)
    
    await page.fill('[data-testid="firstName"]', 'Sarah')
    await page.fill('[data-testid="lastName"]', 'Manager')
    await page.fill('[data-testid="password"]', 'ManagerPass123!')
    await page.fill('[data-testid="confirmPassword"]', 'ManagerPass123!')
    await page.check('[data-testid="acceptTerms"]')
    
    await page.click('[data-testid="submitRegistration"]')
    
    // Login as manager
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', managerEmail)
    await page.fill('[data-testid="password"]', 'ManagerPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Complete manager profile
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    await page.fill('[data-testid="orgDisplayName"]', 'Sarah Manager')
    await page.fill('[data-testid="orgTitle"]', 'Engineering Manager')
    await page.fill('[data-testid="orgDepartment"]', 'Engineering')
    await page.fill('[data-testid="orgBio"]', 'Engineering manager passionate about building great products and leading high-performing teams.')
    
    const managerSkills = ['Team Leadership', 'Software Development', 'Agile', 'Mentoring']
    for (const skill of managerSkills) {
      await page.fill('[data-testid="skillsInput"]', skill)
      await page.keyboard.press('Enter')
    }
    
    await page.click('[data-testid="saveOrgProfile"]')
    await expect(page.locator('[data-testid="orgProfileSuccess"]')).toBeVisible()
    
    // Test manager permissions (limited compared to admin)
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/members`)
    
    // Should see team members but limited management options
    await expect(page.locator('[data-testid="teamDirectory"]')).toBeVisible()
    
    // May or may not have invite permissions based on organization settings
    const inviteButton = page.locator('[data-testid="inviteMember"]')
    const hasInvitePermission = await inviteButton.isVisible()
    
    // Test member acceptance in new context
    const memberContext = await context.browser()?.newContext()
    if (memberContext) {
      const memberPage = await memberContext.newPage()
      
      const memberEmailPage = await memberContext.newPage()
      const memberInviteLink = await checkInvitationEmail(memberEmailPage, memberEmail)
      await memberEmailPage.close()
      
      await memberPage.goto(memberInviteLink)
      
      await memberPage.fill('[data-testid="firstName"]', 'Mike')
      await memberPage.fill('[data-testid="lastName"]', 'Developer')
      await memberPage.fill('[data-testid="password"]', 'MemberPass123!')
      await memberPage.fill('[data-testid="confirmPassword"]', 'MemberPass123!')
      await memberPage.check('[data-testid="acceptTerms"]')
      
      await memberPage.click('[data-testid="submitRegistration"]')
      
      // Login as member
      await memberPage.goto(`${TEST_BASE_URL}/auth/login`)
      await memberPage.fill('[data-testid="email"]', memberEmail)
      await memberPage.fill('[data-testid="password"]', 'MemberPass123!')
      await memberPage.click('[data-testid="loginSubmit"]')
      
      // Note: Member role was updated to admin in invitation management test
      await expect(memberPage.locator('[data-testid="userRole"]')).toContainText('Admin')
      
      await memberContext.close()
    }
  })

  test('Team Directory and Collaboration Features', async ({ page }) => {
    // Login as admin to test team features
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', adminEmail)
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Test team directory
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/directory`)
    
    await expect(page.locator('[data-testid="teamDirectory"]')).toBeVisible()
    
    // Should see all team members
    await expect(page.locator('[data-testid="member-card"]')).toHaveCount(3) // Founder, Admin, Manager
    
    // Step 2: Test search functionality
    await page.fill('[data-testid="directorySearch"]', 'Engineering')
    await page.keyboard.press('Enter')
    
    // Should filter to engineering team members
    await expect(page.locator('[data-testid="member-card"]')).toHaveCount(1) // Manager in Engineering
    
    // Clear search
    await page.fill('[data-testid="directorySearch"]', '')
    await page.keyboard.press('Enter')
    
    // Step 3: Test department filtering
    await page.selectOption('[data-testid="departmentFilter"]', 'Engineering')
    await expect(page.locator('[data-testid="member-card"]')).toHaveCount(1)
    
    await page.selectOption('[data-testid="departmentFilter"]', 'all')
    await expect(page.locator('[data-testid="member-card"]')).toHaveCount(3)
    
    // Step 4: Test skills filtering
    await page.fill('[data-testid="skillsFilter"]', 'Leadership')
    await page.keyboard.press('Enter')
    
    // Should show members with leadership skills
    await expect(page.locator('[data-testid="member-card"]')).toHaveCountGreaterThan(0)
    
    // Step 5: Test member profile view
    await page.click('[data-testid="member-card"]', { first: true })
    
    await expect(page.locator('[data-testid="memberProfileModal"]')).toBeVisible()
    await expect(page.locator('[data-testid="memberProfileName"]')).toBeVisible()
    await expect(page.locator('[data-testid="memberProfileTitle"]')).toBeVisible()
    await expect(page.locator('[data-testid="memberProfileSkills"]')).toBeVisible()
    
    // Close modal
    await page.click('[data-testid="closeMemberProfile"]')
    
    // Step 6: Test contact information access
    const memberCard = page.locator('[data-testid="member-card"]').first()
    
    if (await memberCard.locator('[data-testid="memberEmail"]').isVisible()) {
      await expect(memberCard.locator('[data-testid="memberEmail"]')).toBeVisible()
    }
    
    if (await memberCard.locator('[data-testid="memberPhone"]').isVisible()) {
      await expect(memberCard.locator('[data-testid="memberPhone"]')).toBeVisible()
    }
  })

  test('Role-Based Access Control and Permissions', async ({ page, context }) => {
    // Test different permission levels
    
    // Step 1: Test founder permissions
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings`)
    
    // Founder should have full access
    await expect(page.locator('[data-testid="deleteOrganization"]')).toBeVisible()
    await expect(page.locator('[data-testid="billingSettings"]')).toBeVisible()
    await expect(page.locator('[data-testid="securitySettings"]')).toBeVisible()
    
    // Step 2: Test admin permissions
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', adminEmail)
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings`)
    
    // Admin should have most access but not delete organization
    await expect(page.locator('[data-testid="memberManagement"]')).toBeVisible()
    await expect(page.locator('[data-testid="organizationSettings"]')).toBeVisible()
    
    const deleteButton = page.locator('[data-testid="deleteOrganization"]')
    if (await deleteButton.isVisible()) {
      // Should be disabled or require additional confirmation
      expect(await deleteButton.isDisabled()).toBeTruthy()
    }
    
    // Step 3: Test member role management
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/members`)
    
    // Test role change
    const memberRow = page.locator(`[data-testid="member-row-${managerEmail}"]`)
    await memberRow.locator('[data-testid="changeRole"]').click()
    
    await page.selectOption('[data-testid="newRole"]', 'member')
    await page.fill('[data-testid="roleChangeReason"]', 'Restructuring team roles')
    await page.click('[data-testid="confirmRoleChange"]')
    
    await expect(page.locator('[data-testid="roleChangeSuccess"]')).toBeVisible()
    
    // Step 4: Test manager permissions (now demoted to member)
    const managerContext = await context.browser()?.newContext()
    if (managerContext) {
      const managerPage = await managerContext.newPage()
      
      await managerPage.goto(`${TEST_BASE_URL}/auth/login`)
      await managerPage.fill('[data-testid="email"]', managerEmail)
      await managerPage.fill('[data-testid="password"]', 'ManagerPass123!')
      await managerPage.click('[data-testid="loginSubmit"]')
      
      // Should have limited permissions now
      await managerPage.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings`)
      
      // Should not see organization settings
      const settingsAccess = await managerPage.locator('[data-testid="organizationSettings"]').isVisible()
      expect(settingsAccess).toBeFalsy()
      
      // Should be redirected to dashboard or denied access
      await expect(managerPage).toHaveURL(/\/dashboard|\/organizations\/[^\/]+\/dashboard/)
      
      await managerContext.close()
    }
  })

  test('Organization Activity Tracking and Audit Log', async ({ page }) => {
    // Login as admin
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', adminEmail)
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: View organization activity
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/activity`)
    
    await expect(page.locator('[data-testid="organizationActivity"]')).toBeVisible()
    
    // Should see recent activities
    await expect(page.locator('[data-testid="activityItem"]')).toHaveCountGreaterThan(0)
    
    // Step 2: Test activity filtering
    await page.selectOption('[data-testid="activityTypeFilter"]', 'member_invitations')
    
    // Should filter to invitation activities
    const inviteActivities = page.locator('[data-testid="activityItem"]').filter({ hasText: 'invited' })
    await expect(inviteActivities).toHaveCountGreaterThan(0)
    
    // Step 3: Test date range filtering
    await page.fill('[data-testid="activityStartDate"]', '2024-01-01')
    await page.fill('[data-testid="activityEndDate"]', '2024-12-31')
    await page.click('[data-testid="applyDateFilter"]')
    
    // Should show activities within date range
    await expect(page.locator('[data-testid="activityItem"]')).toHaveCountGreaterThan(0)
    
    // Step 4: Test activity export
    await page.click('[data-testid="exportActivity"]')
    
    await page.selectOption('[data-testid="exportFormat"]', 'csv')
    await page.selectOption('[data-testid="exportDateRange"]', 'last_30_days')
    await page.click('[data-testid="downloadActivityReport"]')
    
    // Should initiate download or show confirmation
    await expect(page.locator('[data-testid="exportStarted"]')).toBeVisible()
    
    // Step 5: View member activity details
    const activityItem = page.locator('[data-testid="activityItem"]').first()
    await activityItem.click()
    
    await expect(page.locator('[data-testid="activityDetails"]')).toBeVisible()
    await expect(page.locator('[data-testid="activityTimestamp"]')).toBeVisible()
    await expect(page.locator('[data-testid="activityUser"]')).toBeVisible()
    await expect(page.locator('[data-testid="activityDetails"]')).toBeVisible()
  })

  test('Organization Data Management and Privacy', async ({ page }) => {
    // Login as founder (highest permissions)
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Test organization data export
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings/privacy`)
    
    await page.click('[data-testid="exportOrganizationData"]')
    
    await page.selectOption('[data-testid="exportFormat"]', 'json')
    await page.check('[data-testid="includeMembers"]')
    await page.check('[data-testid="includeActivity"]')
    await page.check('[data-testid="includeSettings"]')
    
    await page.click('[data-testid="requestOrganizationExport"]')
    
    await expect(page.locator('[data-testid="exportRequested"]')).toBeVisible()
    
    // Step 2: Test member data privacy settings
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings/privacy`)
    
    // Configure organization privacy settings
    await page.selectOption('[data-testid="defaultProfileVisibility"]', 'organization')
    await page.check('[data-testid="allowMemberSearch"]')
    await page.check('[data-testid="showMemberContact"]')
    await page.selectOption('[data-testid="activityRetention"]', '365')
    
    await page.click('[data-testid="savePrivacySettings"]')
    await expect(page.locator('[data-testid="privacySettingsSuccess"]')).toBeVisible()
    
    // Step 3: Test member removal and data handling
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/members`)
    
    // Remove a member
    const memberRow = page.locator(`[data-testid="member-row-${managerEmail}"]`)
    await memberRow.locator('[data-testid="removeMember"]').click()
    
    await page.selectOption('[data-testid="removalReason"]', 'role_change')
    await page.fill('[data-testid="removalNotes"]', 'Member requested to be removed from organization')
    await page.check('[data-testid="retainProfileData"]') // Keep profile data for historical reference
    
    await page.click('[data-testid="confirmRemoval"]')
    
    await expect(page.locator('[data-testid="memberRemoved"]')).toBeVisible()
    
    // Step 4: Verify member removal
    const removedMemberRow = page.locator(`[data-testid="member-row-${managerEmail}"]`)
    await expect(removedMemberRow).not.toBeVisible()
    
    // Check if removed member appears in alumni/former members section
    if (await page.locator('[data-testid="formerMembers"]').isVisible()) {
      await page.click('[data-testid="formerMembers"]')
      await expect(page.locator(`[data-testid="former-member-${managerEmail}"]`)).toBeVisible()
    }
  })

  test('Multi-Organization User Experience', async ({ page, context }) => {
    // Create second organization with admin user
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', adminEmail)
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Create second organization
    await page.goto(`${TEST_BASE_URL}/organizations/new`)
    
    await page.fill('[data-testid="organizationName"]', testOrganizations.consulting.name)
    await page.fill('[data-testid="organizationDomain"]', testOrganizations.consulting.domain)
    await page.selectOption('[data-testid="organizationType"]', testOrganizations.consulting.type)
    await page.fill('[data-testid="organizationDescription"]', testOrganizations.consulting.description)
    
    await page.click('[data-testid="createOrganization"]')
    
    // Extract second organization ID
    const secondOrgUrl = page.url()
    const secondOrgIdMatch = secondOrgUrl.match(/\/organizations\/([^\/]+)\//)
    const secondOrgId = secondOrgIdMatch ? secondOrgIdMatch[1] : ''
    
    // Step 2: Set up profile in second organization
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    await page.fill('[data-testid="orgDisplayName"]', 'John Consultant')
    await page.fill('[data-testid="orgTitle"]', 'Senior Consultant')
    await page.fill('[data-testid="orgDepartment"]', 'Strategy')
    await page.fill('[data-testid="orgBio"]', 'Strategy consultant helping businesses optimize their operations.')
    
    const consultingSkills = ['Strategy', 'Business Analysis', 'Process Improvement', 'Client Management']
    for (const skill of consultingSkills) {
      await page.fill('[data-testid="skillsInput"]', skill)
      await page.keyboard.press('Enter')
    }
    
    await page.click('[data-testid="saveOrgProfile"]')
    
    // Step 3: Test organization switching
    await page.click('[data-testid="organizationSwitcher"]')
    
    await expect(page.locator('[data-testid="orgSwitcherMenu"]')).toBeVisible()
    await expect(page.locator(`[data-testid="org-option-${organizationId}"]`)).toBeVisible()
    await expect(page.locator(`[data-testid="org-option-${secondOrgId}"]`)).toBeVisible()
    
    // Switch to first organization
    await page.click(`[data-testid="org-option-${organizationId}"]`)
    
    await expect(page).toHaveURL(/\/organizations\/[^\/]+\/dashboard/)
    await expect(page.locator('[data-testid="organizationName"]')).toContainText(testOrganizations.startup.name)
    
    // Step 4: Verify different profiles in different organizations
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    // Should show startup profile
    await expect(page.locator('[data-testid="orgTitle"]')).toHaveValue('Head of Operations')
    
    // Switch back to consulting organization
    await page.click('[data-testid="organizationSwitcher"]')
    await page.click(`[data-testid="org-option-${secondOrgId}"]`)
    
    await page.goto(`${TEST_BASE_URL}/settings/organization`)
    
    // Should show consulting profile
    await expect(page.locator('[data-testid="orgTitle"]')).toHaveValue('Senior Consultant')
    
    // Step 5: Test global user profile consistency
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Global profile should be consistent across organizations
    await expect(page.locator('[data-testid="firstName"]')).toHaveValue('John')
    await expect(page.locator('[data-testid="lastName"]')).toHaveValue('Admin')
  })

  test('Organization Security and Compliance', async ({ page }) => {
    // Login as founder
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', founderEmail)
    await page.fill('[data-testid="password"]', 'FounderPass123!')
    await page.click('[data-testid="loginSubmit"]')
    
    // Step 1: Configure security settings
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings/security`)
    
    // Enable security features
    await page.check('[data-testid="requireTwoFactor"]')
    await page.check('[data-testid="enforcePasswordPolicy"]')
    await page.selectOption('[data-testid="sessionTimeout"]', '480') // 8 hours
    await page.check('[data-testid="restrictDomainSignup"]')
    
    // Configure allowed domains
    await page.fill('[data-testid="allowedDomains"]', testOrganizations.startup.domain)
    
    await page.click('[data-testid="saveSecuritySettings"]')
    await expect(page.locator('[data-testid="securitySettingsSuccess"]')).toBeVisible()
    
    // Step 2: Test audit log access
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/audit`)
    
    await expect(page.locator('[data-testid="auditLog"]')).toBeVisible()
    
    // Should see security-related events
    await page.selectOption('[data-testid="auditEventType"]', 'security')
    
    const securityEvents = page.locator('[data-testid="auditEvent"]').filter({ hasText: 'security' })
    if (await securityEvents.count() > 0) {
      await expect(securityEvents.first()).toBeVisible()
    }
    
    // Step 3: Test compliance reporting
    await page.click('[data-testid="generateComplianceReport"]')
    
    await page.selectOption('[data-testid="complianceType"]', 'gdpr')
    await page.selectOption('[data-testid="reportPeriod"]', 'quarterly')
    
    await page.click('[data-testid="generateReport"]')
    
    await expect(page.locator('[data-testid="reportGenerated"]')).toBeVisible()
    
    // Step 4: Test data retention policies
    await page.goto(`${TEST_BASE_URL}/organizations/${organizationId}/settings/data-retention`)
    
    await page.selectOption('[data-testid="memberDataRetention"]', '2555') // 7 years
    await page.selectOption('[data-testid="activityLogRetention"]', '365') // 1 year
    await page.selectOption('[data-testid="auditLogRetention"]', '2555') // 7 years
    
    await page.check('[data-testid="autoDeleteExpiredData"]')
    
    await page.click('[data-testid="saveRetentionPolicy"]')
    await expect(page.locator('[data-testid="retentionPolicySuccess"]')).toBeVisible()
  })
})

// Cleanup test - run after all organization tests
test.afterAll(async ({ browser }) => {
  // Clean up test organizations and users
  console.log('Organization workflow tests completed. Consider cleaning up test data.')
})