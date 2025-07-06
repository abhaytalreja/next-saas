'use client'

import React from 'react'
import { cn } from '../../../lib/utils'

// Stat Container
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
      </div>
    )
  }
)

Stat.displayName = 'Stat'

// Stat Label
export interface StatLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const StatLabel = React.forwardRef<HTMLDivElement, StatLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-sm font-medium text-gray-500 dark:text-gray-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StatLabel.displayName = 'StatLabel'

// Stat Number
export interface StatNumberProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const StatNumber = React.forwardRef<HTMLDivElement, StatNumberProps>(
  ({ children, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'font-semibold text-gray-900 dark:text-gray-100',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StatNumber.displayName = 'StatNumber'

// Stat Help Text
export interface StatHelpTextProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const StatHelpText = React.forwardRef<HTMLDivElement, StatHelpTextProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StatHelpText.displayName = 'StatHelpText'

// Stat Arrow
export interface StatArrowProps extends React.SVGAttributes<SVGSVGElement> {
  type: 'increase' | 'decrease'
  className?: string
}

export const StatArrow = React.forwardRef<SVGSVGElement, StatArrowProps>(
  ({ type, className, ...props }, ref) => {
    const isIncrease = type === 'increase'

    return (
      <svg
        ref={ref}
        className={cn(
          'inline-block w-4 h-4',
          isIncrease ? 'text-green-600' : 'text-red-600',
          className
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
        {...props}
      >
        <path
          fillRule="evenodd"
          d={
            isIncrease
              ? 'M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414l-5.293 5.293a1 1 0 01-1.414 0z'
              : 'M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z'
          }
          clipRule="evenodd"
        />
      </svg>
    )
  }
)

StatArrow.displayName = 'StatArrow'

// Stat Group
export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  ({ children, columns = 3, className, ...props }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <div
        ref={ref}
        className={cn('grid gap-4', columnClasses[columns], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

StatGroup.displayName = 'StatGroup'

// Stat Card (pre-styled stat container)
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: {
    type: 'increase' | 'decrease'
    value: string | number
  }
  icon?: React.ReactNode
  helpText?: string
  className?: string
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, change, icon, helpText, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg',
          'border border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {icon && (
                <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-3">
                  {icon}
                </div>
              )}
            </div>
            <div className={cn('w-0 flex-1', icon && 'ml-5')}>
              <StatLabel>{label}</StatLabel>
              <div className="flex items-baseline">
                <StatNumber size="sm">{value}</StatNumber>
                {change && (
                  <div
                    className={cn(
                      'ml-2 flex items-baseline text-sm font-semibold',
                      change.type === 'increase'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    <StatArrow type={change.type} />
                    {change.value}
                  </div>
                )}
              </div>
              {helpText && (
                <StatHelpText className="mt-1">{helpText}</StatHelpText>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

// Mini Stat (compact version)
export interface MiniStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export const MiniStat = React.forwardRef<HTMLDivElement, MiniStatProps>(
  ({ label, value, trend, className, ...props }, ref) => {
    const trendColors = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between p-4', className)}
        {...props}
      >
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p
            className={cn(
              'text-2xl font-semibold',
              trend ? trendColors[trend] : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {value}
          </p>
        </div>
        {trend && trend !== 'neutral' && (
          <StatArrow
            type={trend === 'up' ? 'increase' : 'decrease'}
            className="w-6 h-6"
          />
        )}
      </div>
    )
  }
)

MiniStat.displayName = 'MiniStat'
