'use client'

import React, { useState, useEffect } from 'react'
import { 
  Globe, 
  Activity, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Shield,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Select
} from '@nextsaas/ui'

interface APIEndpoint {
  path: string
  method: string
  status: 'healthy' | 'warning' | 'error'
  avgResponseTime: number
  requestCount: number
  errorRate: number
  lastError: string | null
}

interface APIError {
  id: string
  endpoint: string
  method: string
  statusCode: number
  message: string
  timestamp: string
  count: number
}

interface RateLimitingData {
  enabled: boolean
  defaultLimit: number
  windowSize: number
  currentRequests: number
  blockedRequests: number
}

interface APIStatusData {
  endpoints: APIEndpoint[]
  rateLimiting: RateLimitingData
  errors: APIError[]
}

interface APIStatusProps {
  className?: string
}

export function APIStatus({ className }: APIStatusProps) {
  const [apiData, setApiData] = useState<APIStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('endpoints')

  useEffect(() => {
    fetchAPIStatus()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAPIStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAPIStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/system?type=api')
      if (!response.ok) {
        throw new Error('Failed to fetch API status')
      }
      
      const result = await response.json()
      setApiData(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use mock data as fallback
      setApiData(generateMockAPIData())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockAPIData = (): APIStatusData => ({
    endpoints: [
      {
        path: '/api/auth/sign-in',
        method: 'POST',
        status: 'healthy',
        avgResponseTime: 145,
        requestCount: 15420,
        errorRate: 0.01,
        lastError: null
      },
      {
        path: '/api/users',
        method: 'GET',
        status: 'healthy',
        avgResponseTime: 89,
        requestCount: 28340,
        errorRate: 0.005,
        lastError: null
      },
      {
        path: '/api/organizations',
        method: 'GET',
        status: 'warning',
        avgResponseTime: 250,
        requestCount: 12450,
        errorRate: 0.02,
        lastError: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        path: '/api/admin/dashboard',
        method: 'GET',
        status: 'healthy',
        avgResponseTime: 120,
        requestCount: 1250,
        errorRate: 0.001,
        lastError: null
      },
      {
        path: '/api/billing/subscriptions',
        method: 'POST',
        status: 'error',
        avgResponseTime: 1200,
        requestCount: 892,
        errorRate: 0.15,
        lastError: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ],
    rateLimiting: {
      enabled: true,
      defaultLimit: 100,
      windowSize: 900,
      currentRequests: 847,
      blockedRequests: 23
    },
    errors: [
      {
        id: '1',
        endpoint: '/api/billing/subscriptions',
        method: 'POST',
        statusCode: 500,
        message: 'Payment provider connection timeout',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        count: 8
      },
      {
        id: '2',
        endpoint: '/api/organizations',
        method: 'GET',
        statusCode: 503,
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        count: 3
      },
      {
        id: '3',
        endpoint: '/api/auth/sign-in',
        method: 'POST',
        statusCode: 429,
        message: 'Rate limit exceeded',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        count: 12
      }
    ]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-orange-600 bg-orange-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getErrorBadgeColor = (statusCode: number) => {
    if (statusCode >= 500) return 'text-red-600 bg-red-100'
    if (statusCode >= 400) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const filteredEndpoints = apiData?.endpoints.filter(endpoint => {
    if (searchTerm && !endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && endpoint.status !== statusFilter) return false
    if (methodFilter !== 'all' && endpoint.method !== methodFilter) return false
    return true
  }) || []

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`} data-testid="api-status-loading">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32" data-testid="loading-skeleton"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert data-testid="api-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load API status: {error}
          </AlertDescription>
        </Alert>
        {apiData && (
          <div className="text-sm text-gray-600">
            Showing cached data. <Button variant="link" onClick={fetchAPIStatus}>Retry</Button>
          </div>
        )}
      </div>
    )
  }

  if (!apiData) {
    return null
  }

  const totalRequests = apiData.endpoints.reduce((sum, endpoint) => sum + endpoint.requestCount, 0)
  const avgResponseTime = apiData.endpoints.reduce((sum, endpoint) => sum + endpoint.avgResponseTime, 0) / apiData.endpoints.length
  const errorEndpoints = apiData.endpoints.filter(e => e.status === 'error').length
  const warningEndpoints = apiData.endpoints.filter(e => e.status === 'warning').length

  return (
    <div className={`space-y-6 ${className}`} data-testid="api-status-main">
      {/* Header */}
      <div className="flex items-center justify-between" data-testid="api-status-header">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Status</h2>
          <p className="text-gray-600">
            API endpoint monitoring and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAPIStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alerts */}
      {(errorEndpoints > 0 || warningEndpoints > 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorEndpoints > 0 && (
              <span><strong>{errorEndpoints} API endpoint{errorEndpoints > 1 ? 's' : ''}</strong> {errorEndpoints > 1 ? 'are' : 'is'} experiencing errors. </span>
            )}
            {warningEndpoints > 0 && (
              <span><strong>{warningEndpoints} endpoint{warningEndpoints > 1 ? 's' : ''}</strong> {warningEndpoints > 1 ? 'show' : 'shows'} warning status.</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="metrics-grid">
        {/* Total Endpoints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiData.endpoints.length}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">{apiData.endpoints.filter(e => e.status === 'healthy').length} healthy</span>
              </div>
              {warningEndpoints > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{warningEndpoints} warning</span>
                </div>
              )}
              {errorEndpoints > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{errorEndpoints} error</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all endpoints (24h)
            </p>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <div className="flex items-center mt-2">
              {avgResponseTime < 200 ? (
                <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${avgResponseTime < 200 ? 'text-green-600' : 'text-red-600'}`}>
                {avgResponseTime < 200 ? 'Excellent' : 'Needs attention'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={apiData.rateLimiting.enabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}>
                {apiData.rateLimiting.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {apiData.rateLimiting.blockedRequests} requests blocked
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="endpoints" value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search endpoints..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      aria-label="Search endpoints"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={statusFilter} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                    options={[
                      {value: "all", label: "All Status"},
                      {value: "healthy", label: "Healthy"},
                      {value: "warning", label: "Warning"},
                      {value: "error", label: "Error"}
                    ]}
                    className="w-32"
                    aria-label="Filter by status"
                  />
                  <Select 
                    value={methodFilter} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMethodFilter(e.target.value)}
                    options={[
                      {value: "all", label: "All Methods"},
                      {value: "GET", label: "GET"},
                      {value: "POST", label: "POST"},
                      {value: "PUT", label: "PUT"},
                      {value: "DELETE", label: "DELETE"}
                    ]}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints Table */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints ({filteredEndpoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Avg Response</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Error Rate</TableHead>
                    <TableHead>Last Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEndpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          endpoint.method === 'GET' ? 'text-blue-600 border-blue-600' :
                          endpoint.method === 'POST' ? 'text-green-600 border-green-600' :
                          endpoint.method === 'PUT' ? 'text-orange-600 border-orange-600' :
                          'text-red-600 border-red-600'
                        }>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(endpoint.status)}
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{endpoint.avgResponseTime}ms</TableCell>
                      <TableCell className="text-right">{endpoint.requestCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={endpoint.errorRate > 0.05 ? 'text-red-600' : endpoint.errorRate > 0.01 ? 'text-orange-600' : 'text-green-600'}>
                          {(endpoint.errorRate * 100).toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {endpoint.lastError ? formatTimestamp(endpoint.lastError) : 'None'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Error Message</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Last Occurred</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiData.errors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell className="font-mono text-sm">{error.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{error.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getErrorBadgeColor(error.statusCode)}>
                          {error.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{error.message}</TableCell>
                      <TableCell>{error.count}</TableCell>
                      <TableCell>{formatTimestamp(error.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limiting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={apiData.rateLimiting.enabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}>
                    {apiData.rateLimiting.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Default Limit</span>
                  <span className="text-sm text-gray-900">{apiData.rateLimiting.defaultLimit} req/window</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Window Size</span>
                  <span className="text-sm text-gray-900">{Math.floor(apiData.rateLimiting.windowSize / 60)} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Requests</span>
                  <span className="text-sm text-gray-900">{apiData.rateLimiting?.currentRequests?.toLocaleString() || '0'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Blocked Requests</span>
                    <span>{apiData.rateLimiting.blockedRequests}</span>
                  </div>
                  <Progress 
                    value={(apiData.rateLimiting.blockedRequests / (apiData.rateLimiting.currentRequests + apiData.rateLimiting.blockedRequests)) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {((apiData.rateLimiting.blockedRequests / (apiData.rateLimiting.currentRequests + apiData.rateLimiting.blockedRequests)) * 100).toFixed(2)}% of requests blocked
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Top blocked IPs:</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>192.168.1.100</span>
                      <span>8 blocks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>203.0.113.42</span>
                      <span>5 blocks</span>
                    </div>
                    <div className="flex justify-between">
                      <span>198.51.100.1</span>
                      <span>3 blocks</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}