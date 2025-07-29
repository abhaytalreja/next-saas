import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { ExportButton, CSVExportButton, JSONExportButton, ExcelExportButton } from '../ExportButton'
import { ExportFormat } from '../../../utils/export-utils'

expect.extend(toHaveNoViolations)

// Mock export utilities
jest.mock('../../../utils/export-utils', () => ({
  exportData: jest.fn(),
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid="export-button"
    >
      {children}
    </button>
  ),
  DropdownMenu: ({ children, onOpenChange }: any) => (
    <div data-testid="dropdown-menu" data-onOpenChange={onOpenChange}>{children}</div>
  ),
  DropdownContent: ({ children, align, className }: any) => (
    <div data-testid="dropdown-content" data-align={align} className={className}>{children}</div>
  ),
  DropdownItem: ({ children, onClick, disabled, className }: any) => (
    <div 
      data-testid="dropdown-item" 
      onClick={onClick} 
      data-disabled={disabled}
      className={className}
      role="menuitem"
    >
      {children}
    </div>
  ),
  DropdownLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownSeparator: () => <div data-testid="dropdown-separator" />,
  DropdownTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Download: ({ className }: any) => <div data-testid="download-icon" className={className} />,
  FileText: ({ className }: any) => <div data-testid="file-text-icon" className={className} />,
  Database: ({ className }: any) => <div data-testid="database-icon" className={className} />,
  Sheet: ({ className }: any) => <div data-testid="sheet-icon" className={className} />,
}))

const mockData = [
  { id: 1, name: 'Test User 1', email: 'test1@example.com' },
  { id: 2, name: 'Test User 2', email: 'test2@example.com' },
]

const mockExportData = require('../../../utils/export-utils').exportData as jest.Mock

