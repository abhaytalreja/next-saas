import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Divider } from './Divider'

expect.extend(toHaveNoViolations)

describe('Divider', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toBeInTheDocument()
    })

    it('renders as hr element by default', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider.tagName).toBe('HR')
    })

    it('renders with text content', () => {
      render(<Divider>Divider Text</Divider>)
      expect(screen.getByText('Divider Text')).toBeInTheDocument()
    })
  })

  describe('Orientation', () => {
    it('renders horizontal divider by default', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('w-full')
    })

    it('renders vertical divider', () => {
      render(<Divider orientation="vertical" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('h-full')
    })
  })

  describe('Variants', () => {
    it('renders solid variant by default', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-solid')
    })

    it('renders dashed variant', () => {
      render(<Divider variant="dashed" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-dashed')
    })

    it('renders dotted variant', () => {
      render(<Divider variant="dotted" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-dotted')
    })
  })


  describe('Thickness', () => {
    it('renders thin thickness by default', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-t-[1px]')
    })

    it('renders medium thickness', () => {
      render(<Divider thickness="medium" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-t-[2px]')
    })

    it('renders thick thickness', () => {
      render(<Divider thickness="thick" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('border-t-[3px]')
    })
  })

  describe('Spacing', () => {
    it('renders with default margins', () => {
      render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('my-4')
    })

    it('renders with small spacing', () => {
      render(<Divider spacing="sm" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('my-2')
    })

    it('renders with large spacing', () => {
      render(<Divider spacing="lg" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('my-6')
    })

    it('renders with extra large spacing', () => {
      render(<Divider spacing="xl" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('my-8')
    })
  })

  describe('Text Divider', () => {
    it('renders text divider with centered text', () => {
      render(<Divider>Section Title</Divider>)
      expect(screen.getByText('Section Title')).toBeInTheDocument()
      
      const container = screen.getByText('Section Title').parentElement
      expect(container).toHaveClass('flex', 'items-center')
    })

    it('renders text divider with left aligned text', () => {
      render(<Divider textAlign="left">Left Aligned</Divider>)
      const container = screen.getByText('Left Aligned').parentElement
      expect(container).toHaveClass('flex', 'items-center')
    })

    it('renders text divider with right aligned text', () => {
      render(<Divider textAlign="right">Right Aligned</Divider>)
      const container = screen.getByText('Right Aligned').parentElement
      expect(container).toHaveClass('flex', 'items-center')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Divider className="custom-class" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Divider 
          style={{ borderColor: 'purple' }} 
          data-testid="divider" 
        />
      )
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveStyle('border-color: purple')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for basic divider', async () => {
      const { container } = render(<Divider />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations for text divider', async () => {
      const { container } = render(<Divider>Section</Divider>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has proper role for semantic divider', () => {
      render(<Divider role="separator" data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveAttribute('role', 'separator')
    })

    it('supports ARIA attributes', () => {
      render(
        <Divider 
          aria-label="Section separator" 
          data-testid="divider" 
        />
      )
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveAttribute('aria-label', 'Section separator')
    })
  })

  describe('Responsive Behavior', () => {
    it('handles different orientations on different screen sizes', () => {
      render(
        <Divider 
          className="md:rotate-90 md:h-full md:w-px" 
          data-testid="divider" 
        />
      )
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('md:rotate-90', 'md:h-full', 'md:w-px')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty text gracefully', () => {
      render(<Divider></Divider>)
      // Should render as regular divider without text
      expect(screen.getByRole('separator', { hidden: true })).toBeInTheDocument()
    })

    it('handles very long text', () => {
      const longText = 'This is a very long divider text that might cause layout issues'
      render(<Divider>{longText}</Divider>)
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('handles React elements as children', () => {
      render(
        <Divider>
          <strong>Bold Section</strong>
        </Divider>
      )
      expect(screen.getByText('Bold Section')).toBeInTheDocument()
      expect(screen.getByRole('strong')).toBeInTheDocument()
    })

    it('handles numeric children', () => {
      render(<Divider>{123}</Divider>)
      expect(screen.getByText('123')).toBeInTheDocument()
    })
  })

})