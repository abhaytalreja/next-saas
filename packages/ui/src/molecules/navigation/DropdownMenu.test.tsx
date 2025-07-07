import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { 
  DropdownMenu, 
  DropdownTrigger, 
  DropdownContent, 
  DropdownItem, 
  DropdownCheckboxItem, 
  DropdownSeparator, 
  DropdownLabel 
} from './DropdownMenu'
import { testAccessibility } from '../../test-utils'

describe('DropdownMenu Component', () => {
  const BasicDropdown = ({ defaultOpen = false }: { defaultOpen?: boolean }) => (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownTrigger>Open Menu</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownItem>Item 2</DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive>Delete</DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  )

  describe('DropdownMenu Root', () => {
    it('renders correctly', () => {
      render(<BasicDropdown />)
      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument()
    })

    it('starts closed by default', () => {
      render(<BasicDropdown />)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('starts open when defaultOpen is true', () => {
      render(<BasicDropdown defaultOpen />)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('calls onOpenChange when state changes', () => {
      const onOpenChange = jest.fn()
      render(
        <DropdownMenu onOpenChange={onOpenChange}>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe('DropdownTrigger', () => {
    it('renders as button by default', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button', { name: 'Open Menu' })
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('has proper ARIA attributes', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    })

    it('updates aria-expanded when opened', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      
      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('shows chevron icon that rotates when open', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      const chevron = trigger.querySelector('svg')
      
      expect(chevron).toBeInTheDocument()
      expect(chevron).not.toHaveClass('rotate-180')
      
      fireEvent.click(trigger)
      expect(chevron).toHaveClass('rotate-180')
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu>
          <DropdownTrigger className="custom-trigger">Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByRole('button')).toHaveClass('custom-trigger')
    })

    it('supports asChild prop', () => {
      render(
        <DropdownMenu>
          <DropdownTrigger asChild>
            <div>Custom Trigger</div>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const customTrigger = screen.getByText('Custom Trigger')
      expect(customTrigger.tagName).toBe('DIV')
      expect(customTrigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles menu on click', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      
      // Open menu
      fireEvent.click(trigger)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      
      // Close menu
      fireEvent.click(trigger)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })
  })

  describe('DropdownContent', () => {
    it('renders when menu is open', () => {
      render(<BasicDropdown defaultOpen />)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('does not render when menu is closed', () => {
      render(<BasicDropdown />)
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('closes on click outside', async () => {
      render(
        <div>
          <BasicDropdown defaultOpen />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      
      fireEvent.mouseDown(screen.getByTestId('outside'))
      
      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
      })
    })

    it('closes on Escape key', () => {
      render(<BasicDropdown defaultOpen />)
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('applies alignment classes', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent align="center" data-testid="content">
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('left-1/2', '-translate-x-1/2')
    })

    it('applies side positioning classes', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent side="top" data-testid="content">
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('bottom-full')
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent className="custom-content" data-testid="content">
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByTestId('content')).toHaveClass('custom-content')
    })
  })

  describe('DropdownItem', () => {
    it('renders correctly', () => {
      render(<BasicDropdown defaultOpen />)
      expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument()
    })

    it('calls onClick when clicked', () => {
      const onClick = jest.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem onClick={onClick}>Clickable Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      fireEvent.click(screen.getByRole('button', { name: 'Clickable Item' }))
      expect(onClick).toHaveBeenCalled()
    })

    it('closes menu after click', () => {
      render(<BasicDropdown defaultOpen />)
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Item 1' }))
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('applies destructive styling', () => {
      render(<BasicDropdown defaultOpen />)
      const destructiveItem = screen.getByRole('button', { name: 'Delete' })
      expect(destructiveItem).toHaveClass('text-destructive')
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem className="custom-item">Custom Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByRole('button', { name: 'Custom Item' })).toHaveClass('custom-item')
    })

    it('supports disabled state', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem disabled>Disabled Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const disabledItem = screen.getByRole('button', { name: 'Disabled Item' })
      expect(disabledItem).toBeDisabled()
      expect(disabledItem).toHaveClass('disabled:opacity-50')
    })
  })

  describe('DropdownCheckboxItem', () => {
    it('renders with checkbox functionality', () => {
      const onCheckedChange = jest.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
              Checkbox Item
            </DropdownCheckboxItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const checkboxItem = screen.getByRole('button', { name: 'Checkbox Item' })
      expect(checkboxItem).toBeInTheDocument()
      
      fireEvent.click(checkboxItem)
      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('shows check icon when checked', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked={true}>
              Checked Item
            </DropdownCheckboxItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const checkIcon = document.querySelector('svg')
      expect(checkIcon).toBeInTheDocument()
    })

    it('does not show check icon when unchecked', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem checked={false}>
              Unchecked Item
            </DropdownCheckboxItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      // Check icon should not be present
      const checkboxItem = screen.getByRole('button')
      const checkIcon = checkboxItem.querySelector('svg')
      expect(checkIcon).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem className="custom-checkbox">
              Checkbox
            </DropdownCheckboxItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByRole('button')).toHaveClass('custom-checkbox')
    })

    it('prevents default on click', () => {
      const onCheckedChange = jest.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownCheckboxItem onCheckedChange={onCheckedChange}>
              Checkbox Item
            </DropdownCheckboxItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const checkboxItem = screen.getByRole('button')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      const preventDefault = jest.fn()
      Object.defineProperty(clickEvent, 'preventDefault', { value: preventDefault })
      
      fireEvent(checkboxItem, clickEvent)
      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('DropdownSeparator', () => {
    it('renders correctly', () => {
      render(<BasicDropdown defaultOpen />)
      const separators = document.querySelectorAll('.h-px')
      expect(separators.length).toBeGreaterThan(0)
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownSeparator className="custom-separator" data-testid="separator" />
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByTestId('separator')).toHaveClass('custom-separator')
    })
  })

  describe('DropdownLabel', () => {
    it('renders correctly', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Section Label</DropdownLabel>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByText('Section Label')).toBeInTheDocument()
    })

    it('applies label styling', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>Label</DropdownLabel>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const label = screen.getByText('Label')
      expect(label).toHaveClass('font-semibold')
    })

    it('applies custom className', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel className="custom-label">Custom Label</DropdownLabel>
          </DropdownContent>
        </DropdownMenu>
      )
      
      expect(screen.getByText('Custom Label')).toHaveClass('custom-label')
    })
  })

  describe('Complex Composition', () => {
    it('renders complex dropdown with all components', () => {
      render(
        <DropdownMenu>
          <DropdownTrigger>Actions</DropdownTrigger>
          <DropdownContent>
            <DropdownLabel>User Actions</DropdownLabel>
            <DropdownItem>Edit Profile</DropdownItem>
            <DropdownCheckboxItem>Enable Notifications</DropdownCheckboxItem>
            <DropdownSeparator />
            <DropdownItem>Settings</DropdownItem>
            <DropdownItem destructive>Sign Out</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      
      const trigger = screen.getByRole('button', { name: 'Actions' })
      fireEvent.click(trigger)
      
      expect(screen.getByText('User Actions')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enable Notifications' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('throws error when components used outside context', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = jest.fn()
      
      expect(() => {
        render(<DropdownTrigger>Invalid</DropdownTrigger>)
      }).toThrow('Dropdown components must be used within a DropdownMenu')
      
      console.error = originalError
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<BasicDropdown />)
    })

    it('supports keyboard navigation', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      
      trigger.focus()
      expect(trigger).toHaveFocus()
      
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })

    it('maintains focus management', () => {
      render(<BasicDropdown />)
      const trigger = screen.getByRole('button')
      
      fireEvent.click(trigger)
      const firstItem = screen.getByRole('button', { name: 'Item 1' })
      
      firstItem.focus()
      expect(firstItem).toHaveFocus()
    })
  })

  describe('Forwarded Refs', () => {
    it('forwards ref for DropdownTrigger', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(
        <DropdownMenu>
          <DropdownTrigger ref={ref}>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })

    it('forwards ref for DropdownContent', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent ref={ref}>
            <DropdownItem>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards ref for DropdownItem', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(
        <DropdownMenu defaultOpen>
          <DropdownTrigger>Trigger</DropdownTrigger>
          <DropdownContent>
            <DropdownItem ref={ref}>Item</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      )
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('Controlled State', () => {
    it('supports controlled open state', () => {
      const ControlledDropdown = () => {
        const [open, setOpen] = React.useState(false)
        return (
          <div>
            <button onClick={() => setOpen(true)}>External Open</button>
            <DropdownMenu onOpenChange={setOpen}>
              <DropdownTrigger>Trigger</DropdownTrigger>
              <DropdownContent>
                <DropdownItem>Item</DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          </div>
        )
      }
      
      render(<ControlledDropdown />)
      
      expect(screen.queryByText('Item')).not.toBeInTheDocument()
      
      fireEvent.click(screen.getByRole('button', { name: 'External Open' }))
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })
})