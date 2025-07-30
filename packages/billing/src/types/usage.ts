export interface UsageRecord {
  id: string
  organization_id: string
  feature: string
  usage_count: number
  usage_limit?: number
  period_start: string
  period_end: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UsageMetric {
  feature: string
  current_usage: number
  limit: number
  percentage_used: number
  is_over_limit: boolean
  period_start: string
  period_end: string
}

export interface UsageAlert {
  id: string
  organization_id: string
  feature: string
  threshold_percentage: number
  is_triggered: boolean
  message: string
  created_at: string
}

export interface UsageTrackerConfig {
  features: Record<string, FeatureConfig>
  reporting_interval: 'daily' | 'weekly' | 'monthly'
  alert_thresholds: number[]
}

export interface FeatureConfig {
  name: string
  description: string
  unit: string
  default_limit: number
  overage_allowed: boolean
  overage_rate?: number
}

export type UsageEventType = 
  | 'api_call'
  | 'storage_mb'
  | 'bandwidth_gb'
  | 'users'
  | 'projects'
  | 'custom'

export interface UsageEvent {
  organization_id: string
  feature: UsageEventType | string
  quantity: number
  timestamp?: Date
  metadata?: Record<string, any>
}

export interface UsageSummary {
  organization_id: string
  period_start: string
  period_end: string
  features: Record<string, {
    usage: number
    limit: number
    percentage: number
    overage: number
  }>
  total_overage_cost: number
}