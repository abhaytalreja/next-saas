import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { 
  EmptyState, 
  SearchEmptyState,
  CreateEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
  LoadingEmptyState,
  NoDataEmptyState,
  NoUsersEmptyState,
  NoFilesEmptyState,
  EmptyStateProps 
} from './EmptyState'
import { testAccessibility } from '../../test-utils'
import { User, Plus, AlertTriangle } from 'lucide-react'

// Mock data for testing
const mockActions = [
  {
    label: 'Create New',
    variant: 'primary' as const,
    onClick: jest.fn(),
    icon: Plus,
  },
  {
    label: 'Import',
    variant: 'outline' as const,
    onClick: jest.fn(),
  },
  {
    label: 'Learn More',
    variant: 'secondary' as const,
    href: '/help',
  },
]

describe('EmptyState Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with minimal props', () => {
      render(<EmptyState title="No items found" />)
      
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<EmptyState title="Test" className="custom-empty-state" />)
      
      const container = screen.getByText('Test').closest('div')
      expect(container).toHaveClass('custom-empty-state')
    })

    it('renders title and description', () => {
      render(
        <EmptyState 
          title="No results found"
          description="Try adjusting your search criteria to find what you're looking for."
        />
      )
      
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.getByText("Try adjusting your search criteria to find what you're looking for.")).toBeInTheDocument()
    })

    it('renders without description', () => {
      render(<EmptyState title="Empty" />)
      
      expect(screen.getByText('Empty')).toBeInTheDocument()
      expect(screen.queryByText('description')).not.toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(
        <EmptyState title="Custom Content">
          <div data-testid="custom-content">
            <p>Custom message here</p>
            <button>Custom Button</button>
          </div>
        </EmptyState>
      )
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom message here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Custom Button' })).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders default variant with inbox icon', () => {
      render(<EmptyState variant="default" title="Default state" />)
      
      expect(document.querySelector('[data-lucide="inbox"]')).toBeInTheDocument()
      expect(screen.getByText('Default state')).toBeInTheDocument()
    })

    it('renders search variant with search icon', () => {
      render(<EmptyState variant="search" title="No search results" />)
      
      expect(document.querySelector('[data-lucide="search"]')).toBeInTheDocument()
    })

    it('renders create variant with plus icon', () => {
      render(<EmptyState variant="create" title="Create your first item" />)
      
      expect(document.querySelector('[data-lucide="plus"]')).toBeInTheDocument()
    })

    it('renders error variant with alert icon and error styling', () => {
      render(<EmptyState variant="error" title="Something went wrong" />)
      
      const alertIcon = document.querySelector('[data-lucide="alert-circle"]')
      expect(alertIcon).toBeInTheDocument()
      expect(alertIcon).toHaveClass('text-destructive')
    })

    it('renders offline variant with wifi icon and warning styling', () => {
      render(<EmptyState variant="offline" title="You're offline" />)
      
      const wifiIcon = document.querySelector('[data-lucide="wifi"]')
      expect(wifiIcon).toBeInTheDocument()
      expect(wifiIcon).toHaveClass('text-warning')
    })

    it('renders loading variant with database icon and pulse animation', () => {
      render(<EmptyState variant="loading" title="Loading..." />)
      
      const databaseIcon = document.querySelector('[data-lucide="database"]')
      expect(databaseIcon).toBeInTheDocument()
      expect(databaseIcon).toHaveClass('text-muted-foreground', 'animate-pulse')
    })
  })

  describe('Custom Icons', () => {
    it('renders custom icon when provided', () => {
      render(
        <EmptyState 
          title="Custom icon" 
          icon={User}
        />
      )
      
      expect(document.querySelector('[data-lucide="user"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="inbox"]')).not.toBeInTheDocument()
    })

    it('overrides variant icon with custom icon', () => {
      render(
        <EmptyState 
          variant="search"
          title="Custom search" 
          icon={AlertTriangle}
        />
      )
      
      expect(document.querySelector('[data-lucide="alert-triangle"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="search"]')).not.toBeInTheDocument()
    })
  })

  describe('Images', () => {
    it('renders image instead of icon when provided', () => {
      render(
        <EmptyState 
          title="With image"
          image="https://example.com/empty-state.png"
        />
      )
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', 'https://example.com/empty-state.png')
      expect(image).toHaveAttribute('alt', '')
      expect(document.querySelector('[data-lucide="inbox"]')).not.toBeInTheDocument()
    })

    it('applies correct image sizing based on size prop', () => {
      const { rerender } = render(
        <EmptyState 
          title="Small image"
          image="test.png"
          size="sm"
        />
      )
      
      let image = screen.getByRole('img')
      expect(image).toHaveClass('h-16', 'w-16')
      
      rerender(
        <EmptyState 
          title="Large image"
          image="test.png"
          size="lg"
        />
      )
      
      image = screen.getByRole('img')
      expect(image).toHaveClass('h-32', 'w-32')
    })
  })

  describe('Sizes', () => {
    it('applies small size styles', () => {
      render(<EmptyState title="Small" size="sm" />)
      
      const container = screen.getByText('Small').closest('div')
      expect(container).toHaveClass('py-8', 'space-y-2')
      
      const title = screen.getByText('Small')
      expect(title).toHaveClass('text-lg')
      
      const icon = document.querySelector('[data-lucide="inbox"]')
      expect(icon).toHaveClass('h-8', 'w-8')
    })

    it('applies medium size styles by default', () => {
      render(<EmptyState title="Medium" />)
      
      const container = screen.getByText('Medium').closest('div')
      expect(container).toHaveClass('py-12', 'space-y-3')
      
      const title = screen.getByText('Medium')
      expect(title).toHaveClass('text-xl')
      
      const icon = document.querySelector('[data-lucide="inbox"]')
      expect(icon).toHaveClass('h-12', 'w-12')
    })

    it('applies large size styles', () => {
      render(<EmptyState title="Large" size="lg" />)
      
      const container = screen.getByText('Large').closest('div')
      expect(container).toHaveClass('py-16', 'space-y-4')
      
      const title = screen.getByText('Large')
      expect(title).toHaveClass('text-2xl')
      
      const icon = document.querySelector('[data-lucide="inbox"]')
      expect(icon).toHaveClass('h-16', 'w-16')
    })

    it('applies compact spacing when compact is true', () => {
      render(<EmptyState title="Compact" compact />)
      
      const container = screen.getByText('Compact').closest('div')
      expect(container).toHaveClass('py-8') // compact reduces padding from py-12 to py-8
      
      const contentContainer = screen.getByText('Compact').closest('div')?.parentElement?.children[1]
      expect(contentContainer).toHaveClass('space-y-1')
    })
  })

  describe('Actions', () => {
    it('renders action buttons with correct variants', () => {
      render(<EmptyState title="With actions" actions={mockActions} />)
      
      const primaryButton = screen.getByRole('button', { name: /create new/i })
      expect(primaryButton).toHaveClass('bg-primary', 'text-primary-foreground')
      
      const outlineButton = screen.getByRole('button', { name: /import/i })
      expect(outlineButton).toHaveClass('border', 'border-input')
      
      const secondaryLink = screen.getByRole('link', { name: /learn more/i })
      expect(secondaryLink).toHaveClass('bg-secondary', 'text-secondary-foreground')
      expect(secondaryLink).toHaveAttribute('href', '/help')
    })

    it('renders action icons', () => {
      render(<EmptyState title="With actions" actions={mockActions} />)
      
      expect(document.querySelector('[data-lucide="plus"]')).toBeInTheDocument()
    })

    it('calls onClick handlers when buttons are clicked', () => {
      render(<EmptyState title="With actions" actions={mockActions} />)
      
      fireEvent.click(screen.getByRole('button', { name: /create new/i }))
      expect(mockActions[0].onClick).toHaveBeenCalled()
      
      fireEvent.click(screen.getByRole('button', { name: /import/i }))
      expect(mockActions[1].onClick).toHaveBeenCalled()
    })

    it('renders actions as links when href is provided', () => {
      render(<EmptyState title="With actions" actions={mockActions} />)
      
      const learnMoreLink = screen.getByRole('link', { name: /learn more/i })
      expect(learnMoreLink).toHaveAttribute('href', '/help')
    })

    it('applies compact styling to actions when compact is true', () => {
      render(<EmptyState title="Compact actions" actions={mockActions} compact />)
      
      const button = screen.getByRole('button', { name: /create new/i })
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs')
    })

    it('does not render actions section when actions array is empty', () => {
      render(<EmptyState title="No actions" actions={[]} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('Pre-configured Variants', () => {
    describe('SearchEmptyState', () => {
      it('renders with default props', () => {
        render(<SearchEmptyState />)
        
        expect(screen.getByText('No results found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search criteria or explore different keywords.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="search"]')).toBeInTheDocument()
      })

      it('allows custom title and description', () => {
        render(
          <SearchEmptyState 
            title="Custom search title"
            description="Custom search description"
          />
        )
        
        expect(screen.getByText('Custom search title')).toBeInTheDocument()
        expect(screen.getByText('Custom search description')).toBeInTheDocument()
      })
    })

    describe('CreateEmptyState', () => {
      it('renders with create variant', () => {
        render(<CreateEmptyState title="Create your first item" />)
        
        expect(screen.getByText('Create your first item')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="plus"]')).toBeInTheDocument()
      })
    })

    describe('ErrorEmptyState', () => {
      it('renders with default error props', () => {
        render(<ErrorEmptyState />)
        
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByText('We encountered an error while loading this content. Please try again.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="alert-circle"]')).toBeInTheDocument()
      })

      it('allows custom error message', () => {
        render(
          <ErrorEmptyState 
            title="Network Error"
            description="Unable to connect to the server"
          />
        )
        
        expect(screen.getByText('Network Error')).toBeInTheDocument()
        expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument()
      })
    })

    describe('OfflineEmptyState', () => {
      it('renders with default offline props', () => {
        render(<OfflineEmptyState />)
        
        expect(screen.getByText("You're offline")).toBeInTheDocument()
        expect(screen.getByText('Please check your internet connection and try again.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="wifi"]')).toBeInTheDocument()
      })
    })

    describe('LoadingEmptyState', () => {
      it('renders with default loading props', () => {
        render(<LoadingEmptyState />)
        
        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(screen.getByText('Please wait while we fetch your data.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="database"]')).toBeInTheDocument()
      })
    })

    describe('NoDataEmptyState', () => {
      it('renders with database icon and default message', () => {
        render(<NoDataEmptyState />)
        
        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(screen.getByText("There's no data to display at the moment.")).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="database"]')).toBeInTheDocument()
      })

      it('allows custom description and actions', () => {
        render(
          <NoDataEmptyState 
            description="Custom data message"
            actions={[{ label: 'Refresh', onClick: jest.fn() }]}
          />
        )
        
        expect(screen.getByText('Custom data message')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
      })
    })

    describe('NoUsersEmptyState', () => {
      it('renders with users icon and default message', () => {
        render(<NoUsersEmptyState />)
        
        expect(screen.getByText('No users found')).toBeInTheDocument()
        expect(screen.getByText('Start by inviting team members to collaborate.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="users"]')).toBeInTheDocument()
      })
    })

    describe('NoFilesEmptyState', () => {
      it('renders with file icon and default message', () => {
        render(<NoFilesEmptyState />)
        
        expect(screen.getByText('No files uploaded')).toBeInTheDocument()
        expect(screen.getByText('Upload your first file to get started.')).toBeInTheDocument()
        expect(document.querySelector('[data-lucide="file-text"]')).toBeInTheDocument()
      })
    })
  })

  describe('Icon Styling', () => {
    it('applies correct background and padding to icon container', () => {
      render(<EmptyState title="Icon styling" size="md" />)
      
      const iconContainer = document.querySelector('[data-lucide="inbox"]')?.parentElement
      expect(iconContainer).toHaveClass('rounded-full', 'bg-muted', 'p-3')
    })

    it('adjusts icon container padding based on size', () => {
      const { rerender } = render(<EmptyState title="Small icon" size="sm" />)
      
      let iconContainer = document.querySelector('[data-lucide="inbox"]')?.parentElement
      expect(iconContainer).toHaveClass('p-2')
      
      rerender(<EmptyState title="Large icon" size="lg" />)
      iconContainer = document.querySelector('[data-lucide="inbox"]')?.parentElement
      expect(iconContainer).toHaveClass('p-4')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive flex direction to actions', () => {
      render(<EmptyState title="Responsive" actions={mockActions} />)
      
      const actionsContainer = screen.getByRole('button', { name: /create new/i }).closest('div')
      expect(actionsContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row')
    })

    it('adjusts action spacing for compact mode', () => {
      render(<EmptyState title="Compact responsive" actions={mockActions} compact />)
      
      const actionsContainer = screen.getByRole('button', { name: /create new/i }).closest('div')
      expect(actionsContainer).toHaveClass('gap-2')
    })
  })

  describe('Typography', () => {
    it('applies correct description max-width', () => {
      render(
        <EmptyState 
          title="Typography test"
          description="This is a long description that should have a maximum width applied to it for better readability."
        />
      )
      
      const description = screen.getByText(/This is a long description/)
      expect(description).toHaveClass('max-w-md')
    })

    it('applies muted foreground color to description', () => {
      render(<EmptyState title="Test" description="Description" />)
      
      const description = screen.getByText('Description')
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <EmptyState 
          title="Accessible empty state"
          description="This empty state is accessible"
          actions={mockActions.slice(0, 2)}
        />
      )
    })

    it('provides proper heading structure', () => {
      render(<EmptyState title="Main heading" />)
      
      expect(screen.getByRole('heading', { level: 3, name: 'Main heading' })).toBeInTheDocument()
    })

    it('provides empty alt text for decorative images', () => {
      render(<EmptyState title="With image" image="decorative.png" />)
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', '')
    })

    it('maintains focus management for interactive elements', () => {
      render(<EmptyState title="Focus test" actions={mockActions} />)
      
      const button = screen.getByRole('button', { name: /create new/i })
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty actions array gracefully', () => {
      render(<EmptyState title="No actions" actions={[]} />)
      
      expect(screen.getByText('No actions')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('handles actions without icons', () => {
      const actionsWithoutIcons = [
        { label: 'No Icon', onClick: jest.fn() }
      ]
      
      render(<EmptyState title="Test" actions={actionsWithoutIcons} />)
      
      expect(screen.getByRole('button', { name: 'No Icon' })).toBeInTheDocument()
    })

    it('handles actions without onClick or href', () => {
      const actionWithoutHandler = [
        { label: 'No Handler' }
      ]
      
      render(<EmptyState title="Test" actions={actionWithoutHandler} />)
      
      expect(screen.getByRole('button', { name: 'No Handler' })).toBeInTheDocument()
    })

    it('handles very long titles and descriptions', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines and should still look good'
      const longDescription = 'This is an extremely long description that goes on and on and should also wrap properly without breaking the layout or causing accessibility issues'
      
      render(<EmptyState title={longTitle} description={longDescription} />)
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<EmptyState ref={ref} title="Ref test" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards ref for pre-configured variants', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<SearchEmptyState ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Custom Styling', () => {
    it('preserves custom props passed to the component', () => {
      render(
        <EmptyState 
          title="Custom props"
          data-testid="custom-empty-state"
          aria-label="Custom empty state"
        />
      )
      
      const container = screen.getByTestId('custom-empty-state')
      expect(container).toHaveAttribute('aria-label', 'Custom empty state')
    })

    it('merges custom className with default classes', () => {
      render(<EmptyState title="Custom class" className="my-custom-class" />)
      
      const container = screen.getByText('Custom class').closest('div')
      expect(container).toHaveClass('my-custom-class')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center')
    })
  })
})