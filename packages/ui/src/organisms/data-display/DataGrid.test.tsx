import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { DataGrid, DataGridColumn, SortingState, FilterState } from './DataGrid'
import { testAccessibility } from '../../test-utils'

// Mock data for testing
interface TestData {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  age: number
  department: string
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', age: 30, department: 'Engineering' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', age: 25, department: 'Design' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', age: 35, department: 'Engineering' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', age: 28, department: 'Marketing' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', status: 'inactive', age: 42, department: 'Sales' },
]

const mockColumns: DataGridColumn<TestData>[] = [
  { 
    id: 'name', 
    header: 'Name', 
    accessorKey: 'name', 
    sortable: true,
    filterable: true 
  },
  { 
    id: 'email', 
    header: 'Email', 
    accessorKey: 'email', 
    sortable: true 
  },
  { 
    id: 'status', 
    header: 'Status', 
    accessorKey: 'status',
    cell: ({ getValue }) => (
      <span className={getValue() === 'active' ? 'text-green-600' : 'text-red-600'}>
        {getValue()}
      </span>
    )
  },
  { 
    id: 'age', 
    header: 'Age', 
    accessorKey: 'age', 
    sortable: true,
    align: 'right' as const
  },
  { 
    id: 'department', 
    header: 'Department', 
    accessorKey: 'department',
    filterable: true
  },
]

