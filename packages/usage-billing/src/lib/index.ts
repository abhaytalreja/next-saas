// Utility functions for usage-billing package

export function formatUsage(value: number, unit?: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit ? ` ${unit}` : ''}`
  }
  return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function calculateUsagePercentage(current: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min((current / limit) * 100, 100)
}

export function getUsageTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const threshold = 5 // 5% threshold for "stable"
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
  
  if (change > threshold) return 'up'
  if (change < -threshold) return 'down'
  return 'stable'
}

export function calculateCostPerUnit(totalCost: number, totalUsage: number): number {
  return totalUsage > 0 ? totalCost / totalUsage : 0
}

export function generateUsageId(): string {
  return `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Date range helpers
export function getDefaultDateRange(days = 30): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
  }
  
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
}

// Color helpers for charts and status indicators
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 100) return 'red'
  if (percentage >= 90) return 'orange'
  if (percentage >= 80) return 'yellow'
  return 'green'
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'critical': return 'red'
    case 'high': return 'orange'
    case 'medium': return 'yellow'
    case 'low': return 'blue'
    default: return 'gray'
  }
}

// Validation helpers
export function validateUsageEvent(event: any): string[] {
  const errors: string[] = []
  
  if (!event.organization_id) errors.push('Organization ID is required')
  if (!event.event_type) errors.push('Event type is required')
  if (!event.event_name) errors.push('Event name is required')
  if (typeof event.quantity !== 'number' || event.quantity < 0) {
    errors.push('Quantity must be a non-negative number')
  }
  if (!event.unit) errors.push('Unit is required')
  if (!event.timestamp) errors.push('Timestamp is required')
  
  return errors
}

export function validateUsageLimit(limit: any): string[] {
  const errors: string[] = []
  
  if (!limit.organization_id) errors.push('Organization ID is required')
  if (!limit.metric_id) errors.push('Metric ID is required')
  if (!['hard', 'soft', 'billing_only'].includes(limit.limit_type)) {
    errors.push('Invalid limit type')
  }
  if (typeof limit.limit_value !== 'number' || limit.limit_value <= 0) {
    errors.push('Limit value must be a positive number')
  }
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(limit.reset_period)) {
    errors.push('Invalid reset period')
  }
  
  return errors
}

// Constants
export const USAGE_EVENT_TYPES = [
  'api_call',
  'storage_usage',
  'bandwidth_usage',
  'compute_time',
  'feature_usage',
  'custom_metric'
] as const

export const LIMIT_TYPES = [
  'hard',
  'soft',
  'billing_only'
] as const

export const RESET_PERIODS = [
  'daily',
  'weekly', 
  'monthly',
  'yearly'
] as const

export const SEVERITY_LEVELS = [
  'low',
  'medium',
  'high',
  'critical'
] as const