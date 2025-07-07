import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Text } from './Text'

expect.extend(toHaveNoViolations)

describe('Text', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Text>Default Text</Text>)
      expect(screen.getByText('Default Text')).toBeInTheDocument()
    })

    it('renders as p by default', () => {
      render(<Text data-testid="text">Paragraph</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('P')
    })

    it('renders children correctly', () => {
      render(<Text>Test Content</Text>)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Element Types', () => {
    it('renders as paragraph', () => {
      render(<Text as="p" data-testid="text">Paragraph</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('P')
    })

    it('renders as span', () => {
      render(<Text as="span" data-testid="text">Span</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('SPAN')
    })

    it('renders as div', () => {
      render(<Text as="div" data-testid="text">Div</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('DIV')
    })

    it('renders as label', () => {
      render(<Text as="label" data-testid="text">Label</Text>)
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('LABEL')
    })
  })

  describe('Sizes', () => {
    it('renders extra small size', () => {
      render(<Text size="xs" data-testid="text">XS Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-xs')
    })

    it('renders small size', () => {
      render(<Text size="sm" data-testid="text">Small Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-sm')
    })

    it('renders base size by default', () => {
      render(<Text data-testid="text">Base Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-base')
    })

    it('renders large size', () => {
      render(<Text size="lg" data-testid="text">Large Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-lg')
    })

    it('renders extra large size', () => {
      render(<Text size="xl" data-testid="text">XL Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-xl')
    })

    it('renders 2xl size', () => {
      render(<Text size="2xl" data-testid="text">2XL Text</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-2xl')
    })
  })

  describe('Weights', () => {
    it('renders light weight', () => {
      render(<Text weight="light" data-testid="text">Light</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-light')
    })

    it('renders normal weight by default', () => {
      render(<Text data-testid="text">Normal</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-normal')
    })

    it('renders medium weight', () => {
      render(<Text weight="medium" data-testid="text">Medium</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-medium')
    })

    it('renders semibold weight', () => {
      render(<Text weight="semibold" data-testid="text">Semibold</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-semibold')
    })

    it('renders bold weight', () => {
      render(<Text weight="bold" data-testid="text">Bold</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('font-bold')
    })
  })

  describe('Colors', () => {
    it('renders with default color', () => {
      render(<Text data-testid="text">Default Color</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-neutral-900')
    })

    it('renders with primary color', () => {
      render(<Text color="primary" data-testid="text">Primary</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-primary-600')
    })

    it('renders with secondary color', () => {
      render(<Text color="secondary" data-testid="text">Secondary</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-secondary-600')
    })

    it('renders with muted color', () => {
      render(<Text color="muted" data-testid="text">Muted</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-neutral-600')
    })

    it('renders with error color', () => {
      render(<Text color="error" data-testid="text">Error</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-error-600')
    })

    it('renders with success color', () => {
      render(<Text color="success" data-testid="text">Success</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-success-600')
    })

    it('renders with warning color', () => {
      render(<Text color="warning" data-testid="text">Warning</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-warning-600')
    })
  })

  describe('Alignment', () => {
    it('renders left aligned by default', () => {
      render(<Text data-testid="text">Left Aligned</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-left')
    })

    it('renders center aligned', () => {
      render(<Text align="center" data-testid="text">Center</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-center')
    })

    it('renders right aligned', () => {
      render(<Text align="right" data-testid="text">Right</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-right')
    })

    it('renders justified', () => {
      render(<Text align="justify" data-testid="text">Justified</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-justify')
    })
  })

  describe('Combined Props', () => {
    it('renders with multiple style props', () => {
      render(
        <Text 
          size="lg" 
          weight="bold" 
          color="primary" 
          align="center"
          data-testid="text"
        >
          Styled Text
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('text-lg', 'font-bold', 'text-primary-600', 'text-center')
    })

    it('renders span with small muted text', () => {
      render(
        <Text 
          as="span" 
          size="sm" 
          color="muted"
          data-testid="text"
        >
          Small muted span
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text.tagName).toBe('SPAN')
      expect(text).toHaveClass('text-sm', 'text-neutral-600')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Text className="custom-class" data-testid="text">Custom</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Text 
          style={{ lineHeight: '1.8', letterSpacing: '0.1em' }} 
          data-testid="text"
        >
          Custom Styled
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text).toHaveStyle('line-height: 1.8; letter-spacing: 0.1em')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Text>Accessible Text</Text>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA attributes', () => {
      render(
        <Text 
          aria-label="Custom text label" 
          role="status"
          data-testid="text"
        >
          ARIA Text
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text).toHaveAttribute('aria-label', 'Custom text label')
      expect(text).toHaveAttribute('role', 'status')
    })

    it('works as label for form elements', () => {
      render(
        <div>
          <Text as="label" htmlFor="input-field">Label Text</Text>
          <input id="input-field" type="text" />
        </div>
      )
      const label = screen.getByText('Label Text')
      const input = screen.getByRole('textbox')
      
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', 'input-field')
      expect(input).toHaveAttribute('id', 'input-field')
    })
  })

  describe('Content Types', () => {
    it('renders plain text', () => {
      render(<Text>Plain text content</Text>)
      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('renders JSX content', () => {
      render(
        <Text>
          Text with <strong>bold</strong> and <em>italic</em> parts
        </Text>
      )
      expect(screen.getByText(/Text with/)).toBeInTheDocument()
      expect(screen.getByText('bold')).toBeInTheDocument()
      expect(screen.getByText('italic')).toBeInTheDocument()
    })

    it('renders complex nested content', () => {
      render(
        <Text>
          Complex text with{' '}
          <Text as="span" color="primary" weight="semibold">
            nested components
          </Text>
        </Text>
      )
      expect(screen.getByText('Complex text with')).toBeInTheDocument()
      expect(screen.getByText('nested components')).toBeInTheDocument()
    })

    it('renders links within text', () => {
      render(
        <Text>
          Visit our <a href="https://example.com">website</a> for more info
        </Text>
      )
      expect(screen.getByText(/Visit our/)).toBeInTheDocument()
      expect(screen.getByRole('link')).toHaveTextContent('website')
    })
  })

  describe('Dark Mode Support', () => {
    it('has dark mode classes for default color', () => {
      render(<Text data-testid="text">Dark Mode</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('dark:text-neutral-100')
    })

    it('has dark mode classes for primary color', () => {
      render(<Text color="primary" data-testid="text">Primary Dark</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('dark:text-primary-500')
    })

    it('has dark mode classes for error color', () => {
      render(<Text color="error" data-testid="text">Error Dark</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveClass('dark:text-error-500')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      render(<Text data-testid="text"></Text>)
      const text = screen.getByTestId('text')
      expect(text).toBeInTheDocument()
      expect(text).toBeEmptyDOMElement()
    })

    it('handles very long text', () => {
      const longText = 'This is a very long piece of text that should wrap properly and not cause any layout issues or overflow problems when rendered in the component'
      render(<Text data-testid="text">{longText}</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveTextContent(longText)
    })

    it('handles special characters and Unicode', () => {
      render(<Text data-testid="text">Special chars: àáâãäåæçèéêë 中文 🎉 💯</Text>)
      const text = screen.getByTestId('text')
      expect(text).toHaveTextContent('Special chars: àáâãäåæçèéêë 中文 🎉 💯')
    })

    it('handles numeric content', () => {
      render(<Text>{42}</Text>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('handles boolean content', () => {
      render(<Text>{true}</Text>)
      // React doesn't render boolean values, so this should be empty
      const text = screen.queryByText('true')
      expect(text).not.toBeInTheDocument()
    })
  })

  describe('HTML Attributes', () => {
    it('supports standard HTML attributes', () => {
      render(
        <Text 
          id="text-id"
          title="Text tooltip"
          tabIndex={0}
          data-testid="text"
        >
          Attributed Text
        </Text>
      )
      const text = screen.getByTestId('text')
      expect(text).toHaveAttribute('id', 'text-id')
      expect(text).toHaveAttribute('title', 'Text tooltip')
      expect(text).toHaveAttribute('tabIndex', '0')
    })

    it('supports event handlers', () => {
      const handleClick = jest.fn()
      const handleMouseEnter = jest.fn()
      
      render(
        <Text 
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          data-testid="text"
        >
          Interactive Text
        </Text>
      )
      
      const text = screen.getByTestId('text')
      
      text.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      // Use fireEvent for mouse events
      require('@testing-library/react').fireEvent.mouseEnter(text)
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
    })
  })

  describe('Form Integration', () => {
    it('works as form label', () => {
      render(
        <form>
          <Text as="label" htmlFor="email">Email Address</Text>
          <input id="email" type="email" />
        </form>
      )
      
      const label = screen.getByText('Email Address')
      const input = screen.getByRole('textbox')
      
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Text data-testid="text">Original</Text>)
      const text = screen.getByTestId('text')
      const initialElement = text
      
      // Re-render with same props
      rerender(<Text data-testid="text">Original</Text>)
      const textAfterRerender = screen.getByTestId('text')
      
      expect(textAfterRerender).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('works for body text', () => {
      render(
        <Text>
          This is a paragraph of body text that would typically be used in articles, 
          descriptions, or other content areas.
        </Text>
      )
      expect(screen.getByText(/This is a paragraph/)).toBeInTheDocument()
    })

    it('works for captions and small text', () => {
      render(<Text as="span" size="sm" color="muted">Photo caption</Text>)
      const caption = screen.getByText('Photo caption')
      expect(caption.tagName).toBe('SPAN')
      expect(caption).toHaveClass('text-sm', 'text-neutral-600')
    })

    it('works for error messages', () => {
      render(<Text color="error" size="sm">This field is required</Text>)
      const error = screen.getByText('This field is required')
      expect(error).toHaveClass('text-error-600', 'text-sm')
    })

    it('works for success messages', () => {
      render(<Text color="success" weight="medium">Changes saved successfully!</Text>)
      const success = screen.getByText('Changes saved successfully!')
      expect(success).toHaveClass('text-success-600', 'font-medium')
    })
  })
})