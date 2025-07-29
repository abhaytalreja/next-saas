'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Download,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@nextsaas/ui'

interface MetricRow {
  id: string
  metric: string
  current: number | string
  previous: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  category?: string
  format?: 'number' | 'currency' | 'percentage' | 'duration'
  description?: string
}

interface MetricsTableProps {
  data: MetricRow[]
  loading?: boolean
  title?: string
  className?: string
  showExport?: boolean
  showFilters?: boolean
  categories?: string[]
  onExport?: () => void
}

type SortField = 'metric' | 'current' | 'previous' | 'change'
type SortOrder = 'asc' | 'desc'

export function MetricsTable({
  data,
  loading = false,
  title = 'Detailed Metrics',
  className = '',
  showExport = true,
  showFilters = true,
  categories,
  onExport
}: MetricsTableProps) {
  const [sortField, setSortField] = useState<SortField>('metric')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Format values based on type
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'duration':
        const minutes = Math.floor(value / 60)
        const seconds = Math.floor(value % 60)
        return `${minutes}m ${seconds}s`
      case 'number':
      default:
        return value.toLocaleString()
    }
  }

  // Get trend icon and color
  const getTrendDisplay = (trend: 'up' | 'down' | 'stable', change: number) => {
    const absChange = Math.abs(change)
    
    switch (trend) {
      case 'up':
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          bg: 'bg-green-50',
          text: `+${absChange.toFixed(1)}%`
        }
      case 'down':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bg: 'bg-red-50',
          text: `-${absChange.toFixed(1)}%`
        }
      case 'stable':
      default:
        return {
          icon: Minus,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          text: '0%'
        }
    }
  }

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let filtered = data

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(row => row.category === selectedCategory)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Convert to numbers for numeric fields
      if (sortField === 'current' || sortField === 'previous' || sortField === 'change') {
        aValue = typeof aValue === 'string' ? parseFloat(aValue.toString()) || 0 : aValue
        bValue = typeof bValue === 'string' ? parseFloat(bValue.toString()) || 0 : bValue
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [data, selectedCategory, searchTerm, sortField, sortOrder])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ArrowUpDown
    return sortOrder === 'asc' ? ArrowUp : ArrowDown
  }

  // Get unique categories
  const availableCategories = React.useMemo(() => {
    const cats = Array.from(new Set(data.map(row => row.category).filter(Boolean)))
    return categories || cats
  }, [data, categories])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4 pb-4 border-b">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category filter */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4">
                  <button
                    onClick={() => handleSort('metric')}
                    className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600"
                  >
                    Metric
                    {React.createElement(getSortIcon('metric'), { 
                      className: "h-3 w-3" 
                    })}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('current')}
                    className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600 ml-auto"
                  >
                    Current
                    {React.createElement(getSortIcon('current'), { 
                      className: "h-3 w-3" 
                    })}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('previous')}
                    className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600 ml-auto"
                  >
                    Previous
                    {React.createElement(getSortIcon('previous'), { 
                      className: "h-3 w-3" 
                    })}
                  </button>
                </th>
                <th className="text-right py-3 pl-4">
                  <button
                    onClick={() => handleSort('change')}
                    className="flex items-center gap-1 font-medium text-gray-900 hover:text-blue-600 ml-auto"
                  >
                    Change
                    {React.createElement(getSortIcon('change'), { 
                      className: "h-3 w-3" 
                    })}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((row) => {
                const trendDisplay = getTrendDisplay(row.trend, row.change)
                const TrendIcon = trendDisplay.icon

                return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div>
                        <div className="font-medium text-gray-900">{row.metric}</div>
                        {row.description && (
                          <div className="text-xs text-gray-500 mt-1">{row.description}</div>
                        )}
                        {row.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {row.category}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {formatValue(row.current, row.format)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {formatValue(row.previous, row.format)}
                    </td>
                    <td className="text-right py-3 pl-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendDisplay.color} ${trendDisplay.bg}`}>
                        <TrendIcon className="h-3 w-3" />
                        {trendDisplay.text}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {processedData.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">No metrics found</div>
            {searchTerm && (
              <div className="text-xs mt-1">
                Try adjusting your search or filters
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {processedData.length > 0 && (
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            Showing {processedData.length} of {data.length} metrics
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}