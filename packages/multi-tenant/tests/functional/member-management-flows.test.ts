/**
 * Functional tests for member management flows
 * Tests invitation, role management, and member operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, createTestUser, cleanupTestData, TestWrapper } from '../utils/test-setup'
import { OrganizationProvider } from '../../src/providers/OrganizationProvider'
import { MemberList } from '../../src/components/members/MemberList'
import { InviteMemberForm } from '../../src/components/members/InviteMemberForm'
import type { Organization, User, OrganizationInvitation } from '../../src/types'

describe('Member Management Flows', () => {
  let testUser: User
  let testOrg: Organization
  let testDb: any

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testUser = await createTestUser()

    // Create test organization
    const orgData = await testDb.from('organizations').insert({
      name: 'Member Test Org',
      slug: 'member-test',
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

  describe('Member Invitation Flow', () => {
    it('should allow admin to invite new member', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <InviteMemberForm />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Fill invitation form
      await user.type(
        screen.getByLabelText(/email address/i),
        'newmember@example.com'
      )

      await user.selectOptions(
        screen.getByLabelText(/role/i),
        'member'
      )

      await user.click(screen.getByRole('button', { name: /send invitation/i }))

      await waitFor(() => {
        expect(screen.getByText(/invitation sent successfully/i)).toBeInTheDocument()
      })

      // Verify invitation created
      const invitation = await testDb.from('organization_invitations')
        .select('*')
        .eq('email', 'newmember@example.com')
        .single()

      expect(invitation.data.role).toBe('member')
      expect(invitation.data.organization_id).toBe(testOrg.id)
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <InviteMemberForm />
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(
        screen.getByLabelText(/email address/i),
        'invalid-email'
      )

      await user.click(screen.getByRole('button', { name: /send invitation/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      })
    })

    it('should prevent duplicate invitations', async () => {
      const user = userEvent.setup()

      // Create existing invitation
      await testDb.from('organization_invitations').insert({
        organization_id: testOrg.id,
        email: 'existing@example.com',
        role: 'member',
        invited_by: testUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <InviteMemberForm />
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.type(
        screen.getByLabelText(/email address/i),
        'existing@example.com'
      )

      await user.click(screen.getByRole('button', { name: /send invitation/i }))

      await waitFor(() => {
        expect(screen.getByText(/invitation already exists/i)).toBeInTheDocument()
      })
    })

    it('should allow bulk member invitations', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <BulkInviteMemberForm />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Add multiple emails
      const emailInput = screen.getByLabelText(/email addresses/i)
      await user.type(emailInput, 'user1@example.com, user2@example.com, user3@example.com')

      await user.selectOptions(screen.getByLabelText(/role/i), 'member')
      await user.click(screen.getByRole('button', { name: /send invitations/i }))

      await waitFor(() => {
        expect(screen.getByText(/3 invitations sent successfully/i)).toBeInTheDocument()
      })

      // Verify all invitations created
      const invitations = await testDb.from('organization_invitations')
        .select('*')
        .eq('organization_id', testOrg.id)

      expect(invitations.data).toHaveLength(3)
    })
  })

  describe('Invitation Acceptance Flow', () => {
    let invitation: OrganizationInvitation
    let invitedUser: User

    beforeEach(async () => {
      invitedUser = await createTestUser()

      const invitationData = await testDb.from('organization_invitations').insert({
        organization_id: testOrg.id,
        email: invitedUser.email,
        role: 'member',
        invited_by: testUser.id
      }).select().single()

      invitation = invitationData.data
    })

    it('should allow user to accept invitation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={invitedUser}>
          <OrganizationProvider>
            <AcceptInvitationPage token={invitation.token} />
          </OrganizationProvider>
        </TestWrapper>
      )

      await user.click(screen.getByRole('button', { name: /accept invitation/i }))

      await waitFor(() => {
        expect(screen.getByText(/welcome to the organization/i)).toBeInTheDocument()
      })

      // Verify membership created
      const membership = await testDb.from('organization_members')
        .select('*')
        .eq('user_id', invitedUser.id)
        .eq('organization_id', testOrg.id)
        .single()

      expect(membership.data.role).toBe('member')

      // Verify invitation marked as accepted
      const updatedInvitation = await testDb.from('organization_invitations')
        .select('*')
        .eq('id', invitation.id)
        .single()

      expect(updatedInvitation.data.accepted_at).toBeTruthy()
    })

    it('should reject expired invitations', async () => {
      // Mark invitation as expired
      await testDb.from('organization_invitations')
        .update({ expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000) })
        .eq('id', invitation.id)
      
      render(
        <TestWrapper user={invitedUser}>
          <OrganizationProvider>
            <AcceptInvitationPage token={invitation.token} />
          </OrganizationProvider>
        </TestWrapper>
      )

      expect(screen.getByText(/invitation has expired/i)).toBeInTheDocument()
    })

    it('should reject invalid invitation tokens', async () => {
      render(
        <TestWrapper user={invitedUser}>
          <OrganizationProvider>
            <AcceptInvitationPage token="invalid-token" />
          </OrganizationProvider>
        </TestWrapper>
      )

      expect(screen.getByText(/invalid invitation/i)).toBeInTheDocument()
    })
  })

  describe('Member Role Management Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      // Add member to organization
      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should allow admin to change member role', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Find member row and change role
      const memberRow = screen.getByTestId(`member-${memberUser.id}`)
      const roleSelect = within(memberRow).getByLabelText(/role/i)
      
      await user.selectOptions(roleSelect, 'admin')
      await user.click(within(memberRow).getByRole('button', { name: /save/i }))

      await waitFor(async () => {
        const updatedMember = await testDb.from('organization_members')
          .select('role')
          .eq('user_id', memberUser.id)
          .eq('organization_id', testOrg.id)
          .single()

        expect(updatedMember.data.role).toBe('admin')
      })
    })

    it('should prevent members from changing roles', async () => {
      // Switch to member user
      await testDb.from('organization_members')
        .update({ role: 'member' })
        .eq('user_id', testUser.id)
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Role selects should be disabled
      const roleSelects = screen.getAllByLabelText(/role/i)
      roleSelects.forEach(select => {
        expect(select).toBeDisabled()
      })
    })

    it('should prevent demoting the last owner', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Try to change owner role
      const ownerRow = screen.getByTestId(`member-${testUser.id}`)
      const roleSelect = within(ownerRow).getByLabelText(/role/i)
      
      await user.selectOptions(roleSelect, 'admin')
      await user.click(within(ownerRow).getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText(/cannot demote last owner/i)).toBeInTheDocument()
      })
    })
  })

  describe('Member Removal Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should allow admin to remove member', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      const memberRow = screen.getByTestId(`member-${memberUser.id}`)
      await user.click(within(memberRow).getByRole('button', { name: /remove/i }))

      // Confirm removal
      await user.click(screen.getByRole('button', { name: /confirm remove/i }))

      await waitFor(async () => {
        const membership = await testDb.from('organization_members')
          .select('*')
          .eq('user_id', memberUser.id)
          .eq('organization_id', testOrg.id)

        expect(membership.data).toHaveLength(0)
      })
    })

    it('should prevent owner from removing themselves', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      const ownerRow = screen.getByTestId(`member-${testUser.id}`)
      const removeButton = within(ownerRow).queryByRole('button', { name: /remove/i })
      
      expect(removeButton).toBeNull()
    })

    it('should suspend member instead of removing when specified', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      const memberRow = screen.getByTestId(`member-${memberUser.id}`)
      await user.click(within(memberRow).getByRole('button', { name: /suspend/i }))

      await user.type(
        screen.getByLabelText(/suspension reason/i),
        'Policy violation'
      )

      await user.click(screen.getByRole('button', { name: /confirm suspend/i }))

      await waitFor(async () => {
        const membership = await testDb.from('organization_members')
          .select('status')
          .eq('user_id', memberUser.id)
          .eq('organization_id', testOrg.id)
          .single()

        expect(membership.data.status).toBe('suspended')
      })
    })
  })

  describe('Member Activity Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should track member activity and last seen', async () => {
      render(
        <TestWrapper user={memberUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <DashboardPage />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Simulate user activity
      await fireEvent.focus(document.body)
      
      await waitFor(async () => {
        const membership = await testDb.from('organization_members')
          .select('last_accessed_at')
          .eq('user_id', memberUser.id)
          .eq('organization_id', testOrg.id)
          .single()

        expect(membership.data.last_accessed_at).toBeTruthy()
      }, { timeout: 5000 })
    })

    it('should show member activity in admin view', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberActivity />
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/member activity/i)).toBeInTheDocument()
        expect(screen.getByText(memberUser.email)).toBeInTheDocument()
      })
    })
  })

  describe('Permission Management Flow', () => {
    let memberUser: User

    beforeEach(async () => {
      memberUser = await createTestUser()

      await testDb.from('organization_members').insert({
        organization_id: testOrg.id,
        user_id: memberUser.id,
        role: 'member'
      })
    })

    it('should allow granting custom permissions to member', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberPermissions memberId={memberUser.id} />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Grant custom permission
      await user.check(screen.getByLabelText(/organization:view_audit_logs/i))
      await user.click(screen.getByRole('button', { name: /save permissions/i }))

      await waitFor(async () => {
        const permissions = await testDb.from('member_permissions')
          .select('*')
          .eq('user_id', memberUser.id)
          .eq('permission', 'organization:view_audit_logs')

        expect(permissions.data).toHaveLength(1)
        expect(permissions.data[0].granted).toBe(true)
      })
    })

    it('should revoke permissions correctly', async () => {
      const user = userEvent.setup()

      // Grant permission first
      await testDb.from('member_permissions').insert({
        user_id: memberUser.id,
        permission: 'organization:view_audit_logs',
        granted: true,
        granted_by: testUser.id
      })
      
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberPermissions memberId={memberUser.id} />
          </OrganizationProvider>
        </TestWrapper>
      )

      // Revoke permission
      await user.uncheck(screen.getByLabelText(/organization:view_audit_logs/i))
      await user.click(screen.getByRole('button', { name: /save permissions/i }))

      await waitFor(async () => {
        const permissions = await testDb.from('member_permissions')
          .select('*')
          .eq('user_id', memberUser.id)
          .eq('permission', 'organization:view_audit_logs')

        expect(permissions.data[0].granted).toBe(false)
      })
    })
  })

  describe('Data Isolation in Member Management', () => {
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

    it('should only show members from current organization', async () => {
      render(
        <TestWrapper user={testUser} initialOrganization={testOrg}>
          <OrganizationProvider>
            <MemberList />
          </OrganizationProvider>
        </TestWrapper>
      )

      await waitFor(() => {
        // Should see testUser (owner of testOrg)
        expect(screen.getByText(testUser.email)).toBeInTheDocument()
        
        // Should NOT see otherUser (from different org)
        expect(screen.queryByText(otherUser.email)).not.toBeInTheDocument()
      })
    })

    it('should prevent cross-organization member operations', async () => {
      // testUser should not be able to remove members from otherOrg
      const response = await testDb
        .from('organization_members')
        .delete()
        .eq('organization_id', otherOrg.id)
        .eq('user_id', otherUser.id)
        .as(testUser)

      expect(response.error).toBeTruthy()
    })
  })
})