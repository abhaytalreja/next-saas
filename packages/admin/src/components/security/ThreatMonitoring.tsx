'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Eye,
  MapPin,
  Globe,
  Clock,
  Ban,
  CheckCircle,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Modal,
  useModal
} from '@nextsaas/ui'
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics'

export interface ThreatIndicator {
  id: string
  type: 'ip_reputation' | 'user_behavior' | 'api_abuse' | 'malware' | 'phishing'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  source: string
  confidence: number
  firstSeen: string
  lastSeen: string
  count: number
  status: 'active' | 'mitigated' | 'investigating' | 'false_positive'
  affectedAssets: string[]
  mitigationActions?: string[]
  metadata?: Record<string, any>
}

export interface ThreatMetrics {
  totalThreats: number
  activeThreats: number
  mitigatedThreats: number
  avgResponseTime: number
  topThreatType: string
  threatsByType: Record<string, number>
  threatsBySource: Record<string, number>
  threatTrend: 'up' | 'down' | 'stable'
}

interface ThreatMonitoringProps {
  className?: string
}

const mockThreatIndicators: ThreatIndicator[] = [
  {
    id: '1',
    type: 'ip_reputation',
    severity: 'critical',
    title: 'Known Malicious IP Address',
    description: 'IP address 203.0.113.42 is flagged as malicious in multiple threat intelligence feeds',
    source: 'ThreatIntel Feed A',
    confidence: 95,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    count: 47,
    status: 'active',
    affectedAssets: ['web-server-1', 'api-gateway'],
    metadata: {
      ipAddress: '203.0.113.42',
      country: 'Unknown',
      organization: 'Unknown',
      threatTypes: ['botnet', 'malware_c2']
    }
  },
  {
    id: '2',
    type: 'user_behavior',
    severity: 'high',
    title: 'Anomalous User Activity Pattern',
    description: 'User john@example.com showing unusual login patterns - multiple geographic locations in short timeframe',
    source: 'Behavioral Analytics',
    confidence: 87,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    count: 12,
    status: 'investigating',
    affectedAssets: ['user-auth-system'],
    metadata: {
      userId: 'user-123',
      email: 'john@example.com',
      locations: ['New York, US', 'London, UK', 'Tokyo, JP'],
      timespan: '4 hours'
    }
  },
  {
    id: '3',
    type: 'api_abuse',
    severity: 'medium',
    title: 'API Rate Limit Violations',
    description: 'Multiple API endpoints experiencing rate limit violations from specific IP ranges',
    source: 'API Gateway Logs',
    confidence: 92,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    count: 156,
    status: 'mitigated',
    affectedAssets: ['api-endpoint-1', 'api-endpoint-2', 'api-endpoint-3'],
    mitigationActions: ['Rate limiting increased', 'IP range blocked'],
    metadata: {
      ipRange: '198.51.100.0/24',
      endpoints: ['/api/users', '/api/organizations', '/api/analytics']
    }
  },
  {
    id: '4',
    type: 'phishing',
    severity: 'high',
    title: 'Phishing Domain Detected',
    description: 'Domain nextsaas-secure.com detected mimicking legitimate service for credential theft',
    source: 'Domain Intelligence',
    confidence: 98,
    firstSeen: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    count: 8,
    status: 'active',
    affectedAssets: ['brand-reputation', 'user-trust'],
    metadata: {
      domain: 'nextsaas-secure.com',
      registrar: 'Unknown',
      similarity: '95%',
      status: 'active'
    }
  }
]

const mockThreatMetrics: ThreatMetrics = {
  totalThreats: 23,
  activeThreats: 8,
  mitigatedThreats: 15,
  avgResponseTime: 45, // minutes
  topThreatType: 'ip_reputation',
  threatsByType: {
    'ip_reputation': 8,
    'user_behavior': 5,
    'api_abuse': 4,
    'malware': 3,
    'phishing': 3
  },
  threatsBySource: {
    'ThreatIntel Feed A': 12,
    'Behavioral Analytics': 6,
    'API Gateway Logs': 3,
    'Domain Intelligence': 2
  },
  threatTrend: 'up'
}

