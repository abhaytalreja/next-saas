'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization, useOrganizationPermissions } from '../../hooks/useOrganization'
import { useSupabase } from '../../hooks/useSupabase'
import { 
  Users, 
  Mail, 
  MoreVertical, 
  Shield, 
  UserX, 
  UserCheck,
  Clock,
  Search,
  Filter
} from 'lucide-react'
import type { MembershipWithUser, MembershipRole } from '../../types'

interface MemberListProps {
  className?: string
  onInviteClick?: () => void
}

export function MemberList({ className = '', onInviteClick }: MemberListProps) {
  const { supabase } = useSupabase()
  const { currentOrganization } = useOrganization()
  const permissions = useOrganizationPermissions()
  const [members, setMembers] = useState<MembershipWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<MembershipRole | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers()
    }
  }, [currentOrganization])

  const fetchMembers = async () => {
    if (!currentOrganization) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('joined_at', { ascending: false })

      if (error) throw error

      setMembers(data as MembershipWithUser[])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: MembershipRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      case 'guest':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'suspended':
        return <UserX className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Organization Members</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage who has access to {currentOrganization?.name}
            </p>
          </div>
          {permissions.canInviteMembers() && onInviteClick && (
            <button
              onClick={onInviteClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite Members
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as MembershipRole | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
              <option value="guest">Guest</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Member list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMembers.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by inviting team members'}
              </p>
            </li>
          ) : (
            filteredMembers.map((member) => (
              <li key={member.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    {member.user.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={member.user.avatar_url}
                        alt={member.user.name || member.user.email}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {(member.user.name || member.user.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.user.name || member.user.email}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                        <span className="ml-2">
                          {getStatusIcon(member.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {permissions.canManageMembers() && member.role !== 'owner' && (
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {selectedMember === member.id && (
                        <div className="absolute right-6 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                              Change Role
                            </button>
                            <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                              Edit Permissions
                            </button>
                            {member.status === 'active' ? (
                              <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                Suspend Member
                              </button>
                            ) : (
                              <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                Reactivate Member
                              </button>
                            )}
                            <button className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left">
                              Remove Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        {filteredMembers.length} of {members.length} members
      </div>
    </div>
  )
}