import { UsageTracker } from './usage-tracker'
import type { UsageMetric } from '../types'

export class QuotaEnforcer {
  private usageTracker = new UsageTracker()

  /**
   * Check if organization can perform an action (has quota available)
   */
  async canPerformAction(
    organizationId: string,
    feature: string,
    requestedQuantity: number = 1
  ): Promise<{
    allowed: boolean
    reason?: string
    currentUsage?: number
    limit?: number
    remaining?: number
  }> {
    try {
      const usage = await this.usageTracker.getCurrentUsage(organizationId, feature)
      
      if (!usage || !usage.usage_limit) {
        // No limit set - allow action
        return { allowed: true }
      }

      const currentUsage = usage.usage_count
      const limit = usage.usage_limit
      const remaining = Math.max(0, limit - currentUsage)

      if (currentUsage + requestedQuantity <= limit) {
        return {
          allowed: true,
          currentUsage,
          limit,
          remaining: remaining - requestedQuantity
        }
      }

      return {
        allowed: false,
        reason: `Quota exceeded. Current: ${currentUsage}, Limit: ${limit}, Requested: ${requestedQuantity}`,
        currentUsage,
        limit,
        remaining
      }
    } catch (error) {
      console.error('Quota enforcement error:', error)
      // On error, allow action to prevent blocking legitimate usage
      return { allowed: true }
    }
  }

  /**
   * Enforce quota and track usage if allowed
   */
  async enforceQuotaAndTrack(
    organizationId: string,
    feature: string,
    requestedQuantity: number = 1,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean
    reason?: string
    currentUsage?: number
    limit?: number
    remaining?: number
  }> {
    const quotaCheck = await this.canPerformAction(organizationId, feature, requestedQuantity)

    if (!quotaCheck.allowed) {
      return {
        success: false,
        reason: quotaCheck.reason,
        currentUsage: quotaCheck.currentUsage,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining
      }
    }

    // Track the usage
    try {
      await this.usageTracker.trackUsage({
        organization_id: organizationId,
        feature,
        quantity: requestedQuantity,
        metadata
      })

      return {
        success: true,
        currentUsage: (quotaCheck.currentUsage || 0) + requestedQuantity,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining
      }
    } catch (error) {
      console.error('Failed to track usage after quota enforcement:', error)
      return {
        success: false,
        reason: 'Failed to track usage'
      }
    }
  }

  /**
   * Get quota status for multiple features
   */
  async getQuotaStatus(
    organizationId: string,
    features?: string[]
  ): Promise<Record<string, {
    usage: number
    limit: number
    percentage: number
    remaining: number
    status: 'healthy' | 'warning' | 'critical' | 'exceeded'
  }>> {
    const metrics = await this.usageTracker.getUsageMetrics(organizationId)
    const filteredMetrics = features ? 
      metrics.filter(m => features.includes(m.feature)) : 
      metrics

    const status: Record<string, any> = {}

    for (const metric of filteredMetrics) {
      const percentage = metric.percentage_used
      const remaining = Math.max(0, metric.limit - metric.current_usage)

      let statusLevel: 'healthy' | 'warning' | 'critical' | 'exceeded'
      if (percentage >= 100) {
        statusLevel = 'exceeded'
      } else if (percentage >= 90) {
        statusLevel = 'critical'
      } else if (percentage >= 75) {
        statusLevel = 'warning'
      } else {
        statusLevel = 'healthy'
      }

      status[metric.feature] = {
        usage: metric.current_usage,
        limit: metric.limit,
        percentage,
        remaining,
        status: statusLevel
      }
    }

    return status
  }

  /**
   * Set up quota alerts (integration with notification system)
   */
  async setupQuotaAlerts(
    organizationId: string,
    feature: string,
    thresholds: number[] = [75, 90, 100]
  ): Promise<void> {
    const usage = await this.usageTracker.getCurrentUsage(organizationId, feature)
    
    if (!usage || !usage.usage_limit) {
      return
    }

    const percentage = (usage.usage_count / usage.usage_limit) * 100

    for (const threshold of thresholds) {
      if (percentage >= threshold) {
        await this.triggerQuotaAlert(organizationId, feature, percentage, threshold)
      }
    }
  }

  /**
   * Check if feature access should be blocked
   */
  async isFeatureBlocked(
    organizationId: string,
    feature: string
  ): Promise<boolean> {
    const check = await this.canPerformAction(organizationId, feature, 1)
    return !check.allowed
  }

  /**
   * Get soft limit warnings (before hard enforcement)
   */
  async getSoftLimitWarnings(
    organizationId: string,
    warningThreshold: number = 80
  ): Promise<Array<{
    feature: string
    usage: number
    limit: number
    percentage: number
    warningLevel: 'approaching' | 'near' | 'critical'
  }>> {
    const metrics = await this.usageTracker.getUsageMetrics(organizationId)
    
    return metrics
      .filter(metric => metric.percentage_used >= warningThreshold)
      .map(metric => {
        let warningLevel: 'approaching' | 'near' | 'critical'
        if (metric.percentage_used >= 95) {
          warningLevel = 'critical'
        } else if (metric.percentage_used >= 90) {
          warningLevel = 'near'
        } else {
          warningLevel = 'approaching'
        }

        return {
          feature: metric.feature,
          usage: metric.current_usage,
          limit: metric.limit,
          percentage: metric.percentage_used,
          warningLevel
        }
      })
  }

  private async triggerQuotaAlert(
    organizationId: string,
    feature: string,
    currentPercentage: number,
    threshold: number
  ): Promise<void> {
    // This would integrate with your notification system
    console.log(`Quota alert: ${feature} for org ${organizationId} at ${currentPercentage}% (threshold: ${threshold}%)`)
    
    // Example: Send to notification service
    // await notificationService.send({
    //   organizationId,
    //   type: 'quota_alert',
    //   data: { feature, percentage: currentPercentage, threshold }
    // })
  }
}