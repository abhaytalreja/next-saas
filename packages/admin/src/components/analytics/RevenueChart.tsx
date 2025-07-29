'use client'

import React from 'react'
import { AnalyticsChart } from './AnalyticsChart'
import { TimeSeriesData } from '../../types'
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@nextsaas/ui'

interface RevenueChartProps {
  data: TimeSeriesData[]
  loading?: boolean
  period?: string
  target?: number
  className?: string
  showMRR?: boolean
}

export function RevenueChart({ 
  data, 
  loading = false, 
  period = '30 days',
  target,
  className = '',
  showMRR = true
}: RevenueChartProps) {
  // Calculate revenue metrics
  const calculateRevenueMetrics = () => {
    if (!data || data.length < 2) {
      return { 
        growthRate: 0, 
        trend: 'stable' as const, 
        currentRevenue: 0,
        totalRevenue: 0,
        averageRevenue: 0
      }
    }

    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    const currentRevenue = latest.value
    const totalRevenue = data.reduce((sum, item) => sum + item.value, 0)
    const averageRevenue = totalRevenue / data.length
    
    const growthRate = previous.value > 0 
      ? ((latest.value - previous.value) / previous.value) * 100 
      : 0

    const trend = growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'

    return { growthRate, trend, currentRevenue, totalRevenue, averageRevenue }
  }

  const { growthRate, trend, currentRevenue, totalRevenue, averageRevenue } = calculateRevenueMetrics()

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const calculateTargetProgress = () => {
    if (!target || currentRevenue === 0) return 0
    return Math.min((currentRevenue / target) * 100, 100)
  }

  const targetProgress = calculateTargetProgress()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          {showMRR ? 'Monthly Recurring Revenue' : 'Revenue Growth'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {period}
          </Badge>
          {!loading && (
            <div className="flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend === 'stable' ? '0%' : `${Math.abs(growthRate).toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current metrics */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '---' : formatCurrency(currentRevenue)}
              </div>
              <div className="text-sm text-gray-600">
                {showMRR ? 'Current MRR' : 'Current Revenue'}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {loading ? '---' : trend === 'stable' ? 'No change' : 
                  `${trend === 'up' ? '+' : ''}${growthRate.toFixed(1)}%`}
              </div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>

          {/* Target progress */}
          {target && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Target Progress</span>
                </div>
                <span className="font-medium">
                  {targetProgress.toFixed(0)}% of {formatCurrency(target)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-64">
            <AnalyticsChart
              data={data}
              type="area"
              dataKey="value"
              xAxisKey="date"
              height={256}
              color="#10b981"
              loading={loading}
              formatValue={formatCurrency}
              title="Revenue Growth Over Time"
            />
          </div>

          {/* Revenue insights */}
          {!loading && data && data.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Total Revenue</div>
                  <div className="text-gray-600">{formatCurrency(totalRevenue)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Average Revenue</div>
                  <div className="text-gray-600">{formatCurrency(averageRevenue)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Peak Revenue</div>
                  <div className="text-gray-600">
                    {formatCurrency(Math.max(...data.map(d => d.value)))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}