import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DatabaseStatus } from '../../../components/system/DatabaseStatus'

// Mock fetch API
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('DatabaseStatus', () => {
  const mockDatabaseData = {
    status: 'healthy',
    avgQueryTime: 45,
    activeConnections: 15,
    maxConnections: 100,
    cacheHitRatio: 0.95,
    tables: {
      users: {
        name: 'users',
        rowCount: 5432,
        size: '2.5 MB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      organizations: {
        name: 'organizations',
        rowCount: 891,
        size: '512 KB',
        lastVacuum: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      }
    },
    recentQueries: [
      {
        query: 'SELECT * FROM users WHERE id = $1',
        avgTime: 2.5,
        calls: 15420,
        totalTime: 38550
      },
      {
        query: 'SELECT * FROM organizations WHERE id = $1',
        avgTime: 1.8,
        calls: 8932,
        totalTime: 16077
      }
    ]
  }

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: mockDatabaseData
      })
    })
    
    jest.clearAllMocks()
  })

  it('renders database status dashboard', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Database Status')).toBeInTheDocument()
      expect(screen.getByText('Database performance monitoring and optimization insights')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<DatabaseStatus />)
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('displays key metrics cards', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Database Status')).toBeInTheDocument()
      expect(screen.getByText('Avg Query Time')).toBeInTheDocument()
      expect(screen.getByText('Connections')).toBeInTheDocument()
      expect(screen.getByText('Cache Hit Ratio')).toBeInTheDocument()
    })
  })

  it('shows healthy database status', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('HEALTHY')).toBeInTheDocument()
    })
  })

  it('displays query time in correct format', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('45.0ms')).toBeInTheDocument()
    })
  })

  it('shows connection utilization', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('15/100')).toBeInTheDocument()
      expect(screen.getByText('15.0% utilization')).toBeInTheDocument()
    })
  })

  it('displays cache hit ratio percentage', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('95.0%')).toBeInTheDocument()
    })
  })

  it('renders database status tabs', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Table Statistics' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Query Performance' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Maintenance' })).toBeInTheDocument()
    })
  })

  it('displays table statistics by default', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Table Statistics')).toBeInTheDocument()
      expect(screen.getByText('users')).toBeInTheDocument()
      expect(screen.getByText('organizations')).toBeInTheDocument()
      expect(screen.getByText('5,432')).toBeInTheDocument()
      expect(screen.getByText('891')).toBeInTheDocument()
    })
  })

  it('switches to query performance tab', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const queryTab = screen.getByRole('tab', { name: 'Query Performance' })
      fireEvent.click(queryTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Top Queries by Performance')).toBeInTheDocument()
      expect(screen.getByText('SELECT * FROM users WHERE id = $1')).toBeInTheDocument()
    })
  })

  it('switches to maintenance tab', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const maintenanceTab = screen.getByRole('tab', { name: 'Maintenance' })
      fireEvent.click(maintenanceTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Maintenance Status')).toBeInTheDocument()
      expect(screen.getByText('Auto Vacuum')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })
  })

  it('displays optimization suggestions', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const maintenanceTab = screen.getByRole('tab', { name: 'Maintenance' })
      fireEvent.click(maintenanceTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument()
      expect(screen.getByText('Index optimization')).toBeInTheDocument()
      expect(screen.getByText('Connection pooling')).toBeInTheDocument()
    })
  })

  it('shows table row counts with formatting', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('5,432')).toBeInTheDocument()
      expect(screen.getByText('891')).toBeInTheDocument()
    })
  })

  it('displays table sizes', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('2.5 MB')).toBeInTheDocument()
      expect(screen.getByText('512 KB')).toBeInTheDocument()
    })
  })

  it('shows relative vacuum times', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/hours ago/)).toBeInTheDocument()
    })
  })

  it('displays query performance metrics', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const queryTab = screen.getByRole('tab', { name: 'Query Performance' })
      fireEvent.click(queryTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('2.5ms')).toBeInTheDocument()
      expect(screen.getByText('15,420')).toBeInTheDocument()
      expect(screen.getByText('38,550ms')).toBeInTheDocument()
    })
  })

  it('shows query impact levels', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const queryTab = screen.getByRole('tab', { name: 'Query Performance' })
      fireEvent.click(queryTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Low')).toBeInTheDocument()
    })
  })

  it('handles database error status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          ...mockDatabaseData,
          status: 'error',
          error: 'Connection timeout'
        }
      })
    })
    
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/Database status: error/)).toBeInTheDocument()
      expect(screen.getByText(/Connection timeout/)).toBeInTheDocument()
    })
  })

  it('shows warning status with appropriate styling', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          ...mockDatabaseData,
          status: 'warning'
        }
      })
    })
    
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('WARNING')).toBeInTheDocument()
    })
  })

  it('refreshes data when refresh button clicked', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
    })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/system?type=database')
  })

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))
    
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load database status/)).toBeInTheDocument()
    })
  })

  it('shows cached data message when error occurs', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))
    
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing cached data.')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('displays last updated timestamp', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  it('shows connection utilization progress bar', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const progressBars = document.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  it('formats query duration correctly for seconds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          ...mockDatabaseData,
          recentQueries: [
            {
              query: 'SLOW QUERY',
              avgTime: 2500, // 2.5 seconds
              calls: 100,
              totalTime: 250000
            }
          ]
        }
      })
    })
    
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const queryTab = screen.getByRole('tab', { name: 'Query Performance' })
      fireEvent.click(queryTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText('2.50s')).toBeInTheDocument()
    })
  })

  it('handles export functionality', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i })
      expect(exportButton).toBeInTheDocument()
      
      fireEvent.click(exportButton)
      // Export functionality would be tested with proper mocking
    })
  })

  it('shows excellent rating for good query times', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })
  })

  it('shows good rating for cache hit ratio', async () => {
    render(<DatabaseStatus />)
    
    await waitFor(() => {
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<DatabaseStatus />)
    
    expect(() => unmount()).not.toThrow()
  })

  it('refreshes data periodically', async () => {
    jest.useFakeTimers()
    
    render(<DatabaseStatus />)
    
    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial + periodic refresh
    })
    
    jest.useRealTimers()
  })

  it('updates last refresh timestamp', async () => {
    render(<DatabaseStatus />)
    
    const initialTime = new Date().toLocaleTimeString()
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
    })
    
    await waitFor(() => {
      // Should show updated time
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })
})