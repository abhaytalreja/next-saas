'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  indeterminate?: boolean
}

const checkboxVariants = cva(
  'rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 text-gray-600 hover:border-gray-400 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500',
        primary:
          'border-primary-300 text-primary-600 hover:border-primary-400 focus:ring-primary-500 dark:border-primary-700 dark:text-primary-500',
        success:
          'border-green-300 text-green-600 hover:border-green-400 focus:ring-green-500 dark:border-green-700 dark:text-green-500',
        warning:
          'border-yellow-300 text-yellow-600 hover:border-yellow-400 focus:ring-yellow-500 dark:border-yellow-700 dark:text-yellow-500',
        error:
          'border-red-300 text-red-600 hover:border-red-400 focus:ring-red-500 dark:border-red-700 dark:text-red-500',
      },
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      error: {
        true: 'border-red-500 dark:border-red-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
    },
  }
)

const labelSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      variant,
      indeterminate,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const checkboxRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => checkboxRef.current!)

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate || false
      }
    }, [indeterminate])

    const checkbox = (
      <input
        ref={checkboxRef}
        type="checkbox"
        id={checkboxId}
        className={cn(
          checkboxVariants({ variant, size, error: !!error }),
          className
        )}
        {...props}
      />
    )

    if (!label && !description) {
      return checkbox
    }

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">{checkbox}</div>
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium text-gray-900 dark:text-gray-100 cursor-pointer',
                labelSizeClasses[size],
                props.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p
              className={cn(
                'text-gray-600 dark:text-gray-400',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              {description}
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// Checkbox Group component
export interface CheckboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface CheckboxGroupProps {
  label?: string
  options: CheckboxOption[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  orientation?: 'horizontal' | 'vertical'
  required?: boolean
  disabled?: boolean
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  orientation = 'vertical',
  required,
  disabled,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValue = checked
      ? [...value, optionValue]
      : value.filter(v => v !== optionValue)
    onChange(newValue)
  }

  return (
    <fieldset>
      {label && (
        <legend className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}
      <div
        className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'space-y-0 space-x-6 flex flex-wrap'
        )}
      >
        {options.map(option => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            onChange={e => handleChange(option.value, e.target.checked)}
            disabled={disabled || option.disabled}
            size={size}
            variant={variant}
          />
        ))}
      </div>
      {(error || helperText) && (
        <p
          className={cn(
            'mt-2 text-sm',
            error
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {error || helperText}
        </p>
      )}
    </fieldset>
  )
}
