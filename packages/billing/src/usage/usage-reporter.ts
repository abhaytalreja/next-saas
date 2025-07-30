import { SubscriptionService } from '../stripe/subscription-service'
import { UsageTracker } from './usage-tracker'
import type { UsageRecord } from '../types'

export class UsageReporter {
  private usageTracker = new UsageTracker()
  private subscriptionService = new SubscriptionService()

  /**
   * Report usage to Stripe for metered billing
   */
  async reportToStripe(
    organizationId: string,
    subscriptionItemId: string,
    feature: string,
    timestamp?: Date
  ): Promise<void> {
    try {
      const usage = await this.usageTracker.getCurrentUsage(
        organizationId,
        feature,
        timestamp
      )

      if (!usage || usage.usage_count === 0) {
        console.log(`No usage to report for ${feature}`)
        return
      }

      await this.subscriptionService.reportUsage(
        subscriptionItemId,
        usage.usage_count,
        timestamp ? Math.floor(timestamp.getTime() / 1000) : undefined
      )

      console.log(`Reported ${usage.usage_count} ${feature} usage to Stripe`)
    } catch (error) {
      console.error('Failed to report usage to Stripe:', error)
      throw error
    }
  }

  /**
   * Batch report all usage for an organization
   */
  async batchReportToStripe(
    organizationId: string,
    subscriptionMeteredItems: Array<{
      feature: string
      subscriptionItemId: string
    }>,
    timestamp?: Date
  ): Promise<void> {
    const errors: Array<{ feature: string; error: Error }> = []

    for (const item of subscriptionMeteredItems) {
      try {
        await this.reportToStripe(
          organizationId,
          item.subscriptionItemId,
          item.feature,
          timestamp
        )
      } catch (error) {
        errors.push({
          feature: item.feature,
          error: error as Error
        })
      }
    }

    if (errors.length > 0) {
      console.error(`Failed to report usage for ${errors.length} features:`, errors)
      throw new Error(`Batch usage reporting failed for ${errors.length} features`)
    }
  }

  /**
   * Generate usage report for billing period
   */
  async generateUsageReport(
    organizationId: string,
    periodStart?: Date
  ): Promise<{
    organization_id: string
    period_start: string
    period_end: string
    features: Array<{
      feature: string
      usage_count: number
      usage_limit: number | null
      percentage_used: number
      overage: number
    }>
    total_overage_cost: number
  }> {
    const period = periodStart ? 
      this.getBillingPeriod(periodStart) : 
      this.getCurrentBillingPeriod()

    const metrics = await this.usageTracker.getUsageMetrics(organizationId, periodStart)

    const features = metrics.map(metric => ({
      feature: metric.feature,
      usage_count: metric.current_usage,
      usage_limit: metric.limit || null,
      percentage_used: metric.percentage_used,
      overage: metric.is_over_limit ? metric.current_usage - metric.limit : 0
    }))

    // Calculate overage costs (this would need to be configured per feature)
    const total_overage_cost = features.reduce((total, feature) => {
      if (feature.overage > 0) {
        // This would need feature-specific overage rates
        const overageRate = this.getOverageRate(feature.feature)
        return total + (feature.overage * overageRate)
      }
      return total
    }, 0)

    return {
      organization_id: organizationId,
      period_start: period.start.toISOString(),
      period_end: period.end.toISOString(),
      features,
      total_overage_cost
    }
  }

  /**
   * Export usage data for external analytics
   */
  async exportUsageData(
    organizationId: string,
    format: 'csv' | 'json' = 'json',
    months: number = 6
  ): Promise<string> {
    const history = await this.usageTracker.getUsageHistory(
      organizationId,
      undefined,
      months
    )

    if (format === 'csv') {
      return this.convertToCSV(history)
    }

    return JSON.stringify(history, null, 2)
  }

