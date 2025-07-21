import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { createClient } from '@nextsaas/supabase/client'
import type { UsageLimit, UsageAlert } from '../types'

export function useUsageLimits() {
  const { organization } = useOrganization()
  const [limits, setLimits] = useState<UsageLimit[]>([])
  const [alerts, setAlerts] = useState<UsageAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load limits and alerts
  const loadLimitsData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const [limitsResult, alertsResult] = await Promise.all([
        supabase
          .from('usage_limits')
          .select(`
            *,
            usage_metrics (
              name,
              unit,
              description
            )
          `)
          .eq('organization_id', organization.id),

        supabase
          .from('usage_alerts')
          .select(`
            *,
            usage_metrics (
              name,
              unit
            )
          `)
          .eq('organization_id', organization.id)
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
      ])

      if (limitsResult.error) throw limitsResult.error
      if (alertsResult.error) throw alertsResult.error

      setLimits(limitsResult.data || [])
      setAlerts(alertsResult.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load limits data')
      console.error('Limits data error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, supabase])

  // Create a new usage limit
  const createLimit = useCallback(async (limitData: Omit<UsageLimit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const { data, error } = await supabase
        .from('usage_limits')
        .insert({
          ...limitData,
          organization_id: organization.id
        })
        .select(`
          *,
          usage_metrics (
            name,
            unit,
            description
          )
        `)
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

  // Update an existing usage limit
  const updateLimit = useCallback(async (
    limitId: string, 
    updates: Partial<UsageLimit>
  ) => {
    try {
      const { data, error } = await supabase
        .from('usage_limits')
        .update(updates)
        .eq('id', limitId)
        .select(`
          *,
          usage_metrics (
            name,
            unit,
            description
          )
        `)
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

  // Delete a usage limit
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

  // Toggle limit active status
  const toggleLimit = useCallback(async (limitId: string, isActive: boolean) => {
    return updateLimit(limitId, { is_active: isActive })
  }, [updateLimit])

  // Acknowledge an alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('usage_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [supabase])

  // Bulk acknowledge alerts
  const acknowledgeAllAlerts = useCallback(async () => {
    if (!organization?.id || alerts.length === 0) return

    try {
      const alertIds = alerts.map(alert => alert.id)
      
      const { error } = await supabase
        .from('usage_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .in('id', alertIds)

      if (error) throw error

      setAlerts([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge all alerts'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [organization?.id, alerts, supabase])

  // Load initial data
  useEffect(() => {
    loadLimitsData()
  }, [loadLimitsData])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!organization?.id) return

    const subscription = supabase
      .channel('usage-limits-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_limits',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          loadLimitsData()
        }
      )
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

    return () => {
      subscription.unsubscribe()
    }
  }, [organization?.id, supabase, loadLimitsData])

  // Calculate limit statistics
  const limitStats = {
    totalLimits: limits.length,
    activeLimits: limits.filter(l => l.is_active).length,
    limitsExceeded: limits.filter(l => l.current_usage >= l.limit_value).length,
    limitsNearThreshold: limits.filter(l => {
      const percentage = (l.current_usage / l.limit_value) * 100
      return percentage >= 80 && percentage < 100
    }).length,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length
  }

  // Group limits by type
  const limitsByType = limits.reduce((acc, limit) => {
    if (!acc[limit.limit_type]) {
      acc[limit.limit_type] = []
    }
    acc[limit.limit_type].push(limit)
    return acc
  }, {} as Record<string, UsageLimit[]>)

  // Group alerts by severity
  const alertsBySeverity = alerts.reduce((acc, alert) => {
    if (!acc[alert.severity]) {
      acc[alert.severity] = []
    }
    acc[alert.severity].push(alert)
    return acc
  }, {} as Record<string, UsageAlert[]>)

  return {
    // Data
    limits,
    alerts,
    limitStats,
    limitsByType,
    alertsBySeverity,
    
    // State
    isLoading,
    error,
    
    // Actions
    createLimit,
    updateLimit,
    deleteLimit,
    toggleLimit,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    refreshLimits: loadLimitsData
  }
}