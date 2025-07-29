'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminOrganization, PaginationParams } from '../../types'
import { adminService } from '../../lib/admin-service'
import { 
  MoreHorizontal, 
  Building, 
  Users, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign
} from 'lucide-react'
import { Button } from '@nextsaas/ui'

interface OrganizationTableProps {
  organizations: AdminOrganization[]
  loading: boolean
  error: Error | null
  pagination: PaginationParams
  total: number
  onPageChange: (page: number) => void
  onSortChange: (sort: string, order: 'asc' | 'desc') => void
  onRefresh: () => void
}

export function OrganizationTable({
  organizations,
  loading,
  error,
  pagination,
  total,
  onPageChange,
  onSortChange,
  onRefresh
}: OrganizationTableProps) {
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleSelectAll = () => {
    if (selectedOrganizations.length === organizations.length) {
      setSelectedOrganizations([])
    } else {
      setSelectedOrganizations(organizations.map(org => org.id))
    }
  }

  const handleSelectOrganization = (orgId: string) => {
    if (selectedOrganizations.includes(orgId)) {
      setSelectedOrganizations(selectedOrganizations.filter(id => id !== orgId))
    } else {
      setSelectedOrganizations([...selectedOrganizations, orgId])
    }
  }

  const handleOrganizationAction = async (action: string, orgId: string, reason?: string) => {
    try {
      setActionLoading(`${action}-${orgId}`)
      
      switch (action) {
        case 'suspend':
          // TODO: Implement suspend organization
          console.log('Suspend organization:', orgId, reason)
          break
        case 'activate':
          // TODO: Implement activate organization
          console.log('Activate organization:', orgId)
          break
        case 'delete':
          // TODO: Implement delete organization
          console.log('Delete organization:', orgId)
          break
      }
      
      onRefresh()
    } catch (error) {
      console.error(`Error ${action} organization:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSort = (field: string) => {
    const newOrder = pagination.sort === field && pagination.order === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newOrder)
  }

  const getSortIcon = (field: string) => {
    if (pagination.sort !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return pagination.order === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      deleted: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.active}`}>
        {status}
      </span>
    )
  }

  const getPlanBadge = (plan: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan as keyof typeof styles] || styles.free}`}>
        {plan}
      </span>
    )
  }

  const totalPages = Math.ceil(total / pagination.limit)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading organizations</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onRefresh}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Bulk Actions */}
      {selectedOrganizations.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedOrganizations.length} organization{selectedOrganizations.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('Bulk suspend')}
              >
                <Ban className="h-4 w-4 mr-1" />
                Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedOrganizations([])}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrganizations.length === organizations.length && organizations.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Organization</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrganizations.includes(org.id)}
                    onChange={() => handleSelectOrganization(org.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {org.name}
                      </div>
                      <div className="text-sm text-gray-500">/{org.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(org.status)}
                </td>
                <td className="px-6 py-4">
                  {getPlanBadge(org.plan)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    {org.member_count}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                    ${org.monthly_revenue.toFixed(0)}/mo
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(org.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link href={`/admin/organizations/${org.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {org.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOrganizationAction('suspend', org.id)}
                        disabled={actionLoading === `suspend-${org.id}`}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOrganizationAction('activate', org.id)}
                        disabled={actionLoading === `activate-${org.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOrganizationAction('delete', org.id)}
                      disabled={actionLoading === `delete-${org.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, total)} of {total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === pagination.page ? "default" : "outline"}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {organizations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}