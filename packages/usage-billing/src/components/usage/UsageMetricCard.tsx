'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { Progress } from '@nextsaas/ui'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import type { UsageSummary } from '../../types'

interface UsageMetricCardProps {
  metric: UsageSummary
  className?: string
  showTrend?: boolean
  showCost?: boolean
}

export function UsageMetricCard({ 
  metric, 
  className = '',
  showTrend = true,
  showCost = true
}: UsageMetricCardProps) {
  // Calculate percentage change
  const percentageChange = metric.previous_period_usage 
    ? ((metric.total_usage - metric.previous_period_usage) / metric.previous_period_usage) * 100
    : 0

  // Determine trend
  const getTrendIcon = () => {
    if (percentageChange > 5) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (percentageChange < -5) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    if (percentageChange > 5) return 'text-green-600'
    if (percentageChange < -5) return 'text-red-600'
    return 'text-gray-400'
  }

  // Format numbers for display
  const formatUsage = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <Card className={`transition-all hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate">
          {metric.metric_name}
        </CardTitle>
        {showTrend && metric.previous_period_usage && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-xs ${getTrendColor()}`}>
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Usage */}
        <div>
          <div className="text-2xl font-bold">
            {formatUsage(metric.total_usage)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metric.unit} this period
          </p>
        </div>

        {/* Cost Information */}
        {showCost && metric.current_cost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cost:</span>
            <span className="text-sm font-medium">
              {formatCurrency(metric.current_cost)}
            </span>
          </div>
        )}

        {/* Previous Period Comparison */}
        {metric.previous_period_usage && (
          <div className="text-xs text-muted-foreground">
            Previous: {formatUsage(metric.previous_period_usage)} {metric.unit}
          </div>
        )}

        {/* Usage Progress Bar (if we have a limit) */}
        {/* This would require limit data - we'll add it when we have the limits context */}
      </CardContent>
    </Card>
  )
}

interface UsageMetricListProps {
  metrics: UsageSummary[]
  className?: string
  showTrend?: boolean
  showCost?: boolean
}

export function UsageMetricList({ 
  metrics, 
  className = '',
  showTrend = true,
  showCost = true
}: UsageMetricListProps) {
  if (metrics.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No metrics available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Usage data will appear here once tracking begins.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {metrics.map((metric) => (
        <UsageMetricCard
          key={metric.metric_id}
          metric={metric}
          showTrend={showTrend}
          showCost={showCost}
        />
      ))}
    </div>
  )
}