import { test, expect, Page } from '@playwright/test'
import { setupDatabase, cleanupDatabase } from './helpers/database'
import { createTestUser, loginUser } from './helpers/auth'
import { createTestOrganization } from './helpers/organization'

test.describe('Organization Management E2E', () => {
  let page: Page
  let testUser: any
  let testOrg: any

  test.beforeAll(async ({ browser }) => {
    await setupDatabase()
    page = await browser.newPage()
    
    testUser = await createTestUser({
      email: 'org-test@example.com',
      password: 'TestPassword123!'
    })
    
    testOrg = await createTestOrganization({
      name: 'E2E Test Organization',
      ownerId: testUser.id
    })
  })

  test.afterAll(async () => {
    await page.close()
    await cleanupDatabase()
  })

  test.beforeEach(async () => {
    await loginUser(page, testUser.email, 'TestPassword123!')
    await page.goto('/dashboard/organization')
  })

  test('should display organization overview', async () => {
    // Check main organization information
    await expect(page.locator('[data-testid="org-name"]')).toContainText('E2E Test Organization')
    await expect(page.locator('[data-testid="org-status"]')).toContainText('Active')
    
    // Check overview stats
    await expect(page.locator('[data-testid="member-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="workspace-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="project-count"]')).toBeVisible()
    
    // Check recent activity section
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCount.greaterThanOrEqual(0)
  })

  test('should update organization settings', async () => {
    // Navigate to settings
    await page.click('[data-testid="org-settings-tab"]')
    
    // Update basic information
    await page.fill('[data-testid="org-name-input"]', 'Updated Organization Name')
    await page.fill('[data-testid="org-description-input"]', 'Updated organization description for E2E testing')
    
    // Save changes
    await page.click('[data-testid="save-org-settings"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Organization settings updated')
    
    // Verify changes are reflected
    await expect(page.locator('[data-testid="org-name-input"]')).toHaveValue('Updated Organization Name')
    
    // Navigate back to overview to verify
    await page.click('[data-testid="org-overview-tab"]')
    await expect(page.locator('[data-testid="org-name"]')).toContainText('Updated Organization Name')
  })

  test('should validate organization settings form', async () => {
    await page.click('[data-testid="org-settings-tab"]')
    
    // Clear required field
    await page.fill('[data-testid="org-name-input"]', '')
    await page.blur('[data-testid="org-name-input"]')
    
    // Check validation error
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Organization name is required')
    
    // Try to save with invalid data
    await page.click('[data-testid="save-org-settings"]')
    
    // Should not save and show error
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible()
    
    // Test name length validation
    await page.fill('[data-testid="org-name-input"]', 'a'.repeat(101)) // Assuming 100 char limit
    await page.blur('[data-testid="org-name-input"]')
    
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name cannot exceed 100 characters')
  })

  test('should manage organization members', async () => {
    await page.click('[data-testid="org-members-tab"]')
    
    // Check current members list
    await expect(page.locator('[data-testid="members-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-item"]')).toHaveCount.greaterThanOrEqual(1) // At least the owner
    
    // Invite new member
    await page.click('[data-testid="invite-member-button"]')
    
    // Fill invitation form
    await page.fill('[data-testid="invite-email-input"]', 'newmember@example.com')
    await page.click('[data-testid="invite-role-dropdown"]')
    await page.click('[data-testid="role-option-admin"]')
    
    // Add custom message
    await page.fill('[data-testid="invite-message-input"]', 'Welcome to our organization!')
    
    // Send invitation
    await page.click('[data-testid="send-invitation"]')
    
    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Invitation sent successfully')
    
    // Check pending invitations section
    await expect(page.locator('[data-testid="pending-invitations"]')).toBeVisible()
    await expect(page.locator('[data-testid="pending-invitation"]').filter({ hasText: 'newmember@example.com' })).toBeVisible()
  })

  test('should manage member roles and permissions', async () => {
    await page.click('[data-testid="org-members-tab"]')
    
    // Find a member to update (not the owner)
    const memberItem = page.locator('[data-testid="member-item"]').filter({ hasText: 'member@example.com' }).first()
    
    if (await memberItem.count() > 0) {
      // Click member options
      await memberItem.locator('[data-testid="member-options"]').click()
      await page.click('[data-testid="change-role-option"]')
      
      // Change role
      await page.click('[data-testid="new-role-dropdown"]')
      await page.click('[data-testid="role-option-editor"]')
      await page.click('[data-testid="confirm-role-change"]')
      
      // Verify change
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Member role updated')
      await expect(memberItem.locator('[data-testid="member-role"]')).toContainText('Editor')
    }
  })

  test('should remove organization members', async () => {
    await page.click('[data-testid="org-members-tab"]')
    
    // First, invite a member to remove
    await page.click('[data-testid="invite-member-button"]')
    await page.fill('[data-testid="invite-email-input"]', 'todelete@example.com')
    await page.click('[data-testid="send-invitation"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    // Cancel the pending invitation (as a removal test)
    const pendingInvitation = page.locator('[data-testid="pending-invitation"]').filter({ hasText: 'todelete@example.com' })
    await pendingInvitation.locator('[data-testid="cancel-invitation"]').click()
    
    // Confirm cancellation
    await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).toBeVisible()
    await page.click('[data-testid="confirm-cancel"]')
    
    // Verify invitation was cancelled
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Invitation cancelled')
    await expect(pendingInvitation).not.toBeVisible()
  })

  test('should manage organization billing settings', async () => {
    await page.click('[data-testid="org-billing-tab"]')
    
    // Check current plan information
    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible()
    await expect(page.locator('[data-testid="plan-name"]')).toContainText(/Free|Pro|Enterprise/)
    
    // Check usage statistics
    await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible()
    await expect(page.locator('[data-testid="workspace-usage"]')).toBeVisible()
    await expect(page.locator('[data-testid="member-usage"]')).toBeVisible()
    await expect(page.locator('[data-testid="storage-usage"]')).toBeVisible()
    
    // Check billing history
    await expect(page.locator('[data-testid="billing-history"]')).toBeVisible()
    
    // Test plan upgrade flow (without actually upgrading)
    if (await page.locator('[data-testid="upgrade-plan-button"]').count() > 0) {
      await page.click('[data-testid="upgrade-plan-button"]')
      await expect(page.locator('[data-testid="plan-selection-modal"]')).toBeVisible()
      
      // Close modal without upgrading
      await page.click('[data-testid="close-modal"]')
    }
  })

  test('should manage organization security settings', async () => {
    await page.click('[data-testid="org-security-tab"]')
    
    // Check security overview
    await expect(page.locator('[data-testid="security-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="security-recommendations"]')).toBeVisible()
    
    // Test Two-Factor Authentication settings
    const twoFaSection = page.locator('[data-testid="two-fa-section"]')
    await expect(twoFaSection).toBeVisible()
    
    if (await twoFaSection.locator('[data-testid="enable-2fa-button"]').count() > 0) {
      await twoFaSection.locator('[data-testid="enable-2fa-button"]').click()
      await expect(page.locator('[data-testid="2fa-setup-modal"]')).toBeVisible()
      
      // Close without completing setup
      await page.click('[data-testid="close-2fa-setup"]')
    }
    
    // Test SSO configuration (if available)
    const ssoSection = page.locator('[data-testid="sso-section"]')
    if (await ssoSection.count() > 0) {
      await expect(ssoSection).toBeVisible()
      
      if (await ssoSection.locator('[data-testid="configure-sso-button"]').count() > 0) {
        await ssoSection.locator('[data-testid="configure-sso-button"]').click()
        await expect(page.locator('[data-testid="sso-config-modal"]')).toBeVisible()
        await page.click('[data-testid="close-modal"]')
      }
    }
    
    // Check audit logs
    await page.click('[data-testid="audit-logs-tab"]')
    await expect(page.locator('[data-testid="audit-logs-table"]')).toBeVisible()
    
    // Test log filtering
    await page.click('[data-testid="log-filter-dropdown"]')
    await page.click('[data-testid="filter-user-actions"]')
    
    // Verify filter is applied
    await expect(page.locator('[data-testid="applied-filters"]')).toContainText('User Actions')
  })

  test('should handle organization API keys management', async () => {
    await page.click('[data-testid="org-api-tab"]')
    
    // Check existing API keys
    await expect(page.locator('[data-testid="api-keys-section"]')).toBeVisible()
    
    // Create new API key
    await page.click('[data-testid="create-api-key-button"]')
    
    // Fill API key details
    await page.fill('[data-testid="api-key-name-input"]', 'E2E Test API Key')
    await page.fill('[data-testid="api-key-description-input"]', 'Created during E2E testing')
    
    // Set permissions
    await page.click('[data-testid="api-permissions-dropdown"]')
    await page.check('[data-testid="permission-workspaces-read"]')
    await page.check('[data-testid="permission-projects-read"]')
    await page.click('[data-testid="api-permissions-dropdown"]') // Close dropdown
    
    // Set expiration
    await page.click('[data-testid="api-expiry-dropdown"]')
    await page.click('[data-testid="expiry-30-days"]')
    
    // Create the key
    await page.click('[data-testid="create-api-key"]')
    
    // Verify creation and key display
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('API key created successfully')
    await expect(page.locator('[data-testid="api-key-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="new-api-key"]')).toBeVisible()
    
    // Copy API key
    await page.click('[data-testid="copy-api-key"]')
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('API key copied')
    
    // Close modal
    await page.click('[data-testid="close-api-key-modal"]')
    
    // Verify key appears in list
    await expect(page.locator('[data-testid="api-key-item"]').filter({ hasText: 'E2E Test API Key' })).toBeVisible()
  })

  test('should revoke API keys', async () => {
    // Assuming we have the API key from the previous test
    const apiKeyItem = page.locator('[data-testid="api-key-item"]').filter({ hasText: 'E2E Test API Key' })
    
    if (await apiKeyItem.count() > 0) {
      // Click revoke button
      await apiKeyItem.locator('[data-testid="revoke-api-key"]').click()
      
      // Confirm revocation
      await expect(page.locator('[data-testid="revoke-confirmation-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="revoke-warning"]')).toContainText('This action cannot be undone')
      
      await page.click('[data-testid="confirm-revoke"]')
      
      // Verify revocation
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('API key revoked')
      await expect(apiKeyItem.locator('[data-testid="api-key-status"]')).toContainText('Revoked')
    }
  })

  test('should export organization data', async () => {
    await page.click('[data-testid="org-settings-tab"]')
    
    // Scroll to data export section
    await page.locator('[data-testid="data-export-section"]').scrollIntoViewIfNeeded()
    
    // Request data export
    await page.click('[data-testid="export-data-button"]')
    
    // Confirm export request
    await expect(page.locator('[data-testid="export-confirmation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="export-info"]')).toContainText('includes all organization data')
    
    await page.click('[data-testid="confirm-export"]')
    
    // Verify export request
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Export requested successfully')
    await expect(page.locator('[data-testid="export-status"]')).toContainText('Export in progress')
  })

  test('should handle organization deletion workflow', async () => {
    await page.click('[data-testid="org-settings-tab"]')
    
    // Scroll to danger zone
    await page.locator('[data-testid="danger-zone"]').scrollIntoViewIfNeeded()
    
    // Click delete organization
    await page.click('[data-testid="delete-organization-button"]')
    
    // First confirmation modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-warning"]')).toContainText('This action cannot be undone')
    
    // Continue to second step
    await page.click('[data-testid="continue-delete"]')
    
    // Second confirmation with organization name
    await expect(page.locator('[data-testid="delete-name-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="type-org-name-instruction"]')).toContainText('Type the organization name')
    
    // Type incorrect name first
    await page.fill('[data-testid="org-name-confirmation-input"]', 'wrong name')
    await expect(page.locator('[data-testid="final-delete-button"]')).toBeDisabled()
    
    // Type correct name
    await page.fill('[data-testid="org-name-confirmation-input"]', 'Updated Organization Name') // From earlier test
    await expect(page.locator('[data-testid="final-delete-button"]')).toBeEnabled()
    
    // Cancel instead of actually deleting
    await page.click('[data-testid="cancel-delete"]')
    
    // Verify we're back to settings
    await expect(page.locator('[data-testid="org-settings-form"]')).toBeVisible()
  })

  test('should handle organization activity feed', async () => {
    await page.click('[data-testid="org-activity-tab"]')
    
    // Check activity feed
    await expect(page.locator('[data-testid="activity-feed"]')).toBeVisible()
    
    // Test activity filtering
    await page.click('[data-testid="activity-filter-dropdown"]')
    await page.check('[data-testid="filter-member-actions"]')
    await page.check('[data-testid="filter-workspace-actions"]')
    await page.click('[data-testid="apply-filters"]')
    
    // Verify filters are applied
    await expect(page.locator('[data-testid="active-filters"]')).toBeVisible()
    
    // Test date range filter
    await page.click('[data-testid="date-range-picker"]')
    await page.click('[data-testid="last-7-days"]')
    
    // Test activity search
    await page.fill('[data-testid="activity-search"]', 'workspace')
    await page.waitForTimeout(500) // Debounce
    
    // Check if search results are filtered
    const activityItems = page.locator('[data-testid="activity-item"]')
    if (await activityItems.count() > 0) {
      // Should contain search term
      await expect(activityItems.first()).toContainText(/workspace/i)
    }
    
    // Clear search
    await page.fill('[data-testid="activity-search"]', '')
    
    // Test activity details modal
    if (await activityItems.count() > 0) {
      await activityItems.first().click()
      await expect(page.locator('[data-testid="activity-details-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="activity-timestamp"]')).toBeVisible()
      await expect(page.locator('[data-testid="activity-user"]')).toBeVisible()
      
      // Close details
      await page.click('[data-testid="close-activity-details"]')
    }
  })

  test('should handle organization integrations', async () => {
    await page.click('[data-testid="org-integrations-tab"]')
    
    // Check available integrations
    await expect(page.locator('[data-testid="integrations-grid"]')).toBeVisible()
    await expect(page.locator('[data-testid="integration-card"]')).toHaveCount.greaterThanOrEqual(1)
    
    // Test integration configuration
    const slackIntegration = page.locator('[data-testid="integration-card"]').filter({ hasText: 'Slack' })
    
    if (await slackIntegration.count() > 0) {
      await slackIntegration.locator('[data-testid="configure-integration"]').click()
      
      // Check configuration modal
      await expect(page.locator('[data-testid="integration-config-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="integration-name"]')).toContainText('Slack')
      
      // Close without configuring
      await page.click('[data-testid="close-integration-config"]')
    }
    
    // Test integration search and filtering
    await page.fill('[data-testid="integration-search"]', 'slack')
    
    const integrationCards = page.locator('[data-testid="integration-card"]')
    if (await integrationCards.count() > 0) {
      // Should show only matching integrations
      await expect(integrationCards.first()).toContainText(/slack/i)
    }
    
    // Test category filter
    await page.click('[data-testid="integration-category-filter"]')
    await page.click('[data-testid="category-communication"]')
    
    // Clear filters
    await page.click('[data-testid="clear-integration-filters"]')
  })
})