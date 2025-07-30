import { PricingService } from '../pricing/pricing-service'
import type { Plan } from '../types'

// Mock Supabase
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockPlan, error: null })
  })
}))

const mockPlan: Plan = {
  id: 'plan-1',
  name: 'Professional',
  slug: 'professional',
  description: 'For growing teams',
  price_monthly: 99,
  price_yearly: 990,
  currency: 'USD',
  features: ['feature1', 'feature2'],
  limits: { users: 25, storage_gb: 100 },
  metadata: {},
  is_active: true,
  is_default: false,
  stripe_price_id_monthly: 'price_pro_monthly',
  stripe_price_id_yearly: 'price_pro_yearly',
  stripe_product_id: 'prod_pro',
  sort_order: 2,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

describe('PricingService', () => {
  let pricingService: PricingService

  beforeEach(() => {
    pricingService = new PricingService()
  })

  describe('convertPlanToPricingTier', () => {
    it('should convert plan to pricing tier format', () => {
      const tier = pricingService.convertPlanToPricingTier(mockPlan)

      expect(tier).toEqual({
        id: 'plan-1',
        name: 'Professional',
        description: 'For growing teams',
        price_monthly: 99,
        price_yearly: 990,
        popular: true, // professional is marked as popular
        features: [
          { name: 'feature1', included: true },
          { name: 'feature2', included: true }
        ],
        limits: { users: 25, storage_gb: 100 },
        cta_text: 'Get Started',
        stripe_price_id_monthly: 'price_pro_monthly',
        stripe_price_id_yearly: 'price_pro_yearly'
      })
    })
  })

  describe('calculatePricing', () => {
    it('should calculate pricing with monthly billing', () => {
      const result = pricingService.calculatePricing(100, 'monthly')

      expect(result).toEqual({
        originalPrice: 100,
        finalPrice: 100,
        savings: 0,
        discountPercentage: 0
      })
    })

    it('should calculate pricing with yearly billing and discount', () => {
      const result = pricingService.calculatePricing(100, 'yearly')

      expect(result).toEqual({
        originalPrice: 100,
        finalPrice: 80,
        savings: 20,
        discountPercentage: 20
      })
    })

    it('should calculate pricing with custom discount', () => {
      const result = pricingService.calculatePricing(100, 'monthly', 0.1)

      expect(result).toEqual({
        originalPrice: 100,
        finalPrice: 90,
        savings: 10,
        discountPercentage: 10
      })
    })
  })

  describe('validatePlanConfiguration', () => {
    it('should validate complete plan configuration', () => {
      const result = pricingService.validatePlanConfiguration(mockPlan)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return errors for missing required fields', () => {
      const incompletePlan = {
        price_monthly: 50
      }

      const result = pricingService.validatePlanConfiguration(incompletePlan)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Plan name is required')
      expect(result.errors).toContain('Plan slug is required')
      expect(result.errors).toContain('Currency is required')
    })

    it('should return errors for invalid pricing', () => {
      const invalidPlan = {
        name: 'Test Plan',
        slug: 'test',
        currency: 'USD',
        price_monthly: -10,
        price_yearly: -100,
        features: []
      }

      const result = pricingService.validatePlanConfiguration(invalidPlan)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Monthly price cannot be negative')
      expect(result.errors).toContain('Yearly price cannot be negative')
    })

    it('should return warnings for suboptimal configuration', () => {
      const suboptimalPlan = {
        name: 'Test Plan',
        slug: 'test',
        currency: 'USD',
        price_monthly: 100,
        price_yearly: 1200, // No discount
        features: []
      }

      const result = pricingService.validatePlanConfiguration(suboptimalPlan)

      expect(result.warnings).toContain('Yearly price should be discounted compared to monthly')
      expect(result.warnings).toContain('Plan has no features defined')
    })
  })
})