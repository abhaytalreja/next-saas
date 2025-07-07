import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { CommandPalette, CommandItem, CommandGroup } from './CommandPalette'
import { testAccessibility } from '../../test-utils'
import { Search, User, File, Settings, Zap } from 'lucide-react'

// Mock data for testing
const mockItems: CommandItem[] = [
  {
    id: 'search-users',
    label: 'Search Users',
    description: 'Find users in the system',
    icon: User,
    shortcut: ['⌘', 'U'],
    category: 'user',
    keywords: ['find', 'people'],
    onSelect: jest.fn(),
  },
  {
    id: 'create-file',
    label: 'Create File',
    description: 'Create a new file',
    icon: File,
    category: 'file',
    onSelect: jest.fn(),
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open application settings',
    icon: Settings,
    href: '/settings',
    category: 'settings',
  },
  {
    id: 'disabled-action',
    label: 'Disabled Action',
    description: 'This action is disabled',
    icon: Zap,
    disabled: true,
    onSelect: jest.fn(),
  },
]

const mockGroups: CommandGroup[] = [
  {
    id: 'actions',
    label: 'Actions',
    items: mockItems.slice(0, 2),
    priority: 1,
  },
  {
    id: 'navigation',
    label: 'Navigation',
    items: mockItems.slice(2, 3),
    priority: 2,
  },
  {
    id: 'disabled',
    label: 'Disabled',
    items: mockItems.slice(3),
    priority: 3,
  },
]

const mockRecentItems: CommandItem[] = [
  {
    id: 'recent-1',
    label: 'Recent Action 1',
    description: 'Recently used action',
    icon: Zap,
    category: 'recent',
    onSelect: jest.fn(),
  },
  {
    id: 'recent-2',
    label: 'Recent Action 2',
    description: 'Another recent action',
    category: 'recent',
    onSelect: jest.fn(),
  },
]

// Mock global keyboard events
const mockKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  return event
}

