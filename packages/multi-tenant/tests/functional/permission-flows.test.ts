/**
 * Functional tests for permission and role management flows
 * Tests RBAC system, custom roles, and permission enforcement
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, createTestUser, cleanupTestData, TestWrapper } from '../utils/test-setup'
import { OrganizationProvider } from '../../src/providers/OrganizationProvider'
import { PermissionProvider } from '../../src/providers/PermissionProvider'
import { RoleEditor } from '../../src/components/permissions/RoleEditor'
import { PermissionMatrix } from '../../src/components/permissions/PermissionMatrix'
import { PermissionGuard } from '../../src/components/permissions/PermissionGuard'
import { PermissionEngine } from '../../src/lib/permissions/permission-engine'
import type { Organization, User, CustomRole } from '../../src/types'

describe('Permission and Role Management Flows', () => {
  let testUser: User
  let testOrg: Organization
  let testDb: any
  let permissionEngine: PermissionEngine

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testUser = await createTestUser()
    permissionEngine = new PermissionEngine(testDb)

    // Create test organization
    const orgData = await testDb.from('organizations').insert({
      name: 'Permission Test Org',
      slug: 'permission-test',
      created_by: testUser.id
    }).select().single()

    testOrg = orgData.data

    // Add user as owner
    await testDb.from('organization_members').insert({
      organization_id: testOrg.id,
      user_id: testUser.id,
      role: 'owner'
    })
  })

  afterEach(async () => {
    await cleanupTestData(testDb)
  })

  describe('Built-in Role Permission Flow', () => {
    it('should grant correct permissions for owner role', async () => {
      const hasOrgDelete = await permissionEngine.checkPermission(
        testUser.id,
        testOrg.id,
        'organization',
        'delete'
      )

      const hasOrgManage = await permissionEngine.checkPermission(
        testUser.id,
        testOrg.id,
        'organization',
        'manage'
      )

      const hasWorkspaceCreate = await permissionEngine.checkPermission(
        testUser.id,
        testOrg.id,
        'workspace',
        'create'
      )

      expect(hasOrgDelete).toBe(true)
      expect(hasOrgManage).toBe(true)
      expect(hasWorkspaceCreate).toBe(true)
    })

    it('should restrict permissions for member role', async () => {
      const memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })

      const hasOrgDelete = await permissionEngine.checkPermission(
        memberUser.id,
        testOrg.id,
        'organization',
        'delete'
      )

      const hasOrgManage = await permissionEngine.checkPermission(
        memberUser.id,
        testOrg.id,
        'organization',
        'manage'
      )

      const hasProjectView = await permissionEngine.checkPermission(
        memberUser.id,
        testOrg.id,
        'project',
        'view'
      )

      expect(hasOrgDelete).toBe(false)
      expect(hasOrgManage).toBe(false)
      expect(hasProjectView).toBe(true)
    })

    it('should correctly implement admin permissions', async () => {
      const adminUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: adminUser.id,
        role: 'admin'
      })

      const hasOrgDelete = await permissionEngine.checkPermission(
        adminUser.id,
        testOrg.id,
        'organization',
        'delete'
      )

      const hasOrgManage = await permissionEngine.checkPermission(
        adminUser.id,
        testOrg.id,
        'organization',
        'manage'
      )

      const hasMemberManage = await permissionEngine.checkPermission(
        adminUser.id,
        testOrg.id,
        'organization',
        'manage_members'
      )

      expect(hasOrgDelete).toBe(false) // Only owners can delete
      expect(hasOrgManage).toBe(true)
      expect(hasMemberManage).toBe(true)
    })
  })

  describe('Custom Role Creation Flow', () => {
    it('should allow creating custom role with specific permissions', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <RoleEditor />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Create custom role
      await user.type(screen.getByLabelText(/role name/i), 'Content Manager')
      await user.type(screen.getByLabelText(/display name/i), 'Content Manager')
      await user.type(
        screen.getByLabelText(/description/i),
        'Manages content and projects'
      )

      // Select permissions
      await user.check(screen.getByLabelText(/project:create/i))
      await user.check(screen.getByLabelText(/project:update/i))
      await user.check(screen.getByLabelText(/project:view/i))

      await user.click(screen.getByRole('button', { name: /create role/i }))

      await waitFor(() => {
        expect(screen.getByText(/role created successfully/i)).toBeInTheDocument()
      })

      // Verify role in database
      const customRole = await testDb.from('custom_roles')
        .select('*')
        .eq('name', 'content_manager')
        .eq('organization_id', testOrg.id)
        .single()

      expect(customRole.data.display_name).toBe('Content Manager')
      expect(customRole.data.permissions).toEqual([
        'project:create',
        'project:update', 
        'project:view'
      ])
    })

    it('should validate role name uniqueness', async () => {
      const user = userEvent.setup()

      // Create existing role
      await testDb.from('custom_roles').insert({
        name: 'existing_role',
        display_name: 'Existing Role',
        organization_id: testOrg.id,
        level: 'organization',
        permissions: ['project:view'],
        created_by: testUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <RoleEditor />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/role name/i), 'Existing Role')
      await user.click(screen.getByRole('button', { name: /create role/i }))

      await waitFor(() => {
        expect(screen.getByText(/role name already exists/i)).toBeInTheDocument()
      })
    })

    it('should support role inheritance', async () => {
      const user = userEvent.setup()

      // Create parent role first
      await testDb.from('custom_roles').insert({
        name: 'base_role',
        display_name: 'Base Role',
        organization_id: testOrg.id,
        level: 'organization',
        permissions: ['project:view', 'project:create'],
        created_by: testUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <RoleEditor />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/role name/i), 'Extended Role')
      
      // Set inheritance
      await user.selectOptions(
        screen.getByLabelText(/inherit from/i),
        'base_role'
      )

      // Add additional permissions
      await user.check(screen.getByLabelText(/project:update/i))

      await user.click(screen.getByRole('button', { name: /create role/i }))

      await waitFor(async () => {
        const extendedRole = await testDb.from('custom_roles')
          .select('*')
          .eq('name', 'extended_role')
          .single()

        expect(extendedRole.data.inherits_from).toEqual(['base_role'])
        
        // Verify effective permissions include inherited ones
        const effectivePerms = await permissionEngine.getEffectivePermissions(
          extendedRole.data.id
        )
        
        expect(effectivePerms).toContain('project:view')
        expect(effectivePerms).toContain('project:create')
        expect(effectivePerms).toContain('project:update')
      })
    })
  })

  describe('Permission Assignment Flow', () => {
    let customRole: CustomRole
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      // Create custom role
      const roleData = await testDb.from('custom_roles').insert({
        name: 'project_lead',
        display_name: 'Project Lead',
        organization_id: testOrg.id,
        level: 'organization',
        permissions: ['project:create', 'project:update', 'project:manage_members'],
        created_by: testUser.id
      }).select().single()

      customRole = roleData.data

      // Add member to organization
      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should allow assigning custom role to member', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <MemberRoleAssignment memberId={memberUser.id} />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Assign custom role
      await user.selectOptions(
        screen.getByLabelText(/additional roles/i),
        customRole.id
      )

      await user.click(screen.getByRole('button', { name: /assign role/i }))

      await waitFor(async () => {
        const assignment = await testDb.from('member_role_assignments')
          .select('*')
          .eq('user_id', memberUser.id)
          .eq('role_id', customRole.id)

        expect(assignment.data).toHaveLength(1)
      })
    })

    it('should allow granting individual permissions', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <IndividualPermissions memberId={memberUser.id} />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Grant specific permission
      await user.check(screen.getByLabelText(/organization:view_audit_logs/i))
      await user.click(screen.getByRole('button', { name: /save permissions/i }))

      await waitFor(async () => {
        const permission = await testDb.from('member_permissions')
          .select('*')
          .eq('user_id', memberUser.id)
          .eq('permission', 'organization:view_audit_logs')
          .single()

        expect(permission.data.granted).toBe(true)
      })
    })

    it('should handle permission conflicts correctly', async () => {
      // Grant permission directly
      await testDb.from('member_permissions').insert({
        user_id: memberUser.id,
        permission: 'project:delete',
        granted: true,
        granted_by: testUser.id
      })

      // Assign role that denies the same permission
      const restrictiveRoleData = await testDb.from('custom_roles').insert({
        name: 'restrictive_role',
        display_name: 'Restrictive Role',
        organization_id: testOrg.id,
        level: 'organization',
        permissions: [],
        denied_permissions: ['project:delete'],
        created_by: testUser.id
      }).select().single()

      const hasPermission = await permissionEngine.checkPermission(
        memberUser.id,
        testOrg.id,
        'project',
        'delete'
      )

      // Direct permission should override role denial
      expect(hasPermission).toBe(true)
    })
  })

  describe('Permission Enforcement Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should enforce permissions in UI components', async () => {
      render(
        <TestWrapper user={memberUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionGuard permission="organization:delete">
                <button>Delete Organization</button>
              </PermissionGuard>
              
              <PermissionGuard permission="project:view">
                <div>Project Content</div>
              </PermissionGuard>
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Member shouldn't see delete button
        expect(screen.queryByRole('button', { name: /delete organization/i }))
          .not.toBeInTheDocument()
        
        // But should see project content
        expect(screen.getByText('Project Content')).toBeInTheDocument()
      })
    })

    it('should provide fallback content for denied permissions', async () => {
      render(
        <TestWrapper user={memberUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionGuard 
                permission="organization:manage" 
                fallback={<div>Access Denied</div>}
              >
                <div>Admin Content</div>
              </PermissionGuard>
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
      })
    })

    it('should support multiple permission checks', async () => {
      render(
        <TestWrapper user={memberUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionGuard 
                permissions={['project:view', 'project:create']}
                requireAll={true}
              >
                <div>Advanced Project Features</div>
              </PermissionGuard>
              
              <PermissionGuard 
                permissions={['project:view', 'workspace:view']}
                requireAll={false}
              >
                <div>Basic Content</div>
              </PermissionGuard>
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Should not see advanced features (requires both permissions)
        expect(screen.queryByText('Advanced Project Features'))
          .not.toBeInTheDocument()
        
        // Should see basic content (requires any permission)
        expect(screen.getByText('Basic Content')).toBeInTheDocument()
      })
    })
  })

  describe('Permission Matrix Flow', () => {
    let adminUser: User
    let memberUser: User

    beforeEach(async () => {
      adminUser = await createTestUser()
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert([
        { organization_id: testOrg.id, user_id: adminUser.id, role: 'admin' },
        { organization_id: testOrg.id, user_id: memberUser.id, role: 'member' }
      ])
    })

    it('should display permission matrix for all members', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionMatrix />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Should show all members
        expect(screen.getByText(testUser.email)).toBeInTheDocument()
        expect(screen.getByText(adminUser.email)).toBeInTheDocument()
        expect(screen.getByText(memberUser.email)).toBeInTheDocument()

        // Should show permission columns
        expect(screen.getByText(/organization:manage/i)).toBeInTheDocument()
        expect(screen.getByText(/project:create/i)).toBeInTheDocument()
      })
    })

    it('should allow bulk permission changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionMatrix />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Select multiple members
      await user.check(screen.getByTestId(`member-checkbox-${adminUser.id}`))
      await user.check(screen.getByTestId(`member-checkbox-${memberUser.id}`))

      // Apply bulk permission change
      await user.selectOptions(
        screen.getByLabelText(/bulk action/i),
        'grant_permission'
      )
      await user.selectOptions(
        screen.getByLabelText(/permission/i),
        'project:manage'
      )
      await user.click(screen.getByRole('button', { name: /apply/i }))

      await waitFor(async () => {
        const permissions = await testDb.from('member_permissions')
          .select('*')
          .eq('permission', 'project:manage')
          .in('user_id', [adminUser.id, memberUser.id])

        expect(permissions.data).toHaveLength(2)
        permissions.data.forEach(perm => {
          expect(perm.granted).toBe(true)
        })
      })
    })
  })

  describe('Audit and Compliance Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should log permission changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <IndividualPermissions memberId={memberUser.id} />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.check(screen.getByLabelText(/project:manage/i))
      await user.click(screen.getByRole('button', { name: /save permissions/i }))

      await waitFor(async () => {
        const auditLog = await testDb.from('audit_logs')
          .select('*')
          .eq('action', 'permission_granted')
          .eq('resource_type', 'member_permission')
          .single()

        expect(auditLog.data.actor_id).toBe(testUser.id)
        expect(auditLog.data.changes).toMatchObject({
          permission: 'project:manage',
          granted_to: memberUser.id
        })
      })
    })

    it('should track role assignments in audit log', async () => {
      const roleData = await testDb.from('custom_roles').insert({
        name: 'test_role',
        display_name: 'Test Role',
        organization_id: testOrg.id,
        level: 'organization',
        permissions: ['project:view'],
        created_by: testUser.id
      }).select().single()

      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <MemberRoleAssignment memberId={memberUser.id} />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.selectOptions(
        screen.getByLabelText(/additional roles/i),
        roleData.data.id
      )
      await user.click(screen.getByRole('button', { name: /assign role/i }))

      await waitFor(async () => {
        const auditLog = await testDb.from('audit_logs')
          .select('*')
          .eq('action', 'role_assigned')
          .single()

        expect(auditLog.data.changes).toMatchObject({
          role_id: roleData.data.id,
          assigned_to: memberUser.id
        })
      })
    })

    it('should provide permission audit report', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <PermissionAuditReport />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/permission audit report/i)).toBeInTheDocument()
        expect(screen.getByText(/total members/i)).toBeInTheDocument()
        expect(screen.getByText(/custom roles/i)).toBeInTheDocument()
        expect(screen.getByText(/permission overrides/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Isolation in Permission Management', () => {
    let otherOrg: Organization
    let otherUser: User

    beforeEach(async () => {
      otherUser = await createTestUser()

      // Create another organization
      const orgData = await testDb.from('organizations').insert({
        name: 'Other Org',
        slug: 'other-org',
        created_by: otherUser.id
      }).select().single()

      otherOrg = orgData.data

      await testDb.from('organization_members').insert({
        organization_id: otherOrg.id,
        user_id: otherUser.id,
        role: 'owner'
      })
    })

    it('should isolate custom roles between organizations', async () => {
      // Create role in other organization
      await testDb.from('custom_roles').insert({
        name: 'other_org_role',
        display_name: 'Other Org Role',
        organization_id: otherOrg.id,
        level: 'organization',
        permissions: ['project:view'],
        created_by: otherUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <PermissionProvider>
              <RoleSelector />
            </PermissionProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Should not see roles from other organizations
        expect(screen.queryByText('Other Org Role')).not.toBeInTheDocument()
      })
    })

    it('should prevent cross-organization permission checks', async () => {
      const hasPermission = await permissionEngine.checkPermission(
        testUser.id,
        otherOrg.id,
        'organization',
        'view'
      )

      expect(hasPermission).toBe(false)
    })

    it('should enforce RLS for permission-related tables', async () => {
      // testUser should not see custom roles from other orgs
      const roles = await testDb
        .from('custom_roles')
        .select('*')
        .eq('organization_id', otherOrg.id)
        .as(testUser)

      expect(roles.data).toHaveLength(0)
    })
  })
})