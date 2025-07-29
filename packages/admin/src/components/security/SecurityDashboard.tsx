'use client'

import React, { useState } from 'react'
import { Shield, AlertTriangle, Users, Eye, Lock, Activity, Clock, FileText, RefreshCw, Download } from 'lucide-react'
import { AuditLogViewer } from './AuditLogViewer'
import { SecurityAlerts } from './SecurityAlerts'
import { ThreatMonitoring } from './ThreatMonitoring'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Progress
} from '@nextsaas/ui'

interface SecurityAlert {
  id: string
  type: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  userId?: string
  ipAddress?: string
}

interface SecurityMetric {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'stable'
  icon: React.ComponentType<any>
  color?: 'green' | 'red' | 'yellow' | 'blue'
}

interface ActiveSession {
  id: string
  userId: string
  userEmail: string
  ipAddress: string
  userAgent: string
  location: string
  lastActivity: string
  duration: string
}

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Multiple Failed Login Attempts',
    description: 'User john@example.com has had 5 failed login attempts in the last 10 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    resolved: false,
    userId: 'user-123',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    type: 'high',
    title: 'Suspicious API Activity',
    description: 'High volume of API requests from unknown IP address',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    resolved: false,
    ipAddress: '203.0.113.42'
  },
  {
    id: '3',
    type: 'medium',
    title: 'Admin Access from New Location',
    description: 'Admin user accessed system from new geographic location',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    resolved: true,
    userId: 'admin-456'
  }
]

const mockActiveSessions: ActiveSession[] = [
  {
    id: '1',
    userId: 'user-123',
    userEmail: 'john@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    duration: '2h 15m'
  },
  {
    id: '2',
    userId: 'user-456',
    userEmail: 'admin@example.com',
    ipAddress: '10.0.1.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: 'San Francisco, US',
    lastActivity: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    duration: '45m'
  }
]

export function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  const securityMetrics: SecurityMetric[] = [
    {
      title: 'Active Threats',
      value: 3,
      change: '+2',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Failed Logins (24h)',
      value: 47,
      change: '+12',
      trend: 'up',
      icon: Lock,
      color: 'yellow'
    },
    {
      title: 'Active Sessions',
      value: 142,
      change: '-5',
      trend: 'down',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Security Score',
      value: '94%',
      change: '+2%',
      trend: 'up',
      icon: Shield,
      color: 'green'
    }
  ]

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // TODO: Implement security data export
    console.log('Exporting security data...')
  }

  const getAlertBadgeVariant = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor security events, audit logs, and system threats.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    {metric.change && (
                      <p className={`text-sm ${
                        metric.trend === 'up' && metric.color === 'red' ? 'text-red-600' :
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {metric.change} from yesterday
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${
                    metric.color === 'red' ? 'bg-red-100' :
                    metric.color === 'yellow' ? 'bg-yellow-100' :
                    metric.color === 'blue' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      metric.color === 'red' ? 'text-red-600' :
                      metric.color === 'yellow' ? 'text-yellow-600' :
                      metric.color === 'blue' ? 'text-blue-600' :
                      'text-green-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Critical Alerts */}
      {mockSecurityAlerts.filter(alert => !alert.resolved && (alert.type === 'critical' || alert.type === 'high')).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {mockSecurityAlerts.filter(alert => !alert.resolved && (alert.type === 'critical' || alert.type === 'high')).length} critical security alerts that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} defaultValue="overview" className="">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="threats">Threat Monitoring</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSecurityAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className={`h-4 w-4 mt-1 ${
                        alert.type === 'critical' ? 'text-red-600' :
                        alert.type === 'high' ? 'text-orange-600' :
                        alert.type === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                          <Badge variant={getAlertBadgeVariant(alert.type)} className="ml-2">
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(alert.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* System Security Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Security Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Password Strength</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Two-Factor Authentication</span>
                    <span>73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Session Security</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Security</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <SecurityAlerts />
        </TabsContent>
        
        <TabsContent value="threats" className="space-y-6">
          <ThreatMonitoring />
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active Sessions ({mockActiveSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActiveSessions.map((session) => (
                  <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{session.userEmail}</h4>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Location:</span> {session.location}
                          </div>
                          <div>
                            <span className="font-medium">IP Address:</span> {session.ipAddress}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {session.duration}
                          </div>
                          <div>
                            <span className="font-medium">Last Activity:</span> {formatRelativeTime(session.lastActivity)}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 truncate">
                          <span className="font-medium">User Agent:</span> {session.userAgent}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive">
                          Terminate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  )
}