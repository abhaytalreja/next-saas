import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SecurityAlerts } from '../../../components/security/SecurityAlerts'
import { useRealTimeMetrics } from '../../../hooks/useRealTimeMetrics'

// Mock the useRealTimeMetrics hook
jest.mock('../../../hooks/useRealTimeMetrics')
const mockUseRealTimeMetrics = useRealTimeMetrics as jest.MockedFunction<typeof useRealTimeMetrics>

// Mock window.URL methods for CSV export
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
})

// Mock createElement for CSV download
const mockAppendChild = jest.fn()
const mockClick = jest.fn()
const mockRemoveChild = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
})

Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild })
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild })

describe('SecurityAlerts', () => {
  beforeEach(() => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: true,
      refresh: jest.fn()
    })
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  it('renders security alerts dashboard', () => {
    render(<SecurityAlerts />)
    
    expect(screen.getByText('Security Alerts')).toBeInTheDocument()
    expect(screen.getByText('Monitor and respond to security threats and suspicious activities')).toBeInTheDocument()
  })

  it('displays connection status indicator', () => {
    render(<SecurityAlerts />)
    
    expect(screen.getByText('Live monitoring')).toBeInTheDocument()
  })

  it('shows offline status when disconnected', () => {
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: false,
      refresh: jest.fn()
    })
    
    render(<SecurityAlerts />)
    
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('displays summary statistics', () => {
    render(<SecurityAlerts />)
    
    // Check for summary stat cards
    expect(screen.getByText('Total Alerts')).toBeInTheDocument()
    expect(screen.getByText('Unresolved')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Resolved Today')).toBeInTheDocument()
  })

  it('renders critical alerts banner when present', () => {
    render(<SecurityAlerts />)
    
    // Should show critical alert banner
    expect(screen.getByText(/critical security alert/i)).toBeInTheDocument()
  })

  it('filters alerts by search term', async () => {
    render(<SecurityAlerts />)
    
    const searchInput = screen.getByPlaceholderText('Search alerts...')
    fireEvent.change(searchInput, { target: { value: 'Failed Login' } })
    
    await waitFor(() => {
      // Should filter alerts based on search term
      expect(screen.getByText('Multiple Failed Login Attempts')).toBeInTheDocument()
    })
  })

  it('filters alerts by type', async () => {
    render(<SecurityAlerts />)
    
    // Open type filter dropdown
    const typeFilter = screen.getByRole('combobox', { name: /type/i })
    fireEvent.click(typeFilter)
    
    // Select critical type
    const criticalOption = screen.getByText('Critical')
    fireEvent.click(criticalOption)
    
    await waitFor(() => {
      // Should only show critical alerts
      const criticalBadges = screen.getAllByText('CRITICAL')
      expect(criticalBadges.length).toBeGreaterThan(0)
    })
  })

  it('filters alerts by category', async () => {
    render(<SecurityAlerts />)
    
    // Open category filter dropdown
    const categoryFilter = screen.getByRole('combobox', { name: /category/i })
    fireEvent.click(categoryFilter)
    
    // Select authentication category
    const authOption = screen.getByText('Authentication')
    fireEvent.click(authOption)
    
    await waitFor(() => {
      // Should filter by authentication category
      expect(screen.getByText('Multiple Failed Login Attempts')).toBeInTheDocument()
    })
  })

  it('filters alerts by status', async () => {
    render(<SecurityAlerts />)
    
    // Open status filter dropdown
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    fireEvent.click(statusFilter)
    
    // Select unresolved status
    const unresolvedOption = screen.getByText('Unresolved')
    fireEvent.click(unresolvedOption)
    
    await waitFor(() => {
      // Should only show unresolved alerts
      const resolvedBadges = screen.queryAllByText('RESOLVED')
      expect(resolvedBadges.length).toBe(0)
    })
  })

  it('opens alert details dialog', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Details button
    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Security Alert Details')).toBeInTheDocument()
    })
  })

  it('shows resolve alert dialog', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Resolve button
    const resolveButtons = screen.getAllByText('Resolve')
    fireEvent.click(resolveButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Resolve Security Alert')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Describe how this alert was resolved...')).toBeInTheDocument()
    })
  })

  it('resolves an alert with resolution notes', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Resolve button
    const resolveButtons = screen.getAllByText('Resolve')
    fireEvent.click(resolveButtons[0])
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Describe how this alert was resolved...')
      fireEvent.change(textarea, { target: { value: 'False positive - verified legitimate activity' } })
      
      const resolveButton = screen.getByRole('button', { name: 'Resolve Alert' })
      fireEvent.click(resolveButton)
    })
    
    await waitFor(() => {
      // Alert should be marked as resolved
      expect(screen.getByText('RESOLVED')).toBeInTheDocument()
    })
  })

  it('refreshes alerts data', async () => {
    const mockRefresh = jest.fn()
    mockUseRealTimeMetrics.mockReturnValue({
      metrics: {},
      isConnected: true,
      refresh: mockRefresh
    })
    
    render(<SecurityAlerts />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    fireEvent.click(refreshButton)
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('exports alerts data as CSV', async () => {
    render(<SecurityAlerts />)
    
    const exportButton = screen.getByRole('button', { name: /export/i })
    fireEvent.click(exportButton)
    
    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  it('displays proper alert type badges', () => {
    render(<SecurityAlerts />)
    
    // Check for different alert type badges
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
  })

  it('displays proper category badges', () => {
    render(<SecurityAlerts />)
    
    // Check for category badges
    expect(screen.getByText('AUTHENTICATION')).toBeInTheDocument()
    expect(screen.getByText('SUSPICIOUS ACTIVITY')).toBeInTheDocument()
    expect(screen.getByText('ACCESS CONTROL')).toBeInTheDocument()
  })

  it('shows relative timestamps correctly', () => {
    render(<SecurityAlerts />)
    
    // Should show relative time formats
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('handles empty search results', async () => {
    render(<SecurityAlerts />)
    
    const searchInput = screen.getByPlaceholderText('Search alerts...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent alert' } })
    
    await waitFor(() => {
      expect(screen.getByText('No alerts match your current filters')).toBeInTheDocument()
    })
  })

  it('disables resolve button when resolution is empty', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Resolve button
    const resolveButtons = screen.getAllByText('Resolve')
    fireEvent.click(resolveButtons[0])
    
    await waitFor(() => {
      const resolveButton = screen.getByRole('button', { name: 'Resolve Alert' })
      expect(resolveButton).toBeDisabled()
    })
  })

  it('shows loading state during resolution', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Resolve button
    const resolveButtons = screen.getAllByText('Resolve')
    fireEvent.click(resolveButtons[0])
    
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText('Describe how this alert was resolved...')
      fireEvent.change(textarea, { target: { value: 'Test resolution' } })
      
      const resolveButton = screen.getByRole('button', { name: 'Resolve Alert' })
      fireEvent.click(resolveButton)
      
      // Should show loading state
      expect(screen.getByText('Resolving...')).toBeInTheDocument()
    })
  })

  it('displays alert metadata in details view', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Details button
    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Alert ID')).toBeInTheDocument()
      expect(screen.getByText('Timestamp')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
    })
  })

  it('shows affected resources when available', async () => {
    render(<SecurityAlerts />)
    
    // Click on the first Details button
    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('Affected Resources')).toBeInTheDocument()
    })
  })

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<SecurityAlerts />)
    
    expect(() => unmount()).not.toThrow()
  })
})