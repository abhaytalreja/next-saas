'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import type { UsageMetrics as UsageData, UsageAlert } from '../../types/billing'

interface UsageMetricsProps {
  period?: 'day' | 'week' | 'month' | 'year'
  onPeriodChange?: (period: 'day' | 'week' | 'month' | 'year') => void
  className?: string
}

// Mock usage history data
const USAGE_HISTORY = {
  projects: [
    { date: '2024-01-01', value: 8 },
    { date: '2024-01-02', value: 9 },
    { date: '2024-01-03', value: 10 },
    { date: '2024-01-04', value: 11 },
    { date: '2024-01-05', value: 12 },
    { date: '2024-01-06', value: 12 },
    { date: '2024-01-07', value: 12 }
  ],
  storage: [
    { date: '2024-01-01', value: 2.1 },
    { date: '2024-01-02', value: 2.3 },
    { date: '2024-01-03', value: 2.8 },
    { date: '2024-01-04', value: 3.0 },
    { date: '2024-01-05', value: 3.1 },
    { date: '2024-01-06', value: 3.2 },
    { date: '2024-01-07', value: 3.2 }
  ],
  api_calls: [
    { date: '2024-01-01', value: 8500 },
    { date: '2024-01-02', value: 9200 },
    { date: '2024-01-03', value: 11800 },
    { date: '2024-01-04', value: 13400 },
    { date: '2024-01-05', value: 14900 },
    { date: '2024-01-06', value: 15200 },
    { date: '2024-01-07', value: 15420 }
  ],
  team_members: [
    { date: '2024-01-01', value: 6 },
    { date: '2024-01-02', value: 7 },
    { date: '2024-01-03', value: 7 },
    { date: '2024-01-04', value: 8 },
    { date: '2024-01-05', value: 8 },
    { date: '2024-01-06', value: 8 },
    { date: '2024-01-07', value: 8 }
  ]
}

