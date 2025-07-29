import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { adminService } from '../../lib/admin-service'

// Mock the admin service
jest.mock('../../lib/admin-service', () => ({
  adminService: {
    getDashboardMetrics: jest.fn()
  }
}))

// Mock AbortController
global.AbortController = jest.fn(() => ({
  signal: {},
  abort: jest.fn()
})) as any

// Mock timers
jest.useFakeTimers()

const mockAdminService = adminService as jest.Mocked<typeof adminService>

describe('useAdminDashboard', () => {
  const mockMetrics = {
    totalUsers: 1000,
    activeUsers: 750,
    newUsersToday: 25,
    userGrowthRate: 12.5,
    userRetentionRate: 85.3,
    totalOrganizations: 150,
    activeOrganizations: 140,
    newOrganizationsToday: 3,
    organizationGrowthRate: 8.2,
    monthlyRecurringRevenue: 50000,
    totalRevenue: 1500000,
    averageRevenuePerUser: 89.50,
    revenueGrowthRate: 15.3,
    churnRate: 2.1,
    systemUptime: 99.9,
    apiResponseTime: 145,
    errorRate: 0.02,
    activeConnections: 500,
    emailsSentToday: 1250,
    emailDeliveryRate: 99.2,
    campaignsActive: 8,
    subscriberCount: 125000,
    recentActivity: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAdminService.getDashboardMetrics.mockResolvedValue(mockMetrics)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('initial state', () => {
    it('should have correct initial state', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.isRefreshing).toBe(false)
      expect(result.current.lastUpdated).toBeNull()
      expect(result.current.retryCount).toBe(0)
      expect(typeof result.current.refresh).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should fetch data on mount', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledWith({
        signal: expect.any(Object)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockMetrics)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeInstanceOf(Date)
      expect(result.current.retryCount).toBe(0)
    })
  })

  describe('data fetching', () => {
    it('should handle successful data fetch', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockMetrics)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeInstanceOf(Date)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Network error')
      mockAdminService.getDashboardMetrics.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(new Error('Failed to fetch dashboard data'))
      expect(result.current.lastUpdated).toBeNull()
    })

    it('should not set error for AbortError', async () => {
      const abortError = new Error('AbortError')
      abortError.name = 'AbortError'
      mockAdminService.getDashboardMetrics.mockRejectedValueOnce(abortError)

      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should not set error state for abort errors
      expect(result.current.error).toBeNull()
    })

    it('should retry on failure with exponential backoff', async () => {
      const error = new Error('Network error')
      mockAdminService.getDashboardMetrics
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockMetrics)

      const { result } = renderHook(() => useAdminDashboard())

      // Initial call
      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward through the retry delays
      act(() => {
        jest.advanceTimersByTime(2000) // First retry after 2s
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })

      act(() => {
        jest.advanceTimersByTime(4000) // Second retry after 4s
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(3)
      })

      act(() => {
        jest.advanceTimersByTime(8000) // Third retry after 8s
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(4)
        expect(result.current.data).toEqual(mockMetrics)
        expect(result.current.error).toBeNull()
      })
    })

    it('should give up after max retries', async () => {
      const error = new Error('Persistent error')
      mockAdminService.getDashboardMetrics.mockRejectedValue(error)

      const { result } = renderHook(() => useAdminDashboard())

      // Initial call + 3 retries = 4 total calls
      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward through all retry attempts
      act(() => {
        jest.advanceTimersByTime(2000) // First retry
      })
      
      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })

      act(() => {
        jest.advanceTimersByTime(4000) // Second retry
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(3)
      })

      act(() => {
        jest.advanceTimersByTime(8000) // Third retry
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(4)
        expect(result.current.error).toEqual(new Error('Failed to fetch dashboard data'))
        expect(result.current.data).toBeNull()
      })
    })
  })

  describe('refresh functionality', () => {
    it('should refresh data manually', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.refresh()
      })

      expect(result.current.isRefreshing).toBe(true)

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
    })

    it('should handle refresh errors', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const error = new Error('Refresh error')
      mockAdminService.getDashboardMetrics.mockRejectedValueOnce(error)

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false)
      })

      expect(result.current.error).toEqual(new Error('Failed to fetch dashboard data'))
    })
  })

  describe('auto-refresh', () => {
    it('should auto-refresh when enabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        refreshInterval: 5000,
        autoRefresh: true,
        enableRealTime: true
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward to trigger auto-refresh
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })
    })

    it('should not auto-refresh when disabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        autoRefresh: false
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward - should not trigger refresh
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)
    })

    it('should not auto-refresh when real-time is disabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        enableRealTime: false
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward - should not trigger refresh
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)
    })
  })

  describe('window focus handling', () => {
    beforeEach(() => {
      // Mock document visibility API
      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        value: 'visible'
      })
    })

    it('should refresh on window focus when real-time enabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        enableRealTime: true
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Simulate window focus
      act(() => {
        window.dispatchEvent(new Event('focus'))
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })
    })

    it('should refresh on visibility change when real-time enabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        enableRealTime: true
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Simulate visibility change
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible'
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })
    })

    it('should not refresh on focus when real-time disabled', async () => {
      const { result } = renderHook(() => useAdminDashboard({
        enableRealTime: false
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Simulate window focus
      act(() => {
        window.dispatchEvent(new Event('focus'))
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanup', () => {
    it('should cleanup intervals on unmount', async () => {
      const { result, unmount } = renderHook(() => useAdminDashboard({
        autoRefresh: true,
        enableRealTime: true
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      unmount()

      // Fast-forward - should not trigger refresh after unmount
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)
    })

    it('should abort pending requests on unmount', async () => {
      const abortController = {
        signal: {},
        abort: jest.fn()
      }
      
      // Mock AbortController constructor to return our mock
      ;(global.AbortController as jest.Mock).mockReturnValue(abortController)

      const { result, unmount } = renderHook(() => useAdminDashboard())

      // Don't wait for completion, unmount immediately
      unmount()

      expect(abortController.abort).toHaveBeenCalled()
    })
  })

  describe('options handling', () => {
    it('should use custom refresh interval', async () => {
      const customInterval = 10000
      const { result } = renderHook(() => useAdminDashboard({
        refreshInterval: customInterval,
        autoRefresh: true,
        enableRealTime: true
      }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward by less than custom interval
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(1)

      // Fast-forward to reach custom interval
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(mockAdminService.getDashboardMetrics).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle all options combinations', async () => {
      const options = {
        refreshInterval: 15000,
        enableRealTime: true,
        autoRefresh: true
      }

      const { result } = renderHook(() => useAdminDashboard(options))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockMetrics)
      expect(typeof result.current.refresh).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('error scenarios', () => {
    it('should handle service throwing non-Error objects', async () => {
      mockAdminService.getDashboardMetrics.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toEqual(new Error('Failed to fetch dashboard data'))
    })

    it('should handle concurrent refresh calls', async () => {
      const { result } = renderHook(() => useAdminDashboard())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Call refresh multiple times quickly
      act(() => {
        result.current.refresh()
        result.current.refresh()
        result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false)
      })

      // Should still work correctly
      expect(result.current.data).toEqual(mockMetrics)
    })
  })

  describe('edge cases', () => {
    it('should handle empty options object', async () => {
      const { result } = renderHook(() => useAdminDashboard({}))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockMetrics)
    })

    it('should handle undefined options', async () => {
      const { result } = renderHook(() => useAdminDashboard(undefined))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockMetrics)
    })

    it('should reset retry count on successful fetch after errors', async () => {
      mockAdminService.getDashboardMetrics
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockMetrics)

      const { result } = renderHook(() => useAdminDashboard())

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Trigger retry
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      // Wait for successful retry
      await waitFor(() => {
        expect(result.current.data).toEqual(mockMetrics)
        expect(result.current.error).toBeNull()
        expect(result.current.retryCount).toBe(0) // Should be reset
      })
    })
  })
})