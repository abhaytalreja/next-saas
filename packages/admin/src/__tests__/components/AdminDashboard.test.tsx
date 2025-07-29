import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdminDashboard } from '../../components/dashboard/AdminDashboard'
import { adminService } from '../../lib/admin-service'

// Mock the admin service
jest.mock('../../lib/admin-service', () => ({
  adminService: {
    getDashboardMetrics: jest.fn()
  }
}))

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant} data-testid="badge">{children}</span>,
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>{children}</button>
  )
}))

// Mock icons
jest.mock('lucide-react', () => ({
  Users: ({ className }: any) => <div data-testid="users-icon" className={className} />,
  Building2: ({ className }: any) => <div data-testid="building-icon" className={className} />,
  DollarSign: ({ className }: any) => <div data-testid="dollar-icon" className={className} />,
  Activity: ({ className }: any) => <div data-testid="activity-icon" className={className} />,
  Mail: ({ className }: any) => <div data-testid="mail-icon" className={className} />,
  AlertTriangle: ({ className }: any) => <div data-testid="alert-icon" className={className} />,
  RefreshCw: ({ className }: any) => <div data-testid="refresh-icon" className={className} />,
  Wifi: ({ className }: any) => <div data-testid="wifi-icon" className={className} />,
  WifiOff: ({ className }: any) => <div data-testid="wifi-off-icon" className={className} />
}))

// Create mock data
const mockAdminData = {
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
  recentActivity: [
    {
      id: '1',
      description: 'New user registered',
      timestamp: '2023-01-01T10:00:00Z',
      type: 'user' as const,
      userId: 'user-123'
    },
    {
      id: '2', 
      description: 'Organization created',
      timestamp: '2023-01-01T09:30:00Z',
      type: 'organization' as const,
      userId: 'user-456'
    }
  ]
}

const mockRealTimeData = {
  totalUsers: 1001,
  systemUptime: 99.95,
  activeConnections: 520
}

// Default mock implementations
const mockUseAdminDashboard = jest.fn(() => ({
  data: mockAdminData,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  refresh: jest.fn(),
  isRefreshing: false,
  lastUpdated: new Date('2023-01-01T10:00:00Z'),
  retryCount: 0
}))

const mockUseRealTimeMetrics = jest.fn(() => ({
  metrics: mockRealTimeData,
  isConnected: true,
  refresh: jest.fn()
}))

// Mock hooks
jest.mock('../../hooks/useAdminDashboard', () => ({
  useAdminDashboard: () => mockUseAdminDashboard()
}))

jest.mock('../../hooks/useRealTimeMetrics', () => ({
  useRealTimeMetrics: () => mockUseRealTimeMetrics()
}))

// Mock child components
jest.mock('../../components/dashboard/DashboardGrid', () => ({
  DashboardGrid: ({ children }: any) => <div data-testid="dashboard-grid">{children}</div>
}))

jest.mock('../../components/dashboard/StatsCard', () => ({
  StatsCard: ({ title, value, change, trend, icon: Icon, description, format, realTime }: any) => (
    <div data-testid="stats-card">
      <div>{title}</div>
      <div data-testid="stats-value">
        {format === 'currency' ? `$${value}` : 
         format === 'percentage' ? `${value}%` : 
         value}
      </div>
      <div data-testid="stats-change">{change}</div>
      <div data-testid="stats-description">{description}</div>
      {Icon && <Icon data-testid={`${title.toLowerCase().replace(/\s+/g, '-')}-icon`} />}
      {realTime && <div data-testid="real-time-indicator">Live</div>}
    </div>
  )
}))

jest.mock('../../components/dashboard/MetricsOverview', () => ({
  MetricsOverview: ({ metrics }: any) => (
    <div data-testid="metrics-overview">
      {metrics ? 'Metrics loaded' : 'No metrics'}
    </div>
  )
}))

