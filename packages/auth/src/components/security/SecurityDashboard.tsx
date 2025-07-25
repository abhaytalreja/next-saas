'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { AlertTriangle, Shield, Clock, Monitor, Smartphone, Globe, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SecurityEvent {
  id: string
  action: string
  resource: string
  status: 'success' | 'failed' | 'blocked' | 'pending'
  severity: 'low' | 'medium' | 'high' | 'critical'
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  createdAt: string
  actionDisplay: string
  resourceDisplay: string
  statusIcon: string
  severityColor: string
  isSecurityEvent: boolean
}

interface Session {
  id: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    isMobile: boolean
  }
  location?: {
    ip: string
    country?: string
    city?: string
  }
  isActive: boolean
  isCurrent: boolean
  lastActivity: string
  createdAt: string
}

interface SecurityStats {
  totalSessions: number
  activeSessions: number
  recentSecurityEvents: number
  failedLogins: number
}

export function SecurityDashboard() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [auditLogs, setAuditLogs] = useState<SecurityEvent[]>([])
  const [stats, setStats] = useState<SecurityStats>({
    totalSessions: 0,
    activeSessions: 0,
    recentSecurityEvents: 0,
    failedLogins: 0
  })
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)

      // Load sessions
      const sessionsResponse = await fetch('/api/profile/sessions')
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.data.sessions || [])
      }

      // Load security events
      const securityResponse = await fetch('/api/profile/audit-logs?include_security_only=true&limit=10')
      if (securityResponse.ok) {
        const securityData = await securityResponse.json()
        setSecurityEvents(securityData.data.activities || [])
      }

      // Load recent audit logs
      const auditResponse = await fetch('/api/profile/audit-logs?limit=20')
      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        setAuditLogs(auditData.data.activities || [])
      }

      // Calculate stats
      calculateStats()

    } catch (error) {
      console.error('Error loading security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const activeSessions = sessions.filter(s => s.isActive).length
    const recentEvents = securityEvents.filter(e => 
      new Date(e.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
    const failedLogins = securityEvents.filter(e => 
      e.action.includes('login') && e.status === 'failed'
    ).length

    setStats({
      totalSessions: sessions.length,
      activeSessions,
      recentSecurityEvents: recentEvents,
      failedLogins
    })
  }

  const revokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId)

      const response = await fetch('/api/profile/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          reason: 'user_revoked'
        })
      })

      if (response.ok) {
        toast.success('Session revoked successfully')
        loadSecurityData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to revoke session')
      }
    } catch (error) {
      console.error('Error revoking session:', error)
      toast.error('Failed to revoke session')
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      setRevoking('all')

      const response = await fetch('/api/profile/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          revoke_all: true,
          reason: 'user_revoked_all'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        loadSecurityData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to revoke sessions')
      }
    } catch (error) {
      console.error('Error revoking sessions:', error)
      toast.error('Failed to revoke sessions')
    } finally {
      setRevoking(null)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  const getDeviceIcon = (deviceInfo: Session['deviceInfo']) => {
    if (deviceInfo.isMobile) return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events (24h)</p>
                <p className="text-2xl font-bold">{stats.recentSecurityEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold">{stats.failedLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Active Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active login sessions across devices
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={revokeAllOtherSessions}
                  disabled={revoking === 'all'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke All Others
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.deviceInfo)}
                        <div>
                          <p className="font-medium">
                            {session.deviceInfo.device}
                            {session.isCurrent && (
                              <Badge variant="default" className="ml-2">Current</Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.deviceInfo.browser} on {session.deviceInfo.os}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.location?.ip} • Last active {formatTimeAgo(session.lastActivity)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                      >
                        {revoking === session.id ? 'Revoking...' : 'Revoke'}
                      </Button>
                    )}
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No active sessions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Recent security-related activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{event.statusIcon}</span>
                      <div>
                        <p className="font-medium">{event.actionDisplay}</p>
                        <p className="text-sm text-gray-600">{event.resourceDisplay}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={event.status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {event.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${event.severityColor}`}
                          >
                            {event.severity}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(event.createdAt)}
                          </span>
                        </div>
                        {event.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {event.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No security events found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Complete log of all activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{log.statusIcon}</span>
                      <div>
                        <p className="font-medium">{log.actionDisplay}</p>
                        <p className="text-sm text-gray-600">{log.resourceDisplay}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={log.status === 'success' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {log.status}
                          </Badge>
                          {log.isSecurityEvent && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              Security
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(log.createdAt)}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 mt-1">
                            IP: {log.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}