import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { APIStatus } from '../APIStatus'

expect.extend(toHaveNoViolations)

// Mock fetch
global.fetch = jest.fn()

// Mock UI components
jest.mock('@nextsaas/ui', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className} data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <h3 className={className} data-testid="card-title">{children}</h3>,
  Progress: ({ value, className }: any) => <div className={className} data-testid="progress" data-value={value} />,
  Button: ({ children, onClick, variant, size, disabled }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  ),
  Badge: ({ children, variant, className }: any) => (
    <span data-variant={variant} className={className} data-testid="badge">{children}</span>
  ),
  Alert: ({ children, className }: any) => <div className={className} data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children, className }: any) => <td className={className} data-testid="table-cell">{children}</td>,
  TableHead: ({ children, className }: any) => <th className={className} data-testid="table-head">{children}</th>,
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
  Tabs: ({ children, value, onValueChange, defaultValue }: any) => (
    <div data-testid="tabs" data-value={value}>{children}</div>
  ),
  TabsContent: ({ children, value }: any) => <div data-testid="tabs-content" data-value={value}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>{children}</button>
  ),
  Input: ({ placeholder, value, onChange, className }: any) => (
    <input 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange}
      className={className}
      data-testid="input"
    />
  ),
  Select: ({ value, onChange, options, className }: any) => (
    <select value={value} onChange={onChange} className={className} data-testid="select">
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  ),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Globe: ({ className }: any) => <div data-testid="globe-icon" className={className} />,
  Activity: ({ className }: any) => <div data-testid="activity-icon" className={className} />,
  Clock: ({ className }: any) => <div data-testid="clock-icon" className={className} />,
  AlertCircle: ({ className }: any) => <div data-testid="alert-circle-icon" className={className} />,
  CheckCircle: ({ className }: any) => <div data-testid="check-circle-icon" className={className} />,
  Shield: ({ className }: any) => <div data-testid="shield-icon" className={className} />,
  BarChart3: ({ className }: any) => <div data-testid="bar-chart-icon" className={className} />,
  TrendingUp: ({ className }: any) => <div data-testid="trending-up-icon" className={className} />,
  TrendingDown: ({ className }: any) => <div data-testid="trending-down-icon" className={className} />,
  RefreshCw: ({ className }: any) => <div data-testid="refresh-icon" className={className} />,
  Download: ({ className }: any) => <div data-testid="download-icon" className={className} />,
  Filter: ({ className }: any) => <div data-testid="filter-icon" className={className} />,
  Search: ({ className }: any) => <div data-testid="search-icon" className={className} />,
}))

const mockAPIData = {
  endpoints: [
    {
      path: '/api/auth/sign-in',
      method: 'POST',
      status: 'healthy' as const,
      avgResponseTime: 145,
      requestCount: 15420,
      errorRate: 0.01,
      lastError: null
    },
    {
      path: '/api/users',
      method: 'GET',
      status: 'warning' as const,
      avgResponseTime: 250,
      requestCount: 28340,
      errorRate: 0.02,
      lastError: new Date().toISOString()
    }
  ],
  rateLimiting: {
    enabled: true,
    defaultLimit: 100,
    windowSize: 900,
    currentRequests: 847,
    blockedRequests: 23
  },
  errors: [
    {
      id: '1',
      endpoint: '/api/billing/subscriptions',
      method: 'POST',
      statusCode: 500,
      message: 'Payment provider connection timeout',
      timestamp: new Date().toISOString(),
      count: 8
    }
  ]
}

