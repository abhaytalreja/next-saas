import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

const variantClasses = {
  text: 'h-4 w-full rounded',
  circular: 'rounded-full aspect-square',
  rectangular: 'rounded-none',
  rounded: 'rounded-md',
}

const animationClasses = {
  pulse: 'animate-pulse',
  wave: 'animate-[shimmer_2s_infinite] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  none: '',
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    variant = 'rectangular', 
    animation = 'pulse', 
    width, 
    height, 
    className, 
    style,
    ...props 
  }, ref) => {
    const inlineStyles = {
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
      ...style,
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted',
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={inlineStyles}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingClasses = {
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-3',
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, spacing = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full', spacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            className={index === lines - 1 ? 'w-3/4' : 'w-full'}
          />
        ))}
      </div>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'