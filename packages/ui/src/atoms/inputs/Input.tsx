import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 bg-white focus:border-primary-500',
        filled:
          'border-neutral-200 bg-neutral-50 focus:border-primary-500 focus:bg-white',
        error:
          'border-error-500 bg-error-50 focus:border-error-600 focus:ring-error-500',
        success:
          'border-success-500 bg-success-50 focus:border-success-600 focus:ring-success-500',
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
            <div className="absolute left-3 text-neutral-500">{leftIcon}</div>
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
            <div className="absolute right-3 text-neutral-500">{rightIcon}</div>
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
