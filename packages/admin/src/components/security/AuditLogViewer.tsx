'use client'

import React, { useState, useMemo } from 'react'
import { Search, Filter, Calendar, User, Settings, Eye, Download, ChevronDown, ChevronRight, Shield, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@nextsaas/ui'
import { FilterPanel, FilterConfig, FilterValues } from '../common/FilterPanel'
import { ExportButton } from '../common/ExportButton'
import { AuditLog } from '../../types'

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user_id: 'user-123',
    action: 'LOGIN',
    resource_type: 'user',
    resource_id: 'user-123',
    details: {
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: '2',
    user_id: 'admin-456',
    action: 'UPDATE_USER',
    resource_type: 'user',
    resource_id: 'user-789',
    details: {
      changes: {
        status: { from: 'active', to: 'suspended' },
        updated_by: 'admin-456'
      }
    },
    ip_address: '10.0.1.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: '3',
    user_id: 'user-456',
    action: 'CREATE_ORGANIZATION',
    resource_type: 'organization',
    resource_id: 'org-123',
    details: {
      organization_name: 'Acme Corp',
      plan: 'premium'
    },
    ip_address: '203.0.113.10',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '4',
    user_id: 'admin-456',
    action: 'DELETE_USER',
    resource_type: 'user',
    resource_id: 'user-999',
    details: {
      user_email: 'deleted@example.com',
      reason: 'Account termination requested'
    },
    ip_address: '10.0.1.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: '5',
    user_id: 'user-789',
    action: 'FAILED_LOGIN',
    resource_type: 'user',
    resource_id: 'user-789',
    details: {
      ip_address: '192.168.1.200',
      reason: 'Invalid password',
      attempts: 3
    },
    ip_address: '192.168.1.200',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
]

export function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: 'resource_type',
      label: 'Resource Type',
      type: 'select',
      icon: Settings,
      options: [
        { label: 'User', value: 'user', count: 8 },
        { label: 'Organization', value: 'organization', count: 3 },
        { label: 'System', value: 'system', count: 2 },
        { label: 'Security', value: 'security', count: 5 }
      ]
    },
    {
      key: 'action',
      label: 'Action',
      type: 'multiselect',
      icon: Shield,
      options: [
        { label: 'Login', value: 'LOGIN', count: 12 },
        { label: 'Create', value: 'CREATE', count: 6 },
        { label: 'Update', value: 'UPDATE', count: 8 },
        { label: 'Delete', value: 'DELETE', count: 3 },
        { label: 'Failed Login', value: 'FAILED_LOGIN', count: 4 }
      ]
    },
    {
      key: 'user_id',
      label: 'User ID',
      type: 'text',
      icon: User,
      placeholder: 'Enter user ID...'
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      type: 'text',
      icon: Globe,
      placeholder: 'Enter IP address...'
    },
    {
      key: 'date_from',
      label: 'Date From',
      type: 'date',
      icon: Calendar
    },
    {
      key: 'date_to',
      label: 'Date To',
      type: 'date',
      icon: Calendar
    }
  ]

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.ip_address && log.ip_address.includes(searchTerm))

      // Resource type filter
      const matchesResourceType = !filterValues.resource_type || 
        log.resource_type === filterValues.resource_type

      // Action filter (multiselect)
      const matchesAction = !filterValues.action || 
        filterValues.action.length === 0 ||
        filterValues.action.includes(log.action)

      // User ID filter
      const matchesUserId = !filterValues.user_id ||
        log.user_id.toLowerCase().includes(filterValues.user_id.toLowerCase())

      // IP Address filter
      const matchesIpAddress = !filterValues.ip_address ||
        (log.ip_address && log.ip_address.includes(filterValues.ip_address))

      // Date range filters
      const logDate = new Date(log.created_at)
      const matchesDateFrom = !filterValues.date_from ||
        logDate >= new Date(filterValues.date_from)
      const matchesDateTo = !filterValues.date_to ||
        logDate <= new Date(filterValues.date_to + 'T23:59:59')

      return matchesSearch && 
             matchesResourceType && 
             matchesAction && 
             matchesUserId && 
             matchesIpAddress && 
             matchesDateFrom && 
             matchesDateTo
    })
  }, [searchTerm, filterValues])

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedRows(newExpanded)
  }

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return 'default'
    if (action.includes('UPDATE')) return 'secondary'
    if (action.includes('DELETE')) return 'destructive'
    if (action.includes('FAILED')) return 'destructive'
    if (action.includes('LOGIN')) return 'default'
    return 'outline'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    import('../../utils/export-utils').then(({ exportAuditLogs }) => {
      exportAuditLogs(filteredLogs, format)
    }).catch((error) => {
      console.error('Export failed:', error)
    })
  }

  const handleResetFilters = () => {
    setFilterValues({})
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Audit Logs
          </CardTitle>
          <ExportButton
            data={filteredLogs}
            filename="audit_logs"
            onExport={handleExport}
            formats={['csv', 'json']}
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Advanced Filters */}
        <FilterPanel
          filters={filterConfigs}
          values={filterValues}
          onChange={setFilterValues}
          onReset={handleResetFilters}
          searchPlaceholder="Search audit logs by action, user, resource, or IP..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          className="mb-6"
        />

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {paginatedLogs.length} of {filteredLogs.length} audit logs
          </p>
        </div>

        {/* Audit Logs Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">&nbsp;</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => toggleRowExpansion(log.id)}>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                        {expandedRows.has(log.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTimestamp(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{log.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadge(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.resource_type}</span>
                      {log.resource_id && (
                        <span className="text-xs text-gray-500 block">{log.resource_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address}
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action.includes('FAILED') ? 'destructive' : 'default'}>
                        {log.action.includes('FAILED') ? 'Failed' : 'Success'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(log.id) && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <div className="p-4">
                          <h4 className="text-sm font-medium mb-2">Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">User Agent:</span>
                              <p className="text-gray-600 break-all">{log.user_agent}</p>
                            </div>
                            <div>
                              <span className="font-medium">Additional Details:</span>
                              <pre className="text-gray-600 mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}