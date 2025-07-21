// Analytics and reporting types

export interface UsageAnalytics {
  organization_id: string
  period: DateRange
  metrics: MetricAnalytics[]
  trends: UsageTrend[]
  cost_breakdown: CostBreakdown
  forecasts: UsageForecast[]
  generated_at: string
}

export interface MetricAnalytics {
  metric_id: string
  metric_name: string
  unit: string
  current_period: PeriodUsage
  previous_period: PeriodUsage
  growth_rate: number
  trend_direction: 'up' | 'down' | 'stable'
  peak_usage: PeakUsage
  average_daily_usage: number
  cost_impact: number
}

export interface PeriodUsage {
  total_usage: number
  average_daily: number
  peak_day: string
  peak_value: number
  days_with_usage: number
  total_cost: number
}

export interface PeakUsage {
  date: string
  value: number
  percentage_of_limit: number
}

export interface UsageTrend {
  metric_id: string
  metric_name: string
  data_points: TrendDataPoint[]
  trend_type: 'linear' | 'exponential' | 'seasonal' | 'irregular'
  correlation_coefficient: number
  seasonality_detected: boolean
}

export interface TrendDataPoint {
  date: string
  value: number
  cost: number
  percentage_of_limit?: number
}

export interface CostBreakdown {
  total_cost: number
  base_subscription_cost: number
  usage_based_cost: number
  overage_cost: number
  currency: string
  cost_by_metric: MetricCost[]
  period: DateRange
}

export interface MetricCost {
  metric_id: string
  metric_name: string
  total_cost: number
  percentage_of_total: number
  usage_amount: number
  unit: string
  effective_rate: number
}

export interface UsageForecast {
  metric_id: string
  metric_name: string
  forecast_period: DateRange
  predicted_usage: number
  predicted_cost: number
  confidence_interval: ConfidenceInterval
  methodology: 'linear_regression' | 'seasonal_decomposition' | 'moving_average'
  factors_considered: string[]
}

export interface ConfidenceInterval {
  lower_bound: number
  upper_bound: number
  confidence_level: number // e.g., 95 for 95%
}

// Dashboard and visualization types
export interface DashboardConfig {
  organization_id: string
  layout: DashboardLayout
  widgets: DashboardWidget[]
  refresh_interval: number // in seconds
  date_range_default: 'last_7_days' | 'last_30_days' | 'current_month' | 'custom'
  custom_date_range?: DateRange
}

export interface DashboardLayout {
  grid_columns: number
  grid_rows: number
  widgets_positions: WidgetPosition[]
}

export interface WidgetPosition {
  widget_id: string
  x: number
  y: number
  width: number
  height: number
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  config: WidgetConfig
  data_source: DataSource
  refresh_rate?: number // in seconds, overrides dashboard default
  is_visible: boolean
}

export type WidgetType = 
  | 'usage_chart'
  | 'cost_summary'
  | 'usage_table'
  | 'alert_list'
  | 'forecast_chart'
  | 'metric_card'
  | 'cost_breakdown_pie'
  | 'trend_comparison'

export interface WidgetConfig {
  chart_type?: 'line' | 'bar' | 'area' | 'pie' | 'doughnut'
  metrics?: string[] // metric IDs to display
  time_grouping?: 'hour' | 'day' | 'week' | 'month'
  show_forecast?: boolean
  show_limits?: boolean
  color_scheme?: string
  display_format?: 'table' | 'cards' | 'list'
}

export interface DataSource {
  type: 'usage_metrics' | 'billing_data' | 'alerts' | 'forecasts'
  filters?: DataFilter[]
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count'
  group_by?: string[]
}

export interface DataFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

// Export and reporting types
export interface ReportConfig {
  name: string
  description: string
  schedule: ReportSchedule
  format: 'pdf' | 'csv' | 'json'
  recipients: string[] // email addresses
  sections: ReportSection[]
  filters?: DataFilter[]
  date_range_type: 'fixed' | 'relative'
  date_range?: DateRange
  relative_period?: 'last_week' | 'last_month' | 'last_quarter'
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  day_of_week?: number // 0-6, for weekly reports
  day_of_month?: number // 1-31, for monthly reports
  time: string // HH:MM format
  timezone: string
}

export interface ReportSection {
  type: 'summary' | 'detailed_usage' | 'cost_analysis' | 'trends' | 'forecasts'
  title: string
  include_charts: boolean
  metrics?: string[]
  time_grouping?: 'day' | 'week' | 'month'
}

// Date range helpers
export interface DateRange {
  start: string // ISO date string
  end: string // ISO date string
}

export interface QuickDateRange {
  label: string
  value: string
  start_date: () => string
  end_date: () => string
}

// Analytics service interface
export interface AnalyticsService {
  getUsageAnalytics(organizationId: string, period: DateRange): Promise<UsageAnalytics>
  generateReport(organizationId: string, config: ReportConfig): Promise<Blob>
  getDashboardData(organizationId: string, config: DashboardConfig): Promise<Record<string, any>>
  exportUsageData(organizationId: string, period: DateRange, format: 'csv' | 'json'): Promise<Blob>
  getUsageForecast(organizationId: string, metricIds: string[], days: number): Promise<UsageForecast[]>
}