import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { StatsCard } from '../../../components/dashboard/StatsCard'
import { User, DollarSign, TrendingUp } from 'lucide-react'

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: any) => <div data-testid="trending-up" className={className} />,
  TrendingDown: ({ className }: any) => <div data-testid="trending-down" className={className} />,
  Minus: ({ className }: any) => <div data-testid="minus" className={className} />,
  Wifi: ({ className }: any) => <div data-testid="wifi" className={className} />,
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  DollarSign: ({ className }: any) => <div data-testid="dollar-icon" className={className} />
}))

expect.extend(toHaveNoViolations)

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1000,
    icon: User
  }

  describe('rendering', () => {
    it('should render basic stats card with title and value', () => {
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1,000')).toBeInTheDocument()
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    })

    it('should render with string value', () => {
      render(<StatsCard {...defaultProps} value="Active" />)
      
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render with description', () => {
      render(<StatsCard {...defaultProps} description="Currently registered users" />)
      
      expect(screen.getByText('Currently registered users')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const { container } = render(<StatsCard {...defaultProps} className="custom-class" />)
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should render loading state', () => {
      const { container } = render(<StatsCard {...defaultProps} loading={true} />)
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
    })
  })

  describe('value formatting', () => {
    it('should format number values with commas', () => {
      render(<StatsCard {...defaultProps} value={1234567} />)
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('should format currency values', () => {
      render(<StatsCard {...defaultProps} value={50000} format="currency" />)
      
      expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    })

    it('should format percentage values', () => {
      render(<StatsCard {...defaultProps} value={85.5} format="percentage" />)
      
      expect(screen.getByText('85.5%')).toBeInTheDocument()
    })

    it('should handle zero values', () => {
      render(<StatsCard {...defaultProps} value={0} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      render(<StatsCard {...defaultProps} value={-100} />)
      
      expect(screen.getByText('-100')).toBeInTheDocument()
    })
  })

  describe('trend indicators', () => {
    it('should show positive trend with change value', () => {
      render(<StatsCard {...defaultProps} change={12.5} trend="up" />)
      
      expect(screen.getByTestId('trending-up')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()
      expect(screen.getByText('vs last period')).toBeInTheDocument()
    })

    it('should show negative trend with change value', () => {
      render(<StatsCard {...defaultProps} change={-8.2} trend="down" />)
      
      expect(screen.getByTestId('trending-down')).toBeInTheDocument()
      expect(screen.getByText('8.2%')).toBeInTheDocument() // Absolute value
    })

    it('should show stable trend', () => {
      render(<StatsCard {...defaultProps} change={0} trend="stable" />)
      
      expect(screen.getByTestId('minus')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle undefined change value', () => {
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.queryByText('vs last period')).not.toBeInTheDocument()
    })

    it('should apply correct CSS classes for trends', () => {
      const { rerender } = render(<StatsCard {...defaultProps} change={10} trend="up" />)
      let trendElement = screen.getByTestId('trending-up').parentElement
      expect(trendElement).toHaveClass('text-green-600')

      rerender(<StatsCard {...defaultProps} change={10} trend="down" />)
      trendElement = screen.getByTestId('trending-down').parentElement
      expect(trendElement).toHaveClass('text-red-600')

      rerender(<StatsCard {...defaultProps} change={0} trend="stable" />)
      trendElement = screen.getByTestId('minus').parentElement
      expect(trendElement).toHaveClass('text-gray-600')
    })
  })

  describe('real-time features', () => {
    it('should show live badge when realTime is true', () => {
      render(<StatsCard {...defaultProps} realTime={true} />)
      
      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('Live')).toBeInTheDocument()
      expect(screen.getByTestId('wifi')).toBeInTheDocument()
    })

    it('should not show live badge when realTime is false', () => {
      render(<StatsCard {...defaultProps} realTime={false} />)
      
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
      expect(screen.queryByText('Live')).not.toBeInTheDocument()
    })

    it('should apply real-time styling to icon', () => {
      const { rerender } = render(<StatsCard {...defaultProps} realTime={true} />)
      expect(screen.getByTestId('user-icon')).toHaveClass('text-blue-500')

      rerender(<StatsCard {...defaultProps} realTime={false} />)
      expect(screen.getByTestId('user-icon')).toHaveClass('text-gray-400')
    })
  })

  describe('loading state', () => {
    it('should render skeleton when loading', () => {
      const { container } = render(<StatsCard {...defaultProps} loading={true} />)
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(container.querySelectorAll('.bg-gray-200').length).toBeGreaterThan(0)
    })

    it('should not render content when loading', () => {
      render(<StatsCard {...defaultProps} loading={true} />)
      
      expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
      expect(screen.queryByText('1,000')).not.toBeInTheDocument()
    })

    it('should apply loading className when provided', () => {
      const { container } = render(<StatsCard {...defaultProps} loading={true} className="custom-loading" />)
      
      expect(container.firstChild).toHaveClass('custom-loading')
    })
  })

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      render(<StatsCard {...defaultProps} value={999999999} />)
      
      expect(screen.getByText('999,999,999')).toBeInTheDocument()
    })

    it('should handle decimal values', () => {
      render(<StatsCard {...defaultProps} value={123.45} />)
      
      expect(screen.getByText('123.45')).toBeInTheDocument()
    })

    it('should handle empty string value', () => {
      render(<StatsCard {...defaultProps} value="" />)
      
      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle long titles gracefully', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines'
      render(<StatsCard {...defaultProps} title={longTitle} />)
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle long descriptions gracefully', () => {
      const longDescription = 'This is a very long description that might wrap to multiple lines and take up more space'
      render(<StatsCard {...defaultProps} description={longDescription} />)
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<StatsCard {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', () => {
      render(<StatsCard {...defaultProps} />)
      
      const title = screen.getByText('Total Users')
      expect(title.tagName).toBe('H3')
    })

    it('should have meaningful text content', () => {
      render(
        <StatsCard 
          {...defaultProps} 
          change={15} 
          trend="up" 
          description="Active users this month"
        />
      )
      
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('1,000')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('vs last period')).toBeInTheDocument()
      expect(screen.getByText('Active users this month')).toBeInTheDocument()
    })

    it('should handle screen reader content appropriately', () => {
      render(
        <StatsCard 
          {...defaultProps} 
          change={12.5} 
          trend="up" 
          realTime={true}
        />
      )
      
      // Verify that important information is available for screen readers
      expect(screen.getByText('Live')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()
      expect(screen.getByText('vs last period')).toBeInTheDocument()
    })
  })

  describe('icon rendering', () => {
    it('should render different icons correctly', () => {
      const { rerender } = render(<StatsCard {...defaultProps} icon={User} />)
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()

      rerender(<StatsCard {...defaultProps} icon={DollarSign} />)
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()
    })

    it('should pass className to icon', () => {
      render(<StatsCard {...defaultProps} />)
      const icon = screen.getByTestId('user-icon')
      expect(icon).toHaveClass('h-8', 'w-8')
    })
  })

  describe('component integration', () => {
    it('should work with all props combined', () => {
      render(
        <StatsCard
          title="Monthly Revenue"
          value={50000}
          format="currency"
          change={15.3}
          trend="up"
          icon={DollarSign}
          description="Total revenue this month"
          realTime={true}
          className="custom-stats-card"
        />
      )
      
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
      expect(screen.getByText('$50,000.00')).toBeInTheDocument()
      expect(screen.getByText('15.3%')).toBeInTheDocument()
      expect(screen.getByText('Total revenue this month')).toBeInTheDocument()
      expect(screen.getByText('Live')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up')).toBeInTheDocument()
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()
    })

    it('should maintain proper styling hierarchy', () => {
      const { container } = render(
        <StatsCard
          {...defaultProps}
          realTime={true}
          className="test-class"
        />
      )
      
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('test-class')
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6', 'relative')
    })
  })
})