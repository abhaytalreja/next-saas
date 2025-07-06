import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    color: {
      default: 'text-primary-600',
      white: 'text-white',
      muted: 'text-neutral-400',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      error: 'text-error-600',
      warning: 'text-warning-600',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
})

export interface SpinnerProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, color, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerVariants({ size, color, className }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )
  }
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
