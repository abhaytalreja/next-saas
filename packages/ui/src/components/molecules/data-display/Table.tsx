'use client'

import React from 'react'
import { cn } from '../../../lib/utils'

// Table Root
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  className?: string
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    { children, striped, hoverable, bordered, compact, className, ...props },
    ref
  ) => {
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
            bordered && 'border border-gray-200 dark:border-gray-700',
            className
          )}
          {...props}
        >
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                striped,
                hoverable,
                compact,
              })
            }
            return child
          })}
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'

// Table Header
export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
  className?: string
}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ children, className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('bg-gray-50 dark:bg-gray-800', className)}
      {...props}
    >
      {children}
    </thead>
  )
})

TableHeader.displayName = 'TableHeader'

// Table Body
export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
  striped?: boolean
  hoverable?: boolean
  className?: string
}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ children, striped, hoverable, className, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn(
        'bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            striped: striped && index % 2 === 1,
            hoverable,
          })
        }
        return child
      })}
    </tbody>
  )
})

TableBody.displayName = 'TableBody'

// Table Row
export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  striped?: boolean
  hoverable?: boolean
  selected?: boolean
  className?: string
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, striped, hoverable, selected, className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          striped && 'bg-gray-50 dark:bg-gray-800/50',
          hoverable &&
            'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer',
          selected && 'bg-primary-50 dark:bg-primary-900/20',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    )
  }
)

TableRow.displayName = 'TableRow'

// Table Head Cell
export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  sortable?: boolean
  sorted?: 'asc' | 'desc' | false
  onSort?: () => void
  align?: 'left' | 'center' | 'right'
  className?: string
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    { children, sortable, sorted, onSort, align = 'left', className, ...props },
    ref
  ) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    return (
      <th
        ref={ref}
        className={cn(
          'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400',
          alignClasses[align],
          sortable &&
            'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div
          className={cn(
            'flex items-center gap-1',
            align === 'center' && 'justify-center',
            align === 'right' && 'justify-end'
          )}
        >
          {children}
          {sortable && (
            <span className="ml-1">
              {sorted === 'asc' ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : sorted === 'desc' ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
          )}
        </div>
      </th>
    )
  }
)

TableHead.displayName = 'TableHead'

// Table Cell
export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  compact?: boolean
  align?: 'left' | 'center' | 'right'
  className?: string
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, compact, align = 'left', className, ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }

    return (
      <td
        ref={ref}
        className={cn(
          'whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
          compact ? 'px-3 py-2' : 'px-6 py-4',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  }
)

TableCell.displayName = 'TableCell'

// Table Footer
export interface TableFooterProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
  className?: string
}

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  TableFooterProps
>(({ children, className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={cn('bg-gray-50 dark:bg-gray-800', className)}
      {...props}
    >
      {children}
    </tfoot>
  )
})

TableFooter.displayName = 'TableFooter'

// Table Caption
export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode
  className?: string
}

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ children, className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={cn('py-2 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    >
      {children}
    </caption>
  )
})

TableCaption.displayName = 'TableCaption'

// Empty State for Table
export interface TableEmptyProps {
  message?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
  }
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  message = 'No data available',
  icon: Icon,
  action,
}) => {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          {Icon && <Icon className="h-12 w-12 text-gray-400 mb-4" />}
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {action.label}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
