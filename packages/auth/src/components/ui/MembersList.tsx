'use client'

import React, { useState } from 'react'
import { UserAvatar } from './UserAvatar'
import { Button } from '@nextsaas/ui'
import { 
  EllipsisVerticalIcon,
  UserPlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export interface Member {
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

interface MembersListProps {
  members: Member[]
  currentUserId?: string
  canManageMembers?: boolean
  onRemoveMember?: (memberId: string) => void
  onChangeRole?: (memberId: string, role: 'admin' | 'member') => void
  onResendInvite?: (memberId: string) => void
  onInviteClick?: () => void
  loading?: boolean
  className?: string
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-gray-100 text-gray-800',
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  invited: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800',
}

export function MembersList({
  members,
  currentUserId,
  canManageMembers = false,
  onRemoveMember,
  onChangeRole,
  onResendInvite,
  onInviteClick,
  loading = false,
  className = '',
}: MembersListProps) {
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return
    
    if (confirm('Are you sure you want to remove this member? This action cannot be undone.')) {
      setRemovingMemberId(memberId)
      try {
        await onRemoveMember(memberId)
      } finally {
        setRemovingMemberId(null)
      }
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center py-4 border-b border-gray-200 last:border-0">
            <div className="h-10 w-10 bg-gray-300 rounded-full" />
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UserIcon className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by inviting team members.</p>
        {onInviteClick && (
          <div className="mt-6">
            <Button onClick={onInviteClick} size="sm">
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-gray-200">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId
          const canModify = canManageMembers && !isCurrentUser && member.role !== 'owner'
          
          return (
            <li key={member.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <UserAvatar
                    src={member.avatarUrl}
                    firstName={member.firstName}
                    lastName={member.lastName}
                    email={member.email}
                    size="md"
                  />
                  <div className="ml-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    {member.joinedAt && (
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      roleColors[member.role]
                    }`}
                  >
                    {member.role === 'owner' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>

                  {/* Status Badge */}
                  {member.status !== 'active' && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[member.status]
                      }`}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  )}

                  {/* Actions Menu */}
                  {canModify && (
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                      </Menu.Button>
                      
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            {member.status === 'invited' && onResendInvite && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onResendInvite(member.id)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                  >
                                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                                    Resend Invite
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            
                            {member.role === 'member' && onChangeRole && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onChangeRole(member.id, 'admin')}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                  >
                                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            
                            {member.role === 'admin' && onChangeRole && (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => onChangeRole(member.id, 'member')}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                  >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Make Member
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                            
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={removingMemberId === member.id}
                                  className={`${
                                    active ? 'bg-red-50' : ''
                                  } flex w-full items-center px-4 py-2 text-sm text-red-700 disabled:opacity-50`}
                                >
                                  <TrashIcon className="h-4 w-4 mr-2" />
                                  {removingMemberId === member.id ? 'Removing...' : 'Remove Member'}
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}