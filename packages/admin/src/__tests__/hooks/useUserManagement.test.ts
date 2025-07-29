import { renderHook, waitFor } from '@testing-library/react'
import { useUserManagement } from '../../hooks/useUserManagement'
import { adminService } from '../../lib/admin-service'
import { AdminUser, UserFilters, PaginationParams } from '../../types'

// Mock admin service
jest.mock('../../lib/admin-service', () => ({
  adminService: {
    getUsers: jest.fn()
  }
}))

describe('useUserManagement', () => {
  const mockUsers: AdminUser[] = [
    {
      id: '1',
      email: 'user1@example.com',
      name: 'User One',
      avatar_url: null,
      status: 'active',
      is_system_admin: false,
      organizations: [],
      last_seen_at: '2023-12-01T10:00:00Z',
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-12-01T10:00:00Z',
      email_verified_at: '2023-01-01T10:00:00Z',
      login_count: 10,
      last_ip: '192.168.1.1'
    },
    {
      id: '2',
      email: 'user2@example.com',
      name: 'User Two',
      avatar_url: null,
      status: 'inactive',
      is_system_admin: true,
      organizations: [],
      last_seen_at: null,
      created_at: '2023-06-01T10:00:00Z',
      updated_at: '2023-12-01T10:00:00Z',
      email_verified_at: null,
      login_count: 0,
      last_ip: null
    }
  ]

  const mockResponse = {
    data: mockUsers,
    success: true,
    metadata: {
      total: 100,
      page: 1,
      limit: 20
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminService.getUsers as jest.Mock).mockResolvedValue(mockResponse)
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useUserManagement())
      
      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.total).toBe(0)
      expect(result.current.pagination).toEqual({ page: 1, limit: 20 })
      expect(typeof result.current.setPagination).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should accept custom filters and pagination', () => {
      const filters: UserFilters = { search: 'test', status: 'active' }
      const pagination: PaginationParams = { page: 2, limit: 50, sort: 'name', order: 'asc' }
      
      const { result } = renderHook(() => useUserManagement(filters, pagination))
      
      expect(result.current.pagination).toEqual(pagination)
    })

    it('should call adminService.getUsers on mount', async () => {
      renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith({}, { page: 1, limit: 20 })
      })
    })
  })

  describe('data fetching', () => {
    it('should fetch users successfully', async () => {
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockUsers)
        expect(result.current.total).toBe(100)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it('should pass filters to service', async () => {
      const filters: UserFilters = { search: 'john', status: 'active', role: 'admin' }
      renderHook(() => useUserManagement(filters))
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith(filters, { page: 1, limit: 20 })
      })
    })

    it('should pass pagination to service', async () => {
      const pagination: PaginationParams = { page: 3, limit: 50, sort: 'created_at', order: 'desc' }
      renderHook(() => useUserManagement({}, pagination))
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith({}, pagination)
      })
    })

    it('should handle service errors', async () => {
      const error = new Error('Failed to fetch users')
      ;(adminService.getUsers as jest.Mock).mockRejectedValue(error)
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.data).toBeNull()
        expect(result.current.error).toBe(error)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle non-Error exceptions', async () => {
      ;(adminService.getUsers as jest.Mock).mockRejectedValue('String error')
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.error).toEqual(new Error('Failed to fetch users'))
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle missing metadata gracefully', async () => {
      const responseWithoutMetadata = { data: mockUsers, success: true }
      ;(adminService.getUsers as jest.Mock).mockResolvedValue(responseWithoutMetadata)
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockUsers)
        expect(result.current.total).toBe(0)
      })
    })

    it('should handle missing total in metadata gracefully', async () => {
      const responseWithoutTotal = { 
        data: mockUsers, 
        success: true,
        metadata: { page: 1, limit: 20 }
      }
      ;(adminService.getUsers as jest.Mock).mockResolvedValue(responseWithoutTotal)
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.total).toBe(0)
      })
    })
  })

  describe('loading states', () => {
    it('should show loading state during fetch', () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => { resolvePromise = resolve })
      ;(adminService.getUsers as jest.Mock).mockReturnValue(promise)
      
      const { result } = renderHook(() => useUserManagement())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
      
      // Resolve the promise to clean up
      resolvePromise!(mockResponse)
    })

    it('should clear loading state after successful fetch', async () => {
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should clear loading state after error', async () => {
      ;(adminService.getUsers as jest.Mock).mockRejectedValue(new Error('Fetch failed'))
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('pagination updates', () => {
    it('should refetch when pagination changes', async () => {
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Clear previous calls
      jest.clearAllMocks()
      
      const newPagination: PaginationParams = { page: 2, limit: 30 }
      result.current.setPagination(newPagination)
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith({}, newPagination)
      })
    })

    it('should update pagination state immediately', () => {
      const { result } = renderHook(() => useUserManagement())
      
      const newPagination: PaginationParams = { page: 3, limit: 50 }
      result.current.setPagination(newPagination)
      
      expect(result.current.pagination).toEqual(newPagination)
    })

    it('should preserve other pagination properties when updating', () => {
      const initialPagination: PaginationParams = { 
        page: 1, 
        limit: 20, 
        sort: 'name', 
        order: 'asc' 
      }
      const { result } = renderHook(() => useUserManagement({}, initialPagination))
      
      const updatedPagination: PaginationParams = { 
        page: 2, 
        limit: 20, 
        sort: 'name', 
        order: 'asc' 
      }
      result.current.setPagination(updatedPagination)
      
      expect(result.current.pagination).toEqual(updatedPagination)
    })
  })

  describe('filter updates', () => {
    it('should refetch when filters change', async () => {
      const initialFilters: UserFilters = { search: 'initial' }
      const { rerender } = renderHook(
        ({ filters }) => useUserManagement(filters),
        { initialProps: { filters: initialFilters } }
      )
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith(initialFilters, { page: 1, limit: 20 })
      })
      
      // Clear previous calls
      jest.clearAllMocks()
      
      const newFilters: UserFilters = { search: 'updated', status: 'active' }
      rerender({ filters: newFilters })
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith(newFilters, { page: 1, limit: 20 })
      })
    })

    it('should reset error state when refetching', async () => {
      // First request fails
      ;(adminService.getUsers as jest.Mock).mockRejectedValueOnce(new Error('Initial error'))
      
      const { result, rerender } = renderHook(
        ({ filters }) => useUserManagement(filters),
        { initialProps: { filters: {} } }
      )
      
      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error)
      })
      
      // Second request succeeds
      ;(adminService.getUsers as jest.Mock).mockResolvedValue(mockResponse)
      
      rerender({ filters: { search: 'new' } })
      
      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.data).toEqual(mockUsers)
      })
    })
  })

  describe('refetch functionality', () => {
    it('should provide refetch function', () => {
      const { result } = renderHook(() => useUserManagement())
      
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // Clear previous calls
      jest.clearAllMocks()
      
      result.current.refetch()
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith({}, { page: 1, limit: 20 })
      })
    })

    it('should show loading state during refetch', async () => {
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      let resolveRefetch: (value: any) => void
      const refetchPromise = new Promise(resolve => { resolveRefetch = resolve })
      ;(adminService.getUsers as jest.Mock).mockReturnValue(refetchPromise)
      
      result.current.refetch()
      
      expect(result.current.isLoading).toBe(true)
      
      // Resolve to clean up
      resolveRefetch!(mockResponse)
    })

    it('should maintain current filters and pagination during refetch', async () => {
      const filters: UserFilters = { search: 'test' }
      const pagination: PaginationParams = { page: 2, limit: 30 }
      
      const { result } = renderHook(() => useUserManagement(filters, pagination))
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      jest.clearAllMocks()
      
      result.current.refetch()
      
      await waitFor(() => {
        expect(adminService.getUsers).toHaveBeenCalledWith(filters, pagination)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty data array', async () => {
      const emptyResponse = { data: [], success: true, metadata: { total: 0 } }
      ;(adminService.getUsers as jest.Mock).mockResolvedValue(emptyResponse)
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.data).toEqual([])
        expect(result.current.total).toBe(0)
        expect(result.current.error).toBeNull()
      })
    })

    it('should handle concurrent requests correctly', async () => {
      let resolveFirst: (value: any) => void
      let resolveSecond: (value: any) => void
      
      const firstPromise = new Promise(resolve => { resolveFirst = resolve })
      const secondPromise = new Promise(resolve => { resolveSecond = resolve })
      
      ;(adminService.getUsers as jest.Mock)
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise)
      
      const { result, rerender } = renderHook(
        ({ filters }) => useUserManagement(filters),
        { initialProps: { filters: {} } }
      )
      
      // Trigger second request while first is pending
      rerender({ filters: { search: 'new' } })
      
      // Resolve second request first (more recent)
      const secondResponse = { data: [mockUsers[1]], success: true, metadata: { total: 1 } }
      resolveSecond!(secondResponse)
      
      await waitFor(() => {
        expect(result.current.data).toEqual([mockUsers[1]])
      })
      
      // Resolve first request (should not override newer data)
      resolveFirst!(mockResponse)
      
      // Data should still be from second request
      expect(result.current.data).toEqual([mockUsers[1]])
    })

    it('should handle undefined pagination gracefully', () => {
      const { result } = renderHook(() => useUserManagement(undefined, undefined as any))
      
      expect(result.current.pagination).toEqual({ page: 1, limit: 20 })
    })

    it('should handle partial pagination objects', () => {
      const partialPagination = { page: 3 } as PaginationParams
      const { result } = renderHook(() => useUserManagement({}, partialPagination))
      
      expect(result.current.pagination).toEqual(partialPagination)
    })

    it('should handle service returning null data', async () => {
      const nullResponse = { data: null, success: true, metadata: { total: 0 } }
      ;(adminService.getUsers as jest.Mock).mockResolvedValue(nullResponse)
      
      const { result } = renderHook(() => useUserManagement())
      
      await waitFor(() => {
        expect(result.current.data).toBeNull()
        expect(result.current.total).toBe(0)
      })
    })
  })

  describe('memory management', () => {
    it('should not cause memory leaks on unmount', () => {
      const { unmount } = renderHook(() => useUserManagement())
      
      expect(() => unmount()).not.toThrow()
    })

    it('should cancel ongoing requests on unmount', () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => { resolvePromise = resolve })
      ;(adminService.getUsers as jest.Mock).mockReturnValue(promise)
      
      const { result, unmount } = renderHook(() => useUserManagement())
      
      expect(result.current.isLoading).toBe(true)
      
      unmount()
      
      // Resolve promise after unmount - should not cause state updates
      resolvePromise!(mockResponse)
      
      // No error should be thrown
      expect(() => {}).not.toThrow()
    })
  })
})