export function UsageMetrics({
  period = 'month',
  onPeriodChange,
  className = ''
}: UsageMetricsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [alerts, setAlerts] = useState<UsageAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('projects')
  const [showDetails, setShowDetails] = useState(false)

  const { currentOrganization, canManageBilling } = useOrganization()

  useEffect(() => {
    if (currentOrganization?.id) {
      loadUsageData()
    }
  }, [currentOrganization?.id, period])

  const loadUsageData = async () => {
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockUsage: UsageData = {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        projects: { used: 12, limit: 50 },
        storage: { used: 3.2, limit: 10, unit: 'GB' },
        api_calls: { used: 15420, limit: 100000 },
        team_members: { used: 8, limit: 25 }
      }

      const mockAlerts: UsageAlert[] = [
        {
          id: '1',
          metric: 'storage',
          threshold: 75,
          current_usage: 32,
          triggered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          severity: 'warning',
          message: 'Storage usage is approaching 75% of your limit'
        }
      ]

      setUsage(mockUsage)
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.round((used / limit) * 100)
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'red', status: 'Critical' }
    if (percentage >= 75) return { color: 'yellow', status: 'Warning' }
    if (percentage >= 50) return { color: 'blue', status: 'Normal' }
    return { color: 'green', status: 'Low' }
  }

  const formatValue = (value: number, unit?: string) => {
    if (unit) {
      return `${value} ${unit}`
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString()
  }

  const renderMiniChart = (data: { date: string; value: number }[]) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue || 1

    return (
      <div className="flex items-end space-x-1 h-8">
        {data.map((point, index) => {
          const height = ((point.value - minValue) / range) * 100
          return (
            <div
              key={index}
              className="bg-blue-200 w-1 rounded-t"
              style={{ height: `${Math.max(height, 10)}%` }}
              title={`${point.date}: ${point.value}`}
            />
          )
        })}
      </div>
    )
  }

  if (!canManageBilling()) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Access Denied</div>
        <p className="text-gray-500">You don't have permission to view usage metrics</p>
      </div>
    )
  }

  if (isLoading) {
    return <UsageMetricsSkeleton />
  }

  if (!usage) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No usage data available</p>
      </div>
    )
  }

  const metrics = [
    {
      key: 'projects',
      name: 'Projects',
      icon: '📁',
      used: usage.projects.used,
      limit: usage.projects.limit,
      unit: undefined,
      history: USAGE_HISTORY.projects
    },
    {
      key: 'storage',
      name: 'Storage',
      icon: '💾',
      used: usage.storage.used,
      limit: usage.storage.limit,
      unit: usage.storage.unit,
      history: USAGE_HISTORY.storage
    },
    {
      key: 'api_calls',
      name: 'API Calls',
      icon: '🔄',
      used: usage.api_calls.used,
      limit: usage.api_calls.limit,
      unit: undefined,
      history: USAGE_HISTORY.api_calls
    },
    {
      key: 'team_members',
      name: 'Team Members',
      icon: '👥',
      used: usage.team_members.used,
      limit: usage.team_members.limit,
      unit: undefined,
      history: USAGE_HISTORY.team_members
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Usage Metrics</h2>
          <p className="text-gray-600 mt-1">
            Monitor your resource consumption and limits
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className={`h-5 w-5 ${
                      alert.severity === 'critical'
                        ? 'text-red-400'
                        : alert.severity === 'warning'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3
                    className={`text-sm font-medium ${
                      alert.severity === 'critical'
                        ? 'text-red-800'
                        : alert.severity === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}
                  >
                    Usage Alert
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      alert.severity === 'critical'
                        ? 'text-red-700'
                        : alert.severity === 'warning'
                        ? 'text-yellow-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.triggered_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const percentage = getUsagePercentage(metric.used, metric.limit)
          const status = getUsageStatus(percentage)
          
          return (
            <div
              key={metric.key}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(metric.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{metric.icon}</span>
                  <h3 className="font-medium text-gray-900">{metric.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}
                >
                  {status.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.used, metric.unit)}
                  </span>
                  <span className="text-gray-600 ml-1">
                    / {metric.limit === -1 ? '∞' : formatValue(metric.limit, metric.unit)}
                  </span>
                </div>
                
                {metric.limit !== -1 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${status.color}-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {percentage}% used
                    </p>
                  </div>
                )}
              </div>

              {/* Mini Chart */}
              <div className="mb-2">
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  7-day trend
                </h4>
                {renderMiniChart(metric.history)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed View Button */}
      <div className="text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showDetails ? 'Hide' : 'Show'} Detailed Analytics
          <svg
            className={`ml-2 -mr-1 h-4 w-4 transition-transform ${
              showDetails ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Detailed Analytics */}
      {showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Detailed Analytics
          </h3>
          
          {/* Metric Selector */}
          <div className="flex space-x-2 mb-6">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {metric.icon} {metric.name}
              </button>
            ))}
          </div>

          {/* Selected Metric Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                {metrics.find(m => m.key === selectedMetric)?.name} Usage Over Time
              </h4>
              <div className="h-48 flex items-end justify-between space-x-1 border-b border-l border-gray-200 p-4">
                {USAGE_HISTORY[selectedMetric as keyof typeof USAGE_HISTORY]?.map((point, index) => {
                  const maxValue = Math.max(
                    ...USAGE_HISTORY[selectedMetric as keyof typeof USAGE_HISTORY].map(d => d.value)
                  )
                  const height = (point.value / maxValue) * 100

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 w-8 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${point.date}: ${point.value}`}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        {new Date(point.date).getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Usage Insights</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">
                    Peak Usage
                  </h5>
                  <p className="text-sm text-gray-600">
                    Highest usage was on January 7th with{' '}
                    {USAGE_HISTORY[selectedMetric as keyof typeof USAGE_HISTORY]?.[6]?.value} units
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">
                    Growth Rate
                  </h5>
                  <p className="text-sm text-gray-600">
                    +44% increase over the last 7 days
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-1">
                    Projected Usage
                  </h5>
                  <p className="text-sm text-gray-600">
                    At current growth rate, you'll reach{' '}
                    {Math.round(
                      USAGE_HISTORY[selectedMetric as keyof typeof USAGE_HISTORY]?.[6]?.value * 1.2
                    )}{' '}
                    units by month end
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading skeleton
function UsageMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}