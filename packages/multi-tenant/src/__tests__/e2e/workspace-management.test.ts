import { test, expect, Page } from '@playwright/test'
import { setupDatabase, cleanupDatabase } from './helpers/database'
import { createTestUser, loginUser } from './helpers/auth'
import { createTestOrganization } from './helpers/organization'

test.describe('Workspace Management E2E', () => {
  let page: Page
  let testUser: any
  let testOrg: any

  test.beforeAll(async ({ browser }) => {
    await setupDatabase()
    page = await browser.newPage()
    
    // Create test user and organization
    testUser = await createTestUser({
      email: 'workspace-test@example.com',
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
    await page.goto('/dashboard/workspaces')
  })

  test('should create a new workspace successfully', async () => {
    // Click create workspace button
    await page.click('[data-testid="create-workspace-button"]')
    
    // Wait for modal to appear
    await expect(page.locator('[data-testid="create-workspace-modal"]')).toBeVisible()
    
    // Fill out the form
    await page.fill('[data-testid="workspace-name-input"]', 'E2E Test Workspace')
    await page.fill('[data-testid="workspace-description-input"]', 'Created via E2E testing')
    
    // Select an icon
    await page.click('[data-testid="icon-selector"]')
    await page.click('[data-testid="icon-option-rocket"]')
    
    // Select a color
    await page.click('[data-testid="color-selector"]')
    await page.click('[data-testid="color-option-blue"]')
    
    // Submit the form
    await page.click('[data-testid="submit-create-workspace"]')
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Workspace created successfully')
    
    // Verify workspace appears in list
    await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: 'E2E Test Workspace' })).toBeVisible()
    
    // Verify workspace details
    const workspaceCard = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'E2E Test Workspace' })
    await expect(workspaceCard.locator('[data-testid="workspace-icon"]')).toContainText('🚀')
    await expect(workspaceCard.locator('[data-testid="workspace-description"]')).toContainText('Created via E2E testing')
  })

  test('should validate workspace creation form', async () => {
    await page.click('[data-testid="create-workspace-button"]')
    
    // Try to submit without required fields
    await page.click('[data-testid="submit-create-workspace"]')
    
    // Check for validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Workspace name is required')
    
    // Enter name that's too long
    await page.fill('[data-testid="workspace-name-input"]', 'a'.repeat(51))
    await page.blur('[data-testid="workspace-name-input"]')
    
    await expect(page.locator('[data-testid="name-error"]')).toContainText('Name cannot exceed 50 characters')
    
    // Enter valid name
    await page.fill('[data-testid="workspace-name-input"]', 'Valid Name')
    
    // Enter description that's too long
    await page.fill('[data-testid="workspace-description-input"]', 'a'.repeat(201))
    await page.blur('[data-testid="workspace-description-input"]')
    
    await expect(page.locator('[data-testid="description-error"]')).toContainText('Description cannot exceed 200 characters')
  })

  test('should edit workspace details', async () => {
    // First create a workspace to edit
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'Workspace to Edit')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    // Click edit button on the workspace
    const workspaceCard = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Workspace to Edit' })
    await workspaceCard.hover()
    await workspaceCard.locator('[data-testid="edit-workspace-button"]').click()
    
    // Wait for edit modal
    await expect(page.locator('[data-testid="edit-workspace-modal"]')).toBeVisible()
    
    // Update the name
    await page.fill('[data-testid="workspace-name-input"]', 'Edited Workspace Name')
    await page.fill('[data-testid="workspace-description-input"]', 'Updated description')
    
    // Change icon
    await page.click('[data-testid="icon-selector"]')
    await page.click('[data-testid="icon-option-star"]')
    
    // Save changes
    await page.click('[data-testid="submit-edit-workspace"]')
    
    // Verify changes
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Workspace updated successfully')
    await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Edited Workspace Name' })).toBeVisible()
    
    const editedCard = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Edited Workspace Name' })
    await expect(editedCard.locator('[data-testid="workspace-icon"]')).toContainText('⭐')
    await expect(editedCard.locator('[data-testid="workspace-description"]')).toContainText('Updated description')
  })

  test('should delete workspace with confirmation', async () => {
    // Create a workspace to delete
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'Workspace to Delete')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    // Click delete button
    const workspaceCard = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Workspace to Delete' })
    await workspaceCard.hover()
    await workspaceCard.locator('[data-testid="delete-workspace-button"]').click()
    
    // Confirm deletion in modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-confirmation-text"]')).toContainText('Are you sure you want to delete "Workspace to Delete"?')
    
    // Cancel first to test the cancel flow
    await page.click('[data-testid="cancel-delete"]')
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).not.toBeVisible()
    await expect(workspaceCard).toBeVisible() // Should still be there
    
    // Now actually delete
    await workspaceCard.locator('[data-testid="delete-workspace-button"]').click()
    await page.click('[data-testid="confirm-delete"]')
    
    // Verify deletion
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Workspace deleted successfully')
    await expect(workspaceCard).not.toBeVisible()
  })

  test('should search and filter workspaces', async () => {
    // Create multiple workspaces for testing
    const workspaces = [
      { name: 'Design Team', description: 'UI/UX design work' },
      { name: 'Development Team', description: 'Software development' },
      { name: 'Marketing Team', description: 'Marketing campaigns' }
    ]
    
    for (const workspace of workspaces) {
      await page.click('[data-testid="create-workspace-button"]')
      await page.fill('[data-testid="workspace-name-input"]', workspace.name)
      await page.fill('[data-testid="workspace-description-input"]', workspace.description)
      await page.click('[data-testid="submit-create-workspace"]')
      await page.waitForSelector('[data-testid="success-toast"]')
    }
    
    // Test search functionality
    await page.fill('[data-testid="workspace-search-input"]', 'Design')
    await page.waitForTimeout(500) // Wait for debounce
    
    // Should show only Design Team
    await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Design Team' })).toBeVisible()
    await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Development Team' })).not.toBeVisible()
    await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Marketing Team' })).not.toBeVisible()
    
    // Clear search
    await page.fill('[data-testid="workspace-search-input"]', '')
    await page.waitForTimeout(500)
    
    // All workspaces should be visible again
    await expect(page.locator('[data-testid="workspace-card"]')).toHaveCount(3)
    
    // Test sort functionality
    await page.click('[data-testid="sort-dropdown"]')
    await page.click('[data-testid="sort-name-asc"]')
    
    // Verify alphabetical order
    const workspaceCards = page.locator('[data-testid="workspace-card"] [data-testid="workspace-name"]')
    await expect(workspaceCards.nth(0)).toContainText('Design Team')
    await expect(workspaceCards.nth(1)).toContainText('Development Team')
    await expect(workspaceCards.nth(2)).toContainText('Marketing Team')
    
    // Test reverse sort
    await page.click('[data-testid="sort-dropdown"]')
    await page.click('[data-testid="sort-name-desc"]')
    
    await expect(workspaceCards.nth(0)).toContainText('Marketing Team')
    await expect(workspaceCards.nth(1)).toContainText('Development Team')
    await expect(workspaceCards.nth(2)).toContainText('Design Team')
  })

  test('should set default workspace', async () => {
    // Create two workspaces
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'First Workspace')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'Second Workspace')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    // Set second workspace as default
    const secondWorkspace = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Second Workspace' })
    await secondWorkspace.hover()
    await secondWorkspace.locator('[data-testid="set-default-button"]').click()
    
    // Confirm the action
    await expect(page.locator('[data-testid="default-confirmation-modal"]')).toBeVisible()
    await page.click('[data-testid="confirm-set-default"]')
    
    // Verify default badge appears
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Default workspace updated')
    await expect(secondWorkspace.locator('[data-testid="default-badge"]')).toBeVisible()
    
    // Verify first workspace no longer has default badge
    const firstWorkspace = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'First Workspace' })
    await expect(firstWorkspace.locator('[data-testid="default-badge"]')).not.toBeVisible()
  })

  test('should handle workspace access permissions', async () => {
    // This test would require setting up different user roles
    // For now, we'll test the UI behavior for permission-based actions
    
    // Create workspace as admin
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'Admin Workspace')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    const workspace = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Admin Workspace' })
    
    // Verify admin actions are available
    await workspace.hover()
    await expect(workspace.locator('[data-testid="edit-workspace-button"]')).toBeVisible()
    await expect(workspace.locator('[data-testid="delete-workspace-button"]')).toBeVisible()
    await expect(workspace.locator('[data-testid="set-default-button"]')).toBeVisible()
    
    // Test workspace settings access
    await workspace.locator('[data-testid="workspace-settings-button"]').click()
    await expect(page.locator('[data-testid="workspace-settings-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="members-tab"]')).toBeVisible()
    await expect(page.locator('[data-testid="permissions-tab"]')).toBeVisible()
  })

  test('should handle workspace member management', async () => {
    // Create workspace
    await page.click('[data-testid="create-workspace-button"]')
    await page.fill('[data-testid="workspace-name-input"]', 'Team Workspace')
    await page.click('[data-testid="submit-create-workspace"]')
    await page.waitForSelector('[data-testid="success-toast"]')
    
    // Open workspace settings
    const workspace = page.locator('[data-testid="workspace-card"]').filter({ hasText: 'Team Workspace' })
    await workspace.locator('[data-testid="workspace-settings-button"]').click()
    
    // Go to members tab
    await page.click('[data-testid="members-tab"]')
    
    // Invite a member
    await page.click('[data-testid="invite-member-button"]')
    await page.fill('[data-testid="member-email-input"]', 'newmember@example.com')
    await page.click('[data-testid="member-role-dropdown"]')
    await page.click('[data-testid="role-option-member"]')
    await page.click('[data-testid="send-invite-button"]')
    
    // Verify invitation appears in pending list
    await expect(page.locator('[data-testid="pending-invitations"]')).toContainText('newmember@example.com')
    
    // Test canceling an invitation
    await page.click('[data-testid="cancel-invitation-button"]')
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Invitation canceled')
  })

  test('should handle bulk workspace operations', async () => {
    // Create multiple workspaces
    const workspaces = ['Bulk Test 1', 'Bulk Test 2', 'Bulk Test 3']
    
    for (const name of workspaces) {
      await page.click('[data-testid="create-workspace-button"]')
      await page.fill('[data-testid="workspace-name-input"]', name)
      await page.click('[data-testid="submit-create-workspace"]')
      await page.waitForSelector('[data-testid="success-toast"]')
    }
    
    // Enter bulk selection mode
    await page.click('[data-testid="bulk-actions-button"]')
    
    // Select multiple workspaces
    for (const name of workspaces) {
      const workspace = page.locator('[data-testid="workspace-card"]').filter({ hasText: name })
      await workspace.locator('[data-testid="workspace-checkbox"]').check()
    }
    
    // Verify bulk action bar appears
    await expect(page.locator('[data-testid="bulk-action-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('3 selected')
    
    // Test bulk delete
    await page.click('[data-testid="bulk-delete-button"]')
    await expect(page.locator('[data-testid="bulk-delete-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="bulk-delete-confirmation"]')).toContainText('Delete 3 workspaces')
    
    await page.click('[data-testid="confirm-bulk-delete"]')
    
    // Verify deletion
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('3 workspaces deleted successfully')
    
    // Verify workspaces are gone
    for (const name of workspaces) {
      await expect(page.locator('[data-testid="workspace-card"]').filter({ hasText: name })).not.toBeVisible()
    }
  })

  test('should show empty state when no workspaces exist', async () => {
    // Navigate to fresh workspace page (assuming cleanup removes all workspaces)
    await page.reload()
    
    // Check for empty state
    await expect(page.locator('[data-testid="empty-workspaces"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-workspaces-title"]')).toContainText('No workspaces yet')
    await expect(page.locator('[data-testid="empty-workspaces-description"]')).toContainText('Create your first workspace to get started')
    
    // Verify create button is prominent in empty state
    await expect(page.locator('[data-testid="empty-state-create-button"]')).toBeVisible()
    
    // Test creating workspace from empty state
    await page.click('[data-testid="empty-state-create-button"]')
    await expect(page.locator('[data-testid="create-workspace-modal"]')).toBeVisible()
  })

  test('should handle workspace loading and error states', async () => {
    // Test loading state by slowing down network
    await page.route('**/api/workspaces', route => {
      setTimeout(() => route.continue(), 2000)
    })
    
    await page.reload()
    
    // Check for loading state
    await expect(page.locator('[data-testid="workspaces-loading"]')).toBeVisible()
    await expect(page.locator('[data-testid="workspace-skeleton"]')).toHaveCount(3) // Skeleton loaders
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="workspaces-loading"]', { state: 'hidden' })
    
    // Test error state by mocking API failure
    await page.route('**/api/workspaces', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    await page.reload()
    
    // Check for error state
    await expect(page.locator('[data-testid="workspaces-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="workspaces-error"]')).toContainText('Failed to load workspaces')
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
    
    // Test retry functionality
    await page.unroute('**/api/workspaces')
    await page.click('[data-testid="retry-button"]')
    
    // Should show loading again, then success
    await expect(page.locator('[data-testid="workspaces-loading"]')).toBeVisible()
    await page.waitForSelector('[data-testid="workspaces-loading"]', { state: 'hidden' })
  })
})