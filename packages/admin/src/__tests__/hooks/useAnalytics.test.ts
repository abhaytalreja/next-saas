import { renderHook, act, waitFor } from '@testing-library/react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { analyticsService } from '../../lib/analytics-service'

// Mock the analytics service
jest.mock('../../lib/analytics-service', () => ({
  analyticsService: {
    getAnalytics: jest.fn(),
    getMetrics: jest.fn()
  }
}))

const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>

describe('useAnalytics', () => {
  const mockAnalyticsData = {
    userGrowth: [
      { date: '2023-01-01', value: 100, label: 'Jan 1' },
      { date: '2023-01-02', value: 120, label: 'Jan 2' }
    ],
    revenueGrowth: [
      { date: '2023-01-01', value: 5000, label: 'Jan 1' },
      { date: '2023-01-02', value: 5500, label: 'Jan 2' }
    ],
    organizationGrowth: [
      { date: '2023-01-01', value: 20, label: 'Jan 1' },
      { date: '2023-01-02', value: 22, label: 'Jan 2' }
    ],
    engagementMetrics: [
      { date: '2023-01-01', value: 75, label: 'Jan 1' },
      { date: '2023-01-02', value: 78, label: 'Jan 2' }
    ]
  }

  const mockMetricsData = {
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
    mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData)
    mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.refetch).toBe('function')
    })

    it('should use default date range of 30d', async () => {
      renderHook(() => useAnalytics())

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('30d')
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith('30d')
    })

    it('should use custom date range', async () => {
      renderHook(() => useAnalytics('7d'))

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('7d')
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith('7d')
    })
  })

  describe('data fetching', () => {
    it('should fetch analytics data successfully', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        ...mockAnalyticsData,
        metrics: mockMetricsData
      })
      expect(result.current.error).toBeNull()
    })

    it('should handle analytics service error', async () => {
      const error = new Error('Analytics service error')
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(error)
    })

    it('should handle metrics service error', async () => {
      const error = new Error('Metrics service error')
      mockAnalyticsService.getMetrics.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(error)
    })

    it('should handle non-Error exceptions', async () => {
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce('String error')

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(new Error('Failed to fetch analytics'))
    })

    it('should handle partial service failures', async () => {
      const analyticsError = new Error('Analytics failed')
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce(analyticsError)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(analyticsError)
    })
  })

  describe('date range changes', () => {
    it('should refetch data when date range changes', async () => {
      const { result, rerender } = renderHook(
        ({ dateRange }) => useAnalytics(dateRange),
        { initialProps: { dateRange: '30d' as const } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('30d')
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith('30d')

      // Clear mocks to track new calls
      jest.clearAllMocks()
      mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)

      // Change date range
      rerender({ dateRange: '7d' as const })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('7d')
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith('7d')
    })

    it('should handle all supported date ranges', async () => {
      const dateRanges = ['7d', '30d', '90d', '1y'] as const

      for (const dateRange of dateRanges) {
        jest.clearAllMocks()
        mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData)
        mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)

        const { result } = renderHook(() => useAnalytics(dateRange))

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith(dateRange)
        expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith(dateRange)
        expect(result.current.data).toEqual({
          ...mockAnalyticsData,
          metrics: mockMetricsData
        })
      }
    })
  })

  describe('refetch functionality', () => {
    it('should refetch data manually', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1)
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledTimes(1)

      // Clear mocks and setup new responses
      jest.clearAllMocks()
      const newAnalyticsData = {
        ...mockAnalyticsData,
        userGrowth: [{ date: '2023-01-03', value: 130, label: 'Jan 3' }]
      }
      mockAnalyticsService.getAnalytics.mockResolvedValue(newAnalyticsData)
      mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)

      // Trigger refetch
      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1)
      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual({
        ...newAnalyticsData,
        metrics: mockMetricsData
      })
    })

    it('should handle refetch errors', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Setup error for refetch
      const refetchError = new Error('Refetch failed')
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce(refetchError)

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
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce(new Error('Initial error'))

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeNull()

      // Setup successful refetch
      mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.data).toEqual({
        ...mockAnalyticsData,
        metrics: mockMetricsData
      })
    })
  })

  describe('loading states', () => {
    it('should show loading state during initial fetch', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should show loading state during refetch', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should show loading state during date range change', async () => {
      const { result, rerender } = renderHook(
        ({ dateRange }) => useAnalytics(dateRange),
        { initialProps: { dateRange: '30d' as const } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      rerender({ dateRange: '7d' as const })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('data structure', () => {
    it('should merge analytics and metrics data correctly', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        userGrowth: mockAnalyticsData.userGrowth,
        revenueGrowth: mockAnalyticsData.revenueGrowth,
        organizationGrowth: mockAnalyticsData.organizationGrowth,
        engagementMetrics: mockAnalyticsData.engagementMetrics,
        metrics: mockMetricsData
      })
    })

    it('should handle empty analytics data', async () => {
      const emptyAnalyticsData = {
        userGrowth: [],
        revenueGrowth: [],
        organizationGrowth: [],
        engagementMetrics: []
      }

      mockAnalyticsService.getAnalytics.mockResolvedValue(emptyAnalyticsData)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        ...emptyAnalyticsData,
        metrics: mockMetricsData
      })
    })

    it('should handle partial analytics data', async () => {
      const partialAnalyticsData = {
        userGrowth: mockAnalyticsData.userGrowth,
        revenueGrowth: [],
        organizationGrowth: mockAnalyticsData.organizationGrowth,
        engagementMetrics: []
      }

      mockAnalyticsService.getAnalytics.mockResolvedValue(partialAnalyticsData)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        ...partialAnalyticsData,
        metrics: mockMetricsData
      })
    })
  })

  describe('edge cases', () => {
    it('should handle Promise.all rejection correctly', async () => {
      const analyticsError = new Error('Analytics failed')
      const metricsError = new Error('Metrics failed')
      
      mockAnalyticsService.getAnalytics.mockRejectedValueOnce(analyticsError)
      mockAnalyticsService.getMetrics.mockRejectedValueOnce(metricsError)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should receive the first error encountered
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeInstanceOf(Error)
    })

    it('should handle concurrent refetch calls', async () => {
      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()
      mockAnalyticsService.getAnalytics.mockResolvedValue(mockAnalyticsData)
      mockAnalyticsService.getMetrics.mockResolvedValue(mockMetricsData)

      // Call refetch multiple times quickly
      act(() => {
        result.current.refetch()
        result.current.refetch()
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should still work correctly
      expect(result.current.data).toEqual({
        ...mockAnalyticsData,
        metrics: mockMetricsData
      })
    })

    it('should handle service returning null/undefined', async () => {
      mockAnalyticsService.getAnalytics.mockResolvedValue(null as any)
      mockAnalyticsService.getMetrics.mockResolvedValue(undefined as any)

      const { result } = renderHook(() => useAnalytics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({
        ...null,
        metrics: undefined
      })
    })
  })
})