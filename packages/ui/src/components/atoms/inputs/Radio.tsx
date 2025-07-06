'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

const radioVariants = cva(
  'rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error,
      size = 'md',
      variant,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

    const radio = (
      <input
        ref={ref}
        type="radio"
        id={radioId}
        className={cn(
          radioVariants({ variant, size, error: !!error }),
          className
        )}
        {...props}
      />
    )

    if (!label && !description) {
      return radio
    }

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">{radio}</div>
        <div className="ml-3">
          {label && (
            <label
              htmlFor={radioId}
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

Radio.displayName = 'Radio'

// Radio Group component
export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label?: string
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  orientation?: 'horizontal' | 'vertical'
  required?: boolean
  disabled?: boolean
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
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
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={e => onChange(e.target.value)}
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

// Radio Cards - A more visual radio group variant
export interface RadioCardProps extends RadioOption {
  icon?: React.ComponentType<{ className?: string }>
  checked: boolean
  onChange: () => void
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export const RadioCard: React.FC<RadioCardProps> = ({
  value,
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  name,
  disabled,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }

  return (
    <label
      className={cn(
        'relative flex cursor-pointer rounded-lg border bg-white dark:bg-gray-900',
        sizeClasses[size],
        checked
          ? 'border-primary-600 ring-2 ring-primary-600 dark:border-primary-500 dark:ring-primary-500'
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        aria-labelledby={`${name}-${value}-label`}
        aria-describedby={
          description ? `${name}-${value}-description` : undefined
        }
      />
      <div className="flex flex-1">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon
              className={cn(
                size === 'sm' && 'h-5 w-5',
                size === 'md' && 'h-6 w-6',
                size === 'lg' && 'h-7 w-7',
                checked
                  ? 'text-primary-600 dark:text-primary-500'
                  : 'text-gray-400'
              )}
            />
          </div>
        )}
        <div className={cn(Icon && 'ml-3', 'flex flex-col')}>
          <span
            id={`${name}-${value}-label`}
            className={cn(
              'block font-medium',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg',
              checked
                ? 'text-primary-900 dark:text-primary-100'
                : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {label}
          </span>
          {description && (
            <span
              id={`${name}-${value}-description`}
              className={cn(
                'text-gray-500 dark:text-gray-400',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              {description}
            </span>
          )}
        </div>
      </div>
      {checked && (
        <svg
          className={cn(
            'absolute text-primary-600 dark:text-primary-500',
            size === 'sm' && 'h-4 w-4 top-3 right-3',
            size === 'md' && 'h-5 w-5 top-4 right-4',
            size === 'lg' && 'h-6 w-6 top-5 right-5'
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </label>
  )
}
