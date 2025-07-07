import React, { forwardRef, useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal, Search, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface Column<T = any> {
  key: string
  header: string
  accessor: keyof T | ((row: T) => any)
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  selection?: {
    selectedRows: string[]
    onSelectionChange: (selectedRows: string[]) => void
    getRowId: (row: T) => string
  }
  sorting?: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  }
  onRowClick?: (row: T, index: number) => void
  rowActions?: {
    render: (row: T, index: number) => React.ReactNode
  }
  emptyState?: React.ReactNode
  loadingRows?: number
}

const LoadingSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, index) => (
      <tr key={index} className="border-b border-border">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <td key={colIndex} className="px-4 py-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
          </td>
        ))}
      </tr>
    ))}
  </>
)

const EmptyState = () => (
  <tr>
    <td colSpan={100} className="px-4 py-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No data found</p>
      </div>
    </td>
  </tr>
)

export const DataTable = forwardRef<HTMLDivElement, DataTableProps>(
  ({ 
    data,
    columns,
    loading = false,
    searchable = false,
    filterable = false,
    pagination,
    selection,
    sorting,
    onRowClick,
    rowActions,
    emptyState,
    loadingRows = 5,
    className,
    ...props 
  }, ref) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<Record<string, string>>({})

    // Filter and search data
    const filteredData = useMemo(() => {
      let result = [...data]

      // Apply search
      if (searchQuery && searchable) {
        result = result.filter(row =>
          columns.some(column => {
            const value = typeof column.accessor === 'function' 
              ? column.accessor(row)
              : row[column.accessor]
            return String(value).toLowerCase().includes(searchQuery.toLowerCase())
          })
        )
      }

      // Apply filters
      Object.entries(filters).forEach(([key, filterValue]) => {
        if (filterValue) {
          result = result.filter(row => {
            const column = columns.find(col => col.key === key)
            if (!column) return true
            
            const value = typeof column.accessor === 'function'
              ? column.accessor(row)
              : row[column.accessor]
            return String(value).toLowerCase().includes(filterValue.toLowerCase())
          })
        }
      })

      return result
    }, [data, searchQuery, filters, columns, searchable])

    const handleSort = (columnKey: string) => {
      if (!sorting) return
      
      const column = columns.find(col => col.key === columnKey)
      if (!column?.sortable) return

      const newOrder = sorting.sortBy === columnKey && sorting.sortOrder === 'asc' ? 'desc' : 'asc'
      sorting.onSortChange(columnKey, newOrder)
    }

    const handleSelectAll = (checked: boolean) => {
      if (!selection) return
      
      const allIds = filteredData.map(selection.getRowId)
      selection.onSelectionChange(checked ? allIds : [])
    }

    const handleSelectRow = (rowId: string, checked: boolean) => {
      if (!selection) return
      
      const newSelection = checked
        ? [...selection.selectedRows, rowId]
        : selection.selectedRows.filter(id => id !== rowId)
      
      selection.onSelectionChange(newSelection)
    }

    const isAllSelected = selection 
      ? filteredData.length > 0 && filteredData.every(row => 
          selection.selectedRows.includes(selection.getRowId(row))
        )
      : false

    const isIndeterminate = selection
      ? selection.selectedRows.length > 0 && !isAllSelected
      : false

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {/* Header Controls */}
        {(searchable || filterable) && (
          <div className="flex items-center gap-4 p-4 border-b border-border">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            
            {filterable && (
              <button className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-md text-sm hover:bg-accent">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                {selection && (
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-border"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                      column.sortable && 'cursor-pointer hover:text-foreground',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              'h-3 w-3',
                              sorting?.sortBy === column.key && sorting.sortOrder === 'asc'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )} 
                          />
                          <ChevronDown 
                            className={cn(
                              'h-3 w-3 -mt-1',
                              sorting?.sortBy === column.key && sorting.sortOrder === 'desc'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                
                {rowActions && (
                  <th className="w-12 px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <LoadingSkeleton rows={loadingRows} />
              ) : filteredData.length === 0 ? (
                emptyState || <EmptyState />
              ) : (
                filteredData.map((row, index) => {
                  const rowId = selection ? selection.getRowId(row) : String(index)
                  const isSelected = selection ? selection.selectedRows.includes(rowId) : false
                  
                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'border-b border-border hover:bg-muted/50 transition-colors',
                        onRowClick && 'cursor-pointer',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selection && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => {
                        const value = typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : row[column.accessor]
                        
                        return (
                          <td
                            key={column.key}
                            className={cn(
                              'px-4 py-3 text-sm',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {column.render ? column.render(value, row, index) : String(value)}
                          </td>
                        )
                      })}
                      
                      {rowActions && (
                        <td className="px-4 py-3 text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            {rowActions.render(row, index)}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-input rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-2 py-1 border border-input rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                  className="px-2 py-1 border border-input rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'