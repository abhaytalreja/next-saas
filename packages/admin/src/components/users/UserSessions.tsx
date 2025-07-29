'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@nextsaas/ui'
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Globe, 
  MapPin, 
  Clock,
  AlertTriangle,
  X
} from 'lucide-react'

interface UserSession {
  id: string
  ip_address: string
  user_agent: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  location?: {
    city: string
    country: string
    region: string
  }
  created_at: string
  last_active: string
  is_current: boolean
}

interface UserSessionsProps {
  userId: string
}

export function UserSessions({ userId }: UserSessionsProps) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSessions()
  }, [userId])

  const fetchUserSessions = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch user sessions
      // const response = await fetch(`/api/admin/users/${userId}/sessions`)
      // const data = await response.json()
      
      // Mock data for now
      const mockSessions: UserSession[] = [
        {
          id: 'session-1',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          device_type: 'desktop',
          browser: 'Chrome 119',
          os: 'macOS',
          location: {
            city: 'San Francisco',
            country: 'United States',
            region: 'California'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          last_active: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          is_current: true
        },
        {
          id: 'session-2',
          ip_address: '10.0.0.50',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          device_type: 'mobile',
          browser: 'Safari Mobile',
          os: 'iOS 17',
          location: {
            city: 'New York',
            country: 'United States',
            region: 'New York'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          last_active: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          is_current: false
        },
        {
          id: 'session-3',
          ip_address: '203.0.113.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          device_type: 'desktop',
          browser: 'Chrome 118',
          os: 'Windows 10',
          location: {
            city: 'London',
            country: 'United Kingdom',
            region: 'England'
          },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          last_active: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          is_current: false
        }
      ]
      
      setSessions(mockSessions)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      setTerminatingSession(sessionId)
      // TODO: Implement actual API call to terminate session
      // await fetch(`/api/admin/users/${userId}/sessions/${sessionId}`, { method: 'DELETE' })
      
      // Remove session from list
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error('Error terminating session:', error)
    } finally {
      setTerminatingSession(null)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'tablet':
        return <Monitor className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  const getSessionStatus = (session: UserSession) => {
    const lastActive = new Date(session.last_active)
    const now = new Date()
    const minutesAgo = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))

    if (session.is_current) {
      return { status: 'Current Session', color: 'text-green-600 bg-green-100' }
    } else if (minutesAgo < 30) {
      return { status: 'Active', color: 'text-green-600 bg-green-100' }
    } else if (minutesAgo < 1440) { // 24 hours
      return { status: 'Recent', color: 'text-yellow-600 bg-yellow-100' }
    } else {
      return { status: 'Inactive', color: 'text-gray-600 bg-gray-100' }
    }
  }

  const isSuspiciousSession = (session: UserSession) => {
    // Simple heuristic: different country from the current session
    const currentSession = sessions.find(s => s.is_current)
    if (!currentSession || !session.location || !currentSession.location) {
      return false
    }
    return session.location.country !== currentSession.location.country
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading sessions</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
        <p className="mt-1 text-sm text-gray-500">
          This user doesn't have any active sessions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Active Sessions</h3>
        <p className="text-sm text-gray-600">
          Monitor and manage user sessions across different devices and locations.
        </p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => {
          const sessionStatus = getSessionStatus(session)
          const suspicious = isSuspiciousSession(session)
          
          return (
            <div
              key={session.id}
              className={`border rounded-lg p-4 ${
                session.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              } ${suspicious ? 'ring-2 ring-yellow-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {session.browser} on {session.os}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sessionStatus.color}`}>
                        {sessionStatus.status}
                      </span>
                      {suspicious && (
                        <div className="flex items-center text-yellow-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="text-xs">Suspicious</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        {session.ip_address}
                      </div>
                      
                      {session.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {session.location.city}, {session.location.country}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Last active {new Date(session.last_active).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Session started: {new Date(session.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  {!session.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminatingSession === session.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {terminatingSession === session.id ? 'Terminating...' : 'Terminate'}
                    </Button>
                  )}
                </div>
              </div>
              
              {suspicious && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Potentially suspicious activity</p>
                      <p>This session is from a different country than the user's current session. Consider verifying the user's identity.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Session Security</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Sessions automatically expire after 30 days of inactivity</li>
          <li>• Suspicious sessions are flagged based on location and device patterns</li>
          <li>• Users can manage their own sessions from their account settings</li>
        </ul>
      </div>
    </div>
  )
}