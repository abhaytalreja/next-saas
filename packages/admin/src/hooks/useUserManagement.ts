'use client'

import { useState, useEffect } from 'react'
import { AdminUser, UserFilters, PaginationParams, UseAdminHookReturn } from '../types'
import { adminService } from '../lib/admin-service'

export function useUserManagement(
  filters: UserFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
): UseAdminHookReturn<AdminUser[]> & {
  total: number
  pagination: PaginationParams
  setPagination: (params: PaginationParams) => void
} {
  const [data, setData] = useState<AdminUser[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPagination, setPagination] = useState(pagination)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await adminService.getUsers(filters, currentPagination)
      setData(response.data)
      setTotal(response.metadata?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filters, currentPagination])

  return {
    data,
    isLoading,
    error,
    total,
    pagination: currentPagination,
    setPagination,
    refetch: fetchUsers
  }
}