import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
        secondary:
          'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
        destructive:
          'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300',
        success:
          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
        warning:
          'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
        outline:
          'border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300',
        ghost: 'text-neutral-700 dark:text-neutral-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant, size, removable, onRemove, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 -mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
