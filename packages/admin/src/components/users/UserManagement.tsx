'use client'

import React, { useState } from 'react'
import { UserTable } from './UserTable'
import { useUserManagement } from '../../hooks/useUserManagement'
import { UserFilters, PaginationParams } from '../../types'
import { Search, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@nextsaas/ui'
import { ExportButton } from '../common/ExportButton'
import { BulkActions, createUserBulkActions } from '../common/BulkActions'

export function UserManagement() {
  const [filters, setFilters] = useState<UserFilters>({})
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sort: 'created_at',
    order: 'desc'
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const { data: users, isLoading, error, total, refetch } = useUserManagement(filters, pagination)

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search })
    setPagination({ ...pagination, page: 1 })
  }

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleSortChange = (sort: string, order: 'asc' | 'desc') => {
    setPagination({ ...pagination, sort, order, page: 1 })
  }

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    if (!users || users.length === 0) {
      console.warn('No users to export')
      return
    }

    // Import export functions dynamically to avoid bundle bloat
    import('../../utils/export-utils').then(({ exportUsers }) => {
      exportUsers(users, format)
    }).catch((error) => {
      console.error('Export failed:', error)
    })
  }

  const handleCreateUser = () => {
    // TODO: Open create user modal
    console.log('Create user')
  }

  // Bulk action handlers
  const handleBulkExport = (selectedIds: string[]) => {
    const selectedUserData = users?.filter(user => selectedIds.includes(user.id)) || []
    
    import('../../utils/export-utils').then(({ exportUsers }) => {
      exportUsers(selectedUserData, 'csv')
    }).catch((error) => {
      console.error('Bulk export failed:', error)
    })
  }

  const handleBulkSendEmail = (selectedIds: string[]) => {
    // TODO: Open bulk email modal
    console.log('Send email to selected users:', selectedIds)
  }

  const handleBulkActivate = async (selectedIds: string[]) => {
    // TODO: Implement bulk activate API call
    console.log('Activate users:', selectedIds)
  }

  const handleBulkSuspend = async (selectedIds: string[]) => {
    // TODO: Implement bulk suspend API call
    console.log('Suspend users:', selectedIds)
  }

  const handleBulkDelete = async (selectedIds: string[]) => {
    // TODO: Implement bulk delete API call
    console.log('Delete users:', selectedIds)
  }

  const bulkActions = createUserBulkActions(
    handleBulkExport,
    handleBulkSuspend,
    handleBulkActivate,
    handleBulkDelete,
    handleBulkSendEmail
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all users across your platform.
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
          <ExportButton
            data={users || []}
            filename="users"
            onExport={handleExport}
            formats={['csv', 'json', 'xlsx']}
            loading={isLoading}
          />
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
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
                placeholder="Search users by name or email..."
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
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>

            {/* Role Filter */}
            <select
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, total)} of {total} users
            </span>
            <span>
              Page {pagination.page} of {Math.ceil(total / pagination.limit)}
            </span>
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedIds={selectedUsers}
          onClearSelection={() => setSelectedUsers([])}
          actions={bulkActions}
        />

        {/* User Table */}
        <UserTable
          users={users || []}
          loading={isLoading}
          error={error}
          pagination={pagination}
          total={total}
          selectedUsers={selectedUsers}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onRefresh={refetch}
          onSelectionChange={setSelectedUsers}
        />
      </div>
    </div>
  )
}