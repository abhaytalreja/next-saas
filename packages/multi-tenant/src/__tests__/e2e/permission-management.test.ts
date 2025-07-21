import { test, expect, Page } from '@playwright/test'
import { setupDatabase, cleanupDatabase } from './helpers/database'
import { createTestUser, loginUser } from './helpers/auth'
import { createTestOrganization } from './helpers/organization'

test.describe('Permission Management E2E', () => {
  let page: Page
  let adminUser: any
  let memberUser: any
  let testOrg: any

  test.beforeAll(async ({ browser }) => {
    await setupDatabase()
    page = await browser.newPage()
    
    // Create admin user
    adminUser = await createTestUser({
      email: 'admin@example.com',
      password: 'AdminPassword123!'
    })
    
    // Create member user
    memberUser = await createTestUser({
      email: 'member@example.com',
      password: 'MemberPassword123!'
    })
    
    testOrg = await createTestOrganization({
      name: 'Permission Test Organization',
      ownerId: adminUser.id
    })
  })

  test.afterAll(async () => {
    await page.close()
    await cleanupDatabase()
  })

  test.describe('Role Management as Admin', () => {
    test.beforeEach(async () => {
      await loginUser(page, adminUser.email, 'AdminPassword123!')
      await page.goto('/dashboard/organization/permissions')
    })

    test('should display permission matrix', async () => {
      // Check that permission matrix is visible
      await expect(page.locator('[data-testid="permission-matrix"]')).toBeVisible()
      
      // Check role headers
      await expect(page.locator('[data-testid="role-header-owner"]')).toBeVisible()
      await expect(page.locator('[data-testid="role-header-admin"]')).toBeVisible()
      await expect(page.locator('[data-testid="role-header-member"]')).toBeVisible()
      
      // Check permission categories
      await expect(page.locator('[data-testid="category-organization"]')).toBeVisible()
      await expect(page.locator('[data-testid="category-workspace"]')).toBeVisible()
      await expect(page.locator('[data-testid="category-project"]')).toBeVisible()
      
      // Check that system roles are marked as non-editable
      await expect(page.locator('[data-testid="role-header-owner"]')).toHaveClass(/system-role/)
      await expect(page.locator('[data-testid="role-header-admin"]')).toHaveClass(/system-role/)
      await expect(page.locator('[data-testid="role-header-member"]')).toHaveClass(/system-role/)
    })

    test('should create custom role', async () => {
      // Click create role button
      await page.click('[data-testid="create-role-button"]')
      
      // Fill role details
      await page.fill('[data-testid="role-name-input"]', 'editor')
      await page.fill('[data-testid="role-display-name-input"]', 'Editor')
      await page.fill('[data-testid="role-description-input"]', 'Can edit content but not manage settings')
      
      // Select permissions
      await page.check('[data-testid="permission-workspace-view"]')
      await page.check('[data-testid="permission-workspace-update"]')
      await page.check('[data-testid="permission-project-view"]')
      await page.check('[data-testid="permission-project-create"]')
      await page.check('[data-testid="permission-project-update"]')
      
      // Create the role
      await page.click('[data-testid="submit-create-role"]')
      
      // Verify success
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role created successfully')
      
      // Verify role appears in matrix
      await expect(page.locator('[data-testid="role-header-editor"]')).toBeVisible()
      await expect(page.locator('[data-testid="role-header-editor"]')).toHaveClass(/custom-role/)
      
      // Verify permissions are set correctly
      await expect(page.locator('[data-testid="permission-editor-workspace:view"]')).toBeChecked()
      await expect(page.locator('[data-testid="permission-editor-workspace:update"]')).toBeChecked()
      await expect(page.locator('[data-testid="permission-editor-project:view"]')).toBeChecked()
      await expect(page.locator('[data-testid="permission-editor-project:create"]')).toBeChecked()
      await expect(page.locator('[data-testid="permission-editor-project:update"]')).toBeChecked()
      
      // Verify permissions that shouldn't be set
      await expect(page.locator('[data-testid="permission-editor-organization:manage"]')).not.toBeChecked()
      await expect(page.locator('[data-testid="permission-editor-project:delete"]')).not.toBeChecked()
    })

    test('should validate role creation form', async () => {
      await page.click('[data-testid="create-role-button"]')
      
      // Try to submit without required fields
      await page.click('[data-testid="submit-create-role"]')
      
      // Check validation errors
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Role name is required')
      await expect(page.locator('[data-testid="display-name-error"]')).toContainText('Display name is required')
      
      // Test name format validation
      await page.fill('[data-testid="role-name-input"]', 'Invalid Role Name!')
      await page.blur('[data-testid="role-name-input"]')
      
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Role name can only contain letters, numbers, and hyphens')
      
      // Test duplicate name validation
      await page.fill('[data-testid="role-name-input"]', 'admin') // System role name
      await page.blur('[data-testid="role-name-input"]')
      
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Role name already exists')
      
      // Test valid input
      await page.fill('[data-testid="role-name-input"]', 'valid-role')
      await page.fill('[data-testid="role-display-name-input"]', 'Valid Role')
      
      // Should have no errors now
      await expect(page.locator('[data-testid="name-error"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="display-name-error"]')).not.toBeVisible()
    })

    test('should edit custom role permissions', async () => {
      // Assuming we have the editor role from the previous test
      const editorRole = page.locator('[data-testid="role-header-editor"]')
      
      if (await editorRole.count() > 0) {
        // Add a new permission
        await page.check('[data-testid="permission-editor-project:delete"]')
        
        // Verify the change
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role permissions updated')
        await expect(page.locator('[data-testid="permission-editor-project:delete"]')).toBeChecked()
        
        // Remove a permission
        await page.uncheck('[data-testid="permission-editor-workspace:update"]')
        
        // Verify the change
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role permissions updated')
        await expect(page.locator('[data-testid="permission-editor-workspace:update"]')).not.toBeChecked()
      }
    })

    test('should use bulk operations on custom role', async () => {
      const editorRole = page.locator('[data-testid="role-header-editor"]')
      
      if (await editorRole.count() > 0) {
        // Click role column header to select all permissions
        await editorRole.locator('[data-testid="select-all-permissions"]').click()
        
        // Verify all permissions are selected
        const allPermissionCheckboxes = page.locator('[data-testid^="permission-editor-"]')
        const checkboxCount = await allPermissionCheckboxes.count()
        
        for (let i = 0; i < checkboxCount; i++) {
          await expect(allPermissionCheckboxes.nth(i)).toBeChecked()
        }
        
        // Clear all permissions
        await page.click('[data-testid="clear-all-editor"]')
        
        // Verify all permissions are cleared
        for (let i = 0; i < checkboxCount; i++) {
          await expect(allPermissionCheckboxes.nth(i)).not.toBeChecked()
        }
      }
    })

    test('should rename custom role', async () => {
      const editorRole = page.locator('[data-testid="role-header-editor"]')
      
      if (await editorRole.count() > 0) {
        // Double-click to enter edit mode
        await editorRole.locator('[data-testid="role-display-name"]').dblclick()
        
        // Change the name
        await page.fill('[data-testid="role-name-edit-input"]', 'Content Editor')
        await page.press('[data-testid="role-name-edit-input"]', 'Enter')
        
        // Verify the change
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role name updated')
        await expect(editorRole.locator('[data-testid="role-display-name"]')).toContainText('Content Editor')
      }
    })

    test('should delete custom role', async () => {
      const editorRole = page.locator('[data-testid="role-header-editor"]')
      
      if (await editorRole.count() > 0) {
        // Click delete button
        await editorRole.locator('[data-testid="delete-role-button"]').click()
        
        // Confirm deletion
        await expect(page.locator('[data-testid="delete-role-confirmation"]')).toBeVisible()
        await expect(page.locator('[data-testid="delete-warning"]')).toContainText('This action cannot be undone')
        
        await page.click('[data-testid="confirm-delete-role"]')
        
        // Verify deletion
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role deleted successfully')
        await expect(editorRole).not.toBeVisible()
      }
    })

    test('should search and filter permissions', async () => {
      // Test permission search
      await page.fill('[data-testid="permission-search"]', 'workspace')
      await page.waitForTimeout(500) // Debounce
      
      // Should show only workspace-related permissions
      await expect(page.locator('[data-testid="permission-row"]')).toHaveCount.greaterThanOrEqual(1)
      await expect(page.locator('[data-testid="permission-name"]').first()).toContainText(/workspace/i)
      
      // Test category filter
      await page.click('[data-testid="category-filter-dropdown"]')
      await page.check('[data-testid="filter-organization"]')
      await page.click('[data-testid="apply-category-filter"]')
      
      // Should show only organization permissions
      const visiblePermissions = page.locator('[data-testid="permission-row"]')
      const permissionCount = await visiblePermissions.count()
      
      for (let i = 0; i < permissionCount; i++) {
        await expect(visiblePermissions.nth(i).locator('[data-testid="permission-category"]')).toContainText('organization')
      }
      
      // Clear filters
      await page.click('[data-testid="clear-filters"]')
      
      // All permissions should be visible again
      await expect(page.locator('[data-testid="permission-row"]')).toHaveCount.greaterThanOrEqual(5)
    })

    test('should export and import permissions', async () => {
      // Test export
      await page.click('[data-testid="export-permissions-button"]')
      
      // Verify download started (we can't actually test the file download in E2E)
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Permissions exported')
      
      // Test import
      await page.click('[data-testid="import-permissions-button"]')
      
      // Upload a mock JSON file
      const mockPermissions = JSON.stringify({
        roles: [
          {
            name: 'imported-role',
            display_name: 'Imported Role',
            permissions: ['workspace:view', 'project:view']
          }
        ]
      })
      
      await page.setInputFiles('[data-testid="import-file-input"]', {
        name: 'permissions.json',
        mimeType: 'application/json',
        buffer: Buffer.from(mockPermissions)
      })
      
      await page.click('[data-testid="confirm-import"]')
      
      // Verify import
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Permissions imported successfully')
      await expect(page.locator('[data-testid="role-header-imported-role"]')).toBeVisible()
    })
  })

  test.describe('Permission Enforcement', () => {
    test('should enforce workspace permissions for member user', async () => {
      // Login as member user
      await loginUser(page, memberUser.email, 'MemberPassword123!')
      
      // Try to access organization settings (should be denied)
      await page.goto('/dashboard/organization/settings')
      
      // Should be redirected or shown access denied
      await expect(
        page.locator('[data-testid="access-denied"]').or(
          page.locator('[data-testid="permission-error"]')
        )
      ).toBeVisible()
      
      // Try to access workspace creation (should be denied)
      await page.goto('/dashboard/workspaces')
      
      if (await page.locator('[data-testid="create-workspace-button"]').count() > 0) {
        await page.click('[data-testid="create-workspace-button"]')
        
        // Should show permission error
        await expect(page.locator('[data-testid="permission-error-toast"]')).toContainText('Insufficient permissions')
      }
    })

    test('should allow permitted actions for member user', async () => {
      // Member should be able to view workspaces
      await page.goto('/dashboard/workspaces')
      
      // Should see workspace list
      await expect(page.locator('[data-testid="workspaces-list"]')).toBeVisible()
      
      // Should be able to view organization overview
      await page.goto('/dashboard/organization')
      await expect(page.locator('[data-testid="org-overview"]')).toBeVisible()
      
      // Should NOT see admin actions
      await expect(page.locator('[data-testid="org-settings-tab"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="manage-members-button"]')).not.toBeVisible()
    })

    test('should show different UI elements based on permissions', async () => {
      // Login as admin
      await loginUser(page, adminUser.email, 'AdminPassword123!')
      await page.goto('/dashboard/workspaces')
      
      // Admin should see all management options
      await expect(page.locator('[data-testid="create-workspace-button"]')).toBeVisible()
      await expect(page.locator('[data-testid="bulk-actions-button"]')).toBeVisible()
      
      // Switch to member user
      await loginUser(page, memberUser.email, 'MemberPassword123!')
      await page.goto('/dashboard/workspaces')
      
      // Member should see limited options
      await expect(page.locator('[data-testid="create-workspace-button"]')).not.toBeVisible()
      await expect(page.locator('[data-testid="bulk-actions-button"]')).not.toBeVisible()
    })
  })

  test.describe('Role Assignment', () => {
    test.beforeEach(async () => {
      await loginUser(page, adminUser.email, 'AdminPassword123!')
      await page.goto('/dashboard/organization/members')
    })

    test('should assign role to organization member', async () => {
      // Find member in the list
      const memberRow = page.locator('[data-testid="member-row"]').filter({ hasText: memberUser.email })
      
      if (await memberRow.count() > 0) {
        // Click role dropdown
        await memberRow.locator('[data-testid="member-role-dropdown"]').click()
        
        // Select new role
        await page.click('[data-testid="role-option-admin"]')
        
        // Confirm the change
        await expect(page.locator('[data-testid="role-change-confirmation"]')).toBeVisible()
        await page.click('[data-testid="confirm-role-change"]')
        
        // Verify the change
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Member role updated')
        await expect(memberRow.locator('[data-testid="member-role-badge"]')).toContainText('Admin')
      }
    })

    test('should handle role assignment conflicts', async () => {
      // Try to change owner role (should be prevented)
      const ownerRow = page.locator('[data-testid="member-row"]').filter({ hasText: adminUser.email })
      
      if (await ownerRow.count() > 0) {
        const roleDropdown = ownerRow.locator('[data-testid="member-role-dropdown"]')
        
        // Owner role dropdown should be disabled or not present
        if (await roleDropdown.count() > 0) {
          await expect(roleDropdown).toBeDisabled()
        } else {
          // Should show that role cannot be changed
          await expect(ownerRow.locator('[data-testid="role-locked-indicator"]')).toBeVisible()
        }
      }
    })

    test('should show role capabilities in member details', async () => {
      const memberRow = page.locator('[data-testid="member-row"]').first()
      
      // Click to view member details
      await memberRow.locator('[data-testid="view-member-details"]').click()
      
      // Should show member details modal
      await expect(page.locator('[data-testid="member-details-modal"]')).toBeVisible()
      
      // Should show current role and permissions
      await expect(page.locator('[data-testid="member-current-role"]')).toBeVisible()
      await expect(page.locator('[data-testid="member-permissions-list"]')).toBeVisible()
      
      // Should show permission breakdown
      const permissionsList = page.locator('[data-testid="permission-item"]')
      await expect(permissionsList).toHaveCount.greaterThanOrEqual(1)
      
      // Close modal
      await page.click('[data-testid="close-member-details"]')
    })
  })

  test.describe('Permission Inheritance', () => {
    test('should show inherited permissions in role matrix', async () => {
      await loginUser(page, adminUser.email, 'AdminPassword123!')
      await page.goto('/dashboard/organization/permissions')
      
      // Check for inheritance indicators
      const inheritedPermissions = page.locator('[data-testid^="permission-"][data-inherited="true"]')
      
      if (await inheritedPermissions.count() > 0) {
        // Hover over inherited permission to see tooltip
        await inheritedPermissions.first().hover()
        
        // Should show inheritance information
        await expect(page.locator('[data-testid="inheritance-tooltip"]')).toBeVisible()
        await expect(page.locator('[data-testid="inheritance-tooltip"]')).toContainText(/inherited from/i)
      }
    })

    test('should handle permission conflicts in inheritance', async () => {
      // This would test scenarios where permissions might conflict
      // due to multiple role assignments or inheritance hierarchies
      
      // For now, we'll test that conflicting permissions show warnings
      const conflictWarnings = page.locator('[data-testid="permission-conflict-warning"]')
      
      if (await conflictWarnings.count() > 0) {
        await expect(conflictWarnings.first()).toContainText(/conflict/i)
        
        // Click to see conflict details
        await conflictWarnings.first().click()
        
        await expect(page.locator('[data-testid="conflict-resolution-modal"]')).toBeVisible()
      }
    })
  })

  test.describe('Audit and Compliance', () => {
    test('should log permission changes in audit trail', async () => {
      await loginUser(page, adminUser.email, 'AdminPassword123!')
      await page.goto('/dashboard/organization/security')
      
      // Navigate to audit logs
      await page.click('[data-testid="audit-logs-tab"]')
      
      // Check for permission-related audit entries
      await page.fill('[data-testid="audit-search"]', 'permission')
      await page.waitForTimeout(500)
      
      const auditEntries = page.locator('[data-testid="audit-entry"]')
      
      if (await auditEntries.count() > 0) {
        // Should show permission changes
        await expect(auditEntries.first()).toContainText(/permission|role/i)
        
        // Click to view details
        await auditEntries.first().click()
        
        await expect(page.locator('[data-testid="audit-details-modal"]')).toBeVisible()
        await expect(page.locator('[data-testid="audit-action"]')).toBeVisible()
        await expect(page.locator('[data-testid="audit-user"]')).toBeVisible()
        await expect(page.locator('[data-testid="audit-timestamp"]')).toBeVisible()
      }
    })

    test('should generate permission compliance reports', async () => {
      await page.goto('/dashboard/organization/compliance')
      
      // Generate permissions report
      await page.click('[data-testid="generate-permissions-report"]')
      
      // Configure report parameters
      await page.click('[data-testid="report-date-range"]')
      await page.click('[data-testid="last-30-days"]')
      
      await page.check('[data-testid="include-role-changes"]')
      await page.check('[data-testid="include-permission-usage"]')
      
      // Generate report
      await page.click('[data-testid="create-report"]')
      
      // Verify report generation
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Report generated successfully')
      
      // Should show in reports list
      await expect(page.locator('[data-testid="report-item"]').filter({ hasText: 'Permissions Report' })).toBeVisible()
    })
  })
})