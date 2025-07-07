import React, { forwardRef, useState, useMemo, useCallback } from 'react'
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface DataGridColumn<T = any> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (info: { getValue: () => any; row: T; column: DataGridColumn<T> }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  filterFn?: (row: T, columnId: string, filterValue: any) => boolean
  sortingFn?: (rowA: T, rowB: T, columnId: string) => number
  meta?: {
    headerClassName?: string
    cellClassName?: string
  }
}

export interface SortingState {
  id: string
  desc: boolean
}

export interface FilterState {
  id: string
  value: any
}

export interface DataGridProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: DataGridColumn<T>[]
  loading?: boolean
  error?: string
  
  // Sorting
  sorting?: SortingState[]
  onSortingChange?: (sorting: SortingState[]) => void
  enableSorting?: boolean
  enableMultiSort?: boolean
  
  // Filtering
  filters?: FilterState[]
  onFiltersChange?: (filters: FilterState[]) => void
  enableFiltering?: boolean
  globalFilter?: string
  onGlobalFilterChange?: (filter: string) => void
  
  // Selection
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  getRowId?: (row: T, index: number) => string
  
  // Pagination
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount?: number
    totalRows?: number
  }
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  enablePagination?: boolean
  
  // Row actions
  onRowClick?: (row: T) => void
  onRowDoubleClick?: (row: T) => void
  getRowCanExpand?: (row: T) => boolean
  onRowExpand?: (row: T, expanded: boolean) => void
  expandedRows?: Record<string, boolean>
  
  // Toolbar
  enableToolbar?: boolean
  toolbarActions?: React.ReactNode
  onExport?: () => void
  onRefresh?: () => void
  
  // Styling
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  compact?: boolean
  
  // State
  state?: {
    sorting?: SortingState[]
    filters?: FilterState[]
    rowSelection?: Record<string, boolean>
    pagination?: {
      pageIndex: number
      pageSize: number
    }
  }
}

