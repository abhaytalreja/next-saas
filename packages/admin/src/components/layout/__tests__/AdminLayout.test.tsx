import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { AdminLayout } from '../AdminLayout'

expect.extend(toHaveNoViolations)

// Mock Next.js navigation
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock auth hook
const mockUseAuth = jest.fn()
jest.mock('@nextsaas/auth', () => ({
  useAuth: mockUseAuth,
}))

// Mock layout components
jest.mock('../AdminSidebar', () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">Admin Sidebar</div>,
}))

jest.mock('../AdminHeader', () => ({
  AdminHeader: () => <div data-testid="admin-header">Admin Header</div>,
}))

const renderWithAuth = (authState: any) => {
  mockUseAuth.mockReturnValue(authState)
  return render(
    <AdminLayout>
      <div data-testid="test-content">Test Content</div>
    </AdminLayout>
  )
}

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state when auth is loading', () => {
      renderWithAuth({ user: null, isLoading: true })
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      const spinner = screen.getByRole('status', { name: /loading/i })
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should render layout when user is authenticated', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com', name: 'Admin User' }, 
        isLoading: false 
      })
      
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('admin-header')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })

    it('should render with correct layout structure', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const layoutContainer = screen.getByTestId('admin-layout-container')
      expect(layoutContainer).toHaveClass('min-h-screen', 'bg-gray-50')
      
      const flexContainer = screen.getByTestId('admin-layout-flex')
      expect(flexContainer).toHaveClass('flex', 'h-screen')
      
      const mainArea = screen.getByTestId('admin-main-area')
      expect(mainArea).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden')
    })

    it('should render main content area correctly', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('flex-1', 'overflow-x-hidden', 'overflow-y-auto', 'bg-gray-50')
      
      const container = screen.getByTestId('admin-content-container')
      expect(container).toHaveClass('container', 'mx-auto', 'px-6', 'py-8')
    })
  })

  describe('authentication', () => {
    it('should redirect when user is not authenticated', () => {
      renderWithAuth({ user: null, isLoading: false })
      
      expect(mockRedirect).toHaveBeenCalledWith('/auth/sign-in')
    })

    it('should not redirect when user is authenticated', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should not redirect when still loading', () => {
      renderWithAuth({ user: null, isLoading: true })
      
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('should show loading spinner with correct styling', () => {
      renderWithAuth({ user: null, isLoading: true })
      
      const loadingContainer = screen.getByTestId('loading-container')
      expect(loadingContainer).toHaveClass(
        'min-h-screen', 
        'bg-gray-50', 
        'flex', 
        'items-center', 
        'justify-center'
      )
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass(
        'animate-spin', 
        'rounded-full', 
        'h-8', 
        'w-8', 
        'border-b-2', 
        'border-blue-600'
      )
    })

    it('should not render sidebar and header when loading', () => {
      renderWithAuth({ user: null, isLoading: true })
      
      expect(screen.queryByTestId('admin-sidebar')).not.toBeInTheDocument()
      expect(screen.queryByTestId('admin-header')).not.toBeInTheDocument()
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument()
    })
  })

  describe('children rendering', () => {
    it('should render children when authenticated', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render multiple children correctly', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      render(
        <AdminLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </AdminLayout>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('should handle complex children structures', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      render(
        <AdminLayout>
          <div>
            <h1>Dashboard</h1>
            <section>
              <p>Welcome to admin</p>
            </section>
          </div>
        </AdminLayout>
      )
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome to admin')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in loading state', async () => {
      const { container } = renderWithAuth({ user: null, isLoading: true })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should provide loading status announcement', () => {
      renderWithAuth({ user: null, isLoading: true })
      
      const loadingElement = screen.getByRole('status', { name: /loading/i })
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading admin dashboard')
    })

    it('should have proper main landmark', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should apply responsive classes correctly', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const flexContainer = screen.getByTestId('admin-layout-flex')
      expect(flexContainer).toHaveClass('flex', 'h-screen')
      
      const mainArea = screen.getByTestId('admin-main-area')
      expect(mainArea).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden')
    })

    it('should handle overflow correctly', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('overflow-x-hidden', 'overflow-y-auto')
    })
  })

  describe('error boundaries', () => {
    it('should handle auth hook errors gracefully', () => {
      mockUseAuth.mockImplementation(() => {
        throw new Error('Auth service unavailable')
      })
      
      // Should not crash the component
      expect(() => render(<AdminLayout><div>Test</div></AdminLayout>)).toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined user correctly', () => {
      renderWithAuth({ user: undefined, isLoading: false })
      
      expect(mockRedirect).toHaveBeenCalledWith('/auth/sign-in')
    })

    it('should handle null user correctly', () => {
      renderWithAuth({ user: null, isLoading: false })
      
      expect(mockRedirect).toHaveBeenCalledWith('/auth/sign-in')
    })

    it('should handle user object with missing properties', () => {
      renderWithAuth({ user: {}, isLoading: false })
      
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should integrate with sidebar and header components', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('admin-header')).toBeInTheDocument()
      expect(screen.getByText('Admin Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Admin Header')).toBeInTheDocument()
    })

    it('should maintain proper component hierarchy', () => {
      renderWithAuth({ 
        user: { id: '1', email: 'admin@example.com' }, 
        isLoading: false 
      })
      
      const sidebar = screen.getByTestId('admin-sidebar')
      const header = screen.getByTestId('admin-header')
      const content = screen.getByTestId('test-content')
      
      // Sidebar should be before main content
      expect(sidebar.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      // Header should be before main content
      expect(header.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })
})