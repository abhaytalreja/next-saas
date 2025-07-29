'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Clock, 
  User, 
  Building, 
  Settings,
  CreditCard,
  Users,
  FileText,
  Shield
} from 'lucide-react'

interface ActivityLogEntry {
  id: string
  action: string
  actor: {
    id: string
    name: string
    email: string
    type: 'user' | 'system' | 'admin'
  }
  target?: {
    type: string
    id: string
    name?: string
  }
  timestamp: string
  details?: any
  ip_address?: string
}

interface OrganizationActivityProps {
  organizationId: string
}

export function OrganizationActivity({ organizationId }: OrganizationActivityProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchActivity()
  }, [organizationId])

  const fetchActivity = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch organization activity
      // const response = await fetch(`/api/admin/organizations/${organizationId}/activity`)
      // const data = await response.json()
      
      // Mock data for now
      const mockActivities: ActivityLogEntry[] = [
        {
          id: '1',
          action: 'member_added',
          actor: {
            id: 'admin1',
            name: 'John Doe',
            email: 'john@example.com',
            type: 'user'
          },
          target: {
            type: 'user',
            id: 'user123',
            name: 'Alice Johnson'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          details: { role: 'member' }
        },
        {
          id: '2',
          action: 'plan_upgraded',
          actor: {
            id: 'admin1',
            name: 'John Doe',
            email: 'john@example.com',
            type: 'user'
          },
          target: {
            type: 'subscription',
            id: 'sub123'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          details: { from_plan: 'starter', to_plan: 'pro' }
        },
        {
          id: '3',
          action: 'settings_updated',
          actor: {
            id: 'admin1',
            name: 'John Doe',
            email: 'john@example.com',
            type: 'user'
          },
          target: {
            type: 'organization',
            id: organizationId
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          details: { fields: ['name', 'timezone'] }
        },
        {
          id: '4',
          action: 'member_role_changed',
          actor: {
            id: 'system',
            name: 'System Admin',
            email: 'system@nextsaas.com',
            type: 'admin'
          },
          target: {
            type: 'user',
            id: 'user456',
            name: 'Bob Wilson'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          details: { from_role: 'member', to_role: 'admin', reason: 'admin_action' }
        },
        {
          id: '5',
          action: 'security_alert',
          actor: {
            id: 'system',
            name: 'Security System',
            email: 'security@nextsaas.com',
            type: 'system'
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          details: { type: 'suspicious_login', ip: '192.168.1.100' },
          ip_address: '192.168.1.100'
        }
      ]
      
      setActivities(mockActivities)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string, actorType: string) => {
    if (actorType === 'admin') {
      return <Shield className="h-4 w-4 text-purple-600" />
    }
    
    switch (action) {
      case 'member_added':
      case 'member_removed':
      case 'member_role_changed':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'plan_upgraded':
      case 'plan_downgraded':
      case 'payment_failed':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'settings_updated':
      case 'organization_updated':
        return <Settings className="h-4 w-4 text-gray-600" />
      case 'security_alert':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'document_created':
      case 'document_deleted':
        return <FileText className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (action: string, actorType: string) => {
    if (actorType === 'admin') {
      return 'bg-purple-100 border-purple-200'
    }
    
    switch (action) {
      case 'member_added':
      case 'plan_upgraded':
        return 'bg-green-100 border-green-200'
      case 'member_removed':
      case 'plan_downgraded':
      case 'payment_failed':
        return 'bg-red-100 border-red-200'
      case 'security_alert':
        return 'bg-red-100 border-red-200'
      case 'member_role_changed':
      case 'settings_updated':
        return 'bg-blue-100 border-blue-200'
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const formatActivityDescription = (activity: ActivityLogEntry) => {
    const { action, actor, target, details } = activity
    
    switch (action) {
      case 'member_added':
        return `${actor.name} added ${target?.name || 'a member'} to the organization`
      case 'member_removed':
        return `${actor.name} removed ${target?.name || 'a member'} from the organization`
      case 'member_role_changed':
        return `${actor.name} changed ${target?.name || 'a member'}'s role from ${details?.from_role} to ${details?.to_role}`
      case 'plan_upgraded':
        return `${actor.name} upgraded plan from ${details?.from_plan} to ${details?.to_plan}`
      case 'plan_downgraded':
        return `${actor.name} downgraded plan from ${details?.from_plan} to ${details?.to_plan}`
      case 'settings_updated':
        return `${actor.name} updated organization settings${details?.fields ? ` (${details.fields.join(', ')})` : ''}`
      case 'security_alert':
        return `Security alert: ${details?.type || 'Unknown security event'}`
      case 'payment_failed':
        return `Payment failed for ${details?.amount || 'subscription'}`
      default:
        return `${actor.name} performed ${action.replace('_', ' ')}`
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (!filter) return true
    return activity.action.includes(filter) || 
           activity.actor.name.toLowerCase().includes(filter.toLowerCase()) ||
           activity.actor.type.includes(filter)
  })

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Organization Activity</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track all actions and changes within the organization.
          </p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Activities</option>
          <option value="member">Member Actions</option>
          <option value="plan">Billing & Plans</option>
          <option value="settings">Settings</option>
          <option value="security">Security</option>
          <option value="admin">Admin Actions</option>
        </select>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter ? 'Try adjusting your filter.' : 'No activity has been recorded for this organization yet.'}
          </p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {filteredActivities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== filteredActivities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white border ${getActivityColor(activity.action, activity.actor.type)}`}>
                        {getActivityIcon(activity.action, activity.actor.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatActivityDescription(activity)}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            {activity.actor.name}
                            {activity.actor.type === 'admin' && (
                              <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                Admin
                              </span>
                            )}
                          </div>
                          {activity.ip_address && (
                            <div className="text-xs text-gray-500">
                              IP: {activity.ip_address}
                            </div>
                          )}
                        </div>
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
      )}
    </div>
  )
}