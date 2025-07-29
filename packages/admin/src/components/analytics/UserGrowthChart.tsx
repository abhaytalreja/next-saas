'use client'

import React from 'react'
import { AnalyticsChart } from './AnalyticsChart'
import { TimeSeriesData } from '../../types'
import { TrendingUp, TrendingDown, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@nextsaas/ui'

interface UserGrowthChartProps {
  data: TimeSeriesData[]
  loading?: boolean
  period?: string
  className?: string
}

export function UserGrowthChart({ 
  data, 
  loading = false, 
  period = '30 days',
  className = '' 
}: UserGrowthChartProps) {
  // Calculate growth metrics
  const calculateGrowthMetrics = () => {
    if (!data || data.length < 2) {
      return { growthRate: 0, trend: 'stable' as const, totalUsers: 0 }
    }

    const latest = data[data.length - 1]
    const previous = data[data.length - 2]
    const totalUsers = latest.value
    const growthRate = previous.value > 0 
      ? ((latest.value - previous.value) / previous.value) * 100 
      : 0

    const trend = growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable'

    return { growthRate, trend, totalUsers }
  }

  const { growthRate, trend, totalUsers } = calculateGrowthMetrics()

  const formatUserCount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          User Growth
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
                {loading ? '---' : formatUserCount(totalUsers)}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
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

          {/* Chart */}
          <div className="h-64">
            <AnalyticsChart
              data={data}
              type="area"
              dataKey="value"
              xAxisKey="date"
              height={256}
              color="#3b82f6"
              loading={loading}
              formatValue={formatUserCount}
              title="User Growth Over Time"
            />
          </div>

          {/* Growth insights */}
          {!loading && data && data.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Peak Growth</div>
                  <div className="text-gray-600">
                    {Math.max(...data.map(d => d.value)).toLocaleString()} users
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Avg Daily Growth</div>
                  <div className="text-gray-600">
                    {data.length > 1 ? 
                      Math.round((data[data.length - 1].value - data[0].value) / data.length).toLocaleString() 
                      : '0'} users/day
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