export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(
  ({ 
    data,
    columns,
    loading = false,
    error,
    
    // Sorting
    sorting: controlledSorting,
    onSortingChange,
    enableSorting = true,
    enableMultiSort = false,
    
    // Filtering
    filters: controlledFilters,
    onFiltersChange,
    enableFiltering = true,
    globalFilter,
    onGlobalFilterChange,
    
    // Selection
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    enableRowSelection = false,
    enableMultiRowSelection = true,
    getRowId = (row, index) => String(index),
    
    // Pagination
    pagination: controlledPagination,
    onPaginationChange,
    enablePagination = true,
    
    // Row actions
    onRowClick,
    onRowDoubleClick,
    
    // Toolbar
    enableToolbar = true,
    toolbarActions,
    onExport,
    onRefresh,
    
    // Styling
    striped = false,
    bordered = true,
    hoverable = true,
    compact = false,
    
    className,
    ...props 
  }, ref) => {
    // Internal state
    const [internalSorting, setInternalSorting] = useState<SortingState[]>([])
    const [internalFilters, setInternalFilters] = useState<FilterState[]>([])
    const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({})
    const [internalPagination, setInternalPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    })

    // Use controlled or internal state
    const sorting = controlledSorting ?? internalSorting
    const filters = controlledFilters ?? internalFilters
    const rowSelection = controlledRowSelection ?? internalRowSelection
    const pagination = controlledPagination ?? internalPagination

    // Handle sorting
    const handleSort = useCallback((columnId: string) => {
      if (!enableSorting) return

      const newSorting = [...sorting]
      const existingSort = newSorting.find(sort => sort.id === columnId)

      if (existingSort) {
        if (existingSort.desc) {
          // Remove sort
          const index = newSorting.indexOf(existingSort)
          newSorting.splice(index, 1)
        } else {
          // Toggle to desc
          existingSort.desc = true
        }
      } else {
        if (!enableMultiSort) {
          newSorting.length = 0
        }
        newSorting.push({ id: columnId, desc: false })
      }

      if (onSortingChange) {
        onSortingChange(newSorting)
      } else {
        setInternalSorting(newSorting)
      }
    }, [sorting, enableSorting, enableMultiSort, onSortingChange])

    // Process data (filter, sort, paginate)
    const processedData = useMemo(() => {
      let result = [...data]

      // Apply filters
      if (enableFiltering && filters.length > 0) {
        result = result.filter(row => {
          return filters.every(filter => {
            const column = columns.find(col => col.id === filter.id)
            if (!column || !filter.value) return true

            if (column.filterFn) {
              return column.filterFn(row, filter.id, filter.value)
            }

            // Default filter implementation
            const value = column.accessorFn 
              ? column.accessorFn(row)
              : column.accessorKey 
                ? row[column.accessorKey]
                : ''

            return String(value)
              .toLowerCase()
              .includes(String(filter.value).toLowerCase())
          })
        })
      }

      // Apply global filter
      if (globalFilter) {
        result = result.filter(row => {
          return columns.some(column => {
            const value = column.accessorFn 
              ? column.accessorFn(row)
              : column.accessorKey 
                ? row[column.accessorKey]
                : ''

            return String(value)
              .toLowerCase()
              .includes(globalFilter.toLowerCase())
          })
        })
      }

      // Apply sorting
      if (enableSorting && sorting.length > 0) {
        result.sort((a, b) => {
          for (const sort of sorting) {
            const column = columns.find(col => col.id === sort.id)
            if (!column) continue

            let comparison = 0

            if (column.sortingFn) {
              comparison = column.sortingFn(a, b, sort.id)
            } else {
              const aValue = column.accessorFn 
                ? column.accessorFn(a)
                : column.accessorKey 
                  ? a[column.accessorKey]
                  : ''
              
              const bValue = column.accessorFn 
                ? column.accessorFn(b)
                : column.accessorKey 
                  ? b[column.accessorKey]
                  : ''

              if (aValue < bValue) comparison = -1
              if (aValue > bValue) comparison = 1
            }

            if (comparison !== 0) {
              return sort.desc ? -comparison : comparison
            }
          }
          return 0
        })
      }

      return result
    }, [data, columns, filters, globalFilter, sorting, enableFiltering, enableSorting])

    // Paginated data
    const paginatedData = useMemo(() => {
      if (!enablePagination) return processedData

      const start = pagination.pageIndex * pagination.pageSize
      const end = start + pagination.pageSize
      return processedData.slice(start, end)
    }, [processedData, pagination, enablePagination])

    // Selection handlers
    const handleSelectAll = useCallback((checked: boolean) => {
      if (!enableRowSelection) return

      const newSelection: Record<string, boolean> = {}
      if (checked) {
        paginatedData.forEach((row, index) => {
          const id = getRowId(row, index)
          newSelection[id] = true
        })
      }

      if (onRowSelectionChange) {
        onRowSelectionChange(newSelection)
      } else {
        setInternalRowSelection(newSelection)
      }
    }, [enableRowSelection, paginatedData, getRowId, onRowSelectionChange])

    const handleSelectRow = useCallback((rowId: string, checked: boolean) => {
      if (!enableRowSelection) return

      const newSelection = { ...rowSelection }
      if (checked) {
        newSelection[rowId] = true
      } else {
        delete newSelection[rowId]
      }

      if (onRowSelectionChange) {
        onRowSelectionChange(newSelection)
      } else {
        setInternalRowSelection(newSelection)
      }
    }, [enableRowSelection, rowSelection, onRowSelectionChange])

    // Get sort icon
    const getSortIcon = (columnId: string) => {
      const sort = sorting.find(s => s.id === columnId)
      if (!sort) return <ArrowUpDown className="h-4 w-4" />
      return sort.desc 
        ? <ArrowDown className="h-4 w-4" />
        : <ArrowUp className="h-4 w-4" />
    }

    // Check if all rows are selected
    const isAllSelected = paginatedData.length > 0 && 
      paginatedData.every((row, index) => {
        const id = getRowId(row, index)
        return rowSelection[id]
      })

    const isIndeterminate = Object.keys(rowSelection).length > 0 && !isAllSelected

    if (error) {
      return (
        <div className="flex items-center justify-center p-8 text-center">
          <div className="text-destructive">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      )
    }

    return (
      <div 
        ref={ref} 
        className={cn('w-full space-y-4', className)} 
        {...props}
      >
        {/* Toolbar */}
        {enableToolbar && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {enableFiltering && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search all columns..."
                    value={globalFilter || ''}
                    onChange={(e) => onGlobalFilterChange?.(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-input rounded-md text-sm w-64"
                  />
                </div>
              )}
              
              {Object.keys(rowSelection).length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {Object.keys(rowSelection).length} row(s) selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {toolbarActions}
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-md text-sm hover:bg-accent disabled:opacity-50"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                  Refresh
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={onExport}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-input rounded-md text-sm hover:bg-accent"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className={cn(
          'rounded-md border',
          bordered && 'border-border',
          !bordered && 'border-transparent'
        )}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn(
                  'border-b',
                  compact ? 'h-10' : 'h-12'
                )}>
                  {enableRowSelection && (
                    <th className="w-12 px-4">
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
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.meta?.headerClassName
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        
                        {column.sortable && enableSorting && (
                          <button
                            onClick={() => handleSort(column.id)}
                            className="opacity-60 hover:opacity-100 transition-opacity"
                          >
                            {getSortIcon(column.id)}
                          </button>
                        )}
                      </div>
                    </th>
                  ))}

                  <th className="w-12"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: pagination.pageSize }).map((_, index) => (
                    <tr key={index} className="border-b border-border">
                      {enableRowSelection && (
                        <td className="px-4 py-3">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.id} className="px-4 py-3">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={columns.length + (enableRowSelection ? 1 : 0) + 1}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const rowId = getRowId(row, index)
                    const isSelected = rowSelection[rowId] || false

                    return (
                      <tr
                        key={rowId}
                        className={cn(
                          'border-b border-border transition-colors',
                          striped && index % 2 === 1 && 'bg-muted/30',
                          hoverable && 'hover:bg-muted/50',
                          isSelected && 'bg-muted',
                          onRowClick && 'cursor-pointer',
                          compact ? 'h-10' : 'h-12'
                        )}
                        onClick={() => onRowClick?.(row)}
                        onDoubleClick={() => onRowDoubleClick?.(row)}
                      >
                        {enableRowSelection && (
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
                          const value = column.accessorFn 
                            ? column.accessorFn(row)
                            : column.accessorKey 
                              ? row[column.accessorKey]
                              : ''

                          return (
                            <td
                              key={column.id}
                              className={cn(
                                'px-4 py-3 text-sm',
                                column.align === 'center' && 'text-center',
                                column.align === 'right' && 'text-right',
                                column.meta?.cellClassName
                              )}
                            >
                              {column.cell 
                                ? column.cell({ getValue: () => value, row, column })
                                : String(value || '')
                              }
                            </td>
                          )
                        })}

                        <td className="px-4 py-3">
                          <button className="p-1 hover:bg-muted rounded">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {enablePagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, processedData.length)} of{' '}
              {processedData.length} entries
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  const newPagination = {
                    pageIndex: 0,
                    pageSize: Number(e.target.value),
                  }
                  if (onPaginationChange) {
                    onPaginationChange(newPagination)
                  } else {
                    setInternalPagination(newPagination)
                  }
                }}
                className="border border-input rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newPagination = {
                      ...pagination,
                      pageIndex: pagination.pageIndex - 1,
                    }
                    if (onPaginationChange) {
                      onPaginationChange(newPagination)
                    } else {
                      setInternalPagination(newPagination)
                    }
                  }}
                  disabled={pagination.pageIndex === 0}
                  className="px-3 py-1 border border-input rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => {
                    const newPagination = {
                      ...pagination,
                      pageIndex: pagination.pageIndex + 1,
                    }
                    if (onPaginationChange) {
                      onPaginationChange(newPagination)
                    } else {
                      setInternalPagination(newPagination)
                    }
                  }}
                  disabled={
                    pagination.pageIndex >= 
                    Math.ceil(processedData.length / pagination.pageSize) - 1
                  }
                  className="px-3 py-1 border border-input rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
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

DataGrid.displayName = 'DataGrid'