'use client'

import { useState, useEffect } from 'react'
import { AdminOrganization, OrganizationFilters, PaginationParams, UseAdminHookReturn } from '../types'
import { adminService } from '../lib/admin-service'

export function useOrganizationManagement(
  filters: OrganizationFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
): UseAdminHookReturn<AdminOrganization[]> & {
  total: number
  pagination: PaginationParams
  setPagination: (params: PaginationParams) => void
} {
  const [data, setData] = useState<AdminOrganization[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPagination, setPagination] = useState(pagination)

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await adminService.getOrganizations(filters, currentPagination)
      setData(response.data)
      setTotal(response.metadata?.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch organizations'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [filters, currentPagination])

  return {
    data,
    isLoading,
    error,
    total,
    pagination: currentPagination,
    setPagination,
    refetch: fetchOrganizations
  }
}