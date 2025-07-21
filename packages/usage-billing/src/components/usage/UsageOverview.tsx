'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { Alert, AlertDescription } from '@nextsaas/ui'
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react'
import { useUsageBillingUsage } from '../providers/UsageBillingProvider'
import { UsageMetricCard } from './UsageMetricCard'
import { UsageAlerts } from './UsageAlerts'

interface UsageOverviewProps {
  className?: string
  showAlerts?: boolean
  showMetrics?: boolean
  maxMetrics?: number
}

export function UsageOverview({ 
  className = '',
  showAlerts = true,
  showMetrics = true,
  maxMetrics = 6
}: UsageOverviewProps) {
  const {
    usage,
    alerts,
    stats,
    isLoading,
    error,
    acknowledgeAlert
  } = useUsageBillingUsage()

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load usage data: {error}
        </AlertDescription>
      </Alert>
    )
  }

  const displayedUsage = usage.slice(0, maxMetrics)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMetrics}</div>
            <p className="text-xs text-muted-foreground">
              Active usage metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeAlerts}
              {stats.criticalAlerts > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {stats.criticalAlerts} critical
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limits Exceeded</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.limitsExceeded}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {stats.totalMetrics} metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageUsage).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per metric this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Alerts */}
      {showAlerts && alerts.length > 0 && (
        <UsageAlerts 
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
          isLoading={isLoading}
        />
      )}

      {/* Usage Metrics */}
      {showMetrics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Usage Metrics</h3>
            {usage.length > maxMetrics && (
              <Badge variant="secondary">
                Showing {maxMetrics} of {usage.length}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayedUsage.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedUsage.map((metric) => (
                <UsageMetricCard 
                  key={metric.metric_id}
                  metric={metric}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No usage data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start tracking usage to see metrics here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}