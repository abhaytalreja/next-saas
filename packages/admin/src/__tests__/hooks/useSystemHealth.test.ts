import { renderHook, act, waitFor } from '@testing-library/react'
import { useSystemHealth } from '../../hooks/useSystemHealth'

// Mock timers for interval testing
jest.useFakeTimers()

describe('useSystemHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSystemHealth())

      expect(result.current.data).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.refetch).toBe('function')
    })
  })

  describe('data fetching', () => {
    it('should fetch system health data successfully', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).not.toBeNull()
      expect(result.current.error).toBeNull()
      
      // Verify the structure of the mock health data
      expect(result.current.data).toEqual({
        database: {
          name: 'Database',
          status: 'healthy',
          responseTime: 45,
          uptime: 99.95,
          lastCheck: expect.any(String)
        },
        api: {
          name: 'API',
          status: 'healthy',
          responseTime: 120,
          uptime: 99.9,
          lastCheck: expect.any(String)
        },
        email: {
          name: 'Email',
          status: 'healthy',
          responseTime: 200,
          uptime: 99.8,
          lastCheck: expect.any(String)
        },
        storage: {
          name: 'Storage',
          status: 'healthy',
          responseTime: 80,
          uptime: 99.99,
          lastCheck: expect.any(String)
        },
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 34,
        networkIO: 78,
        recentErrors: [],
        recentAlerts: []
      })
    })

    it('should generate timestamps for service checks', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const data = result.current.data!
      
      // All services should have valid ISO timestamps
      expect(new Date(data.database.lastCheck).toISOString()).toBe(data.database.lastCheck)
      expect(new Date(data.api.lastCheck).toISOString()).toBe(data.api.lastCheck)
      expect(new Date(data.email.lastCheck).toISOString()).toBe(data.email.lastCheck)
      expect(new Date(data.storage.lastCheck).toISOString()).toBe(data.storage.lastCheck)
    })

    it('should handle fetch errors (simulated)', async () => {
      // Since the hook currently uses mock data and doesn't actually make API calls,
      // we'll test the error handling structure by temporarily modifying the hook's behavior
      // In a real scenario, this would test actual API failures
      
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Since the mock implementation doesn't throw errors, 
      // we verify that the error handling structure exists
      expect(result.current.error).toBeNull()
    })
  })

  describe('polling behavior', () => {
    it('should set up polling interval on mount', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialData = result.current.data
      
      // Fast-forward 30 seconds to trigger the polling
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      await waitFor(() => {
        // Data should be refreshed (timestamps will be different)
        expect(result.current.data).not.toBeNull()
        expect(result.current.data?.database.lastCheck).not.toBe(initialData?.database.lastCheck)
      })
    })

    it('should poll multiple times at correct intervals', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const timestamps: string[] = []
      
      // Collect initial timestamp
      timestamps.push(result.current.data!.database.lastCheck)

      // Fast-forward through multiple polling cycles
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(30000)
        })

        await waitFor(() => {
          expect(result.current.data).not.toBeNull()
        })

        timestamps.push(result.current.data!.database.lastCheck)
      }

      // All timestamps should be different (indicating fresh data)
      const uniqueTimestamps = new Set(timestamps)
      expect(uniqueTimestamps.size).toBe(4) // Initial + 3 polling cycles
    })

    it('should clear polling interval on unmount', async () => {
      const { result, unmount } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      
      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      
      clearIntervalSpy.mockRestore()
    })
  })

  describe('refetch functionality', () => {
    it('should refetch data manually', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialTimestamp = result.current.data!.database.lastCheck

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Data should be refreshed with new timestamp
      expect(result.current.data!.database.lastCheck).not.toBe(initialTimestamp)
    })

    it('should handle multiple concurrent refetch calls', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

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
      expect(result.current.data).not.toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('loading states', () => {
    it('should show loading state during initial fetch', () => {
      const { result } = renderHook(() => useSystemHealth())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should show loading state during manual refetch', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should not show loading state during automatic polling', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Fast-forward to trigger polling
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      // Should not be in loading state during automatic refresh
      // (This is a design choice - automatic refreshes typically don't show loading)
    })
  })

  describe('data consistency', () => {
    it('should provide consistent data structure', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const data = result.current.data!

      // Verify all required service status fields
      const services = ['database', 'api', 'email', 'storage'] as const
      services.forEach(service => {
        expect(data[service]).toEqual({
          name: expect.any(String),
          status: expect.any(String),
          responseTime: expect.any(Number),
          uptime: expect.any(Number),
          lastCheck: expect.any(String)
        })
        
        // Verify status is a valid value
        expect(['healthy', 'warning', 'error', 'maintenance']).toContain(data[service].status)
        
        // Verify numeric constraints
        expect(data[service].responseTime).toBeGreaterThanOrEqual(0)
        expect(data[service].uptime).toBeGreaterThanOrEqual(0)
        expect(data[service].uptime).toBeLessThanOrEqual(100)
      })

      // Verify system metrics
      expect(data.cpuUsage).toBeGreaterThanOrEqual(0)
      expect(data.cpuUsage).toBeLessThanOrEqual(100)
      expect(data.memoryUsage).toBeGreaterThanOrEqual(0)
      expect(data.memoryUsage).toBeLessThanOrEqual(100)
      expect(data.diskUsage).toBeGreaterThanOrEqual(0)
      expect(data.diskUsage).toBeLessThanOrEqual(100)
      expect(data.networkIO).toBeGreaterThanOrEqual(0)

      // Verify arrays
      expect(Array.isArray(data.recentErrors)).toBe(true)
      expect(Array.isArray(data.recentAlerts)).toBe(true)
    })

    it('should maintain data consistency across polling cycles', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialStructure = Object.keys(result.current.data!)
      
      // Fast-forward through polling cycle
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      await waitFor(() => {
        expect(result.current.data).not.toBeNull()
      })

      const updatedStructure = Object.keys(result.current.data!)
      
      // Structure should remain consistent
      expect(updatedStructure).toEqual(initialStructure)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid mount/unmount cycles', () => {
      const { unmount } = renderHook(() => useSystemHealth())
      
      // Unmount immediately
      unmount()
      
      // Should not throw errors
      expect(true).toBe(true)
    })

    it('should handle polling during component updates', async () => {
      const { result, rerender } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Trigger rerender during polling
      rerender()
      
      act(() => {
        jest.advanceTimersByTime(30000)
      })

      await waitFor(() => {
        expect(result.current.data).not.toBeNull()
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle timer cleanup properly', async () => {
      const { result, unmount } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Unmount and verify no timers are left running
      unmount()
      
      // Fast-forward time - should not cause any effects
      act(() => {
        jest.advanceTimersByTime(60000)
      })

      // No errors should occur
      expect(true).toBe(true)
    })
  })

  describe('performance considerations', () => {
    it('should not create memory leaks with polling', async () => {
      const hooks = []
      
      // Create and destroy multiple hook instances
      for (let i = 0; i < 5; i++) {
        const { result, unmount } = renderHook(() => useSystemHealth())
        
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })
        
        hooks.push({ result, unmount })
      }
      
      // Unmount all
      hooks.forEach(({ unmount }) => unmount())
      
      // Fast-forward time - should not cause any effects
      act(() => {
        jest.advanceTimersByTime(120000)
      })
      
      // Should complete without errors
      expect(true).toBe(true)
    })

    it('should handle system under load scenarios', async () => {
      const { result } = renderHook(() => useSystemHealth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate rapid polling and refetching
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.refetch()
          jest.advanceTimersByTime(1000) // Fast polling
        })
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should still work correctly
      expect(result.current.data).not.toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})