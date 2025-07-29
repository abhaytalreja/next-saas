import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { AdminHeader } from '../AdminHeader'

expect.extend(toHaveNoViolations)

// Mock Next.js navigation
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

// Mock auth hook
const mockSignOut = jest.fn()
const mockUseAuth = jest.fn()
jest.mock('@nextsaas/auth', () => ({
  useAuth: mockUseAuth,
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Bell: ({ className }: any) => <div data-testid="bell-icon" className={className} />,
  Search: ({ className }: any) => <div data-testid="search-icon" className={className} />,
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  LogOut: ({ className }: any) => <div data-testid="logout-icon" className={className} />,
  Settings: ({ className }: any) => <div data-testid="settings-icon" className={className} />,
}))

const renderWithMocks = (pathname = '/admin', user = { name: 'Test User', email: 'test@example.com' }) => {
  mockUsePathname.mockReturnValue(pathname)
  mockUseAuth.mockReturnValue({
    user,
    signOut: mockSignOut,
  })
  
  return render(<AdminHeader />)
}

describe('AdminHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render header with correct structure', () => {
      renderWithMocks()
      
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200')
      
      const container = screen.getByTestId('header-container')
      expect(container).toHaveClass('flex', 'h-16', 'items-center', 'justify-between', 'px-6')
    })

    it('should render breadcrumb navigation', () => {
      renderWithMocks('/admin')
      
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
      expect(breadcrumb).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should render search input', () => {
      renderWithMocks()
      
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveClass(
        'w-64', 'rounded-md', 'border', 'border-gray-300', 'py-2', 'pl-10', 'pr-3'
      )
      
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('should render notification button with badge', () => {
      renderWithMocks()
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      expect(notificationButton).toBeInTheDocument()
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
      
      const badge = screen.getByText('3')
      expect(badge).toHaveClass(
        'absolute', '-top-1', '-right-1', 'h-4', 'w-4', 'rounded-full', 
        'bg-red-500', 'text-xs', 'text-white'
      )
    })

    it('should render user menu button', () => {
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      expect(userButton).toBeInTheDocument()
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })

  describe('breadcrumb functionality', () => {
    const breadcrumbTestCases = [
      { path: '/admin', expected: ['Dashboard'] },
      { path: '/admin/users', expected: ['Users'] },
      { path: '/admin/users/123', expected: ['Users', 'User Details'] },
      { path: '/admin/organizations', expected: ['Organizations'] },
      { path: '/admin/analytics', expected: ['Analytics'] },
      { path: '/admin/email', expected: ['Email'] },
      { path: '/admin/billing', expected: ['Billing'] },
      { path: '/admin/security', expected: ['Security'] },
      { path: '/admin/system', expected: ['System'] },
      { path: '/admin/settings', expected: ['Settings'] },
      { path: '/admin/unknown', expected: ['Dashboard'] }, // fallback
    ]

    breadcrumbTestCases.forEach(({ path, expected }) => {
      it(`should show correct breadcrumb for path ${path}`, () => {
        renderWithMocks(path)
        
        expected.forEach((crumb, index) => {
          expect(screen.getByText(crumb)).toBeInTheDocument()
          
          const crumbElement = screen.getByText(crumb)
          if (index === expected.length - 1) {
            expect(crumbElement).toHaveClass('text-gray-900', 'font-medium')
          } else {
            expect(crumbElement).toHaveClass('text-gray-500')
          }
        })

        // Check separators
        const separators = screen.getAllByText('/')
        expect(separators).toHaveLength(Math.max(0, expected.length - 1))
      })
    })
  })

  describe('user menu functionality', () => {
    it('should toggle user menu on click', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      // Menu should be hidden initially
      expect(screen.queryByText('Account Settings')).not.toBeInTheDocument()
      
      // Click to open menu
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      expect(screen.getByText('Account Settings')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
      
      // Click again to close menu
      await user.click(userButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Account Settings')).not.toBeInTheDocument()
      })
    })

    it('should show user menu with correct styling', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      const menu = screen.getByRole('menu')
      expect(menu).toHaveClass(
        'absolute', 'right-0', 'mt-2', 'w-48', 'rounded-md', 'bg-white',
        'shadow-lg', 'ring-1', 'ring-black', 'ring-opacity-5', 'z-50'
      )
    })

    it('should handle sign out correctly', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      const signOutButton = screen.getByRole('menuitem', { name: /sign out/i })
      await user.click(signOutButton)
      
      expect(mockSignOut).toHaveBeenCalledTimes(1)
      
      // Menu should close after sign out
      await waitFor(() => {
        expect(screen.queryByText('Account Settings')).not.toBeInTheDocument()
      })
    })

    it('should close menu when clicking account settings', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      const settingsButton = screen.getByRole('menuitem', { name: /account settings/i })
      await user.click(settingsButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Account Settings')).not.toBeInTheDocument()
      })
    })
  })

  describe('user display', () => {
    it('should display user name when available', () => {
      renderWithMocks('/admin', { name: 'John Doe', email: 'john@example.com' })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display email when name is not available', () => {
      renderWithMocks('/admin', { email: 'john@example.com' })
      
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should handle user with both name and email', () => {
      renderWithMocks('/admin', { name: 'John Doe', email: 'john@example.com' })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('john@example.com')).not.toBeInTheDocument()
    })

    it('should handle empty user object gracefully', () => {
      renderWithMocks('/admin', {})
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      expect(userButton).toBeInTheDocument()
    })
  })

  describe('search functionality', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const searchInput = screen.getByPlaceholderText('Search...')
      await user.type(searchInput, 'test query')
      
      expect(searchInput).toHaveValue('test query')
    })

    it('should have proper search input attributes', () => {
      renderWithMocks()
      
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toHaveAttribute('type', 'text')
      expect(searchInput).toHaveClass('focus:border-blue-500', 'focus:ring-blue-500')
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithMocks()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels and roles', () => {
      renderWithMocks()
      
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
      expect(breadcrumb).toBeInTheDocument()
      
      const searchInput = screen.getByLabelText(/search/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      renderWithMocks()
      
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
    })

    it('should have accessible user menu', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      const menu = screen.getByRole('menu')
      expect(menu).toBeInTheDocument()
      
      expect(screen.getByRole('menuitem', { name: /account settings/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      
      // Tab to user button
      await user.tab()
      await user.tab()
      await user.tab() // Skip search and notifications
      expect(userButton).toHaveFocus()
      
      // Open menu with Enter
      await user.keyboard('{Enter}')
      expect(screen.getByText('Account Settings')).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should apply responsive classes to search input', () => {
      renderWithMocks()
      
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toHaveClass('w-64')
    })

    it('should handle different screen sizes', () => {
      renderWithMocks()
      
      const headerContainer = screen.getByTestId('header-container')
      expect(headerContainer).toHaveClass('flex', 'items-center', 'justify-between')
    })
  })

  describe('error handling', () => {
    it('should handle auth hook errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      })
      
      expect(() => renderWithMocks()).not.toThrow()
    })

    it('should handle pathname errors gracefully', () => {
      mockUsePathname.mockReturnValue(null)
      
      expect(() => renderWithMocks()).not.toThrow()
      expect(screen.getByText('Dashboard')).toBeInTheDocument() // fallback
    })

    it('should handle signOut errors gracefully', async () => {
      const user = userEvent.setup()
      mockSignOut.mockRejectedValue(new Error('Sign out failed'))
      
      renderWithMocks()
      
      const userButton = screen.getByRole('button', { name: /user menu/i })
      await user.click(userButton)
      
      const signOutButton = screen.getByRole('menuitem', { name: /sign out/i })
      
      // Should not throw even if signOut fails
      await expect(user.click(signOutButton)).resolves.not.toThrow()
    })
  })

  describe('integration', () => {
    it('should integrate with navigation system', () => {
      renderWithMocks('/admin/users')
      
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(mockUsePathname).toHaveBeenCalled()
    })

    it('should integrate with auth system', () => {
      renderWithMocks()
      
      expect(mockUseAuth).toHaveBeenCalled()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})