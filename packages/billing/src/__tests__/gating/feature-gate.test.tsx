import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { FeatureGate } from '../../gating/feature-gate'

// Mock the hooks
jest.mock('../../hooks/use-plan-features', () => ({
  usePlanFeatures: jest.fn()
}))

jest.mock('../../hooks/use-billing-subscription', () => ({
  useBillingSubscription: jest.fn()
}))

import { usePlanFeatures } from '../../hooks/use-plan-features'
import { useBillingSubscription } from '../../hooks/use-billing-subscription'

const mockUsePlanFeatures = usePlanFeatures as jest.MockedFunction<typeof usePlanFeatures>
const mockUseBillingSubscription = useBillingSubscription as jest.MockedFunction<typeof useBillingSubscription>

describe('FeatureGate', () => {
  const defaultProps = {
    feature: 'advanced_analytics',
    organizationId: 'org_test123',
    children: <div>Premium Feature Content</div>
  }

  beforeEach(() => {
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: jest.fn(),
      features: ['basic_analytics', 'advanced_analytics'],
      plan: {
        id: 'professional',
        name: 'Professional',
        price_monthly: 99
      },
      isLoading: false,
      error: null
    })

    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_test123',
        status: 'active',
        plan: {
          id: 'professional',
          name: 'Professional'
        }
      },
      isLoading: false,
      error: null,
      isActive: true,
      isTrialing: false,
      daysUntilExpiry: 30
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when feature is available', async () => {
    const mockHasFeature = jest.fn().mockReturnValue(true)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Premium Feature Content')).toBeInTheDocument()
    })

    expect(mockHasFeature).toHaveBeenCalledWith('advanced_analytics')
  })

  it('renders upgrade prompt when feature is not available', async () => {
    const mockHasFeature = jest.fn().mockReturnValue(false)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['basic_analytics'],
      plan: { id: 'basic', name: 'Basic', price_monthly: 29 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
      expect(screen.getByText('This feature requires a higher plan')).toBeInTheDocument()
      expect(screen.queryByText('Premium Feature Content')).not.toBeInTheDocument()
    })
  })

  it('renders custom upgrade prompt when provided', async () => {
    const mockHasFeature = jest.fn().mockReturnValue(false)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['basic_analytics'],
      plan: { id: 'basic', name: 'Basic', price_monthly: 29 },
      isLoading: false,
      error: null
    })

    const customUpgradePrompt = <div>Custom Upgrade Message</div>

    render(
      <FeatureGate {...defaultProps} upgradePrompt={customUpgradePrompt} />
    )

    await waitFor(() => {
      expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument()
      expect(screen.queryByText('Upgrade Required')).not.toBeInTheDocument()
    })
  })

  it('renders fallback content when provided', async () => {
    const mockHasFeature = jest.fn().mockReturnValue(false)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['basic_analytics'],
      plan: { id: 'basic', name: 'Basic', price_monthly: 29 },
      isLoading: false,
      error: null
    })

    const fallbackContent = <div>Feature Not Available</div>

    render(
      <FeatureGate {...defaultProps} fallback={fallbackContent} />
    )

    await waitFor(() => {
      expect(screen.getByText('Feature Not Available')).toBeInTheDocument()
      expect(screen.queryByText('Upgrade Required')).not.toBeInTheDocument()
    })
  })

  it('shows loading state when features are loading', () => {
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: jest.fn(),
      features: [],
      plan: null,
      isLoading: true,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when feature loading fails', () => {
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: jest.fn(),
      features: [],
      plan: null,
      isLoading: false,
      error: new Error('Failed to load features')
    })

    render(<FeatureGate {...defaultProps} />)

    expect(screen.getByText('Error loading features')).toBeInTheDocument()
  })

  it('handles inactive subscription gracefully', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: null,
      isLoading: false,
      error: null,
      isActive: false,
      isTrialing: false,
      daysUntilExpiry: 0
    })

    const mockHasFeature = jest.fn().mockReturnValue(false)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: [],
      plan: null,
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Subscription Required')).toBeInTheDocument()
      expect(screen.getByText('Please subscribe to a plan to access this feature')).toBeInTheDocument()
    })
  })

  it('handles trial subscriptions correctly', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_trial123',
        status: 'trialing',
        plan: {
          id: 'professional',
          name: 'Professional'
        }
      },
      isLoading: false,
      error: null,
      isActive: true,
      isTrialing: true,
      daysUntilExpiry: 7
    })

    const mockHasFeature = jest.fn().mockReturnValue(true)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Premium Feature Content')).toBeInTheDocument()
    })
  })

  it('shows trial warning when trial is ending soon', async () => {
    mockUseBillingSubscription.mockReturnValue({
      subscription: {
        id: 'sub_trial123',
        status: 'trialing',
        plan: {
          id: 'professional',
          name: 'Professional'
        }
      },
      isLoading: false,
      error: null,
      isActive: true,
      isTrialing: true,
      daysUntilExpiry: 2
    })

    const mockHasFeature = jest.fn().mockReturnValue(true)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Premium Feature Content')).toBeInTheDocument()
      expect(screen.getByText('Trial ending in 2 days')).toBeInTheDocument()
    })
  })

  it('supports strict mode for feature checking', async () => {
    const mockHasFeature = jest.fn().mockReturnValue(true)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} strict={true} />)

    await waitFor(() => {
      expect(mockHasFeature).toHaveBeenCalledWith('advanced_analytics', true)
    })
  })

  it('handles multiple feature requirements', async () => {
    const mockHasFeature = jest.fn()
      .mockImplementation((feature) => {
        return ['advanced_analytics', 'api_access'].includes(feature)
      })
    
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics', 'api_access'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    const multiFeatureProps = {
      ...defaultProps,
      feature: ['advanced_analytics', 'api_access'] as any
    }

    render(<FeatureGate {...multiFeatureProps} />)

    await waitFor(() => {
      expect(screen.getByText('Premium Feature Content')).toBeInTheDocument()
    })

    expect(mockHasFeature).toHaveBeenCalledWith('advanced_analytics')
    expect(mockHasFeature).toHaveBeenCalledWith('api_access')
  })

  it('handles partial feature availability in multi-feature mode', async () => {
    const mockHasFeature = jest.fn()
      .mockImplementation((feature) => {
        return feature === 'advanced_analytics' // Only has one of two features
      })
    
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'basic', name: 'Basic', price_monthly: 29 },
      isLoading: false,
      error: null
    })

    const multiFeatureProps = {
      ...defaultProps,
      feature: ['advanced_analytics', 'api_access'] as any
    }

    render(<FeatureGate {...multiFeatureProps} />)

    await waitFor(() => {
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
      expect(screen.queryByText('Premium Feature Content')).not.toBeInTheDocument()
    })
  })

  it('renders with custom CSS classes', () => {
    const mockHasFeature = jest.fn().mockReturnValue(true)
    mockUsePlanFeatures.mockReturnValue({
      hasFeature: mockHasFeature,
      features: ['advanced_analytics'],
      plan: { id: 'professional', name: 'Professional', price_monthly: 99 },
      isLoading: false,
      error: null
    })

    render(<FeatureGate {...defaultProps} className="custom-feature-gate" />)

    const featureGate = screen.getByText('Premium Feature Content').closest('.custom-feature-gate')
    expect(featureGate).toBeInTheDocument()
  })
})