describe('DataGrid Component', () => {
  const defaultProps = {
    data: mockData,
    columns: mockColumns,
  }

  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      render(<DataGrid {...defaultProps} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<DataGrid {...defaultProps} className="custom-grid" />)
      expect(screen.getByRole('table').closest('div')).toHaveClass('custom-grid')
    })

    it('renders all columns and data', () => {
      render(<DataGrid {...defaultProps} />)
      
      // Check headers
      mockColumns.forEach(column => {
        expect(screen.getByText(column.header)).toBeInTheDocument()
      })
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    it('renders with custom cell content', () => {
      render(<DataGrid {...defaultProps} />)
      
      const activeStatus = screen.getAllByText('active')[0]
      expect(activeStatus).toHaveClass('text-green-600')
      
      const inactiveStatus = screen.getAllByText('inactive')[0]
      expect(inactiveStatus).toHaveClass('text-red-600')
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<DataGrid {...defaultProps} loading />)
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      
      const skeletonElements = document.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('shows correct number of loading rows based on page size', () => {
      render(<DataGrid {...defaultProps} loading pagination={{ pageIndex: 0, pageSize: 3 }} />)
      
      const tableBody = screen.getByRole('table').querySelector('tbody')
      const rows = tableBody?.querySelectorAll('tr')
      expect(rows).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no data', () => {
      render(<DataGrid data={[]} columns={mockColumns} />)
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows error message when error prop is provided', () => {
      render(<DataGrid {...defaultProps} error="Failed to load data" />)
      expect(screen.getByText('Error loading data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })

  describe('Toolbar', () => {
    it('renders toolbar when enableToolbar is true', () => {
      render(<DataGrid {...defaultProps} enableToolbar />)
      expect(screen.getByPlaceholderText('Search all columns...')).toBeInTheDocument()
    })

    it('does not render toolbar when enableToolbar is false', () => {
      render(<DataGrid {...defaultProps} enableToolbar={false} />)
      expect(screen.queryByPlaceholderText('Search all columns...')).not.toBeInTheDocument()
    })

    it('renders refresh button when onRefresh is provided', () => {
      const onRefresh = jest.fn()
      render(<DataGrid {...defaultProps} onRefresh={onRefresh} />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
      
      fireEvent.click(refreshButton)
      expect(onRefresh).toHaveBeenCalled()
    })

    it('renders export button when onExport is provided', () => {
      const onExport = jest.fn()
      render(<DataGrid {...defaultProps} onExport={onExport} />)
      
      const exportButton = screen.getByRole('button', { name: /export/i })
      expect(exportButton).toBeInTheDocument()
      
      fireEvent.click(exportButton)
      expect(onExport).toHaveBeenCalled()
    })

    it('shows loading state on refresh button', () => {
      render(<DataGrid {...defaultProps} onRefresh={jest.fn()} loading />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeDisabled()
      
      const spinner = refreshButton.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('renders custom toolbar actions', () => {
      const customAction = <button>Custom Action</button>
      render(<DataGrid {...defaultProps} toolbarActions={customAction} />)
      
      expect(screen.getByRole('button', { name: 'Custom Action' })).toBeInTheDocument()
    })
  })

  describe('Global Filter', () => {
    it('filters data based on global filter', async () => {
      const onGlobalFilterChange = jest.fn()
      render(<DataGrid {...defaultProps} onGlobalFilterChange={onGlobalFilterChange} />)
      
      const searchInput = screen.getByPlaceholderText('Search all columns...')
      fireEvent.change(searchInput, { target: { value: 'John' } })
      
      expect(onGlobalFilterChange).toHaveBeenCalledWith('John')
    })

    it('shows no results when global filter yields no matches', () => {
      render(<DataGrid {...defaultProps} globalFilter="nonexistent" />)
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('renders sort icons for sortable columns', () => {
      render(<DataGrid {...defaultProps} enableSorting />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader?.querySelector('svg')).toBeInTheDocument()
    })

    it('calls onSortingChange when sortable column header is clicked', () => {
      const onSortingChange = jest.fn()
      render(<DataGrid {...defaultProps} onSortingChange={onSortingChange} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      const sortButton = nameHeader?.querySelector('button')
      
      fireEvent.click(sortButton!)
      expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
    })

    it('cycles through sort states: asc -> desc -> none', () => {
      const onSortingChange = jest.fn()
      render(<DataGrid {...defaultProps} onSortingChange={onSortingChange} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      const sortButton = nameHeader?.querySelector('button')
      
      // First click: ascending
      fireEvent.click(sortButton!)
      expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
      
      // Reset mock for next assertion
      onSortingChange.mockClear()
      
      // Simulate being in ascending state and click again for descending
      render(<DataGrid {...defaultProps} sorting={[{ id: 'name', desc: false }]} onSortingChange={onSortingChange} />)
      const nameHeader2 = screen.getByText('Name').closest('th')
      const sortButton2 = nameHeader2?.querySelector('button')
      
      fireEvent.click(sortButton2!)
      expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: true }])
    })

    it('supports multi-sort when enableMultiSort is true', () => {
      const onSortingChange = jest.fn()
      render(<DataGrid {...defaultProps} enableMultiSort onSortingChange={onSortingChange} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      const ageHeader = screen.getByText('Age').closest('th')
      
      // Sort by name first
      fireEvent.click(nameHeader?.querySelector('button')!)
      expect(onSortingChange).toHaveBeenCalledWith([{ id: 'name', desc: false }])
      
      onSortingChange.mockClear()
      
      // Sort by age (should add to existing sort)
      render(<DataGrid {...defaultProps} enableMultiSort sorting={[{ id: 'name', desc: false }]} onSortingChange={onSortingChange} />)
      const ageHeader2 = screen.getByText('Age').closest('th')
      fireEvent.click(ageHeader2?.querySelector('button')!)
      
      expect(onSortingChange).toHaveBeenCalledWith([
        { id: 'name', desc: false },
        { id: 'age', desc: false }
      ])
    })

    it('shows correct sort icons based on sort state', () => {
      // Test ascending sort icon
      render(<DataGrid {...defaultProps} sorting={[{ id: 'name', desc: false }]} />)
      expect(document.querySelector('[data-lucide="arrow-up"]')).toBeInTheDocument()
      
      // Test descending sort icon
      render(<DataGrid {...defaultProps} sorting={[{ id: 'name', desc: true }]} />)
      expect(document.querySelector('[data-lucide="arrow-down"]')).toBeInTheDocument()
    })
  })

  describe('Row Selection', () => {
    it('renders checkboxes when enableRowSelection is true', () => {
      render(<DataGrid {...defaultProps} enableRowSelection />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('handles select all functionality', () => {
      const onRowSelectionChange = jest.fn()
      render(<DataGrid {...defaultProps} enableRowSelection onRowSelectionChange={onRowSelectionChange} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(selectAllCheckbox)
      
      expect(onRowSelectionChange).toHaveBeenCalled()
    })

    it('handles individual row selection', () => {
      const onRowSelectionChange = jest.fn()
      render(<DataGrid {...defaultProps} enableRowSelection onRowSelectionChange={onRowSelectionChange} />)
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1)
      fireEvent.click(rowCheckboxes[0])
      
      expect(onRowSelectionChange).toHaveBeenCalled()
    })

    it('shows selection count in toolbar', () => {
      const rowSelection = { '0': true, '1': true }
      render(<DataGrid {...defaultProps} enableRowSelection rowSelection={rowSelection} />)
      
      expect(screen.getByText('2 row(s) selected')).toBeInTheDocument()
    })

    it('prevents row click when clicking checkbox', () => {
      const onRowClick = jest.fn()
      render(<DataGrid {...defaultProps} enableRowSelection onRowClick={onRowClick} />)
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1)
      fireEvent.click(rowCheckboxes[0])
      
      expect(onRowClick).not.toHaveBeenCalled()
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls when enablePagination is true', () => {
      render(<DataGrid {...defaultProps} enablePagination />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    it('does not render pagination when enablePagination is false', () => {
      render(<DataGrid {...defaultProps} enablePagination={false} />)
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('calls onPaginationChange when page size is changed', () => {
      const onPaginationChange = jest.fn()
      render(<DataGrid {...defaultProps} onPaginationChange={onPaginationChange} />)
      
      const pageSizeSelect = screen.getByDisplayValue('10')
      fireEvent.change(pageSizeSelect, { target: { value: '20' } })
      
      expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 20 })
    })

    it('calls onPaginationChange when navigation buttons are clicked', () => {
      const onPaginationChange = jest.fn()
      render(<DataGrid {...defaultProps} onPaginationChange={onPaginationChange} />)
      
      fireEvent.click(screen.getByText('Next'))
      expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 })
    })

    it('disables Previous button on first page', () => {
      render(<DataGrid {...defaultProps} pagination={{ pageIndex: 0, pageSize: 10 }} />)
      expect(screen.getByText('Previous')).toBeDisabled()
    })

    it('disables Next button on last page', () => {
      render(<DataGrid {...defaultProps} pagination={{ pageIndex: 0, pageSize: 10 }} />)
      // With 5 items and page size 10, we should be on the last page
      expect(screen.getByText('Next')).toBeDisabled()
    })

    it('shows correct pagination info', () => {
      render(<DataGrid {...defaultProps} pagination={{ pageIndex: 0, pageSize: 3 }} />)
      expect(screen.getByText(/Showing 1 to 3 of 5 entries/)).toBeInTheDocument()
    })
  })

  describe('Row Interactions', () => {
    it('calls onRowClick when row is clicked', () => {
      const onRowClick = jest.fn()
      render(<DataGrid {...defaultProps} onRowClick={onRowClick} />)
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      fireEvent.click(firstRow!)
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it('calls onRowDoubleClick when row is double-clicked', () => {
      const onRowDoubleClick = jest.fn()
      render(<DataGrid {...defaultProps} onRowDoubleClick={onRowDoubleClick} />)
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      fireEvent.doubleClick(firstRow!)
      
      expect(onRowDoubleClick).toHaveBeenCalledWith(mockData[0])
    })

    it('applies cursor-pointer style when onRowClick is provided', () => {
      render(<DataGrid {...defaultProps} onRowClick={jest.fn()} />)
      
      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).toHaveClass('cursor-pointer')
    })
  })

  describe('Styling Options', () => {
    it('applies striped styling when striped is true', () => {
      render(<DataGrid {...defaultProps} striped />)
      
      const rows = screen.getAllByRole('row').slice(1) // Skip header row
      const secondRow = rows[1]
      expect(secondRow).toHaveClass('bg-muted/30')
    })

    it('applies hoverable styling when hoverable is true', () => {
      render(<DataGrid {...defaultProps} hoverable />)
      
      const firstDataRow = screen.getByText('John Doe').closest('tr')
      expect(firstDataRow).toHaveClass('hover:bg-muted/50')
    })

    it('applies compact styling when compact is true', () => {
      render(<DataGrid {...defaultProps} compact />)
      
      const headerRow = screen.getAllByRole('row')[0]
      expect(headerRow).toHaveClass('h-10')
    })

    it('applies bordered styling when bordered is true', () => {
      render(<DataGrid {...defaultProps} bordered />)
      
      const tableContainer = screen.getByRole('table').closest('div')
      expect(tableContainer).toHaveClass('border-border')
    })
  })

  describe('Custom Accessors', () => {
    it('uses accessorFn when provided', () => {
      const customColumns: DataGridColumn<TestData>[] = [
        {
          id: 'fullInfo',
          header: 'Full Info',
          accessorFn: (row) => `${row.name} (${row.email})`,
        },
      ]
      
      render(<DataGrid data={mockData} columns={customColumns} />)
      
      expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument()
    })

    it('uses custom cell renderer when provided', () => {
      const customColumns: DataGridColumn<TestData>[] = [
        {
          id: 'status',
          header: 'Status',
          accessorKey: 'status',
          cell: ({ getValue }) => (
            <div data-testid="custom-cell">Status: {getValue()}</div>
          ),
        },
      ]
      
      render(<DataGrid data={mockData} columns={customColumns} />)
      
      expect(screen.getByTestId('custom-cell')).toBeInTheDocument()
      expect(screen.getByText('Status: active')).toBeInTheDocument()
    })
  })

  describe('Column Alignment', () => {
    it('applies column alignment classes', () => {
      render(<DataGrid {...defaultProps} />)
      
      const ageHeader = screen.getByText('Age').closest('th')
      expect(ageHeader).toHaveClass('text-right')
      
      const ageCell = screen.getByText('30').closest('td')
      expect(ageCell).toHaveClass('text-right')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<DataGrid {...defaultProps} />)
    })

    it('provides proper table structure', () => {
      render(<DataGrid {...defaultProps} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(mockColumns.length + 1) // +1 for actions column
      expect(screen.getAllByRole('row')).toHaveLength(mockData.length + 1) // +1 for header
    })

    it('checkboxes have proper accessibility attributes', () => {
      render(<DataGrid {...defaultProps} enableRowSelection />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox')
      })
    })
  })

  describe('Custom Row ID', () => {
    it('uses custom getRowId function', () => {
      const getRowId = (row: TestData) => row.id
      const onRowSelectionChange = jest.fn()
      
      render(
        <DataGrid 
          {...defaultProps} 
          enableRowSelection 
          getRowId={getRowId}
          onRowSelectionChange={onRowSelectionChange}
        />
      )
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1)
      fireEvent.click(rowCheckboxes[0])
      
      expect(onRowSelectionChange).toHaveBeenCalledWith({ '1': true })
    })
  })

  describe('Controlled vs Uncontrolled State', () => {
    it('works as controlled component for sorting', () => {
      const ControlledDataGrid = () => {
        const [sorting, setSorting] = React.useState<SortingState[]>([])
        return (
          <DataGrid 
            {...defaultProps} 
            sorting={sorting}
            onSortingChange={setSorting}
          />
        )
      }
      
      render(<ControlledDataGrid />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      const sortButton = nameHeader?.querySelector('button')
      
      fireEvent.click(sortButton!)
      
      // Should show ascending sort icon
      expect(document.querySelector('[data-lucide="arrow-up"]')).toBeInTheDocument()
    })

    it('works as uncontrolled component', () => {
      render(<DataGrid {...defaultProps} />)
      
      const nameHeader = screen.getByText('Name').closest('th')
      const sortButton = nameHeader?.querySelector('button')
      
      fireEvent.click(sortButton!)
      
      // Should show ascending sort icon
      expect(document.querySelector('[data-lucide="arrow-up"]')).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<DataGrid {...defaultProps} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Custom Filtering', () => {
    it('supports custom filter functions', () => {
      const customColumns: DataGridColumn<TestData>[] = [
        {
          id: 'age',
          header: 'Age',
          accessorKey: 'age',
          filterable: true,
          filterFn: (row, columnId, filterValue) => {
            return row.age >= Number(filterValue)
          },
        },
      ]
      
      const filters: FilterState[] = [{ id: 'age', value: 30 }]
      
      render(<DataGrid data={mockData} columns={customColumns} filters={filters} />)
      
      // Should only show rows with age >= 30
      expect(screen.getByText('John Doe')).toBeInTheDocument() // age 30
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument() // age 35
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument() // age 25
    })
  })
})