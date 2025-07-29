'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@nextsaas/ui'
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Mail,
  Calendar,
  MoreHorizontal,
  UserMinus,
  UserCheck,
  Search
} from 'lucide-react'

interface OrganizationMember {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'inactive' | 'invited'
  joined_at: string
  last_seen_at?: string
}

interface OrganizationMembersProps {
  organizationId: string
}

export function OrganizationMembers({ organizationId }: OrganizationMembersProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [organizationId])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch organization members
      // const response = await fetch(`/api/admin/organizations/${organizationId}/members`)
      // const data = await response.json()
      
      // Mock data for now
      const mockMembers: OrganizationMember[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar_url: null,
          role: 'owner',
          status: 'active',
          joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          last_seen_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar_url: null,
          role: 'admin',
          status: 'active',
          joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
          last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          avatar_url: null,
          role: 'member',
          status: 'active',
          joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: '4',
          name: 'Alice Wilson',
          email: 'alice@example.com',
          avatar_url: null,
          role: 'member',
          status: 'invited',
          joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        }
      ]
      
      setMembers(mockMembers)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberAction = async (action: string, memberId: string) => {
    try {
      setActionLoading(`${action}-${memberId}`)
      // TODO: Implement actual API calls
      console.log(`${action} member ${memberId} in organization ${organizationId}`)
      
      // Simulate action completion
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (action === 'remove') {
        setMembers(prev => prev.filter(m => m.id !== memberId))
      }
    } catch (error) {
      console.error(`Error ${action} member:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'member':
        return <User className="h-4 w-4 text-gray-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles] || styles.member}`}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      invited: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status}
      </span>
    )
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !selectedRole || member.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading members</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Organization Members</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage organization membership and roles.
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {member.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={member.avatar_url}
                      alt={member.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {member.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                    {member.last_seen_at && (
                      <div className="flex items-center">
                        Last seen {new Date(member.last_seen_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {member.role !== 'owner' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMemberAction('change-role', member.id)}
                      disabled={actionLoading?.includes(member.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMemberAction('remove', member.id)}
                      disabled={actionLoading === `remove-${member.id}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedRole ? 'Try adjusting your search criteria.' : 'This organization has no members.'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {members.filter(m => m.role === 'owner').length}
          </div>
          <div className="text-sm text-gray-600">Owners</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {members.filter(m => m.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {members.filter(m => m.status === 'invited').length}
          </div>
          <div className="text-sm text-gray-600">Pending Invites</div>
        </div>
      </div>
    </div>
  )
}