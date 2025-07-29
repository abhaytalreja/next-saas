'use client'

import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger
} from '@nextsaas/ui'

export interface DateRange {
  start: Date
  end: Date
  label?: string
}

interface DateRangePreset {
  label: string
  value: DateRange
  shortLabel?: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: DateRangePreset[]
  className?: string
  disabled?: boolean
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  {
    label: 'Last 7 days',
    shortLabel: '7d',
    value: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 7 days'
    }
  },
  {
    label: 'Last 14 days',
    shortLabel: '14d',
    value: {
      start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 14 days'
    }
  },
  {
    label: 'Last 30 days',
    shortLabel: '30d',
    value: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 30 days'
    }
  },
  {
    label: 'Last 90 days',
    shortLabel: '90d',
    value: {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 90 days'
    }
  },
  {
    label: 'Last 6 months',
    shortLabel: '6m',
    value: {
      start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 6 months'
    }
  },
  {
    label: 'Last year',
    shortLabel: '1y',
    value: {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last year'
    }
  },
  {
    label: 'This month',
    shortLabel: 'MTD',
    value: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
      label: 'This month'
    }
  },
  {
    label: 'Last month',
    shortLabel: 'LM',
    value: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      label: 'Last month'
    }
  },
  {
    label: 'This quarter',
    shortLabel: 'QTD',
    value: {
      start: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1),
      end: new Date(),
      label: 'This quarter'
    }
  },
  {
    label: 'This year',
    shortLabel: 'YTD',
    value: {
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(),
      label: 'This year'
    }
  }
]

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className = '',
  disabled = false
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = (range: DateRange) => {
    const start = formatDate(range.start)
    const end = formatDate(range.end)
    
    // If same day, show just one date
    if (start === end) {
      return start
    }
    
    // If same year, omit year from start date
    if (range.start.getFullYear() === range.end.getFullYear()) {
      const startShort = range.start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      return `${startShort} - ${end}`
    }
    
    return `${start} - ${end}`
  }

  const getCurrentPresetLabel = () => {
    const matchingPreset = presets.find(preset => 
      Math.abs(preset.value.start.getTime() - value.start.getTime()) < 24 * 60 * 60 * 1000 &&
      Math.abs(preset.value.end.getTime() - value.end.getTime()) < 24 * 60 * 60 * 1000
    )
    
    return matchingPreset?.label || value.label || formatDateRange(value)
  }

  const handlePresetSelect = (preset: DateRangePreset) => {
    onChange(preset.value)
    setOpen(false)
  }

  const isPresetSelected = (preset: DateRangePreset) => {
    return Math.abs(preset.value.start.getTime() - value.start.getTime()) < 24 * 60 * 60 * 1000 &&
           Math.abs(preset.value.end.getTime() - value.end.getTime()) < 24 * 60 * 60 * 1000
  }

  // Group presets by category
  const quickPresets = presets.filter(p => ['Last 7 days', 'Last 30 days', 'Last 90 days'].includes(p.label))
  const periodPresets = presets.filter(p => ['This month', 'Last month', 'This quarter', 'This year'].includes(p.label))
  const extendedPresets = presets.filter(p => !quickPresets.includes(p) && !periodPresets.includes(p))

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between ${className}`}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{getCurrentPresetLabel()}</span>
            <span className="sm:hidden">
              {presets.find(p => isPresetSelected(p))?.shortLabel || 'Custom'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end" className="w-56">
        {/* Quick ranges */}
        <DropdownLabel>Quick ranges</DropdownLabel>
        {quickPresets.map((preset) => (
          <DropdownItem
            key={preset.label}
            onClick={() => handlePresetSelect(preset)}
            className={isPresetSelected(preset) ? 'bg-blue-50 text-blue-700' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{preset.label}</span>
              {isPresetSelected(preset) && (
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </div>
          </DropdownItem>
        ))}

        <DropdownSeparator />

        {/* Period ranges */}
        <DropdownLabel>Periods</DropdownLabel>
        {periodPresets.map((preset) => (
          <DropdownItem
            key={preset.label}
            onClick={() => handlePresetSelect(preset)}
            className={isPresetSelected(preset) ? 'bg-blue-50 text-blue-700' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{preset.label}</span>
              {isPresetSelected(preset) && (
                <div className="h-2 w-2 rounded-full bg-blue-600" />
              )}
            </div>
          </DropdownItem>
        ))}

        {extendedPresets.length > 0 && (
          <>
            <DropdownSeparator />
            <DropdownLabel>Extended ranges</DropdownLabel>
            {extendedPresets.map((preset) => (
              <DropdownItem
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className={isPresetSelected(preset) ? 'bg-blue-50 text-blue-700' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{preset.label}</span>
                  {isPresetSelected(preset) && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </>
        )}

        <DropdownSeparator />
        
        {/* Current selection info */}
        <div className="px-2 py-1.5 text-xs text-gray-500 border-t">
          <div className="font-medium">Current range:</div>
          <div className="truncate">{formatDateRange(value)}</div>
        </div>
      </DropdownContent>
    </DropdownMenu>
  )
}