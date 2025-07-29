'use client'

import React from 'react'
import { DashboardGrid } from './DashboardGrid'
import { StatsCard } from './StatsCard'
import { MetricsOverview } from './MetricsOverview'
import { useAdminDashboard } from '../../hooks/useAdminDashboard'
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics'
import { Users, Building2, DollarSign, Activity, Mail, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'

export function AdminDashboard() {
  const { data: metrics, isLoading, error } = useAdminDashboard()
  const { metrics: realTimeMetrics, isConnected, refresh } = useRealTimeMetrics()
  
  // Merge static metrics with real-time updates
  const combinedMetrics = { ...metrics, ...realTimeMetrics }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading dashboard
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor your platform's performance and manage system resources.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={combinedMetrics?.totalUsers || 0}
          change={combinedMetrics?.userGrowthRate || 0}
          trend={combinedMetrics?.userGrowthRate && combinedMetrics.userGrowthRate > 0 ? 'up' : 'down'}
          icon={Users}
          description="Active platform users"
          realTime={isConnected}
        />
        <StatsCard
          title="Organizations"
          value={combinedMetrics?.totalOrganizations || 0}
          change={combinedMetrics?.organizationGrowthRate || 0}
          trend={combinedMetrics?.organizationGrowthRate && combinedMetrics.organizationGrowthRate > 0 ? 'up' : 'down'}
          icon={Building2}
          description="Active organizations"
          realTime={isConnected}
        />
        <StatsCard
          title="Monthly Revenue"
          value={combinedMetrics?.monthlyRecurringRevenue || 0}
          change={combinedMetrics?.revenueGrowthRate || 0}
          trend={combinedMetrics?.revenueGrowthRate && combinedMetrics.revenueGrowthRate > 0 ? 'up' : 'down'}
          icon={DollarSign}
          description="MRR this month"
          format="currency"
        />
        <StatsCard
          title="System Uptime"
          value={combinedMetrics?.systemUptime || 0}
          change={0}
          trend="stable"
          icon={Activity}
          description="System availability"
          format="percentage"
          realTime={isConnected}
        />
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid>
        {/* System Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics?.apiResponseTime || 0}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics?.errorRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics?.activeConnections || 0}
                </div>
                <div className="text-sm text-gray-600">Active Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics?.emailsSentToday || 0}
                </div>
                <div className="text-sm text-gray-600">Emails Sent Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {metrics?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Building2 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Organizations</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Email Campaigns</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">System Health</span>
              </button>
            </div>
          </div>
        </div>
      </DashboardGrid>

      {/* Metrics Overview */}
      <MetricsOverview metrics={metrics || undefined} />
    </div>
  )
}