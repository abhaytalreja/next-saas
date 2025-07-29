import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { UserTable } from '../../../components/users/UserTable'
import { adminService } from '../../../lib/admin-service'
import { AdminUser, PaginationParams } from '../../../types'

// Mock admin service
jest.mock('../../../lib/admin-service', () => ({
  adminService: {
    suspendUser: jest.fn(),
    activateUser: jest.fn(),
    deleteUser: jest.fn()
  }
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, variant, size, disabled, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  MoreHorizontal: () => <div data-testid="more-horizontal" />,
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  Mail: () => <div data-testid="mail-icon" />,
  Ban: ({ className }: any) => <div data-testid="ban-icon" className={className} />,
  CheckCircle: ({ className }: any) => <div data-testid="check-circle" className={className} />,
  Trash2: ({ className }: any) => <div data-testid="trash-icon" className={className} />,
  Eye: ({ className }: any) => <div data-testid="eye-icon" className={className} />,
  ChevronLeft: ({ className }: any) => <div data-testid="chevron-left" className={className} />,
  ChevronRight: ({ className }: any) => <div data-testid="chevron-right" className={className} />,
  ArrowUpDown: ({ className }: any) => <div data-testid="arrow-up-down" className={className} />,
  ArrowUp: ({ className }: any) => <div data-testid="arrow-up" className={className} />,
  ArrowDown: ({ className }: any) => <div data-testid="arrow-down" className={className} />
}))

expect.extend(toHaveNoViolations)

