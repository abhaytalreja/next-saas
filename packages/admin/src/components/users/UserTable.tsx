'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AdminUser, PaginationParams } from '../../types'
import { adminService } from '../../lib/admin-service'
import { 
  MoreHorizontal, 
  User, 
  Mail, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Button } from '@nextsaas/ui'

interface UserTableProps {
  users: AdminUser[]
  loading: boolean
  error: Error | null
  pagination: PaginationParams
  total: number
  selectedUsers: string[]
  onPageChange: (page: number) => void
  onSortChange: (sort: string, order: 'asc' | 'desc') => void
  onRefresh: () => void
  onSelectionChange: (selectedIds: string[]) => void
}

export function UserTable({
  users,
  loading,
  error,
  pagination,
  total,
  selectedUsers,
  onPageChange,
  onSortChange,
  onRefresh,
  onSelectionChange
}: UserTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(users.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId))
    } else {
      onSelectionChange([...selectedUsers, userId])
    }
  }

  const handleUserAction = async (action: string, userId: string, reason?: string) => {
    try {
      setActionLoading(`${action}-${userId}`)
      
      switch (action) {
        case 'suspend':
          await adminService.suspendUser(userId, reason)
          break
        case 'activate':
          await adminService.activateUser(userId)
          break
        case 'delete':
          await adminService.deleteUser(userId)
          break
      }
      
      onRefresh()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      // TODO: Show toast notification
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
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      invited: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status}
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
          <div className="text-red-600 mb-2">Error loading users</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={onRefresh}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organizations
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_seen_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Seen</span>
                  {getSortIcon('last_seen_at')}
                </div>
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar_url ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar_url}
                          alt={user.name || user.email}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'No name'}
                        {user.is_system_admin && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {user.organizations.length > 0 ? (
                      <div className="space-y-1">
                        {user.organizations.slice(0, 2).map((org) => (
                          <div key={org.id} className="flex items-center">
                            <span className="text-gray-900">{org.name}</span>
                            <span className="ml-2 text-xs text-gray-500">({org.role})</span>
                          </div>
                        ))}
                        {user.organizations.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{user.organizations.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No organizations</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.last_seen_at ? (
                    new Date(user.last_seen_at).toLocaleDateString()
                  ) : (
                    'Never'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {user.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction('suspend', user.id)}
                        disabled={actionLoading === `suspend-${user.id}`}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction('activate', user.id)}
                        disabled={actionLoading === `activate-${user.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction('delete', user.id)}
                      disabled={actionLoading === `delete-${user.id}`}
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
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}