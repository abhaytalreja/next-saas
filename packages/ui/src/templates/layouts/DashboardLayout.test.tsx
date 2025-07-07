import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { DashboardLayout, SidebarItem, BreadcrumbItem } from './DashboardLayout'
import { testAccessibility } from '../../test-utils'
import { Home, Settings, User, FileText, Mail, BarChart3 } from 'lucide-react'

// Mock data for testing
const mockBrand = {
  name: 'TestApp',
  logo: 'https://example.com/logo.png',
  href: '/dashboard',
}

const mockBrandWithComponent = {
  name: 'TestApp',
  logo: ({ className }: { className?: string }) => (
    <div className={className} data-testid="logo-component">Logo</div>
  ),
}

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
  initials: 'JD',
}

const mockSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true,
  },
  {
    id: 'users',
    label: 'Users',
    icon: User,
    href: '/users',
    badge: '5',
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    children: [
      {
        id: 'articles',
        label: 'Articles',
        href: '/articles',
      },
      {
        id: 'pages',
        label: 'Pages',
        href: '/pages',
        badge: '2',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    disabled: true,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    onClick: jest.fn(),
  },
]

const mockBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Users', href: '/users' },
  { label: 'Profile', onClick: jest.fn() },
]

const mockNotifications = {
  count: 5,
  onClick: jest.fn(),
}

const mockSearch = {
  placeholder: 'Search anything...',
  onSearch: jest.fn(),
}

