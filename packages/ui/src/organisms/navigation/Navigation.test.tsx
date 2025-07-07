import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { Navigation, NavigationItem } from './Navigation'
import { testAccessibility } from '../../test-utils'
import { Home, Settings, User, FileText } from 'lucide-react'

// Mock navigation items for testing
const mockNavigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    active: true,
  },
  {
    label: 'Users',
    href: '/users',
    icon: User,
    badge: '5',
  },
  {
    label: 'Content',
    icon: FileText,
    children: [
      {
        label: 'Articles',
        href: '/articles',
      },
      {
        label: 'Pages',
        href: '/pages',
        badge: '2',
      },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    disabled: true,
  },
]

describe('Navigation Component', () => {
  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      render(<Navigation items={mockNavigationItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Navigation items={mockNavigationItems} className="custom-nav" />)
      expect(screen.getByRole('navigation')).toHaveClass('custom-nav')
    })

    it('renders all navigation items', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Brand Section', () => {
    it('renders brand with name only', () => {
      const brand = { name: 'My App' }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      expect(screen.getByText('My App')).toBeInTheDocument()
    })

    it('renders brand with string logo', () => {
      const brand = { 
        name: 'My App', 
        logo: 'https://example.com/logo.png' 
      }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      
      const logo = screen.getByAltText('My App')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('renders brand with component logo', () => {
      const LogoComponent = ({ className }: { className?: string }) => (
        <div className={className} data-testid="logo-component">Logo</div>
      )
      
      const brand = { 
        name: 'My App', 
        logo: LogoComponent 
      }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      
      expect(screen.getByTestId('logo-component')).toBeInTheDocument()
    })

    it('renders brand as link when href is provided', () => {
      const brand = { 
        name: 'My App', 
        href: 'https://example.com' 
      }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      
      const link = screen.getByRole('link', { name: 'My App' })
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('renders brand without link when href is not provided', () => {
      const brand = { name: 'My App' }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      
      expect(screen.queryByRole('link', { name: 'My App' })).not.toBeInTheDocument()
      expect(screen.getByText('My App')).toBeInTheDocument()
    })
  })

  describe('Navigation Items', () => {
    it('renders items with icons', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      expect(document.querySelector('[data-lucide="home"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="user"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="settings"]')).toBeInTheDocument()
    })

    it('renders items with badges', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders items as links when href is provided', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('renders items as buttons when href is not provided', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      expect(screen.getByRole('button', { name: /content/i })).toBeInTheDocument()
    })

    it('applies active styling to active items', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveAttribute('data-active', 'true')
    })

    it('applies disabled styling to disabled items', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      expect(settingsLink).toHaveClass('opacity-50', 'cursor-not-allowed', 'pointer-events-none')
    })

    it('calls onItemClick when item is clicked', () => {
      const onItemClick = jest.fn()
      render(<Navigation items={mockNavigationItems} onItemClick={onItemClick} />)
      
      fireEvent.click(screen.getByRole('link', { name: /dashboard/i }))
      expect(onItemClick).toHaveBeenCalledWith(mockNavigationItems[0])
    })
  })

  describe('Nested Navigation', () => {
    it('renders nested items when parent is expanded', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      // Initially, nested items should not be visible
      expect(screen.queryByText('Articles')).not.toBeInTheDocument()
      
      // Click to expand
      fireEvent.click(screen.getByRole('button', { name: /content/i }))
      
      // Now nested items should be visible
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(screen.getByText('Pages')).toBeInTheDocument()
    })

    it('collapses nested items when parent is clicked again', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const contentButton = screen.getByRole('button', { name: /content/i })
      
      // Expand
      fireEvent.click(contentButton)
      expect(screen.getByText('Articles')).toBeInTheDocument()
      
      // Collapse
      fireEvent.click(contentButton)
      expect(screen.queryByText('Articles')).not.toBeInTheDocument()
    })

    it('shows chevron icon for items with children', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const contentButton = screen.getByRole('button', { name: /content/i })
      const chevron = contentButton.querySelector('[data-lucide="chevron-down"]')
      expect(chevron).toBeInTheDocument()
    })

    it('rotates chevron when expanded', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const contentButton = screen.getByRole('button', { name: /content/i })
      const chevron = contentButton.querySelector('svg')
      
      expect(chevron).not.toHaveClass('rotate-180')
      
      fireEvent.click(contentButton)
      expect(chevron).toHaveClass('rotate-180')
    })

    it('renders nested items with proper indentation', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      fireEvent.click(screen.getByRole('button', { name: /content/i }))
      
      const articlesItem = screen.getByText('Articles').closest('li')
      expect(articlesItem).toHaveClass('ml-4')
    })

    it('renders badges in nested items', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      fireEvent.click(screen.getByRole('button', { name: /content/i }))
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('calls onItemClick for nested items', () => {
      const onItemClick = jest.fn()
      render(<Navigation items={mockNavigationItems} onItemClick={onItemClick} />)
      
      fireEvent.click(screen.getByRole('button', { name: /content/i }))
      fireEvent.click(screen.getByRole('link', { name: /articles/i }))
      
      expect(onItemClick).toHaveBeenCalledWith(mockNavigationItems[2].children![0])
    })
  })

  describe('Orientation', () => {
    it('applies horizontal layout by default', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('items-center', 'space-x-4')
    })

    it('applies vertical layout when orientation is vertical', () => {
      render(<Navigation items={mockNavigationItems} orientation="vertical" />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('flex-col')
      
      const list = screen.getByRole('list')
      expect(list).toHaveClass('flex-col', 'space-y-1', 'w-full')
    })

    it('applies horizontal spacing for horizontal orientation', () => {
      render(<Navigation items={mockNavigationItems} orientation="horizontal" />)
      
      const list = screen.getByRole('list')
      expect(list).toHaveClass('items-center', 'space-x-1')
    })
  })

  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<Navigation items={mockNavigationItems} variant="default" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('rounded-md')
    })

    it('applies pills variant styles', () => {
      render(<Navigation items={mockNavigationItems} variant="pills" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('rounded-full')
    })

    it('applies underline variant styles', () => {
      render(<Navigation items={mockNavigationItems} variant="underline" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('rounded-none', 'border-b-2')
    })

    it('applies active styles for pills variant', () => {
      render(<Navigation items={mockNavigationItems} variant="pills" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-primary', 'text-primary-foreground')
    })
  })

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<Navigation items={mockNavigationItems} size="sm" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('text-sm', 'px-2', 'py-1')
    })

    it('applies medium size classes', () => {
      render(<Navigation items={mockNavigationItems} size="md" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('text-sm', 'px-3', 'py-2')
    })

    it('applies large size classes', () => {
      render(<Navigation items={mockNavigationItems} size="lg" />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('text-base', 'px-4', 'py-3')
    })
  })

  describe('Collapsible Navigation', () => {
    it('renders toggle button when collapsible is true', () => {
      render(<Navigation items={mockNavigationItems} collapsible />)
      
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="menu"]')).toBeInTheDocument()
    })

    it('does not render toggle button when collapsible is false', () => {
      render(<Navigation items={mockNavigationItems} collapsible={false} />)
      
      expect(document.querySelector('[data-lucide="menu"]')).not.toBeInTheDocument()
    })

    it('toggles navigation visibility when toggle button is clicked', () => {
      render(<Navigation items={mockNavigationItems} collapsible />)
      
      const list = screen.getByRole('list')
      const toggleButton = screen.getByRole('button')
      
      // Initially visible (not collapsed)
      expect(list).not.toHaveClass('hidden')
      
      // Click to collapse
      fireEvent.click(toggleButton)
      expect(list).toHaveClass('hidden')
      
      // Click to expand
      fireEvent.click(toggleButton)
      expect(list).not.toHaveClass('hidden')
    })

    it('changes toggle icon when collapsed/expanded', () => {
      render(<Navigation items={mockNavigationItems} collapsible />)
      
      const toggleButton = screen.getByRole('button')
      
      // Initially shows menu icon
      expect(document.querySelector('[data-lucide="menu"]')).toBeInTheDocument()
      
      // Click to collapse, should show X icon
      fireEvent.click(toggleButton)
      expect(document.querySelector('[data-lucide="x"]')).toBeInTheDocument()
    })

    it('starts collapsed when defaultCollapsed is true', () => {
      render(<Navigation items={mockNavigationItems} collapsible defaultCollapsed />)
      
      const list = screen.getByRole('list')
      expect(list).toHaveClass('hidden')
      expect(document.querySelector('[data-lucide="x"]')).toBeInTheDocument()
    })

    it('only applies to horizontal orientation', () => {
      render(<Navigation items={mockNavigationItems} collapsible orientation="vertical" />)
      
      expect(document.querySelector('[data-lucide="menu"]')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<Navigation items={mockNavigationItems} />)
    })

    it('uses semantic navigation element', () => {
      render(<Navigation items={mockNavigationItems} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('uses proper list structure', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      expect(screen.getByRole('list')).toBeInTheDocument()
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(mockNavigationItems.length)
    })

    it('provides proper button attributes for disabled items', () => {
      const disabledItems: NavigationItem[] = [
        { label: 'Disabled Button', disabled: true }
      ]
      
      render(<Navigation items={disabledItems} />)
      
      const disabledButton = screen.getByRole('button', { name: 'Disabled Button' })
      expect(disabledButton).toBeDisabled()
    })

    it('maintains focus management for keyboard navigation', () => {
      render(<Navigation items={mockNavigationItems} />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      dashboardLink.focus()
      expect(dashboardLink).toHaveFocus()
    })

    it('provides proper alt text for logos', () => {
      const brand = { name: 'My App', logo: 'logo.png' }
      render(<Navigation items={mockNavigationItems} brand={brand} />)
      
      expect(screen.getByAltText('My App')).toBeInTheDocument()
    })
  })

  describe('Complex Interactions', () => {
    it('handles multiple levels of nesting', () => {
      const nestedItems: NavigationItem[] = [
        {
          label: 'Level 1',
          children: [
            {
              label: 'Level 2',
              children: [
                { label: 'Level 3', href: '/level3' }
              ]
            }
          ]
        }
      ]
      
      render(<Navigation items={nestedItems} />)
      
      // Expand level 1
      fireEvent.click(screen.getByRole('button', { name: 'Level 1' }))
      expect(screen.getByText('Level 2')).toBeInTheDocument()
      
      // Expand level 2
      fireEvent.click(screen.getByRole('button', { name: 'Level 2' }))
      expect(screen.getByText('Level 3')).toBeInTheDocument()
    })

    it('maintains independent expansion state for different branches', () => {
      const multipleParents: NavigationItem[] = [
        {
          label: 'Parent 1',
          children: [{ label: 'Child 1A', href: '/1a' }]
        },
        {
          label: 'Parent 2',
          children: [{ label: 'Child 2A', href: '/2a' }]
        }
      ]
      
      render(<Navigation items={multipleParents} />)
      
      // Expand first parent
      fireEvent.click(screen.getByRole('button', { name: 'Parent 1' }))
      expect(screen.getByText('Child 1A')).toBeInTheDocument()
      expect(screen.queryByText('Child 2A')).not.toBeInTheDocument()
      
      // Expand second parent
      fireEvent.click(screen.getByRole('button', { name: 'Parent 2' }))
      expect(screen.getByText('Child 1A')).toBeInTheDocument()
      expect(screen.getByText('Child 2A')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<Navigation items={[]} />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      
      const list = screen.getByRole('list')
      expect(list).toBeEmptyDOMElement()
    })

    it('handles items without icons', () => {
      const itemsWithoutIcons: NavigationItem[] = [
        { label: 'No Icon', href: '/no-icon' }
      ]
      
      render(<Navigation items={itemsWithoutIcons} />)
      
      expect(screen.getByText('No Icon')).toBeInTheDocument()
    })

    it('handles items without badges', () => {
      const itemsWithoutBadges: NavigationItem[] = [
        { label: 'No Badge', href: '/no-badge' }
      ]
      
      render(<Navigation items={itemsWithoutBadges} />)
      
      expect(screen.getByText('No Badge')).toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('handles mixed item types', () => {
      const mixedItems: NavigationItem[] = [
        { label: 'Link Item', href: '/link' },
        { label: 'Button Item' },
        { label: 'Parent Item', children: [{ label: 'Child', href: '/child' }] }
      ]
      
      render(<Navigation items={mixedItems} />)
      
      expect(screen.getByRole('link', { name: 'Link Item' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Button Item' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /parent item/i })).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLElement>()
      render(<Navigation items={mockNavigationItems} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('NAV')
    })
  })

  describe('Event Handling', () => {
    it('prevents propagation for nested interactions', () => {
      const onItemClick = jest.fn()
      render(<Navigation items={mockNavigationItems} onItemClick={onItemClick} />)
      
      // Click the parent to expand
      fireEvent.click(screen.getByRole('button', { name: /content/i }))
      expect(onItemClick).toHaveBeenCalledWith(mockNavigationItems[2])
      
      onItemClick.mockClear()
      
      // Click a child item
      fireEvent.click(screen.getByRole('link', { name: /articles/i }))
      expect(onItemClick).toHaveBeenCalledWith(mockNavigationItems[2].children![0])
    })

    it('handles clicks on items with and without children differently', () => {
      const onItemClick = jest.fn()
      render(<Navigation items={mockNavigationItems} onItemClick={onItemClick} />)
      
      // Item with children should toggle expansion
      const contentButton = screen.getByRole('button', { name: /content/i })
      fireEvent.click(contentButton)
      
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(onItemClick).toHaveBeenCalledWith(mockNavigationItems[2])
    })
  })
})