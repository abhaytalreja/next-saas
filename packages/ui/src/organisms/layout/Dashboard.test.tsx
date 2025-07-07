import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { Dashboard, MetricCard, ChartWidget, ActivityItem } from './Dashboard'
import { testAccessibility } from '../../test-utils'
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

// Mock data for testing
const mockMetrics: MetricCard[] = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: 45231,
    change: { value: 12.5, type: 'positive', period: 'last month' },
    icon: DollarSign,
    description: 'Total revenue this month',
  },
  {
    id: 'users',
    title: 'Active Users',
    value: '2.3K',
    change: { value: 5.2, type: 'positive' },
    icon: Users,
  },
  {
    id: 'orders',
    title: 'Orders',
    value: 142,
    change: { value: 3.1, type: 'negative', period: 'yesterday' },
    icon: ShoppingCart,
  },
  {
    id: 'loading-metric',
    title: 'Loading Metric',
    value: 0,
    loading: true,
    icon: TrendingUp,
  },
]

const mockCharts: ChartWidget[] = [
  {
    id: 'revenue-chart',
    title: 'Revenue Trend',
    type: 'line',
    data: [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
    ],
    description: 'Monthly revenue over time',
    height: 350,
  },
  {
    id: 'user-chart',
    title: 'User Growth',
    type: 'bar',
    data: [
      { month: 'Jan', users: 100 },
      { month: 'Feb', users: 150 },
      { month: 'Mar', users: 200 },
    ],
    loading: true,
  },
]

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'New user registered',
    description: 'John Doe joined the platform',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    type: 'user',
    avatar: 'https://example.com/avatar1.jpg',
  },
  {
    id: '2',
    title: 'Order completed',
    description: 'Order #1234 has been fulfilled',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'success',
    icon: ShoppingCart,
  },
  {
    id: '3',
    title: 'System alert',
    description: 'High memory usage detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'alert',
  },
]

