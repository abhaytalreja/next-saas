import { renderHook, waitFor, act } from '@testing-library/react'
import { useUsageTracking } from '../../hooks/use-usage-tracking'

// Mock the Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn()
  }))
}))

import { getSupabaseBrowserClient } from '@nextsaas/supabase'

const mockSupabase = getSupabaseBrowserClient as jest.MockedFunction<typeof getSupabaseBrowserClient>

describe('useUsageTracking', () => {
  const organizationId = 'org_test123'
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state initially', () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.metrics).toEqual({})
    expect(result.current.error).toBe(null)
  })

  it('fetches and returns usage metrics', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 150,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      },
      {
        feature_slug: 'storage_gb',
        used_quantity: 2.5,
        limit_quantity: 10,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics).toEqual({
      api_calls: {
        used: 150,
        limit: 1000,
        percentage: 15,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      },
      storage_gb: {
        used: 2.5,
        limit: 10,
        percentage: 25,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    })
    expect(result.current.error).toBe(null)
  })

  it('tracks usage for a feature', async () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: [], error: null }),
      rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.trackUsage('api_calls', 5)
    })

    expect(mockClient.rpc).toHaveBeenCalledWith('increment_usage', {
      org_id: organizationId,
      feature_slug: 'api_calls',
      quantity: 5
    })
  })

  it('checks quota availability', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 950,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const quotaCheck = result.current.checkQuota('api_calls', 100)

    expect(quotaCheck).toEqual({
      allowed: false,
      reason: 'quota_exceeded',
      current_usage: 950,
      limit: 1000,
      requested: 100,
      available: 50
    })
  })

  it('allows usage when within quota', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 500,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const quotaCheck = result.current.checkQuota('api_calls', 100)

    expect(quotaCheck).toEqual({
      allowed: true,
      reason: null,
      current_usage: 500,
      limit: 1000,
      requested: 100,
      available: 500
    })
  })

  it('enforces quota and tracks usage when allowed', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 500,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn().mockResolvedValue({ data: { success: true }, error: null })
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let enforceResult
    await act(async () => {
      enforceResult = await result.current.enforceQuotaAndTrack('api_calls', 100)
    })

    expect(enforceResult).toEqual({
      success: true,
      reason: null,
      tracked_quantity: 100
    })

    expect(mockClient.rpc).toHaveBeenCalledWith('increment_usage', {
      org_id: organizationId,
      feature_slug: 'api_calls',
      quantity: 100
    })
  })

  it('enforces quota and prevents usage when quota exceeded', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 980,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let enforceResult
    await act(async () => {
      enforceResult = await result.current.enforceQuotaAndTrack('api_calls', 50)
    })

    expect(enforceResult).toEqual({
      success: false,
      reason: 'quota_exceeded',
      tracked_quantity: 0
    })

    expect(mockClient.rpc).not.toHaveBeenCalled()
  })

  it('handles feature not found gracefully', async () => {
    const mockUsageData = []

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const quotaCheck = result.current.checkQuota('non_existent_feature', 10)

    expect(quotaCheck).toEqual({
      allowed: false,
      reason: 'feature_not_found',
      current_usage: 0,
      limit: 0,
      requested: 10,
      available: 0
    })
  })

  it('handles database errors', async () => {
    const mockError = { message: 'Database connection failed' }
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.metrics).toEqual({})
  })

  it('calculates usage percentages correctly', async () => {
    const mockUsageData = [
      {
        feature_slug: 'api_calls',
        used_quantity: 750,
        limit_quantity: 1000,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      },
      {
        feature_slug: 'storage_gb',
        used_quantity: 0,
        limit_quantity: 10,
        period_start: '2023-01-01T00:00:00Z',
        period_end: '2023-01-31T23:59:59Z'
      }
    ]

    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUsageData, error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result } = renderHook(() => useUsageTracking(organizationId))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics.api_calls.percentage).toBe(75)
    expect(result.current.metrics.storage_gb.percentage).toBe(0)
  })

  it('refreshes data when organization ID changes', async () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: [], error: null }),
      rpc: jest.fn()
    }

    mockSupabase.mockReturnValue(mockClient as any)

    const { result, rerender } = renderHook(
      ({ orgId }) => useUsageTracking(orgId),
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