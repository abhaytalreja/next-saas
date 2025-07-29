import { renderHook, act, waitFor } from '@testing-library/react'
import { useOrganizationManagement } from '../../hooks/useOrganizationManagement'
import { adminService } from '../../lib/admin-service'

// Mock the admin service
jest.mock('../../lib/admin-service', () => ({
  adminService: {
    getOrganizations: jest.fn()
  }
}))

const mockAdminService = adminService as jest.Mocked<typeof adminService>

describe('useOrganizationManagement', () => {
  const mockOrganizations = [
    {
      id: 'org-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      status: 'active' as const,
      plan: 'pro',
      member_count: 15,
      monthly_revenue: 2500,
      storage_used: 750,
      storage_limit: 1000,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-15T00:00:00Z',
      owner: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@acme.com'
      }
    },
    {
      id: 'org-2',
      name: 'Tech Startup',
      slug: 'tech-startup',
      status: 'active' as const,
      plan: 'starter',
      member_count: 5,
      monthly_revenue: 500,
      storage_used: 200,
      storage_limit: 500,
      created_at: '2023-01-10T00:00:00Z',
      updated_at: '2023-01-20T00:00:00Z',
      owner: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@techstartup.com'
      }
    }
  ]

  const mockApiResponse = {
    data: mockOrganizations,
    success: true,
    metadata: {
      total: 2,
      page: 1,
      limit: 20
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdminService.getOrganizations.mockResolvedValue(mockApiResponse)
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useOrganizationManagement())

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.total).toBe(0)
      expect(result.current.pagination).toEqual({ page: 1, limit: 20 })
      expect(typeof result.current.setPagination).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should use default pagination when none provided', async () => {
      renderHook(() => useOrganizationManagement())

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 20 }
      )
    })

    it('should use custom pagination when provided', async () => {
      const customPagination = { page: 2, limit: 10 }
      
      renderHook(() => useOrganizationManagement({}, customPagination))

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        {},
        customPagination
      )
    })

    it('should use custom filters when provided', async () => {
      const filters = { search: 'acme', status: 'active' }
      
      renderHook(() => useOrganizationManagement(filters))

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        filters,
        { page: 1, limit: 20 }
      )
    })
  })

  describe('data fetching', () => {
    it('should fetch organizations successfully', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockOrganizations)
      expect(result.current.total).toBe(2)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Network error')
      mockAdminService.getOrganizations.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(error)
      expect(result.current.total).toBe(0)
    })

    it('should handle non-Error exceptions', async () => {
      mockAdminService.getOrganizations.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(new Error('Failed to fetch organizations'))
    })

    it('should handle missing metadata gracefully', async () => {
      const responseWithoutMetadata = {
        data: mockOrganizations,
        success: true
      }
      mockAdminService.getOrganizations.mockResolvedValueOnce(responseWithoutMetadata as any)

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockOrganizations)
      expect(result.current.total).toBe(0) // Should default to 0
    })

    it('should handle partial metadata', async () => {
      const responseWithPartialMetadata = {
        data: mockOrganizations,
        success: true,
        metadata: {
          page: 1,
          limit: 20
          // total is missing
        }
      }
      mockAdminService.getOrganizations.mockResolvedValueOnce(responseWithPartialMetadata as any)

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockOrganizations)
      expect(result.current.total).toBe(0)
    })
  })

  describe('pagination handling', () => {
    it('should update pagination and refetch data', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledTimes(1)

      const newPagination = { page: 2, limit: 10 }
      
      act(() => {
        result.current.setPagination(newPagination)
      })

      expect(result.current.pagination).toEqual(newPagination)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith({}, newPagination)
      expect(mockAdminService.getOrganizations).toHaveBeenCalledTimes(2)
    })

    it('should handle pagination with sorting', async () => {
      const paginationWithSort = { 
        page: 1, 
        limit: 10, 
        sort: 'name', 
        order: 'asc' as const 
      }
      
      const { result } = renderHook(() => useOrganizationManagement({}, paginationWithSort))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith({}, paginationWithSort)
    })
  })

  describe('filter handling', () => {
    it('should refetch data when filters change', async () => {
      const initialFilters = { search: 'acme' }
      const { result, rerender } = renderHook(
        ({ filters }) => useOrganizationManagement(filters),
        { initialProps: { filters: initialFilters } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        initialFilters,
        { page: 1, limit: 20 }
      )

      // Clear mocks and set up new response
      jest.clearAllMocks()
      mockAdminService.getOrganizations.mockResolvedValue(mockApiResponse)

      const newFilters = { search: 'tech', status: 'active' }
      rerender({ filters: newFilters })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        newFilters,
        { page: 1, limit: 20 }
      )
    })

    it('should handle all filter types', async () => {
      const allFilters = {
        search: 'test search',
        status: 'suspended',
        plan: 'enterprise'
      }

      renderHook(() => useOrganizationManagement(allFilters))

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        allFilters,
        { page: 1, limit: 20 }
      )
    })

    it('should handle empty filters', async () => {
      renderHook(() => useOrganizationManagement({}))

      expect(mockAdminService.getOrganizations).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 20 }
      )
    })
  })

  describe('refetch functionality', () => {
    it('should refetch data manually', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledTimes(1)

      // Clear mocks and set up new response
      jest.clearAllMocks()
      const newMockResponse = {
        ...mockApiResponse,
        data: [...mockOrganizations, {
          id: 'org-3',
          name: 'New Company',
          slug: 'new-company',
          status: 'active' as const,
          plan: 'pro',
          member_count: 8,
          monthly_revenue: 1200,
          storage_used: 300,
          storage_limit: 1000,
          created_at: '2023-02-01T00:00:00Z',
          updated_at: '2023-02-01T00:00:00Z',
          owner: {
            id: 'user-3',
            name: 'Bob Wilson',
            email: 'bob@newcompany.com'
          }
        }],
        metadata: { ...mockApiResponse.metadata, total: 3 }
      }
      mockAdminService.getOrganizations.mockResolvedValue(newMockResponse)

      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getOrganizations).toHaveBeenCalledTimes(1)
      expect(result.current.data).toHaveLength(3)
      expect(result.current.total).toBe(3)
    })

    it('should handle refetch errors', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const refetchError = new Error('Refetch failed')
      mockAdminService.getOrganizations.mockRejectedValueOnce(refetchError)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toEqual(refetchError)
      expect(result.current.data).toBeNull()
    })

    it('should clear error state on successful refetch', async () => {
      // Start with an error
      mockAdminService.getOrganizations.mockRejectedValueOnce(new Error('Initial error'))

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeNull()

      // Setup successful refetch
      mockAdminService.getOrganizations.mockResolvedValue(mockApiResponse)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.data).toEqual(mockOrganizations)
    })
  })

  describe('loading states', () => {
    it('should show loading state during initial fetch', () => {
      const { result } = renderHook(() => useOrganizationManagement())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should show loading state during pagination change', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setPagination({ page: 2, limit: 10 })
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should show loading state during filter change', async () => {
      const { result, rerender } = renderHook(
        ({ filters }) => useOrganizationManagement(filters),
        { initialProps: { filters: {} } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      rerender({ filters: { search: 'new search' } })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty organization list', async () => {
      const emptyResponse = {
        data: [],
        success: true,
        metadata: {
          total: 0,
          page: 1,
          limit: 20
        }
      }
      mockAdminService.getOrganizations.mockResolvedValue(emptyResponse)

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
      expect(result.current.total).toBe(0)
    })

    it('should handle concurrent pagination changes', async () => {
      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Make multiple pagination changes quickly
      act(() => {
        result.current.setPagination({ page: 2, limit: 10 })
        result.current.setPagination({ page: 3, limit: 15 })
        result.current.setPagination({ page: 1, limit: 25 })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pagination).toEqual({ page: 1, limit: 25 })
    })

    it('should handle service returning null data', async () => {
      const nullDataResponse = {
        data: null,
        success: true,
        metadata: {
          total: 0,
          page: 1,
          limit: 20
        }
      }
      mockAdminService.getOrganizations.mockResolvedValue(nullDataResponse as any)

      const { result } = renderHook(() => useOrganizationManagement())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.total).toBe(0)
    })

    it('should preserve state during dependency changes', async () => {
      const { result, rerender } = renderHook(
        ({ filters, pagination }) => useOrganizationManagement(filters, pagination),
        { 
          initialProps: { 
            filters: { search: 'test' }, 
            pagination: { page: 1, limit: 10 } 
          } 
        }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialData = result.current.data
      const initialTotal = result.current.total

      // Change filters
      rerender({ 
        filters: { search: 'updated' }, 
        pagination: { page: 1, limit: 10 } 
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // State should be properly updated
      expect(result.current.data).toEqual(initialData) // Same mock response
      expect(result.current.total).toBe(initialTotal)
    })
  })
})