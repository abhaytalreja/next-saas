import { createClient } from '@nextsaas/supabase/server'
import type { 
  UsageEvent, 
  UsageTracker, 
  UsageSummary, 
  UsageLimit, 
  UsageAlert,
  DateRange 
} from '../types'

export class UsageTrackingService implements UsageTracker {
  private supabase = createClient()

  /**
   * Track a usage event in real-time
   */
  async track(event: Omit<UsageEvent, 'id' | 'recorded_at'>): Promise<void> {
    try {
      // Insert usage event
      const { error: eventError } = await this.supabase
        .from('usage_events')
        .insert({
          ...event,
          recorded_at: new Date().toISOString()
        })

      if (eventError) {
        throw new Error(`Failed to track usage event: ${eventError.message}`)
      }

      // Update real-time usage tracking
      await this.updateUsageTracking(event.organization_id, event.event_type, event.quantity)

      // Check limits and create alerts if needed
      await this.checkUsageLimits(event.organization_id, event.event_type)
      
    } catch (error) {
      console.error('Usage tracking error:', error)
      throw error
    }
  }

  /**
   * Get usage summary for a specific metric and period
   */
  async getUsage(
    organizationId: string, 
    metricId: string, 
    period?: DateRange
  ): Promise<UsageSummary> {
    const defaultPeriod = period || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .rpc('get_usage_summary', {
        org_id: organizationId,
        metric_id: metricId,
        start_date: defaultPeriod.start,
        end_date: defaultPeriod.end
      })

    if (error) {
      throw new Error(`Failed to get usage summary: ${error.message}`)
    }

    return data[0] || {
      organization_id: organizationId,
      metric_id: metricId,
      metric_name: '',
      period_start: defaultPeriod.start,
      period_end: defaultPeriod.end,
      total_usage: 0,
      unit: '',
      current_cost: 0
    }
  }

  /**
   * Get current usage across all metrics for an organization
   */
  async getCurrentUsage(organizationId: string): Promise<UsageSummary[]> {
    const { data, error } = await this.supabase
      .rpc('get_current_usage_all_metrics', {
        org_id: organizationId
      })

    if (error) {
      throw new Error(`Failed to get current usage: ${error.message}`)
    }

    return data || []
  }

  /**
   * Check usage limits for an organization
   */
  async checkLimits(organizationId: string): Promise<UsageLimit[]> {
    const { data, error } = await this.supabase
      .from('usage_limits')
      .select(`
        *,
        usage_metrics (
          name,
          unit
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to check usage limits: ${error.message}`)
    }

    // Get current usage for each limit
    const limitsWithUsage = await Promise.all(
      (data || []).map(async (limit) => {
        const currentUsage = await this.getCurrentMetricUsage(
          organizationId, 
          limit.metric_id
        )
        
        return {
          ...limit,
          current_usage: currentUsage
        }
      })
    )

