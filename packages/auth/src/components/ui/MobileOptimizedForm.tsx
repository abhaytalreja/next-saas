'use client'

import React, { useRef } from 'react'
import { useMobileDetection, useBreakpoint } from '../../hooks/useMobileDetection'

interface MobileOptimizedFormProps {
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
  spacing?: 'compact' | 'normal' | 'relaxed'
  stickyFooter?: boolean
}

export function MobileOptimizedForm({
  children,
  className = '',
  onSubmit,
  spacing = 'normal',
  stickyFooter = false
}: MobileOptimizedFormProps) {
  const { isMobile, isTouchDevice } = useMobileDetection()
  const { isMobileOrTablet } = useBreakpoint()
  const formRef = useRef<HTMLFormElement>(null)

  // Spacing classes based on device type
  const getSpacingClasses = () => {
    if (!isMobileOrTablet) return 'space-y-6'
    
    switch (spacing) {
      case 'compact':
        return 'space-y-3'
      case 'relaxed':
        return 'space-y-8'
      default:
        return 'space-y-4'
    }
  }

  // Mobile-specific form styling
  const getMobileFormClasses = () => {
    const baseClasses = getSpacingClasses()
    
    if (isMobileOrTablet) {
      return `${baseClasses} px-4 py-6`
    }
    
    return `${baseClasses} px-6 py-8`
  }

  // Handle form submission with mobile considerations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // On mobile, blur active element to hide keyboard
    if (isMobile && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    
    onSubmit?.(e)
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`
        ${getMobileFormClasses()}
        ${stickyFooter && isMobileOrTablet ? 'pb-20' : ''}
        ${className}
      `}
      noValidate
    >
      {children}
      
      {/* Mobile sticky footer spacing */}
      {stickyFooter && isMobileOrTablet && (
        <div className="h-16" aria-hidden="true" />
      )}
    </form>
  )
}

interface MobileFieldGroupProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function MobileFieldGroup({
  children,
  title,
  description,
  className = '',
  collapsible = false,
  defaultExpanded = true
}: MobileFieldGroupProps) {
  const { isMobileOrTablet } = useBreakpoint()
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  if (!collapsible || !isMobileOrTablet) {
    return (
      <fieldset className={`space-y-4 ${className}`}>
        {title && (
          <legend className="text-base font-medium text-gray-900 mb-4">
            {title}
          </legend>
        )}
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        {children}
      </fieldset>
    )
  }

  return (
    <fieldset className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isExpanded}
        aria-controls={`fieldgroup-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div>
          <legend className="text-base font-medium text-gray-900">
            {title}
          </legend>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isExpanded && (
        <div
          id={`fieldgroup-${title?.toLowerCase().replace(/\s+/g, '-')}`}
          className="p-4 space-y-4"
        >
          {children}
        </div>
      )}
    </fieldset>
  )
}

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export function MobileInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props
}: MobileInputProps) {
  const { isMobileOrTablet } = useBreakpoint()
  const inputId = React.useId()
  const errorId = React.useId()
  const helperId = React.useId()

  const inputClasses = `
    block w-full rounded-md border-gray-300 shadow-sm
    focus:border-primary-500 focus:ring-primary-500
    ${isMobileOrTablet ? 'py-3 px-4 text-base' : 'py-2 px-3 text-sm'}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <label
        htmlFor={inputId}
        className={`block font-medium text-gray-700 mb-2 ${
          isMobileOrTablet ? 'text-base' : 'text-sm'
        }`}
      >
        {label}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`.trim()}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
      
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function MobileButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: MobileButtonProps) {
  const { isMobileOrTablet } = useBreakpoint()

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500'
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500'
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
    }
  }

  const getSizeClasses = () => {
    if (isMobileOrTablet) {
      switch (size) {
        case 'sm':
          return 'px-4 py-2.5 text-sm'
        case 'lg':
          return 'px-6 py-4 text-lg'
        default:
          return 'px-5 py-3 text-base'
      }
    }
    
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-5 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  const buttonClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isMobileOrTablet ? 'min-h-12' : 'min-h-10'}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
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
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  )
}