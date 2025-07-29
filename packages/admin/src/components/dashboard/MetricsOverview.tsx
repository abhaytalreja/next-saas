'use client'

import React from 'react'
import { AdminMetrics } from '../../types'

interface MetricsOverviewProps {
  metrics?: AdminMetrics
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  if (!metrics) {
    return (
      <div 
        className="bg-white rounded-lg shadow p-6"
        data-testid="metrics-overview"
        role="region"
        aria-labelledby="metrics-title"
      >
        <h3 
          id="metrics-title"
          className="text-lg font-medium text-gray-900 mb-4"
        >
          Platform Metrics
        </h3>
        <div className="animate-pulse" data-testid="metrics-loading">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3" data-testid="skeleton-item">
                <div className="h-4 bg-gray-200 rounded w-3/4" data-testid="skeleton-title"></div>
                <div className="h-8 bg-gray-200 rounded" data-testid="skeleton-value"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg shadow p-6"
      data-testid="metrics-overview"
      role="region"
      aria-labelledby="metrics-title"
    >
      <h3 
        id="metrics-title"
        className="text-lg font-medium text-gray-900 mb-6"
      >
        Platform Metrics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="metrics-grid">
        {/* User Metrics */}
        <div className="space-y-4" data-testid="metrics-section">
          <h4 className="font-medium text-gray-900">User Analytics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Users (7d)</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.activeUsers?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Users Today</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.newUsersToday?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User Retention</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.userRetentionRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="space-y-4" data-testid="metrics-section">
          <h4 className="font-medium text-gray-900">Revenue Analytics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Revenue Per User</span>
              <span className="text-sm font-medium text-gray-900">
                ${metrics.averageRevenuePerUser || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.churnRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="text-sm font-medium text-gray-900">
                ${metrics.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="space-y-4" data-testid="metrics-section">
          <h4 className="font-medium text-gray-900">System Performance</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.apiResponseTime || 0}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.errorRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email Delivery Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.emailDeliveryRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}