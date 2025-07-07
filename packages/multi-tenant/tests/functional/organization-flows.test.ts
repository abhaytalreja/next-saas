/**
 * Functional tests for organization management flows
 * Tests the complete user journey for organization operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, createTestUser, cleanupTestData, TestWrapper } from '../utils/test-setup'
import { OrganizationProvider } from '../../src/providers/OrganizationProvider'
import { OrganizationSwitcher } from '../../src/components/organization/OrganizationSwitcher'
import { CreateOrganizationForm } from '../../src/components/organization/CreateOrganizationForm'
import type { Organization, User } from '../../src/types'

describe('Organization Management Flows', () => {
  let testUser: User
  let testDb: any

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testUser = await createTestUser()
  })

  afterEach(async () => {
    await cleanupTestData(testDb)
  })

  describe('Organization Creation Flow', () => {
    it('should allow user to create a new organization', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser}>
          <OrganizationProvider>
            <CreateOrganizationForm onSuccess={() => {}} />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Fill out organization form
      await user.type(
        screen.getByLabelText(/organization name/i),
        'Test Organization'
      )
      
      await user.type(
        screen.getByLabelText(/slug/i),
        'test-org'
      )

      await user.type(
        screen.getByLabelText(/description/i),
        'A test organization for functional testing'
      )

      // Submit form
      await user.click(screen.getByRole('button', { name: /create organization/i }))

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/organization created successfully/i)).toBeInTheDocument()
      })

      // Verify organization exists in database
      const organizations = await testDb.from('organizations')
        .select('*')
        .eq('slug', 'test-org')

      expect(organizations.data).toHaveLength(1)
      expect(organizations.data[0].name).toBe('Test Organization')
    })

    it('should validate organization slug uniqueness', async () => {
      const user = userEvent.setup()
      
      // Create organization with existing slug
      await testDb.from('organizations').insert({
        name: 'Existing Org',
        slug: 'existing-org',
        created_by: testUser.id
      })

      render(
        <TestWrapper user={testUser}>
          <OrganizationProvider>
            <CreateOrganizationForm onSuccess={() => {}} />
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(
        screen.getByLabelText(/organization name/i),
        'Another Organization'
      )
      
      await user.type(
        screen.getByLabelText(/slug/i),
        'existing-org'
      )

      await user.click(screen.getByRole('button', { name: /create organization/i }))

      await waitFor(() => {
        expect(screen.getByText(/slug already exists/i)).toBeInTheDocument()
      })
    })

    it('should auto-assign creator as owner', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser}>
          <OrganizationProvider>
            <CreateOrganizationForm onSuccess={() => {}} />
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(screen.getByLabelText(/organization name/i), 'Owner Test Org')
      await user.type(screen.getByLabelText(/slug/i), 'owner-test')
      await user.click(screen.getByRole('button', { name: /create organization/i }))

      await waitFor(async () => {
        const membership = await testDb.from('organization_members')
          .select('*')
          .eq('user_id', testUser.id)
          .single()

        expect(membership.data.role).toBe('owner')
      })
    })
  })

  describe('Organization Switching Flow', () => {
    let org1: Organization
    let org2: Organization

    beforeEach(async () => {
      // Create two test organizations
      const orgData1 = await testDb.from('organizations').insert({
        name: 'Organization One',
        slug: 'org-one',
        created_by: testUser.id
      }).select().single()

      const orgData2 = await testDb.from('organizations').insert({
        name: 'Organization Two', 
        slug: 'org-two',
        created_by: testUser.id
      }).select().single()

      org1 = orgData1.data
      org2 = orgData2.data

      // Add user as member to both organizations
      await testDb.from('organization_members').insert([
        { organization_id: org1.id, user_id: testUser.id, role: 'owner' },
        { organization_id: org2.id, user_id: testUser.id, role: 'admin' }
      ])
    })

    it('should display all user organizations in switcher', async () => {
      render(
        <TestWrapper user={testUser}>
          <OrganizationProvider>
            <OrganizationSwitcher />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Open organization switcher
      await userEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('Organization One')).toBeInTheDocument()
        expect(screen.getByText('Organization Two')).toBeInTheDocument()
      })
    })

    it('should switch between organizations', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={org1}>
          <OrganizationProvider>
            <OrganizationSwitcher />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Verify initial organization
      expect(screen.getByText('Organization One')).toBeInTheDocument()

      // Open switcher and select different org
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Organization Two'))

      await waitFor(() => {
        expect(screen.getByText('Organization Two')).toBeInTheDocument()
      })
    })

    it('should update user context after switching', async () => {
      const user = userEvent.setup()
      let currentOrgId: string | null = null

      const TestComponent = () => {
        const { currentOrganization } = useOrganization()
        currentOrgId = currentOrganization?.id || null
        return <div>Current: {currentOrganization?.name}</div>
      }

      render(
        <TestWrapper user={testUser} initialOrganization={org1}>
          <OrganizationProvider>
            <OrganizationSwitcher />
            <TestComponent />
          </OrganizationProvider>
        </TestWrapper>
      )

      expect(currentOrgId).toBe(org1.id)

      // Switch organization
      await user.click(screen.getByRole('button'))
      await user.click(screen.getByText('Organization Two'))

      await waitFor(() => {
        expect(currentOrgId).toBe(org2.id)
      })
    })
  })

  describe('Organization Settings Flow', () => {
    let testOrg: Organization

    beforeEach(async () => {
      const orgData = await testDb.from('organizations').insert({
        name: 'Settings Test Org',
        slug: 'settings-test',
        created_by: testUser.id
      }).select().single()

      testOrg = orgData.data

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: testUser.id,
        role: 'owner'
      })
    })

    it('should allow updating organization details', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <OrganizationSettings />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Update organization name
      const nameInput = screen.getByDisplayValue('Settings Test Org')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Organization Name')

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(async () => {
        const updated = await testDb.from('organizations')
          .select('name')
          .eq('id', testOrg.id)
          .single()

        expect(updated.data.name).toBe('Updated Organization Name')
      })
    })

    it('should prevent non-owners from updating organization', async () => {
      // Change user role to admin
      await testDb.from('organization_members')
        .update({ role: 'admin' })
        .eq('user_id', testUser.id)

      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <OrganizationSettings />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Settings form should be disabled or show access denied
      expect(screen.getByText(/access denied/i) || 
             screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })
  })

  describe('Organization Deletion Flow', () => {
    let testOrg: Organization

    beforeEach(async () => {
      const orgData = await testDb.from('organizations').insert({
        name: 'Delete Test Org',
        slug: 'delete-test',
        created_by: testUser.id
      }).select().single()

      testOrg = orgData.data

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: testUser.id,
        role: 'owner'
      })
    })

    it('should allow owner to delete organization', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <DeleteOrganization />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Type confirmation text
      await user.type(
        screen.getByLabelText(/type "delete-test" to confirm/i),
        'delete-test'
      )

      await user.click(screen.getByRole('button', { name: /delete organization/i }))

      await waitFor(async () => {
        const deleted = await testDb.from('organizations')
          .select('*')
          .eq('id', testOrg.id)

        expect(deleted.data).toHaveLength(0)
      })
    })

    it('should prevent non-owners from deleting organization', async () => {
      // Change user role to admin
      await testDb.from('organization_members')
        .update({ role: 'admin' })
        .eq('user_id', testUser.id)

      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <DeleteOrganization />
          </OrganizationProvider>
        </TestWrapper>
      )

      expect(screen.getByText(/only owners can delete/i)).toBeInTheDocument()
    })
  })

  describe('Data Isolation Verification', () => {
    let user1: User
    let user2: User
    let org1: Organization
    let org2: Organization

    beforeEach(async () => {
      user1 = await createTestUser()
      user2 = await createTestUser()

      // Create separate organizations for each user
      const org1Data = await testDb.from('organizations').insert({
        name: 'User 1 Org',
        slug: 'user1-org',
        created_by: user1.id
      }).select().single()

      const org2Data = await testDb.from('organizations').insert({
        name: 'User 2 Org',
        slug: 'user2-org', 
        created_by: user2.id
      }).select().single()

      org1 = org1Data.data
      org2 = org2Data.data

      await testDb.from('organization_members').insert([
        { organization_id: org1.id, user_id: user1.id, role: 'owner' },
        { organization_id: org2.id, user_id: user2.id, role: 'owner' }
      ])
    })

    it('should only show organizations user has access to', async () => {
      render(
        <TestWrapper user={user1}>
          <OrganizationProvider>
            <OrganizationSwitcher />
          </OrganizationProvider>
        </TestWrapper>
      )

      await userEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('User 1 Org')).toBeInTheDocument()
        expect(screen.queryByText('User 2 Org')).not.toBeInTheDocument()
      })
    })

    it('should enforce RLS policies for organization data', async () => {
      // User 1 should not be able to access User 2's organization data
      const response = await testDb
        .from('organizations')
        .select('*')
        .eq('id', org2.id)
        .as(user1)

      expect(response.data).toHaveLength(0)
    })
  })
})