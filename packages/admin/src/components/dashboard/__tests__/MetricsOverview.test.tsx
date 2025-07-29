import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { MetricsOverview } from '../MetricsOverview'
import { AdminMetrics } from '../../../types'

expect.extend(toHaveNoViolations)

const mockMetrics: AdminMetrics = {
  // User metrics
  totalUsers: 10000,
  activeUsers: 7500,
  newUsersToday: 125,
  userGrowthRate: 15.5,
  userRetentionRate: 85.2,

  // Organization metrics
  totalOrganizations: 500,
  activeOrganizations: 450,
  newOrganizationsToday: 12,
  organizationGrowthRate: 8.3,

  // Revenue metrics
  monthlyRecurringRevenue: 50000,
  totalRevenue: 750000,
  averageRevenuePerUser: 75,
  revenueGrowthRate: 12.8,
  churnRate: 2.3,

  // System metrics
  systemUptime: 99.95,
  apiResponseTime: 145,
  errorRate: 0.02,
  activeConnections: 2500,

  // Email metrics
  emailsSentToday: 5000,
  emailDeliveryRate: 98.7,
  campaignsActive: 15,
  subscriberCount: 25000,

  // Recent activity
  recentActivity: [
    {
      id: '1',
      description: 'New user registered',
      timestamp: '2023-12-01T10:00:00Z',
      type: 'user',
      userId: 'user-123'
    }
  ]
}

const renderMetricsOverview = (metrics?: AdminMetrics) => {
  return render(<MetricsOverview metrics={metrics} />)
}

