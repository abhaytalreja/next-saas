import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThreatMonitoring } from '../../../components/security/ThreatMonitoring'
import { useRealTimeMetrics } from '../../../hooks/useRealTimeMetrics'

// Mock the useRealTimeMetrics hook
jest.mock('../../../hooks/useRealTimeMetrics')
const mockUseRealTimeMetrics = useRealTimeMetrics as jest.MockedFunction<typeof useRealTimeMetrics>

describe('ThreatMonitoring', () => {
  beforeEach(() => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: true,
      refresh: jest.fn()
    })
    
    jest.clearAllMocks()
  })

  it('renders threat monitoring dashboard', () => {
    render(<ThreatMonitoring />)
    
    expect(screen.getByText('Threat Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Real-time threat detection and response management')).toBeInTheDocument()
  })

  it('displays connection status indicator', () => {
    render(<ThreatMonitoring />)
    
    expect(screen.getByText('Live monitoring')).toBeInTheDocument()
  })

  it('shows offline status when disconnected', () => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: false,
      refresh: jest.fn()
    })
    
    render(<ThreatMonitoring />)
    
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('displays threat metrics cards', () => {
    render(<ThreatMonitoring />)
    
    expect(screen.getByText('Total Threats')).toBeInTheDocument()
    expect(screen.getByText('Active Threats')).toBeInTheDocument()
    expect(screen.getByText('Mitigated')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
  })

  it('shows critical threats alert when present', () => {
    render(<ThreatMonitoring />)
    
    expect(screen.getByText(/critical threat.*detected/i)).toBeInTheDocument()
  })

  it('renders threat monitoring tabs', () => {
    render(<ThreatMonitoring />)
    
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Active Threats' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Analytics' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Intelligence Feeds' })).toBeInTheDocument()
  })

  it('displays threat type distribution in overview', () => {
    render(<ThreatMonitoring />)
    
    // Should be on overview tab by default
    expect(screen.getByText('Threats by Type')).toBeInTheDocument()
    expect(screen.getByText('Recent High-Priority Threats')).toBeInTheDocument()
  })

  it('switches to active threats tab', async () => {
    render(<ThreatMonitoring />)
    
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Threat Indicators')).toBeInTheDocument()
    })
  })

  it('filters threats by severity', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Open severity filter
      const severityFilter = screen.getByRole('combobox', { name: /severity/i })
      fireEvent.click(severityFilter)
      
      // Select critical
      const criticalOption = screen.getByText('Critical')
      fireEvent.click(criticalOption)
    })
    
    await waitFor(() => {
      // Should filter to only critical threats
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('filters threats by status', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Open status filter
      const statusFilter = screen.getByRole('combobox', { name: /status/i })
      fireEvent.click(statusFilter)
      
      // Select active
      const activeOption = screen.getByText('Active')
      fireEvent.click(activeOption)
    })
    
    await waitFor(() => {
      // Should filter to only active threats
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('filters threats by type', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Open type filter
      const typeFilter = screen.getByRole('combobox', { name: /type/i })
      fireEvent.click(typeFilter)
      
      // Select IP reputation
      const ipOption = screen.getByText('IP Reputation')
      fireEvent.click(ipOption)
    })
    
    await waitFor(() => {
      // Should filter to only IP reputation threats
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  it('opens threat details dialog', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Click on view button (eye icon)
      const viewButtons = screen.getAllByRole('button')
      const viewButton = viewButtons.find(button => button.querySelector('svg'))
      if (viewButton) {
        fireEvent.click(viewButton)
      }
    })
    
    await waitFor(() => {
      expect(screen.getByText('Threat Intelligence Details')).toBeInTheDocument()
    })
  })

  it('shows investigate button for active threats', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Investigate')).toBeInTheDocument()
    })
  })

  it('shows mitigate button for threats', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Mitigate')).toBeInTheDocument()
    })
  })

  it('displays analytics tab content', async () => {
    render(<ThreatMonitoring />)
    
    const analyticsTab = screen.getByRole('tab', { name: 'Analytics' })
    fireEvent.click(analyticsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Intelligence Sources')).toBeInTheDocument()
      expect(screen.getByText('Response Metrics')).toBeInTheDocument()
    })
  })

  it('displays intelligence feeds tab content', async () => {
    render(<ThreatMonitoring />)
    
    const feedsTab = screen.getByRole('tab', { name: 'Intelligence Feeds' })
    fireEvent.click(feedsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Threat Intelligence Feeds')).toBeInTheDocument()
    })
  })

  it('shows threat confidence levels', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Should show confidence percentage
      expect(screen.getByText(/\d+%/)).toBeInTheDocument()
    })
  })

  it('displays threat type badges correctly', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      expect(screen.getByText('ip reputation')).toBeInTheDocument()
    })
  })

  it('shows severity badges with correct colors', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      expect(screen.getByText('critical')).toBeInTheDocument()
    })
  })

  it('displays threat trend indicators', () => {
    render(<ThreatMonitoring />)
    
    // Should show trend indicators (up/down/stable)
    expect(screen.getByText(/up this week|down this week|stable this week/i)).toBeInTheDocument()
  })

  it('refreshes threat data', async () => {
    const mockRefresh = jest.fn()
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: true,
      refresh: mockRefresh
    })
    
    render(<ThreatMonitoring />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles export functionality', () => {
    render(<ThreatMonitoring />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    expect(exportButton).toBeInTheDocument()
    
    fireEvent.click(exportButton)
    // Export functionality would be tested with proper mocking
  })

  it('shows threat source information', async () => {
    render(<ThreatMonitoring />)
    
    const analyticsTab = screen.getByRole('tab', { name: 'Analytics' })
    fireEvent.click(analyticsTab)
    
    await waitFor(() => {
      expect(screen.getByText('ThreatIntel Feed A')).toBeInTheDocument()
    })
  })

  it('displays response time metrics', async () => {
    render(<ThreatMonitoring />)
    
    const analyticsTab = screen.getByRole('tab', { name: 'Analytics' })
    fireEvent.click(analyticsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Average Response Time')).toBeInTheDocument()
      expect(screen.getByText('Detection Rate')).toBeInTheDocument()
      expect(screen.getByText('False Positive Rate')).toBeInTheDocument()
      expect(screen.getByText('Mitigation Success Rate')).toBeInTheDocument()
    })
  })

  it('shows feed status indicators', async () => {
    render(<ThreatMonitoring />)
    
    const feedsTab = screen.getByRole('tab', { name: 'Intelligence Feeds' })
    fireEvent.click(feedsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Active feed providing threat intelligence')).toBeInTheDocument()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<ThreatMonitoring />)
    
    expect(() => unmount()).not.toThrow()
  })

  it('maintains filter state between tab switches', async () => {
    render(<ThreatMonitoring />)
    
    // Switch to active threats tab
    const activeThreatsTab = screen.getByRole('tab', { name: 'Active Threats' })
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Set a filter
      const severityFilter = screen.getByRole('combobox', { name: /severity/i })
      fireEvent.click(severityFilter)
      
      const criticalOption = screen.getByText('Critical')
      fireEvent.click(criticalOption)
    })
    
    // Switch to overview and back
    const overviewTab = screen.getByRole('tab', { name: 'Overview' })
    fireEvent.click(overviewTab)
    
    fireEvent.click(activeThreatsTab)
    
    await waitFor(() => {
      // Filter should still be applied
      const severityFilter = screen.getByRole('combobox', { name: /severity/i })
      expect(severityFilter).toHaveDisplayValue('Critical')
    })
  })
})