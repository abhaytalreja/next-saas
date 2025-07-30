import { PlanChecker } from '../../gating/plan-checker'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Plan } from '../../types'

// Mock Supabase client
jest.mock('@nextsaas/supabase')

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn()
}

const mockGetSupabaseBrowserClient = getSupabaseBrowserClient as jest.MockedFunction<typeof getSupabaseBrowserClient>

describe('PlanChecker', () => {
  let planChecker: PlanChecker
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockGetSupabaseBrowserClient.mockReturnValue(mockSupabase as any)
    planChecker = new PlanChecker()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.useRealTimers()
    consoleErrorSpy.mockRestore()
  })

  describe('getPlan', () => {
    const mockPlan: Plan = {
      id: 'plan_123',
      name: 'Professional',
      slug: 'professional',
      description: 'Professional plan',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: ['feature1', 'feature2'],
      feature_limits: { api_calls: 1000, storage_gb: 10 },
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    it('should fetch plan successfully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.getPlan('plan_123')

      expect(mockSupabase.from).toHaveBeenCalledWith('plans')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'plan_123')
      expect(mockSupabase.single).toHaveBeenCalled()
      expect(result).toEqual(mockPlan)
    })

    it('should return cached plan on second call', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      // First call
      const result1 = await planChecker.getPlan('plan_123')
      expect(result1).toEqual(mockPlan)

      // Clear mock call history
      jest.clearAllMocks()

      // Second call should use cache
      const result2 = await planChecker.getPlan('plan_123')
      expect(result2).toEqual(mockPlan)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should expire cache after timeout', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      // First call
      await planChecker.getPlan('plan_123')

      // Fast-forward time past cache expiry (5 minutes)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1)

      // Clear mock call history
      jest.clearAllMocks()

      // Second call should fetch from database again
      await planChecker.getPlan('plan_123')
      expect(mockSupabase.from).toHaveBeenCalledWith('plans')
    })

    it('should return null when plan not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const result = await planChecker.getPlan('invalid_plan')

      expect(result).toBeNull()
    })

    it('should handle database errors', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'))

      const result = await planChecker.getPlan('plan_123')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching plan:', expect.any(Error))
    })

    it('should return null when data is null but no error', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await planChecker.getPlan('plan_123')

      expect(result).toBeNull()
    })
  })

  describe('getPlanBySlug', () => {
    const mockPlan: Plan = {
      id: 'plan_123',
      name: 'Professional',
      slug: 'professional',
      description: 'Professional plan',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: ['feature1', 'feature2'],
      feature_limits: { api_calls: 1000, storage_gb: 10 },
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    it('should fetch plan by slug successfully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.getPlanBySlug('professional')

      expect(mockSupabase.from).toHaveBeenCalledWith('plans')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'professional')
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockSupabase.single).toHaveBeenCalled()
      expect(result).toEqual(mockPlan)
    })

    it('should return null when plan not found by slug', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const result = await planChecker.getPlanBySlug('nonexistent')

      expect(result).toBeNull()
    })

    it('should handle database errors when fetching by slug', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database error'))

      const result = await planChecker.getPlanBySlug('professional')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching plan by slug:', expect.any(Error))
    })
  })

  describe('getAllPlans', () => {
    const mockPlans: Plan[] = [
      {
        id: 'plan_basic',
        name: 'Basic',
        slug: 'basic',
        description: 'Basic plan',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: ['feature1'],
        feature_limits: { api_calls: 100 },
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'plan_pro',
        name: 'Professional',
        slug: 'professional',
        description: 'Professional plan',
        price: 99,
        currency: 'usd',
        interval: 'month',
        features: ['feature1', 'feature2'],
        feature_limits: { api_calls: 1000 },
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    it('should fetch all active plans', async () => {
      mockSupabase.order.mockResolvedValue({
        data: mockPlans,
        error: null
      })

      const result = await planChecker.getAllPlans()

      expect(mockSupabase.from).toHaveBeenCalledWith('plans')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockSupabase.order).toHaveBeenCalledWith('sort_order')
      expect(result).toEqual(mockPlans)
    })

    it('should include inactive plans when requested', async () => {
      mockSupabase.order.mockResolvedValue({
        data: mockPlans,
        error: null
      })

      await planChecker.getAllPlans(true)

      expect(mockSupabase.eq).not.toHaveBeenCalledWith('is_active', true)
    })

    it('should return empty array when no plans found', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null
      })

      const result = await planChecker.getAllPlans()

      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const result = await planChecker.getAllPlans()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching plans:', expect.any(Object))
    })
  })

  describe('hasFeature', () => {
    const mockPlan: Plan = {
      id: 'plan_123',
      name: 'Professional',
      slug: 'professional',
      description: 'Professional plan',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: ['advanced_analytics', 'priority_support'],
      feature_limits: { api_calls: 1000, storage_gb: 10 },
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    it('should return true when plan has feature', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.hasFeature('plan_123', 'advanced_analytics')

      expect(result).toBe(true)
    })

    it('should return false when plan does not have feature', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.hasFeature('plan_123', 'enterprise_sso')

      expect(result).toBe(false)
    })

    it('should return false when plan not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const result = await planChecker.hasFeature('invalid_plan', 'any_feature')

      expect(result).toBe(false)
    })

    it('should handle plans with no features array', async () => {
      const planWithoutFeatures = { ...mockPlan, features: null }
      mockSupabase.single.mockResolvedValue({
        data: planWithoutFeatures,
        error: null
      })

      const result = await planChecker.hasFeature('plan_123', 'any_feature')

      expect(result).toBe(false)
    })
  })

  describe('getFeatureLimit', () => {
    const mockPlan: Plan = {
      id: 'plan_123',
      name: 'Professional',
      slug: 'professional',
      description: 'Professional plan',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: ['feature1', 'feature2'],
      feature_limits: { api_calls: 1000, storage_gb: 10 },
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    it('should return feature limit when it exists', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.getFeatureLimit('plan_123', 'api_calls')

      expect(result).toBe(1000)
    })

    it('should return null when feature limit does not exist', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockPlan,
        error: null
      })

      const result = await planChecker.getFeatureLimit('plan_123', 'nonexistent_feature')

      expect(result).toBeNull()
    })

    it('should return null when plan not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const result = await planChecker.getFeatureLimit('invalid_plan', 'api_calls')

      expect(result).toBeNull()
    })

    it('should handle plans with no feature_limits', async () => {
      const planWithoutLimits = { ...mockPlan, feature_limits: null }
      mockSupabase.single.mockResolvedValue({
        data: planWithoutLimits,
        error: null
      })

      const result = await planChecker.getFeatureLimit('plan_123', 'api_calls')

      expect(result).toBeNull()
    })
  })

  describe('comparePlans', () => {
    const basicPlan: Plan = {
      id: 'plan_basic',
      name: 'Basic',
      slug: 'basic',
      description: 'Basic plan',
      price: 29,
      currency: 'usd',
      interval: 'month',
      features: ['basic_feature'],
      feature_limits: { api_calls: 100 },
      is_active: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }

    const proPlan: Plan = {
      id: 'plan_pro',
      name: 'Professional',
      slug: 'professional',
      description: 'Professional plan',
      price: 99,
      currency: 'usd',
      interval: 'month',
      features: ['basic_feature', 'advanced_feature'],
      feature_limits: { api_calls: 1000, storage_gb: 10 },
      is_active: true,
      sort_order: 2,
      created_at: new Date(),
      updated_at: new Date()
    }

    it('should compare two plans successfully', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ data: basicPlan, error: null })
        .mockResolvedValueOnce({ data: proPlan, error: null })

      const result = await planChecker.comparePlans('plan_basic', 'plan_pro')

      expect(result).toEqual({
        plan1: basicPlan,
        plan2: proPlan,
        priceDifference: 70,
        plan1Unique: [],
        plan2Unique: ['advanced_feature'],
        commonFeatures: ['basic_feature'],
        limitComparisons: {
          api_calls: { plan1: 100, plan2: 1000, difference: 900 },
          storage_gb: { plan1: null, plan2: 10, difference: null }
        }
      })
    })

    it('should handle when one plan is not found', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({ data: basicPlan, error: null })
        .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })

      const result = await planChecker.comparePlans('plan_basic', 'invalid_plan')

      expect(result).toBeNull()
    })

    it('should handle when both plans are not found', async () => {
      mockSupabase.single
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      const result = await planChecker.comparePlans('invalid1', 'invalid2')

      expect(result).toBeNull()
    })
  })

  describe('cache management', () => {
    it('should handle multiple cached items with different expiry times', async () => {
      const plan1: Plan = {
        id: 'plan_1',
        name: 'Plan 1',
        slug: 'plan1',
        description: 'Plan 1',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: [],
        feature_limits: {},
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }

      const plan2: Plan = {
        id: 'plan_2',
        name: 'Plan 2',
        slug: 'plan2',
        description: 'Plan 2',
        price: 99,
        currency: 'usd',
        interval: 'month',
        features: [],
        feature_limits: {},
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }

      mockSupabase.single
        .mockResolvedValueOnce({ data: plan1, error: null })
        .mockResolvedValueOnce({ data: plan2, error: null })

      // Fetch both plans
      await planChecker.getPlan('plan_1')
      
      // Advance time slightly
      jest.advanceTimersByTime(1000)
      
      await planChecker.getPlan('plan_2')

      // Clear mocks
      jest.clearAllMocks()

      // Both should be cached
      const result1 = await planChecker.getPlan('plan_1')
      const result2 = await planChecker.getPlan('plan_2')

      expect(result1).toEqual(plan1)
      expect(result2).toEqual(plan2)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })
})