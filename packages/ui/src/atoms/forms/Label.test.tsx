import React from 'react'
import { render, screen, fireEvent } from '../../test-utils'
import { Label } from './Label'
import { testAccessibility } from '../../test-utils'

describe('Label Component', () => {
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Label>Test Label</Label>)
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Label className="custom-class">Custom Label</Label>)
      expect(screen.getByText('Custom Label')).toHaveClass('custom-class')
    })

    it('renders as label element', () => {
      render(<Label>Label Text</Label>)
      const label = screen.getByText('Label Text')
      expect(label.tagName).toBe('LABEL')
    })

    it('accepts htmlFor prop', () => {
      render(<Label htmlFor="test-input">Label for input</Label>)
      expect(screen.getByText('Label for input')).toHaveAttribute('for', 'test-input')
    })
  })

  describe('Size Variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(<Label size={size}>Size {size} Label</Label>)
        const label = screen.getByText(`Size ${size} Label`)
        expect(label).toBeInTheDocument()
        
        // Check that appropriate text size classes are applied
        if (size === 'sm') {
          expect(label).toHaveClass('text-xs')
        } else if (size === 'md') {
          expect(label).toHaveClass('text-sm')
        } else if (size === 'lg') {
          expect(label).toHaveClass('text-base')
        }
      })
    })

    it('defaults to medium size', () => {
      render(<Label>Default Size</Label>)
      expect(screen.getByText('Default Size')).toHaveClass('text-sm')
    })
  })

  describe('Variant Styles', () => {
    const variants = ['default', 'muted', 'destructive'] as const

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Label variant={variant}>Variant {variant} Label</Label>)
        const label = screen.getByText(`Variant ${variant} Label`)
        expect(label).toBeInTheDocument()

        // Check that appropriate color classes are applied
        if (variant === 'default') {
          expect(label).toHaveClass('text-gray-700', 'dark:text-gray-300')
        } else if (variant === 'muted') {
          expect(label).toHaveClass('text-gray-500', 'dark:text-gray-400')
        } else if (variant === 'destructive') {
          expect(label).toHaveClass('text-red-600', 'dark:text-red-400')
        }
      })
    })

    it('defaults to default variant', () => {
      render(<Label>Default Variant</Label>)
      expect(screen.getByText('Default Variant')).toHaveClass('text-gray-700', 'dark:text-gray-300')
    })
  })

  describe('Required Indicator', () => {
    it('shows asterisk when required is true', () => {
      render(<Label required>Required Field</Label>)
      const label = screen.getByText('Required Field')
      expect(label).toBeInTheDocument()
      
      // Check for the asterisk span
      const asterisk = label.querySelector('span')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk).toHaveTextContent('*')
      expect(asterisk).toHaveClass('text-red-500', 'ml-1')
    })

    it('does not show asterisk when required is false', () => {
      render(<Label required={false}>Optional Field</Label>)
      const label = screen.getByText('Optional Field')
      expect(label.querySelector('span')).not.toBeInTheDocument()
    })

    it('does not show asterisk by default', () => {
      render(<Label>Default Field</Label>)
      const label = screen.getByText('Default Field')
      expect(label.querySelector('span')).not.toBeInTheDocument()
    })
  })

  describe('Combined Props', () => {
    it('handles multiple props together', () => {
      render(
        <Label
          size="lg"
          variant="destructive"
          required
          htmlFor="complex-input"
          className="additional-class"
        >
          Complex Label
        </Label>
      )
      
      const label = screen.getByText('Complex Label')
      expect(label).toHaveClass('text-base') // lg size
      expect(label).toHaveClass('text-red-600', 'dark:text-red-400') // destructive variant
      expect(label).toHaveClass('additional-class') // custom class
      expect(label).toHaveAttribute('for', 'complex-input')
      
      // Check for required asterisk
      const asterisk = label.querySelector('span')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk).toHaveTextContent('*')
    })
  })

  describe('Form Integration', () => {
    it('works correctly with input element', () => {
      render(
        <div>
          <Label htmlFor="email-input">Email Address</Label>
          <input id="email-input" type="email" />
        </div>
      )
      
      const label = screen.getByText('Email Address')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email-input')
      expect(input).toHaveAttribute('id', 'email-input')
      
      // Clicking label should focus input
      fireEvent.click(label)
      expect(input).toHaveFocus()
    })

    it('maintains association with form control', () => {
      render(
        <div>
          <Label htmlFor="username">Username</Label>
          <input id="username" type="text" />
        </div>
      )
      
      const input = screen.getByLabelText('Username')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <div>
          <Label htmlFor="accessible-input">Accessible Label</Label>
          <input id="accessible-input" type="text" />
        </div>
      )
    })

    it('provides proper labeling for form controls', () => {
      render(
        <form>
          <Label htmlFor="form-input">Form Input Label</Label>
          <input id="form-input" type="text" />
        </form>
      )
      
      const input = screen.getByLabelText('Form Input Label')
      expect(input).toBeInTheDocument()
    })

    it('supports additional ARIA attributes', () => {
      render(
        <Label 
          htmlFor="aria-input" 
          aria-describedby="help-text"
          data-testid="aria-label"
        >
          ARIA Label
        </Label>
      )
      
      const label = screen.getByTestId('aria-label')
      expect(label).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('Event Handling', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Label onClick={handleClick}>Clickable Label</Label>)
      
      fireEvent.click(screen.getByText('Clickable Label'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard events', () => {
      const handleKeyDown = jest.fn()
      render(<Label onKeyDown={handleKeyDown}>Keyboard Label</Label>)
      
      fireEvent.keyDown(screen.getByText('Keyboard Label'), { key: 'Enter' })
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(<Label ref={ref}>Ref Label</Label>)
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    })

    it('allows ref access to DOM methods', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(<Label ref={ref}>Ref Access Label</Label>)
      
      expect(ref.current?.tagName).toBe('LABEL')
      expect(ref.current?.textContent).toBe('Ref Access Label')
    })
  })

  describe('Content Handling', () => {
    it('renders text content correctly', () => {
      render(<Label>Simple text content</Label>)
      expect(screen.getByText('Simple text content')).toBeInTheDocument()
    })

    it('renders JSX content correctly', () => {
      render(
        <Label>
          <span>Complex</span> <strong>JSX</strong> content
        </Label>
      )
      
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('JSX')).toBeInTheDocument()
      expect(screen.getByText('content')).toBeInTheDocument()
    })

    it('handles empty content gracefully', () => {
      render(<Label data-testid="empty-label"></Label>)
      expect(screen.getByTestId('empty-label')).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('applies base classes correctly', () => {
      render(<Label>Base Classes</Label>)
      const label = screen.getByText('Base Classes')
      
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'leading-none',
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70'
      )
    })

    it('merges custom classes with base classes', () => {
      render(<Label className="custom-margin custom-padding">Merged Classes</Label>)
      const label = screen.getByText('Merged Classes')
      
      // Should have both base and custom classes
      expect(label).toHaveClass('text-sm', 'font-medium') // base classes
      expect(label).toHaveClass('custom-margin', 'custom-padding') // custom classes
    })
  })
})