describe('CommandPalette Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('does not render when closed', () => {
      render(<CommandPalette open={false} />)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('renders when open', () => {
      render(<CommandPalette open={true} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CommandPalette open={true} className="custom-palette" />)
      const container = screen.getByRole('textbox').closest('div')?.parentElement
      expect(container).toHaveClass('custom-palette')
    })

    it('renders custom placeholder', () => {
      render(<CommandPalette open={true} placeholder="Custom placeholder..." />)
      expect(screen.getByPlaceholderText('Custom placeholder...')).toBeInTheDocument()
    })

    it('renders search icon', () => {
      render(<CommandPalette open={true} />)
      expect(document.querySelector('[data-lucide="search"]')).toBeInTheDocument()
    })

    it('renders keyboard shortcuts hint when enabled', () => {
      render(<CommandPalette open={true} enableKeyboardShortcuts={true} />)
      expect(screen.getByText('⌘')).toBeInTheDocument()
      expect(screen.getByText('K')).toBeInTheDocument()
    })

    it('does not render keyboard shortcuts when disabled', () => {
      render(<CommandPalette open={true} enableKeyboardShortcuts={false} />)
      expect(screen.queryByText('⌘')).not.toBeInTheDocument()
      expect(screen.queryByText('K')).not.toBeInTheDocument()
    })
  })

  describe('Backdrop', () => {
    it('renders backdrop when open', () => {
      render(<CommandPalette open={true} />)
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      expect(backdrop).toBeInTheDocument()
    })

    it('closes when backdrop is clicked', () => {
      const onOpenChange = jest.fn()
      render(<CommandPalette open={true} onOpenChange={onOpenChange} />)
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50')
      fireEvent.click(backdrop!)
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Search Functionality', () => {
    it('handles controlled search value', () => {
      const onSearchChange = jest.fn()
      render(
        <CommandPalette 
          open={true} 
          searchValue="test" 
          onSearchChange={onSearchChange}
        />
      )
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('test')
      
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(onSearchChange).toHaveBeenCalledWith('new value')
    })

    it('handles uncontrolled search value', () => {
      render(<CommandPalette open={true} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'search term' } })
      
      expect(input).toHaveValue('search term')
    })

    it('filters items based on search query', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'user' } })
      
      expect(screen.getByText('Search Users')).toBeInTheDocument()
      expect(screen.queryByText('Create File')).not.toBeInTheDocument()
    })

    it('searches by description and keywords', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'people' } })
      
      expect(screen.getByText('Search Users')).toBeInTheDocument()
    })

    it('filters out disabled items', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'disabled' } })
      
      expect(screen.queryByText('Disabled Action')).not.toBeInTheDocument()
    })

    it('respects maxResults limit', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
        description: 'Test item',
        onSelect: jest.fn(),
      }))
      
      render(<CommandPalette open={true} items={manyItems} maxResults={5} />)
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.startsWith('Item')
      )
      expect(buttons.length).toBeLessThanOrEqual(5)
    })

    it('resets selected index when search changes', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      
      // Navigate down first
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      // Change search - this should reset selection
      fireEvent.change(input, { target: { value: 'user' } })
      
      // First item should be selected again
      const firstItem = screen.getByText('Search Users').closest('button')
      expect(firstItem).toHaveClass('bg-accent')
    })
  })

  describe('Items and Groups', () => {
    it('renders items with icons and descriptions', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      expect(screen.getByText('Search Users')).toBeInTheDocument()
      expect(screen.getByText('Find users in the system')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="user"]')).toBeInTheDocument()
    })

    it('renders shortcuts when provided', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      expect(screen.getByText('⌘')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('renders groups with custom items', () => {
      render(<CommandPalette open={true} groups={mockGroups} />)
      
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Search Users')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('sorts groups by priority', () => {
      const shuffledGroups = [mockGroups[2], mockGroups[0], mockGroups[1]]
      render(<CommandPalette open={true} groups={shuffledGroups} />)
      
      const groupHeaders = screen.getAllByText(/Actions|Navigation|Disabled/)
      expect(groupHeaders[0]).toHaveTextContent('Actions')
      expect(groupHeaders[1]).toHaveTextContent('Navigation')
    })

    it('auto-categorizes items when no groups provided', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      // Should show categories for different item types
      expect(screen.queryByText('Actions')).toBeInTheDocument()
    })

    it('shows recent items when provided', () => {
      render(<CommandPalette open={true} items={mockItems} recentItems={mockRecentItems} />)
      
      expect(screen.getByText('Recent Action 1')).toBeInTheDocument()
      expect(screen.getByText('Recent Action 2')).toBeInTheDocument()
    })

    it('limits recent items to 3', () => {
      const manyRecentItems = Array.from({ length: 10 }, (_, i) => ({
        id: `recent-${i}`,
        label: `Recent ${i}`,
        onSelect: jest.fn(),
      }))
      
      render(<CommandPalette open={true} recentItems={manyRecentItems} />)
      
      const recentButtons = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.startsWith('Recent')
      )
      expect(recentButtons.length).toBeLessThanOrEqual(3)
    })

    it('renders fallback icons for items without icons', () => {
      const itemsWithoutIcons: CommandItem[] = [
        { id: 'no-icon', label: 'No Icon', category: 'navigation' }
      ]
      
      render(<CommandPalette open={true} items={itemsWithoutIcons} />)
      
      expect(document.querySelector('[data-lucide="hash"]')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('focuses input when opened', async () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      await waitFor(() => {
        const input = screen.getByRole('textbox')
        expect(input).toHaveFocus()
      })
    })

    it('navigates down with arrow keys', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      const firstItem = screen.getAllByRole('button')[0]
      expect(firstItem).toHaveClass('bg-accent')
    })

    it('navigates up with arrow keys', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      // Navigate down first, then up
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      
      const firstItem = screen.getAllByRole('button')[0]
      expect(firstItem).toHaveClass('bg-accent')
    })

    it('selects item with Enter key', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'Enter' })
      
      expect(mockItems[0].onSelect).toHaveBeenCalled()
    })

    it('closes with Escape key', () => {
      const onOpenChange = jest.fn()
      render(<CommandPalette open={true} onOpenChange={onOpenChange} items={mockItems} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not navigate beyond bounds', () => {
      render(<CommandPalette open={true} items={mockItems.slice(0, 1)} />)
      
      // Try to navigate down when only one item
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      const item = screen.getByRole('button')
      expect(item).toHaveClass('bg-accent')
    })

    it('prevents default for handled keys', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const event = mockKeyboardEvent('ArrowDown')
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      
      document.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Global Keyboard Shortcuts', () => {
    it('opens/closes with Cmd+K when enabled', () => {
      const onOpenChange = jest.fn()
      render(
        <CommandPalette 
          open={false} 
          onOpenChange={onOpenChange} 
          enableKeyboardShortcuts={true}
        />
      )
      
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('works with Ctrl+K for non-Mac', () => {
      const onOpenChange = jest.fn()
      render(
        <CommandPalette 
          open={false} 
          onOpenChange={onOpenChange} 
          enableKeyboardShortcuts={true}
        />
      )
      
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('does not respond to shortcuts when disabled', () => {
      const onOpenChange = jest.fn()
      render(
        <CommandPalette 
          open={false} 
          onOpenChange={onOpenChange} 
          enableKeyboardShortcuts={false}
        />
      )
      
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('prevents default for global shortcuts', () => {
      render(<CommandPalette open={false} enableKeyboardShortcuts={true} />)
      
      const event = mockKeyboardEvent('k', { metaKey: true })
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')
      
      document.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Item Selection', () => {
    it('calls onSelect when item is clicked', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      fireEvent.click(screen.getByText('Search Users'))
      
      expect(mockItems[0].onSelect).toHaveBeenCalled()
    })

    it('navigates to href when item has href', () => {
      // Mock window.location.href
      delete (window as any).location
      window.location = { href: '' } as any
      
      render(<CommandPalette open={true} items={mockItems} />)
      
      fireEvent.click(screen.getByText('Settings'))
      
      expect(window.location.href).toBe('/settings')
    })

    it('does not select disabled items', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const disabledButton = screen.getByText('Disabled Action').closest('button')
      expect(disabledButton).toBeDisabled()
    })

    it('closes palette after selection', () => {
      const onOpenChange = jest.fn()
      render(<CommandPalette open={true} onOpenChange={onOpenChange} items={mockItems} />)
      
      fireEvent.click(screen.getByText('Search Users'))
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('adds item to recent items', () => {
      const onRecentItemsChange = jest.fn()
      render(
        <CommandPalette 
          open={true} 
          items={mockItems} 
          recentItems={[]}
          onRecentItemsChange={onRecentItemsChange}
        />
      )
      
      fireEvent.click(screen.getByText('Search Users'))
      
      expect(onRecentItemsChange).toHaveBeenCalledWith([mockItems[0]])
    })

    it('limits recent items to 5', () => {
      const existingRecent = Array.from({ length: 5 }, (_, i) => ({
        id: `existing-${i}`,
        label: `Existing ${i}`,
        onSelect: jest.fn(),
      }))
      
      const onRecentItemsChange = jest.fn()
      render(
        <CommandPalette 
          open={true} 
          items={mockItems} 
          recentItems={existingRecent}
          onRecentItemsChange={onRecentItemsChange}
        />
      )
      
      fireEvent.click(screen.getByText('Search Users'))
      
      const newRecent = onRecentItemsChange.mock.calls[0][0]
      expect(newRecent).toHaveLength(5)
      expect(newRecent[0]).toBe(mockItems[0])
    })

    it('does not duplicate items in recent list', () => {
      const onRecentItemsChange = jest.fn()
      render(
        <CommandPalette 
          open={true} 
          items={mockItems} 
          recentItems={[mockItems[0]]}
          onRecentItemsChange={onRecentItemsChange}
        />
      )
      
      fireEvent.click(screen.getByText('Search Users'))
      
      expect(onRecentItemsChange).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<CommandPalette open={true} loading={true} />)
      
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('does not show results when loading', () => {
      render(<CommandPalette open={true} loading={true} items={mockItems} />)
      
      expect(screen.queryByText('Search Users')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows default empty message when no results', () => {
      render(<CommandPalette open={true} items={[]} />)
      
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })

    it('shows custom empty message', () => {
      render(<CommandPalette open={true} items={[]} emptyMessage="Nothing here!" />)
      
      expect(screen.getByText('Nothing here!')).toBeInTheDocument()
    })

    it('shows empty state when search yields no results', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'nonexistent' } })
      
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('shows navigation hints when items are present', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      expect(screen.getByText('↑↓')).toBeInTheDocument()
      expect(screen.getByText('Enter')).toBeInTheDocument()
      expect(screen.getByText('Esc')).toBeInTheDocument()
    })

    it('does not show footer when loading', () => {
      render(<CommandPalette open={true} loading={true} items={mockItems} />)
      
      expect(screen.queryByText('↑↓')).not.toBeInTheDocument()
    })

    it('does not show footer when no items', () => {
      render(<CommandPalette open={true} items={[]} />)
      
      expect(screen.queryByText('↑↓')).not.toBeInTheDocument()
    })
  })

  describe('Scrolling', () => {
    it('scrolls selected item into view', async () => {
      const scrollIntoViewMock = jest.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock
      
      render(<CommandPalette open={true} items={mockItems} />)
      
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          block: 'nearest',
          behavior: 'smooth',
        })
      })
    })
  })

  describe('Search Value Management', () => {
    it('clears search when opened in uncontrolled mode', () => {
      const { rerender } = render(<CommandPalette open={false} />)
      
      rerender(<CommandPalette open={true} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('preserves search in controlled mode when reopened', () => {
      const { rerender } = render(<CommandPalette open={false} searchValue="preserved" />)
      
      rerender(<CommandPalette open={true} searchValue="preserved" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('preserved')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <CommandPalette open={true} items={mockItems.slice(0, 2)} />
      )
    })

    it('provides proper roles and labels', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(mockItems.length)
    })

    it('handles keyboard navigation accessibly', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      const input = screen.getByRole('textbox')
      input.focus()
      
      fireEvent.keyDown(document, { key: 'ArrowDown' })
      
      const selectedItem = screen.getAllByRole('button')[0]
      expect(selectedItem).toHaveClass('bg-accent')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<CommandPalette open={true} items={[]} />)
      
      expect(screen.getByText('No results found.')).toBeInTheDocument()
    })

    it('handles items without categories', () => {
      const itemsWithoutCategory = [
        { id: 'no-cat', label: 'No Category', onSelect: jest.fn() }
      ]
      
      render(<CommandPalette open={true} items={itemsWithoutCategory} />)
      
      expect(screen.getByText('No Category')).toBeInTheDocument()
    })

    it('handles rapid keyboard navigation', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      // Rapidly press arrow keys
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(document, { key: 'ArrowDown' })
      }
      
      // Should not crash and should respect bounds
      const buttons = screen.getAllByRole('button')
      const selectedButtons = buttons.filter(btn => btn.classList.contains('bg-accent'))
      expect(selectedButtons.length).toBe(1)
    })

    it('handles missing onOpenChange callback', () => {
      render(<CommandPalette open={true} items={mockItems} />)
      
      // Should not crash when trying to close
      fireEvent.keyDown(document, { key: 'Escape' })
      fireEvent.click(screen.getByText('Search Users'))
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<CommandPalette open={true} ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})