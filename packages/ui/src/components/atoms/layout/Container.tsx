'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  center?: boolean
  className?: string
}

const containerVariants = cva('w-full', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
      prose: 'max-w-prose',
    },
    padding: {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16',
    },
    center: {
      true: 'mx-auto',
      false: '',
    },
  },
  defaultVariants: {
    size: 'xl',
    padding: 'md',
    center: true,
  },
})

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size, padding, center, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ size, padding, center }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

// Fluid Container variant
export interface FluidContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxWidth?: string | number
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const FluidContainer = React.forwardRef<
  HTMLDivElement,
  FluidContainerProps
>(({ children, maxWidth, padding = 'md', className, ...props }, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
  }

  return (
    <div
      ref={ref}
      className={cn('w-full mx-auto', paddingClasses[padding], className)}
      style={maxWidth ? { maxWidth } : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

FluidContainer.displayName = 'FluidContainer'
