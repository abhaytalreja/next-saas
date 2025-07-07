import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { DataTable, Column, DataTableProps } from './DataTable'
import { testAccessibility } from '../../test-utils'

// Mock data for testing
interface TestData {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  age: number
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', age: 25 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', age: 35 },
]

const mockColumns: Column<TestData>[] = [
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'email', header: 'Email', accessor: 'email', sortable: true },
  { key: 'status', header: 'Status', accessor: 'status', filterable: true },
  { key: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'right' },
]

describe('DataTable Component', () => {
  const defaultProps: DataTableProps<TestData> = {
    data: mockData,
    columns: mockColumns,
  }

  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      render(<DataTable {...defaultProps} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DataTable {...defaultProps} className="custom-table" />)
      expect(screen.getByRole('table').closest('div')).toHaveClass('custom-table')
    })

    it('renders all columns and data', () => {
      render(<DataTable {...defaultProps} />)
      
      // Check headers
      mockColumns.forEach(column => {
        expect(screen.getByText(column.header)).toBeInTheDocument()
      })
      
      // Check data
      mockData.forEach(row => {
        expect(screen.getByText(row.name)).toBeInTheDocument()
        expect(screen.getByText(row.email)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<DataTable {...defaultProps} loading={true} />)
      
      // Should not show actual data
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      
      // Should show skeleton rows
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('shows custom number of loading rows', () => {
      render(<DataTable {...defaultProps} loading={true} loadingRows={3} />)
      
      const tableBody = screen.getByRole('table').querySelector('tbody')
      const rows = tableBody?.querySelectorAll('tr')
      expect(rows).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('shows default empty state when no data', () => {
      render(<DataTable {...defaultProps} data={[]} />)
      expect(screen.getByText('No data found')).toBeInTheDocument()
    })

    it('shows custom empty state when provided', () => {
      const customEmpty = <div>Custom empty message</div>
      render(<DataTable {...defaultProps} data={[]} emptyState={customEmpty} />)
      expect(screen.getByText('Custom empty message')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input when searchable is true', () => {
      render(<DataTable {...defaultProps} searchable />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('filters data based on search query', async () => {
      render(<DataTable {...defaultProps} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'John' } })
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })
    })

    it('shows no results when search yields no matches', async () => {
      render(<DataTable {...defaultProps} searchable />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No data found')).toBeInTheDocument()
      })
    })
  })

  describe('Sorting Functionality', () => {
    it('renders sort indicators for sortable columns', () => {
      const sortingProps = {
        sortBy: 'name',
        sortOrder: 'asc' as const,
        onSortChange: jest.fn(),
      }
      
      render(<DataTable {...defaultProps} sorting={sortingProps} />)
      
      // Sortable columns should have chevron icons
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader?.querySelector('svg')).toBeInTheDocument()
    })

    it('calls onSortChange when sortable column header is clicked', () => {
      const onSortChange = jest.fn()
      const sortingProps = {
        sortBy: 'name',
        sortOrder: 'asc' as const,
        onSortChange,
      }
      
      render(<DataTable {...defaultProps} sorting={sortingProps} />)
      
      fireEvent.click(screen.getByText('Name'))
      expect(onSortChange).toHaveBeenCalledWith('name', 'desc')
    })

    it('does not call onSortChange for non-sortable columns', () => {
      const onSortChange = jest.fn()
      const sortingProps = {
        sortBy: 'name',
        sortOrder: 'asc' as const,
        onSortChange,
      }
      
      const nonSortableColumns = [
        { key: 'name', header: 'Name', accessor: 'name' as keyof TestData, sortable: false },
      ]
      
      render(<DataTable data={mockData} columns={nonSortableColumns} sorting={sortingProps} />)
      
      fireEvent.click(screen.getByText('Name'))
      expect(onSortChange).not.toHaveBeenCalled()
    })
  })

  describe('Selection Functionality', () => {
    const selectionProps = {
      selectedRows: ['1'],
      onSelectionChange: jest.fn(),
      getRowId: (row: TestData) => row.id,
    }

    beforeEach(() => {
      selectionProps.onSelectionChange.mockClear()
    })

    it('renders checkboxes when selection is enabled', () => {
      render(<DataTable {...defaultProps} selection={selectionProps} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('handles select all functionality', () => {
      render(<DataTable {...defaultProps} selection={selectionProps} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(selectAllCheckbox)
      
      expect(selectionProps.onSelectionChange).toHaveBeenCalledWith(['1', '2', '3'])
    })

    it('handles individual row selection', () => {
      render(<DataTable {...defaultProps} selection={selectionProps} />)
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1) // Skip select all
      fireEvent.click(rowCheckboxes[1]) // Select second row
      
      expect(selectionProps.onSelectionChange).toHaveBeenCalledWith(['1', '2'])
    })

    it('prevents row click when clicking checkbox', () => {
      const onRowClick = jest.fn()
      render(<DataTable {...defaultProps} selection={selectionProps} onRowClick={onRowClick} />)
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1)
      fireEvent.click(rowCheckboxes[0])
      
      expect(onRowClick).not.toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    const paginationProps = {
      page: 1,
      pageSize: 10,
      total: 50,
      onPageChange: jest.fn(),
      onPageSizeChange: jest.fn(),
    }

    beforeEach(() => {
      paginationProps.onPageChange.mockClear()
      paginationProps.onPageSizeChange.mockClear()
    })

    it('renders pagination controls when pagination is provided', () => {
      render(<DataTable {...defaultProps} pagination={paginationProps} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('calls onPageChange when navigation buttons are clicked', () => {
      render(<DataTable {...defaultProps} pagination={paginationProps} />)
      
      fireEvent.click(screen.getByText('Next'))
      expect(paginationProps.onPageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageSizeChange when page size is changed', () => {
      render(<DataTable {...defaultProps} pagination={paginationProps} />)
      
      const pageSizeSelect = screen.getByDisplayValue('10')
      fireEvent.change(pageSizeSelect, { target: { value: '20' } })
      
      expect(paginationProps.onPageSizeChange).toHaveBeenCalledWith(20)
    })

    it('disables Previous button on first page', () => {
      render(<DataTable {...defaultProps} pagination={paginationProps} />)
      
      expect(screen.getByText('Previous')).toBeDisabled()
    })

    it('disables Next button on last page', () => {
      const lastPageProps = { ...paginationProps, page: 5 }
      render(<DataTable {...defaultProps} pagination={lastPageProps} />)
      
      expect(screen.getByText('Next')).toBeDisabled()
    })
  })

  describe('Row Actions', () => {
    const rowActions = {
      render: (row: TestData) => (
        <button data-testid={`action-${row.id}`}>Actions</button>
      ),
    }

    it('renders row actions when provided', () => {
      render(<DataTable {...defaultProps} rowActions={rowActions} />)
      
      expect(screen.getByTestId('action-1')).toBeInTheDocument()
      expect(screen.getByTestId('action-2')).toBeInTheDocument()
    })

    it('prevents row click when clicking row actions', () => {
      const onRowClick = jest.fn()
      render(<DataTable {...defaultProps} rowActions={rowActions} onRowClick={onRowClick} />)
      
      fireEvent.click(screen.getByTestId('action-1'))
      expect(onRowClick).not.toHaveBeenCalled()
    })
  })

  describe('Row Click Handling', () => {
    it('calls onRowClick when row is clicked', () => {
      const onRowClick = jest.fn()
      render(<DataTable {...defaultProps} onRowClick={onRowClick} />)
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      fireEvent.click(firstRow!)
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0)
    })

    it('applies cursor-pointer style when onRowClick is provided', () => {
      const onRowClick = jest.fn()
      render(<DataTable {...defaultProps} onRowClick={onRowClick} />)
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).toHaveClass('cursor-pointer')
    })
  })

  describe('Custom Column Rendering', () => {
    it('uses custom render function when provided', () => {
      const customColumns: Column<TestData>[] = [
        {
          key: 'status',
          header: 'Status',
          accessor: 'status',
          render: (value) => (
            <span data-testid={`status-${value}`} className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
              {value.toUpperCase()}
            </span>
          ),
        },
      ]
      
      render(<DataTable data={mockData} columns={customColumns} />)
      
      expect(screen.getByTestId('status-active')).toBeInTheDocument()
      expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    })

    it('uses function accessor when provided', () => {
      const customColumns: Column<TestData>[] = [
        {
          key: 'fullInfo',
          header: 'Full Info',
          accessor: (row) => `${row.name} (${row.email})`,
        },
      ]
      
      render(<DataTable data={mockData} columns={customColumns} />)
      
      expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument()
    })
  })

  describe('Column Alignment', () => {
    it('applies text alignment classes correctly', () => {
      const alignedColumns: Column<TestData>[] = [
        { key: 'left', header: 'Left', accessor: 'name', align: 'left' },
        { key: 'center', header: 'Center', accessor: 'email', align: 'center' },
        { key: 'right', header: 'Right', accessor: 'age', align: 'right' },
      ]
      
      render(<DataTable data={mockData} columns={alignedColumns} />)
      
      const centerHeader = screen.getByText('Center').closest('th')
      const rightHeader = screen.getByText('Right').closest('th')
      
      expect(centerHeader).toHaveClass('text-center')
      expect(rightHeader).toHaveClass('text-right')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<DataTable {...defaultProps} />)
    })

    it('provides proper table structure', () => {
      render(<DataTable {...defaultProps} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(mockColumns.length)
      expect(screen.getAllByRole('row')).toHaveLength(mockData.length + 1) // +1 for header
    })

    it('provides screen reader text for actions column', () => {
      const rowActions = {
        render: () => <button>Actions</button>,
      }
      
      render(<DataTable {...defaultProps} rowActions={rowActions} />)
      
      expect(screen.getByText('Actions', { selector: '.sr-only' })).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DataTable {...defaultProps} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Filter Controls', () => {
    it('renders filter button when filterable is true', () => {
      render(<DataTable {...defaultProps} filterable />)
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })

    it('does not render search or filter controls when not enabled', () => {
      render(<DataTable {...defaultProps} />)
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })
})