export function ThreatMonitoring({ className }: ThreatMonitoringProps) {
  const [threats, setThreats] = useState<ThreatIndicator[]>(mockThreatIndicators)
  const [metrics, setMetrics] = useState<ThreatMetrics>(mockThreatMetrics)
  const [selectedThreat, setSelectedThreat] = useState<ThreatIndicator | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('overview')
  const { isConnected } = useRealTimeMetrics()
  const threatDetailsModal = useModal()

  const filteredThreats = threats.filter(threat => {
    if (severityFilter !== 'all' && threat.severity !== severityFilter) return false
    if (statusFilter !== 'all' && threat.status !== statusFilter) return false
    if (typeFilter !== 'all' && threat.type !== typeFilter) return false
    return true
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    // TODO: Implement real API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleMitigation = async (threatId: string, action: string) => {
    setThreats(prev => prev.map(threat =>
      threat.id === threatId
        ? {
            ...threat,
            status: 'mitigated',
            mitigationActions: [...(threat.mitigationActions || []), action]
          }
        : threat
    ))
  }

  const handleStatusUpdate = async (threatId: string, status: ThreatIndicator['status']) => {
    setThreats(prev => prev.map(threat =>
      threat.id === threatId ? { ...threat, status } : threat
    ))
  }

  const getThreatIcon = (type: ThreatIndicator['type']) => {
    switch (type) {
      case 'ip_reputation': return <Globe className="h-5 w-5" />
      case 'user_behavior': return <Activity className="h-5 w-5" />  
      case 'api_abuse': return <TrendingUp className="h-5 w-5" />
      case 'malware': return <AlertTriangle className="h-5 w-5" />
      case 'phishing': return <Shield className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getSeverityColor = (severity: ThreatIndicator['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: ThreatIndicator['status']) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'investigating': return 'text-yellow-600 bg-yellow-100'
      case 'mitigated': return 'text-green-600 bg-green-100'
      case 'false_positive': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Threat Monitoring</h2>
          <p className="text-gray-600">
            Real-time threat detection and response management
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Threats Alert */}
      {threats.filter(t => t.severity === 'critical' && t.status === 'active').length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>
              {threats.filter(t => t.severity === 'critical' && t.status === 'active').length} critical threat
              {threats.filter(t => t.severity === 'critical' && t.status === 'active').length > 1 ? 's' : ''}
            </strong> detected and require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Threat Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Threats</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalThreats}</p>
                <div className="flex items-center mt-2">
                  {metrics.threatTrend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  ) : metrics.threatTrend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metrics.threatTrend === 'up' ? 'text-red-600' :
                    metrics.threatTrend === 'down' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {metrics.threatTrend} this week
                  </span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-red-600">{metrics.activeThreats}</p>
                <p className="text-sm text-gray-600 mt-2">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mitigated</p>
                <p className="text-2xl font-bold text-green-600">{metrics.mitigatedThreats}</p>
                <p className="text-sm text-gray-600 mt-2">Successfully resolved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime}m</p>
                <p className="text-sm text-gray-600 mt-2">Time to mitigation</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Intelligence Dashboard */}
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="feeds">Intelligence Feeds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Threats by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.threatsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getThreatIcon(type as ThreatIndicator['type'])}
                        <span className="text-sm font-medium capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / metrics.totalThreats) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent High-Priority Threats */}
            <Card>
              <CardHeader>
                <CardTitle>Recent High-Priority Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threats
                    .filter(t => t.severity === 'critical' || t.severity === 'high')
                    .slice(0, 5)
                    .map(threat => (
                      <div key={threat.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                          {getThreatIcon(threat.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {threat.title}
                            </h4>
                            <Badge className={`${getSeverityColor(threat.severity)} text-xs`}>
                              {threat.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{threat.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(threat.lastSeen)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {threat.count} events
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select 
                  value={severityFilter} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeverityFilter(e.target.value)}
                  options={[
                    {value: "all", label: "All Severity"},
                    {value: "critical", label: "Critical"},
                    {value: "high", label: "High"},
                    {value: "medium", label: "Medium"},
                    {value: "low", label: "Low"}
                  ]}
                  className="w-32"
                />
                
                <Select 
                  value={statusFilter} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  options={[
                    {value: "all", label: "All Status"},
                    {value: "active", label: "Active"},
                    {value: "investigating", label: "Investigating"},
                    {value: "mitigated", label: "Mitigated"},
                    {value: "false_positive", label: "False Positive"}
                  ]}
                  className="w-36"
                />

                <Select 
                  value={typeFilter} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                  options={[
                    {value: "all", label: "All Types"},
                    {value: "ip_reputation", label: "IP Reputation"},
                    {value: "user_behavior", label: "User Behavior"},
                    {value: "api_abuse", label: "API Abuse"},
                    {value: "malware", label: "Malware"},
                    {value: "phishing", label: "Phishing"}
                  ]}
                  className="w-40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Threats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Threat Indicators ({filteredThreats.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Threat</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats.map(threat => (
                    <TableRow key={threat.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                            {getThreatIcon(threat.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{threat.title}</p>
                            <p className="text-xs text-gray-600 truncate max-w-md">
                              {threat.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {threat.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={threat.confidence} className="w-16 h-2" />
                          <span className="text-sm">{threat.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(threat.lastSeen)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedThreat(threat)
                              threatDetailsModal.open()
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {threat.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(threat.id, 'investigating')}
                            >
                              Investigate
                            </Button>
                          )}
                          
                          {(threat.status === 'active' || threat.status === 'investigating') && (
                            <Button 
                              size="sm"
                              onClick={() => handleMitigation(threat.id, 'Auto-mitigated')}
                            >
                              Mitigate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Intelligence Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.threatsBySource).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(count / metrics.totalThreats) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="text-sm font-bold">{metrics.avgResponseTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Detection Rate</span>
                    <span className="text-sm font-bold">96.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">False Positive Rate</span>
                    <span className="text-sm font-bold">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mitigation Success Rate</span>
                    <span className="text-sm font-bold">98.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.threatsBySource).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div>
                        <h4 className="font-medium">{source}</h4>
                        <p className="text-sm text-gray-600">Active feed providing threat intelligence</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{count} indicators</p>
                      <p className="text-xs text-gray-500">Last updated: 2m ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Threat Details Modal */}
      <Modal
        isOpen={threatDetailsModal.isOpen}
        onClose={threatDetailsModal.close}
        title="Threat Intelligence Details"
        description=""
        size="xl"
        className=""
        overlayClassName=""
      >
        {selectedThreat && (
          <ThreatDetails 
            threat={selectedThreat}
            onMitigation={handleMitigation}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </Modal>
    </div>
  )
}

interface ThreatDetailsProps {
  threat: ThreatIndicator
  onMitigation: (threatId: string, action: string) => void
  onStatusUpdate: (threatId: string, status: ThreatIndicator['status']) => void
}

function ThreatDetails({ threat, onMitigation, onStatusUpdate }: ThreatDetailsProps) {
  const [mitigationAction, setMitigationAction] = useState('')

  const handleMitigation = () => {
    if (mitigationAction.trim()) {
      onMitigation(threat.id, mitigationAction)
      setMitigationAction('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Threat Overview</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <p className="text-sm text-gray-900">{threat.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="text-sm text-gray-900">{threat.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Source</label>
              <p className="text-sm text-gray-900">{threat.source}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confidence</label>
              <div className="flex items-center space-x-2">
                <Progress value={threat.confidence} className="w-24 h-2" />
                <span className="text-sm">{threat.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Timeline & Status</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">First Seen</label>
              <p className="text-sm text-gray-900">{new Date(threat.firstSeen).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Seen</label>
              <p className="text-sm text-gray-900">{new Date(threat.lastSeen).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Event Count</label>
              <p className="text-sm text-gray-900">{threat.count}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Current Status</label>
              <Badge className={`${threat.status === 'active' ? 'bg-red-100 text-red-800' :
                threat.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                threat.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'} mt-1`}>
                {threat.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-4">Affected Assets</h3>
        <div className="flex flex-wrap gap-2">
          {threat.affectedAssets.map((asset, index) => (
            <Badge key={index} variant="outline">{asset}</Badge>
          ))}
        </div>
      </div>

      {threat.metadata && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Additional Details</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">
              {JSON.stringify(threat.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {threat.mitigationActions && threat.mitigationActions.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Mitigation Actions</h3>
          <div className="space-y-2">
            {threat.mitigationActions.map((action, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(threat.status === 'active' || threat.status === 'investigating') && (
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Take Action</h3>
          <div className="flex space-x-4">
            <Button 
              variant="outline"
              onClick={() => onStatusUpdate(threat.id, 'investigating')}
              disabled={threat.status === 'investigating'}
            >
              Mark as Investigating
            </Button>
            <Button 
              variant="outline"
              onClick={() => onStatusUpdate(threat.id, 'false_positive')}
            >
              Mark as False Positive
            </Button>
            <Button onClick={() => onMitigation(threat.id, 'Manual mitigation applied')}>
              Apply Mitigation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}