import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityDashboard } from '../ActivityDashboard'
import { useAuth } from '../../../hooks'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock dependencies
jest.mock('../../../hooks')
jest.mock('@supabase/auth-helpers-nextjs')

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ComputerDesktopIcon: () => <div data-testid="computer-desktop-icon" />,
  DevicePhoneMobileIcon: () => <div data-testid="device-phone-mobile-icon" />,
  DeviceTabletIcon: () => <div data-testid="device-tablet-icon" />,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  XCircleIcon: () => <div data-testid="x-circle-icon" />,
  ClockIcon: () => <div data-testid="clock-icon" />,
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  ShieldCheckIcon: () => <div data-testid="shield-check-icon" />,
  UserIcon: () => <div data-testid="user-icon" />,
  KeyIcon: () => <div data-testid="key-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z'
}

const mockActivities = [
  {
    id: 'activity-1',
    user_id: 'user-123',
    action: 'login',
    description: 'User logged in',
    status: 'success',
    ip_address: '192.168.1.1',
    device_type: 'desktop',
    created_at: '2023-01-01T10:00:00Z'
  },
  {
    id: 'activity-2',
    user_id: 'user-123',
    action: 'profile_update',
    description: 'Updated profile information',
    status: 'success',
    ip_address: '192.168.1.1',
    device_type: 'mobile',
    created_at: '2023-01-01T09:00:00Z'
  }
]

const mockSessions = [
  {
    id: 'session-1',
    user_id: 'user-123',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'macOS',
    device_name: 'MacBook Pro',
    location_city: 'San Francisco',
    location_country: 'US',
    is_current: true,
    is_trusted: true,
    last_activity_at: '2023-01-01T10:00:00Z'
  },
  {
    id: 'session-2',
    user_id: 'user-123',
    device_type: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    device_name: 'iPhone 14',
    location_city: 'New York',
    location_country: 'US',
    is_current: false,
    is_trusted: false,
    last_activity_at: '2023-01-01T08:00:00Z'
  }
]

const mockDevices = [
  {
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'macOS',
    device_name: 'MacBook Pro',
    location_city: 'San Francisco',
    session_count: 5,
    last_seen: '2023-01-01T10:00:00Z',
    is_trusted: true,
    has_current_session: true
  }
]

const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: mockActivities, error: null })),
          single: jest.fn(() => Promise.resolve({ data: mockActivities[0], error: null })),
          range: jest.fn(() => Promise.resolve({ data: mockActivities, error: null }))
        })),
        is: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: mockSessions, error: null }))
        })),
        in: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: mockActivities, error: null }))
          }))
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: mockActivities, error: null }))
            }))
          }))
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}