describe('ExportButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('single format rendering', () => {
    it('should render as single button when only one format provided', () => {
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button', { name: /export csv/i })
      expect(button).toBeInTheDocument()
      expect(screen.getByTestId('sheet-icon')).toBeInTheDocument()
    })

    it('should show correct format-specific icon and text', () => {
      render(<ExportButton data={mockData} formats={['json']} />)
      
      expect(screen.getByText('Export JSON')).toBeInTheDocument()
      expect(screen.getByTestId('database-icon')).toBeInTheDocument()
    })

    it('should show loading state when exporting', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(screen.getByText('Exporting...')).toBeInTheDocument()
    })

    it('should handle export completion', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument()
      })
    })
  })

  describe('multiple formats rendering', () => {
    it('should render as dropdown when multiple formats provided', () => {
      render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
      expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('should show all format options in dropdown', () => {
      render(<ExportButton data={mockData} formats={['csv', 'json', 'xlsx']} />)
      
      expect(screen.getByText('CSV File')).toBeInTheDocument()
      expect(screen.getByText('JSON File')).toBeInTheDocument()
      expect(screen.getByText('Excel File')).toBeInTheDocument()
    })

    it('should show format descriptions', () => {
      render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      expect(screen.getByText('Comma-separated values, compatible with Excel')).toBeInTheDocument()
      expect(screen.getByText('JSON format for developers and APIs')).toBeInTheDocument()
    })

    it('should show record count in dropdown', () => {
      render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      expect(screen.getByText('2 records')).toBeInTheDocument()
    })
  })

  describe('export functionality', () => {
    it('should call exportData with correct parameters', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv']} filename="test-export" />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith(mockData, {
          filename: 'test-export',
          format: 'csv',
          includeHeaders: true,
          includeTimestamp: true
        })
      })
    })

    it('should call onExport callback when provided', async () => {
      const user = userEvent.setup()
      const onExport = jest.fn()
      render(<ExportButton data={mockData} formats={['json']} onExport={onExport} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(onExport).toHaveBeenCalledWith('json')
    })

    it('should use custom exporter when provided', async () => {
      const user = userEvent.setup()
      const customExporter = jest.fn()
      render(<ExportButton data={mockData} formats={['csv']} customExporter={customExporter} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(customExporter).toHaveBeenCalledWith(mockData, 'csv')
      expect(mockExportData).not.toHaveBeenCalled()
    })

    it('should handle export from dropdown menu', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      const csvItem = screen.getByRole('menuitem', { name: /csv file/i })
      await user.click(csvItem)
      
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith(mockData, expect.objectContaining({
          format: 'csv'
        }))
      })
    })
  })

  describe('disabled states', () => {
    it('should disable when disabled prop is true', () => {
      render(<ExportButton data={mockData} formats={['csv']} disabled={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable when loading prop is true', () => {
      render(<ExportButton data={mockData} formats={['csv']} loading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable when no data provided', () => {
      render(<ExportButton data={[]} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should disable when data is null', () => {
      render(<ExportButton data={null as any} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show "No data to export" message when no data', () => {
      render(<ExportButton data={[]} formats={['csv', 'json']} />)
      
      expect(screen.getByText('No data to export')).toBeInTheDocument()
    })
  })

  describe('styling and variants', () => {
    it('should apply correct variant prop', () => {
      render(<ExportButton data={mockData} formats={['csv']} variant="ghost" />)
      
      const button = screen.getByTestId('export-button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })

    it('should apply correct size prop', () => {
      render(<ExportButton data={mockData} formats={['csv']} size="lg" />)
      
      const button = screen.getByTestId('export-button')
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('should apply custom className', () => {
      render(<ExportButton data={mockData} formats={['csv']} className="custom-class" />)
      
      const button = screen.getByTestId('export-button')
      expect(button).toHaveClass('custom-class')
    })

    it('should hide icon when showIcon is false', () => {
      render(<ExportButton data={mockData} formats={['csv']} showIcon={false} />)
      
      expect(screen.queryByTestId('sheet-icon')).not.toBeInTheDocument()
    })

    it('should show icon by default', () => {
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      expect(screen.getByTestId('sheet-icon')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockExportData.mockRejectedValue(new Error('Export failed'))
      
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })

    it('should reset loading state after error', async () => {
      const user = userEvent.setup()
      jest.spyOn(console, 'error').mockImplementation()
      mockExportData.mockRejectedValue(new Error('Export failed'))
      
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ExportButton data={mockData} formats={['csv']} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with dropdown', async () => {
      const { container } = render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper button role', () => {
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have proper menuitem roles in dropdown', () => {
      render(<ExportButton data={mockData} formats={['csv', 'json']} />)
      
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems).toHaveLength(2)
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      await user.tab()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockExportData).toHaveBeenCalled()
    })
  })

  describe('format-specific components', () => {
    it('should render CSVExportButton correctly', () => {
      render(<CSVExportButton data={mockData} />)
      
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
      expect(screen.getByTestId('sheet-icon')).toBeInTheDocument()
    })

    it('should render JSONExportButton correctly', () => {
      render(<JSONExportButton data={mockData} />)
      
      expect(screen.getByText('Export JSON')).toBeInTheDocument()
      expect(screen.getByTestId('database-icon')).toBeInTheDocument()
    })

    it('should render ExcelExportButton correctly', () => {
      render(<ExcelExportButton data={mockData} />)
      
      expect(screen.getByText('Export XLSX')).toBeInTheDocument()
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument()
    })

    it('should forward props to format-specific components', () => {
      render(<CSVExportButton data={mockData} variant="ghost" size="sm" />)
      
      const button = screen.getByTestId('export-button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
      expect(button).toHaveAttribute('data-size', 'sm')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined data gracefully', () => {
      render(<ExportButton data={undefined as any} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle empty formats array', () => {
      render(<ExportButton data={mockData} formats={[]} />)
      
      // Should render as multiple format dropdown but with no items
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    })

    it('should handle missing format configuration', () => {
      render(<ExportButton data={mockData} formats={['unknown' as ExportFormat]} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should prevent multiple simultaneous exports', async () => {
      const user = userEvent.setup()
      render(<ExportButton data={mockData} formats={['csv']} />)
      
      const button = screen.getByRole('button')
      
      // Click multiple times rapidly
      await user.click(button)
      await user.click(button)
      await user.click(button)
      
      // Should only call export once
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now()
      
      render(<ExportButton data={mockData} formats={['csv', 'json', 'xlsx']} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(50)
    })

    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `User ${i}` }))
      
      expect(() => render(<ExportButton data={largeData} formats={['csv']} />)).not.toThrow()
      
      expect(screen.getByText('10,000 records')).toBeInTheDocument()
    })

    it('should not cause memory leaks', () => {
      const { unmount } = render(<ExportButton data={mockData} formats={['csv']} />)
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('integration', () => {
    it('should work with real export scenarios', async () => {
      const user = userEvent.setup()
      const onExport = jest.fn()
      
      render(
        <ExportButton 
          data={mockData} 
          formats={['csv', 'json']} 
          filename="user-data"
          onExport={onExport}
        />
      )
      
      const csvItem = screen.getByRole('menuitem', { name: /csv file/i })
      await user.click(csvItem)
      
      expect(onExport).toHaveBeenCalledWith('csv')
      await waitFor(() => {
        expect(mockExportData).toHaveBeenCalledWith(mockData, {
          filename: 'user-data',
          format: 'csv',
          includeHeaders: true,
          includeTimestamp: true
        })
      })
    })
  })
})