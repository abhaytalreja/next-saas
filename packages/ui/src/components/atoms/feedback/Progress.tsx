'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showValue?: boolean
  indeterminate?: boolean
  className?: string
}

const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-gray-600 dark:bg-gray-400',
        primary: 'bg-primary-600 dark:bg-primary-500',
        success: 'bg-green-600 dark:bg-green-500',
        warning: 'bg-yellow-600 dark:bg-yellow-500',
        error: 'bg-red-600 dark:bg-red-500',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant,
      size,
      label,
      showValue = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div className="w-full">
        {(label || showValue) && (
          <div className="flex justify-between mb-1">
            {label && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
            )}
            {showValue && !indeterminate && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          className={cn(progressVariants({ size }), className)}
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant }),
              indeterminate && 'animate-progress-indeterminate'
            )}
            style={indeterminate ? undefined : { width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// Circular Progress Component
export interface CircularProgressProps
  extends React.SVGAttributes<SVGSVGElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  showValue?: boolean
  indeterminate?: boolean
  className?: string
}

const circularSizes = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
}

const circularStrokeWidths = {
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
}

export const CircularProgress = React.forwardRef<
  SVGSVGElement,
  CircularProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 'md',
      strokeWidth,
      variant = 'primary',
      showValue = false,
      indeterminate = false,
      ...props
    },
    ref
  ) => {
    const dimensions = circularSizes[size]
    const stroke = strokeWidth || circularStrokeWidths[size]
    const radius = (dimensions - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colors = {
      default: 'text-gray-600 dark:text-gray-400',
      primary: 'text-primary-600 dark:text-primary-500',
      success: 'text-green-600 dark:text-green-500',
      warning: 'text-yellow-600 dark:text-yellow-500',
      error: 'text-red-600 dark:text-red-500',
    }

    return (
      <div className="relative inline-flex">
        <svg
          ref={ref}
          className={cn(colors[variant], className)}
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={
              indeterminate ? circumference * 0.25 : strokeDashoffset
            }
            className={cn(
              'transition-all duration-300 ease-out origin-center',
              indeterminate && 'animate-spin'
            )}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
          />
        </svg>
        {showValue && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'font-medium',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                size === 'xl' && 'text-lg'
              )}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'
