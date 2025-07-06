'use client'

import React from 'react'
import { cn } from '../../../lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  maxItems?: number
  className?: string
  itemClassName?: string
  activeClassName?: string
  onItemClick?: (item: BreadcrumbItem, index: number) => void
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = '/',
      maxItems,
      className,
      itemClassName,
      activeClassName,
      onItemClick,
      ...props
    },
    ref
  ) => {
    const displayItems =
      maxItems && items.length > maxItems
        ? [
            ...items.slice(0, 1),
            { label: '...', href: undefined },
            ...items.slice(items.length - (maxItems - 2)),
          ]
        : items

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-1 text-sm', className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1
            const isEllipsis = item.label === '...'
            const Icon = item.icon

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span
                    className="mx-2 text-gray-400 dark:text-gray-600"
                    aria-hidden="true"
                  >
                    {separator}
                  </span>
                )}
                {isEllipsis ? (
                  <span className="text-gray-400 dark:text-gray-600">...</span>
                ) : isLast ? (
                  <span
                    className={cn(
                      'font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1',
                      activeClassName
                    )}
                    aria-current="page"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    onClick={e => {
                      if (onItemClick) {
                        e.preventDefault()
                        onItemClick(item, index)
                      }
                    }}
                    className={cn(
                      'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1',
                      itemClassName
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => onItemClick?.(item, index)}
                    className={cn(
                      'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1',
                      itemClassName
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </button>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

// Alternative Breadcrumb with Chevron separator
export const ChevronSeparator = () => (
  <svg
    className="h-5 w-5 text-gray-400"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

// Breadcrumb with dropdown for collapsed items
export interface CollapsibleBreadcrumbProps
  extends Omit<BreadcrumbProps, 'maxItems'> {
  maxVisibleItems?: number
}

export const CollapsibleBreadcrumb: React.FC<CollapsibleBreadcrumbProps> = ({
  items,
  maxVisibleItems = 3,
  separator = <ChevronSeparator />,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (items.length <= maxVisibleItems) {
    return <Breadcrumb items={items} separator={separator} {...props} />
  }

  const visibleItems = isExpanded
    ? items
    : [
        items[0],
        {
          label: `${items.length - maxVisibleItems + 1} more...`,
          href: undefined,
        },
        ...items.slice(-(maxVisibleItems - 1)),
      ]

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.label.includes('more...')) {
      setIsExpanded(true)
    } else if (props.onItemClick) {
      props.onItemClick(item, index)
    }
  }

  return (
    <Breadcrumb
      items={visibleItems}
      separator={separator}
      onItemClick={handleItemClick}
      {...props}
    />
  )
}
