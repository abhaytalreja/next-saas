import React, { forwardRef, useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity, ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface MetricCard {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    type: 'positive' | 'negative' | 'neutral'
    period?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  trend?: Array<{ label: string; value: number }>
  loading?: boolean
}

export interface ChartWidget {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area'
  data: any[]
  description?: string
  loading?: boolean
  height?: number
  config?: Record<string, any>
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: Date
  type: 'user' | 'system' | 'alert' | 'success' | 'warning'
  avatar?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  metrics?: MetricCard[]
  charts?: ChartWidget[]
  activities?: ActivityItem[]
  quickActions?: Array<{
    id: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }>
  layout?: 'default' | 'compact' | 'minimal'
  loading?: boolean
  error?: string
  onRefresh?: () => void
  customWidgets?: React.ReactNode
}

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

const getChangeIcon = (type: 'positive' | 'negative' | 'neutral') => {
  switch (type) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return TrendingDown
    default:
      return Activity
  }
}

const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
  switch (type) {
    case 'positive':
      return 'text-green-600'
    case 'negative':
      return 'text-red-600'
    default:
      return 'text-muted-foreground'
  }
}

const formatActivityTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  return date.toLocaleDateString()
}

const getActivityTypeStyles = (type: ActivityItem['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-600 border-green-200'
    case 'warning':
      return 'bg-amber-100 text-amber-600 border-amber-200'
    case 'alert':
      return 'bg-red-100 text-red-600 border-red-200'
    case 'system':
      return 'bg-blue-100 text-blue-600 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export const Dashboard = forwardRef<HTMLDivElement, DashboardProps>(
  ({ 
    title = 'Dashboard',
    subtitle,
    metrics = [],
    charts = [],
    activities = [],
    quickActions = [],
    layout = 'default',
    loading = false,
    error,
    onRefresh,
    customWidgets,
    className,
    ...props 
  }, ref) => {
    const [refreshing, setRefreshing] = useState(false)

    const handleRefresh = async () => {
      if (onRefresh) {
        setRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
        }
      }
    }

    const renderMetricCard = (metric: MetricCard) => {
      const Icon = metric.icon || BarChart3
      const ChangeIcon = metric.change ? getChangeIcon(metric.change.type) : null

      return (
        <div
          key={metric.id}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                {metric.loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-bold">
                    {typeof metric.value === 'number' 
                      ? formatNumber(metric.value) 
                      : metric.value
                    }
                  </p>
                )}
              </div>
            </div>

            {metric.change && !metric.loading && ChangeIcon && (
              <div className={cn(
                'flex items-center gap-1 text-sm',
                getChangeColor(metric.change.type)
              )}>
                <ChangeIcon className="h-4 w-4" />
                <span>{Math.abs(metric.change.value)}%</span>
              </div>
            )}
          </div>

          {metric.description && (
            <p className="text-xs text-muted-foreground mt-2">
              {metric.description}
            </p>
          )}

          {metric.change?.period && (
            <p className="text-xs text-muted-foreground mt-1">
              vs {metric.change.period}
            </p>
          )}
        </div>
      )
    }

    const renderChart = (chart: ChartWidget) => (
      <div
        key={chart.id}
        className="bg-card border border-border rounded-lg p-6"
        style={{ minHeight: chart.height || 300 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{chart.title}</h3>
            {chart.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {chart.description}
              </p>
            )}
          </div>
          <button className="p-1 hover:bg-muted rounded">
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {chart.loading ? (
          <div className="h-64 bg-muted animate-pulse rounded" />
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Chart placeholder - {chart.type}</p>
              <p className="text-xs">Integration with chart library needed</p>
            </div>
          </div>
        )}
      </div>
    )

    const renderActivity = (activity: ActivityItem) => {
      const Icon = activity.icon || Users

      return (
        <div key={activity.id} className="flex items-start gap-3 py-3">
          {activity.avatar ? (
            <img
              src={activity.avatar}
              alt=""
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center border text-xs',
              getActivityTypeStyles(activity.type)
            )}>
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatActivityTime(activity.timestamp)}
            </p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-destructive mb-2">
              <Activity className="h-8 w-8 mx-auto" />
            </div>
            <p className="font-medium">Unable to load dashboard</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {refreshing ? 'Retrying...' : 'Try again'}
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full space-y-6',
          layout === 'compact' && 'space-y-4',
          layout === 'minimal' && 'space-y-3',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    action.variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    action.variant === 'outline' && 'border border-input hover:bg-accent hover:text-accent-foreground',
                    (!action.variant || action.variant === 'secondary') && 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {ActionIcon && <ActionIcon className="h-4 w-4" />}
                  {action.label}
                </button>
              )
            })}

            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="p-2 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
                title="Refresh dashboard"
              >
                <Activity className={cn(
                  'h-4 w-4',
                  (refreshing || loading) && 'animate-spin'
                )} />
              </button>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics.length > 0 && (
          <div className={cn(
            'grid gap-6',
            layout === 'compact' && 'gap-4',
            layout === 'minimal' && 'gap-3',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          )}>
            {metrics.map(renderMetricCard)}
          </div>
        )}

        {/* Main Content Grid */}
        <div className={cn(
          'grid gap-6',
          layout === 'compact' && 'gap-4',
          layout === 'minimal' && 'gap-3',
          charts.length > 0 && activities.length > 0 
            ? 'grid-cols-1 lg:grid-cols-3'
            : 'grid-cols-1'
        )}>
          {/* Charts */}
          {charts.length > 0 && (
            <div className={cn(
              'space-y-6',
              layout === 'compact' && 'space-y-4',
              layout === 'minimal' && 'space-y-3',
              activities.length > 0 ? 'lg:col-span-2' : 'col-span-full'
            )}>
              {charts.map(renderChart)}
            </div>
          )}

          {/* Activity Feed */}
          {activities.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 py-3">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted animate-pulse rounded mb-1" />
                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                      </div>
                    </div>
                  ))
                ) : (
                  activities.map(renderActivity)
                )}
              </div>

              {!loading && activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Widgets */}
        {customWidgets && (
          <div className="space-y-6">
            {customWidgets}
          </div>
        )}
      </div>
    )
  }
)

Dashboard.displayName = 'Dashboard'