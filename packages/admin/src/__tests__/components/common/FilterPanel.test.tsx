import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { FilterPanel, FilterConfig, FilterValues } from '../../../components/common/FilterPanel'
import { User, Calendar } from 'lucide-react'

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  Filter: ({ className }: any) => <div data-testid="filter-icon" className={className} />,
  X: ({ className }: any) => <div data-testid="x-icon" className={className} />,
  Calendar: ({ className }: any) => <div data-testid="calendar-icon" className={className} />,
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  ChevronDown: ({ className }: any) => <div data-testid="chevron-down" className={className} />,
  Search: ({ className }: any) => <div data-testid="search-icon" className={className} />,
  RefreshCw: ({ className }: any) => <div data-testid="refresh-icon" className={className} />
}))

expect.extend(toHaveNoViolations)

describe('FilterPanel', () => {
  const mockFilters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active', count: 100 },
        { label: 'Inactive', value: 'inactive', count: 50 },
        { label: 'Suspended', value: 'suspended', count: 10 }
      ]
    },
    {
      key: 'roles',
      label: 'Roles',
      type: 'multiselect',
      options: [
        { label: 'Admin', value: 'admin', count: 5 },
        { label: 'Member', value: 'member', count: 150 },
        { label: 'Guest', value: 'guest', count: 25 }
      ]
    },
    {
      key: 'created_date',
      label: 'Created Date',
      type: 'date'
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Search by name...',
      icon: User
    }
  ]

  const defaultProps = {
    filters: mockFilters,
    values: {},
    onChange: jest.fn(),
    onReset: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render filter button with no active filters', () => {
      render(<FilterPanel {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })

    it('should render search input when onSearchChange is provided', () => {
      const onSearchChange = jest.fn()
      render(
        <FilterPanel 
          {...defaultProps} 
          onSearchChange={onSearchChange}
          searchValue="test"
          searchPlaceholder="Search users..."
        />
      )
      
      const searchInput = screen.getByPlaceholderText('Search users...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('test')
    })

    it('should not render search input when onSearchChange is not provided', () => {
      render(<FilterPanel {...defaultProps} />)
      
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<FilterPanel {...defaultProps} className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('active filter count', () => {
    it('should show active filter count badge', () => {
      const values = { status: 'active', name: 'John' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('2')
    })

    it('should not show badge when showActiveCount is false', () => {
      const values = { status: 'active' }
      render(<FilterPanel {...defaultProps} values={values} showActiveCount={false} />)
      
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })

    it('should show reset button when there are active filters', () => {
      const values = { status: 'active' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    })

    it('should not show reset button when no active filters', () => {
      render(<FilterPanel {...defaultProps} />)
      
      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
    })

    it('should count array values correctly', () => {
      const values = { roles: ['admin', 'member'] }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('1') // One filter with array value
    })

    it('should ignore empty arrays and null values', () => {
      const values = { roles: [], status: null, name: '', created_date: undefined }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    })
  })

  describe('filter panel interactions', () => {
    it('should toggle filter panel when filter button is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      const filterButton = screen.getByRole('button', { name: /filters/i })
      
      // Panel should not be visible initially
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
      
      // Click to open
      await user.click(filterButton)
      expect(screen.getByText('Filters')).toBeInTheDocument()
      
      // Click to close
      await user.click(filterButton)
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })

    it('should close filter panel when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      // Open panel
      await user.click(screen.getByRole('button', { name: /filters/i }))
      expect(screen.getByText('Filters')).toBeInTheDocument()
      
      // Close with X button
      const closeButton = screen.getByTestId('x-icon').closest('button')
      await user.click(closeButton!)
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })

    it('should close panel when Apply Filters is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      // Open panel
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      // Click Apply Filters
      await user.click(screen.getByRole('button', { name: /apply filters/i }))
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('should call onSearchChange when search input changes', async () => {
      const user = userEvent.setup()
      const onSearchChange = jest.fn()
      render(<FilterPanel {...defaultProps} onSearchChange={onSearchChange} />)
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'test query')
      
      expect(onSearchChange).toHaveBeenCalledWith('test query')
    })

    it('should use custom search placeholder', () => {
      render(
        <FilterPanel 
          {...defaultProps} 
          onSearchChange={jest.fn()} 
          searchPlaceholder="Find users..."
        />
      )
      
      expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument()
    })
  })

  describe('select filter', () => {
    it('should render select filter with options', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const statusSelect = screen.getByDisplayValue('')
      expect(statusSelect).toBeInTheDocument()
      
      // Check options are present
      expect(screen.getByText('Active (100)')).toBeInTheDocument()
      expect(screen.getByText('Inactive (50)')).toBeInTheDocument()
      expect(screen.getByText('Suspended (10)')).toBeInTheDocument()
    })

    it('should call onChange when select value changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<FilterPanel {...defaultProps} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const statusSelect = screen.getByDisplayValue('')
      await user.selectOptions(statusSelect, 'active')
      
      expect(onChange).toHaveBeenCalledWith({ status: 'active' })
    })

    it('should show selected value', async () => {
      const user = userEvent.setup()
      const values = { status: 'active' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const statusSelect = screen.getByDisplayValue('active')
      expect(statusSelect).toBeInTheDocument()
    })
  })

  describe('multiselect filter', () => {
    it('should render multiselect with checkboxes', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getByText('Roles')).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /admin/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /member/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /guest/i })).toBeInTheDocument()
    })

    it('should handle checkbox selection', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<FilterPanel {...defaultProps} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i })
      await user.click(adminCheckbox)
      
      expect(onChange).toHaveBeenCalledWith({ roles: ['admin'] })
    })

    it('should handle multiple selections', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const values = { roles: ['admin'] }
      render(<FilterPanel {...defaultProps} values={values} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const memberCheckbox = screen.getByRole('checkbox', { name: /member/i })
      await user.click(memberCheckbox)
      
      expect(onChange).toHaveBeenCalledWith({ roles: ['admin', 'member'] })
    })

    it('should handle deselection', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const values = { roles: ['admin', 'member'] }
      render(<FilterPanel {...defaultProps} values={values} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const adminCheckbox = screen.getByRole('checkbox', { name: /admin/i })
      await user.click(adminCheckbox)
      
      expect(onChange).toHaveBeenCalledWith({ roles: ['member'] })
    })

    it('should show selected count', async () => {
      const user = userEvent.setup()
      const values = { roles: ['admin', 'member'] }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    it('should show option counts as badges', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const badges = screen.getAllByTestId('badge')
      expect(badges.some(badge => badge.textContent === '5')).toBe(true) // Admin count
      expect(badges.some(badge => badge.textContent === '150')).toBe(true) // Member count
    })
  })

  describe('date filter', () => {
    it('should render date input', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const dateInput = screen.getByDisplayValue('')
      expect(dateInput).toHaveAttribute('type', 'date')
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })

    it('should call onChange when date changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<FilterPanel {...defaultProps} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const dateInput = screen.getByDisplayValue('')
      await user.type(dateInput, '2023-12-25')
      
      expect(onChange).toHaveBeenCalledWith({ created_date: '2023-12-25' })
    })
  })

  describe('text filter', () => {
    it('should render text input with custom icon', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const textInput = screen.getByPlaceholderText('Search by name...')
      expect(textInput).toBeInTheDocument()
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it('should use search icon when no custom icon provided', async () => {
      const user = userEvent.setup()
      const filtersWithoutIcon = mockFilters.map(f => 
        f.key === 'name' ? { ...f, icon: undefined } : f
      )
      render(<FilterPanel {...defaultProps} filters={filtersWithoutIcon} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getAllByTestId('search-icon').length).toBeGreaterThan(0)
    })

    it('should call onChange when text input changes', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      render(<FilterPanel {...defaultProps} onChange={onChange} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      const textInput = screen.getByPlaceholderText('Search by name...')
      await user.type(textInput, 'John')
      
      expect(onChange).toHaveBeenCalledWith({ name: 'John' })
    })
  })

  describe('active filters display', () => {
    it('should display active select filters', () => {
      const values = { status: 'active' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
    })

    it('should display active multiselect filters', () => {
      const values = { roles: ['admin', 'member'] }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.getByText('Roles: 2 selected')).toBeInTheDocument()
    })

    it('should display active date filters', () => {
      const values = { created_date: '2023-12-25' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.getByText('Created Date: 12/25/2023')).toBeInTheDocument()
    })

    it('should display active text filters', () => {
      const values = { name: 'John Doe' }
      render(<FilterPanel {...defaultProps} values={values} />)
      
      expect(screen.getByText('Name: John Doe')).toBeInTheDocument()
    })

    it('should allow removing individual filters', async () => {
      const user = userEvent.setup()
      const onChange = jest.fn()
      const values = { status: 'active', name: 'John' }
      render(<FilterPanel {...defaultProps} values={values} onChange={onChange} />)
      
      const removeButtons = screen.getAllByTestId('x-icon')
      await user.click(removeButtons[0])
      
      expect(onChange).toHaveBeenCalledWith({ status: '', name: 'John' })
    })
  })

  describe('reset functionality', () => {
    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup()
      const onReset = jest.fn()
      const values = { status: 'active' }
      render(<FilterPanel {...defaultProps} values={values} onReset={onReset} />)
      
      await user.click(screen.getByRole('button', { name: /reset/i }))
      
      expect(onReset).toHaveBeenCalled()
    })

    it('should call onReset and close panel when Reset All is clicked', async () => {
      const user = userEvent.setup()
      const onReset = jest.fn()
      render(<FilterPanel {...defaultProps} onReset={onReset} />)
      
      // Open panel
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      // Click Reset All
      await user.click(screen.getByRole('button', { name: /reset all/i }))
      
      expect(onReset).toHaveBeenCalled()
      expect(screen.queryByText('Filters')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FilterPanel {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper labels for form elements', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Roles')).toBeInTheDocument()
      expect(screen.getByLabelText('Created Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      // Focus should move through interactive elements
      await user.tab()
      expect(screen.getByRole('button', { name: /filters/i })).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(screen.getByText('Filters')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty filters array', () => {
      render(<FilterPanel {...defaultProps} filters={[]} />)
      
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
    })

    it('should handle filters without options', async () => {
      const user = userEvent.setup()
      const filtersWithoutOptions = [
        { key: 'test', label: 'Test', type: 'select' as const }
      ]
      render(<FilterPanel {...defaultProps} filters={filtersWithoutOptions} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('should handle unknown filter types gracefully', async () => {
      const user = userEvent.setup()
      const invalidFilter = {
        key: 'invalid',
        label: 'Invalid',
        type: 'unknown' as any
      }
      render(<FilterPanel {...defaultProps} filters={[...mockFilters, invalidFilter]} />)
      
      await user.click(screen.getByRole('button', { name: /filters/i }))
      
      expect(screen.getByText('Invalid')).toBeInTheDocument()
    })
  })
})