import { renderHook, waitFor } from '@testing-library/react'
import { useBillingSubscription } from '../../hooks/use-billing-subscription'

// Mock the Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }))
}))

import { getSupabaseBrowserClient } from '@nextsaas/supabase'

const mockSupabase = getSupabaseBrowserClient as jest.MockedFunction<typeof getSupabaseBrowserClient>

describe('useBillingSubscription', () => {
  const organizationId = 'org_test123'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state initially', () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.subscription).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isTrialing).toBe(false)
  })

  it('fetches and returns active subscription data', async () => {
    const mockSubscription = {
      id: 'sub_test123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe123',
      status: 'active',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2023-02-01T00:00:00Z',
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99,
        price_yearly: 990
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subscription).toEqual(mockSubscription)
    expect(result.current.isActive).toBe(true)
    expect(result.current.isTrialing).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('identifies trialing subscription correctly', async () => {
    const mockSubscription = {
      id: 'sub_trial123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe456',
      status: 'trialing',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2023-02-01T00:00:00Z',
      trial_end: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isTrialing).toBe(true)
    expect(result.current.isActive).toBe(true) // Trialing subscriptions are considered active
    expect(result.current.daysUntilExpiry).toBeCloseTo(7, 0)
  })

  it('handles past due subscription status', async () => {
    const mockSubscription = {
      id: 'sub_past_due123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe789',
      status: 'past_due',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2023-01-31T00:00:00Z',
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subscription?.status).toBe('past_due')
    expect(result.current.isActive).toBe(false)
    expect(result.current.isTrialing).toBe(false)
  })

  it('handles canceled subscription status', async () => {
    const mockSubscription = {
      id: 'sub_canceled123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe999',
      status: 'canceled',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: '2023-01-31T00:00:00Z',
      canceled_at: '2023-01-15T00:00:00Z',
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subscription?.status).toBe('canceled')
    expect(result.current.isActive).toBe(false)
    expect(result.current.isTrialing).toBe(false)
  })

  it('handles subscription not found', async () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subscription).toBe(null)
    expect(result.current.isActive).toBe(false)
    expect(result.current.isTrialing).toBe(false)
    expect(result.current.daysUntilExpiry).toBe(0)
  })

  it('handles database errors', async () => {
    const mockError = { message: 'Database connection failed' }
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.subscription).toBe(null)
    expect(result.current.isActive).toBe(false)
  })

  it('calculates days until expiry correctly', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 15) // 15 days from now
    const mockSubscription = {
      id: 'sub_expiry123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe111',
      status: 'active',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: futureDate.toISOString(),
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.daysUntilExpiry).toBeCloseTo(15, 0)
  })

  it('handles expired subscription', async () => {
    const pastDate = new Date(Date.now() - 86400000 * 5) // 5 days ago
    const mockSubscription = {
      id: 'sub_expired123',
      organization_id: organizationId,
      stripe_subscription_id: 'sub_stripe222',
      status: 'incomplete_expired',
      current_period_start: '2023-01-01T00:00:00Z',
      current_period_end: pastDate.toISOString(),
      plan: {
        id: 'plan_professional',
        name: 'Professional',
        price_monthly: 99
      }
    }

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockSubscription,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useBillingSubscription(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.daysUntilExpiry).toBeLessThan(0)
    expect(result.current.isActive).toBe(false)
  })

  it('refetches data when organization ID changes', async () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result, rerender } = renderHook(
      ({ orgId }) => useBillingSubscription(orgId),
      { initialProps: { orgId: 'org_1' } }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockClient.eq).toHaveBeenCalledWith('organization_id', 'org_1')

    // Change organization ID
    rerender({ orgId: 'org_2' })

    await waitFor(() => {
      expect(mockClient.eq).toHaveBeenCalledWith('organization_id', 'org_2')
    })
  })
})