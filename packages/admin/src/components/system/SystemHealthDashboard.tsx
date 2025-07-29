'use client'

import React, { useState, useEffect } from 'react'
import { Server, Database, Wifi, HardDrive, Cpu, MemoryStick, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@nextsaas/ui'
import { useSystemHealth } from '../../hooks/useSystemHealth'
import { AnalyticsChart } from '../analytics/AnalyticsChart'
import { PerformanceMetrics } from './PerformanceMetrics'
import { DatabaseStatus } from './DatabaseStatus'
import { APIStatus } from './APIStatus'

interface ServiceHealthStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'maintenance'
  responseTime: number
  uptime: number
  lastCheck: string
  description: string
  icon: React.ComponentType<any>
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  threshold: { warning: number; critical: number }
  history: { timestamp: string; value: number }[]
}

interface SystemEvent {
  id: string
  type: 'error' | 'warning' | 'info'
  service: string
  message: string
  timestamp: string
  resolved: boolean
}

const mockServices: ServiceHealthStatus[] = [
  {
    name: 'Database',
    status: 'healthy',
    responseTime: 45,
    uptime: 99.9,
    lastCheck: new Date().toISOString(),
    description: 'Primary PostgreSQL database',
    icon: Database
  },
  {
    name: 'API Gateway',
    status: 'healthy',
    responseTime: 120,
    uptime: 99.8,
    lastCheck: new Date().toISOString(),
    description: 'Main API endpoint',
    icon: Server
  },
  {
    name: 'Email Service',
    status: 'warning',
    responseTime: 850,
    uptime: 98.5,
    lastCheck: new Date().toISOString(),
    description: 'Email delivery system',
    icon: Wifi
  },
  {
    name: 'File Storage',
    status: 'healthy',
    responseTime: 200,
    uptime: 99.7,
    lastCheck: new Date().toISOString(),
    description: 'S3 compatible storage',
    icon: HardDrive
  },
  {
    name: 'Authentication',
    status: 'healthy',
    responseTime: 80,
    uptime: 99.9,
    lastCheck: new Date().toISOString(),
    description: 'User authentication service',
    icon: CheckCircle
  }
]

const mockSystemMetrics: SystemMetric[] = [
  {
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'normal',
    threshold: { warning: 70, critical: 90 },
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 30) + 30
    }))
  },
  {
    name: 'Memory Usage',
    value: 68,
    unit: '%',
    status: 'normal',
    threshold: { warning: 80, critical: 95 },
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 20) + 60
    }))
  },
  {
    name: 'Disk Usage',
    value: 34,
    unit: '%',
    status: 'normal',
    threshold: { warning: 80, critical: 95 },
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 10) + 30
    }))
  },
  {
    name: 'Network I/O',
    value: 12,
    unit: 'MB/s',
    status: 'normal',
    threshold: { warning: 50, critical: 80 },
    history: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 20) + 5
    }))
  }
]

const mockSystemEvents: SystemEvent[] = [
  {
    id: '1',
    type: 'warning',
    service: 'Email Service',
    message: 'High response time detected (>800ms)',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    resolved: false
  },
  {
    id: '2',
    type: 'info',
    service: 'Database',
    message: 'Automated backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    resolved: true
  },
  {
    id: '3',
    type: 'error',
    service: 'API Gateway',
    message: 'Temporary connection timeout resolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    resolved: true
  }
]

export function SystemHealthDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // In a real implementation, this would trigger a data refresh
      console.log('Auto-refreshing system health data...')
    }, 30000)
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporting system health data...')
  }

  const getStatusIcon = (status: ServiceHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />
      case 'maintenance': return <Activity className="h-5 w-5 text-blue-600" />
      default: return <XCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: ServiceHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'maintenance': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getMetricStatus = (metric: SystemMetric) => {
    if (metric.value >= metric.threshold.critical) return 'critical'
    if (metric.value >= metric.threshold.warning) return 'warning'
    return 'normal'
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-green-600'
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

  const overallStatus = mockServices.some(s => s.status === 'error') ? 'error' :
                      mockServices.some(s => s.status === 'warning') ? 'warning' : 'healthy'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="mt-2 text-gray-600">
            Monitor system performance and health metrics in real-time.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Auto-refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-10 h-6 rounded-full ${autoRefresh ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${autoRefresh ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Status Alert */}
      {overallStatus !== 'healthy' && (
        <Alert className={overallStatus === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {overallStatus === 'error' 
              ? 'Critical system issues detected. Immediate attention required.'
              : 'Some services are experiencing issues. Monitor closely.'}
          </AlertDescription>
        </Alert>
      )}

      {/* System Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} defaultValue="overview" className="">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Status</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Services Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServices.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.name} className={`border-2 ${getStatusColor(service.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <h3 className="font-medium">{service.name}</h3>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time:</span>
                        <span className="font-medium">{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Uptime:</span>
                        <span className="font-medium">{service.uptime}%</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Last check: {formatRelativeTime(service.lastCheck)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockSystemMetrics.map((metric) => {
              const status = getMetricStatus(metric)
              return (
                <Card key={metric.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                      <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'default' : 'secondary'}>
                        {status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getMetricColor(status)}`}>
                      {metric.value}{metric.unit}
                    </div>
                    <Progress 
                      value={metric.value} 
                      className="mt-2" 
                      max={metric.name === 'Network I/O' ? 100 : 100}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Warning: {metric.threshold.warning}{metric.unit} | Critical: {metric.threshold.critical}{metric.unit}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-6">
          <div className="space-y-4">
            {mockServices.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${getStatusColor(service.status)}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{service.name}</h3>
                          <p className="text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(service.status)}
                          <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                            {service.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Last check: {formatRelativeTime(service.lastCheck)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-gray-600">Response Time</div>
                        <div className="text-lg font-semibold">{service.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Uptime</div>
                        <div className="text-lg font-semibold">{service.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className={`text-lg font-semibold ${
                          service.status === 'healthy' ? 'text-green-600' :
                          service.status === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {service.status === 'healthy' ? 'Operational' :
                           service.status === 'warning' ? 'Degraded' : 'Down'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics />
        </TabsContent>
        
        <TabsContent value="database" className="space-y-6">
          <DatabaseStatus />
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <APIStatus />
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSystemEvents.map((event) => (
                  <div key={event.id} className={`p-4 border rounded-lg ${
                    event.type === 'error' ? 'bg-red-50 border-red-200' :
                    event.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={event.type === 'error' ? 'destructive' : event.type === 'warning' ? 'default' : 'secondary'}>
                            {event.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{event.service}</span>
                          {event.resolved && (
                            <Badge variant="outline">RESOLVED</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{event.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatRelativeTime(event.timestamp)}</p>
                      </div>
                      {!event.resolved && (
                        <Button size="sm" variant="outline">
                          Investigate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}