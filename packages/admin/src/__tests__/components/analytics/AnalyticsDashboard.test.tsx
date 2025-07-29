import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AnalyticsDashboard } from '../../../components/analytics/AnalyticsDashboard'
import { useAnalytics } from '../../../hooks/useAnalytics'

// Mock the useAnalytics hook
jest.mock('../../../hooks/useAnalytics', () => ({
  useAnalytics: jest.fn()
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Button: ({ children, onClick, variant, size, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">{children}</div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">{children}</div>
  )
}))

// Mock child components
jest.mock('../../../components/analytics/UserGrowthChart', () => ({
  UserGrowthChart: ({ data, height }: any) => (
    <div data-testid="user-growth-chart" data-height={height}>
      UserGrowthChart - {data?.length || 0} data points
    </div>
  )
}))

jest.mock('../../../components/analytics/RevenueChart', () => ({
  RevenueChart: ({ data, height }: any) => (
    <div data-testid="revenue-chart" data-height={height}>
      RevenueChart - {data?.length || 0} data points
    </div>
  )
}))

jest.mock('../../../components/analytics/EngagementChart', () => ({
  EngagementChart: ({ data, height }: any) => (
    <div data-testid="engagement-chart" data-height={height}>
      EngagementChart - {data?.length || 0} data points
    </div>
  )
}))

jest.mock('../../../components/analytics/ConversionFunnel', () => ({
  ConversionFunnel: ({ data }: any) => (
    <div data-testid="conversion-funnel">
      ConversionFunnel - {data?.length || 0} steps
    </div>
  )
}))

jest.mock('../../../components/analytics/DateRangePicker', () => ({
  DateRangePicker: ({ value, onChange, presets }: any) => (
    <div data-testid="date-range-picker">
      <span>Range: {value?.label || 'No range'}</span>
      <button 
        onClick={() => onChange?.({ start: new Date(), end: new Date(), label: 'Test Range' })}
      >
        Change Range
      </button>
    </div>
  )
}))

jest.mock('../../../components/analytics/MetricsTable', () => ({
  MetricsTable: ({ data, dateRange }: any) => (
    <div data-testid="metrics-table">
      MetricsTable - Range: {dateRange?.label || 'No range'}
    </div>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  BarChart: ({ className }: any) => <div data-testid="bar-chart-icon" className={className} />,
  RefreshCw: ({ className }: any) => <div data-testid="refresh-icon" className={className} />,
  Download: ({ className }: any) => <div data-testid="download-icon" className={className} />,
  TrendingUp: ({ className }: any) => <div data-testid="trending-up-icon" className={className} />
}))

const mockUseAnalytics = useAnalytics as jest.MockedFunction<typeof useAnalytics>

describe('AnalyticsDashboard', () => {
  const mockAnalyticsData = {
    userGrowth: [
      { date: '2024-01-01', value: 1000 },
      { date: '2024-01-02', value: 1050 }
    ],
    revenueGrowth: [
      { date: '2024-01-01', value: 15000 },
      { date: '2024-01-02', value: 15500 }
    ],
    organizationGrowth: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 105 }
    ],
    engagementMetrics: [
      { date: '2024-01-01', value: 250 },
      { date: '2024-01-02', value: 280 }
    ],
    metrics: {
      totalUsers: 1000,
      activeUsers: 750,
      newUsersToday: 25,
      userGrowthRate: 12.5,
      userRetentionRate: 85.3,
      totalOrganizations: 150,
      activeOrganizations: 140,
      newOrganizationsToday: 3,
      organizationGrowthRate: 8.2,
      monthlyRecurringRevenue: 50000,
      totalRevenue: 1500000,
      averageRevenuePerUser: 89.50,
      revenueGrowthRate: 15.3,
      churnRate: 2.1,
      systemUptime: 99.9,
      apiResponseTime: 145,
      errorRate: 0.02,
      activeConnections: 500,
      emailsSentToday: 1250,
      emailDeliveryRate: 99.2,
      campaignsActive: 8,
      subscriberCount: 125000,
      recentActivity: []
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAnalytics.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })
  })

  describe('rendering', () => {
    it('should render dashboard header correctly', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive insights and metrics for your platform')).toBeInTheDocument()
    })

    it('should render date range picker', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument()
      expect(screen.getByText(/Range: Last 30 days/)).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<AnalyticsDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh data/i })
      const exportButton = screen.getByRole('button', { name: /export data/i })
      
      expect(refreshButton).toBeInTheDocument()
      expect(exportButton).toBeInTheDocument()
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
      expect(screen.getByTestId('download-icon')).toBeInTheDocument()
    })

    it('should render all chart components', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByTestId('user-growth-chart')).toBeInTheDocument()
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
      expect(screen.getByTestId('engagement-chart')).toBeInTheDocument()
      expect(screen.getByTestId('conversion-funnel')).toBeInTheDocument()
      expect(screen.getByTestId('metrics-table')).toBeInTheDocument()
    })

    it('should render key metrics cards', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
      expect(screen.getByText('Growth Rate')).toBeInTheDocument()
      expect(screen.getByText('Active Organizations')).toBeInTheDocument()
    })

    it('should display metric values correctly', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('1,000')).toBeInTheDocument() // Total users
      expect(screen.getByText('$50,000')).toBeInTheDocument() // Monthly revenue
      expect(screen.getByText('12.5%')).toBeInTheDocument() // Growth rate
      expect(screen.getByText('140')).toBeInTheDocument() // Active organizations
    })

    it('should show loading state', () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Loading analytics data...')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument()
    })

    it('should show error state', () => {
      const error = new Error('Failed to load analytics')
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('Error loading analytics')).toBeInTheDocument()
      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should show empty state when no data', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockAnalyticsData,
          userGrowth: [],
          revenueGrowth: [],
          organizationGrowth: [],
          engagementMetrics: []
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('No analytics data available')).toBeInTheDocument()
      expect(screen.getByText('Try selecting a different date range or check back later.')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should handle refresh button click', () => {
      const mockRefetch = jest.fn()
      mockUseAnalytics.mockReturnValue({
        data: mockAnalyticsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      })

      render(<AnalyticsDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh data/i })
      fireEvent.click(refreshButton)
      
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('should handle export button click', () => {
      // Mock console.log to verify export functionality
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<AnalyticsDashboard />)
      
      const exportButton = screen.getByRole('button', { name: /export data/i })
      fireEvent.click(exportButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Exporting analytics data...', mockAnalyticsData)
      
      consoleSpy.mockRestore()
    })

    it('should handle date range change', () => {
      render(<AnalyticsDashboard />)
      
      const changeRangeButton = screen.getByText('Change Range')
      fireEvent.click(changeRangeButton)
      
      expect(screen.getByText(/Range: Test Range/)).toBeInTheDocument()
    })

    it('should handle retry button click in error state', () => {
      const mockRefetch = jest.fn()
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch
      })

      render(<AnalyticsDashboard />)
      
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)
      
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('data handling', () => {
    it('should pass mock data to charts when analytics data is not available', () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      // Should still render charts with mock data
      expect(screen.getByText('UserGrowthChart - 7 data points')).toBeInTheDocument()
      expect(screen.getByText('RevenueChart - 7 data points')).toBeInTheDocument()
      expect(screen.getByText('EngagementChart - 7 data points')).toBeInTheDocument()
    })

    it('should use real data when available', () => {
      render(<AnalyticsDashboard />)
      
      // Should use real data from analytics hook
      expect(screen.getByText('UserGrowthChart - 2 data points')).toBeInTheDocument()
      expect(screen.getByText('RevenueChart - 2 data points')).toBeInTheDocument()
      expect(screen.getByText('EngagementChart - 2 data points')).toBeInTheDocument()
    })

    it('should handle partial data gracefully', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockAnalyticsData,
          userGrowth: [],
          revenueGrowth: mockAnalyticsData.revenueGrowth
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('UserGrowthChart - 0 data points')).toBeInTheDocument()
      expect(screen.getByText('RevenueChart - 2 data points')).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should pass correct height to chart components', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByTestId('user-growth-chart')).toHaveAttribute('data-height', '400')
      expect(screen.getByTestId('revenue-chart')).toHaveAttribute('data-height', '400')
      expect(screen.getByTestId('engagement-chart')).toHaveAttribute('data-height', '300')
    })

    it('should render in grid layout', () => {
      const { container } = render(<AnalyticsDashboard />)
      
      const gridElements = container.querySelectorAll('[class*="grid"]')
      expect(gridElements.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AnalyticsDashboard />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Analytics Dashboard')
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(subHeadings.length).toBeGreaterThan(0)
    })

    it('should have accessible button labels', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByRole('button', { name: /refresh data/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for loading state', () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes for error state', () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Test error'),
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('date range functionality', () => {
    it('should initialize with last 30 days range', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText(/Range: Last 30 days/)).toBeInTheDocument()
    })

    it('should update date range state correctly', () => {
      render(<AnalyticsDashboard />)
      
      const changeRangeButton = screen.getByText('Change Range')
      fireEvent.click(changeRangeButton)
      
      expect(screen.getByText(/Range: Test Range/)).toBeInTheDocument()
    })

    it('should pass date range to metrics table', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('MetricsTable - Range: Last 30 days')).toBeInTheDocument()
    })
  })

  describe('conversion funnel', () => {
    it('should render conversion funnel with mock data', () => {
      render(<AnalyticsDashboard />)
      
      expect(screen.getByTestId('conversion-funnel')).toBeInTheDocument()
      expect(screen.getByText('ConversionFunnel - 4 steps')).toBeInTheDocument()
    })

    it('should handle empty funnel data', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockAnalyticsData,
          userGrowth: [],
          revenueGrowth: [],
          organizationGrowth: [],
          engagementMetrics: []
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('ConversionFunnel - 0 steps')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null analytics data', () => {
      mockUseAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('UserGrowthChart - 7 data points')).toBeInTheDocument() // Falls back to mock data
    })

    it('should handle undefined metrics', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockAnalyticsData,
          metrics: undefined as any
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 for undefined metrics
    })

    it('should handle very large numbers in metrics', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockAnalyticsData,
          metrics: {
            ...mockAnalyticsData.metrics,
            totalUsers: 1000000,
            monthlyRecurringRevenue: 5000000
          }
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsDashboard />)
      
      expect(screen.getByText('1,000,000')).toBeInTheDocument()
      expect(screen.getByText('$5,000,000')).toBeInTheDocument()
    })
  })
})