    return limitsWithUsage
  }

  /**
   * Get active alerts for an organization
   */
  async getAlerts(organizationId: string, unresolved = true): Promise<UsageAlert[]> {
    let query = this.supabase
      .from('usage_alerts')
      .select(`
        *,
        usage_metrics (
          name,
          unit
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (unresolved) {
      query = query.eq('is_resolved', false)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get usage alerts: ${error.message}`)
    }

    return data || []
  }

  /**
   * Update real-time usage tracking table
   */
  private async updateUsageTracking(
    organizationId: string, 
    eventType: string, 
    quantity: number
  ): Promise<void> {
    const { error } = await this.supabase
      .rpc('update_usage_tracking', {
        org_id: organizationId,
        event_type: eventType,
        usage_amount: quantity
      })

    if (error) {
      console.error('Failed to update usage tracking:', error)
    }
  }

  /**
   * Check if usage limits are exceeded and create alerts
   */
  private async checkUsageLimits(organizationId: string, eventType: string): Promise<void> {
    // Get limits for this event type
    const { data: limits } = await this.supabase
      .from('usage_limits')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('metric_id', eventType)

    if (!limits || limits.length === 0) return

    for (const limit of limits) {
      const currentUsage = await this.getCurrentMetricUsage(organizationId, limit.metric_id)
      const usagePercentage = (currentUsage / limit.limit_value) * 100

      // Check threshold alerts
      for (const threshold of limit.notification_thresholds) {
        if (usagePercentage >= threshold) {
          await this.createUsageAlert(
            organizationId,
            limit.metric_id,
            'threshold_exceeded',
            threshold,
            currentUsage,
            limit.limit_value,
            `Usage has reached ${threshold}% of limit`
          )
        }
      }

      // Check hard limit exceeded
      if (limit.limit_type === 'hard' && currentUsage >= limit.limit_value) {
        await this.createUsageAlert(
          organizationId,
          limit.metric_id,
          'limit_exceeded',
          100,
          currentUsage,
          limit.limit_value,
          'Hard usage limit exceeded'
        )
      }
    }
  }

  /**
   * Get current usage for a specific metric
   */
  private async getCurrentMetricUsage(organizationId: string, metricId: string): Promise<number> {
    const { data } = await this.supabase
      .from('usage_tracking')
      .select('current_usage')
      .eq('organization_id', organizationId)
      .eq('metric_id', metricId)
      .single()

    return data?.current_usage || 0
  }

  /**
   * Create a usage alert
   */
  private async createUsageAlert(
    organizationId: string,
    metricId: string,
    alertType: 'threshold_exceeded' | 'limit_exceeded' | 'anomaly_detected',
    thresholdPercentage: number,
    currentUsage: number,
    limitValue: number,
    message: string
  ): Promise<void> {
    // Check if similar alert already exists and is unresolved
    const { data: existingAlert } = await this.supabase
      .from('usage_alerts')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('metric_id', metricId)
      .eq('alert_type', alertType)
      .eq('is_resolved', false)
      .single()

    if (existingAlert) return // Don't create duplicate alerts

    const severity = thresholdPercentage >= 95 ? 'critical' : 
                    thresholdPercentage >= 80 ? 'warning' : 'info'

    const { error } = await this.supabase
      .from('usage_alerts')
      .insert({
        organization_id: organizationId,
        metric_id: metricId,
        alert_type: alertType,
        threshold_percentage: thresholdPercentage,
        current_usage: currentUsage,
        limit_value: limitValue,
        message,
        severity,
        is_resolved: false
      })

    if (error) {
      console.error('Failed to create usage alert:', error)
    }
  }

  /**
   * Acknowledge and resolve an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const { error } = await this.supabase
      .from('usage_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) {
      throw new Error(`Failed to acknowledge alert: ${error.message}`)
    }
  }

  /**
   * Batch track multiple usage events (for better performance)
   */
  async trackBatch(events: Omit<UsageEvent, 'id' | 'recorded_at'>[]): Promise<void> {
    const eventsWithTimestamp = events.map(event => ({
      ...event,
      recorded_at: new Date().toISOString()
    }))

    const { error } = await this.supabase
      .from('usage_events')
      .insert(eventsWithTimestamp)

    if (error) {
      throw new Error(`Failed to track batch usage events: ${error.message}`)
    }

    // Update usage tracking for each unique organization/metric combination
    const updates = new Map<string, { organizationId: string; eventType: string; totalQuantity: number }>()
    
    for (const event of events) {
      const key = `${event.organization_id}:${event.event_type}`
      const existing = updates.get(key) || { 
        organizationId: event.organization_id, 
        eventType: event.event_type, 
        totalQuantity: 0 
      }
      existing.totalQuantity += event.quantity
      updates.set(key, existing)
    }

    // Apply all updates
    await Promise.all(
      Array.from(updates.values()).map(({ organizationId, eventType, totalQuantity }) =>
        this.updateUsageTracking(organizationId, eventType, totalQuantity)
      )
    )
  }
}