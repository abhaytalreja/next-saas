'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsageTracker } from '../usage/usage-tracker'
import { QuotaEnforcer } from '../usage/quota-enforcer'
import type { UsageMetric, UsageEvent } from '../types'

const usageTracker = new UsageTracker()
const quotaEnforcer = new QuotaEnforcer()

export function useUsageTracking(organizationId?: string) {
  const [metrics, setMetrics] = useState<UsageMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const usageMetrics = await usageTracker.getUsageMetrics(organizationId)
      setMetrics(usageMetrics)
      setError(null)
    } catch (err) {
      console.error('Error fetching usage metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch usage metrics')
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const trackUsage = useCallback(async (event: Omit<UsageEvent, 'organization_id'>) => {
    if (!organizationId) return

    try {
      await usageTracker.trackUsage({
        ...event,
        organization_id: organizationId
      })
      // Refresh metrics after tracking
      await fetchMetrics()
    } catch (err) {
      console.error('Error tracking usage:', err)
      throw err
    }
  }, [organizationId, fetchMetrics])

  const checkQuota = useCallback(async (feature: string, requestedQuantity: number = 1) => {
    if (!organizationId) return { allowed: false, reason: 'No organization ID' }

    try {
      return await quotaEnforcer.canPerformAction(organizationId, feature, requestedQuantity)
    } catch (err) {
      console.error('Error checking quota:', err)
      return { allowed: false, reason: 'Error checking quota' }
    }
  }, [organizationId])

  const enforceQuotaAndTrack = useCallback(async (
    feature: string,
    requestedQuantity: number = 1,
    metadata?: Record<string, any>
  ) => {
    if (!organizationId) return { success: false, reason: 'No organization ID' }

    try {
      const result = await quotaEnforcer.enforceQuotaAndTrack(
        organizationId,
        feature,
        requestedQuantity,
        metadata
      )
      
      if (result.success) {
        // Refresh metrics after successful tracking
        await fetchMetrics()
      }
      
      return result
    } catch (err) {
      console.error('Error enforcing quota:', err)
      return { success: false, reason: 'Error enforcing quota' }
    }
  }, [organizationId, fetchMetrics])

  // Helper functions for common metrics
  const getMetricByFeature = useCallback((feature: string) => {
    return metrics.find(metric => metric.feature === feature)
  }, [metrics])

  const getUsagePercentage = useCallback((feature: string) => {
    const metric = getMetricByFeature(feature)
    return metric?.percentage_used || 0
  }, [getMetricByFeature])

  const isOverLimit = useCallback((feature: string) => {
    const metric = getMetricByFeature(feature)
    return metric?.is_over_limit || false
  }, [getMetricByFeature])

  const getRemainingQuota = useCallback((feature: string) => {
    const metric = getMetricByFeature(feature)
    if (!metric) return 0
    return Math.max(0, metric.limit - metric.current_usage)
  }, [getMetricByFeature])

  return {
    metrics,
    isLoading,
    error,
    trackUsage,
    checkQuota,
    enforceQuotaAndTrack,
    getMetricByFeature,
    getUsagePercentage,
    isOverLimit,
    getRemainingQuota,
    refetch: fetchMetrics
  }
}

export function useFeatureUsage(organizationId?: string, feature?: string) {
  const { metrics, isLoading, error, trackUsage, checkQuota, enforceQuotaAndTrack } = 
    useUsageTracking(organizationId)

  const metric = feature ? metrics.find(m => m.feature === feature) : null

  const trackFeatureUsage = useCallback(async (
    quantity: number = 1,
    metadata?: Record<string, any>
  ) => {
    if (!feature) throw new Error('Feature is required')
    
    return await trackUsage({
      feature,
      quantity,
      metadata
    })
  }, [feature, trackUsage])

  const checkFeatureQuota = useCallback(async (requestedQuantity: number = 1) => {
    if (!feature) return { allowed: false, reason: 'Feature is required' }
    
    return await checkQuota(feature, requestedQuantity)
  }, [feature, checkQuota])

  const enforceFeatureQuota = useCallback(async (
    requestedQuantity: number = 1,
    metadata?: Record<string, any>
  ) => {
    if (!feature) return { success: false, reason: 'Feature is required' }
    
    return await enforceQuotaAndTrack(feature, requestedQuantity, metadata)
  }, [feature, enforceQuotaAndTrack])

  return {
    metric,
    isLoading,
    error,
    trackFeatureUsage,
    checkFeatureQuota,
    enforceFeatureQuota,
    currentUsage: metric?.current_usage || 0,
    limit: metric?.limit || 0,
    percentage: metric?.percentage_used || 0,
    isOverLimit: metric?.is_over_limit || false,
    remaining: metric ? Math.max(0, metric.limit - metric.current_usage) : 0
  }
}