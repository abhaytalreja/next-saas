import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Skeleton, SkeletonText } from './Skeleton'

expect.extend(toHaveNoViolations)

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    it('renders as div element', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton.tagName).toBe('DIV')
    })

    it('has proper base classes', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse', 'bg-muted', 'rounded-none')
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('custom-class')
    })

    it('applies custom styles', () => {
      render(
        <Skeleton 
          style={{ height: '20px', width: '100px' }} 
          data-testid="skeleton" 
        />
      )
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle('height: 20px; width: 100px')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Skeleton />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('supports ARIA attributes', () => {
      render(
        <Skeleton 
          aria-label="Loading content" 
          data-testid="skeleton" 
        />
      )
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    })

    it('has proper role for screen readers', () => {
      render(
        <Skeleton 
          role="status" 
          aria-label="Loading..." 
          data-testid="skeleton" 
        />
      )
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('role', 'status')
    })
  })

  describe('Variants', () => {
    it('renders rectangular variant by default', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-none')
    })

    it('renders text variant', () => {
      render(<Skeleton variant="text" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('h-4', 'w-full', 'rounded')
    })

    it('renders circular variant', () => {
      render(<Skeleton variant="circular" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-full', 'aspect-square')
    })

    it('renders rounded variant', () => {
      render(<Skeleton variant="rounded" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-md')
    })
  })

  describe('Animation', () => {
    it('has pulse animation by default', () => {
      render(<Skeleton data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('supports wave animation', () => {
      render(<Skeleton animation="wave" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-[shimmer_2s_infinite]')
    })

    it('can disable animation', () => {
      render(<Skeleton animation="none" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).not.toHaveClass('animate-pulse')
    })
  })

  describe('Dimensions', () => {
    it('supports width prop', () => {
      render(<Skeleton width={100} data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle('width: 100px')
    })

    it('supports height prop', () => {
      render(<Skeleton height="50px" data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle('height: 50px')
    })

    it('supports both width and height', () => {
      render(<Skeleton width={100} height={50} data-testid="skeleton" />)
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveStyle('width: 100px; height: 50px')
    })
  })

  describe('Use Cases', () => {
    it('can render text skeleton', () => {
      render(<Skeleton variant="text" data-testid="text-skeleton" />)
      const skeleton = screen.getByTestId('text-skeleton')
      expect(skeleton).toHaveClass('h-4', 'w-full')
    })

    it('can render avatar skeleton', () => {
      render(<Skeleton variant="circular" width={48} height={48} data-testid="avatar-skeleton" />)
      const skeleton = screen.getByTestId('avatar-skeleton')
      expect(skeleton).toHaveClass('rounded-full', 'aspect-square')
    })

    it('can render button skeleton', () => {
      render(<Skeleton width={100} height={40} data-testid="button-skeleton" />)
      const skeleton = screen.getByTestId('button-skeleton')
      expect(skeleton).toHaveStyle('width: 100px; height: 40px')
    })
  })

  describe('Edge Cases', () => {
    it('handles additional HTML attributes', () => {
      render(
        <Skeleton 
          title="Loading skeleton"
          role="status"
          data-testid="skeleton" 
        />
      )
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveAttribute('title', 'Loading skeleton')
      expect(skeleton).toHaveAttribute('role', 'status')
    })
  })
})

describe('SkeletonText', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<SkeletonText data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      expect(skeletonText).toBeInTheDocument()
    })

    it('renders 3 lines by default', () => {
      render(<SkeletonText data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      const lines = skeletonText.querySelectorAll('div[class*="h-4"]')
      expect(lines).toHaveLength(3)
    })

    it('renders custom number of lines', () => {
      render(<SkeletonText lines={5} data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      const lines = skeletonText.querySelectorAll('div[class*="h-4"]')
      expect(lines).toHaveLength(5)
    })
  })

  describe('Spacing', () => {
    it('has medium spacing by default', () => {
      render(<SkeletonText data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      expect(skeletonText).toHaveClass('space-y-2')
    })

    it('supports small spacing', () => {
      render(<SkeletonText spacing="sm" data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      expect(skeletonText).toHaveClass('space-y-1')
    })

    it('supports large spacing', () => {
      render(<SkeletonText spacing="lg" data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      expect(skeletonText).toHaveClass('space-y-3')
    })
  })

  describe('Line Variations', () => {
    it('makes last line shorter', () => {
      render(<SkeletonText lines={2} data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      const lines = skeletonText.querySelectorAll('div[class*="h-4"]')
      
      expect(lines[0]).toHaveClass('w-full')
      expect(lines[1]).toHaveClass('w-3/4')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SkeletonText />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<SkeletonText className="custom-class" data-testid="skeleton-text" />)
      const skeletonText = screen.getByTestId('skeleton-text')
      expect(skeletonText).toHaveClass('custom-class')
    })
  })
})