import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { UsageRecord, UsageEvent, UsageMetric, FeatureConfig } from '../types'

export class UsageTracker {
  private supabase = getSupabaseBrowserClient()

  /**
   * Track usage event for an organization
   */
  async trackUsage(event: UsageEvent): Promise<void> {
    const { organization_id, feature, quantity, timestamp = new Date(), metadata } = event

    // Get current billing period
    const period = this.getCurrentBillingPeriod(timestamp)

    try {
      // Upsert usage record (increment if exists, create if not)
      const { error } = await this.supabase.rpc('increment_usage', {
        p_organization_id: organization_id,
        p_feature: feature,
        p_quantity: quantity,
        p_period_start: period.start.toISOString(),
        p_period_end: period.end.toISOString(),
        p_metadata: metadata || {}
      })

      if (error) {
        throw new Error(`Failed to track usage: ${error.message}`)
      }

      console.log(`Tracked usage: ${quantity} ${feature} for org ${organization_id}`)
    } catch (error) {
      console.error('Usage tracking error:', error)
      throw error
    }
  }

  /**
   * Get current usage for an organization and feature
   */
  async getCurrentUsage(
    organizationId: string,
    feature: string,
    periodStart?: Date
  ): Promise<UsageRecord | null> {
    const period = periodStart ? 
      this.getBillingPeriod(periodStart) : 
      this.getCurrentBillingPeriod()

    const { data, error } = await this.supabase
      .from('usage_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('feature', feature)
      .eq('period_start', period.start.toISOString())
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error is OK
      throw new Error(`Failed to get usage: ${error.message}`)
    }

    return data || null
  }

  /**
   * Get all usage metrics for an organization
   */
  async getUsageMetrics(
    organizationId: string,
    periodStart?: Date
  ): Promise<UsageMetric[]> {
    const period = periodStart ? 
      this.getBillingPeriod(periodStart) : 
      this.getCurrentBillingPeriod()

    const { data, error } = await this.supabase
      .from('usage_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('period_start', period.start.toISOString())

    if (error) {
      throw new Error(`Failed to get usage metrics: ${error.message}`)
    }

    return data.map((record: any) => ({
      feature: record.feature,
      current_usage: record.usage_count,
      limit: record.usage_limit || 0,
      percentage_used: record.usage_limit ? 
        (record.usage_count / record.usage_limit) * 100 : 0,
      is_over_limit: record.usage_limit ? 
        record.usage_count > record.usage_limit : false,
      period_start: record.period_start,
      period_end: record.period_end
    }))
  }

  /**
   * Check if organization has exceeded limits for any feature
   */
  async checkUsageLimits(organizationId: string): Promise<{
    hasViolations: boolean
    violations: Array<{
      feature: string
      usage: number
      limit: number
      overage: number
    }>
  }> {
    const metrics = await this.getUsageMetrics(organizationId)
    
    const violations = metrics
      .filter(metric => metric.is_over_limit)
      .map(metric => ({
        feature: metric.feature,
        usage: metric.current_usage,
        limit: metric.limit,
        overage: metric.current_usage - metric.limit
      }))

    return {
      hasViolations: violations.length > 0,
      violations
    }
  }

  /**
   * Set usage limits for an organization (usually based on their plan)
   */
  async setUsageLimits(
    organizationId: string,
    limits: Record<string, number>,
    periodStart?: Date
  ): Promise<void> {
    const period = periodStart ? 
      this.getBillingPeriod(periodStart) : 
      this.getCurrentBillingPeriod()

    for (const [feature, limit] of Object.entries(limits)) {
      const { error } = await this.supabase
        .from('usage_tracking')
        .upsert({
          organization_id: organizationId,
          feature,
          usage_count: 0,
          usage_limit: limit,
          period_start: period.start.toISOString(),
          period_end: period.end.toISOString()
        }, {
          onConflict: 'organization_id,feature,period_start',
          ignoreDuplicates: false
        })

      if (error) {
        throw new Error(`Failed to set usage limit: ${error.message}`)
      }
    }
  }

  /**
   * Get usage history for an organization
   */
  async getUsageHistory(
    organizationId: string,
    feature?: string,
    months: number = 6
  ): Promise<UsageRecord[]> {
    let query = this.supabase
      .from('usage_tracking')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('period_start', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('period_start', { ascending: false })

    if (feature) {
      query = query.eq('feature', feature)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get usage history: ${error.message}`)
    }

    return data || []
  }

  /**
   * Reset usage for new billing period
   */
  async resetUsageForNewPeriod(organizationId: string): Promise<void> {
    const newPeriod = this.getCurrentBillingPeriod()

    // Get current limits to preserve them
    const currentMetrics = await this.getUsageMetrics(organizationId)
    
    for (const metric of currentMetrics) {
      await this.supabase
        .from('usage_tracking')
        .upsert({
          organization_id: organizationId,
          feature: metric.feature,
          usage_count: 0,
          usage_limit: metric.limit,
          period_start: newPeriod.start.toISOString(),
          period_end: newPeriod.end.toISOString()
        }, {
          onConflict: 'organization_id,feature,period_start'
        })
    }
  }

  private getCurrentBillingPeriod(timestamp: Date = new Date()): {
    start: Date
    end: Date
  } {
    return this.getBillingPeriod(timestamp)
  }

  private getBillingPeriod(timestamp: Date): {
    start: Date
    end: Date
  } {
    const start = new Date(timestamp.getFullYear(), timestamp.getMonth(), 1)
    const end = new Date(timestamp.getFullYear(), timestamp.getMonth() + 1, 0, 23, 59, 59, 999)
    
    return { start, end }
  }
}