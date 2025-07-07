import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Badge } from './Badge'

expect.extend(toHaveNoViolations)

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>)
      expect(screen.getByText('Default Badge')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(<Badge>Test Content</Badge>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders as div by default', () => {
      render(<Badge data-testid="badge">Badge</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge.tagName).toBe('DIV')
    })
  })

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-primary-100', 'text-primary-800')
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-secondary-100', 'text-secondary-800')
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-error-100', 'text-error-800')
    })

    it('renders success variant', () => {
      render(<Badge variant="success" data-testid="badge">Success</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-success-100', 'text-success-800')
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning" data-testid="badge">Warning</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-warning-100', 'text-warning-800')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('border', 'border-neutral-200')
    })

    it('renders ghost variant', () => {
      render(<Badge variant="ghost" data-testid="badge">Ghost</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-neutral-700')
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm" data-testid="badge">Small</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-[10px]', 'px-2', 'py-0.5')
    })

    it('renders default size by default', () => {
      render(<Badge data-testid="badge">Default</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-xs', 'px-2.5', 'py-0.5')
    })

    it('renders large size', () => {
      render(<Badge size="lg" data-testid="badge">Large</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('text-sm', 'px-3', 'py-1')
    })
  })

  describe('Shape', () => {
    it('renders rounded shape by default', () => {
      render(<Badge data-testid="badge">Rounded</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('rounded-full')
    })
  })

  describe('Removable Badge', () => {
    it('renders close button when removable', () => {
      const onRemove = jest.fn()
      render(
        <Badge removable onRemove={onRemove} data-testid="badge">
          Removable
        </Badge>
      )
      
      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Remove')
    })

    it('calls onRemove when close button is clicked', () => {
      const onRemove = jest.fn()
      render(
        <Badge removable onRemove={onRemove}>
          Removable
        </Badge>
      )
      
      const closeButton = screen.getByRole('button')
      closeButton.click()
      
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('does not render close button when not removable', () => {
      render(<Badge>Not Removable</Badge>)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })


  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class" data-testid="badge">Custom</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Badge style={{ backgroundColor: 'purple' }} data-testid="badge">
          Custom Style
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveStyle('background-color: purple')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Badge>Accessible Badge</Badge>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper ARIA label for removable badge', () => {
      const onRemove = jest.fn()
      render(
        <Badge removable onRemove={onRemove}>
          Removable Badge
        </Badge>
      )
      
      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveAttribute('aria-label', 'Remove')
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Badge aria-label="Custom label" data-testid="badge">
          Badge with ARIA
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('aria-label', 'Custom label')
    })
  })

  describe('Interactive States', () => {
    it('supports onClick handler', () => {
      const handleClick = jest.fn()
      render(
        <Badge onClick={handleClick} data-testid="badge">
          Clickable Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('badge')
      badge.click()
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Badge data-testid="badge"></Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toBeInTheDocument()
    })

    it('handles very long text', () => {
      const longText = 'This is a very long badge text that might cause overflow issues'
      render(<Badge data-testid="badge">{longText}</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent(longText)
    })

    it('handles numeric children', () => {
      render(<Badge data-testid="badge">{42}</Badge>)
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveTextContent('42')
    })

    it('handles React elements as children', () => {
      render(
        <Badge data-testid="badge">
          <strong>Bold Text</strong>
        </Badge>
      )
      const badge = screen.getByTestId('badge')
      expect(badge.querySelector('strong')).toBeInTheDocument()
    })
  })
})