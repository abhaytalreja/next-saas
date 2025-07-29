'use client'

import React from 'react'
import { ChevronDown, TrendingDown, Users, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@nextsaas/ui'

interface FunnelStep {
  name: string
  value: number
  conversion?: number
  color?: string
  description?: string
}

interface ConversionFunnelProps {
  steps: FunnelStep[]
  loading?: boolean
  title?: string
  className?: string
  showConversionRates?: boolean
}

export function ConversionFunnel({ 
  steps, 
  loading = false, 
  title = 'Conversion Funnel',
  className = '',
  showConversionRates = true
}: ConversionFunnelProps) {
  // Calculate conversion rates between steps
  const calculateConversions = () => {
    if (!steps || steps.length < 2) return steps

    return steps.map((step, index) => {
      if (index === 0) {
        return { ...step, conversion: 100 }
      }
      
      const previousStep = steps[0]
      const conversion = previousStep.value > 0 
        ? (step.value / previousStep.value) * 100 
        : 0

      return { ...step, conversion }
    })
  }

  const stepsWithConversions = calculateConversions()
  const totalDropoff = stepsWithConversions.length > 1 
    ? stepsWithConversions[0].value - stepsWithConversions[stepsWithConversions.length - 1].value
    : 0

  const overallConversionRate = stepsWithConversions.length > 1 && stepsWithConversions[0].value > 0
    ? (stepsWithConversions[stepsWithConversions.length - 1].value / stepsWithConversions[0].value) * 100
    : 0

  const getStepColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500'
    ]
    return colors[index % colors.length]
  }

  const getConversionColor = (conversion: number) => {
    if (conversion >= 80) return 'text-green-600 bg-green-50'
    if (conversion >= 60) return 'text-blue-600 bg-blue-50'
    if (conversion >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!steps || steps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <div className="text-sm">No funnel data available</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {overallConversionRate.toFixed(1)}% Overall
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatNumber(totalDropoff)} Drop-off
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {stepsWithConversions.map((step, index) => {
            const isFirst = index === 0
            const isLast = index === stepsWithConversions.length - 1
            const width = isFirst ? 100 : (step.value / stepsWithConversions[0].value) * 100
            const stepDropoff = index > 0 
              ? stepsWithConversions[index - 1].value - step.value 
              : 0

            return (
              <div key={step.name} className="relative">
                {/* Funnel Step */}
                <div className="relative">
                  <div 
                    className={`
                      ${getStepColor(index)} 
                      text-white rounded-lg p-4 transition-all duration-300 hover:shadow-md
                      ${isFirst ? '' : 'ml-2'}
                      ${isLast ? '' : 'mr-2'}
                    `}
                    style={{ 
                      width: `${Math.max(width, 20)}%`,
                      minWidth: '200px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        {step.description && (
                          <div className="text-xs opacity-90 mt-1">{step.description}</div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold">{formatNumber(step.value)}</div>
                        {showConversionRates && step.conversion !== undefined && (
                          <div className="text-xs opacity-90">
                            {step.conversion.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rate Badge */}
                  {showConversionRates && index > 0 && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 translate-x-full">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConversionColor(step.conversion || 0)}`}
                      >
                        {step.conversion?.toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Drop-off indicator */}
                {!isLast && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ChevronDown className="h-3 w-3" />
                      <span>
                        {stepDropoff > 0 && (
                          <>
                            <TrendingDown className="h-3 w-3 inline mr-1 text-red-500" />
                            {formatNumber(stepDropoff)} lost
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Funnel Analytics */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">Total Visitors</div>
              <div className="text-gray-600">
                {stepsWithConversions[0] ? formatNumber(stepsWithConversions[0].value) : '0'}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Final Conversions</div>
              <div className="text-gray-600">
                {stepsWithConversions[stepsWithConversions.length - 1] 
                  ? formatNumber(stepsWithConversions[stepsWithConversions.length - 1].value) 
                  : '0'
                }
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Overall Rate</div>
              <div className="text-gray-600">{overallConversionRate.toFixed(2)}%</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Total Drop-off</div>
              <div className="text-gray-600">{formatNumber(totalDropoff)}</div>
            </div>
          </div>
        </div>

        {/* Optimization suggestions */}
        {overallConversionRate < 10 && stepsWithConversions.length > 1 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="text-sm">
              <div className="font-medium text-yellow-800 mb-1">Optimization Opportunities:</div>
              <ul className="text-yellow-700 text-xs space-y-1">
                {stepsWithConversions
                  .filter((step, index) => index > 0 && (step.conversion || 0) < 50)
                  .slice(0, 2)
                  .map((step, index) => (
                    <li key={index}>
                      • Focus on improving conversion from "{stepsWithConversions[stepsWithConversions.indexOf(step) - 1]?.name}" to "{step.name}"
                    </li>
                  ))
                }
                {overallConversionRate < 5 && (
                  <li>• Consider A/B testing your signup flow to identify friction points</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}