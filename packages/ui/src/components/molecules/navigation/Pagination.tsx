'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  showFirstLast?: boolean
  showPrevNext?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

const paginationItemVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
        outline:
          'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900',
        ghost:
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200',
      },
      size: {
        sm: 'h-8 px-2 text-xs rounded',
        md: 'h-10 px-3 text-sm rounded-md',
        lg: 'h-12 px-4 text-base rounded-lg',
      },
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        active: true,
        className:
          'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
      },
      {
        variant: 'outline',
        active: true,
        className:
          'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
      },
      {
        variant: 'ghost',
        active: true,
        className:
          'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      active: false,
    },
  }
)

const DOTS = '...'

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const usePagination = ({
  totalPages,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1,
}: {
  totalPages: number
  currentPage: number
  siblingCount?: number
  boundaryCount?: number
}) => {
  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2
    const shouldShowRightDots =
      rightSiblingIndex < totalPages - boundaryCount - 1

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = range(1, leftItemCount)
      return [
        ...leftRange,
        DOTS,
        ...range(totalPages - boundaryCount + 1, totalPages),
      ]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = range(totalPages - rightItemCount + 1, totalPages)
      return [...range(1, boundaryCount), DOTS, ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      return [
        ...range(1, boundaryCount),
        DOTS,
        ...middleRange,
        DOTS,
        ...range(totalPages - boundaryCount + 1, totalPages),
      ]
    }

    return []
  }, [totalPages, currentPage, siblingCount, boundaryCount])

  return paginationRange
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = true,
      showPrevNext = true,
      size,
      variant,
      className,
      ...props
    },
    ref
  ) => {
    const paginationRange = usePagination({
      currentPage,
      totalPages,
      siblingCount,
      boundaryCount,
    })

    if (currentPage === 0 || paginationRange.length < 2) {
      return null
    }

    const onNext = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1)
      }
    }

    const onPrevious = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1)
      }
    }

    return (
      <nav
        ref={ref}
        className={cn('flex items-center space-x-1', className)}
        aria-label="Pagination"
        {...props}
      >
        {showFirstLast && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7M18 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {showPrevNext && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={onPrevious}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-gray-400 dark:text-gray-600"
              >
                &#8230;
              </span>
            )
          }

          return (
            <button
              key={pageNumber}
              className={cn(
                paginationItemVariants({
                  variant,
                  size,
                  active: pageNumber === currentPage,
                })
              )}
              onClick={() => onPageChange(Number(pageNumber))}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={pageNumber === currentPage ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          )
        })}

        {showPrevNext && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={onNext}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {showFirstLast && (
          <button
            className={cn(paginationItemVariants({ variant, size }))}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M6 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'

// Simple Pagination component
export interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        Next
      </button>
    </div>
  )
}