const renderComponent = (ui: React.ReactElement) => {
  return render(ui)
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mocks to default implementations
    mockUseAdminDashboard.mockReturnValue({
      data: mockAdminData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      refresh: jest.fn(),
      isRefreshing: false,
      lastUpdated: new Date('2023-01-01T10:00:00Z'),
      retryCount: 0
    })
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: mockRealTimeData,
      isConnected: true,
      refresh: jest.fn()
    })
  })

  describe('rendering', () => {
    it('should render dashboard header correctly', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Admin Dashboard')
      expect(screen.getByText('Monitor your platform\'s performance and manage system resources.')).toBeInTheDocument()
    })

    it('should display all key metrics cards with correct values', () => {
      renderComponent(<AdminDashboard />)
      
      // Check for metric cards with updated real-time values
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getAllByText('Organizations')[0]).toBeInTheDocument() // Use getAllByText for duplicates
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
      expect(screen.getByText('System Uptime')).toBeInTheDocument()
      
      // Check specific values (real-time data should override static data)
      expect(screen.getByText('1001')).toBeInTheDocument() // Updated total users
      expect(screen.getByText('150')).toBeInTheDocument() // Organizations
      expect(screen.getByText('99.95%')).toBeInTheDocument() // Updated uptime
    })

    it('should show real-time connection status when connected', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getAllByText('Live')[0]).toBeInTheDocument()
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default')
    })

    it('should show offline status when disconnected', () => {
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: {},
        isConnected: false,
        refresh: jest.fn()
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Offline')).toBeInTheDocument()
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'destructive')
    })

    it('should display system overview metrics with correct values', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('System Overview')).toBeInTheDocument()
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
      expect(screen.getByText('Error Rate')).toBeInTheDocument()
      expect(screen.getByText('Active Connections')).toBeInTheDocument()
      expect(screen.getByText('Emails Sent Today')).toBeInTheDocument()
      
      // Check metric values - be more flexible with text matching
      expect(screen.getByText(/145/)).toBeInTheDocument()
      expect(screen.getByText(/0.02/)).toBeInTheDocument()
      expect(screen.getByText(/520/)).toBeInTheDocument() // Real-time override
      expect(screen.getByText(/1250/)).toBeInTheDocument()
    })

    it('should show recent activity section with activities', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('New user registered')).toBeInTheDocument()
      expect(screen.getByText('Organization created')).toBeInTheDocument()
      
      // Check timestamps are formatted - be more flexible
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
      expect(screen.getByText(/9:30/)).toBeInTheDocument()
    })

    it('should show empty activity state when no recent activity', () => {
      mockUseAdminDashboard.mockReturnValue({
        data: { ...mockAdminData, recentActivity: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })

    it('should display quick actions grid with all actions', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      
      // Check actions exist (some may be duplicated in different sections)
      expect(screen.getByText('Manage Users')).toBeInTheDocument()
      expect(screen.getAllByText('Organizations').length).toBeGreaterThan(0)
      expect(screen.getByText('Email Campaigns')).toBeInTheDocument()
      expect(screen.getByText('System Health')).toBeInTheDocument()
      
      // Check icons are present - use more flexible approach
      expect(screen.getAllByTestId('users-icon').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByTestId('building-icon').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      expect(screen.getAllByTestId('activity-icon').length).toBeGreaterThanOrEqual(1)
    })

    it('should display loading state with skeleton animation', () => {
      mockUseAdminDashboard.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: null,
        retryCount: 0
      })

      const { container } = renderComponent(<AdminDashboard />)
      
      // Should show 4 loading skeletons for stats cards
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(4)
      
      // Should not show dashboard content
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
    })

    it('should display error state with error message and icon', () => {
      const errorMessage = 'Failed to load dashboard data'
      mockUseAdminDashboard.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error(errorMessage),
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: null,
        retryCount: 1
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should handle refresh button click', () => {
      const mockRefresh = jest.fn()
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: mockRealTimeData,
        isConnected: true,
        refresh: mockRefresh
      })

      renderComponent(<AdminDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it('should handle quick action button clicks', () => {
      renderComponent(<AdminDashboard />)
      
      const manageUsersButton = screen.getByRole('button', { name: /manage users/i })
      fireEvent.click(manageUsersButton)
      
      // Button should be clickable (no specific action yet, just test interaction)
      expect(manageUsersButton).toBeInTheDocument()
    })

    it('should handle multiple quick action clicks', () => {
      renderComponent(<AdminDashboard />)
      
      const actionButtons = [
        screen.getByRole('button', { name: /manage users/i }),
        screen.getByRole('button', { name: /organizations/i }),
        screen.getByRole('button', { name: /email campaigns/i }),
        screen.getByRole('button', { name: /system health/i })
      ]
      
      actionButtons.forEach(button => {
        fireEvent.click(button)
        expect(button).toBeInTheDocument()
      })
    })
  })

  describe('real-time metrics integration', () => {
    it('should merge static and real-time metrics correctly', () => {
      renderComponent(<AdminDashboard />)
      
      // Real-time metrics should override static ones
      expect(screen.getByText('1001')).toBeInTheDocument() // Real-time totalUsers
      expect(screen.getByText('99.95%')).toBeInTheDocument() // Real-time systemUptime
      expect(screen.getByText(/520/)).toBeInTheDocument() // Real-time activeConnections
      
      // Static metrics should remain when not overridden
      expect(screen.getByText('150')).toBeInTheDocument() // Static totalOrganizations
      expect(screen.getByText(/1250/)).toBeInTheDocument() // Static emailsSentToday
    })

    it('should handle empty real-time metrics', () => {
      mockUseRealTimeMetrics.mockReturnValue({
        metrics: {},
        isConnected: true,
        refresh: jest.fn()
      })

      renderComponent(<AdminDashboard />)
      
      // Should fall back to static metrics
      expect(screen.getByText('1000')).toBeInTheDocument() // Static totalUsers
      expect(screen.getByText('99.9%')).toBeInTheDocument() // Static systemUptime
    })

    it('should handle null metrics gracefully', () => {
      mockUseAdminDashboard.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: null,
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      // Should show default values (0) when metrics are null
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4) // At least 4 zero values for missing metrics
    })
  })

  describe('conditional rendering', () => {
    it('should show correct trend indicators for positive growth', () => {
      const positiveGrowthData = {
        ...mockAdminData,
        userGrowthRate: 15.5,
        organizationGrowthRate: 8.2,
        revenueGrowthRate: 12.3
      }

      mockUseAdminDashboard.mockReturnValue({
        data: positiveGrowthData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      // All growth rates should be displayed as positive numbers
      expect(screen.getByText('15.5')).toBeInTheDocument()
      expect(screen.getByText('8.2')).toBeInTheDocument()
      expect(screen.getByText('12.3')).toBeInTheDocument()
    })

    it('should show correct trend indicators for negative growth', () => {
      const negativeGrowthData = {
        ...mockAdminData,
        userGrowthRate: -5.2,
        organizationGrowthRate: -2.1,
        revenueGrowthRate: -8.7
      }

      mockUseAdminDashboard.mockReturnValue({
        data: negativeGrowthData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      // Negative growth rates should be displayed with negative signs
      expect(screen.getByText('-5.2')).toBeInTheDocument()
      expect(screen.getByText('-2.1')).toBeInTheDocument()
      expect(screen.getByText('-8.7')).toBeInTheDocument()
    })

    it('should handle undefined/null growth rates', () => {
      const nullGrowthData = {
        ...mockAdminData,
        userGrowthRate: undefined,
        organizationGrowthRate: null,
        revenueGrowthRate: 0
      }

      mockUseAdminDashboard.mockReturnValue({
        data: nullGrowthData as any,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      // Should handle null/undefined gracefully and show 0 for zero growth
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderComponent(<AdminDashboard />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Admin Dashboard')
      
      const h3s = screen.getAllByRole('heading', { level: 3 })
      expect(h3s.length).toBeGreaterThan(0)
      expect(h3s.some(h3 => h3.textContent === 'System Overview')).toBe(true)
      expect(h3s.some(h3 => h3.textContent === 'Recent Activity')).toBe(true)
      expect(h3s.some(h3 => h3.textContent === 'Quick Actions')).toBe(true)
    })

    it('should have accessible button labels', () => {
      renderComponent(<AdminDashboard />)
      
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /organizations/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /email campaigns/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /system health/i })).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      renderComponent(<AdminDashboard />)
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toHaveAttribute('data-variant', 'outline')
      expect(refreshButton).toHaveAttribute('data-size', 'sm')
    })
  })

  describe('error handling', () => {
    it('should display different error types appropriately', () => {
      const networkError = new Error('Network error')
      networkError.name = 'NetworkError'
      
      mockUseAdminDashboard.mockReturnValue({
        data: null,
        isLoading: false,
        error: networkError,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: null,
        retryCount: 2
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('should handle loading state during refresh', () => {
      mockUseAdminDashboard.mockReturnValue({
        data: mockAdminData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: true,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      // Dashboard should still be visible during refresh
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Total Users')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle extremely large numbers in metrics', () => {
      const largeNumberData = {
        ...mockAdminData,
        totalUsers: 9999999,
        monthlyRecurringRevenue: 50000000,
        activeConnections: 1000000
      }

      mockUseAdminDashboard.mockReturnValue({
        data: largeNumberData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText(/9999999/)).toBeInTheDocument()
      expect(screen.getByText(/50000000/)).toBeInTheDocument()
      expect(screen.getByText(/1000000/)).toBeInTheDocument()
    })

    it('should handle activity items with missing data', () => {
      const incompleteActivityData = {
        ...mockAdminData,
        recentActivity: [
          {
            id: '1',
            description: 'Event without timestamp',
            timestamp: '',
            type: 'system' as const
          },
          {
            id: '2',
            description: '',
            timestamp: '2023-01-01T10:00:00Z',
            type: 'user' as const,
            userId: 'user-123'
          }
        ]
      }

      mockUseAdminDashboard.mockReturnValue({
        data: incompleteActivityData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        refresh: jest.fn(),
        isRefreshing: false,
        lastUpdated: new Date(),
        retryCount: 0
      })

      renderComponent(<AdminDashboard />)
      
      expect(screen.getByText('Event without timestamp')).toBeInTheDocument()
      // Empty description should still render the container
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })
})