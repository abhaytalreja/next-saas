import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PerformanceMetrics } from '../../../components/system/PerformanceMetrics'
import { useRealTimeMetrics } from '../../../hooks/useRealTimeMetrics'

// Mock the useRealTimeMetrics hook
jest.mock('../../../hooks/useRealTimeMetrics')
const mockUseRealTimeMetrics = useRealTimeMetrics as jest.MockedFunction<typeof useRealTimeMetrics>

// Mock fetch API
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('PerformanceMetrics', () => {
  beforeEach(() => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {
        cpuUsage: 45,
        memoryUsage: 65,
        diskUsage: 25,
        activeConnections: 1200
      },
      isConnected: true,
      refresh: jest.fn()
    })
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          current: {
            cpuUsage: 45,
            memoryUsage: 65,
            diskUsage: 25,
            networkIO: 750,
            activeConnections: 1200,
            requestsPerSecond: 85
          },
          timeSeries: [],
          thresholds: {
            cpu: { warning: 70, critical: 85 },
            memory: { warning: 80, critical: 90 },
            disk: { warning: 80, critical: 95 },
            connections: { warning: 1000, critical: 1500 }
          }
        }
      })
    })
    
    jest.clearAllMocks()
  })

  it('renders performance metrics dashboard', async () => {
    render(<PerformanceMetrics />)
    
    await waitForElementToBeRemoved(() => screen.queryByTestId('loading'))
    
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument()
    expect(screen.getByText('Real-time system performance monitoring and resource utilization')).toBeInTheDocument()
  })

  const waitForElementToBeRemoved = async (callback: () => HTMLElement | null) => {
    await waitFor(() => {
      expect(callback()).not.toBeInTheDocument()
    }, { timeout: 3000 })
  }

  it('displays connection status indicator', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Live monitoring')).toBeInTheDocument()
    })
  })

  it('shows offline status when disconnected', async () => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: false,
      refresh: jest.fn()
    })
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<PerformanceMetrics />)
    
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('displays performance metric cards', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('CPU Usage')).toBeInTheDocument()
      expect(screen.getByText('Memory Usage')).toBeInTheDocument()
      expect(screen.getByText('Disk Usage')).toBeInTheDocument()
      expect(screen.getByText('Network I/O')).toBeInTheDocument()
      expect(screen.getByText('Active Connections')).toBeInTheDocument()
      expect(screen.getByText('Requests/Second')).toBeInTheDocument()
    })
  })

  it('shows CPU usage with correct percentage', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('45.0%')).toBeInTheDocument()
    })
  })

  it('displays progress bars for resource utilization', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      const progressBars = document.querySelectorAll('[role="progressbar"]')
      expect(progressBars.length).toBeGreaterThan(0)
    })
  })

  it('shows threshold indicators', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Warning: 70%')).toBeInTheDocument()
      expect(screen.getByText('Critical: 85%')).toBeInTheDocument()
    })
  })

  it('displays critical alerts when thresholds exceeded', async () => {
    // Mock high CPU usage exceeding critical threshold
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          current: {
            cpuUsage: 90, // Above critical threshold
            memoryUsage: 65,
            diskUsage: 25,
            networkIO: 750,
            activeConnections: 1200,
            requestsPerSecond: 85
          },
          thresholds: {
            cpu: { warning: 70, critical: 85 },
            memory: { warning: 80, critical: 90 },
            disk: { warning: 80, critical: 95 },
            connections: { warning: 1000, critical: 1500 }
          }
        }
      })
    })
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText(/Critical performance issues detected/)).toBeInTheDocument()
      expect(screen.getByText(/CPU usage critical: 90.0%/)).toBeInTheDocument()
    })
  })

  it('formats network IO correctly', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText(/MB\/s/)).toBeInTheDocument()
    })
  })

  it('formats active connections with commas', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('1,200')).toBeInTheDocument()
    })
  })

  it('refreshes data when refresh button clicked', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
    })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/system?type=performance')
  })

  it('handles API error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load performance metrics/)).toBeInTheDocument()
    })
  })

  it('shows cached data message when error occurs', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Showing cached data.')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  it('displays resource utilization summary', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Resource Utilization Summary')).toBeInTheDocument()
    })
  })

  it('shows status badges for each resource', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('Normal')).toBeInTheDocument()
    })
  })

  it('displays average values in summary', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText(/Avg \(24h\):/)).toBeInTheDocument()
    })
  })

  it('handles export functionality', async () => {
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i })
      expect(exportButton).toBeInTheDocument()
      
      fireEvent.click(exportButton)
      // Export functionality would be tested with proper mocking
    })
  })

  it('updates metrics from real-time data', async () => {
    const mockMetrics = {
      cpuUsage: 55,
      memoryUsage: 75,
      diskUsage: 30,
      activeConnections: 1300
    }
    
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: mockMetrics,
      isConnected: true,
      refresh: jest.fn()
    })
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      expect(screen.getByText('55.0%')).toBeInTheDocument()
      expect(screen.getByText('75.0%')).toBeInTheDocument()
    })
  })

  it('shows correct status icons based on thresholds', async () => {
    // Mock warning level CPU usage
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          current: {
            cpuUsage: 75, // Warning level
            memoryUsage: 65,
            diskUsage: 25,
            networkIO: 750,
            activeConnections: 1200,
            requestsPerSecond: 85
          },
          thresholds: {
            cpu: { warning: 70, critical: 85 },
            memory: { warning: 80, critical: 90 },
            disk: { warning: 80, critical: 95 },
            connections: { warning: 1000, critical: 1500 }
          }
        }
      })
    })
    
    render(<PerformanceMetrics />)
    
    await waitFor(() => {
      // Should show warning status for CPU
      const statusIcons = document.querySelectorAll('svg')
      expect(statusIcons.length).toBeGreaterThan(0)
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<PerformanceMetrics />)
    
    expect(() => unmount()).not.toThrow()
  })

  it('refreshes data periodically', async () => {
    jest.useFakeTimers()
    
    render(<PerformanceMetrics />)
    
    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2) // Initial + periodic refresh
    })
    
    jest.useRealTimers()
  })

  it('clears interval on unmount', () => {
    jest.useFakeTimers()
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    const { unmount } = render(<PerformanceMetrics />)
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
    
    jest.useRealTimers()
  })
})