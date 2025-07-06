'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  background?: 'default' | 'muted' | 'subtle' | 'canvas' | 'accent'
  fullHeight?: boolean
  className?: string
}

const sectionVariants = cva('relative', {
  variants: {
    spacing: {
      none: '',
      sm: 'py-8 sm:py-12',
      md: 'py-12 sm:py-16 lg:py-20',
      lg: 'py-16 sm:py-20 lg:py-24',
      xl: 'py-20 sm:py-24 lg:py-32',
      '2xl': 'py-24 sm:py-32 lg:py-40',
    },
    background: {
      default: 'bg-white dark:bg-gray-900',
      muted: 'bg-gray-50 dark:bg-gray-800',
      subtle: 'bg-gray-100 dark:bg-gray-800/50',
      canvas: 'bg-gray-50 dark:bg-gray-950',
      accent: 'bg-primary-50 dark:bg-primary-900/10',
    },
    fullHeight: {
      true: 'min-h-screen',
      false: '',
    },
  },
  defaultVariants: {
    spacing: 'md',
    background: 'default',
    fullHeight: false,
  },
})

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing, background, fullHeight, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          sectionVariants({ spacing, background, fullHeight }),
          className
        )}
        {...props}
      >
        {children}
      </section>
    )
  }
)

Section.displayName = 'Section'

// Hero Section variant
export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  overlay?: boolean
  overlayOpacity?: number
  backgroundImage?: string
  className?: string
}

const heroSizeClasses = {
  sm: 'min-h-[40vh]',
  md: 'min-h-[50vh]',
  lg: 'min-h-[60vh]',
  xl: 'min-h-[70vh]',
  full: 'min-h-screen',
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      children,
      size = 'lg',
      overlay = false,
      overlayOpacity = 0.5,
      backgroundImage,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative flex items-center justify-center',
          heroSizeClasses[size],
          className
        )}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
        {...props}
      >
        {overlay && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10 w-full">{children}</div>
      </section>
    )
  }
)

HeroSection.displayName = 'HeroSection'

// Page Header Section
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, breadcrumb, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-gray-200 dark:border-gray-700 pb-5',
          className
        )}
        {...props}
      >
        {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100 sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="mt-3 sm:mt-0 sm:ml-4">{actions}</div>}
        </div>
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'
