'use client'

import React, { useState } from 'react'
import {
  useAuth,
  useOrganization,
  MembersList,
  InvitationForm,
} from '@nextsaas/auth'
import { Button, Alert } from '@nextsaas/ui'
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function OrganizationMembersPage() {
  const { user } = useAuth()
  const {
    currentOrganization,
    members,
    inviteMember,
    removeMember,
    updateMemberRole,
  } = useOrganization()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock members data - in production, this would come from the organization context
  const mockMembers = [
    {
      id: user?.id || '1',
      email: user?.email || 'current@example.com',
      firstName: user?.user_metadata?.first_name || 'Current',
      lastName: user?.user_metadata?.last_name || 'User',
      avatarUrl: user?.user_metadata?.avatar_url,
      role: 'owner' as const,
      status: 'active' as const,
      joinedAt: '2024-01-01',
    },
    {
      id: '2',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
      status: 'active' as const,
      joinedAt: '2024-01-15',
    },
    {
      id: '3',
      email: 'member@example.com',
      firstName: 'Team',
      lastName: 'Member',
      role: 'member' as const,
      status: 'active' as const,
      joinedAt: '2024-02-01',
    },
    {
      id: '4',
      email: 'invited@example.com',
      role: 'member' as const,
      status: 'invited' as const,
    },
  ]

  const handleInviteMembers = async (data: {
    emails: Array<{ email: string; role: 'admin' | 'member' }>
    message?: string
  }) => {
    try {
      // In production, this would call the actual invite API
      for (const invite of data.emails) {
        await inviteMember(invite.email, invite.role)
      }

      setShowInviteModal(false)
      setInviteSuccess(true)
      setTimeout(() => setInviteSuccess(false), 5000)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send invitations')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId)
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleChangeRole = async (
    memberId: string,
    role: 'admin' | 'member'
  ) => {
    try {
      await updateMemberRole(memberId, role)
    } catch (err: any) {
      setError(err.message || 'Failed to update member role')
    }
  }

  const handleResendInvite = async (memberId: string) => {
    try {
      // In production, this would resend the invitation
      console.log('Resending invite to member:', memberId)
    } catch (err: any) {
      setError(err.message || 'Failed to resend invitation')
    }
  }

  const currentUserRole =
    mockMembers.find(m => m.id === user?.id)?.role || 'member'
  const canManageMembers =
    currentUserRole === 'owner' || currentUserRole === 'admin'

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Team Members
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage who has access to{' '}
              {currentOrganization?.name || 'your organization'}.
            </p>
          </div>
          {canManageMembers && (
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {inviteSuccess && (
        <Alert type="success" onClose={() => setInviteSuccess(false)}>
          Invitations sent successfully! New members will receive an email to
          join your organization.
        </Alert>
      )}

      {/* Members List */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Members ({mockMembers.length})
            </h3>
            <span className="text-sm text-gray-500">
              {mockMembers.filter(m => m.status === 'invited').length} pending
              invitations
            </span>
          </div>

          <MembersList
            members={mockMembers}
            currentUserId={user?.id}
            canManageMembers={canManageMembers}
            onRemoveMember={handleRemoveMember}
            onChangeRole={handleChangeRole}
            onResendInvite={handleResendInvite}
            onInviteClick={() => setShowInviteModal(true)}
          />
        </div>
      </div>

      {/* Invite Modal */}
      <Transition appear show={showInviteModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowInviteModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="flex items-center justify-between mb-6"
                  >
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Invite Team Members
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <InvitationForm
                    onSubmit={handleInviteMembers}
                    onCancel={() => setShowInviteModal(false)}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
