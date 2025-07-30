import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BillingDashboard } from '../../components/billing-dashboard'

// Mock the hooks
jest.mock('../../hooks/use-billing-subscription', () => ({
  useBillingSubscription: jest.fn()
}))

jest.mock('../../hooks/use-billing-customer', () => ({
  useBillingCustomer: jest.fn()
}))

jest.mock('../../hooks/use-usage-tracking', () => ({
  useUsageTracking: jest.fn()
}))

import { useBillingSubscription } from '../../hooks/use-billing-subscription'
import { useBillingCustomer } from '../../hooks/use-billing-customer'
import { useUsageTracking } from '../../hooks/use-usage-tracking'

const mockUseBillingSubscription = useBillingSubscription as jest.MockedFunction<typeof useBillingSubscription>
const mockUseBillingCustomer = useBillingCustomer as jest.MockedFunction<typeof useBillingCustomer>
const mockUseUsageTracking = useUsageTracking as jest.MockedFunction<typeof useUsageTracking>

describe('BillingDashboard', () => {
  const defaultProps = {
    organizationId: 'org_test123'
  }

  beforeEach(() => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_test123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        plan: {
          name: 'Professional',
          price: 99
        }
      },
      isLoading: false,
      error: null,
      isActive: true,
      isTrialing: false,
      daysUntilExpiry: 30
    })

    mockUseBillingCustomer.mockReturnValue({
      customer: {
        id: 'cus_test123',
        email: 'test@example.com'
      },
      isLoading: false,
      error: null
    })

    mockUseUsageTracking.mockReturnValue({
      metrics: {
        api_calls: { used: 150, limit: 1000 },
        storage_gb: { used: 2.5, limit: 10 }
      },
      isLoading: false,
      error: null,
      trackUsage: jest.fn(),
      checkQuota: jest.fn(),
      enforceQuotaAndTrack: jest.fn()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders billing dashboard with subscription info', async () => {
    render(<BillingDashboard {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Billing Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('$99')).toBeInTheDocument()
    })
  })

  it('shows loading state when subscription is loading', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: null,
      isLoading: true,
      error: null,
      isActive: false,
      isTrialing: false,
      daysUntilExpiry: 0
    })

    render(<BillingDashboard {...defaultProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when subscription loading fails', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: null,
      isLoading: false,
      error: new Error('Failed to load subscription'),
      isActive: false,
      isTrialing: false,
      daysUntilExpiry: 0
    })

    render(<BillingDashboard {...defaultProps} />)

    expect(screen.getByText('Error loading billing information')).toBeInTheDocument()
  })

  it('shows usage metrics when showUsage is true', async () => {
    render(<BillingDashboard {...defaultProps} showUsage={true} />)

    await waitFor(() => {
      expect(screen.getByText('API Calls')).toBeInTheDocument()
      expect(screen.getByText('150 / 1,000')).toBeInTheDocument()
      expect(screen.getByText('Storage')).toBeInTheDocument()
      expect(screen.getByText('2.5 / 10 GB')).toBeInTheDocument()
    })
  })

  it('hides usage metrics when showUsage is false', async () => {
    render(<BillingDashboard {...defaultProps} showUsage={false} />)

    await waitFor(() => {
      expect(screen.queryByText('API Calls')).not.toBeInTheDocument()
      expect(screen.queryByText('Storage')).not.toBeInTheDocument()
    })
  })

  it('shows upgrade prompts when showUpgradePrompts is true', async () => {
    render(<BillingDashboard {...defaultProps} showUpgradePrompts={true} />)

    await waitFor(() => {
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
    })
  })

  it('shows trial information for trialing subscriptions', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_trial123',
        status: 'trialing',
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days from now
        plan: {
          name: 'Professional',
          price: 99
        }
      },
      isLoading: false,
      error: null,
      isActive: true,
      isTrialing: true,
      daysUntilExpiry: 7
    })

    render(<BillingDashboard {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Free Trial')).toBeInTheDocument()
      expect(screen.getByText('7 days remaining')).toBeInTheDocument()
    })
  })

  it('shows past due status for past due subscriptions', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_past_due123',
        status: 'past_due',
        current_period_end: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        plan: {
          name: 'Professional',
          price: 99
        }
      },
      isLoading: false,
      error: null,
      isActive: false,
      isTrialing: false,
      daysUntilExpiry: -1
    })

    render(<BillingDashboard {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Payment Required')).toBeInTheDocument()
      expect(screen.getByText('Update Payment Method')).toBeInTheDocument()
    })
  })

  it('handles missing subscription gracefully', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: null,
      isLoading: false,
      error: null,
      isActive: false,
      isTrialing: false,
      daysUntilExpiry: 0
    })

    render(<BillingDashboard {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('No Active Subscription')).toBeInTheDocument()
      expect(screen.getByText('Choose a Plan')).toBeInTheDocument()
    })
  })

  it('displays correct usage percentage and warnings', async () => {
    mockUseUsageTracking.mockReturnValue({
      metrics: {
        api_calls: { used: 900, limit: 1000 }, // 90% usage
        storage_gb: { used: 9.5, limit: 10 } // 95% usage
      },
      isLoading: false,
      error: null,
      trackUsage: jest.fn(),
      checkQuota: jest.fn(),
      enforceQuotaAndTrack: jest.fn()
    })

    render(<BillingDashboard {...defaultProps} showUsage={true} />)

    await waitFor(() => {
      expect(screen.getByText('90%')).toBeInTheDocument()
      expect(screen.getByText('95%')).toBeInTheDocument()
      expect(screen.getByText('Usage Warning')).toBeInTheDocument()
    })
  })
})