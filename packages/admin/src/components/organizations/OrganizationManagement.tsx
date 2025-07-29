'use client'

import React, { useState } from 'react'
import { OrganizationTable } from './OrganizationTable'
import { useOrganizationManagement } from '../../hooks/useOrganizationManagement'
import { OrganizationFilters, PaginationParams } from '../../types'
import { Search, Plus, Download, RefreshCw } from 'lucide-react'
import { Button } from '@nextsaas/ui'

export function OrganizationManagement() {
  const [filters, setFilters] = useState<OrganizationFilters>({})
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sort: 'created_at',
    order: 'desc'
  })

  const { data: organizations, isLoading, error, total, refetch } = useOrganizationManagement(filters, pagination)

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
    setPagination({ ...pagination, page: 1 })
  }

  const handleFilterChange = (key: keyof OrganizationFilters, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleSortChange = (sort: string, order: 'asc' | 'desc') => {
    setPagination({ ...pagination, sort, order, page: 1 })
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export organizations')
  }

  const handleCreateOrganization = () => {
    // TODO: Open create organization modal
    console.log('Create organization')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all organizations across your platform.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateOrganization}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations by name or slug..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>

            {/* Plan Filter */}
            <select
              value={filters.plan || ''}
              onChange={(e) => handleFilterChange('plan', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, total)} of {total} organizations
            </span>
            <span>
              Page {pagination.page} of {Math.ceil(total / pagination.limit)}
            </span>
          </div>
        </div>

        {/* Organization Table */}
        <OrganizationTable
          organizations={organizations || []}
          loading={isLoading}
          error={error}
          pagination={pagination}
          total={total}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onRefresh={refetch}
        />
      </div>
    </div>
  )
}