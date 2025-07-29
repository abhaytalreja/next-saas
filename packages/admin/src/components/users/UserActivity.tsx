'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Clock, User, Building, Mail, Settings } from 'lucide-react'

interface ActivityLogEntry {
  id: string
  action: string
  resource_type: string
  resource_id?: string
  timestamp: string
  ip_address?: string
  user_agent?: string
  details?: any
}

interface UserActivityProps {
  userId: string
}

export function UserActivity({ userId }: UserActivityProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchUserActivity()
  }, [userId])

  const fetchUserActivity = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch user activity
      // const response = await fetch(`/api/admin/users/${userId}/activity`)
      // const data = await response.json()
      
      // Mock data for now
      const mockActivities: ActivityLogEntry[] = [
        {
          id: '1',
          action: 'login',
          resource_type: 'session',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        {
          id: '2',
          action: 'updated_profile',
          resource_type: 'user',
          resource_id: userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          details: { fields_changed: ['name', 'email'] }
        },
        {
          id: '3',
          action: 'joined_organization',
          resource_type: 'organization',
          resource_id: 'org-123',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          details: { organization_name: 'Acme Corp', role: 'member' }
        },
        {
          id: '4',
          action: 'password_changed',
          resource_type: 'user',
          resource_id: userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          id: '5',
          action: 'email_verified',
          resource_type: 'user',
          resource_id: userId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
        }
      ]
      
      setActivities(mockActivities)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (resourceType: string, action: string) => {
    switch (resourceType) {
      case 'session':
        return <User className="h-4 w-4" />
      case 'organization':
        return <Building className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'user':
        return action === 'updated_profile' || action === 'password_changed' ? 
          <Settings className="h-4 w-4" /> : <User className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (resourceType: string, action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return 'text-green-600 bg-green-100'
      case 'updated_profile':
      case 'password_changed':
        return 'text-blue-600 bg-blue-100'
      case 'joined_organization':
      case 'left_organization':
        return 'text-purple-600 bg-purple-100'
      case 'email_verified':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatActivityDescription = (activity: ActivityLogEntry) => {
    const { action, resource_type, details } = activity
    
    switch (action) {
      case 'login':
        return 'Signed in to account'
      case 'logout':
        return 'Signed out of account'
      case 'updated_profile':
        return `Updated profile${details?.fields_changed ? ` (${details.fields_changed.join(', ')})` : ''}`
      case 'password_changed':
        return 'Changed account password'
      case 'email_verified':
        return 'Verified email address'
      case 'joined_organization':
        return `Joined organization${details?.organization_name ? ` "${details.organization_name}"` : ''}`
      case 'left_organization':
        return `Left organization${details?.organization_name ? ` "${details.organization_name}"` : ''}`
      default:
        return `${action.replace('_', ' ')} ${resource_type}`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-start space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <div className="text-red-600 mb-2">Error loading activity</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
        <p className="mt-1 text-sm text-gray-500">
          This user hasn't performed any tracked activities yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-600 mb-6">
          Track user actions and behavior across the platform.
        </p>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.resource_type, activity.action)}`}>
                      {getActivityIcon(activity.resource_type, activity.action)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900">
                        {formatActivityDescription(activity)}
                      </p>
                      {activity.ip_address && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {activity.ip_address}
                        </p>
                      )}
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <time dateTime={activity.timestamp}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}