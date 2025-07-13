'use client'

import React, { useState, useEffect } from 'react'
import {
  MembersList,
  InvitationForm,
  useOrganization,
  useAuth,
  getSupabaseBrowserClient,
} from '@nextsaas/auth'
import { UserPlusIcon } from '@heroicons/react/24/outline'
import DeleteConfirmationModal from '../../../components/ui/DeleteConfirmationModal'

interface Member {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string | null
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'invited' | 'suspended'
  joinedAt?: string
  lastActiveAt?: string
}

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const {
    currentOrganization,
    removeMember,
    updateMemberRole,
    canInviteMembers,
    inviteMember,
    currentMembership,
  } = useOrganization()
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  const fetchMembers = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)

      // Fetch actual members
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select(
          `
          *,
          user:users!memberships_user_id_fkey(*)
        `
        )
        .eq('organization_id', currentOrganization.id)

      if (membershipsError) throw membershipsError

      // Fetch pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')

      if (invitationsError) throw invitationsError

      // Format actual members
      const actualMembers: Member[] = (memberships || []).map(
        (membership: any) => ({
          id: membership.user.id,
          email: membership.user.email,
          firstName: membership.user.firstName || membership.user.first_name,
          lastName: membership.user.lastName || membership.user.last_name,
          avatarUrl: membership.user.avatarUrl || membership.user.avatar_url,
          role: membership.role,
          status: 'active',
          joinedAt: membership.created_at,
          lastActiveAt:
            membership.user.lastSignInAt || membership.user.last_seen_at,
        })
      )

      // Format pending invitations as members with invited status
      const pendingMembers: Member[] = (invitations || []).map(
        (invitation: any) => ({
          id: invitation.id, // Use invitation ID since user doesn't exist yet
          email: invitation.email,
          firstName: undefined,
          lastName: undefined,
          avatarUrl: null,
          role: invitation.role,
          status: 'invited',
          joinedAt: invitation.created_at,
          lastActiveAt: undefined,
        })
      )

      // Combine both lists
      setMembers([...actualMembers, ...pendingMembers])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [currentOrganization])

  const handleRemoveMember = (memberId: string) => {
    // Find the member and show confirmation modal
    const member = members.find(m => m.id === memberId)
    if (!member) {
      console.error('Member not found')
      return
    }

    setMemberToDelete(member)
    setShowDeleteModal(true)
  }

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return

    try {
      setIsDeleting(true)

      if (memberToDelete.status === 'invited') {
        // It's a pending invitation - delete from organization_invitations table
        const { error } = await supabase
          .from('organization_invitations')
          .delete()
          .eq('id', memberToDelete.id)

        if (error) throw error
      } else {
        // It's an actual member - use the organization context function
        await removeMember(memberToDelete.id)
      }

      await fetchMembers() // Refresh the list
      setShowDeleteModal(false)
      setMemberToDelete(null)
    } catch (error) {
      console.error('Error removing member:', error)
      // Keep the modal open and show error in console instead of alert
      // TODO: Replace with proper error state or toast notification
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteMember = () => {
    setShowDeleteModal(false)
    setMemberToDelete(null)
  }

  const handleChangeRole = async (
    memberId: string,
    role: 'admin' | 'member'
  ) => {
    try {
      // Find the member to determine if it's an actual member or pending invitation
      const member = members.find(m => m.id === memberId)
      if (!member) {
        throw new Error('Member not found')
      }

      if (member.status === 'invited') {
        // It's a pending invitation - update organization_invitations table
        const { error } = await supabase
          .from('organization_invitations')
          .update({ role })
          .eq('id', memberId)

        if (error) throw error
      } else {
        // It's an actual member - use the organization context function
        await updateMemberRole(memberId, role)
      }

      await fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Failed to change member role')
    }
  }

  const handleInviteSubmit = async (data: {
    emails: { email: string; role: 'admin' | 'member' }[]
    message?: string
  }) => {
    try {
      if (!currentOrganization || !user) {
        throw new Error('No organization or user available')
      }

      // Check permissions first
      if (!canInviteMembers()) {
        throw new Error('You do not have permission to invite members')
      }

      // Use Supabase client directly for bulk invitation creation
      const results = []
      const errors = []

      for (const invite of data.emails) {
        try {
          // Check if user exists by email (try profiles first, fallback gracefully)
          let userProfile = null
          try {
            const { data } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', invite.email)
              .single()
            userProfile = data
          } catch (profileError) {
            // Profiles table might not exist, that's ok for invitations
            console.log(
              'Profiles table not available, continuing with invitation'
            )
          }

          // Check if user is already a member (only if both tables exist)
          if (userProfile) {
            try {
              const { data: existingMember } = await supabase
                .from('memberships')
                .select('id')
                .eq('organization_id', currentOrganization.id)
                .eq('user_id', userProfile.id)
                .single()

              if (existingMember) {
                errors.push({
                  email: invite.email,
                  error: 'Already a member of this organization',
                })
                continue
              }
            } catch (membershipError) {
              // Memberships table might not exist, continue anyway
              console.log(
                'Memberships table check failed, continuing with invitation'
              )
            }
          }

          // Check if there's already a pending invitation
          const { data: existingInvite } = await supabase
            .from('organization_invitations')
            .select('id')
            .eq('organization_id', currentOrganization.id)
            .eq('email', invite.email)
            .eq('status', 'pending')
            .single()

          if (existingInvite) {
            errors.push({
              email: invite.email,
              error: 'An invitation has already been sent to this email',
            })
            continue
          }

          // Generate invitation token
          const token = crypto.randomUUID()
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

          // Create invitation record
          const { data: invitation, error: inviteError } = await supabase
            .from('organization_invitations')
            .insert({
              organization_id: currentOrganization.id,
              email: invite.email,
              role: invite.role,
              token,
              invited_by: user.id,
              expires_at: expiresAt.toISOString(),
              status: 'pending',
              message: data.message || null,
            })
            .select()
            .single()

          if (inviteError) {
            console.error('Failed to create invitation:', inviteError)
            errors.push({
              email: invite.email,
              error: 'Failed to create invitation',
            })
            continue
          }

          results.push({
            email: invite.email,
            success: true,
            invitationId: invitation.id,
          })

          // Log the event
          await supabase.from('organization_events').insert({
            organization_id: currentOrganization.id,
            user_id: user.id,
            event_type: 'invitation_sent',
            metadata: {
              invitation_id: invitation.id,
              email: invite.email,
              role: invite.role,
            },
            created_at: new Date().toISOString(),
          })
        } catch (err) {
          console.error('Error processing invitation for', invite.email, err)
          errors.push({
            email: invite.email,
            error: 'An unexpected error occurred',
          })
        }
      }

      // Show success message with summary
      const sent = results.length
      const failed = errors.length
      const total = data.emails.length

      console.log(
        `Invitations sent: ${sent}/${total}${failed > 0 ? ` (${failed} failed)` : ''}`
      )

      if (errors.length > 0) {
        console.warn('Some invitations failed:', errors)
      }

      setShowInviteModal(false)
      await fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error sending invitations:', error)
      throw error // Let the form handle the error display
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your team members and permissions
          </p>
        </div>
        {canInviteMembers() && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlusIcon className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <MembersList
            members={members}
            currentUserId={user?.id}
            canManageMembers={canInviteMembers()}
            onRemoveMember={handleRemoveMember}
            onChangeRole={handleChangeRole}
            onInviteClick={() => setShowInviteModal(true)}
            loading={loading}
          />
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Invite Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <InvitationForm
              onSubmit={handleInviteSubmit}
              onCancel={() => setShowInviteModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteMember}
        onConfirm={confirmDeleteMember}
        isLoading={isDeleting}
        title={
          memberToDelete?.status === 'invited'
            ? 'Cancel Invitation'
            : 'Remove Member'
        }
        message={
          memberToDelete?.status === 'invited'
            ? `Are you sure you want to cancel the invitation for ${memberToDelete?.email}? They will no longer be able to join the organization with this invitation.`
            : `Are you sure you want to remove ${memberToDelete?.email} from the organization? They will lose access to all organization resources immediately.`
        }
        confirmText={
          memberToDelete?.status === 'invited'
            ? 'Cancel Invitation'
            : 'Remove Member'
        }
        cancelText="Keep"
      />
    </div>
  )
}
