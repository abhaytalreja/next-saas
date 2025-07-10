'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ComputerDesktopIcon, 
  DevicePhoneMobileIcon, 
  DeviceTabletIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserIcon,
  KeyIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks'
import type { UserActivity, UserSession, UserDeviceSummary } from '../../types/user'

interface ActivityDashboardProps {
  className?: string
}

type TabType = 'recent' | 'sessions' | 'security' | 'devices'

interface ActivityFilters {
  action?: string
  status?: 'success' | 'failure' | 'pending'
  dateFrom?: string
  dateTo?: string
}

export function ActivityDashboard({ className = '' }: ActivityDashboardProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('recent')
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [devices, setDevices] = useState<UserDeviceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ActivityFilters>({})
  
  const supabase = createClientComponentClient()

  // Load data based on active tab
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab, filters])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      switch (activeTab) {
        case 'recent':
          await loadRecentActivity()
          break
        case 'sessions':
          await loadUserSessions()
          break
        case 'security':
          await loadSecurityEvents()
          break
        case 'devices':
          await loadUserDevices()
          break
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    if (!user) return

    let query = supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Apply filters
    if (filters.action) {
      query = query.eq('action', filters.action)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) throw error
    setActivities(data as UserActivity[])
  }

  const loadUserSessions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('last_activity_at', { ascending: false })

    if (error) throw error
    setSessions(data as UserSession[])
  }

  const loadSecurityEvents = async () => {
    if (!user) return

    const securityActions = [
      'login', 'logout', 'password_change', 'email_change', 
      'two_factor_enable', 'two_factor_disable', 'session_revoked'
    ]

    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', user.id)
      .in('action', securityActions)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    setActivities(data as UserActivity[])
  }

  const loadUserDevices = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_devices_summary')
      .select('*')
      .eq('user_id', user.id)
      .order('last_seen', { ascending: false })

    if (error) throw error
    setDevices(data as UserDeviceSummary[])
  }

  const revokeSession = async (sessionId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ 
          revoked_at: new Date().toISOString(),
          revoked_reason: 'user_action'
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (error) throw error

      // Reload sessions
      await loadUserSessions()
    } catch (err) {
      console.error('Failed to revoke session:', err)
      setError('Failed to revoke session')
    }
  }

  const getActivityIcon = (action: string, status: string) => {
    const iconClass = "h-5 w-5"
    
    if (status === 'failure') {
      return <XCircleIcon className={`${iconClass} text-red-500`} />
    }
    if (status === 'pending') {
      return <ClockIcon className={`${iconClass} text-yellow-500`} />
    }

    switch (action) {
      case 'login':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />
      case 'logout':
        return <XCircleIcon className={`${iconClass} text-gray-500`} />
      case 'password_change':
      case 'two_factor_enable':
      case 'two_factor_disable':
        return <ShieldCheckIcon className={`${iconClass} text-blue-500`} />
      case 'profile_update':
        return <UserIcon className={`${iconClass} text-purple-500`} />
      case 'email_change':
        return <KeyIcon className={`${iconClass} text-orange-500`} />
      default:
        return <EyeIcon className={`${iconClass} text-gray-500`} />
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    const iconClass = "h-5 w-5 text-gray-400"
    
    switch (deviceType) {
      case 'desktop':
        return <ComputerDesktopIcon className={iconClass} />
      case 'mobile':
        return <DevicePhoneMobileIcon className={iconClass} />
      case 'tablet':
        return <DeviceTabletIcon className={iconClass} />
      default:
        return <ComputerDesktopIcon className={iconClass} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      return `${diffDays} days ago`
    }
  }

  const tabs = [
    { id: 'recent', name: 'Recent Activity', count: activities.length },
    { id: 'sessions', name: 'Active Sessions', count: sessions.length },
    { id: 'security', name: 'Security Events', count: 0 },
    { id: 'devices', name: 'Devices', count: devices.length },
  ]

  return (
    <div className={className}>
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Recent Activity Tab */}
            {activeTab === 'recent' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                      </label>
                      <select
                        value={filters.action || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      >
                        <option value="">All actions</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="profile_update">Profile Update</option>
                        <option value="password_change">Password Change</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      >
                        <option value="">All statuses</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Activity List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <li key={activity.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getActivityIcon(activity.action, activity.status)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description || activity.action}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>{formatDate(activity.created_at)}</span>
                                {activity.ip_address && (
                                  <span className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {activity.ip_address}
                                  </span>
                                )}
                                {activity.device_type && (
                                  <span className="capitalize">{activity.device_type}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'success' 
                                ? 'bg-green-100 text-green-800'
                                : activity.status === 'failure'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No activity found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <li key={session.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getDeviceIcon(session.device_type)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {session.device_name || `${session.browser} on ${session.os}`}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>Last active: {formatRelativeTime(session.last_activity_at)}</span>
                                {session.location_city && (
                                  <span className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {session.location_city}, {session.location_country}
                                  </span>
                                )}
                                {session.is_current && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Current
                                  </span>
                                )}
                                {session.is_trusted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Trusted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!session.is_current && (
                            <button
                              onClick={() => revokeSession(session.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {sessions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No active sessions</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Events Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <li key={activity.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getActivityIcon(activity.action, activity.status)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description || activity.action}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>{formatDate(activity.created_at)}</span>
                                {activity.ip_address && (
                                  <span className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {activity.ip_address}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.status === 'success' 
                                ? 'bg-green-100 text-green-800'
                                : activity.status === 'failure'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No security events found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {devices.map((device, index) => (
                      <li key={index} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getDeviceIcon(device.device_type)}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {device.device_name || `${device.browser} on ${device.os}`}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 space-x-4">
                                <span>Last seen: {formatRelativeTime(device.last_seen)}</span>
                                <span>{device.session_count} sessions</span>
                                {device.location_city && (
                                  <span className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {device.location_city}
                                  </span>
                                )}
                                {device.is_trusted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Trusted
                                  </span>
                                )}
                                {device.has_current_session && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {devices.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No devices found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}