describe('ActivityDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    })
    
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Rendering', () => {
    it('renders tab navigation', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument()
        expect(screen.getByText('Active Sessions')).toBeInTheDocument()
        expect(screen.getByText('Security Events')).toBeInTheDocument()
        expect(screen.getByText('Devices')).toBeInTheDocument()
      })
    })

    it('renders loading state initially', () => {
      render(<ActivityDashboard />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<ActivityDashboard className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('defaults to recent activity tab', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
      })
    })
  })

  describe('Recent Activity Tab', () => {
    it('displays activity list', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('User logged in')).toBeInTheDocument()
        expect(screen.getByText('Updated profile information')).toBeInTheDocument()
      })
    })

    it('shows activity icons based on action', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
        expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      })
    })

    it('displays IP addresses and device types', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('192.168.1.1')).toBeInTheDocument()
        expect(screen.getByText('desktop')).toBeInTheDocument()
        expect(screen.getByText('mobile')).toBeInTheDocument()
      })
    })

    it('shows status badges', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        const successBadges = screen.getAllByText('success')
        expect(successBadges).toHaveLength(2)
      })
    })

    it('displays empty state when no activities', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('No activity found')).toBeInTheDocument()
      })
    })
  })

  describe('Active Sessions Tab', () => {
    it('displays session list when tab is clicked', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('Chrome on macOS')).toBeInTheDocument()
        expect(screen.getByText('Safari on iOS')).toBeInTheDocument()
      })
    })

    it('shows device icons based on type', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByTestId('computer-desktop-icon')).toBeInTheDocument()
        expect(screen.getByTestId('device-phone-mobile-icon')).toBeInTheDocument()
      })
    })

    it('displays location information', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('San Francisco, US')).toBeInTheDocument()
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })
    })

    it('shows current session badge', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('Current')).toBeInTheDocument()
      })
    })

    it('shows trusted device badge', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('Trusted')).toBeInTheDocument()
      })
    })

    it('allows revoking non-current sessions', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        const revokeButtons = screen.getAllByText('Revoke')
        expect(revokeButtons).toHaveLength(1) // Only one non-current session
      })
    })

    it('does not show revoke button for current session', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        // Should have 2 sessions but only 1 revoke button (current session can't be revoked)
        const revokeButtons = screen.getAllByText('Revoke')
        expect(revokeButtons).toHaveLength(1)
      })
    })

    it('displays empty state when no sessions', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('No active sessions')).toBeInTheDocument()
      })
    })
  })

  describe('Security Events Tab', () => {
    it('displays security events when tab is clicked', async () => {
      render(<ActivityDashboard />)

      const securityTab = screen.getByText('Security Events')
      await userEvent.click(securityTab)

      await waitFor(() => {
        // Should show activities filtered for security events
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_activity')
      })
    })

    it('filters for security-related actions', async () => {
      render(<ActivityDashboard />)

      const securityTab = screen.getByText('Security Events')
      await userEvent.click(securityTab)

      await waitFor(() => {
        const fromCall = mockSupabaseClient.from()
        const selectCall = fromCall.select()
        const eqCall = selectCall.eq()
        expect(eqCall.in).toHaveBeenCalledWith('action', [
          'login', 'logout', 'password_change', 'email_change', 
          'two_factor_enable', 'two_factor_disable', 'session_revoked'
        ])
      })
    })
  })

  describe('Devices Tab', () => {
    it('displays device summary when tab is clicked', async () => {
      // Mock the devices view
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockDevices, error: null }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      const devicesTab = screen.getByText('Devices')
      await userEvent.click(devicesTab)

      await waitFor(() => {
        expect(screen.getByText('Chrome on macOS')).toBeInTheDocument()
        expect(screen.getByText('5 sessions')).toBeInTheDocument()
      })
    })

    it('shows device status badges', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockDevices, error: null }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      const devicesTab = screen.getByText('Devices')
      await userEvent.click(devicesTab)

      await waitFor(() => {
        expect(screen.getByText('Trusted')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
      })
    })
  })

  describe('Activity Filters', () => {
    it('renders filter controls in recent activity tab', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByDisplayValue('All actions')).toBeInTheDocument()
        expect(screen.getByDisplayValue('All statuses')).toBeInTheDocument()
      })
    })

    it('allows filtering by action', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        const actionSelect = screen.getByDisplayValue('All actions')
        expect(actionSelect).toBeInTheDocument()
        
        expect(screen.getByDisplayValue('Login')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Logout')).toBeInTheDocument()
      })
    })

    it('allows filtering by status', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        const statusSelect = screen.getByDisplayValue('All statuses')
        expect(statusSelect).toBeInTheDocument()
        
        expect(screen.getByDisplayValue('Success')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Failure')).toBeInTheDocument()
      })
    })
  })

  describe('Session Revocation', () => {
    it('revokes session when revoke button is clicked', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        const revokeButton = screen.getByText('Revoke')
        fireEvent.click(revokeButton)
      })

      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        revoked_at: expect.any(String),
        revoked_reason: 'user_action'
      })
    })

    it('reloads sessions after successful revocation', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      const revokeButton = await screen.findByText('Revoke')
      await userEvent.click(revokeButton)

      // Should reload sessions after revocation
      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_sessions')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when data loading fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Load failed' } }))
            }))
          }))
        }))
      })

      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('exclamation-triangle-icon')).toBeInTheDocument()
        expect(screen.getByText('Failed to load data')).toBeInTheDocument()
      })
    })

    it('handles session revocation errors', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            is: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockSessions, error: null }))
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Revoke failed' } }))
        }))
      })

      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      const revokeButton = await screen.findByText('Revoke')
      await userEvent.click(revokeButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to revoke session')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Counts', () => {
    it('displays activity count in tab', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // 2 activities
      })
    })

    it('displays session count in tab', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument() // 2 sessions
      })
    })
  })

  describe('Time Formatting', () => {
    it('formats dates correctly', async () => {
      render(<ActivityDashboard />)

      await waitFor(() => {
        // Should format the date from '2023-01-01T10:00:00Z'
        expect(screen.getByText(/1\/1\/2023/)).toBeInTheDocument()
      })
    })

    it('formats relative time correctly', async () => {
      render(<ActivityDashboard />)

      const sessionsTab = screen.getByText('Active Sessions')
      await userEvent.click(sessionsTab)

      await waitFor(() => {
        // Should show relative time for last activity
        expect(screen.getByText(/Last active:/)).toBeInTheDocument()
      })
    })
  })

  describe('Without User', () => {
    it('does not load data when user is not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null
      })

      render(<ActivityDashboard />)

      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })
})