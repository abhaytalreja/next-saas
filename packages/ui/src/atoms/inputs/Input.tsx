import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-gray-800 focus:border-primary-500 dark:focus:border-primary-400',
        filled:
          'border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-gray-800',
        error:
          'border-error-500 dark:border-error-400 bg-error-50 dark:bg-error-900/20 focus:border-error-600 dark:focus:border-error-400 focus:ring-error-500 dark:focus:ring-error-400',
        success:
          'border-success-500 dark:border-success-400 bg-success-50 dark:bg-success-900/20 focus:border-success-600 dark:focus:border-success-400 focus:ring-success-500 dark:focus:ring-success-400',
      },
      inputSize: {
        sm: 'h-8 text-xs',
        default: 'h-10',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: boolean
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type,
      leftIcon,
      rightIcon,
      error,
      success,
      ...props
    },
    ref
  ) => {
    const finalVariant = error ? 'error' : success ? 'success' : variant

    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-500 dark:text-neutral-400">{leftIcon}</div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-neutral-500 dark:text-neutral-400">{rightIcon}</div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: finalVariant, inputSize, className })
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