const mockQuickActions = [
  {
    id: 'new-user',
    label: 'Add User',
    icon: Users,
    onClick: jest.fn(),
    variant: 'primary' as const,
  },
  {
    id: 'export',
    label: 'Export Data',
    onClick: jest.fn(),
    variant: 'outline' as const,
  },
  {
    id: 'settings',
    label: 'Settings',
    onClick: jest.fn(),
  },
]

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correctly with minimal props', () => {
      render(<Dashboard />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Dashboard className="custom-dashboard" />)
      expect(screen.getByText('Dashboard').closest('div')).toHaveClass('custom-dashboard')
    })

    it('renders custom title and subtitle', () => {
      render(<Dashboard title="Analytics Dashboard" subtitle="Monitor your business metrics" />)
      
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Monitor your business metrics')).toBeInTheDocument()
    })

    it('renders with default title when not provided', () => {
      render(<Dashboard />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Metrics Section', () => {
    it('renders metric cards when metrics are provided', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('Orders')).toBeInTheDocument()
    })

    it('formats numeric values correctly', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      expect(screen.getByText('45.2K')).toBeInTheDocument() // 45231 formatted
      expect(screen.getByText('2.3K')).toBeInTheDocument() // String value
      expect(screen.getByText('142')).toBeInTheDocument() // Small number
    })

    it('displays change indicators with correct colors', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      const positiveChanges = document.querySelectorAll('.text-green-600')
      const negativeChanges = document.querySelectorAll('.text-red-600')
      
      expect(positiveChanges.length).toBeGreaterThan(0)
      expect(negativeChanges.length).toBeGreaterThan(0)
    })

    it('shows trending icons based on change type', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      expect(document.querySelector('[data-lucide="trending-up"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="trending-down"]')).toBeInTheDocument()
    })

    it('displays metric descriptions and periods', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      expect(screen.getByText('Total revenue this month')).toBeInTheDocument()
      expect(screen.getByText('vs last month')).toBeInTheDocument()
      expect(screen.getByText('vs yesterday')).toBeInTheDocument()
    })

    it('shows loading state for metrics', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      const loadingSkeletons = document.querySelectorAll('.animate-pulse')
      expect(loadingSkeletons.length).toBeGreaterThan(0)
    })

    it('renders metric icons', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      expect(document.querySelector('[data-lucide="dollar-sign"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="users"]')).toBeInTheDocument()
      expect(document.querySelector('[data-lucide="shopping-cart"]')).toBeInTheDocument()
    })

    it('does not render metrics section when no metrics provided', () => {
      render(<Dashboard metrics={[]} />)
      
      expect(screen.queryByText('Total Revenue')).not.toBeInTheDocument()
    })
  })

  describe('Charts Section', () => {
    it('renders chart widgets when charts are provided', () => {
      render(<Dashboard charts={mockCharts} />)
      
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument()
      expect(screen.getByText('User Growth')).toBeInTheDocument()
    })

    it('displays chart descriptions', () => {
      render(<Dashboard charts={mockCharts} />)
      
      expect(screen.getByText('Monthly revenue over time')).toBeInTheDocument()
    })

    it('shows chart placeholders', () => {
      render(<Dashboard charts={mockCharts} />)
      
      expect(screen.getByText('Chart placeholder - line')).toBeInTheDocument()
      expect(screen.getByText('Integration with chart library needed')).toBeInTheDocument()
    })

    it('shows loading state for charts', () => {
      render(<Dashboard charts={mockCharts} />)
      
      const loadingChart = document.querySelector('.h-64.bg-muted.animate-pulse')
      expect(loadingChart).toBeInTheDocument()
    })

    it('applies custom height to charts', () => {
      render(<Dashboard charts={mockCharts} />)
      
      const chartContainer = screen.getByText('Revenue Trend').closest('div')
      expect(chartContainer).toHaveStyle('min-height: 350px')
    })

    it('renders expand buttons for charts', () => {
      render(<Dashboard charts={mockCharts} />)
      
      const expandButtons = document.querySelectorAll('[data-lucide="arrow-up-right"]')
      expect(expandButtons.length).toBe(mockCharts.length)
    })
  })

  describe('Activities Section', () => {
    it('renders activity feed when activities are provided', () => {
      render(<Dashboard activities={mockActivities} />)
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('New user registered')).toBeInTheDocument()
      expect(screen.getByText('Order completed')).toBeInTheDocument()
      expect(screen.getByText('System alert')).toBeInTheDocument()
    })

    it('displays activity descriptions and timestamps', () => {
      render(<Dashboard activities={mockActivities} />)
      
      expect(screen.getByText('John Doe joined the platform')).toBeInTheDocument()
      expect(screen.getByText('Order #1234 has been fulfilled')).toBeInTheDocument()
      expect(screen.getByText('5m ago')).toBeInTheDocument()
      expect(screen.getByText('30m ago')).toBeInTheDocument()
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('renders activity avatars when provided', () => {
      render(<Dashboard activities={mockActivities} />)
      
      const avatar = screen.getByAltText('')
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar1.jpg')
    })

    it('renders activity icons when no avatar', () => {
      render(<Dashboard activities={mockActivities} />)
      
      expect(document.querySelector('[data-lucide="shopping-cart"]')).toBeInTheDocument()
    })

    it('applies type-specific styling to activities', () => {
      render(<Dashboard activities={mockActivities} />)
      
      const successActivity = document.querySelector('.bg-green-100')
      const alertActivity = document.querySelector('.bg-red-100')
      
      expect(successActivity).toBeInTheDocument()
      expect(alertActivity).toBeInTheDocument()
    })

    it('shows loading state for activities', () => {
      render(<Dashboard activities={[]} loading />)
      
      const loadingActivities = document.querySelectorAll('.animate-pulse')
      expect(loadingActivities.length).toBeGreaterThan(0)
    })

    it('shows empty state when no activities', () => {
      render(<Dashboard activities={[]} />)
      
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })

    it('makes activity feed scrollable', () => {
      render(<Dashboard activities={mockActivities} />)
      
      const activityContainer = document.querySelector('.max-h-96.overflow-y-auto')
      expect(activityContainer).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('renders quick action buttons', () => {
      render(<Dashboard quickActions={mockQuickActions} />)
      
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    })

    it('calls onClick handlers when actions are clicked', () => {
      render(<Dashboard quickActions={mockQuickActions} />)
      
      fireEvent.click(screen.getByRole('button', { name: /add user/i }))
      fireEvent.click(screen.getByRole('button', { name: /export data/i }))
      
      expect(mockQuickActions[0].onClick).toHaveBeenCalled()
      expect(mockQuickActions[1].onClick).toHaveBeenCalled()
    })

    it('applies correct variant styling to actions', () => {
      render(<Dashboard quickActions={mockQuickActions} />)
      
      const primaryButton = screen.getByRole('button', { name: /add user/i })
      const outlineButton = screen.getByRole('button', { name: /export data/i })
      const secondaryButton = screen.getByRole('button', { name: /settings/i })
      
      expect(primaryButton).toHaveClass('bg-primary')
      expect(outlineButton).toHaveClass('border')
      expect(secondaryButton).toHaveClass('bg-secondary')
    })

    it('renders action icons', () => {
      render(<Dashboard quickActions={mockQuickActions} />)
      
      expect(document.querySelector('[data-lucide="users"]')).toBeInTheDocument()
    })
  })

  describe('Refresh Functionality', () => {
    it('renders refresh button when onRefresh is provided', () => {
      const onRefresh = jest.fn()
      render(<Dashboard onRefresh={onRefresh} />)
      
      const refreshButton = screen.getByTitle('Refresh dashboard')
      expect(refreshButton).toBeInTheDocument()
    })

    it('calls onRefresh when refresh button is clicked', async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined)
      render(<Dashboard onRefresh={onRefresh} />)
      
      fireEvent.click(screen.getByTitle('Refresh dashboard'))
      
      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled()
      })
    })

    it('shows loading state during refresh', async () => {
      const onRefresh = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<Dashboard onRefresh={onRefresh} />)
      
      const refreshButton = screen.getByTitle('Refresh dashboard')
      fireEvent.click(refreshButton)
      
      expect(refreshButton).toBeDisabled()
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled()
      })
    })

    it('disables refresh button when loading', () => {
      render(<Dashboard onRefresh={jest.fn()} loading />)
      
      const refreshButton = screen.getByTitle('Refresh dashboard')
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Error State', () => {
    it('renders error state when error is provided', () => {
      render(<Dashboard error="Failed to load dashboard data" />)
      
      expect(screen.getByText('Unable to load dashboard')).toBeInTheDocument()
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })

    it('shows retry button in error state', () => {
      const onRefresh = jest.fn()
      render(<Dashboard error="Network error" onRefresh={onRefresh} />)
      
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
      
      fireEvent.click(retryButton)
      expect(onRefresh).toHaveBeenCalled()
    })

    it('does not show retry button when no onRefresh provided', () => {
      render(<Dashboard error="Network error" />)
      
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })

    it('shows loading state on retry button', async () => {
      const onRefresh = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<Dashboard error="Network error" onRefresh={onRefresh} />)
      
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)
      
      expect(screen.getByText('Retrying...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText('Retrying...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Layout Variants', () => {
    it('applies default layout spacing', () => {
      render(<Dashboard layout="default" />)
      
      const container = screen.getByText('Dashboard').closest('div')
      expect(container).toHaveClass('space-y-6')
    })

    it('applies compact layout spacing', () => {
      render(<Dashboard layout="compact" />)
      
      const container = screen.getByText('Dashboard').closest('div')
      expect(container).toHaveClass('space-y-4')
    })

    it('applies minimal layout spacing', () => {
      render(<Dashboard layout="minimal" />)
      
      const container = screen.getByText('Dashboard').closest('div')
      expect(container).toHaveClass('space-y-3')
    })

    it('adjusts grid gaps based on layout', () => {
      render(<Dashboard layout="compact" metrics={mockMetrics} />)
      
      const metricsGrid = screen.getByText('Total Revenue').closest('div')?.parentElement
      expect(metricsGrid).toHaveClass('gap-4')
    })
  })

  describe('Custom Widgets', () => {
    it('renders custom widgets when provided', () => {
      const customWidget = <div data-testid="custom-widget">Custom Widget</div>
      render(<Dashboard customWidgets={customWidget} />)
      
      expect(screen.getByTestId('custom-widget')).toBeInTheDocument()
    })

    it('does not render custom widgets section when not provided', () => {
      render(<Dashboard />)
      
      expect(screen.queryByTestId('custom-widget')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Grid Layout', () => {
    it('applies responsive classes to metrics grid', () => {
      render(<Dashboard metrics={mockMetrics} />)
      
      const metricsGrid = screen.getByText('Total Revenue').closest('div')?.parentElement
      expect(metricsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
    })

    it('adjusts main content grid based on content', () => {
      render(<Dashboard charts={mockCharts} activities={mockActivities} />)
      
      const mainGrid = screen.getByText('Revenue Trend').closest('div')?.parentElement?.parentElement
      expect(mainGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
    })

    it('uses full width when only charts are present', () => {
      render(<Dashboard charts={mockCharts} />)
      
      const chartsContainer = screen.getByText('Revenue Trend').closest('div')?.parentElement
      expect(chartsContainer).toHaveClass('col-span-full')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(
        <Dashboard 
          metrics={mockMetrics.slice(0, 2)} 
          charts={mockCharts.slice(0, 1)} 
          activities={mockActivities.slice(0, 2)} 
        />
      )
    })

    it('uses proper heading hierarchy', () => {
      render(<Dashboard title="Analytics Dashboard" />)
      
      expect(screen.getByRole('heading', { level: 1, name: 'Analytics Dashboard' })).toBeInTheDocument()
    })

    it('provides proper button labels and titles', () => {
      render(<Dashboard onRefresh={jest.fn()} />)
      
      const refreshButton = screen.getByTitle('Refresh dashboard')
      expect(refreshButton).toBeInTheDocument()
    })

    it('provides alt text for activity avatars', () => {
      render(<Dashboard activities={mockActivities} />)
      
      const avatar = screen.getByAltText('')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Dashboard ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Data Formatting', () => {
    it('formats large numbers correctly', () => {
      const largeMetrics: MetricCard[] = [
        { id: '1', title: 'Large Number', value: 1234567 },
        { id: '2', title: 'Medium Number', value: 12345 },
        { id: '3', title: 'Small Number', value: 123 },
      ]
      
      render(<Dashboard metrics={largeMetrics} />)
      
      expect(screen.getByText('1.2M')).toBeInTheDocument()
      expect(screen.getByText('12.3K')).toBeInTheDocument()
      expect(screen.getByText('123')).toBeInTheDocument()
    })

    it('formats activity timestamps correctly', () => {
      const recentActivities: ActivityItem[] = [
        {
          id: '1',
          title: 'Just now',
          description: 'Recent activity',
          timestamp: new Date(),
          type: 'user',
        },
        {
          id: '2',
          title: 'Old activity',
          description: 'Old activity',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          type: 'system',
        },
      ]
      
      render(<Dashboard activities={recentActivities} />)
      
      expect(screen.getByText('Just now')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows global loading state', () => {
      render(<Dashboard loading metrics={mockMetrics} activities={mockActivities} />)
      
      const loadingElements = document.querySelectorAll('.animate-pulse')
      expect(loadingElements.length).toBeGreaterThan(0)
    })

    it('handles mixed loading states correctly', () => {
      const mixedMetrics = [
        { ...mockMetrics[0], loading: false },
        { ...mockMetrics[1], loading: true },
      ]
      
      render(<Dashboard metrics={mixedMetrics} />)
      
      expect(screen.getByText('45.2K')).toBeInTheDocument() // Not loading
      const loadingSkeletons = document.querySelectorAll('.animate-pulse')
      expect(loadingSkeletons.length).toBeGreaterThan(0) // Loading metric
    })
  })
})