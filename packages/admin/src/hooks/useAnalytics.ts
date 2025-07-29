'use client'

import { useState, useEffect } from 'react'
import { AnalyticsData, UseAdminHookReturn, AdminMetrics } from '../types'
import { analyticsService } from '../lib/analytics-service'

type DateRange = '7d' | '30d' | '90d' | '1y'

interface ExtendedAnalyticsData extends AnalyticsData {
  metrics: AdminMetrics
}

export function useAnalytics(dateRange: DateRange = '30d'): UseAdminHookReturn<ExtendedAnalyticsData> {
  const [data, setData] = useState<ExtendedAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch analytics data from service
      const [analyticsData, metricsData] = await Promise.all([
        analyticsService.getAnalytics(dateRange),
        analyticsService.getMetrics(dateRange)
      ])
      
      setData({
        ...analyticsData,
        metrics: metricsData
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics
  }
}