// Mock keyboard events
const mockKeyboardEvent = (key: string) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  return event
}

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with minimal props', () => {
      render(
        <DashboardLayout sidebarItems={[]}>
          <div data-testid="main-content">Main Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DashboardLayout sidebarItems={[]} className="custom-dashboard">
          <div>Content</div>
        </DashboardLayout>
      )
      
      const container = screen.getByText('Content').closest('div')?.parentElement?.parentElement?.parentElement
      expect(container).toHaveClass('custom-dashboard')
    })

    it('renders children content', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div data-testid="dashboard-content">
            <h1>Dashboard Page</h1>
            <p>Welcome to the dashboard</p>
          </div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
      expect(screen.getByText('Welcome to the dashboard')).toBeInTheDocument()
    })
  })

  describe('Brand and Header', () => {
    it('renders brand with string logo in sidebar', () => {
      render(
        <DashboardLayout sidebarItems={[]} brand={mockBrand}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const logo = screen.getByAltText('TestApp')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
      expect(screen.getByText('TestApp')).toBeInTheDocument()
    })

    it('renders brand with component logo', () => {
      render(
        <DashboardLayout sidebarItems={[]} brand={mockBrandWithComponent}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('logo-component')).toBeInTheDocument()
      expect(screen.getByText('TestApp')).toBeInTheDocument()
    })

    it('renders brand without logo', () => {
      const brandWithoutLogo = { name: 'TestApp' }
      render(
        <DashboardLayout sidebarItems={[]} brand={brandWithoutLogo}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('TestApp')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders page title and subtitle', () => {
      render(
        <DashboardLayout 
          sidebarItems={[]} 
          pageTitle="User Management"
          pageSubtitle="Manage your team members"
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('User Management')).toBeInTheDocument()
      expect(screen.getByText('Manage your team members')).toBeInTheDocument()
    })

    it('renders without page title and subtitle', () => {
      render(
        <DashboardLayout sidebarItems={[]}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('User Profile', () => {
    it('renders user with avatar', () => {
      render(
        <DashboardLayout sidebarItems={[]} user={mockUser}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders user with initials when no avatar', () => {
      const userWithoutAvatar = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        initials: 'JS',
      }
      
      render(
        <DashboardLayout sidebarItems={[]} user={userWithoutAvatar}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('JS')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('generates initials from name when not provided', () => {
      const userWithoutInitials = {
        name: 'Bob Wilson',
        email: 'bob@example.com',
      }
      
      render(
        <DashboardLayout sidebarItems={[]} user={userWithoutInitials}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('B')).toBeInTheDocument() // First letter of name
    })
  })

  describe('Sidebar Items', () => {
    it('renders sidebar items with icons and labels', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      
      expect(document.querySelector('[data-lucide="home"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="user"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="settings"]')).toBeInTheDocument()
    })

    it('renders item badges', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('5')).toBeInTheDocument() // Users badge
    })

    it('applies active styling to active items', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const dashboardItem = screen.getByText('Dashboard').closest('button')
      expect(dashboardItem).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies disabled styling to disabled items', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const settingsItem = screen.getByText('Settings').closest('button')
      expect(settingsItem).toHaveClass('opacity-50', 'cursor-not-allowed')
      expect(settingsItem).toBeDisabled()
    })

    it('calls onClick when clickable item is clicked', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      fireEvent.click(screen.getByText('Reports'))
      expect(mockSidebarItems[4].onClick).toHaveBeenCalled()
    })
  })

  describe('Nested Sidebar Items', () => {
    it('expands and collapses nested items', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Initially collapsed
      expect(screen.queryByText('Articles')).not.toBeInTheDocument()
      
      // Click to expand
      fireEvent.click(screen.getByText('Content'))
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(screen.getByText('Pages')).toBeInTheDocument()
      
      // Click to collapse
      fireEvent.click(screen.getByText('Content'))
      expect(screen.queryByText('Articles')).not.toBeInTheDocument()
    })

    it('shows chevron icon for expandable items', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(document.querySelector('[data-lucide="chevron-left"]')).toBeInTheDocument()
    })

    it('rotates chevron when expanded', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const chevron = document.querySelector('[data-lucide="chevron-left"]')
      expect(chevron).not.toHaveClass('rotate-90')
      
      fireEvent.click(screen.getByText('Content'))
      expect(chevron).toHaveClass('rotate-90')
    })

    it('renders nested item badges', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      fireEvent.click(screen.getByText('Content'))
      expect(screen.getByText('2')).toBeInTheDocument() // Pages badge
    })

    it('applies indentation to nested items', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      fireEvent.click(screen.getByText('Content'))
      
      const articlesItem = screen.getByText('Articles').closest('button')
      expect(articlesItem).toHaveClass('ml-6', 'pl-2')
    })
  })

  describe('Sidebar Collapse', () => {
    it('collapses sidebar when collapse handler is provided', () => {
      const onSidebarCollapse = jest.fn()
      render(
        <DashboardLayout 
          sidebarItems={mockSidebarItems}
          sidebarCollapsed={false}
          onSidebarCollapse={onSidebarCollapse}
          brand={mockBrand}
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Find and click collapse button
      const collapseButton = document.querySelector('.p-2.hover\\:bg-accent.rounded-md')
      expect(collapseButton).toBeInTheDocument()
      
      fireEvent.click(collapseButton!)
      expect(onSidebarCollapse).toHaveBeenCalledWith(true)
    })

    it('hides labels and badges when collapsed', () => {
      render(
        <DashboardLayout 
          sidebarItems={mockSidebarItems}
          sidebarCollapsed={true}
          brand={mockBrand}
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Brand name should be hidden
      expect(screen.queryByText('TestApp')).not.toBeInTheDocument()
      
      // Item labels should be hidden (but icons visible)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(document.querySelector('[data-lucide="home"]')).toBeInTheDocument()
    })

    it('adjusts main content margin when collapsed', () => {
      render(
        <DashboardLayout 
          sidebarItems={mockSidebarItems}
          sidebarCollapsed={true}
        >
          <div data-testid="main-content">Content</div>
        </DashboardLayout>
      )
      
      const mainContainer = screen.getByTestId('main-content').closest('div')?.parentElement
      expect(mainContainer).toHaveClass('lg:ml-16')
    })

    it('centers icons when collapsed', () => {
      render(
        <DashboardLayout 
          sidebarItems={mockSidebarItems}
          sidebarCollapsed={true}
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      const dashboardButton = document.querySelector('button[class*="justify-center"]')
      expect(dashboardButton).toBeInTheDocument()
    })
  })

  describe('Mobile Sidebar', () => {
    it('opens mobile sidebar when menu button is clicked', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const menuButton = screen.getByRole('button', { name: '' }) // Menu icon button
      fireEvent.click(menuButton)
      
      // Check for backdrop
      expect(document.querySelector('.fixed.inset-0.bg-black\\/50')).toBeInTheDocument()
    })

    it('closes mobile sidebar when backdrop is clicked', () => {
      const { container } = render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Open sidebar first
      const menuButton = screen.getByRole('button', { name: '' })
      fireEvent.click(menuButton)
      
      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      fireEvent.click(backdrop!)
      
      // Backdrop should be removed
      expect(document.querySelector('.fixed.inset-0.bg-black\\/50')).not.toBeInTheDocument()
    })

    it('closes mobile sidebar when X button is clicked', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Open sidebar first
      const menuButton = screen.getByRole('button', { name: '' })
      fireEvent.click(menuButton)
      
      // Click X button
      const closeButton = document.querySelector('[data-lucide="x"]')?.closest('button')
      fireEvent.click(closeButton!)
      
      // Backdrop should be removed
      expect(document.querySelector('.fixed.inset-0.bg-black\\/50')).not.toBeInTheDocument()
    })

    it('closes mobile sidebar on Escape key', async () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Open sidebar first
      const menuButton = screen.getByRole('button', { name: '' })
      fireEvent.click(menuButton)
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(document.querySelector('.fixed.inset-0.bg-black\\/50')).not.toBeInTheDocument()
      })
    })

    it('closes mobile sidebar when sidebar item is clicked', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Open sidebar first
      const menuButton = screen.getByRole('button', { name: '' })
      fireEvent.click(menuButton)
      
      // Click sidebar item
      fireEvent.click(screen.getByText('Reports'))
      
      // Sidebar should close
      expect(document.querySelector('.fixed.inset-0.bg-black\\/50')).not.toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input with placeholder', () => {
      render(
        <DashboardLayout sidebarItems={[]} search={mockSearch}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const searchInput = screen.getByPlaceholderText('Search anything...')
      expect(searchInput).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="search"]')).toBeInTheDocument()
    })

    it('calls onSearch when search input changes', () => {
      render(
        <DashboardLayout sidebarItems={[]} search={mockSearch}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const searchInput = screen.getByPlaceholderText('Search anything...')
      fireEvent.change(searchInput, { target: { value: 'test query' } })
      
      expect(mockSearch.onSearch).toHaveBeenCalledWith('test query')
    })

    it('uses default placeholder when not provided', () => {
      const searchWithoutPlaceholder = { onSearch: jest.fn() }
      render(
        <DashboardLayout sidebarItems={[]} search={searchWithoutPlaceholder}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('hides search on small screens', () => {
      render(
        <DashboardLayout sidebarItems={[]} search={mockSearch}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const searchContainer = screen.getByPlaceholderText('Search anything...').closest('div')
      expect(searchContainer).toHaveClass('hidden', 'sm:block')
    })
  })

  describe('Notifications', () => {
    it('renders notification button with count', () => {
      render(
        <DashboardLayout sidebarItems={[]} notifications={mockNotifications}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(document.querySelector('[data-lucide="bell"]')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('handles count over 99', () => {
      const notificationsOver99 = { count: 150, onClick: jest.fn() }
      render(
        <DashboardLayout sidebarItems={[]} notifications={notificationsOver99}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('does not show count when zero', () => {
      const notificationsZero = { count: 0, onClick: jest.fn() }
      render(
        <DashboardLayout sidebarItems={[]} notifications={notificationsZero}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(document.querySelector('[data-lucide="bell"]')).toBeInTheDocument()
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('calls onClick when notification button is clicked', () => {
      render(
        <DashboardLayout sidebarItems={[]} notifications={mockNotifications}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const notificationButton = document.querySelector('[data-lucide="bell"]')?.closest('button')
      fireEvent.click(notificationButton!)
      
      expect(mockNotifications.onClick).toHaveBeenCalled()
    })
  })

  describe('Breadcrumbs', () => {
    it('renders breadcrumbs with home icon', () => {
      render(
        <DashboardLayout sidebarItems={[]} breadcrumbs={mockBreadcrumbs}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(document.querySelector('[data-lucide="home"]')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('renders clickable breadcrumb items', () => {
      render(
        <DashboardLayout sidebarItems={[]} breadcrumbs={mockBreadcrumbs}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      fireEvent.click(screen.getByText('Profile'))
      expect(mockBreadcrumbs[2].onClick).toHaveBeenCalled()
    })

    it('highlights last breadcrumb item', () => {
      render(
        <DashboardLayout sidebarItems={[]} breadcrumbs={mockBreadcrumbs}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const lastItem = screen.getByText('Profile')
      expect(lastItem).toHaveClass('text-foreground', 'font-medium')
    })

    it('renders separators between breadcrumbs', () => {
      render(
        <DashboardLayout sidebarItems={[]} breadcrumbs={mockBreadcrumbs}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const separators = screen.getAllByText('/')
      expect(separators.length).toBe(mockBreadcrumbs.length)
    })

    it('does not render breadcrumbs when not provided', () => {
      render(
        <DashboardLayout sidebarItems={[]}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.queryByRole('navigation')).toBeNull()
    })
  })

  describe('Header Actions', () => {
    it('renders custom header actions', () => {
      const headerActions = (
        <div>
          <button data-testid="custom-action">Custom Action</button>
        </div>
      )
      
      render(
        <DashboardLayout sidebarItems={[]} headerActions={headerActions}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('custom-action')).toBeInTheDocument()
    })
  })

  describe('Sidebar Footer', () => {
    it('renders sidebar footer when provided', () => {
      const sidebarFooter = <div data-testid="sidebar-footer">Footer Content</div>
      
      render(
        <DashboardLayout 
          sidebarItems={[]} 
          sidebarFooter={sidebarFooter}
          sidebarCollapsed={false}
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument()
    })

    it('hides sidebar footer when collapsed', () => {
      const sidebarFooter = <div data-testid="sidebar-footer">Footer Content</div>
      
      render(
        <DashboardLayout 
          sidebarItems={[]} 
          sidebarFooter={sidebarFooter}
          sidebarCollapsed={true}
        >
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.queryByTestId('sidebar-footer')).not.toBeInTheDocument()
    })
  })

  describe('Layout Variants', () => {
    it('applies default layout', () => {
      render(
        <DashboardLayout sidebarItems={[]} variant="default">
          <div data-testid="content">Content</div>
        </DashboardLayout>
      )
      
      const main = screen.getByTestId('content').closest('main')
      expect(main).toHaveClass('p-4', 'sm:p-6')
    })

    it('applies boxed layout with max width', () => {
      render(
        <DashboardLayout sidebarItems={[]} variant="boxed" pageTitle="Title">
          <div data-testid="content">Content</div>
        </DashboardLayout>
      )
      
      const headerContainer = screen.getByText('Title').closest('div')
      expect(headerContainer).toHaveClass('max-w-7xl', 'mx-auto')
      
      const main = screen.getByTestId('content').closest('main')
      expect(main).toHaveClass('max-w-7xl', 'mx-auto')
    })

    it('applies fluid layout without padding', () => {
      render(
        <DashboardLayout sidebarItems={[]} variant="fluid">
          <div data-testid="content">Content</div>
        </DashboardLayout>
      )
      
      const main = screen.getByTestId('content').closest('main')
      expect(main).toHaveClass('p-0')
    })
  })

  describe('Sidebar Variants', () => {
    it('applies floating sidebar variant', () => {
      render(
        <DashboardLayout sidebarItems={[]} sidebarVariant="floating">
          <div>Content</div>
        </DashboardLayout>
      )
      
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('m-2', 'h-[calc(100vh-1rem)]', 'rounded-lg', 'shadow-lg')
    })

    it('applies minimal sidebar variant', () => {
      render(
        <DashboardLayout sidebarItems={[]} sidebarVariant="minimal">
          <div>Content</div>
        </DashboardLayout>
      )
      
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('border-0', 'bg-transparent')
    })
  })

  describe('Header Sticky', () => {
    it('applies sticky header by default', () => {
      render(
        <DashboardLayout sidebarItems={[]}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const header = document.querySelector('header')
      expect(header).toHaveClass('sticky', 'top-0', 'z-30')
    })

    it('removes sticky when headerSticky is false', () => {
      render(
        <DashboardLayout sidebarItems={[]} headerSticky={false}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const header = document.querySelector('header')
      expect(header).not.toHaveClass('sticky')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <DashboardLayout 
          sidebarItems={mockSidebarItems.slice(0, 2)}
          brand={mockBrand}
          user={mockUser}
          pageTitle="Dashboard"
          breadcrumbs={mockBreadcrumbs.slice(0, 2)}
        >
          <main>
            <h1>Main Content</h1>
            <p>Dashboard content here</p>
          </main>
        </DashboardLayout>
      )
    })

    it('provides proper heading hierarchy', () => {
      render(
        <DashboardLayout sidebarItems={[]} pageTitle="Dashboard">
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
    })

    it('provides alt text for avatars and logos', () => {
      render(
        <DashboardLayout sidebarItems={[]} brand={mockBrand} user={mockUser}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByAltText('TestApp')).toBeInTheDocument()
      expect(screen.getByAltText('John Doe')).toBeInTheDocument()
    })

    it('handles keyboard navigation', () => {
      render(
        <DashboardLayout sidebarItems={mockSidebarItems}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      const firstButton = screen.getByText('Dashboard').closest('button')
      firstButton?.focus()
      expect(firstButton).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty sidebar items', () => {
      render(
        <DashboardLayout sidebarItems={[]}>
          <div data-testid="content">Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('handles items without icons', () => {
      const itemsWithoutIcons: SidebarItem[] = [
        { id: 'no-icon', label: 'No Icon Item' }
      ]
      
      render(
        <DashboardLayout sidebarItems={itemsWithoutIcons}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      expect(screen.getByText('No Icon Item')).toBeInTheDocument()
    })

    it('handles deeply nested sidebar items', () => {
      const deeplyNested: SidebarItem[] = [
        {
          id: 'level1',
          label: 'Level 1',
          children: [
            {
              id: 'level2',
              label: 'Level 2',
              children: [
                { id: 'level3', label: 'Level 3' }
              ]
            }
          ]
        }
      ]
      
      render(
        <DashboardLayout sidebarItems={deeplyNested}>
          <div>Content</div>
        </DashboardLayout>
      )
      
      // Expand level 1
      fireEvent.click(screen.getByText('Level 1'))
      expect(screen.getByText('Level 2')).toBeInTheDocument()
      
      // Expand level 2
      fireEvent.click(screen.getByText('Level 2'))
      expect(screen.getByText('Level 3')).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <DashboardLayout ref={ref} sidebarItems={[]}>
          <div>Content</div>
        </DashboardLayout>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})