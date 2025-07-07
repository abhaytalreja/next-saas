import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  children: React.ReactElement<any>
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    label, 
    description, 
    error, 
    required = false, 
    disabled = false, 
    children, 
    className, 
    ...props 
  }, ref) => {
    const childId = children.props.id || children.props.name
    const labelId = childId ? `${childId}-label` : undefined
    const descriptionId = childId ? `${childId}-description` : undefined
    const errorId = childId ? `${childId}-error` : undefined

    const enhancedChild = React.cloneElement(children, {
      disabled: disabled || children.props.disabled,
      'aria-invalid': error ? 'true' : children.props['aria-invalid'],
      'aria-describedby': [
        description ? descriptionId : null,
        error ? errorId : null,
        children.props['aria-describedby'],
      ]
        .filter(Boolean)
        .join(' ') || undefined,
      'aria-labelledby': label ? labelId : children.props['aria-labelledby'],
    })

    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {label && (
          <label
            id={labelId}
            htmlFor={childId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && "after:content-['*'] after:ml-1 after:text-destructive",
              disabled && 'opacity-70 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
        
        {description && (
          <p
            id={descriptionId}
            className={cn(
              'text-sm text-muted-foreground',
              disabled && 'opacity-70'
            )}
          >
            {description}
          </p>
        )}
        
        {enhancedChild}
        
        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children: React.ReactNode
}

export const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-medium leading-6 text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)

FormSection.displayName = 'FormSection'