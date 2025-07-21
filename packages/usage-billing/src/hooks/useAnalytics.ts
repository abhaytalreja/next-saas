import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { UsageAnalyticsService } from '../services/analytics-service'
import type { 
  UsageAnalytics,
  DateRange,
  DashboardConfig,
  UsageForecast,
  CostBreakdown
} from '../types'

export function useAnalytics(period?: DateRange) {
  const { organization } = useOrganization()
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyticsService = new UsageAnalyticsService()

  // Default to last 30 days if no period provided
  const defaultPeriod = useMemo((): DateRange => {
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }, [])

  const activePeriod = period || defaultPeriod

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const analyticsData = await analyticsService.getUsageAnalytics(
        organization.id, 
        activePeriod
      )

      setAnalytics(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
      console.error('Analytics error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, activePeriod])

  // Get forecasts for specific metrics
  const getForecast = useCallback(async (
    metricIds: string[], 
    days: number = 30
  ): Promise<UsageForecast[]> => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    return analyticsService.getUsageForecast(organization.id, metricIds, days)
  }, [organization?.id])

  // Export data
  const exportData = useCallback(async (
    format: 'csv' | 'json',
    customPeriod?: DateRange
  ): Promise<Blob> => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    return analyticsService.exportUsageData(
      organization.id, 
      customPeriod || activePeriod, 
      format
    )
  }, [organization?.id, activePeriod])

  // Refresh analytics
  const refreshAnalytics = useCallback(() => {
    return loadAnalytics()
  }, [loadAnalytics])

  // Load initial data
  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Derived analytics data
  const analyticsInsights = useMemo(() => {
    if (!analytics) return null

    const totalCost = analytics.cost_breakdown.total_cost
    const totalUsage = analytics.metrics.reduce(
      (sum, metric) => sum + metric.current_period.total_usage, 
      0
    )

    const topMetrics = analytics.metrics
      .sort((a, b) => b.cost_impact - a.cost_impact)
      .slice(0, 5)

    const growingMetrics = analytics.metrics
      .filter(metric => metric.growth_rate > 0)
      .sort((a, b) => b.growth_rate - a.growth_rate)

    const costEfficiency = totalUsage > 0 ? totalCost / totalUsage : 0

    return {
      totalCost,
      totalUsage,
      topMetrics,
      growingMetrics,
      costEfficiency,
      averageDailyCost: totalCost / 30, // Assuming 30-day period
      projectedMonthlyCost: totalCost * (30 / Math.max(1, 
        Math.ceil((new Date(activePeriod.end).getTime() - new Date(activePeriod.start).getTime()) / (1000 * 60 * 60 * 24))
      ))
    }
  }, [analytics, activePeriod])

  return {
    // Data
    analytics,
    analyticsInsights,
    
    // State
    isLoading,
    error,
    period: activePeriod,
    
    // Actions
    getForecast,
    exportData,
    refreshAnalytics
  }
}

// Hook for dashboard widget data
export function useDashboard(config: DashboardConfig) {
  const { organization } = useOrganization()
  const [dashboardData, setDashboardData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyticsService = new UsageAnalyticsService()

  const loadDashboardData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const data = await analyticsService.getDashboardData(organization.id, config)
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, config])

  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    return loadDashboardData()
  }, [loadDashboardData])

  // Get data for specific widget
  const getWidgetData = useCallback((widgetId: string) => {
    return dashboardData[widgetId] || null
  }, [dashboardData])

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Auto-refresh based on config
  useEffect(() => {
    if (!config.refresh_interval || config.refresh_interval <= 0) return

    const interval = setInterval(loadDashboardData, config.refresh_interval * 1000)
    return () => clearInterval(interval)
  }, [config.refresh_interval, loadDashboardData])

  return {
    dashboardData,
    isLoading,
    error,
    getWidgetData,
    refreshDashboard
  }
}

// Hook for cost breakdown analysis
export function useCostBreakdown(period?: DateRange) {
  const { organization } = useOrganization()
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyticsService = new UsageAnalyticsService()

  const defaultPeriod = useMemo((): DateRange => {
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }, [])

  const activePeriod = period || defaultPeriod

  const loadCostBreakdown = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      // Get full analytics to extract cost breakdown
      const analytics = await analyticsService.getUsageAnalytics(organization.id, activePeriod)
      setCostBreakdown(analytics.cost_breakdown)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cost breakdown')
      console.error('Cost breakdown error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, activePeriod])

  // Calculate cost trends
  const costTrends = useMemo(() => {
    if (!costBreakdown) return null

    const totalCost = costBreakdown.total_cost
    const usageCostPercentage = (costBreakdown.usage_based_cost / totalCost) * 100
    const baseCostPercentage = (costBreakdown.base_subscription_cost / totalCost) * 100
    const overageCostPercentage = (costBreakdown.overage_cost / totalCost) * 100

    return {
      usageCostPercentage,
      baseCostPercentage,
      overageCostPercentage,
      isUsageHeavy: usageCostPercentage > 50,
      hasOverages: costBreakdown.overage_cost > 0
    }
  }, [costBreakdown])

  useEffect(() => {
    loadCostBreakdown()
  }, [loadCostBreakdown])

  return {
    costBreakdown,
    costTrends,
    isLoading,
    error,
    period: activePeriod,
    refreshCostBreakdown: loadCostBreakdown
  }
}

// Hook for usage forecasting
export function useForecasting(metricIds: string[] = [], days: number = 30) {
  const { organization } = useOrganization()
  const [forecasts, setForecasts] = useState<UsageForecast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyticsService = new UsageAnalyticsService()

  const loadForecasts = useCallback(async () => {
    if (!organization?.id || metricIds.length === 0) return

    try {
      setIsLoading(true)
      setError(null)

      const forecastData = await analyticsService.getUsageForecast(
        organization.id, 
        metricIds, 
        days
      )

      setForecasts(forecastData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecasts')
      console.error('Forecasting error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, metricIds, days])

  // Get forecast for specific metric
  const getForecastForMetric = useCallback((metricId: string) => {
    return forecasts.find(forecast => forecast.metric_id === metricId) || null
  }, [forecasts])

  // Calculate forecast accuracy (would need historical data)
  const forecastInsights = useMemo(() => {
    if (forecasts.length === 0) return null

    const totalPredictedUsage = forecasts.reduce(
      (sum, forecast) => sum + forecast.predicted_usage, 
      0
    )
    
    const totalPredictedCost = forecasts.reduce(
      (sum, forecast) => sum + forecast.predicted_cost, 
      0
    )

    const highConfidenceForecasts = forecasts.filter(
      forecast => forecast.confidence_interval.confidence_level >= 90
    )

    return {
      totalPredictedUsage,
      totalPredictedCost,
      highConfidenceCount: highConfidenceForecasts.length,
      averageConfidence: forecasts.reduce(
        (sum, f) => sum + f.confidence_interval.confidence_level, 
        0
      ) / forecasts.length
    }
  }, [forecasts])

  useEffect(() => {
    loadForecasts()
  }, [loadForecasts])

  return {
    forecasts,
    forecastInsights,
    isLoading,
    error,
    getForecastForMetric,
    refreshForecasts: loadForecasts
  }
}