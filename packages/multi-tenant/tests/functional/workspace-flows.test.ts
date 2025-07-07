/**
 * Functional tests for workspace management flows
 * Tests workspace creation, management, and hierarchy operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, createTestUser, cleanupTestData, TestWrapper } from '../utils/test-setup'
import { OrganizationProvider } from '../../src/providers/OrganizationProvider'
import { WorkspaceProvider } from '../../src/providers/WorkspaceProvider'
import { WorkspaceList } from '../../src/components/workspace/WorkspaceList'
import { CreateWorkspaceForm } from '../../src/components/workspace/CreateWorkspaceForm'
import { WorkspaceSettings } from '../../src/components/workspace/WorkspaceSettings'
import type { Organization, User, Workspace } from '../../src/types'

describe('Workspace Management Flows', () => {
  let testUser: User
  let testOrg: Organization
  let testDb: any

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testUser = await createTestUser()

    // Create test organization
    const orgData = await testDb.from('organizations').insert({
      name: 'Workspace Test Org',
      slug: 'workspace-test',
      created_by: testUser.id
    }).select().single()

    testOrg = orgData.data

    // Add user as admin
    await testDb.from('organization_members').insert({
      organization_id: testOrg.id,
      user_id: testUser.id,
      role: 'admin'
    })
  })

  afterEach(async () => {
    await cleanupTestData(testDb)
  })

  describe('Workspace Creation Flow', () => {
    it('should allow admin to create new workspace', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <CreateWorkspaceForm />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Fill workspace form
      await user.type(
        screen.getByLabelText(/workspace name/i),
        'Development Team'
      )
      
      await user.type(
        screen.getByLabelText(/slug/i),
        'dev-team'
      )

      await user.type(
        screen.getByLabelText(/description/i),
        'Workspace for development team collaboration'
      )

      await user.click(screen.getByRole('button', { name: /create workspace/i }))

      await waitFor(() => {
        expect(screen.getByText(/workspace created successfully/i)).toBeInTheDocument()
      })

      // Verify workspace exists in database
      const workspace = await testDb.from('workspaces')
        .select('*')
        .eq('slug', 'dev-team')
        .eq('organization_id', testOrg.id)
        .single()

      expect(workspace.data.name).toBe('Development Team')
      expect(workspace.data.created_by).toBe(testUser.id)
    })

    it('should validate workspace slug uniqueness within organization', async () => {
      const user = userEvent.setup()

      // Create workspace with existing slug
      await testDb.from('workspaces').insert({
        name: 'Existing Workspace',
        slug: 'existing-workspace',
        organization_id: testOrg.id,
        created_by: testUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <CreateWorkspaceForm />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/workspace name/i), 'Another Workspace')
      await user.type(screen.getByLabelText(/slug/i), 'existing-workspace')
      await user.click(screen.getByRole('button', { name: /create workspace/i }))

      await waitFor(() => {
        expect(screen.getByText(/slug already exists/i)).toBeInTheDocument()
      })
    })

    it('should auto-create default workspace for new organizations', async () => {
      // Create new organization
      const newOrgData = await testDb.from('organizations').insert({
        name: 'New Org',
        slug: 'new-org',
        created_by: testUser.id
      }).select().single()

      const newOrg = newOrgData.data

      // Trigger default workspace creation
      render(
        <TestWrapper user={testUser} initialOrganization={newOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <WorkspaceList />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(async () => {
        const defaultWorkspace = await testDb.from('workspaces')
          .select('*')
          .eq('organization_id', newOrg.id)
          .eq('is_default', true)

        expect(defaultWorkspace.data).toHaveLength(1)
        expect(defaultWorkspace.data[0].name).toBe('General')
      })
    })

    it('should prevent members from creating workspaces', async () => {
      // Change user role to member
      await testDb.from('organization_members')
        .update({ role: 'member' })
        .eq('user_id', testUser.id)
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <CreateWorkspaceForm />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument()
    })
  })

  describe('Workspace Listing and Navigation Flow', () => {
    let workspace1: Workspace
    let workspace2: Workspace

    beforeEach(async () => {
      // Create test workspaces
      const ws1Data = await testDb.from('workspaces').insert({
        name: 'Frontend Team',
        slug: 'frontend',
        organization_id: testOrg.id,
        created_by: testUser.id,
        is_default: true
      }).select().single()

      const ws2Data = await testDb.from('workspaces').insert({
        name: 'Backend Team',
        slug: 'backend',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()

      workspace1 = ws1Data.data
      workspace2 = ws2Data.data

      // Add user as member to both workspaces
      await testDb.from('workspace_members').insert([
        { workspace_id: workspace1.id, user_id: testUser.id, role: 'admin' },
        { workspace_id: workspace2.id, user_id: testUser.id, role: 'member' }
      ])
    })

    it('should display all accessible workspaces', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <WorkspaceList />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Frontend Team')).toBeInTheDocument()
        expect(screen.getByText('Backend Team')).toBeInTheDocument()
      })
    })

    it('should allow switching between workspaces', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={workspace1}>
              <WorkspaceSwitcher />
              <CurrentWorkspaceInfo />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Verify initial workspace
      expect(screen.getByText('Current: Frontend Team')).toBeInTheDocument()

      // Switch workspace
      await user.click(screen.getByRole('button', { name: /switch workspace/i }))
      await user.click(screen.getByText('Backend Team'))

      await waitFor(() => {
        expect(screen.getByText('Current: Backend Team')).toBeInTheDocument()
      })
    })

    it('should filter workspaces by user access', async () => {
      const limitedUser = await createTestUser()

      // Add limited user only to workspace1
      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: limitedUser.id,
        role: 'member'
      })

      await testDb.from('workspace_members').insert({
        workspace_id: workspace1.id,
        user_id: limitedUser.id,
        role: 'viewer'
      })
      
      render(
        <TestWrapper user={limitedUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <WorkspaceList />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Frontend Team')).toBeInTheDocument()
        expect(screen.queryByText('Backend Team')).not.toBeInTheDocument()
      })
    })
  })

  describe('Workspace Settings Flow', () => {
    let testWorkspace: Workspace

    beforeEach(async () => {
      const wsData = await testDb.from('workspaces').insert({
        name: 'Settings Test Workspace',
        slug: 'settings-test',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()

      testWorkspace = wsData.data

      await testDb.from('workspace_members').insert({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: 'admin'
      })
    })

    it('should allow workspace admin to update settings', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceSettings />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Update workspace name
      const nameInput = screen.getByDisplayValue('Settings Test Workspace')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Workspace Name')

      // Update description
      await user.type(
        screen.getByLabelText(/description/i),
        'Updated workspace description'
      )

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(async () => {
        const updated = await testDb.from('workspaces')
          .select('*')
          .eq('id', testWorkspace.id)
          .single()

        expect(updated.data.name).toBe('Updated Workspace Name')
        expect(updated.data.description).toBe('Updated workspace description')
      })
    })

    it('should prevent non-admins from updating workspace', async () => {
      // Change user role to member
      await testDb.from('workspace_members')
        .update({ role: 'member' })
        .eq('user_id', testUser.id)
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceSettings />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Settings should be disabled or show access denied
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Workspace Member Management Flow', () => {
    let testWorkspace: Workspace
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      const wsData = await testDb.from('workspaces').insert({
        name: 'Member Test Workspace',
        slug: 'member-test',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()

      testWorkspace = wsData.data

      // Add both users to organization
      await testDb.from('organization_members').insert([
        { organization_id: testOrg.id, user_id: memberUser.id, role: 'member' }
      ])

      // Add test user as workspace admin
      await testDb.from('workspace_members').insert({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: 'admin'
      })
    })

    it('should allow adding organization members to workspace', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceMemberManagement />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Add member to workspace
      await user.click(screen.getByRole('button', { name: /add member/i }))
      await user.selectOptions(screen.getByLabelText(/select member/i), memberUser.id)
      await user.selectOptions(screen.getByLabelText(/role/i), 'member')
      await user.click(screen.getByRole('button', { name: /add to workspace/i }))

      await waitFor(async () => {
        const workspaceMember = await testDb.from('workspace_members')
          .select('*')
          .eq('workspace_id', testWorkspace.id)
          .eq('user_id', memberUser.id)
          .single()

        expect(workspaceMember.data.role).toBe('member')
      })
    })

    it('should allow changing workspace member roles', async () => {
      const user = userEvent.setup()

      // Add member to workspace first
      await testDb.from('workspace_members').insert({
        workspace_id: testWorkspace.id,
        user_id: memberUser.id,
        role: 'member'
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceMemberManagement />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      // Change role to admin
      const memberRow = screen.getByTestId(`workspace-member-${memberUser.id}`)
      const roleSelect = within(memberRow).getByLabelText(/role/i)
      
      await user.selectOptions(roleSelect, 'admin')
      await user.click(within(memberRow).getByRole('button', { name: /save/i }))

      await waitFor(async () => {
        const updated = await testDb.from('workspace_members')
          .select('role')
          .eq('workspace_id', testWorkspace.id)
          .eq('user_id', memberUser.id)
          .single()

        expect(updated.data.role).toBe('admin')
      })
    })

    it('should allow removing members from workspace', async () => {
      const user = userEvent.setup()

      await testDb.from('workspace_members').insert({
        workspace_id: testWorkspace.id,
        user_id: memberUser.id,
        role: 'member'
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceMemberManagement />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      const memberRow = screen.getByTestId(`workspace-member-${memberUser.id}`)
      await user.click(within(memberRow).getByRole('button', { name: /remove/i }))
      await user.click(screen.getByRole('button', { name: /confirm remove/i }))

      await waitFor(async () => {
        const membership = await testDb.from('workspace_members')
          .select('*')
          .eq('workspace_id', testWorkspace.id)
          .eq('user_id', memberUser.id)

        expect(membership.data).toHaveLength(0)
      })
    })
  })

  describe('Workspace Archival Flow', () => {
    let testWorkspace: Workspace

    beforeEach(async () => {
      const wsData = await testDb.from('workspaces').insert({
        name: 'Archive Test Workspace',
        slug: 'archive-test',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()

      testWorkspace = wsData.data

      await testDb.from('workspace_members').insert({
        workspace_id: testWorkspace.id,
        user_id: testUser.id,
        role: 'admin'
      })
    })

    it('should allow archiving workspace', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceSettings />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.click(screen.getByRole('button', { name: /archive workspace/i }))
      await user.type(
        screen.getByLabelText(/type "archive-test" to confirm/i),
        'archive-test'
      )
      await user.click(screen.getByRole('button', { name: /confirm archive/i }))

      await waitFor(async () => {
        const archived = await testDb.from('workspaces')
          .select('is_archived')
          .eq('id', testWorkspace.id)
          .single()

        expect(archived.data.is_archived).toBe(true)
      })
    })

    it('should allow restoring archived workspace', async () => {
      const user = userEvent.setup()

      // Archive workspace first
      await testDb.from('workspaces')
        .update({ is_archived: true })
        .eq('id', testWorkspace.id)
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <ArchivedWorkspaceView />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.click(screen.getByRole('button', { name: /restore workspace/i }))

      await waitFor(async () => {
        const restored = await testDb.from('workspaces')
          .select('is_archived')
          .eq('id', testWorkspace.id)
          .single()

        expect(restored.data.is_archived).toBe(false)
      })
    })

    it('should prevent deleting default workspace', async () => {
      // Mark as default workspace
      await testDb.from('workspaces')
        .update({ is_default: true })
        .eq('id', testWorkspace.id)
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceSettings />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      const deleteButton = screen.queryByRole('button', { name: /delete workspace/i })
      expect(deleteButton).toBeNull()

      expect(screen.getByText(/default workspace cannot be deleted/i)).toBeInTheDocument()
    })
  })

  describe('Project Association Flow', () => {
    let testWorkspace: Workspace
    let testProject: any

    beforeEach(async () => {
      const wsData = await testDb.from('workspaces').insert({
        name: 'Project Test Workspace',
        slug: 'project-test',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()

      testWorkspace = wsData.data

      // Create a test project
      const projectData = await testDb.from('projects').insert({
        name: 'Test Project',
        organization_id: testOrg.id,
        workspace_id: testWorkspace.id,
        created_by: testUser.id
      }).select().single()

      testProject = projectData.data
    })

    it('should show projects associated with workspace', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <WorkspaceProjects />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument()
      })
    })

    it('should allow moving projects between workspaces', async () => {
      const user = userEvent.setup()

      // Create another workspace
      const anotherWsData = await testDb.from('workspaces').insert({
        name: 'Another Workspace',
        slug: 'another-workspace',
        organization_id: testOrg.id,
        created_by: testUser.id
      }).select().single()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider initialWorkspace={testWorkspace}>
              <ProjectManagement />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      const projectRow = screen.getByTestId(`project-${testProject.id}`)
      await user.selectOptions(
        within(projectRow).getByLabelText(/workspace/i),
        anotherWsData.data.id
      )
      await user.click(within(projectRow).getByRole('button', { name: /save/i }))

      await waitFor(async () => {
        const updated = await testDb.from('projects')
          .select('workspace_id')
          .eq('id', testProject.id)
          .single()

        expect(updated.data.workspace_id).toBe(anotherWsData.data.id)
      })
    })
  })

  describe('Data Isolation in Workspace Management', () => {
    let otherOrg: Organization
    let otherUser: User
    let otherWorkspace: Workspace

    beforeEach(async () => {
      otherUser = await createTestUser()

      // Create another organization and workspace
      const orgData = await testDb.from('organizations').insert({
        name: 'Other Org',
        slug: 'other-org',
        created_by: otherUser.id
      }).select().single()

      otherOrg = orgData.data

      const wsData = await testDb.from('workspaces').insert({
        name: 'Other Workspace',
        slug: 'other-workspace',
        organization_id: otherOrg.id,
        created_by: otherUser.id
      }).select().single()

      otherWorkspace = wsData.data

      await testDb.from('organization_members').insert({
        organization_id: otherOrg.id,
        user_id: otherUser.id,
        role: 'owner'
      })
    })

    it('should only show workspaces from current organization', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <WorkspaceProvider>
              <WorkspaceList />
            </WorkspaceProvider>
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Should not see workspaces from other organizations
        expect(screen.queryByText('Other Workspace')).not.toBeInTheDocument()
      })
    })

    it('should prevent cross-organization workspace operations', async () => {
      // testUser should not be able to access otherWorkspace
      const response = await testDb
        .from('workspaces')
        .select('*')
        .eq('id', otherWorkspace.id)
        .as(testUser)

      expect(response.data).toHaveLength(0)
    })

    it('should enforce RLS for workspace members', async () => {
      // testUser should not be able to see workspace members from other orgs
      const response = await testDb
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', otherWorkspace.id)
        .as(testUser)

      expect(response.data).toHaveLength(0)
    })
  })
})