describe('MetricsOverview', () => {
  describe('rendering', () => {
    it('should render with correct structure when metrics are provided', () => {
      renderMetricsOverview(mockMetrics)
      
      const container = screen.getByTestId('metrics-overview')
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6')
      
      expect(screen.getByText('Platform Metrics')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Platform Metrics' })).toBeInTheDocument()
    })

    it('should render loading state when no metrics provided', () => {
      renderMetricsOverview()
      
      const loadingContainer = screen.getByTestId('metrics-loading')
      expect(loadingContainer).toHaveClass('animate-pulse')
      
      const skeletons = screen.getAllByTestId('skeleton-item')
      expect(skeletons).toHaveLength(3)
      
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('space-y-3')
      })
    })

    it('should render grid layout correctly', () => {
      renderMetricsOverview(mockMetrics)
      
      const grid = screen.getByTestId('metrics-grid')
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6')
    })
  })

  describe('user analytics section', () => {
    it('should display user analytics header', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByRole('heading', { level: 4, name: 'User Analytics' })).toBeInTheDocument()
    })

    it('should display active users with correct formatting', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Active Users (7d)')).toBeInTheDocument()
      expect(screen.getByText('7,500')).toBeInTheDocument()
    })

    it('should display new users today', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('New Users Today')).toBeInTheDocument()
      expect(screen.getByText('125')).toBeInTheDocument()
    })

    it('should display user retention rate', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('User Retention')).toBeInTheDocument()
      expect(screen.getByText('85.2%')).toBeInTheDocument()
    })

    it('should handle zero values gracefully', () => {
      const zeroMetrics = { ...mockMetrics, activeUsers: 0, newUsersToday: 0, userRetentionRate: 0 }
      renderMetricsOverview(zeroMetrics)
      
      // Check specific zero values in user analytics section
      const userSection = screen.getByText('User Analytics').closest('[data-testid="metrics-section"]')
      expect(userSection).toBeInTheDocument()
      
      // Find the specific zero values we expect
      expect(screen.getByText('Active Users (7d)')).toBeInTheDocument()
      expect(screen.getByText('New Users Today')).toBeInTheDocument()
      expect(screen.getByText('User Retention')).toBeInTheDocument()
      
      // Use getAllByText to handle multiple "0" values
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBeGreaterThan(0)
      
      const zeroPercentValues = screen.getAllByText('0%')
      expect(zeroPercentValues.length).toBeGreaterThan(0)
    })

    it('should handle undefined values gracefully', () => {
      const undefinedMetrics = { ...mockMetrics } as any
      delete undefinedMetrics.activeUsers
      delete undefinedMetrics.newUsersToday
      delete undefinedMetrics.userRetentionRate
      
      renderMetricsOverview(undefinedMetrics)
      
      expect(screen.getAllByText('0')).toHaveLength(2)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  describe('revenue analytics section', () => {
    it('should display revenue analytics header', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByRole('heading', { level: 4, name: 'Revenue Analytics' })).toBeInTheDocument()
    })

    it('should display average revenue per user with currency format', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Average Revenue Per User')).toBeInTheDocument()
      expect(screen.getByText('$75')).toBeInTheDocument()
    })

    it('should display churn rate as percentage', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Churn Rate')).toBeInTheDocument()
      expect(screen.getByText('2.3%')).toBeInTheDocument()
    })

    it('should display total revenue with formatting', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('$750,000')).toBeInTheDocument()
    })

    it('should handle large revenue numbers', () => {
      const largeRevenueMetrics = { ...mockMetrics, totalRevenue: 5000000, averageRevenuePerUser: 1250 }
      renderMetricsOverview(largeRevenueMetrics)
      
      expect(screen.getByText('$5,000,000')).toBeInTheDocument()
      expect(screen.getByText('$1,250')).toBeInTheDocument()
    })
  })

  describe('system performance section', () => {
    it('should display system performance header', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByRole('heading', { level: 4, name: 'System Performance' })).toBeInTheDocument()
    })

    it('should display API response time with unit', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('API Response Time')).toBeInTheDocument()
      expect(screen.getByText('145ms')).toBeInTheDocument()
    })

    it('should display error rate as percentage', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Error Rate')).toBeInTheDocument()
      expect(screen.getByText('0.02%')).toBeInTheDocument()
    })

    it('should display email delivery rate', () => {
      renderMetricsOverview(mockMetrics)
      
      expect(screen.getByText('Email Delivery Rate')).toBeInTheDocument()
      expect(screen.getByText('98.7%')).toBeInTheDocument()
    })

    it('should handle high error rates', () => {
      const highErrorMetrics = { ...mockMetrics, errorRate: 5.75 }
      renderMetricsOverview(highErrorMetrics)
      
      expect(screen.getByText('5.75%')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderMetricsOverview(mockMetrics)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in loading state', async () => {
      const { container } = renderMetricsOverview()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', () => {
      renderMetricsOverview(mockMetrics)
      
      const mainHeading = screen.getByRole('heading', { level: 3 })
      expect(mainHeading).toHaveTextContent('Platform Metrics')
      
      const subHeadings = screen.getAllByRole('heading', { level: 4 })
      expect(subHeadings).toHaveLength(3)
      expect(subHeadings[0]).toHaveTextContent('User Analytics')
      expect(subHeadings[1]).toHaveTextContent('Revenue Analytics')
      expect(subHeadings[2]).toHaveTextContent('System Performance')
    })

    it('should have proper semantic structure', () => {
      renderMetricsOverview(mockMetrics)
      
      const metricsContainer = screen.getByTestId('metrics-overview')
      expect(metricsContainer).toHaveAttribute('role', 'region')
      expect(metricsContainer).toHaveAttribute('aria-labelledby', 'metrics-title')
      
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveAttribute('id', 'metrics-title')
    })
  })

  describe('responsive behavior', () => {
    it('should apply responsive grid classes', () => {
      renderMetricsOverview(mockMetrics)
      
      const grid = screen.getByTestId('metrics-grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3')
    })

    it('should maintain proper spacing', () => {
      renderMetricsOverview(mockMetrics)
      
      const sections = screen.getAllByTestId('metrics-section')
      sections.forEach(section => {
        expect(section).toHaveClass('space-y-4')
      })
    })
  })

  describe('data formatting', () => {
    it('should format numbers with commas for large values', () => {
      const largeNumberMetrics = { 
        ...mockMetrics, 
        activeUsers: 1234567,
        newUsersToday: 1234,
        totalRevenue: 12345678
      }
      renderMetricsOverview(largeNumberMetrics)
      
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
      expect(screen.getByText('1,234')).toBeInTheDocument()
      expect(screen.getByText('$12,345,678')).toBeInTheDocument()
    })

    it('should handle decimal values correctly', () => {
      const decimalMetrics = { 
        ...mockMetrics, 
        userRetentionRate: 85.234,
        churnRate: 2.567,
        errorRate: 0.123
      }
      renderMetricsOverview(decimalMetrics)
      
      expect(screen.getByText('85.234%')).toBeInTheDocument()
      expect(screen.getByText('2.567%')).toBeInTheDocument()
      expect(screen.getByText('0.123%')).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      const negativeMetrics = { 
        ...mockMetrics, 
        averageRevenuePerUser: -25
      }
      renderMetricsOverview(negativeMetrics)
      
      expect(screen.getByText('$-25')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle empty metrics object', () => {
      const emptyMetrics = {} as AdminMetrics
      
      expect(() => renderMetricsOverview(emptyMetrics)).not.toThrow()
      
      // Should display default values (0 or 0%)
      expect(screen.getAllByText('0')).toHaveLength(6) // 6 zero values
      expect(screen.getAllByText('0%')).toHaveLength(2) // 2 percentage values
    })

    it('should handle null/undefined individual metrics', () => {
      const partialMetrics = {
        ...mockMetrics,
        activeUsers: null as any,
        userRetentionRate: undefined as any,
        averageRevenuePerUser: null as any
      }
      
      renderMetricsOverview(partialMetrics)
      
      expect(screen.getByText('0')).toBeInTheDocument() // activeUsers fallback
      expect(screen.getByText('0%')).toBeInTheDocument() // userRetentionRate fallback
      expect(screen.getByText('$0')).toBeInTheDocument() // averageRevenuePerUser fallback
    })

    it('should handle very large numbers', () => {
      const largeMetrics = { 
        ...mockMetrics, 
        totalRevenue: Number.MAX_SAFE_INTEGER - 1,
        activeUsers: 999999999
      }
      
      expect(() => renderMetricsOverview(largeMetrics)).not.toThrow()
    })
  })

  describe('performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now()
      
      renderMetricsOverview(mockMetrics)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in less than 50ms for metrics overview
      expect(renderTime).toBeLessThan(50)
    })

    it('should not cause memory leaks', () => {
      const { unmount } = renderMetricsOverview(mockMetrics)
      
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('loading state', () => {
    it('should show correct number of skeleton items', () => {
      renderMetricsOverview()
      
      const skeletons = screen.getAllByTestId('skeleton-item')
      expect(skeletons).toHaveLength(3)
    })

    it('should have proper loading skeleton structure', () => {
      renderMetricsOverview()
      
      const skeletonTitles = screen.getAllByTestId('skeleton-title')
      const skeletonValues = screen.getAllByTestId('skeleton-value')
      
      expect(skeletonTitles).toHaveLength(3)
      expect(skeletonValues).toHaveLength(3)
      
      skeletonTitles.forEach(title => {
        expect(title).toHaveClass('h-4', 'bg-gray-200', 'rounded', 'w-3/4')
      })
      
      skeletonValues.forEach(value => {
        expect(value).toHaveClass('h-8', 'bg-gray-200', 'rounded')
      })
    })
  })
})