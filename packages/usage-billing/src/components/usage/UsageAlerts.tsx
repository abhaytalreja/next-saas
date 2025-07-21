'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'
import { Alert, AlertDescription } from '@nextsaas/ui'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Shield,
  X,
  Clock,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { UsageAlert } from '../../types'

interface UsageAlertsProps {
  alerts: UsageAlert[]
  onAcknowledge: (alertId: string) => Promise<void>
  isLoading?: boolean
  className?: string
  maxAlerts?: number
}

export function UsageAlerts({ 
  alerts, 
  onAcknowledge, 
  isLoading = false,
  className = '',
  maxAlerts = 5
}: UsageAlertsProps) {
  const displayedAlerts = alerts.slice(0, maxAlerts)
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'warning' as any
      case 'info':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    if (isLoading) return
    
    try {
      await onAcknowledge(alertId)
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  if (displayedAlerts.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Usage Alerts</span>
            <Badge variant="secondary">
              {alerts.length}
            </Badge>
          </CardTitle>
          {alerts.length > maxAlerts && (
            <Badge variant="outline">
              +{alerts.length - maxAlerts} more
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayedAlerts.map((alert) => (
          <Alert 
            key={alert.id}
            variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            className="relative"
          >
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">
                    {alert.alert_type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <AlertDescription className="text-sm">
                  {alert.description}
                </AlertDescription>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>
                        {alert.current_usage.toLocaleString()} / {alert.limit_value.toLocaleString()}
                      </span>
                    </span>
                    
                    {alert.threshold_percentage && (
                      <span>
                        {alert.threshold_percentage}% threshold
                      </span>
                    )}
                  </div>
                  
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAcknowledge(alert.id)}
                disabled={isLoading}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Acknowledge alert</span>
              </Button>
            </div>
          </Alert>
        ))}
        
        {alerts.length > 1 && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                // Acknowledge all alerts
                await Promise.all(alerts.map(alert => onAcknowledge(alert.id)))
              }}
              disabled={isLoading}
            >
              Acknowledge All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface UsageAlertsSummaryProps {
  alerts: UsageAlert[]
  className?: string
}

export function UsageAlertsSummary({ alerts, className = '' }: UsageAlertsSummaryProps) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warningCount = alerts.filter(a => a.severity === 'warning').length
  const infoCount = alerts.filter(a => a.severity === 'info').length

  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-2 text-sm text-muted-foreground">
              All systems running smoothly
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {criticalCount > 0 && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">{criticalCount}</span>
                <span className="text-xs text-muted-foreground">Critical</span>
              </div>
            )}
            
            {warningCount > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">{warningCount}</span>
                <span className="text-xs text-muted-foreground">Warning</span>
              </div>
            )}
            
            {infoCount > 0 && (
              <div className="flex items-center space-x-1">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{infoCount}</span>
                <span className="text-xs text-muted-foreground">Info</span>
              </div>
            )}
          </div>
          
          <Badge variant="secondary">
            {alerts.length} total
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}