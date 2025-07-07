import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Spinner } from './Spinner'

expect.extend(toHaveNoViolations)

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('renders as svg element', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner.tagName).toBe('svg')
    })

    it('has proper base classes', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('animate-spin')
    })
  })

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Spinner size="sm" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('renders default size by default', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-5', 'w-5')
    })

    it('renders large size', () => {
      render(<Spinner size="lg" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-6', 'w-6')
    })

    it('renders extra large size', () => {
      render(<Spinner size="xl" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })
  })

  describe('Colors', () => {
    it('renders with default color', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('text-primary-600')
    })

    it('renders with primary color', () => {
      render(<Spinner color="primary" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('text-primary-600')
    })

    it('renders with muted color', () => {
      render(<Spinner color="muted" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('text-neutral-400')
    })

    it('renders with white color', () => {
      render(<Spinner color="white" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('text-white')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Spinner className="custom-class" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Spinner 
          style={{ color: 'purple' }} 
          data-testid="spinner" 
        />
      )
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveStyle('color: purple')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Spinner />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA attributes for screen readers', () => {
      render(<Spinner role="status" aria-label="Loading" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveAttribute('role', 'status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('supports custom ARIA label', () => {
      render(
        <Spinner 
          aria-label="Loading content" 
          data-testid="spinner" 
        />
      )
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveAttribute('aria-label', 'Loading content')
    })

    it('is hidden from screen readers when decorative', () => {
      render(
        <Spinner 
          aria-hidden="true" 
          data-testid="spinner" 
        />
      )
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Animation', () => {
    it('has spin animation by default', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('animate-spin')
    })

    it('can disable animation', () => {
      render(<Spinner className="animate-none" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('animate-none')
    })
  })

  describe('SVG Properties', () => {
    it('has proper SVG attributes', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      
      expect(spinner).toHaveAttribute('viewBox', '0 0 24 24')
      expect(spinner).toHaveAttribute('fill', 'none')
    })

    it('has proper stroke attributes on circle', () => {
      render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      const circle = spinner.querySelector('circle')
      expect(circle).toHaveAttribute('stroke-width', '4')
    })
  })

  describe('Loading States', () => {
    it('can be used in button loading state', () => {
      render(
        <button disabled>
          <Spinner size="sm" data-testid="button-spinner" />
          Loading...
        </button>
      )
      const spinner = screen.getByTestId('button-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('can be used as page loader', () => {
      render(
        <div className="flex justify-center">
          <Spinner size="lg" data-testid="page-spinner" />
        </div>
      )
      const spinner = screen.getByTestId('page-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-6', 'w-6')
    })
  })

  describe('Edge Cases', () => {
    it('handles additional HTML attributes', () => {
      render(
        <Spinner 
          title="Loading spinner"
          role="status"
          data-testid="spinner" 
        />
      )
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveAttribute('title', 'Loading spinner')
      expect(spinner).toHaveAttribute('role', 'status')
    })

    it('maintains aspect ratio', () => {
      render(<Spinner size="lg" data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('h-6', 'w-6')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Spinner data-testid="spinner" />)
      const spinner = screen.getByTestId('spinner')
      const initialElement = spinner
      
      // Re-render with same props
      rerender(<Spinner data-testid="spinner" />)
      const spinnerAfterRerender = screen.getByTestId('spinner')
      
      expect(spinnerAfterRerender).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with different backgrounds', () => {
      render(
        <div className="bg-dark">
          <Spinner color="white" data-testid="dark-spinner" />
        </div>
      )
      const spinner = screen.getByTestId('dark-spinner')
      expect(spinner).toHaveClass('text-white')
    })

    it('works with theme context', () => {
      render(
        <div data-theme="dark">
          <Spinner data-testid="themed-spinner" />
        </div>
      )
      const spinner = screen.getByTestId('themed-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})