  /**
   * Get usage trends and predictions
   */
  async getUsageTrends(
    organizationId: string,
    feature: string,
    months: number = 6
  ): Promise<{
    feature: string
    historical_data: Array<{
      period: string
      usage: number
      limit: number | null
    }>
    trend: 'increasing' | 'decreasing' | 'stable'
    predicted_next_month: number
    recommendations: string[]
  }> {
    const history = await this.usageTracker.getUsageHistory(
      organizationId,
      feature,
      months
    )

    if (history.length < 2) {
      return {
        feature,
        historical_data: [],
        trend: 'stable',
        predicted_next_month: 0,
        recommendations: ['Insufficient data for trend analysis']
      }
    }

    const historicalData = history.map(record => ({
      period: record.period_start,
      usage: record.usage_count,
      limit: record.usage_limit || null
    }))

    // Simple trend calculation
    const recent = history.slice(0, 3)
    const older = history.slice(-3)
    const recentAvg = recent.reduce((sum, r) => sum + r.usage_count, 0) / recent.length
    const olderAvg = older.reduce((sum, r) => sum + r.usage_count, 0) / older.length

    let trend: 'increasing' | 'decreasing' | 'stable'
    if (recentAvg > olderAvg * 1.1) {
      trend = 'increasing'
    } else if (recentAvg < olderAvg * 0.9) {
      trend = 'decreasing'
    } else {
      trend = 'stable'
    }

    // Simple linear prediction
    const predictedNextMonth = trend === 'increasing' ? 
      Math.round(recentAvg * 1.1) : 
      trend === 'decreasing' ? 
        Math.round(recentAvg * 0.9) : 
        Math.round(recentAvg)

    const recommendations = this.generateRecommendations(trend, recentAvg, history[0]?.usage_limit)

    return {
      feature,
      historical_data: historicalData,
      trend,
      predicted_next_month: predictedNextMonth,
      recommendations
    }
  }

  /**
   * Schedule automated usage reporting
   */
  async scheduleUsageReporting(
    organizationId: string,
    schedule: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<void> {
    // This would integrate with a job scheduler like Bull, Agenda, or similar
    console.log(`Scheduled ${schedule} usage reporting for org ${organizationId}`)
    
    // Example implementation would create recurring jobs
    // await jobScheduler.schedule(`usage-report-${organizationId}`, schedule, async () => {
    //   await this.generateAndSendUsageReport(organizationId)
    // })
  }

  private getCurrentBillingPeriod(): { start: Date; end: Date } {
    return this.getBillingPeriod(new Date())
  }

  private getBillingPeriod(timestamp: Date): { start: Date; end: Date } {
    const start = new Date(timestamp.getFullYear(), timestamp.getMonth(), 1)
    const end = new Date(timestamp.getFullYear(), timestamp.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end }
  }

  private getOverageRate(feature: string): number {
    // This would be configured per feature in your pricing model
    const defaultRates: Record<string, number> = {
      'api_calls': 0.001, // $0.001 per extra API call
      'storage_mb': 0.01,  // $0.01 per extra MB
      'users': 5,          // $5 per extra user
    }

    return defaultRates[feature] || 0
  }

  private convertToCSV(data: UsageRecord[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const rows = data.map(record => 
      headers.map(header => record[header as keyof UsageRecord]).join(',')
    )

    return [headers.join(','), ...rows].join('\n')
  }

  private generateRecommendations(
    trend: 'increasing' | 'decreasing' | 'stable',
    currentUsage: number,
    limit?: number | null
  ): string[] {
    const recommendations: string[] = []

    if (trend === 'increasing') {
      recommendations.push('Usage is trending upward - consider upgrading your plan')
      if (limit && currentUsage > limit * 0.8) {
        recommendations.push('Approaching usage limits - upgrade recommended')
      }
    } else if (trend === 'decreasing') {
      recommendations.push('Usage is decreasing - you might be able to downgrade your plan')
    }

    if (limit && currentUsage > limit) {
      recommendations.push('Currently over limits - immediate upgrade needed')
    }

    return recommendations
  }
}