'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AdminMetrics, UseAdminHookReturn } from '../types'
import { adminService } from '../lib/admin-service'

interface UseAdminDashboardOptions {
  refreshInterval?: number
  enableRealTime?: boolean
  autoRefresh?: boolean
}

export function useAdminDashboard(options: UseAdminDashboardOptions = {}): UseAdminHookReturn<AdminMetrics> & {
  refresh: () => void
  isRefreshing: boolean
  lastUpdated: Date | null
  retryCount: number
} {
  const {
    refreshInterval = 30000, // 30 seconds
    enableRealTime = true,
    autoRefresh = true
  } = options

  const [data, setData] = useState<AdminMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      if (!isRefresh) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      
      const metrics = await adminService.getDashboardMetrics({
        signal: abortControllerRef.current.signal
      })
      
      setData(metrics)
      setLastUpdated(new Date())
      retryCountRef.current = 0 // Reset retry count on success
      
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      console.error('Dashboard data fetch error:', errorMessage)
      
      // Implement exponential backoff for retries
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        const delay = Math.pow(2, retryCountRef.current) * 1000 // 2s, 4s, 8s
        
        setTimeout(() => {
          fetchDashboardData(isRefresh)
        }, delay)
        
        return
      }
      
      setError(new Error(errorMessage))
    } finally {
      if (!isRefresh) {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }, [])

  const refresh = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  // Set up auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !enableRealTime) return

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      fetchDashboardData(true)
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchDashboardData, refreshInterval, autoRefresh, enableRealTime])

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()

    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchDashboardData])

  // Handle window focus to refresh data
  useEffect(() => {
    if (!enableRealTime) return

    const handleFocus = () => {
      // Refresh data when window regains focus
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchDashboardData, enableRealTime])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
    refresh,
    isRefreshing,
    lastUpdated,
    // Additional admin-specific properties
    retryCount: retryCountRef.current
  }
}