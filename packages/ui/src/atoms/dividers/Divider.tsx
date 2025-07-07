import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  thickness?: 'thin' | 'medium' | 'thick'
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  textAlign?: 'left' | 'center' | 'right'
  children?: React.ReactNode
}

const orientationClasses = {
  horizontal: 'w-full border-t',
  vertical: 'h-full border-l',
}

const variantClasses = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
}

const thicknessClasses = {
  thin: 'border-t-[1px] border-l-[1px]',
  medium: 'border-t-[2px] border-l-[2px]',
  thick: 'border-t-[3px] border-l-[3px]',
}

const spacingClasses = {
  horizontal: {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  },
  vertical: {
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
    xl: 'mx-8',
  },
}

const textAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ 
    orientation = 'horizontal',
    variant = 'solid',
    thickness = 'thin',
    spacing = 'md',
    textAlign = 'center',
    children,
    className,
    ...props 
  }, ref) => {
    if (children) {
      return (
        <div
          className={cn(
            'relative flex items-center',
            spacingClasses[orientation][spacing],
            className
          )}
        >
          <div
            className={cn(
              'flex-grow',
              orientationClasses[orientation],
              variantClasses[variant],
              thicknessClasses[thickness],
              'border-border'
            )}
          />
          <span
            className={cn(
              'px-3 text-sm text-muted-foreground bg-background',
              textAlignClasses[textAlign]
            )}
          >
            {children}
          </span>
          <div
            className={cn(
              'flex-grow',
              orientationClasses[orientation],
              variantClasses[variant],
              thicknessClasses[thickness],
              'border-border'
            )}
          />
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        className={cn(
          orientationClasses[orientation],
          variantClasses[variant],
          thicknessClasses[thickness],
          spacingClasses[orientation][spacing],
          'border-border',
          className
        )}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'