describe('UserTable', () => {
  const mockUsers: AdminUser[] = [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar1.jpg',
      status: 'active',
      is_system_admin: false,
      organizations: [
        { id: 'org1', name: 'Acme Corp', role: 'admin', joined_at: '2023-01-01' },
        { id: 'org2', name: 'Tech Inc', role: 'member', joined_at: '2023-02-01' }
      ],
      last_seen_at: '2023-12-01T10:00:00Z',
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-12-01T10:00:00Z',
      email_verified_at: '2023-01-01T10:00:00Z',
      login_count: 50,
      last_ip: '192.168.1.1'
    },
    {
      id: '2',
      email: 'jane@example.com',
      name: null,
      avatar_url: null,
      status: 'suspended',
      is_system_admin: true,
      organizations: [],
      last_seen_at: null,
      created_at: '2023-06-01T10:00:00Z',
      updated_at: '2023-12-01T10:00:00Z',
      email_verified_at: null,
      login_count: 0,
      last_ip: null
    }
  ]

  const mockPagination: PaginationParams = {
    page: 1,
    limit: 20,
    sort: 'created_at',
    order: 'desc'
  }

  const defaultProps = {
    users: mockUsers,
    loading: false,
    error: null,
    pagination: mockPagination,
    total: 100,
    selectedUsers: [],
    onPageChange: jest.fn(),
    onSortChange: jest.fn(),
    onRefresh: jest.fn(),
    onSelectionChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    console.error = jest.fn() // Suppress console.error in tests
  })

  describe('rendering', () => {
    it('should render user table with data', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('No name')).toBeInTheDocument()
    })

    it('should render table headers correctly', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Organizations')).toBeInTheDocument()
      expect(screen.getByText('Last Seen')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render user avatars', () => {
      render(<UserTable {...defaultProps} />)
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg')
    })

    it('should render default avatar for users without avatar_url', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it('should render admin badge for system admins', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should render loading skeleton', () => {
      const { container } = render(<UserTable {...defaultProps} loading={true} />)
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should render error message and retry button', () => {
      const error = new Error('Failed to load users')
      render(<UserTable {...defaultProps} error={error} />)
      
      expect(screen.getByText('Error loading users')).toBeInTheDocument()
      expect(screen.getByText('Failed to load users')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should call onRefresh when Try Again is clicked', async () => {
      const user = userEvent.setup()
      const onRefresh = jest.fn()
      const error = new Error('Failed to load users')
      render(<UserTable {...defaultProps} error={error} onRefresh={onRefresh} />)
      
      await user.click(screen.getByRole('button', { name: /try again/i }))
      
      expect(onRefresh).toHaveBeenCalled()
    })
  })

  describe('empty state', () => {
    it('should render empty state when no users', () => {
      render(<UserTable {...defaultProps} users={[]} />)
      
      expect(screen.getByText('No users found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or filter criteria.')).toBeInTheDocument()
    })

    it('should not render empty state when loading', () => {
      render(<UserTable {...defaultProps} users={[]} loading={true} />)
      
      expect(screen.queryByText('No users found')).not.toBeInTheDocument()
    })
  })

  describe('user selection', () => {
    it('should render select all checkbox', () => {
      render(<UserTable {...defaultProps} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      expect(selectAllCheckbox).toBeInTheDocument()
      expect(selectAllCheckbox).not.toBeChecked()
    })

    it('should check select all when all users are selected', () => {
      render(<UserTable {...defaultProps} selectedUsers={['1', '2']} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      expect(selectAllCheckbox).toBeChecked()
    })

    it('should call onSelectionChange when select all is clicked', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      render(<UserTable {...defaultProps} onSelectionChange={onSelectionChange} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)
      
      expect(onSelectionChange).toHaveBeenCalledWith(['1', '2'])
    })

    it('should deselect all when select all is clicked and all are selected', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      render(<UserTable {...defaultProps} selectedUsers={['1', '2']} onSelectionChange={onSelectionChange} />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)
      
      expect(onSelectionChange).toHaveBeenCalledWith([])
    })

    it('should call onSelectionChange when individual user is selected', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      render(<UserTable {...defaultProps} onSelectionChange={onSelectionChange} />)
      
      const userCheckbox = screen.getAllByRole('checkbox')[1] // First user checkbox
      await user.click(userCheckbox)
      
      expect(onSelectionChange).toHaveBeenCalledWith(['1'])
    })

    it('should handle user deselection', async () => {
      const user = userEvent.setup()
      const onSelectionChange = jest.fn()
      render(<UserTable {...defaultProps} selectedUsers={['1']} onSelectionChange={onSelectionChange} />)
      
      const userCheckbox = screen.getAllByRole('checkbox')[1]
      await user.click(userCheckbox)
      
      expect(onSelectionChange).toHaveBeenCalledWith([])
    })
  })

  describe('status badges', () => {
    it('should render correct status badges', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('suspended')).toBeInTheDocument()
    })

    it('should apply correct CSS classes to status badges', () => {
      render(<UserTable {...defaultProps} />)
      
      const activeStatus = screen.getByText('active')
      const suspendedStatus = screen.getByText('suspended')
      
      expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800')
      expect(suspendedStatus).toHaveClass('bg-red-100', 'text-red-800')
    })
  })

  describe('organizations display', () => {
    it('should display user organizations', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('(admin)')).toBeInTheDocument()
      expect(screen.getByText('Tech Inc')).toBeInTheDocument()
      expect(screen.getByText('(member)')).toBeInTheDocument()
    })

    it('should show "No organizations" for users without organizations', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('No organizations')).toBeInTheDocument()
    })

    it('should show "+X more" for users with many organizations', () => {
      const usersWithManyOrgs = [{
        ...mockUsers[0],
        organizations: [
          { id: 'org1', name: 'Org 1', role: 'admin', joined_at: '2023-01-01' },
          { id: 'org2', name: 'Org 2', role: 'member', joined_at: '2023-02-01' },
          { id: 'org3', name: 'Org 3', role: 'member', joined_at: '2023-03-01' }
        ]
      }]
      
      render(<UserTable {...defaultProps} users={usersWithManyOrgs} />)
      
      expect(screen.getByText('+1 more')).toBeInTheDocument()
    })
  })

  describe('date formatting', () => {
    it('should format last seen date', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('12/1/2023')).toBeInTheDocument()
    })

    it('should show "Never" for null last_seen_at', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('Never')).toBeInTheDocument()
    })

    it('should format created date', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByText('1/1/2023')).toBeInTheDocument()
      expect(screen.getByText('6/1/2023')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('should call onSortChange when sortable header is clicked', async () => {
      const user = userEvent.setup()
      const onSortChange = jest.fn()
      render(<UserTable {...defaultProps} onSortChange={onSortChange} />)
      
      const nameHeader = screen.getByText('User').closest('th')
      await user.click(nameHeader!)
      
      expect(onSortChange).toHaveBeenCalledWith('name', 'asc')
    })

    it('should toggle sort order when same column is clicked', async () => {
      const user = userEvent.setup()
      const onSortChange = jest.fn()
      const paginationWithSort = { ...mockPagination, sort: 'name', order: 'asc' as const }
      render(<UserTable {...defaultProps} pagination={paginationWithSort} onSortChange={onSortChange} />)
      
      const nameHeader = screen.getByText('User').closest('th')
      await user.click(nameHeader!)
      
      expect(onSortChange).toHaveBeenCalledWith('name', 'desc')
    })

    it('should show correct sort icons', () => {
      const { rerender } = render(<UserTable {...defaultProps} />)
      
      // Unsorted column
      expect(screen.getAllByTestId('arrow-up-down')).toHaveLength(3)
      
      // Ascending sort
      const paginationAsc = { ...mockPagination, sort: 'name', order: 'asc' as const }
      rerender(<UserTable {...defaultProps} pagination={paginationAsc} />)
      expect(screen.getByTestId('arrow-up')).toBeInTheDocument()
      
      // Descending sort
      const paginationDesc = { ...mockPagination, sort: 'name', order: 'desc' as const }
      rerender(<UserTable {...defaultProps} pagination={paginationDesc} />)
      expect(screen.getByTestId('arrow-down')).toBeInTheDocument()
    })
  })

  describe('user actions', () => {
    it('should render view button for all users', () => {
      render(<UserTable {...defaultProps} />)
      
      const viewButtons = screen.getAllByTestId('eye-icon')
      expect(viewButtons).toHaveLength(2)
    })

    it('should render suspend button for active users', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByTestId('ban-icon')).toBeInTheDocument()
    })

    it('should render activate button for non-active users', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByTestId('check-circle')).toBeInTheDocument()
    })

    it('should render delete button for all users', () => {
      render(<UserTable {...defaultProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      expect(deleteButtons).toHaveLength(2)
    })

    it('should call suspend user when suspend button is clicked', async () => {
      const user = userEvent.setup()
      ;(adminService.suspendUser as jest.Mock).mockResolvedValue({})
      
      render(<UserTable {...defaultProps} />)
      
      const suspendButton = screen.getByTestId('ban-icon').closest('button')
      await user.click(suspendButton!)
      
      expect(adminService.suspendUser).toHaveBeenCalledWith('1', undefined)
    })

    it('should call activate user when activate button is clicked', async () => {
      const user = userEvent.setup()
      ;(adminService.activateUser as jest.Mock).mockResolvedValue({})
      
      render(<UserTable {...defaultProps} />)
      
      const activateButton = screen.getByTestId('check-circle').closest('button')
      await user.click(activateButton!)
      
      expect(adminService.activateUser).toHaveBeenCalledWith('2')
    })

    it('should call delete user when delete button is clicked', async () => {
      const user = userEvent.setup()
      ;(adminService.deleteUser as jest.Mock).mockResolvedValue({})
      
      render(<UserTable {...defaultProps} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      await user.click(deleteButtons[0].closest('button')!)
      
      expect(adminService.deleteUser).toHaveBeenCalledWith('1')
    })

    it('should call onRefresh after successful user action', async () => {
      const user = userEvent.setup()
      const onRefresh = jest.fn()
      ;(adminService.suspendUser as jest.Mock).mockResolvedValue({})
      
      render(<UserTable {...defaultProps} onRefresh={onRefresh} />)
      
      const suspendButton = screen.getByTestId('ban-icon').closest('button')
      await user.click(suspendButton!)
      
      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled()
      })
    })

    it('should handle user action errors gracefully', async () => {
      const user = userEvent.setup()
      ;(adminService.suspendUser as jest.Mock).mockRejectedValue(new Error('Action failed'))
      
      render(<UserTable {...defaultProps} />)
      
      const suspendButton = screen.getByTestId('ban-icon').closest('button')
      await user.click(suspendButton!)
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalled()
      })
    })

    it('should disable buttons during action loading', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      const promise = new Promise<void>(resolve => { resolvePromise = resolve })
      ;(adminService.suspendUser as jest.Mock).mockReturnValue(promise)
      
      render(<UserTable {...defaultProps} />)
      
      const suspendButton = screen.getByTestId('ban-icon').closest('button')!
      await user.click(suspendButton)
      
      expect(suspendButton).toBeDisabled()
      
      resolvePromise!()
      await waitFor(() => {
        expect(suspendButton).not.toBeDisabled()
      })
    })
  })

  describe('pagination', () => {
    it('should render pagination when there are multiple pages', () => {
      render(<UserTable {...defaultProps} total={100} />)
      
      expect(screen.getByText('Showing 1 to 20 of 100 results')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should not render pagination when total fits in one page', () => {
      render(<UserTable {...defaultProps} total={10} />)
      
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument()
    })

    it('should disable previous button on first page', () => {
      render(<UserTable {...defaultProps} />)
      
      const previousButton = screen.getByRole('button', { name: /previous/i })
      expect(previousButton).toBeDisabled()
    })

    it('should disable next button on last page', () => {
      const lastPagePagination = { ...mockPagination, page: 5 }
      render(<UserTable {...defaultProps} pagination={lastPagePagination} total={100} />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })

    it('should call onPageChange when page button is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = jest.fn()
      render(<UserTable {...defaultProps} onPageChange={onPageChange} />)
      
      const page2Button = screen.getByRole('button', { name: '2' })
      await user.click(page2Button)
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when next is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = jest.fn()
      render(<UserTable {...defaultProps} onPageChange={onPageChange} />)
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange when previous is clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = jest.fn()
      const page2Pagination = { ...mockPagination, page: 2 }
      render(<UserTable {...defaultProps} pagination={page2Pagination} onPageChange={onPageChange} />)
      
      const previousButton = screen.getByRole('button', { name: /previous/i })
      await user.click(previousButton)
      
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('should show current page as active', () => {
      render(<UserTable {...defaultProps} />)
      
      const page1Button = screen.getByRole('button', { name: '1' })
      expect(page1Button).toHaveAttribute('data-variant', 'default')
    })

    it('should show correct pagination info for different pages', () => {
      const page2Pagination = { ...mockPagination, page: 2 }
      render(<UserTable {...defaultProps} pagination={page2Pagination} total={100} />)
      
      expect(screen.getByText('Showing 21 to 40 of 100 results')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<UserTable {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper table structure', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(7)
      expect(screen.getAllByRole('row')).toHaveLength(3) // Header + 2 data rows
    })

    it('should have proper checkbox labels', () => {
      render(<UserTable {...defaultProps} />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(3) // Select all + 2 user checkboxes
    })

    it('should have proper button labels', () => {
      render(<UserTable {...defaultProps} />)
      
      expect(screen.getAllByRole('button')).toHaveLength(10) // Actions + pagination buttons
    })
  })

  describe('edge cases', () => {
    it('should handle users with missing data gracefully', () => {
      const incompleteUser = {
        id: '3',
        email: 'incomplete@example.com',
        name: null,
        avatar_url: null,
        status: 'active' as const,
        is_system_admin: false,
        organizations: [],
        last_seen_at: null,
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
        email_verified_at: null,
        login_count: 0,
        last_ip: null
      }
      
      render(<UserTable {...defaultProps} users={[incompleteUser]} />)
      
      expect(screen.getByText('No name')).toBeInTheDocument()
      expect(screen.getByText('Never')).toBeInTheDocument()
      expect(screen.getByText('No organizations')).toBeInTheDocument()
    })

    it('should handle zero total gracefully', () => {
      render(<UserTable {...defaultProps} total={0} users={[]} />)
      
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument()
    })

    it('should handle very large page numbers', () => {
      const largePagination = { ...mockPagination, page: 1000 }
      render(<UserTable {...defaultProps} pagination={largePagination} total={20000} />)
      
      expect(screen.getByText('Showing 19981 to 20000 of 20000 results')).toBeInTheDocument()
    })
  })
})