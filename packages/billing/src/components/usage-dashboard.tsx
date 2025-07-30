'use client'

import React from 'react'
import type { UsageMetric } from '../types'

interface UsageDashboardProps {
  organizationId: string
  metrics: UsageMetric[]
  isLoading: boolean
  className?: string
}

export function UsageDashboard({
  organizationId,
  metrics,
  isLoading,
  className = ''
}: UsageDashboardProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (metrics.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Usage Data</h3>
        <p className="text-gray-600">Start using features to see your usage metrics here.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Usage & Limits</h3>
        <div className="text-sm text-gray-500">
          Current billing period
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <UsageMetricCard key={metric.feature} metric={metric} />
        ))}
      </div>

      {/* Usage Alerts */}
      <UsageAlerts metrics={metrics} />
    </div>
  )
}

interface UsageMetricCardProps {
  metric: UsageMetric
}

function UsageMetricCard({ metric }: UsageMetricCardProps) {
  const getStatusColor = (percentage: number, isOverLimit: boolean) => {
    if (isOverLimit) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getProgressColor = (percentage: number, isOverLimit: boolean) => {
    if (isOverLimit) return 'bg-red-500'
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatFeatureName = (feature: string) => {
    return feature
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatUsageValue = (feature: string, value: number) => {
    switch (feature) {
      case 'storage_mb':
      case 'storage_gb':
        return feature.includes('gb') ? `${value} GB` : `${(value / 1024).toFixed(1)} GB`
      case 'api_calls':
        return value.toLocaleString()
      case 'users':
        return `${value} users`
      default:
        return value.toString()
    }
  }

  const cardColorClasses = getStatusColor(metric.percentage_used, metric.is_over_limit)
  const progressColorClasses = getProgressColor(metric.percentage_used, metric.is_over_limit)

  return (
    <div className={`border rounded-lg p-4 ${cardColorClasses}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-sm">
          {formatFeatureName(metric.feature)}
        </h4>
        {metric.is_over_limit && (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Used: {formatUsageValue(metric.feature, metric.current_usage)}</span>
          <span>
            {metric.limit > 0 
              ? `Limit: ${formatUsageValue(metric.feature, metric.limit)}`
              : 'Unlimited'
            }
          </span>
        </div>

        {metric.limit > 0 && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${progressColorClasses}`}
                style={{ 
                  width: `${Math.min(100, metric.percentage_used)}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <span>{metric.percentage_used.toFixed(1)}% used</span>
              {metric.is_over_limit ? (
                <span className="text-red-600 font-medium">
                  Over limit by {metric.current_usage - metric.limit}
                </span>
              ) : (
                <span>
                  {formatUsageValue(metric.feature, metric.limit - metric.current_usage)} remaining
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface UsageAlertsProps {
  metrics: UsageMetric[]
}

function UsageAlerts({ metrics }: UsageAlertsProps) {
  const criticalAlerts = metrics.filter(m => m.is_over_limit)
  const warningAlerts = metrics.filter(m => m.percentage_used >= 80 && !m.is_over_limit)

  if (criticalAlerts.length === 0 && warningAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                Usage Limits Exceeded
              </h4>
              <div className="mt-2 text-sm text-red-700">
                <p>You've exceeded your usage limits for:</p>
                <ul className="mt-1 list-disc list-inside">
                  {criticalAlerts.map(alert => (
                    <li key={alert.feature}>
                      {alert.feature.replace('_', ' ')} - {alert.current_usage.toLocaleString()} / {alert.limit.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Approaching Usage Limits
              </h4>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You're approaching your limits for:</p>
                <ul className="mt-1 list-disc list-inside">
                  {warningAlerts.map(alert => (
                    <li key={alert.feature}>
                      {alert.feature.replace('_', ' ')} - {alert.percentage_used.toFixed(0)}% used
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}