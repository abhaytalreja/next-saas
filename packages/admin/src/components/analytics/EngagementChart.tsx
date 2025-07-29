'use client'

import React from 'react'
import { AnalyticsChart } from './AnalyticsChart'
import { TimeSeriesData } from '../../types'
import { Activity, Eye, MousePointer, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@nextsaas/ui'

interface EngagementData extends TimeSeriesData {
  pageViews?: number
  sessionDuration?: number
  bounceRate?: number
  activeUsers?: number
}

interface EngagementChartProps {
  data: EngagementData[]
  loading?: boolean
  period?: string
  className?: string
  metric?: 'sessions' | 'pageviews' | 'duration' | 'bounce'
}

export function EngagementChart({ 
  data, 
  loading = false, 
  period = '7 days',
  className = '',
  metric = 'sessions'
}: EngagementChartProps) {
  // Calculate engagement metrics
  const calculateEngagementMetrics = () => {
    if (!data || data.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        averageBounceRate: 0,
        totalPageViews: 0,
        engagementScore: 0
      }
    }

    const totalSessions = data.reduce((sum, item) => sum + (item.value || 0), 0)
    const totalPageViews = data.reduce((sum, item) => sum + (item.pageViews || 0), 0)
    const averageSessionDuration = data.reduce((sum, item) => sum + (item.sessionDuration || 0), 0) / data.length
    const averageBounceRate = data.reduce((sum, item) => sum + (item.bounceRate || 0), 0) / data.length

    // Simple engagement score calculation
    const engagementScore = Math.max(0, Math.min(100, 
      (averageSessionDuration / 60) * 20 + // Duration factor (up to 20 points for 3+ min sessions)
      (1 - averageBounceRate / 100) * 30 + // Bounce rate factor (up to 30 points for low bounce)
      Math.min(totalPageViews / totalSessions, 5) * 10 // Pages per session (up to 50 points)
    ))

    return {
      totalSessions,
      averageSessionDuration,
      averageBounceRate,
      totalPageViews,
      engagementScore
    }
  }

  const { 
    totalSessions, 
    averageSessionDuration, 
    averageBounceRate, 
    totalPageViews,
    engagementScore 
  } = calculateEngagementMetrics()

  const getMetricConfig = () => {
    switch (metric) {
      case 'sessions':
        return {
          title: 'User Sessions',
          icon: Activity,
          dataKey: 'value',
          color: '#8b5cf6',
          formatValue: (value: number) => value.toLocaleString(),
          description: 'Active user sessions'
        }
      case 'pageviews':
        return {
          title: 'Page Views',
          icon: Eye,
          dataKey: 'pageViews',
          color: '#06b6d4',
          formatValue: (value: number) => value.toLocaleString(),
          description: 'Total page views'
        }
      case 'duration':
        return {
          title: 'Session Duration',
          icon: Clock,
          dataKey: 'sessionDuration',
          color: '#f59e0b',
          formatValue: (value: number) => `${Math.round(value / 60)}m ${Math.round(value % 60)}s`,
          description: 'Average session duration'
        }
      case 'bounce':
        return {
          title: 'Bounce Rate',
          icon: MousePointer,
          dataKey: 'bounceRate',
          color: '#ef4444',
          formatValue: (value: number) => `${value.toFixed(1)}%`,
          description: 'Percentage of single-page sessions'
        }
      default:
        return {
          title: 'Engagement',
          icon: Activity,
          dataKey: 'value',
          color: '#8b5cf6',
          formatValue: (value: number) => value.toLocaleString(),
          description: 'User engagement metrics'
        }
    }
  }

  const config = getMetricConfig()
  const IconComponent = config.icon

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const engagementLevel = getEngagementLevel(engagementScore)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconComponent className={`h-4 w-4`} style={{ color: config.color }} />
          {config.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {period}
          </Badge>
          {metric === 'sessions' && !loading && (
            <Badge 
              variant="outline" 
              className={`text-xs ${engagementLevel.color} ${engagementLevel.bg}`}
            >
              {engagementLevel.level}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current metric display */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '---' : 
                  metric === 'sessions' ? totalSessions.toLocaleString() :
                  metric === 'pageviews' ? totalPageViews.toLocaleString() :
                  metric === 'duration' ? formatDuration(averageSessionDuration) :
                  metric === 'bounce' ? `${averageBounceRate.toFixed(1)}%` :
                  totalSessions.toLocaleString()
                }
              </div>
              <div className="text-sm text-gray-600">{config.description}</div>
            </div>
            {metric === 'sessions' && !loading && (
              <div className="text-right">
                <div className="text-lg font-semibold text-purple-600">
                  {engagementScore.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Engagement Score</div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="h-64">
            <AnalyticsChart
              data={data}
              type="line"
              dataKey={config.dataKey}
              xAxisKey="date"
              height={256}
              color={config.color}
              loading={loading}
              formatValue={config.formatValue}
              title={`${config.title} Over Time`}
            />
          </div>

          {/* Engagement insights */}
          {!loading && data && data.length > 0 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">Total Sessions</div>
                  <div className="text-gray-600">{totalSessions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Avg Duration</div>
                  <div className="text-gray-600">{formatDuration(averageSessionDuration)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Bounce Rate</div>
                  <div className="text-gray-600">{averageBounceRate.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Page Views</div>
                  <div className="text-gray-600">{totalPageViews.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement tips */}
          {metric === 'sessions' && !loading && engagementScore < 60 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-sm">
                <div className="font-medium text-yellow-800 mb-1">Engagement Tips:</div>
                <ul className="text-yellow-700 text-xs space-y-1">
                  {averageBounceRate > 60 && <li>• Improve page load speed to reduce bounce rate</li>}
                  {averageSessionDuration < 120 && <li>• Add more engaging content to increase session duration</li>}
                  {totalPageViews / totalSessions < 2 && <li>• Improve internal linking to increase pages per session</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}