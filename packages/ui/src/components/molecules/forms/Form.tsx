'use client'

import React from 'react'
import { cn } from '../../../lib/utils'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  loading?: boolean
  className?: string
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, loading, className, ...props }, ref) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (onSubmit) {
        await onSubmit(e)
      }
    }

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        {...props}
      >
        <fieldset disabled={loading} className="min-w-0">
          {children}
        </fieldset>
      </form>
    )
  }
)

Form.displayName = 'Form'

// Form Field wrapper for consistent spacing and layout
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  error?: boolean
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, error, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-1',
          error && 'text-red-600 dark:text-red-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Form Section for grouping related fields
export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children: React.ReactNode
}

export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {(title || description) && (
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    )
  }
)

FormSection.displayName = 'FormSection'

// Form Actions for submit/cancel buttons
export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ children, align = 'right', className, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 pt-4',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FormActions.displayName = 'FormActions'

// Form Error message component
export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn('rounded-md bg-red-50 p-4 dark:bg-red-900/20', className)}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {children}
            </h3>
          </div>
        </div>
      </div>
    )
  }
)

FormError.displayName = 'FormError'

// Form Success message component
export interface FormSuccessProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const FormSuccess = React.forwardRef<HTMLDivElement, FormSuccessProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          'rounded-md bg-green-50 p-4 dark:bg-green-900/20',
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {children}
            </p>
          </div>
        </div>
      </div>
    )
  }
)

FormSuccess.displayName = 'FormSuccess'
