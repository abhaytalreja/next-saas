'use client'

import React, { useState, useEffect } from 'react'
import { MembersList, InvitationForm, useOrganization, useAuth, getSupabaseBrowserClient } from '@nextsaas/auth'
import { UserPlusIcon } from '@heroicons/react/24/outline'

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
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const { currentOrganization, removeMember, updateMemberRole, canInviteMembers, inviteMember, currentMembership } = useOrganization()
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  const fetchMembers = async () => {
    if (!currentOrganization) return

    try {
      setLoading(true)
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select(`
          *,
          user:users(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .is('deleted_at', null)

      if (error) throw error

      const formattedMembers: Member[] = (memberships || []).map((membership: any) => ({
        id: membership.user.id,
        email: membership.user.email,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        avatarUrl: membership.user.avatarUrl,
        role: membership.role,
        status: 'active', // Default to active since we don't have status column
        joinedAt: membership.created_at,
        lastActiveAt: membership.user.lastSignInAt,
      }))

      setMembers(formattedMembers)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [currentOrganization])

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId)
      await fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const handleChangeRole = async (memberId: string, role: 'admin' | 'member') => {
    try {
      await updateMemberRole(memberId, role)
      await fetchMembers() // Refresh the list
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Failed to change member role')
    }
  }

  const handleInviteSubmit = async (data: { emails: { email: string; role: 'admin' | 'member' }[]; message?: string }) => {
    try {
      // Debug: Check current membership and permissions
      console.log('Current organization:', currentOrganization)
      console.log('Current membership:', currentMembership)
      console.log('Can invite members:', canInviteMembers())
      console.log('User:', user)
      
      // Send invitations for each email
      for (const emailData of data.emails) {
        await inviteMember({
          email: emailData.email,
          role: emailData.role,
          message: data.message
        })
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your team members and permissions</p>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    </div>
  )
}