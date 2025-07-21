// Usage tracking and measurement types

export interface UsageEvent {
  id: string
  organization_id: string
  user_id?: string
  event_type: UsageEventType
  event_name: string
  quantity: number
  unit: string
  metadata?: Record<string, any>
  timestamp: string
  recorded_at: string
}

export type UsageEventType = 
  | 'api_call'
  | 'storage_usage'
  | 'bandwidth_usage'
  | 'compute_time'
  | 'feature_usage'
  | 'custom_metric'

export interface UsageMetric {
  id: string
  name: string
  description: string
  unit: string
  aggregation_type: 'sum' | 'max' | 'min' | 'avg' | 'count'
  category: string
  is_billable: boolean
  created_at: string
  updated_at: string
}

export interface UsageSummary {
  organization_id: string
  metric_id: string
  metric_name: string
  period_start: string
  period_end: string
  total_usage: number
  unit: string
  current_cost: number
  previous_period_usage?: number
  percentage_change?: number
}

export interface UsageLimit {
  id: string
  organization_id: string
  metric_id: string
  limit_type: 'hard' | 'soft' | 'billing_only'
  limit_value: number
  current_usage: number
  reset_period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  is_active: boolean
  notification_thresholds: number[] // [50, 80, 95] for 50%, 80%, 95%
  created_at: string
  updated_at: string
}

export interface UsageAlert {
  id: string
  organization_id: string
  metric_id: string
  alert_type: 'threshold_exceeded' | 'limit_exceeded' | 'anomaly_detected'
  threshold_percentage?: number
  current_usage: number
  limit_value: number
  message: string
  severity: 'info' | 'warning' | 'critical'
  is_resolved: boolean
  created_at: string
  resolved_at?: string
}

// Real-time usage tracking
export interface UsageTracker {
  track(event: Omit<UsageEvent, 'id' | 'recorded_at'>): Promise<void>
  getUsage(organizationId: string, metricId: string, period?: DateRange): Promise<UsageSummary>
  getCurrentUsage(organizationId: string): Promise<UsageSummary[]>
  checkLimits(organizationId: string): Promise<UsageLimit[]>
  getAlerts(organizationId: string, unresolved?: boolean): Promise<UsageAlert[]>
}

export interface DateRange {
  start: string
  end: string
}

// Usage context for React components
export interface UsageContextValue {
  currentUsage: UsageSummary[]
  limits: UsageLimit[]
  alerts: UsageAlert[]
  isLoading: boolean
  error: string | null
  trackUsage: (event: Omit<UsageEvent, 'id' | 'recorded_at'>) => Promise<void>
  refreshUsage: () => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
}