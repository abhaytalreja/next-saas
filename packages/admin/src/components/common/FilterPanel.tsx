'use client'

import React, { useState } from 'react'
import { 
  Filter, 
  X, 
  Calendar, 
  User, 
  ChevronDown,
  Search,
  RefreshCw
} from 'lucide-react'
import {
  Button,
  Badge
} from '@nextsaas/ui'

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'text' | 'user'
  options?: FilterOption[]
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface FilterValues {
  [key: string]: any
}

interface FilterPanelProps {
  filters: FilterConfig[]
  values: FilterValues
  onChange: (values: FilterValues) => void
  onReset: () => void
  className?: string
  showActiveCount?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className = '',
  showActiveCount = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Count active filters
  const activeFilterCount = Object.values(values).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null && value !== ''
  }).length

  const handleFilterChange = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value
    })
  }

  const handleReset = () => {
    onReset()
    setIsOpen(false)
  }

  const renderFilterInput = (filter: FilterConfig) => {
    const value = values[filter.key]
    const Icon = filter.icon

    switch (filter.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32 appearance-none bg-white"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{filter.label}</div>
            <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {filter.options?.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value)
                      handleFilterChange(filter.key, newValues)
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                  {option.count !== undefined && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {option.count}
                    </Badge>
                  )}
                </label>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="text-xs text-gray-500">
                {selectedValues.length} selected
              </div>
            )}
          </div>
        )

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )

      case 'text':
        return (
          <div className="relative">
            <input
              type="text"
              placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`}
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            />
            {Icon ? (
              <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            ) : (
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            )}
          </div>
        )

      default:
        return null
    }
  }

  const renderActiveFilters = () => {
    const activeFilters = filters.filter(filter => {
      const value = values[filter.key]
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ''
    })

    if (activeFilters.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2">
        {activeFilters.map(filter => {
          const value = values[filter.key]
          let displayValue: string

          if (Array.isArray(value)) {
            displayValue = `${value.length} selected`
          } else if (filter.type === 'select' && filter.options) {
            displayValue = filter.options.find(opt => opt.value === value)?.label || value
          } else if (filter.type === 'date') {
            displayValue = new Date(value).toLocaleDateString()
          } else {
            displayValue = value
          }

          return (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">{filter.label}: {displayValue}</span>
              <button
                onClick={() => handleFilterChange(filter.key, Array.isArray(value) ? [] : '')}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Global Search */}
        {onSearchChange && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className={`${activeFilterCount > 0 ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showActiveCount && activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {renderActiveFilters()}

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button variant="ghost" onClick={handleReset}>
              Reset All
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}