import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { Header, HeaderAction } from './Header'
import { testAccessibility } from '../../test-utils'
import { Bell, Settings, User } from 'lucide-react'

describe('Header Component', () => {
  describe('Rendering', () => {
    it('renders correctly with minimal props', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Header className="custom-header" />)
      expect(screen.getByRole('banner')).toHaveClass('custom-header')
    })

    it('renders custom children', () => {
      render(
        <Header>
          <div data-testid="custom-content">Custom Content</div>
        </Header>
      )
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })
  })

  describe('Brand Section', () => {
    it('renders brand with name only', () => {
      const brand = { name: 'My App' }
      render(<Header brand={brand} />)
      expect(screen.getByText('My App')).toBeInTheDocument()
    })

    it('renders brand with string logo', () => {
      const brand = { 
        name: 'My App', 
        logo: 'https://example.com/logo.png' 
      }
      render(<Header brand={brand} />)
      
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
      render(<Header brand={brand} />)
      
      expect(screen.getByTestId('logo-component')).toBeInTheDocument()
    })

    it('renders brand as link when href is provided', () => {
      const brand = { 
        name: 'My App', 
        href: 'https://example.com' 
      }
      render(<Header brand={brand} />)
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveTextContent('My App')
    })

    it('renders brand without link when href is not provided', () => {
      const brand = { name: 'My App' }
      render(<Header brand={brand} />)
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('My App')).toBeInTheDocument()
    })
  })

  describe('Title Section', () => {
    it('renders title only', () => {
      render(<Header title="Dashboard" />)
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    })

    it('renders title with subtitle', () => {
      render(<Header title="Dashboard" subtitle="Welcome back!" />)
      
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    })

    it('does not render title section when title is not provided', () => {
      render(<Header />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('applies truncation classes for long titles', () => {
      render(<Header title="Very Long Dashboard Title That Should Truncate" />)
      const title = screen.getByRole('heading')
      expect(title).toHaveClass('truncate')
    })
  })

  describe('Search Section', () => {
    it('renders search input when search prop is provided', () => {
      const search = { placeholder: 'Search items...' }
      render(<Header search={search} />)
      
      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('uses default placeholder when not provided', () => {
      const search = {}
      render(<Header search={search} />)
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('calls onSearch when input value changes', () => {
      const onSearch = jest.fn()
      const search = { onSearch }
      render(<Header search={search} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test query' } })
      
      expect(onSearch).toHaveBeenCalledWith('test query')
    })

    it('displays search value when provided', () => {
      const search = { value: 'existing query' }
      render(<Header search={search} />)
      
      expect(screen.getByDisplayValue('existing query')).toBeInTheDocument()
    })

    it('shows search icon', () => {
      const search = {}
      render(<Header search={search} />)
      
      const searchIcon = document.querySelector('[data-lucide="search"]')
      expect(searchIcon).toBeInTheDocument()
    })

    it('does not render search when search prop is not provided', () => {
      render(<Header />)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('Actions Section', () => {
    const mockActions: HeaderAction[] = [
      {
        label: 'Notifications',
        icon: Bell,
        onClick: jest.fn(),
        badge: '3',
      },
      {
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        variant: 'ghost',
      },
    ]

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders action buttons', () => {
      render(<Header actions={mockActions} />)
      
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    })

    it('calls onClick when action button is clicked', () => {
      render(<Header actions={mockActions} />)
      
      fireEvent.click(screen.getByRole('button', { name: /notifications/i }))
      expect(mockActions[0].onClick).toHaveBeenCalled()
    })

    it('renders action as link when href is provided', () => {
      render(<Header actions={mockActions} />)
      
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      expect(settingsLink).toHaveAttribute('href', '/settings')
    })

    it('renders action badges', () => {
      render(<Header actions={mockActions} />)
      
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('applies correct variant classes', () => {
      render(<Header actions={mockActions} />)
      
      const notificationButton = screen.getByRole('button', { name: /notifications/i })
      const settingsButton = screen.getByRole('link', { name: /settings/i }).querySelector('button')
      
      expect(notificationButton).toHaveClass('bg-primary')
      expect(settingsButton).toHaveClass('hover:bg-accent')
    })

    it('renders action icons', () => {
      render(<Header actions={mockActions} />)
      
      expect(document.querySelector('[data-lucide="bell"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="settings"]')).toBeInTheDocument()
    })

    it('does not render actions when array is empty', () => {
      render(<Header actions={[]} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('supports actions without icons', () => {
      const actionsWithoutIcons: HeaderAction[] = [
        { label: 'Save', onClick: jest.fn() },
      ]
      
      render(<Header actions={actionsWithoutIcons} />)
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('User Section', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
    }

    it('renders user with avatar', () => {
      render(<Header user={mockUser} />)
      
      const avatar = screen.getByAltText('John Doe')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders user with initials when no avatar', () => {
      const userWithoutAvatar = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      
      render(<Header user={userWithoutAvatar} />)
      
      expect(screen.getByText('J')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('uses custom initials when provided', () => {
      const userWithCustomInitials = {
        name: 'John Doe',
        initials: 'JD',
      }
      
      render(<Header user={userWithCustomInitials} />)
      
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('calls onUserMenuClick when user section is clicked', () => {
      const onUserMenuClick = jest.fn()
      render(<Header user={mockUser} onUserMenuClick={onUserMenuClick} />)
      
      fireEvent.click(screen.getByRole('button', { name: /john doe/i }))
      expect(onUserMenuClick).toHaveBeenCalled()
    })

    it('does not render user section when user prop is not provided', () => {
      render(<Header />)
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('renders user without email', () => {
      const userWithoutEmail = { name: 'John Doe' }
      render(<Header user={userWithoutEmail} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('@')).not.toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant classes', () => {
      render(<Header variant="default" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-background', 'border-b')
    })

    it('applies sticky variant classes', () => {
      render(<Header variant="sticky" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('sticky', 'top-0', 'z-40')
    })

    it('applies floating variant classes', () => {
      render(<Header variant="floating" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('mx-4', 'mt-4', 'rounded-lg', 'shadow-sm')
    })
  })

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<Header size="sm" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('h-12', 'px-4')
    })

    it('applies medium size classes', () => {
      render(<Header size="md" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('h-16', 'px-6')
    })

    it('applies large size classes', () => {
      render(<Header size="lg" />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('h-20', 'px-8')
    })
  })

  describe('Complex Composition', () => {
    it('renders all sections together', () => {
      const brand = { name: 'My App', logo: 'logo.png' }
      const search = { placeholder: 'Search...' }
      const actions: HeaderAction[] = [
        { label: 'Notifications', icon: Bell, badge: '5' },
      ]
      const user = { name: 'John Doe', email: 'john@example.com' }
      
      render(
        <Header
          brand={brand}
          title="Dashboard"
          subtitle="Overview"
          search={search}
          actions={actions}
          user={user}
        />
      )
      
      expect(screen.getByText('My App')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('handles layout properly with different combinations', () => {
      render(
        <Header
          title="Dashboard"
          actions={[{ label: 'Save', onClick: jest.fn() }]}
        />
      )
      
      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('hides action labels on small screens', () => {
      const actions: HeaderAction[] = [
        { label: 'Settings', icon: Settings },
      ]
      
      render(<Header actions={actions} />)
      
      const actionButton = screen.getByRole('button', { name: /settings/i })
      const label = actionButton.querySelector('span')
      expect(label).toHaveClass('sr-only', 'lg:not-sr-only')
    })

    it('hides user details on small screens', () => {
      const user = { name: 'John Doe', email: 'john@example.com' }
      render(<Header user={user} />)
      
      const userDetails = screen.getByText('John Doe').closest('div')
      expect(userDetails).toHaveClass('hidden', 'lg:block')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const brand = { name: 'My App' }
      const search = { placeholder: 'Search...' }
      const actions: HeaderAction[] = [
        { label: 'Notifications', icon: Bell },
      ]
      const user = { name: 'John Doe' }
      
      await testAccessibility(
        <Header
          brand={brand}
          title="Dashboard"
          search={search}
          actions={actions}
          user={user}
        />
      )
    })

    it('uses semantic header element', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('provides proper heading hierarchy', () => {
      render(<Header title="Dashboard" />)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('provides accessible button labels', () => {
      const actions: HeaderAction[] = [
        { label: 'Open Settings', icon: Settings },
      ]
      
      render(<Header actions={actions} />)
      
      const button = screen.getByRole('button', { name: /open settings/i })
      expect(button).toBeInTheDocument()
    })

    it('provides proper alt text for logos and avatars', () => {
      const brand = { name: 'My App', logo: 'logo.png' }
      const user = { name: 'John Doe', avatar: 'avatar.jpg' }
      
      render(<Header brand={brand} user={user} />)
      
      expect(screen.getByAltText('My App')).toBeInTheDocument()
      expect(screen.getByAltText('John Doe')).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLElement>()
      render(<Header ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLElement)
      expect(ref.current?.tagName).toBe('HEADER')
    })
  })

  describe('Event Handling', () => {
    it('prevents propagation for nested interactive elements', () => {
      const onUserMenuClick = jest.fn()
      const user = { name: 'John Doe' }
      
      render(<Header user={user} onUserMenuClick={onUserMenuClick} />)
      
      const userButton = screen.getByRole('button', { name: /john doe/i })
      fireEvent.click(userButton)
      
      expect(onUserMenuClick).toHaveBeenCalledTimes(1)
    })

    it('handles action clicks correctly', () => {
      const onClick1 = jest.fn()
      const onClick2 = jest.fn()
      const actions: HeaderAction[] = [
        { label: 'Action 1', onClick: onClick1 },
        { label: 'Action 2', onClick: onClick2 },
      ]
      
      render(<Header actions={actions} />)
      
      fireEvent.click(screen.getByRole('button', { name: 'Action 1' }))
      fireEvent.click(screen.getByRole('button', { name: 'Action 2' }))
      
      expect(onClick1).toHaveBeenCalledTimes(1)
      expect(onClick2).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty strings gracefully', () => {
      render(<Header title="" subtitle="" />)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('handles undefined user properties', () => {
      const user = { name: 'John Doe', email: undefined }
      render(<Header user={user} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    })

    it('handles actions without onClick or href', () => {
      const actions: HeaderAction[] = [
        { label: 'Static Action', icon: Settings },
      ]
      
      render(<Header actions={actions} />)
      
      const button = screen.getByRole('button', { name: /static action/i })
      expect(button).toBeInTheDocument()
      
      // Should not throw error when clicked
      fireEvent.click(button)
    })
  })
})