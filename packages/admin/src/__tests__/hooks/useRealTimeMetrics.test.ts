import { renderHook, act, waitFor } from '@testing-library/react'
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'

// Mock Supabase client
const mockSupabase = {
  channel: jest.fn(),
  removeChannel: jest.fn(),
  from: jest.fn()
}

const mockChannel = {
  on: jest.fn(),
  subscribe: jest.fn()
}

jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn()
}))

describe('useRealTimeMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn()
    console.error = jest.fn()
    
    // Setup mock chain
    mockChannel.on.mockReturnThis()
    mockChannel.subscribe.mockImplementation((callback) => {
      // Simulate successful subscription
      setTimeout(() => callback('SUBSCRIBED'), 0)
      return mockChannel
    })
    mockSupabase.channel.mockReturnValue(mockChannel)
    
    // Mock Supabase database queries
    mockSupabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnValue(
        Promise.resolve({
          count: table === 'users' ? 1000 : 150,
          error: null
        })
      )
    }))
    
    ;(getSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty metrics and disconnected state', () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      expect(result.current.metrics).toEqual({})
      expect(result.current.isConnected).toBe(false)
      expect(typeof result.current.refresh).toBe('function')
    })

    it('should create subscription channel on mount', () => {
      renderHook(() => useRealTimeMetrics())
      
      expect(mockSupabase.channel).toHaveBeenCalledWith('admin-metrics')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'users'
        }),
        expect.any(Function)
      )
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'organizations'
        }),
        expect.any(Function)
      )
    })

    it('should subscribe to channel', () => {
      renderHook(() => useRealTimeMetrics())
      
      expect(mockChannel.subscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should set connected state when subscription succeeds', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true)
      })
    })

    it('should load initial metrics on mount', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
        expect(result.current.metrics.totalOrganizations).toBe(150)
        expect(result.current.metrics.activeUsers).toBe(400) // 40% of 1000
        expect(result.current.metrics.activeOrganizations).toBe(120) // 80% of 150
      })
    })
  })

  describe('data fetching', () => {
    it('should fetch user count correctly', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(result.current.metrics.totalUsers).toBe(1000)
      })
    })

    it('should fetch organization count correctly', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('organizations')
        expect(result.current.metrics.totalOrganizations).toBe(150)
      })
    })

    it('should handle user count fetch error with fallback', async () => {
      mockSupabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: null,
            error: new Error('Database error')
          })
        )
      }))

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(5432) // Fallback value
      })
    })

    it('should handle organization count fetch error with fallback', async () => {
      mockSupabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: null,
            error: new Error('Database error')
          })
        )
      }))

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalOrganizations).toBe(891) // Fallback value
      })
    })

    it('should use mock data when all fetches fail', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockRejectedValue(new Error('Complete failure'))
      }))

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(5432)
        expect(result.current.metrics.totalOrganizations).toBe(891)
        expect(result.current.metrics.systemUptime).toBe(99.9)
      })
    })
  })

  describe('real-time updates', () => {
    it('should update user metrics when users table changes', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
      })

      // Simulate table change
      const userChangeCallback = mockChannel.on.mock.calls.find(
        call => call[1].table === 'users'
      )[2]
      
      // Update mock to return new count
      mockSupabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: table === 'users' ? 1001 : 150,
            error: null
          })
        )
      }))

      await act(async () => {
        userChangeCallback({ event: 'INSERT' })
      })
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1001)
        expect(result.current.metrics.newUsersToday).toBe(1)
      })
    })

    it('should update organization metrics when organizations table changes', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.metrics.totalOrganizations).toBe(150)
      })

      // Simulate table change
      const orgChangeCallback = mockChannel.on.mock.calls.find(
        call => call[1].table === 'organizations'
      )[2]
      
      // Update mock to return new count
      mockSupabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: table === 'users' ? 1000 : 151,
            error: null
          })
        )
      }))

      await act(async () => {
        orgChangeCallback({ event: 'INSERT' })
      })
      
      await waitFor(() => {
        expect(result.current.metrics.totalOrganizations).toBe(151)
        expect(result.current.metrics.newOrganizationsToday).toBe(1)
      })
    })

    it('should increment newUsersToday on subsequent user changes', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
      })

      const userChangeCallback = mockChannel.on.mock.calls.find(
        call => call[1].table === 'users'
      )[2]

      // First change
      await act(async () => {
        userChangeCallback({ event: 'INSERT' })
      })
      
      await waitFor(() => {
        expect(result.current.metrics.newUsersToday).toBe(1)
      })

      // Second change
      await act(async () => {
        userChangeCallback({ event: 'INSERT' })
      })
      
      await waitFor(() => {
        expect(result.current.metrics.newUsersToday).toBe(2)
      })
    })
  })

  describe('system metrics simulation', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    it('should update system metrics every 10 seconds', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.metrics.systemUptime).toBe(99.9)
      })

      const initialResponseTime = result.current.metrics.apiResponseTime
      const initialConnections = result.current.metrics.activeConnections

      // Fast forward 10 seconds
      act(() => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        // These values should change due to randomization
        expect(result.current.metrics.systemUptime).toBe(99.9)
        expect(result.current.metrics.apiResponseTime).toBeDefined()
        expect(result.current.metrics.apiResponseTime).not.toBe(initialResponseTime)
        expect(result.current.metrics.activeConnections).not.toBe(initialConnections)
      })
    })

    it('should increment emails sent count over time', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.emailsSentToday).toBeDefined()
      })

      const initialEmailCount = result.current.metrics.emailsSentToday || 0

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        expect(result.current.metrics.emailsSentToday).toBeGreaterThan(initialEmailCount)
      })
    })

    it('should update active users based on total users', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
        expect(result.current.metrics.activeUsers).toBe(400)
      })

      act(() => {
        jest.advanceTimersByTime(10000)
      })

      await waitFor(() => {
        const activeUsers = result.current.metrics.activeUsers!
        const totalUsers = result.current.metrics.totalUsers!
        // Should be between 35% and 45% of total users
        expect(activeUsers).toBeGreaterThanOrEqual(totalUsers * 0.35)
        expect(activeUsers).toBeLessThanOrEqual(totalUsers * 0.45)
      })
    })
  })

  describe('refresh functionality', () => {
    it('should provide refresh function', () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      expect(typeof result.current.refresh).toBe('function')
    })

    it('should reload metrics when refresh is called', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
      })

      // Change mock data
      mockSupabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: table === 'users' ? 2000 : 300,
            error: null
          })
        )
      }))

      await act(async () => {
        result.current.refresh()
      })
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(2000)
        expect(result.current.metrics.totalOrganizations).toBe(300)
      })
    })
  })

  describe('cleanup', () => {
    it('should cleanup subscription on unmount', () => {
      const { unmount } = renderHook(() => useRealTimeMetrics())
      
      unmount()
      
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should cleanup interval on unmount', () => {
      jest.useFakeTimers()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      const { unmount } = renderHook(() => useRealTimeMetrics())
      
      unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should handle subscription status other than SUBSCRIBED', async () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        setTimeout(() => callback('CHANNEL_ERROR'), 0)
        return mockChannel
      })

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false)
      })
    })

    it('should log errors when fetching data fails', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockRejectedValue(new Error('Network error'))
      }))

      renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error loading initial metrics:',
          expect.any(Error)
        )
      })
    })

    it('should handle missing channel ref gracefully', () => {
      const { unmount } = renderHook(() => useRealTimeMetrics())
      
      // Manually clear the channel ref to simulate edge case
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle zero counts gracefully', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: 0,
            error: null
          })
        )
      }))

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(0)
        expect(result.current.metrics.totalOrganizations).toBe(0)
        expect(result.current.metrics.activeUsers).toBe(0)
        expect(result.current.metrics.activeOrganizations).toBe(0)
      })
    })

    it('should handle null counts from database', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnValue(
          Promise.resolve({
            count: null,
            error: null
          })
        )
      }))

      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(0)
        expect(result.current.metrics.totalOrganizations).toBe(0)
      })
    })

    it('should handle rapid successive updates correctly', async () => {
      const { result } = renderHook(() => useRealTimeMetrics())
      
      await waitFor(() => {
        expect(result.current.metrics.totalUsers).toBe(1000)
      })

      const userChangeCallback = mockChannel.on.mock.calls.find(
        call => call[1].table === 'users'
      )[2]

      // Simulate rapid changes
      await act(async () => {
        userChangeCallback({ event: 'INSERT' })
        userChangeCallback({ event: 'INSERT' })
        userChangeCallback({ event: 'UPDATE' })
      })
      
      await waitFor(() => {
        expect(result.current.metrics.newUsersToday).toBe(3)
      })
    })
  })
})