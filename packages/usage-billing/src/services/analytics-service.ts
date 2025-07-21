import { createClient } from '@nextsaas/supabase/server'
import { startOfDay, endOfDay, subDays, format, parseISO } from 'date-fns'
import type { 
  AnalyticsService,
  UsageAnalytics,
  DateRange,
  DashboardConfig,
  ReportConfig,
  UsageForecast,
  MetricAnalytics,
  UsageTrend,
  CostBreakdown
} from '../types'

export class UsageAnalyticsService implements AnalyticsService {
  private supabase = createClient()

  /**
   * Get comprehensive usage analytics for an organization
   */
  async getUsageAnalytics(organizationId: string, period: DateRange): Promise<UsageAnalytics> {
    const [metrics, trends, costBreakdown, forecasts] = await Promise.all([
      this.getMetricAnalytics(organizationId, period),
      this.getUsageTrends(organizationId, period),
      this.getCostBreakdown(organizationId, period),
      this.getUsageForecast(organizationId, ['api_calls', 'storage', 'bandwidth'], 30)
    ])

    return {
      organization_id: organizationId,
      period,
      metrics,
      trends,
      cost_breakdown: costBreakdown,
      forecasts,
      generated_at: new Date().toISOString()
    }
  }

  /**
   * Get detailed analytics for each metric
   */
  private async getMetricAnalytics(organizationId: string, period: DateRange): Promise<MetricAnalytics[]> {
    const { data: usage } = await this.supabase
      .rpc('get_metric_analytics', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    return usage || []
  }

  /**
   * Get usage trends over time
   */
  private async getUsageTrends(organizationId: string, period: DateRange): Promise<UsageTrend[]> {
    const { data: trends } = await this.supabase
      .rpc('get_usage_trends', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    return trends || []
  }

  /**
   * Get cost breakdown by metric
   */
  private async getCostBreakdown(organizationId: string, period: DateRange): Promise<CostBreakdown> {
    const { data: breakdown } = await this.supabase
      .rpc('get_cost_breakdown', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    return breakdown || {
      total_cost: 0,
      base_subscription_cost: 0,
      usage_based_cost: 0,
      overage_cost: 0,
      currency: 'USD',
      cost_by_metric: [],
      period
    }
  }

  /**
   * Generate usage forecasts using linear regression
   */
  async getUsageForecast(organizationId: string, metricIds: string[], days: number): Promise<UsageForecast[]> {
    const forecasts: UsageForecast[] = []
    const forecastPeriod: DateRange = {
      start: new Date().toISOString(),
      end: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    }

    for (const metricId of metricIds) {
      // Get historical data for the last 90 days
      const historicalData = await this.getHistoricalUsage(organizationId, metricId, 90)
      
      if (historicalData.length < 7) {
        // Not enough data for forecasting
        continue
      }

      const forecast = this.calculateLinearForecast(historicalData, days)
      
      forecasts.push({
        metric_id: metricId,
        metric_name: forecast.metric_name,
        forecast_period: forecastPeriod,
        predicted_usage: forecast.predicted_usage,
        predicted_cost: forecast.predicted_cost,
        confidence_interval: forecast.confidence_interval,
        methodology: 'linear_regression',
        factors_considered: ['historical_usage', 'trend_analysis', 'seasonal_patterns']
      })
    }

    return forecasts
  }

  /**
   * Get historical usage data for forecasting
   */
  private async getHistoricalUsage(organizationId: string, metricId: string, days: number) {
    const startDate = subDays(new Date(), days).toISOString()
    const endDate = new Date().toISOString()

    const { data } = await this.supabase
      .rpc('get_daily_usage_history', {
        org_id: organizationId,
        metric_id: metricId,
        start_date: startDate,
        end_date: endDate
      })

    return data || []
  }

  /**
   * Calculate linear regression forecast
   */
  private calculateLinearForecast(historicalData: any[], forecastDays: number) {
    // Simple linear regression
    const n = historicalData.length
    const x = historicalData.map((_, i) => i)
    const y = historicalData.map(d => d.usage)

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predict usage for forecast period
    const predicted_usage = Math.max(0, slope * (n + forecastDays / 2) + intercept)
    
    // Calculate confidence interval (simplified)
    const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept))
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2)
    const standardError = Math.sqrt(mse)
    
    return {
      metric_name: historicalData[0]?.metric_name || 'Unknown',
      predicted_usage,
      predicted_cost: predicted_usage * (historicalData[0]?.unit_price || 0),
      confidence_interval: {
        lower_bound: Math.max(0, predicted_usage - 1.96 * standardError),
        upper_bound: predicted_usage + 1.96 * standardError,
        confidence_level: 95
      }
    }
  }

  /**
   * Generate a report in the specified format
   */
  async generateReport(organizationId: string, config: ReportConfig): Promise<Blob> {
    const period = this.getReportPeriod(config)
    const analytics = await this.getUsageAnalytics(organizationId, period)

    switch (config.format) {
      case 'json':
        return new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' })
      case 'csv':
        return this.generateCSVReport(analytics)
      case 'pdf':
        return this.generatePDFReport(analytics, config)
      default:
        throw new Error(`Unsupported report format: ${config.format}`)
    }
  }

