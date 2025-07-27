'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'ghost'
  fullWidth?: boolean
}

const selectVariants = cva(
  'block rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:hover:border-gray-500',
        filled:
          'border border-transparent bg-gray-100 text-gray-900 placeholder-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:hover:bg-gray-700',
        ghost:
          'border border-transparent bg-transparent text-gray-900 placeholder-gray-400 hover:bg-gray-100 dark:text-gray-100 dark:placeholder-gray-500 dark:hover:bg-gray-800',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-4 py-3 text-lg',
      },
      error: {
        true: 'border-red-500 focus:ring-red-500 dark:border-red-500',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      error: false,
      fullWidth: false,
    },
  }
)

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      size,
      variant,
      fullWidth,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            selectVariants({ variant, size, error: !!error, fullWidth }),
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-sm',
              error
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Modern Select components (shadcn-style)
export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder?: string
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(({ children, className, placeholder, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100',
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

export interface SelectValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ children, className, placeholder, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('block truncate', className)} {...props}>
        {children || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = 'SelectValue'

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top' | 'bottom' | 'auto'
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, position = 'bottom', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
        position === 'top' && 'bottom-full mb-1',
        position === 'bottom' && 'top-full mt-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = 'SelectContent'

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700',
          className
        )}
        data-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

// Multi-select component with checkboxes
export interface MultiSelectProps
  extends Omit<SelectProps, 'value' | 'onChange'> {
  value: string[]
  onChange: (values: string[]) => void
  maxHeight?: string | number
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder = 'Select options...',
  value,
  onChange,
  size = 'md',
  variant = 'default',
  fullWidth,
  maxHeight = 200,
  className,
  id,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectId =
    id || `multiselect-${Math.random().toString(36).substr(2, 9)}`

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const selectedLabels = options
    .filter(opt => value.includes(opt.value))
    .map(opt => opt.label)
    .join(', ')

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        id={selectId}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          selectVariants({ variant, size, error: !!error, fullWidth }),
          'text-left cursor-pointer',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(!selectedLabels && 'text-gray-400 dark:text-gray-500')}
        >
          {selectedLabels || placeholder}
        </span>
        <svg
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute z-20 mt-1 w-full rounded-md bg-white shadow-lg dark:bg-gray-800"
            style={{ maxHeight }}
          >
            <ul
              className="overflow-auto rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              role="listbox"
              aria-multiselectable="true"
            >
              {options.map(option => (
                <li
                  key={option.value}
                  className={cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-gray-100 dark:hover:bg-gray-700',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  role="option"
                  aria-selected={value.includes(option.value)}
                  onClick={() => !option.disabled && toggleOption(option.value)}
                >
                  <span
                    className={cn(
                      'block truncate',
                      value.includes(option.value)
                        ? 'font-medium'
                        : 'font-normal'
                    )}
                  >
                    {option.label}
                  </span>
                  {value.includes(option.value) && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {(error || helperText) && (
        <p
          className={cn(
            'mt-1 text-sm',
            error
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}
