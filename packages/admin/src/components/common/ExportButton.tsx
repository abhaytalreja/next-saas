'use client'

import React, { useState } from 'react'
import { Download, FileText, Database, Sheet } from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger
} from '@nextsaas/ui'
import { exportData, ExportFormat } from '../../utils/export-utils'

interface ExportButtonProps {
  data: any[]
  filename?: string
  onExport?: (format: ExportFormat) => void
  disabled?: boolean
  loading?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  formats?: ExportFormat[]
  showIcon?: boolean
  customExporter?: (data: any[], format: ExportFormat) => void
}

const DEFAULT_FORMATS: ExportFormat[] = ['csv', 'json']

const FORMAT_ICONS = {
  csv: Sheet,
  json: Database,
  xlsx: FileText,
}

const FORMAT_LABELS = {
  csv: 'CSV File',
  json: 'JSON File', 
  xlsx: 'Excel File',
}

const FORMAT_DESCRIPTIONS = {
  csv: 'Comma-separated values, compatible with Excel',
  json: 'JSON format for developers and APIs',
  xlsx: 'Microsoft Excel format (advanced)',
}

export function ExportButton({
  data,
  filename = 'export',
  onExport,
  disabled = false,
  loading = false,
  className = '',
  variant = 'outline',
  size = 'default',
  formats = DEFAULT_FORMATS,
  showIcon = true,
  customExporter
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    if (disabled || loading || isExporting || !data || data.length === 0) {
      return
    }

    setIsExporting(true)

    try {
      // Call custom export callback if provided
      if (onExport) {
        onExport(format)
      }

      // Use custom exporter if provided, otherwise use default
      if (customExporter) {
        customExporter(data, format)
      } else {
        exportData(data, {
          filename,
          format,
          includeHeaders: true,
          includeTimestamp: true
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      // In a real app, you'd show a toast notification here
    } finally {
      setIsExporting(false)
    }
  }

  // Single format - direct button
  if (formats.length === 1) {
    const format = formats[0]
    const FormatIcon = FORMAT_ICONS[format]

    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(format)}
        disabled={disabled || loading || isExporting || !data || data.length === 0}
        className={className}
      >
        {showIcon && (
          <FormatIcon className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''} mr-2`} />
        )}
        {isExporting ? 'Exporting...' : `Export ${format.toUpperCase()}`}
      </Button>
    )
  }

  // Multiple formats - dropdown menu
  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen}>
      <DropdownTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading || !data || data.length === 0}
          className={className}
        >
          {showIcon && (
            <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''} mr-2`} />
          )}
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownTrigger>
      <DropdownContent align="end" className="w-56">
        <DropdownLabel>Export Format</DropdownLabel>
        <DropdownSeparator />
        {formats.map((format) => {
          const Icon = FORMAT_ICONS[format]
          const label = FORMAT_LABELS[format]
          const description = FORMAT_DESCRIPTIONS[format]

          return (
            <DropdownItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-4 w-4 mt-0.5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {description}
                  </div>
                </div>
              </div>
            </DropdownItem>
          )
        })}
        
        <DropdownSeparator />
        
        <div className="px-2 py-1.5 text-xs text-gray-500">
          {data?.length ? `${data.length} records` : 'No data to export'}
        </div>
      </DropdownContent>
    </DropdownMenu>
  )
}

// Quick export buttons for common formats
export function CSVExportButton(props: Omit<ExportButtonProps, 'formats'>) {
  return <ExportButton {...props} formats={['csv']} />
}

export function JSONExportButton(props: Omit<ExportButtonProps, 'formats'>) {
  return <ExportButton {...props} formats={['json']} />
}

export function ExcelExportButton(props: Omit<ExportButtonProps, 'formats'>) {
  return <ExportButton {...props} formats={['xlsx']} />
}