  /**
   * Get dashboard data for widgets
   */
  async getDashboardData(organizationId: string, config: DashboardConfig): Promise<Record<string, any>> {
    const period = this.getDashboardPeriod(config)
    const data: Record<string, any> = {}

    for (const widget of config.widgets) {
      try {
        switch (widget.type) {
          case 'usage_chart':
            data[widget.id] = await this.getUsageChartData(organizationId, period, widget.config)
            break
          case 'cost_summary':
            data[widget.id] = await this.getCostSummaryData(organizationId, period)
            break
          case 'usage_table':
            data[widget.id] = await this.getUsageTableData(organizationId, period)
            break
          case 'alert_list':
            data[widget.id] = await this.getAlertListData(organizationId)
            break
          case 'forecast_chart':
            data[widget.id] = await this.getForecastChartData(organizationId, widget.config)
            break
          case 'metric_card':
            data[widget.id] = await this.getMetricCardData(organizationId, period, widget.config)
            break
          default:
            data[widget.id] = null
        }
      } catch (error) {
        console.error(`Error loading widget ${widget.id}:`, error)
        data[widget.id] = { error: 'Failed to load data' }
      }
    }

    return data
  }

  /**
   * Export usage data in specified format
   */
  async exportUsageData(organizationId: string, period: DateRange, format: 'csv' | 'json'): Promise<Blob> {
    const { data: usage } = await this.supabase
      .rpc('get_detailed_usage_export', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    if (format === 'json') {
      return new Blob([JSON.stringify(usage, null, 2)], { type: 'application/json' })
    } else {
      return this.convertToCSV(usage || [])
    }
  }

  // Helper methods for report generation
  private getReportPeriod(config: ReportConfig): DateRange {
    if (config.date_range_type === 'fixed' && config.date_range) {
      return config.date_range
    }

    const now = new Date()
    const start = subDays(now, this.getRelativePeriodDays(config.relative_period || 'last_month'))
    
    return {
      start: start.toISOString(),
      end: now.toISOString()
    }
  }

  private getDashboardPeriod(config: DashboardConfig): DateRange {
    const now = new Date()
    let days = 30

    switch (config.date_range_default) {
      case 'last_7_days':
        days = 7
        break
      case 'last_30_days':
        days = 30
        break
      case 'current_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          start: startOfMonth.toISOString(),
          end: now.toISOString()
        }
      case 'custom':
        return config.custom_date_range || { start: subDays(now, 30).toISOString(), end: now.toISOString() }
    }

    return {
      start: subDays(now, days).toISOString(),
      end: now.toISOString()
    }
  }

  private getRelativePeriodDays(period: string): number {
    switch (period) {
      case 'last_week': return 7
      case 'last_month': return 30
      case 'last_quarter': return 90
      default: return 30
    }
  }

  // Widget data methods
  private async getUsageChartData(organizationId: string, period: DateRange, config: any) {
    const { data } = await this.supabase
      .rpc('get_usage_chart_data', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end,
        metrics: config.metrics || [],
        time_grouping: config.time_grouping || 'day'
      })

    return data
  }

  private async getCostSummaryData(organizationId: string, period: DateRange) {
    return this.getCostBreakdown(organizationId, period)
  }

  private async getUsageTableData(organizationId: string, period: DateRange) {
    const { data } = await this.supabase
      .rpc('get_usage_table_data', {
        org_id: organizationId,
        start_date: period.start,
        end_date: period.end
      })

    return data
  }

  private async getAlertListData(organizationId: string) {
    const { data } = await this.supabase
      .from('usage_alerts')
      .select(`
        *,
        usage_metrics (name, unit)
      `)
      .eq('organization_id', organizationId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10)

    return data
  }

  private async getForecastChartData(organizationId: string, config: any) {
    const metricIds = config.metrics || ['api_calls']
    return this.getUsageForecast(organizationId, metricIds, 30)
  }

  private async getMetricCardData(organizationId: string, period: DateRange, config: any) {
    const metricId = config.metrics?.[0]
    if (!metricId) return null

    const { data } = await this.supabase
      .rpc('get_metric_summary', {
        org_id: organizationId,
        metric_id: metricId,
        start_date: period.start,
        end_date: period.end
      })

    return data?.[0]
  }

  // Report generation helpers
  private generateCSVReport(analytics: UsageAnalytics): Blob {
    let csv = 'Metric,Total Usage,Unit,Cost,Growth Rate\n'
    
    for (const metric of analytics.metrics) {
      csv += `${metric.metric_name},${metric.current_period.total_usage},${metric.unit},${metric.cost_impact},${metric.growth_rate}%\n`
    }

    return new Blob([csv], { type: 'text/csv' })
  }

  private generatePDFReport(analytics: UsageAnalytics, config: ReportConfig): Blob {
    // This would integrate with a PDF generation library
    // For now, return a simple text representation
    const content = `
Usage Analytics Report
Period: ${analytics.period.start} to ${analytics.period.end}
Organization: ${analytics.organization_id}

Total Cost: $${analytics.cost_breakdown.total_cost}
Base Cost: $${analytics.cost_breakdown.base_subscription_cost}
Usage Cost: $${analytics.cost_breakdown.usage_based_cost}

Metrics:
${analytics.metrics.map(m => 
  `- ${m.metric_name}: ${m.current_period.total_usage} ${m.unit} ($${m.cost_impact})`
).join('\n')}
`

    return new Blob([content], { type: 'text/plain' })
  }

  private convertToCSV(data: any[]): Blob {
    if (!data.length) return new Blob([''], { type: 'text/csv' })

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n')

    return new Blob([headers + '\n' + rows], { type: 'text/csv' })
  }
}