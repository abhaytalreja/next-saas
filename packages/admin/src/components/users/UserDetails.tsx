'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminUser } from '../../types'
import { adminService } from '../../lib/admin-service'
import { UserEditForm } from './UserEditForm'
import { UserActivity } from './UserActivity'
import { UserSessions } from './UserSessions'
import { UserOrganizations } from './UserOrganizations'
import { 
  ArrowLeft, 
  User, 
  Edit3, 
  Ban, 
  CheckCircle, 
  Trash2,
  Shield,
  Calendar,
  Mail,
  MapPin,
  Clock,
  Building
} from 'lucide-react'
import { Button } from '@nextsaas/ui'

interface UserDetailsProps {
  userId: string
}

export function UserDetails({ userId }: UserDetailsProps) {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'sessions' | 'organizations'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const userData = await adminService.getUserById(userId)
      setUser(userData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (action: string, reason?: string) => {
    if (!user) return

    try {
      setActionLoading(action)
      
      switch (action) {
        case 'suspend':
          await adminService.suspendUser(user.id, reason)
          break
        case 'activate':
          await adminService.activateUser(user.id)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await adminService.deleteUser(user.id)
            router.push('/admin/users')
            return
          }
          break
      }
      
      await fetchUser()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (updates: Partial<AdminUser>) => {
    if (!user) return

    try {
      await adminService.updateUser(user.id, updates)
      setIsEditing(false)
      await fetchUser()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading user</div>
          <p className="text-gray-600 mb-4">{error?.message || 'User not found'}</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      invited: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status}
      </span>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'activity', name: 'Activity', icon: Clock },
    { id: 'sessions', name: 'Sessions', icon: Shield },
    { id: 'organizations', name: 'Organizations', icon: Building }
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.name || 'No name'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {user.status === 'active' ? (
            <Button
              variant="outline"
              onClick={() => handleUserAction('suspend')}
              disabled={actionLoading === 'suspend'}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleUserAction('activate')}
              disabled={actionLoading === 'activate'}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => handleUserAction('delete')}
            disabled={actionLoading === 'delete'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* User Overview Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                className="h-20 w-20 rounded-full"
                src={user.avatar_url}
                alt={user.name || user.email}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name || 'No name'}
              </h2>
              {getStatusBadge(user.status)}
              {user.is_system_admin && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  <Shield className="h-3 w-3 mr-1" />
                  System Admin
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Last seen {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString() : 'Never'}
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                {user.organizations.length} organization{user.organizations.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            isEditing ? (
              <UserEditForm
                user={user}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <UserProfileView user={user} />
            )
          )}
          
          {activeTab === 'activity' && (
            <UserActivity userId={user.id} />
          )}
          
          {activeTab === 'sessions' && (
            <UserSessions userId={user.id} />
          )}
          
          {activeTab === 'organizations' && (
            <UserOrganizations user={user} />
          )}
        </div>
      </div>
    </div>
  )
}

function UserProfileView({ user }: { user: AdminUser }) {
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      invited: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">{getStatusBadge(user.status)}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Seen</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">System Admin</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.is_system_admin ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Organizations */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Organizations</h3>
        {user.organizations.length > 0 ? (
          <div className="space-y-3">
            {user.organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{org.name}</div>
                  <div className="text-sm text-gray-500">Role: {org.role}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {org.joined_at && new Date(org.joined_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">User is not a member of any organizations.</p>
        )}
      </div>
    </div>
  )
}