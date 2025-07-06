'use client'

import React from 'react'
import { cn } from '../../../lib/utils'

// List Root
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode
  variant?: 'unordered' | 'ordered' | 'unstyled'
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  (
    {
      children,
      variant = 'unordered',
      spacing = 'normal',
      className,
      ...props
    },
    ref
  ) => {
    const Component = variant === 'ordered' ? 'ol' : 'ul'

    const spacingClasses = {
      tight: 'space-y-1',
      normal: 'space-y-2',
      loose: 'space-y-4',
    }

    const variantClasses = {
      unordered: 'list-disc pl-5',
      ordered: 'list-decimal pl-5',
      unstyled: 'list-none',
    }

    return (
      <Component
        ref={ref as any}
        className={cn(
          spacingClasses[spacing],
          variantClasses[variant],
          'text-gray-700 dark:text-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

List.displayName = 'List'

// List Item
export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ children, icon, className, ...props }, ref) => {
    return (
      <li ref={ref} className={cn('text-sm', className)} {...props}>
        {icon ? (
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">{icon}</span>
            <span className="flex-1">{children}</span>
          </div>
        ) : (
          children
        )}
      </li>
    )
  }
)

ListItem.displayName = 'ListItem'

// Description List
export interface DescriptionListProps
  extends React.HTMLAttributes<HTMLDListElement> {
  children: React.ReactNode
  layout?: 'vertical' | 'horizontal'
  striped?: boolean
  className?: string
}

export const DescriptionList = React.forwardRef<
  HTMLDListElement,
  DescriptionListProps
>(
  (
    { children, layout = 'vertical', striped = false, className, ...props },
    ref
  ) => {
    return (
      <dl
        ref={ref}
        className={cn(
          layout === 'horizontal' && 'sm:grid sm:grid-cols-3 sm:gap-4',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              layout,
              striped: striped && index % 2 === 1,
            })
          }
          return child
        })}
      </dl>
    )
  }
)

DescriptionList.displayName = 'DescriptionList'

// Description List Item
export interface DescriptionListItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  term: React.ReactNode
  description: React.ReactNode
  layout?: 'vertical' | 'horizontal'
  striped?: boolean
  className?: string
}

export const DescriptionListItem: React.FC<DescriptionListItemProps> = ({
  term,
  description,
  layout = 'vertical',
  striped = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'px-4 py-5 sm:p-6',
        layout === 'horizontal' && 'sm:grid sm:grid-cols-3 sm:gap-4',
        striped && 'bg-gray-50 dark:bg-gray-800/50',
        className
      )}
      {...props}
    >
      <dt
        className={cn(
          'text-sm font-medium text-gray-500 dark:text-gray-400',
          layout === 'vertical' && 'mb-1'
        )}
      >
        {term}
      </dt>
      <dd
        className={cn(
          'text-sm text-gray-900 dark:text-gray-100',
          layout === 'horizontal' && 'sm:col-span-2'
        )}
      >
        {description}
      </dd>
    </div>
  )
}

// Inline List (for tags, breadcrumbs, etc.)
export interface InlineListProps
  extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode
  separator?: React.ReactNode
  className?: string
}

export const InlineList = React.forwardRef<HTMLUListElement, InlineListProps>(
  ({ children, separator = '•', className, ...props }, ref) => {
    const items = React.Children.toArray(children)

    return (
      <ul
        ref={ref}
        className={cn('flex items-center flex-wrap gap-2', className)}
        {...props}
      >
        {items.map((child, index) => (
          <React.Fragment key={index}>
            <li className="inline-flex items-center">{child}</li>
            {index < items.length - 1 && separator && (
              <li
                className="text-gray-400 dark:text-gray-600"
                aria-hidden="true"
              >
                {separator}
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    )
  }
)

InlineList.displayName = 'InlineList'

// Checklist
export interface ChecklistProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode
  className?: string
}

export const Checklist = React.forwardRef<HTMLUListElement, ChecklistProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul ref={ref} className={cn('space-y-2 list-none', className)} {...props}>
        {children}
      </ul>
    )
  }
)

Checklist.displayName = 'Checklist'

// Checklist Item
export interface ChecklistItemProps {
  children: React.ReactNode
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const ChecklistItem = React.forwardRef<
  HTMLLIElement,
  ChecklistItemProps
>(
  (
    {
      children,
      checked = false,
      onChange,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <li
        ref={ref}
        className={cn('flex items-start gap-3', className)}
        {...props}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange?.(e.target.checked)}
          disabled={disabled}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-offset-gray-900',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <span
          className={cn(
            'text-sm text-gray-700 dark:text-gray-300',
            checked && 'line-through text-gray-500 dark:text-gray-500',
            disabled && 'opacity-50'
          )}
        >
          {children}
        </span>
      </li>
    )
  }
)

ChecklistItem.displayName = 'ChecklistItem'
