'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Modal,
  useModal,
  Textarea
} from '@nextsaas/ui'
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics'

export interface SecurityAlert {
  id: string
  type: 'critical' | 'high' | 'medium' | 'low'
  category: 'authentication' | 'access_control' | 'data_breach' | 'suspicious_activity' | 'system_integrity'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  location?: string
  affectedResources?: string[]
  metadata?: Record<string, any>
}

interface SecurityAlertsProps {
  className?: string
}

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'critical',
    category: 'authentication',
    title: 'Multiple Failed Login Attempts',
    description: 'User john@example.com has had 5 failed login attempts in the last 10 minutes from IP 203.0.113.42',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    resolved: false,
    userId: 'user-123',
    ipAddress: '203.0.113.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Unknown Location',
    affectedResources: ['user-123']
  },
  {
    id: '2',
    type: 'high',
    category: 'suspicious_activity',
    title: 'Unusual API Activity',
    description: 'High volume of API requests detected from IP address 198.51.100.42 - 500 requests in 5 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    resolved: false,
    ipAddress: '198.51.100.42',
    userAgent: 'curl/7.68.0',
    location: 'Unknown Location',
    affectedResources: ['api-endpoint-1', 'api-endpoint-2']
  },
  {
    id: '3',
    type: 'medium',
    category: 'access_control',
    title: 'Admin Access from New Location',
    description: 'System admin accessed dashboard from new geographic location (London, UK)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    resolvedBy: 'admin-456',
    userId: 'admin-456',
    ipAddress: '192.0.2.1',
    location: 'London, UK'
  },
  {
    id: '4',
    type: 'low',
    category: 'system_integrity',
    title: 'Resource Usage Anomaly',
    description: 'Database query execution time increased by 200% over the last hour',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    resolved: false,
    affectedResources: ['database-primary']
  }
]

