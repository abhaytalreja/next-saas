'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminUser } from '../../types'
import { Button } from '@nextsaas/ui'
import { 
  Building, 
  Crown, 
  Shield, 
  User, 
  Calendar,
  ExternalLink,
  UserMinus,
  UserPlus
} from 'lucide-react'

interface UserOrganizationsProps {
  user: AdminUser
}

export function UserOrganizations({ user }: UserOrganizationsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleRemoveFromOrganization = async (organizationId: string) => {
    try {
      setLoading(`remove-${organizationId}`)
      // TODO: Implement actual API call to remove user from organization
      // await adminService.removeUserFromOrganization(user.id, organizationId)
      console.log(`Removing user ${user.id} from organization ${organizationId}`)
    } catch (error) {
      console.error('Error removing user from organization:', error)
    } finally {
      setLoading(null)
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

  if (user.organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
        <p className="mt-1 text-sm text-gray-500">
          This user is not a member of any organizations.
        </p>
        <div className="mt-6">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add to Organization
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Organizations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Organizations that {user.name || user.email} belongs to.
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add to Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {user.organizations.map((org) => (
          <div
            key={org.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {org.name}
                    </h4>
                    {getRoleBadge(org.role)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {org.joined_at ? new Date(org.joined_at).toLocaleDateString() : 'Unknown'}
                    </div>
                    
                    {org.status && (
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {org.status}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {org.role === 'owner' && (
                    <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                      Organization owner - cannot be removed
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Link href={`/admin/organizations/${org.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                
                {org.role !== 'owner' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFromOrganization(org.id)}
                    disabled={loading === `remove-${org.id}`}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Organization Stats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {org.member_count || 0}
                  </div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {org.plan || 'Free'}
                  </div>
                  <div className="text-xs text-gray-500">Plan</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {org.created_at ? Math.floor((Date.now() - new Date(org.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}d
                  </div>
                  <div className="text-xs text-gray-500">Age</div>
                </div>
              </div>
            </div>
            
            {/* Permissions & Access */}
            {org.permissions && org.permissions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-medium text-gray-900 mb-2">Permissions</h5>
                <div className="flex flex-wrap gap-1">
                  {org.permissions.slice(0, 5).map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {permission}
                    </span>
                  ))}
                  {org.permissions.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                      +{org.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {user.organizations.length}
          </div>
          <div className="text-sm text-gray-600">Total Organizations</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {user.organizations.filter(org => org.role === 'owner').length}
          </div>
          <div className="text-sm text-gray-600">Owned</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {user.organizations.filter(org => ['admin', 'owner'].includes(org.role)).length}
          </div>
          <div className="text-sm text-gray-600">Admin Access</div>
        </div>
      </div>
    </div>
  )
}