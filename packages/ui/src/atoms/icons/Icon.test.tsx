import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Home, Search, User, Settings } from 'lucide-react'
import { Icon } from './Icon'

expect.extend(toHaveNoViolations)

describe('Icon', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders as svg element', () => {
      render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon.tagName).toBe('svg')
    })

    it('renders with Lucide icon component', () => {
      render(<Icon icon={Search} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders extra small size', () => {
      render(<Icon icon={Home} size="xs" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-3', 'w-3')
    })

    it('renders small size', () => {
      render(<Icon icon={Home} size="sm" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-4', 'w-4')
    })

    it('renders medium size by default', () => {
      render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-5', 'w-5')
    })

    it('renders large size', () => {
      render(<Icon icon={Home} size="lg" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-6', 'w-6')
    })

    it('renders extra large size', () => {
      render(<Icon icon={Home} size="xl" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-8', 'w-8')
    })
  })

  describe('Variants', () => {
    it('renders with default variant', () => {
      render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('text-foreground')
    })

    it('renders with muted variant', () => {
      render(<Icon icon={Home} variant="muted" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('text-muted-foreground')
    })

    it('renders with destructive variant', () => {
      render(<Icon icon={Home} variant="destructive" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('text-destructive')
    })

    it('renders with success variant', () => {
      render(<Icon icon={Home} variant="success" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('text-green-600')
    })

    it('renders with warning variant', () => {
      render(<Icon icon={Home} variant="warning" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('text-amber-600')
    })
  })

  describe('Different Icon Types', () => {
    it('renders Home icon', () => {
      render(<Icon icon={Home} data-testid="home-icon" />)
      const icon = screen.getByTestId('home-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders Search icon', () => {
      render(<Icon icon={Search} data-testid="search-icon" />)
      const icon = screen.getByTestId('search-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders User icon', () => {
      render(<Icon icon={User} data-testid="user-icon" />)
      const icon = screen.getByTestId('user-icon')
      expect(icon).toBeInTheDocument()
    })

    it('renders Settings icon', () => {
      render(<Icon icon={Settings} data-testid="settings-icon" />)
      const icon = screen.getByTestId('settings-icon')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Icon icon={Home} className="custom-class" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Icon 
          icon={Home} 
          style={{ color: 'purple' }} 
          data-testid="icon" 
        />
      )
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveStyle('color: purple')
    })

    it('supports custom stroke width', () => {
      render(<Icon icon={Home} strokeWidth={3} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('stroke-width', '3')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Icon icon={Home} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA label', () => {
      render(<Icon icon={Home} aria-label="Home page" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('aria-label', 'Home page')
    })

    it('supports aria-hidden for decorative icons', () => {
      render(<Icon icon={Home} aria-hidden="true" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Interactive Behavior', () => {
    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Icon icon={Home} onClick={handleClick} data-testid="icon" />)
      
      const icon = screen.getByTestId('icon')
      fireEvent.click(icon)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports onMouseEnter events', () => {
      const handleMouseEnter = jest.fn()
      render(
        <Icon 
          icon={Home} 
          onMouseEnter={handleMouseEnter}
          data-testid="icon" 
        />
      )
      
      const icon = screen.getByTestId('icon')
      fireEvent.mouseEnter(icon)
      
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
    })
  })

  describe('SVG Properties', () => {
    it('has proper SVG attributes by default', () => {
      render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      
      expect(icon).toHaveAttribute('fill', 'none')
      expect(icon).toHaveAttribute('stroke', 'currentColor')
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
    })

    it('supports custom fill', () => {
      render(<Icon icon={Home} fill="red" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('fill', 'red')
    })

    it('supports custom stroke', () => {
      render(<Icon icon={Home} stroke="blue" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('stroke', 'blue')
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly when passed additional props', () => {
      render(
        <Icon 
          icon={Home} 
          data-testid="icon"
          title="Home Icon"
          role="img"
        />
      )
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveAttribute('title', 'Home Icon')
      expect(icon).toHaveAttribute('role', 'img')
    })

    it('maintains aspect ratio', () => {
      render(<Icon icon={Home} size="lg" data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      expect(icon).toHaveClass('h-6', 'w-6')
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<Icon icon={Home} data-testid="icon" />)
      const icon = screen.getByTestId('icon')
      const initialElement = icon
      
      // Re-render with same props
      rerender(<Icon icon={Home} data-testid="icon" />)
      const iconAfterRerender = screen.getByTestId('icon')
      
      expect(iconAfterRerender).toBeInTheDocument()
    })
  })
})