export function SecurityAlerts({ className }: SecurityAlertsProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts)
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts)
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { isConnected } = useRealTimeMetrics()
  const detailsModal = useModal()
  const resolveModal = useModal()

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(alert => alert.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => 
        statusFilter === 'resolved' ? alert.resolved : !alert.resolved
      )
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchTerm, typeFilter, categoryFilter, statusFilter])

  const handleRefresh = async () => {
    setIsLoading(true)
    // TODO: Implement real API call to fetch alerts
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            resolved: true, 
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'current-admin', // TODO: Get from context
            metadata: { ...alert.metadata, resolution }
          }
        : alert
    ))
  }

  const handleExportAlerts = () => {
    const csvContent = [
      'ID,Type,Category,Title,Description,Timestamp,Resolved,IP Address,Location',
      ...filteredAlerts.map(alert =>
        `${alert.id},${alert.type},${alert.category},"${alert.title}","${alert.description}",${alert.timestamp},${alert.resolved},${alert.ipAddress || ''},${alert.location || ''}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-alerts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'medium': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'low': return <Shield className="h-5 w-5 text-blue-600" />
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getBadgeVariant = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const unresolvedCount = alerts.filter(alert => !alert.resolved).length
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.resolved).length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Alerts</h2>
          <p className="text-gray-600">
            Monitor and respond to security threats and suspicious activities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live monitoring' : 'Offline'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportAlerts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalCount} critical security alert{criticalCount > 1 ? 's' : ''}</strong> require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-orange-600">{unresolvedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(alert => alert.resolved && alert.resolvedAt && 
                    new Date(alert.resolvedAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select 
                value={typeFilter} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)} 
                options={[
                  {value: "all", label: "All Types"},
                  {value: "critical", label: "Critical"},
                  {value: "high", label: "High"},
                  {value: "medium", label: "Medium"},
                  {value: "low", label: "Low"}
                ]}
                className="w-32"
              />
              <Select 
                value={categoryFilter} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                options={[
                  {value: "all", label: "All Categories"},
                  {value: "authentication", label: "Authentication"},
                  {value: "access_control", label: "Access Control"},
                  {value: "data_breach", label: "Data Breach"},
                  {value: "suspicious_activity", label: "Suspicious Activity"},
                  {value: "system_integrity", label: "System Integrity"}
                ]}
                className="w-40"
              />
              <Select 
                value={statusFilter} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                options={[
                  {value: "all", label: "All Status"},
                  {value: "unresolved", label: "Unresolved"},
                  {value: "resolved", label: "Resolved"}
                ]}
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No alerts match your current filters
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 border rounded-lg transition-colors ${
                    alert.resolved ? 'bg-gray-50 border-gray-200' : 
                    alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.type === 'high' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                          <Badge variant={getBadgeVariant(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              RESOLVED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatTimestamp(alert.timestamp)}</span>
                          {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                          {alert.location && <span>Location: {alert.location}</span>}
                          {alert.affectedResources && (
                            <span>Resources: {alert.affectedResources.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedAlert(alert)
                          detailsModal.open()
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {!alert.resolved && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert)
                            resolveModal.open()
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.close}
        title="Security Alert Details"
        description=""
        size="lg"
        className=""
        overlayClassName=""
      >
        {selectedAlert && (
          <AlertDetails 
            alert={selectedAlert} 
            onResolve={handleResolveAlert}
          />
        )}
      </Modal>

      <Modal
        isOpen={resolveModal.isOpen}
        onClose={resolveModal.close}
        title="Resolve Security Alert"
        description=""
        size="md"
        className=""
        overlayClassName=""
      >
        {selectedAlert && (
          <ResolveAlertForm 
            alert={selectedAlert}
            onResolve={(alertId, resolution) => {
              handleResolveAlert(alertId, resolution)
              resolveModal.close()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

interface AlertDetailsProps {
  alert: SecurityAlert
  onResolve: (alertId: string, resolution: string) => void
}

function AlertDetails({ alert, onResolve }: AlertDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Alert ID</label>
          <p className="text-sm text-gray-900">{alert.id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Timestamp</label>
          <p className="text-sm text-gray-900">{new Date(alert.timestamp).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Type</label>
          <p className="text-sm text-gray-900">{alert.type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <p className="text-sm text-gray-900">{alert.category.replace('_', ' ')}</p>
        </div>
        {alert.ipAddress && (
          <div>
            <label className="text-sm font-medium text-gray-700">IP Address</label>
            <p className="text-sm text-gray-900">{alert.ipAddress}</p>
          </div>
        )}
        {alert.location && (
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <p className="text-sm text-gray-900">{alert.location}</p>
          </div>
        )}
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <p className="text-sm text-gray-900 mt-1">{alert.description}</p>
      </div>

      {alert.userAgent && (
        <div>
          <label className="text-sm font-medium text-gray-700">User Agent</label>
          <p className="text-sm text-gray-900 mt-1 break-all">{alert.userAgent}</p>
        </div>
      )}

      {alert.affectedResources && alert.affectedResources.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Affected Resources</label>
          <div className="mt-1 space-y-1">
            {alert.affectedResources.map((resource, index) => (
              <Badge key={index} variant="outline">
                {resource}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Additional Details</label>
          <pre className="text-xs text-gray-900 mt-1 bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(alert.metadata, null, 2)}
          </pre>
        </div>
      )}

      {alert.resolved && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">Resolved At</label>
              <p className="text-sm text-gray-900">
                {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600">Resolved By</label>
              <p className="text-sm text-gray-900">{alert.resolvedBy || 'System'}</p>
            </div>
          </div>
          {alert.metadata?.resolution && (
            <div className="mt-2">
              <label className="text-xs text-gray-600">Resolution Notes</label>
              <p className="text-sm text-gray-900">{alert.metadata.resolution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ResolveAlertFormProps {
  alert: SecurityAlert
  onResolve: (alertId: string, resolution: string) => void
}

function ResolveAlertForm({ alert, onResolve }: ResolveAlertFormProps) {
  const [resolution, setResolution] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const handleResolve = async () => {
    if (!resolution.trim()) return

    setIsResolving(true)
    await onResolve(alert.id, resolution)
    setIsResolving(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Alert</label>
        <p className="text-sm text-gray-900">{alert.title}</p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700">Resolution Notes</label>
        <Textarea
          placeholder="Describe how this alert was resolved..."
          value={resolution}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolution(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          onClick={handleResolve}
          disabled={!resolution.trim() || isResolving}
        >
          {isResolving ? 'Resolving...' : 'Resolve Alert'}
        </Button>
      </div>
    </div>
  )
}