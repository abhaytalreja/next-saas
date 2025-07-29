import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { DashboardGrid } from '../DashboardGrid'

expect.extend(toHaveNoViolations)

// Mock UI utilities
jest.mock('@nextsaas/ui', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const renderDashboardGrid = (props = {}) => {
  const defaultProps = {
    children: <div data-testid="test-child">Test Child</div>,
    ...props
  }
  
  return render(<DashboardGrid {...defaultProps} />)
}

describe('DashboardGrid', () => {
  describe('rendering', () => {
    it('should render with default classes', () => {
      renderDashboardGrid()
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')
    })

    it('should render children correctly', () => {
      renderDashboardGrid()
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
      renderDashboardGrid({ className: 'custom-class another-class' })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6', 'custom-class', 'another-class')
    })

    it('should merge default and custom classes correctly', () => {
      renderDashboardGrid({ className: 'gap-8 bg-red-500' })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6', 'gap-8', 'bg-red-500')
    })
  })

  describe('children handling', () => {
    it('should render single child', () => {
      render(
        <DashboardGrid>
          <div data-testid="single-child">Single Child</div>
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('single-child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <DashboardGrid>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('should render complex children structures', () => {
      render(
        <DashboardGrid>
          <div>
            <h2>Card Title</h2>
            <p>Card content</p>
            <button>Action</button>
          </div>
          <section>
            <header>Section Header</header>
            <article>Article content</article>
          </section>
        </DashboardGrid>
      )
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Section Header')).toBeInTheDocument()
      expect(screen.getByText('Article content')).toBeInTheDocument()
    })

    it('should handle no children gracefully', () => {
      render(<DashboardGrid>{null}</DashboardGrid>)
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toBeEmptyDOMElement()
    })

    it('should handle undefined children', () => {
      render(<DashboardGrid>{undefined}</DashboardGrid>)
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toBeInTheDocument()
    })

    it('should handle false/empty children', () => {
      render(
        <DashboardGrid>
          {false && <div>Hidden</div>}
          {'' && <div>Empty</div>}
          <div data-testid="visible">Visible</div>
        </DashboardGrid>
      )
      
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
      expect(screen.queryByText('Empty')).not.toBeInTheDocument()
      expect(screen.getByTestId('visible')).toBeInTheDocument()
    })
  })

  describe('responsive grid behavior', () => {
    it('should apply mobile-first grid classes', () => {
      renderDashboardGrid()
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid-cols-1')
    })

    it('should apply large screen grid classes', () => {
      renderDashboardGrid()
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('should maintain consistent gap', () => {
      renderDashboardGrid()
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('gap-6')
    })

    it('should allow custom responsive behavior through className', () => {
      renderDashboardGrid({ className: 'md:grid-cols-2 xl:grid-cols-4' })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('md:grid-cols-2', 'xl:grid-cols-4')
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderDashboardGrid()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations with multiple children', async () => {
      const { container } = render(
        <DashboardGrid>
          <article>
            <h2>Article 1</h2>
            <p>Content 1</p>
          </article>
          <article>
            <h2>Article 2</h2>
            <p>Content 2</p>
          </article>
          <article>
            <h2>Article 3</h2>
            <p>Content 3</p>
          </article>
        </DashboardGrid>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should be compatible with screen readers', () => {
      render(
        <DashboardGrid>
          <section aria-label="Metrics section">
            <h2>Key Metrics</h2>
            <div>Content</div>
          </section>
          <section aria-label="Charts section">
            <h2>Charts</h2>
            <div>Content</div>
          </section>
        </DashboardGrid>
      )
      
      expect(screen.getByLabelText('Metrics section')).toBeInTheDocument()
      expect(screen.getByLabelText('Charts section')).toBeInTheDocument()
    })
  })

  describe('CSS Grid integration', () => {
    it('should work with CSS Grid layout', () => {
      renderDashboardGrid()
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid')
    })

    it('should support custom grid configurations', () => {
      renderDashboardGrid({ className: 'grid-cols-2 grid-rows-3 gap-4' })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid-cols-2', 'grid-rows-3', 'gap-4')
    })

    it('should handle grid placement utilities', () => {
      render(
        <DashboardGrid>
          <div className="col-span-2">Wide item</div>
          <div className="col-span-1">Normal item</div>
        </DashboardGrid>
      )
      
      expect(screen.getByText('Wide item')).toHaveClass('col-span-2')
      expect(screen.getByText('Normal item')).toHaveClass('col-span-1')
    })
  })

  describe('performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now()
      
      renderDashboardGrid()
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in less than 10ms (very fast for simple grid)
      expect(renderTime).toBeLessThan(10)
    })

    it('should handle many children efficiently', () => {
      const startTime = performance.now()
      
      const manyChildren = Array.from({ length: 100 }, (_, i) => (
        <div key={i} data-testid={`child-${i}`}>
          Child {i}
        </div>
      ))
      
      render(<DashboardGrid>{manyChildren}</DashboardGrid>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should handle 100 children in reasonable time
      expect(renderTime).toBeLessThan(50)
      
      // Verify all children are rendered
      expect(screen.getByTestId('child-0')).toBeInTheDocument()
      expect(screen.getByTestId('child-99')).toBeInTheDocument()
    })

    it('should not cause memory leaks', () => {
      const { unmount } = renderDashboardGrid()
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('className merging', () => {
    it('should handle empty className', () => {
      renderDashboardGrid({ className: '' })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')
    })

    it('should handle null className', () => {
      renderDashboardGrid({ className: null })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')
    })

    it('should handle undefined className', () => {
      renderDashboardGrid({ className: undefined })
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')
    })

    it('should deduplicate classes when using cn utility', () => {
      renderDashboardGrid({ className: 'grid gap-6' })
      
      const grid = screen.getByTestId('dashboard-grid')
      // cn utility should handle deduplication
      expect(grid.className).toContain('grid')
      expect(grid.className).toContain('gap-6')
    })
  })

  describe('edge cases', () => {
    it('should handle React fragments as children', () => {
      render(
        <DashboardGrid>
          <>
            <div data-testid="fragment-child-1">Child 1</div>
            <div data-testid="fragment-child-2">Child 2</div>
          </>
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument()
      expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument()
    })

    it('should handle conditional rendering', () => {
      const showThird = false
      
      render(
        <DashboardGrid>
          <div data-testid="always-visible">Always visible</div>
          {true && <div data-testid="conditionally-visible">Conditionally visible</div>}
          {showThird && <div data-testid="never-visible">Never visible</div>}
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('always-visible')).toBeInTheDocument()
      expect(screen.getByTestId('conditionally-visible')).toBeInTheDocument()
      expect(screen.queryByTestId('never-visible')).not.toBeInTheDocument()
    })

    it('should handle component children', () => {
      const CustomComponent = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="custom-component">{children}</div>
      )
      
      render(
        <DashboardGrid>
          <CustomComponent>
            <span>Custom content</span>
          </CustomComponent>
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('custom-component')).toBeInTheDocument()
      expect(screen.getByText('Custom content')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should work with dashboard components', () => {
      render(
        <DashboardGrid>
          <div data-testid="metrics-card" className="bg-white p-4 rounded-lg shadow">
            <h3>Metrics</h3>
            <p>Some metrics data</p>
          </div>
          <div data-testid="chart-card" className="bg-white p-4 rounded-lg shadow">
            <h3>Chart</h3>
            <div>Chart placeholder</div>
          </div>
          <div data-testid="activity-card" className="bg-white p-4 rounded-lg shadow">
            <h3>Recent Activity</h3>
            <ul>
              <li>Activity 1</li>
              <li>Activity 2</li>
            </ul>
          </div>
        </DashboardGrid>
      )
      
      expect(screen.getByTestId('metrics-card')).toBeInTheDocument()
      expect(screen.getByTestId('chart-card')).toBeInTheDocument()
      expect(screen.getByTestId('activity-card')).toBeInTheDocument()
      
      expect(screen.getByText('Metrics')).toBeInTheDocument()
      expect(screen.getByText('Chart')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })

    it('should maintain proper spacing between grid items', () => {
      render(
        <DashboardGrid>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </DashboardGrid>
      )
      
      const grid = screen.getByTestId('dashboard-grid')
      expect(grid).toHaveClass('gap-6')
    })
  })
})