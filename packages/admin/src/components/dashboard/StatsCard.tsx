'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Wifi } from 'lucide-react'
import { cn, Badge } from '@nextsaas/ui'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ComponentType<{ className?: string }>
  description?: string
  format?: 'number' | 'currency' | 'percentage'
  className?: string
  realTime?: boolean
  loading?: boolean
}

export function StatsCard({
  title,
  value,
  change,
  trend = 'stable',
  icon: Icon,
  description,
  format = 'number',
  className,
  realTime = false,
  loading = false
}: StatsCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return new Intl.NumberFormat('en-US').format(val)
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6 relative', className)}>
      {realTime && (
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="text-xs">
            <Wifi className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className={cn('h-8 w-8', realTime ? 'text-blue-500' : 'text-gray-400')} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-3xl font-bold text-gray-900">
              {formatValue(value)}
            </div>
            
            {change !== undefined && (
              <div className="flex items-center mt-2">
                <div className={cn('flex items-center', getTrendColor())}>
                  {getTrendIcon()}
                  <span className="ml-1 text-sm font-medium">
                    {Math.abs(change)}%
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-500">vs last period</span>
              </div>
            )}
            
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}