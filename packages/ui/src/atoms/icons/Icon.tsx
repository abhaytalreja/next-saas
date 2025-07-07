import React, { forwardRef } from 'react'
import { LucideIcon, LucideProps } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'muted' | 'destructive' | 'success' | 'warning'
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-amber-600',
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 'md', variant = 'default', className, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'