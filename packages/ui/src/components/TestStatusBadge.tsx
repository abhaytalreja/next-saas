import React from 'react'
import { cn } from '../lib/utils'

// Import test status data (this would be generated at build time)
import testStatus from '../../test-status.json'

interface TestStatusBadgeProps {
  component: string
  showDetails?: boolean
  className?: string
}

export const TestStatusBadge: React.FC<TestStatusBadgeProps> = ({
  component,
  showDetails = false,
  className
}) => {
  const componentData = testStatus.components[component as keyof typeof testStatus.components]
  
  if (!componentData) {
    return null
  }
  
  const { tests, badges } = componentData
  const coverage = ((tests.passed / tests.total) * 100).toFixed(0)
  
  // Determine overall status
  const status = tests.failed > 0 ? 'failing' : 
                tests.passed === tests.total ? 'passing' : 
                'partial'
  
  const statusColors = {
    passing: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failing: 'bg-red-100 text-red-800 border-red-200'
  }
  
  if (!showDetails) {
    return (
      <span 
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
          statusColors[status],
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            status === 'passing' ? 'bg-green-400' : 
            status === 'partial' ? 'bg-yellow-400' : 
            'bg-red-400'
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            status === 'passing' ? 'bg-green-500' : 
            status === 'partial' ? 'bg-yellow-500' : 
            'bg-red-500'
          )} />
        </span>
        {coverage}% tested
      </span>
    )
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {/* Test Coverage */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-md">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{tests.passed}/{tests.total} tests</span>
        </div>
        
        {/* Accessibility */}
        {badges.accessibility.status === 'passing' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-md">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-green-800">Accessible</span>
          </div>
        )}
        
        {/* Visual Tests */}
        {badges.visual.status === 'tested' && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-md">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">Visual</span>
          </div>
        )}
      </div>
      
      {/* Coverage Bar */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Test Coverage</span>
          <span className="text-xs font-medium text-gray-700">{coverage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              parseInt(coverage) >= 90 ? 'bg-green-500' :
              parseInt(coverage) >= 70 ? 'bg-yellow-500' :
              'bg-red-500'
            )}
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Hook to get test status for a component
export const useTestStatus = (component: string) => {
  const componentData = testStatus.components[component as keyof typeof testStatus.components]
  
  if (!componentData) {
    return null
  }
  
  return {
    ...componentData,
    coverage: ((componentData.tests.passed / componentData.tests.total) * 100).toFixed(0)
  }
}