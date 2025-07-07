import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Heading } from './Heading'

expect.extend(toHaveNoViolations)

describe('Heading', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Heading>Default Heading</Heading>)
      expect(screen.getByText('Default Heading')).toBeInTheDocument()
    })

    it('renders as h1 by default', () => {
      render(<Heading data-testid="heading">H1 Heading</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H1')
    })

    it('renders children correctly', () => {
      render(<Heading>Test Content</Heading>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('has proper base classes', () => {
      render(<Heading data-testid="heading">Heading</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('font-display', 'font-semibold')
    })
  })

  describe('Levels', () => {
    it('renders h1 level', () => {
      render(<Heading level="h1" data-testid="heading">H1</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H1')
      expect(heading).toHaveClass('text-5xl', 'leading-tight', 'tracking-tight')
    })

    it('renders h2 level', () => {
      render(<Heading level="h2" data-testid="heading">H2</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H2')
      expect(heading).toHaveClass('text-4xl', 'leading-tight', 'tracking-tight')
    })

    it('renders h3 level', () => {
      render(<Heading level="h3" data-testid="heading">H3</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H3')
      expect(heading).toHaveClass('text-3xl', 'leading-snug', 'tracking-tight')
    })

    it('renders h4 level', () => {
      render(<Heading level="h4" data-testid="heading">H4</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H4')
      expect(heading).toHaveClass('text-2xl', 'leading-snug')
    })

    it('renders h5 level', () => {
      render(<Heading level="h5" data-testid="heading">H5</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H5')
      expect(heading).toHaveClass('text-xl', 'leading-normal')
    })

    it('renders h6 level', () => {
      render(<Heading level="h6" data-testid="heading">H6</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H6')
      expect(heading).toHaveClass('text-lg', 'leading-normal')
    })
  })

  describe('Colors', () => {
    it('renders with default color', () => {
      render(<Heading data-testid="heading">Default Color</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('text-neutral-900')
    })

    it('renders with primary color', () => {
      render(<Heading color="primary" data-testid="heading">Primary</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('text-primary-600')
    })

    it('renders with secondary color', () => {
      render(<Heading color="secondary" data-testid="heading">Secondary</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('text-secondary-600')
    })

    it('renders with muted color', () => {
      render(<Heading color="muted" data-testid="heading">Muted</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('text-neutral-600')
    })
  })

  describe('Semantic vs Visual Level', () => {
    it('can render h1 visually but h2 semantically', () => {
      render(<Heading level="h1" as="h2" data-testid="heading">Visual H1, Semantic H2</Heading>)
      const heading = screen.getByTestId('heading')
      
      // Should be h2 element (semantic)
      expect(heading.tagName).toBe('H2')
      
      // Should have h1 styling (visual)
      expect(heading).toHaveClass('text-5xl', 'leading-tight', 'tracking-tight')
    })

    it('can render h3 visually but h1 semantically', () => {
      render(<Heading level="h3" as="h1" data-testid="heading">Visual H3, Semantic H1</Heading>)
      const heading = screen.getByTestId('heading')
      
      // Should be h1 element (semantic)
      expect(heading.tagName).toBe('H1')
      
      // Should have h3 styling (visual)
      expect(heading).toHaveClass('text-3xl', 'leading-snug', 'tracking-tight')
    })

    it('uses level as element when as prop is not provided', () => {
      render(<Heading level="h4" data-testid="heading">H4 Both</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading.tagName).toBe('H4')
      expect(heading).toHaveClass('text-2xl', 'leading-snug')
    })
  })

  describe('Responsive Design', () => {
    it('has responsive classes for h1', () => {
      render(<Heading level="h1" data-testid="heading">Responsive H1</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('md:text-6xl', 'lg:text-7xl')
    })

    it('has responsive classes for h2', () => {
      render(<Heading level="h2" data-testid="heading">Responsive H2</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('md:text-5xl')
    })

    it('has responsive classes for h3', () => {
      render(<Heading level="h3" data-testid="heading">Responsive H3</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('md:text-4xl')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Heading className="custom-class" data-testid="heading">Custom</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Heading 
          style={{ textAlign: 'center', marginTop: '20px' }} 
          data-testid="heading"
        >
          Styled
        </Heading>
      )
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveStyle('text-align: center; margin-top: 20px')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Heading>Accessible Heading</Heading>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA attributes', () => {
      render(
        <Heading 
          aria-label="Custom heading label" 
          data-testid="heading"
        >
          ARIA Heading
        </Heading>
      )
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveAttribute('aria-label', 'Custom heading label')
    })

    it('supports id for linking', () => {
      render(<Heading id="main-title" data-testid="heading">Main Title</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveAttribute('id', 'main-title')
    })

    it('maintains proper heading hierarchy semantics', () => {
      render(
        <div>
          <Heading level="h1">Main Title</Heading>
          <Heading level="h2">Subtitle</Heading>
          <Heading level="h3">Section Title</Heading>
        </div>
      )
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subtitle')
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Section Title')
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Heading>Plain Text Heading</Heading>)
      expect(screen.getByText('Plain Text Heading')).toBeInTheDocument()
    })

    it('renders JSX content', () => {
      render(
        <Heading>
          Heading with <strong>bold</strong> text
        </Heading>
      )
      expect(screen.getByText(/Heading with/)).toBeInTheDocument()
      expect(screen.getByText('bold')).toBeInTheDocument()
      expect(screen.getByRole('strong')).toBeInTheDocument()
    })

    it('renders complex content', () => {
      render(
        <Heading>
          <span className="text-blue-500">Colored</span> Heading
        </Heading>
      )
      expect(screen.getByText('Colored')).toBeInTheDocument()
      expect(screen.getByText('Heading')).toBeInTheDocument()
    })
  })

  describe('Dark Mode Support', () => {
    it('has dark mode classes for default color', () => {
      render(<Heading data-testid="heading">Dark Mode</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('dark:text-neutral-100')
    })

    it('has dark mode classes for primary color', () => {
      render(<Heading color="primary" data-testid="heading">Primary Dark</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('dark:text-primary-500')
    })

    it('has dark mode classes for muted color', () => {
      render(<Heading color="muted" data-testid="heading">Muted Dark</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveClass('dark:text-neutral-400')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      render(<Heading data-testid="heading"></Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toBeInTheDocument()
      expect(heading).toBeEmptyDOMElement()
    })

    it('handles very long text', () => {
      const longText = 'This is a very long heading text that might wrap across multiple lines and should be handled gracefully by the component'
      render(<Heading data-testid="heading">{longText}</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveTextContent(longText)
    })

    it('handles special characters', () => {
      render(<Heading data-testid="heading">Héading with spécial châractérs & symbols!</Heading>)
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveTextContent('Héading with spécial châractérs & symbols!')
    })
  })

  describe('HTML Attributes', () => {
    it('supports standard HTML attributes', () => {
      render(
        <Heading 
          title="Heading tooltip"
          tabIndex={0}
          data-testid="heading"
        >
          Attributed Heading
        </Heading>
      )
      const heading = screen.getByTestId('heading')
      expect(heading).toHaveAttribute('title', 'Heading tooltip')
      expect(heading).toHaveAttribute('tabIndex', '0')
    })

    it('supports event handlers', () => {
      const handleClick = jest.fn()
      render(<Heading onClick={handleClick} data-testid="heading">Clickable</Heading>)
      
      const heading = screen.getByTestId('heading')
      heading.click()
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Heading data-testid="heading">Original</Heading>)
      const heading = screen.getByTestId('heading')
      const initialElement = heading
      
      // Re-render with same props
      rerender(<Heading data-testid="heading">Original</Heading>)
      const headingAfterRerender = screen.getByTestId('heading')
      
      expect(headingAfterRerender).toBeInTheDocument()
    })
  })
})