describe('APIStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockAPIData })
    })
  })

  describe('rendering', () => {
    it('should render loading state initially', () => {
      render(<APIStatus />)
      
      expect(screen.getByTestId('api-status-loading')).toBeInTheDocument()
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(4)
    })

    it('should render main content after loading', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-status-main')).toBeInTheDocument()
      })
      
      expect(screen.getByText('API Status')).toBeInTheDocument()
      expect(screen.getByText('API endpoint monitoring and performance analytics')).toBeInTheDocument()
    })

    it('should render header with correct elements', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-status-header')).toBeInTheDocument()
      })
      
      expect(screen.getByRole('heading', { level: 2, name: 'API Status' })).toBeInTheDocument()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    })

    it('should render key metrics cards', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('metrics-grid')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Total Endpoints')).toBeInTheDocument()
      expect(screen.getByText('Total Requests')).toBeInTheDocument()
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
      expect(screen.getByText('Rate Limiting')).toBeInTheDocument()
    })
  })

  describe('data loading', () => {
    it('should fetch API data on mount', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admin/system?type=api')
      })
    })

    it('should handle successful API response', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // Total endpoints
      })
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
      
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-error-alert')).toBeInTheDocument()
      })
      
      expect(screen.getByText(/Failed to load API status/)).toBeInTheDocument()
    })

    it('should show cached data message when API fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByText(/Showing cached data/)).toBeInTheDocument()
      })
    })
  })

  describe('refresh functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      })
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)
      
      expect(global.fetch).toHaveBeenCalledTimes(2) // Initial load + refresh
    })

    it('should update last refresh time', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const timeElement = screen.getByText(/Last updated:/)
        expect(timeElement).toBeInTheDocument()
      })
    })
  })

  describe('filtering functionality', () => {
    it('should filter endpoints by search term', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('endpoints-tab')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText('Search endpoints...')
      await user.type(searchInput, 'auth')
      
      // Should filter to show only auth endpoint
      expect(screen.getByText('/api/auth/sign-in')).toBeInTheDocument()
    })

    it('should filter endpoints by status', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('status-filter')).toBeInTheDocument()
      })
      
      const statusFilter = screen.getByTestId('status-filter')
      fireEvent.change(statusFilter, { target: { value: 'healthy' } })
      
      // Should filter to show only healthy endpoints
      await waitFor(() => {
        expect(screen.getByText('/api/auth/sign-in')).toBeInTheDocument()
      })
    })

    it('should filter endpoints by method', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('method-filter')).toBeInTheDocument()
      })
      
      const methodFilter = screen.getByTestId('method-filter')
      fireEvent.change(methodFilter, { target: { value: 'POST' } })
      
      // Should filter to show only POST endpoints
      await waitFor(() => {
        expect(screen.getByText('/api/auth/sign-in')).toBeInTheDocument()
      })
    })
  })

  describe('tab navigation', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /endpoints/i })).toBeInTheDocument()
      })
      
      const errorsTab = screen.getByRole('tab', { name: /error log/i })
      await user.click(errorsTab)
      
      expect(screen.getByText('Recent API Errors')).toBeInTheDocument()
    })

    it('should show rate limiting tab content', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /rate limiting/i })).toBeInTheDocument()
      })
      
      const rateLimitingTab = screen.getByRole('tab', { name: /rate limiting/i })
      await user.click(rateLimitingTab)
      
      expect(screen.getByText('Rate Limiting Configuration')).toBeInTheDocument()
      expect(screen.getByText('Rate Limiting Statistics')).toBeInTheDocument()
    })
  })

  describe('metrics calculation', () => {
    it('should calculate total requests correctly', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const totalRequests = 15420 + 28340 // Sum of request counts
        expect(screen.getByText(totalRequests.toLocaleString())).toBeInTheDocument()
      })
    })

    it('should calculate average response time correctly', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const avgResponseTime = Math.round((145 + 250) / 2) // Average of response times
        expect(screen.getByText(`${avgResponseTime}ms`)).toBeInTheDocument()
      })
    })

    it('should count error and warning endpoints', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByText('1 healthy')).toBeInTheDocument()
        expect(screen.getByText('1 warning')).toBeInTheDocument()
      })
    })
  })

  describe('status indicators', () => {
    it('should show correct status icons', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument() // Healthy
        expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument() // Warning
      })
    })

    it('should apply correct status colors', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const healthyBadge = screen.getByText('healthy')
        expect(healthyBadge).toHaveClass('text-green-600', 'bg-green-100')
        
        const warningBadge = screen.getByText('warning')
        expect(warningBadge).toHaveClass('text-orange-600', 'bg-orange-100')
      })
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-status-main')).toBeInTheDocument()
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 2 })
        expect(mainHeading).toHaveTextContent('API Status')
      })
    })

    it('should have accessible form controls', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        const searchInput = screen.getByLabelText(/search endpoints/i)
        expect(searchInput).toBeInTheDocument()
        
        const statusFilter = screen.getByLabelText(/filter by status/i)
        expect(statusFilter).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      })
      
      // Tab to refresh button
      await user.tab()
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toHaveFocus()
    })
  })

  describe('error states', () => {
    it('should show error alert when endpoints have errors', async () => {
      const errorData = {
        ...mockAPIData,
        endpoints: [
          ...mockAPIData.endpoints,
          {
            path: '/api/error',
            method: 'GET',
            status: 'error' as const,
            avgResponseTime: 1000,
            requestCount: 100,
            errorRate: 0.5,
            lastError: new Date().toISOString()
          }
        ]
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: errorData })
      })
      
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByText(/experiencing errors/)).toBeInTheDocument()
      })
    })

    it('should handle empty API data', async () => {
      const emptyData = { 
        endpoints: [], 
        rateLimiting: {
          enabled: true,
          defaultLimit: 100,
          windowSize: 900,
          currentRequests: 0,
          blockedRequests: 0
        }, 
        errors: [] 
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: emptyData })
      })
      
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-status-main')).toBeInTheDocument()
      })
      
      // Check for total endpoints count
      const totalEndpointsCard = screen.getAllByTestId('card')[0]
      expect(totalEndpointsCard).toHaveTextContent('0')
    })
  })

  describe('auto-refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })
    
    afterEach(() => {
      jest.useRealTimers()
    })
    
    it('should auto-refresh data every 30 seconds', async () => {
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
      
      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('performance', () => {
    it('should render within performance budget', async () => {
      const startTime = performance.now()
      
      render(<APIStatus />)
      
      await waitFor(() => {
        expect(screen.getByTestId('api-status-main')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in reasonable time for complex component
      expect(renderTime).toBeLessThan(200)
    })

    it('should not cause memory leaks', () => {
      const { unmount } = render(<APIStatus />)
      
      expect(() => unmount()).not.toThrow()
    })
  })
})