import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { createClient } from '@nextsaas/supabase/client'
import { UsageTrackingService } from '../services/usage-tracker'
import type { 
  UsageSummary, 
  UsageAlert, 
  UsageLimit,
  UsageEvent,
  DateRange 
} from '../types'

export function useUsageTracking() {
  const { organization } = useOrganization()
  const [usage, setUsage] = useState<UsageSummary[]>([])
  const [alerts, setAlerts] = useState<UsageAlert[]>([])
  const [limits, setLimits] = useState<UsageLimit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const usageTracker = new UsageTrackingService()

  // Load current usage data
  const loadUsageData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const [currentUsage, activeAlerts, usageLimits] = await Promise.all([
        usageTracker.getCurrentUsage(organization.id),
        usageTracker.getAlerts(organization.id, true),
        usageTracker.checkLimits(organization.id)
      ])

      setUsage(currentUsage)
      setAlerts(activeAlerts)
      setLimits(usageLimits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data')
      console.error('Usage tracking error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id])

  // Track a usage event
  const trackUsage = useCallback(async (event: Omit<UsageEvent, 'id' | 'recorded_at'>) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      await usageTracker.track({
        ...event,
        organization_id: organization.id
      })

      // Refresh usage data after tracking
      await loadUsageData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track usage'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [organization?.id, loadUsageData])

  // Get usage for specific metric and period
  const getUsageForMetric = useCallback(async (
    metricId: string, 
    period?: DateRange
  ): Promise<UsageSummary> => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    return usageTracker.getUsage(organization.id, metricId, period)
  }, [organization?.id])

  // Acknowledge an alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await usageTracker.acknowledgeAlert(alertId)
      
      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Refresh all usage data
  const refreshUsage = useCallback(() => {
    return loadUsageData()
  }, [loadUsageData])

  // Subscribe to real-time usage updates
  useEffect(() => {
    if (!organization?.id) return

    // Set up real-time subscription for usage alerts
    const alertsSubscription = supabase
      .channel('usage-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'usage_alerts',
          filter: `organization_id=eq.${organization.id}`
        },
        (payload) => {
          const newAlert = payload.new as UsageAlert
          setAlerts(prev => [newAlert, ...prev])
        }
      )
      .subscribe()

    // Set up real-time subscription for usage tracking updates
    const usageSubscription = supabase
      .channel('usage-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usage_tracking',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          // Refresh usage data when tracking table updates
          loadUsageData()
        }
      )
      .subscribe()

    return () => {
      alertsSubscription.unsubscribe()
      usageSubscription.unsubscribe()
    }
  }, [organization?.id, supabase, loadUsageData])

  // Load initial data
  useEffect(() => {
    loadUsageData()
  }, [loadUsageData])

  // Calculate usage statistics
  const usageStats = {
    totalMetrics: usage.length,
    activeAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    limitsExceeded: limits.filter(l => l.current_usage >= l.limit_value).length,
    averageUsage: usage.reduce((sum, u) => sum + u.total_usage, 0) / Math.max(usage.length, 1)
  }

  // Check if organization is approaching any limits
  const isApproachingLimits = limits.some(limit => 
    (limit.current_usage / limit.limit_value) >= 0.8
  )

  // Get usage by category
  const usageByCategory = usage.reduce((acc, summary) => {
    // Extract category from metric name or use 'General'
    const category = summary.metric_name.split('_')[0] || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(summary)
    return acc
  }, {} as Record<string, UsageSummary[]>)

  return {
    // Data
    usage,
    alerts,
    limits,
    usageStats,
    usageByCategory,
    
    // State
    isLoading,
    error,
    isApproachingLimits,
    
    // Actions
    trackUsage,
    getUsageForMetric,
    acknowledgeAlert,
    refreshUsage
  }
}

// Hook for tracking specific metrics easily
export function useMetricTracking(metricId: string) {
  const { trackUsage } = useUsageTracking()
  const { organization } = useOrganization()

  const track = useCallback(async (quantity: number, metadata?: Record<string, any>) => {
    if (!organization?.id) return

    await trackUsage({
      organization_id: organization.id,
      event_type: metricId as any,
      event_name: metricId,
      quantity,
      unit: 'count',
      metadata,
      timestamp: new Date().toISOString()
    })
  }, [trackUsage, metricId, organization?.id])

  return { track }
}

// Hook for usage limits management
export function useUsageLimits() {
  const [limits, setLimits] = useState<UsageLimit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useOrganization()

  const supabase = createClient()
  const usageTracker = new UsageTrackingService()

  const loadLimits = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      const orgLimits = await usageTracker.checkLimits(organization.id)
      setLimits(orgLimits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load limits')
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id])

  const createLimit = useCallback(async (limit: Omit<UsageLimit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!organization?.id) return

    try {
      const { data, error } = await supabase
        .from('usage_limits')
        .insert({
          ...limit,
          organization_id: organization.id
        })
        .select()
        .single()

      if (error) throw error

      setLimits(prev => [...prev, data])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create limit'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [organization?.id, supabase])

  const updateLimit = useCallback(async (limitId: string, updates: Partial<UsageLimit>) => {
    try {
      const { data, error } = await supabase
        .from('usage_limits')
        .update(updates)
        .eq('id', limitId)
        .select()
        .single()

      if (error) throw error

      setLimits(prev => prev.map(limit => 
        limit.id === limitId ? data : limit
      ))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update limit'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  const deleteLimit = useCallback(async (limitId: string) => {
    try {
      const { error } = await supabase
        .from('usage_limits')
        .delete()
        .eq('id', limitId)

      if (error) throw error

      setLimits(prev => prev.filter(limit => limit.id !== limitId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete limit'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  useEffect(() => {
    loadLimits()
  }, [loadLimits])

  return {
    limits,
    isLoading,
    error,
    createLimit,
    updateLimit,
    deleteLimit,
    refreshLimits: loadLimits
  }
}