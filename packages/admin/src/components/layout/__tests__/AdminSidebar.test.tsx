import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { AdminSidebar } from '../AdminSidebar'

expect.extend(toHaveNoViolations)

// Mock Next.js navigation
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ href, children, className, onClick, ...props }: any) {
    return (
      <a 
        href={href} 
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    )
  }
})

// Mock UI utilities
jest.mock('@nextsaas/ui', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: ({ className }: any) => <div data-testid="dashboard-icon" className={className} />,
  Users: ({ className }: any) => <div data-testid="users-icon" className={className} />,
  Building2: ({ className }: any) => <div data-testid="building-icon" className={className} />,
  BarChart3: ({ className }: any) => <div data-testid="chart-icon" className={className} />,
  Mail: ({ className }: any) => <div data-testid="mail-icon" className={className} />,
  CreditCard: ({ className }: any) => <div data-testid="credit-card-icon" className={className} />,
  Shield: ({ className }: any) => <div data-testid="shield-icon" className={className} />,
  Server: ({ className }: any) => <div data-testid="server-icon" className={className} />,
  Settings: ({ className }: any) => <div data-testid="settings-icon" className={className} />,
  ChevronRight: ({ className }: any) => <div data-testid="chevron-right-icon" className={className} />,
}))

const renderWithPathname = (pathname = '/admin') => {
  mockUsePathname.mockReturnValue(pathname)
  return render(<AdminSidebar />)
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render sidebar with correct structure', () => {
      renderWithPathname()
      
      const sidebar = screen.getByTestId('admin-sidebar')
      expect(sidebar).toHaveClass('flex', 'w-64', 'flex-col', 'bg-white', 'border-r', 'border-gray-200')
    })

    it('should render logo section', () => {
      renderWithPathname()
      
      const logoSection = screen.getByTestId('logo-section')
      expect(logoSection).toHaveClass('flex', 'h-16', 'flex-shrink-0', 'items-center', 'px-4', 'border-b', 'border-gray-200')
      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })

    it('should render navigation section', () => {
      renderWithPathname()
      
      const navigation = screen.getByRole('navigation', { name: /main navigation/i })
      expect(navigation).toHaveClass('flex-1', 'space-y-1', 'px-2', 'py-4')
    })

    it('should render footer section', () => {
      renderWithPathname()
      
      const footer = screen.getByTestId('sidebar-footer')
      expect(footer).toHaveClass('flex-shrink-0', 'border-t', 'border-gray-200', 'p-4')
      expect(screen.getByText('NextSaaS Admin v1.0')).toBeInTheDocument()
    })
  })

  describe('navigation items', () => {
    const navigationItems = [
      { name: 'Dashboard', href: '/admin', testId: 'dashboard-icon' },
      { name: 'Users', href: '/admin/users', testId: 'users-icon' },
      { name: 'Organizations', href: '/admin/organizations', testId: 'building-icon' },
      { name: 'Analytics', href: '/admin/analytics', testId: 'chart-icon' },
      { name: 'Email', href: '/admin/email', testId: 'mail-icon' },
      { name: 'Billing', href: '/admin/billing', testId: 'credit-card-icon' },
      { name: 'Security', href: '/admin/security', testId: 'shield-icon' },
      { name: 'System', href: '/admin/system', testId: 'server-icon' },
      { name: 'Settings', href: '/admin/settings', testId: 'settings-icon' },
    ]

    navigationItems.forEach(({ name, href, testId }) => {
      it(`should render ${name} navigation item`, () => {
        renderWithPathname()
        
        const link = screen.getByRole('link', { name: new RegExp(name, 'i') })
        expect(link).toHaveAttribute('href', href)
        expect(screen.getByTestId(testId)).toBeInTheDocument()
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })

    it('should highlight active navigation item', () => {
      renderWithPathname('/admin/users')
      
      const usersLink = screen.getByRole('link', { name: /users/i })
      expect(usersLink).toHaveClass('bg-blue-100', 'text-blue-900')
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('text-gray-600')
    })

    it('should apply hover styles to inactive items', () => {
      renderWithPathname('/admin')
      
      const usersLink = screen.getByRole('link', { name: /users/i })
      expect(usersLink).toHaveClass('hover:bg-gray-50', 'hover:text-gray-900')
    })
  })

  describe('expandable navigation', () => {
    const expandableItems = [
      {
        name: 'Analytics',
        children: ['Overview', 'User Growth', 'Revenue']
      },
      {
        name: 'Email', 
        children: ['Campaigns', 'Templates', 'Analytics']
      },
      {
        name: 'Billing',
        children: ['Subscriptions', 'Invoices']
      },
      {
        name: 'Security',
        children: ['Audit Logs', 'Sessions']
      },
      {
        name: 'System',
        children: ['Health', 'Performance']
      }
    ]

    expandableItems.forEach(({ name, children }) => {
      it(`should show chevron icon for ${name}`, () => {
        renderWithPathname()
        
        const parentLink = screen.getByRole('link', { name: new RegExp(name, 'i') })
        const chevron = parentLink.querySelector('[data-testid="chevron-right-icon"]')
        expect(chevron).toBeInTheDocument()
      })

      it(`should expand ${name} when clicked`, async () => {
        const user = userEvent.setup()
        renderWithPathname()
        
        // Children should not be visible initially
        children.forEach(child => {
          expect(screen.queryByRole('link', { name: new RegExp(child, 'i') })).not.toBeInTheDocument()
        })
        
        // Click to expand
        const parentLink = screen.getByRole('link', { name: new RegExp(name, 'i') })
        await user.click(parentLink)
        
        // Children should now be visible
        children.forEach(child => {
          expect(screen.getByRole('link', { name: new RegExp(child, 'i') })).toBeInTheDocument()
        })
      })

      it(`should collapse ${name} when clicked again`, async () => {
        const user = userEvent.setup()
        renderWithPathname()
        
        const parentLink = screen.getByRole('link', { name: new RegExp(name, 'i') })
        
        // Expand first
        await user.click(parentLink)
        children.forEach(child => {
          expect(screen.getByRole('link', { name: new RegExp(child, 'i') })).toBeInTheDocument()
        })
        
        // Collapse
        await user.click(parentLink)
        await waitFor(() => {
          children.forEach(child => {
            expect(screen.queryByRole('link', { name: new RegExp(child, 'i') })).not.toBeInTheDocument()
          })
        })
      })

      it(`should rotate chevron when ${name} is expanded`, async () => {
        const user = userEvent.setup()
        renderWithPathname()
        
        const parentLink = screen.getByRole('link', { name: new RegExp(name, 'i') })
        const chevron = parentLink.querySelector('[data-testid="chevron-right-icon"]')
        
        expect(chevron).not.toHaveClass('rotate-90')
        
        await user.click(parentLink)
        
        expect(chevron).toHaveClass('rotate-90')
      })
    })
  })

  describe('active state detection', () => {
    it('should mark parent as active when child is active', () => {
      renderWithPathname('/admin/analytics/users')
      
      const analyticsLink = screen.getByRole('link', { name: /^analytics$/i })
      expect(analyticsLink).toHaveClass('bg-blue-100', 'text-blue-900')
    })

    it('should mark direct route as active', () => {
      renderWithPathname('/admin/users')
      
      const usersLink = screen.getByRole('link', { name: /^users$/i })
      expect(usersLink).toHaveClass('bg-blue-100', 'text-blue-900')
    })

    it('should handle root dashboard route', () => {
      renderWithPathname('/admin')
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-blue-100', 'text-blue-900')
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithPathname()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper navigation landmark', () => {
      renderWithPathname()
      
      const navigation = screen.getByRole('navigation', { name: /main navigation/i })
      expect(navigation).toBeInTheDocument()
    })

    it('should have accessible links', () => {
      renderWithPathname()
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveAttribute('href', '/admin')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithPathname()
      
      const firstLink = screen.getByRole('link', { name: /dashboard/i })
      
      // Tab to first link
      await user.tab()
      expect(firstLink).toHaveFocus()
      
      // Tab to next link
      await user.tab()
      const secondLink = screen.getByRole('link', { name: /users/i })
      expect(secondLink).toHaveFocus()
    })

    it('should expand submenu with keyboard', async () => {
      const user = userEvent.setup()
      renderWithPathname()
      
      const analyticsLink = screen.getByRole('link', { name: /analytics/i })
      analyticsLink.focus()
      
      await user.keyboard('{Enter}')
      
      expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should have fixed width sidebar', () => {
      renderWithPathname()
      
      const sidebar = screen.getByTestId('admin-sidebar')
      expect(sidebar).toHaveClass('w-64')
    })

    it('should handle overflow in navigation', () => {
      renderWithPathname()
      
      const navContainer = screen.getByTestId('nav-container')
      expect(navContainer).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-y-auto')
    })
  })

  describe('icon styling', () => {
    it('should apply correct icon classes for active items', () => {
      renderWithPathname('/admin/users')
      
      const usersIcon = screen.getByTestId('users-icon')
      expect(usersIcon).toHaveClass('text-blue-600')
    })

    it('should apply correct icon classes for inactive items', () => {
      renderWithPathname('/admin/users')
      
      const dashboardIcon = screen.getByTestId('dashboard-icon')
      expect(dashboardIcon).toHaveClass('text-gray-400')
    })

    it('should apply hover styles to icons', () => {
      renderWithPathname('/admin/users')
      
      const dashboardIcon = screen.getByTestId('dashboard-icon')
      expect(dashboardIcon).toHaveClass('group-hover:text-gray-500')
    })
  })

  describe('error handling', () => {
    it('should handle invalid pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null)
      
      expect(() => renderWithPathname()).not.toThrow()
    })

    it('should handle undefined pathname', () => {
      mockUsePathname.mockReturnValue(undefined)
      
      expect(() => renderWithPathname()).not.toThrow()
    })
  })

  describe('state management', () => {
    it('should maintain expanded state independently for different items', async () => {
      const user = userEvent.setup()
      renderWithPathname()
      
      // Expand Analytics
      const analyticsLink = screen.getByRole('link', { name: /^analytics$/i })
      await user.click(analyticsLink)
      expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument()
      
      // Expand Email
      const emailLink = screen.getByRole('link', { name: /^email$/i })
      await user.click(emailLink)
      expect(screen.getByRole('link', { name: /campaigns/i })).toBeInTheDocument()
      
      // Analytics should still be expanded
      expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument()
    })

    it('should reset expanded state when component remounts', () => {
      const { rerender } = renderWithPathname()
      
      // Initially, no submenus should be expanded
      expect(screen.queryByRole('link', { name: /overview/i })).not.toBeInTheDocument()
      
      rerender(<AdminSidebar />)
      
      // After rerender, submenus should still be collapsed
      expect(screen.queryByRole('link', { name: /overview/i })).not.toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should integrate with Next.js routing', () => {
      renderWithPathname()
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveAttribute('href', '/admin')
    })

    it('should work with nested routes', () => {
      renderWithPathname('/admin/analytics/users')
      
      // Parent should be marked as active
      const analyticsLink = screen.getByRole('link', { name: /^analytics$/i })
      expect(analyticsLink).toHaveClass('bg-blue-100', 'text-blue-900')
    })
  })
})