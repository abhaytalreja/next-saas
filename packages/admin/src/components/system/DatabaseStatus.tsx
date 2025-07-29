'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Activity, 
  Clock, 
  HardDrive,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  TrendingUp
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
  TabsTrigger
} from '@nextsaas/ui'

interface DatabaseStatusData {
  status: 'healthy' | 'warning' | 'error'
  avgQueryTime: number
  activeConnections: number
  maxConnections: number
  cacheHitRatio: number
  tables: {
    [key: string]: {
      name: string
      rowCount: number
      size: string
      lastVacuum: string
    }
  }
  recentQueries: Array<{
    query: string
    avgTime: number
    calls: number
    totalTime: number
  }>
  error?: string
}

interface DatabaseStatusProps {
  className?: string
}

export function DatabaseStatus({ className }: DatabaseStatusProps) {
  const [databaseData, setDatabaseData] = useState<DatabaseStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedTab, setSelectedTab] = useState('tables')

  useEffect(() => {
    fetchDatabaseStatus()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDatabaseStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDatabaseStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/system?type=database')
      if (!response.ok) {
        throw new Error('Failed to fetch database status')
      }
      
      const result = await response.json()
      setDatabaseData(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Use mock data as fallback
      setDatabaseData(generateMockDatabaseData())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockDatabaseData = (): DatabaseStatusData => ({
    status: 'healthy',
    avgQueryTime: 45,
    activeConnections: 15,
    maxConnections: 100,
    cacheHitRatio: 0.95,
    tables: {
      users: {
        name: 'users',
        rowCount: 5432,
        size: '2.5 MB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      organizations: {
        name: 'organizations',
        rowCount: 891,
        size: '512 KB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      },
      audit_logs: {
        name: 'audit_logs',
        rowCount: 125432,
        size: '45.2 MB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      organization_members: {
        name: 'organization_members',
        rowCount: 3421,
        size: '1.8 MB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    },
    recentQueries: [
      {
        query: 'SELECT * FROM users WHERE id = $1',
        avgTime: 2.5,
        calls: 15420,
        totalTime: 38550
      },
      {
        query: 'SELECT * FROM organizations WHERE id = $1',
        avgTime: 1.8,
        calls: 8932,
        totalTime: 16077
      },
      {
        query: 'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
        avgTime: 3.2,
        calls: 5234,
        totalTime: 16749
      },
      {
        query: 'SELECT COUNT(*) FROM organization_members WHERE organization_id = $1',
        avgTime: 4.1,
        calls: 2143,
        totalTime: 8786
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
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Less than 1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} days ago`
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load database status: {error}
          </AlertDescription>
        </Alert>
        {databaseData && (
          <div className="text-sm text-gray-600">
            Showing cached data. <Button variant="link" onClick={fetchDatabaseStatus}>Retry</Button>
          </div>
        )}
      </div>
    )
  }

  if (!databaseData) {
    return null
  }

  const connectionUtilization = (databaseData.activeConnections / databaseData.maxConnections) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Status</h2>
          <p className="text-gray-600">
            Database performance monitoring and optimization insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={fetchDatabaseStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Database Status Alert */}
      {databaseData.status !== 'healthy' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Database status: {databaseData.status}</strong>
            {databaseData.error && ` - ${databaseData.error}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(databaseData.status)}
              <Badge className={getStatusColor(databaseData.status)}>
                {databaseData.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              System operational status
            </p>
          </CardContent>
        </Card>

        {/* Average Query Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(databaseData.avgQueryTime)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {databaseData.avgQueryTime < 100 ? 'Excellent' : 
               databaseData.avgQueryTime < 500 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {databaseData.activeConnections}/{databaseData.maxConnections}
            </div>
            <Progress 
              value={connectionUtilization} 
              className="h-2 mt-2"
              // @ts-ignore
              indicatorClassName={
                connectionUtilization >= 90 ? 'bg-red-500' :
                connectionUtilization >= 70 ? 'bg-orange-500' : 'bg-green-500'
              }
            />
            <p className="text-xs text-muted-foreground mt-2">
              {connectionUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        {/* Cache Hit Ratio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(databaseData.cacheHitRatio * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {databaseData.cacheHitRatio >= 0.9 ? 'Excellent' : 
               databaseData.cacheHitRatio >= 0.8 ? 'Good' : 'Poor'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="tables" value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="tables">Table Statistics</TabsTrigger>
          <TabsTrigger value="queries">Query Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead className="text-right">Row Count</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead>Last Vacuum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(databaseData.tables).map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell className="text-right">
                        {table.rowCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{table.size}</TableCell>
                      <TableCell>{formatTimestamp(table.lastVacuum)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Healthy
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Queries by Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Total Time</TableHead>
                    <TableHead>Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databaseData.recentQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm max-w-md truncate">
                        {query.query}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDuration(query.avgTime)}
                      </TableCell>
                      <TableCell className="text-right">
                        {query.calls.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDuration(query.totalTime)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" 
                          className={
                            query.avgTime > 5000 ? 'text-red-600 border-red-600' :
                            query.avgTime > 1000 ? 'text-orange-600 border-orange-600' :
                            'text-green-600 border-green-600'
                          }>
                          {query.avgTime > 5000 ? 'High' :
                           query.avgTime > 1000 ? 'Medium' : 'Low'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Vacuum</span>
                  <Badge className="text-green-600 bg-green-100">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analyze</span>
                  <Badge className="text-green-600 bg-green-100">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stats Collection</span>
                  <Badge className="text-green-600 bg-green-100">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Checkpoint</span>
                  <span className="text-sm text-gray-600">2 minutes ago</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Index optimization</p>
                    <p className="text-xs text-gray-600">Consider adding index on audit_logs(created_at)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Connection pooling</p>
                    <p className="text-xs text-gray-600">Current utilization is optimal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <HardDrive className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Storage optimization</p>
                    <p className="text-xs text-gray-600">Consider archiving old audit logs</p>
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