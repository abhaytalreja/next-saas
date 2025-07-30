import { IndustryPricingManager } from '../../pricing/industry-pricing'
import type { IndustryPricing, PricingTier } from '../../types'

describe('IndustryPricingManager', () => {
  let pricingManager: IndustryPricingManager

  beforeEach(() => {
    pricingManager = new IndustryPricingManager()
  })

  describe('initialization', () => {
    it('should initialize with default industry configurations', () => {
      const industries = pricingManager.getAvailableIndustries()
      
      expect(industries).toContain('saas')
      expect(industries).toContain('ecommerce')
      expect(industries).toContain('fintech')
      expect(industries).toContain('healthcare')
      expect(industries).toContain('real_estate')
      expect(industries.length).toBeGreaterThan(0)
    })

    it('should have valid pricing configurations for each industry', () => {
      const industries = pricingManager.getAvailableIndustries()
      
      industries.forEach(industry => {
        const config = pricingManager.getIndustryPricing(industry)
        expect(config).not.toBeNull()
        expect(config?.industry).toBe(industry)
        expect(config?.tiers).toBeDefined()
        expect(Array.isArray(config?.tiers)).toBe(true)
        expect(config?.tiers.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getIndustryPricing', () => {
    it('should return pricing configuration for valid industry', () => {
      const saasPricing = pricingManager.getIndustryPricing('saas')
      
      expect(saasPricing).not.toBeNull()
      expect(saasPricing?.industry).toBe('saas')
      expect(saasPricing?.displayName).toBe('SaaS & Software')
      expect(saasPricing?.tiers).toBeDefined()
    })

    it('should return null for invalid industry', () => {
      const invalidPricing = pricingManager.getIndustryPricing('nonexistent')
      
      expect(invalidPricing).toBeNull()
    })

    it('should return complete pricing structure for ecommerce', () => {
      const ecommercePricing = pricingManager.getIndustryPricing('ecommerce')
      
      expect(ecommercePricing).not.toBeNull()
      expect(ecommercePricing?.industry).toBe('ecommerce')
      expect(ecommercePricing?.displayName).toBe('E-commerce & Retail')
      
      // Check tier structure
      const tiers = ecommercePricing?.tiers || []
      expect(tiers.length).toBeGreaterThan(0)
      
      tiers.forEach(tier => {
        expect(tier.id).toBeDefined()
        expect(tier.name).toBeDefined()
        expect(typeof tier.price).toBe('number')
        expect(tier.currency).toBeDefined()
        expect(tier.interval).toBeDefined()
        expect(Array.isArray(tier.features)).toBe(true)
      })
    })
  })

  describe('getAvailableIndustries', () => {
    it('should return array of industry keys', () => {
      const industries = pricingManager.getAvailableIndustries()
      
      expect(Array.isArray(industries)).toBe(true)
      expect(industries.length).toBeGreaterThan(0)
      expect(industries.every(industry => typeof industry === 'string')).toBe(true)
    })

    it('should return consistent results on multiple calls', () => {
      const industries1 = pricingManager.getAvailableIndustries()
      const industries2 = pricingManager.getAvailableIndustries()
      
      expect(industries1).toEqual(industries2)
    })
  })

  describe('setIndustryPricing', () => {
    const customIndustryConfig: IndustryPricing = {
      industry: 'custom',
      displayName: 'Custom Industry',
      description: 'Custom industry pricing',
      tiers: [
        {
          id: 'custom_basic',
          name: 'Basic',
          price: 49,
          currency: 'usd',
          interval: 'month',
          features: ['custom_feature_1', 'custom_feature_2'],
          limits: { api_calls: 500 },
          recommended: false,
          popular: false
        }
      ],
      currency: 'usd',
      features: {
        custom_feature_1: {
          name: 'Custom Feature 1',
          description: 'Description of custom feature 1',
          tiers: ['custom_basic']
        }
      }
    }

    it('should add new industry pricing configuration', () => {
      pricingManager.setIndustryPricing('custom', customIndustryConfig)
      
      const retrieved = pricingManager.getIndustryPricing('custom')
      expect(retrieved).toEqual(customIndustryConfig)
      
      const industries = pricingManager.getAvailableIndustries()
      expect(industries).toContain('custom')
    })

    it('should update existing industry pricing configuration', () => {
      // First, set the custom config
      pricingManager.setIndustryPricing('custom', customIndustryConfig)
      
      // Then update it
      const updatedConfig = {
        ...customIndustryConfig,
        displayName: 'Updated Custom Industry'
      }
      pricingManager.setIndustryPricing('custom', updatedConfig)
      
      const retrieved = pricingManager.getIndustryPricing('custom')
      expect(retrieved?.displayName).toBe('Updated Custom Industry')
    })

    it('should overwrite existing industry completely', () => {
      const originalSaas = pricingManager.getIndustryPricing('saas')
      expect(originalSaas).not.toBeNull()
      
      pricingManager.setIndustryPricing('saas', customIndustryConfig)
      
      const newSaas = pricingManager.getIndustryPricing('saas')
      expect(newSaas).toEqual(customIndustryConfig)
      expect(newSaas).not.toEqual(originalSaas)
    })
  })

  describe('getCustomizedPricing', () => {
    it('should return null for invalid industry', () => {
      const result = pricingManager.getCustomizedPricing('nonexistent')
      expect(result).toBeNull()
    })

    it('should return original pricing when no modifications provided', () => {
      const original = pricingManager.getIndustryPricing('saas')
      const customized = pricingManager.getCustomizedPricing('saas')
      
      expect(customized).toEqual(original)
    })

    it('should apply currency modifications', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        currency: 'eur'
      })
      
      expect(customized).not.toBeNull()
      expect(customized?.currency).toBe('eur')
      expect(customized?.tiers.every(tier => tier.currency === 'eur')).toBe(true)
    })

    it('should apply discount modifications', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        discounts: {
          'starter': 10, // 10% discount
          'professional': 20 // 20% discount
        }
      })
      
      expect(customized).not.toBeNull()
      
      const original = pricingManager.getIndustryPricing('saas')
      const originalStarter = original?.tiers.find(t => t.id === 'starter')
      const customizedStarter = customized?.tiers.find(t => t.id === 'starter')
      
      if (originalStarter && customizedStarter) {
        const expectedPrice = Math.round(originalStarter.price * 0.9) // 10% discount
        expect(customizedStarter.price).toBe(expectedPrice)
      }
    })

    it('should apply additional features modifications', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        additionalFeatures: [
          {
            tier: 'starter',
            features: ['custom_addon_1', 'custom_addon_2']
          }
        ]
      })
      
      expect(customized).not.toBeNull()
      
      const starterTier = customized?.tiers.find(t => t.id === 'starter')
      expect(starterTier?.features).toContain('custom_addon_1')
      expect(starterTier?.features).toContain('custom_addon_2')
    })

    it('should apply all modifications together', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        currency: 'eur',
        discounts: { 'starter': 15 },
        additionalFeatures: [
          {
            tier: 'starter',
            features: ['premium_support']
          }
        ]
      })
      
      expect(customized).not.toBeNull()
      expect(customized?.currency).toBe('eur')
      
      const starterTier = customized?.tiers.find(t => t.id === 'starter')
      expect(starterTier?.currency).toBe('eur')
      expect(starterTier?.features).toContain('premium_support')
      
      // Check discount was applied
      const original = pricingManager.getIndustryPricing('saas')
      const originalStarter = original?.tiers.find(t => t.id === 'starter')
      if (originalStarter && starterTier) {
        const expectedPrice = Math.round(originalStarter.price * 0.85) // 15% discount
        expect(starterTier.price).toBe(expectedPrice)
      }
    })

    it('should not modify tiers that are not specified in additional features', () => {
      const original = pricingManager.getIndustryPricing('saas')
      const customized = pricingManager.getCustomizedPricing('saas', {
        additionalFeatures: [
          {
            tier: 'starter',
            features: ['custom_feature']
          }
        ]
      })
      
      const originalProfessional = original?.tiers.find(t => t.id === 'professional')
      const customizedProfessional = customized?.tiers.find(t => t.id === 'professional')
      
      expect(originalProfessional?.features).toEqual(customizedProfessional?.features)
    })

    it('should handle discounts for non-existent tiers gracefully', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        discounts: {
          'nonexistent_tier': 50
        }
      })
      
      expect(customized).not.toBeNull()
      // Should not crash and should return valid pricing
      expect(customized?.tiers.length).toBeGreaterThan(0)
    })

    it('should handle additional features for non-existent tiers gracefully', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        additionalFeatures: [
          {
            tier: 'nonexistent_tier',
            features: ['some_feature']
          }
        ]
      })
      
      expect(customized).not.toBeNull()
      // Should not crash and should return valid pricing
      expect(customized?.tiers.length).toBeGreaterThan(0)
    })
  })

  describe('compareIndustryPricing', () => {
    it('should compare pricing between two industries', () => {
      const comparison = pricingManager.compareIndustryPricing('saas', 'ecommerce')
      
      expect(comparison).not.toBeNull()
      expect(comparison?.industry1).toBe('saas')
      expect(comparison?.industry2).toBe('ecommerce')
      expect(comparison?.pricing1).not.toBeNull()
      expect(comparison?.pricing2).not.toBeNull()
      expect(Array.isArray(comparison?.tierComparisons)).toBe(true)
    })

    it('should return null when first industry is invalid', () => {
      const comparison = pricingManager.compareIndustryPricing('invalid', 'saas')
      expect(comparison).toBeNull()
    })

    it('should return null when second industry is invalid', () => {
      const comparison = pricingManager.compareIndustryPricing('saas', 'invalid')
      expect(comparison).toBeNull()
    })

    it('should return null when both industries are invalid', () => {
      const comparison = pricingManager.compareIndustryPricing('invalid1', 'invalid2')
      expect(comparison).toBeNull()
    })
  })

  describe('getRecommendedTier', () => {
    it('should return recommended tier for industry', () => {
      const recommended = pricingManager.getRecommendedTier('saas')
      
      if (recommended) {
        expect(recommended.recommended).toBe(true)
      } else {
        // If no tier is explicitly marked as recommended, method should return null
        expect(recommended).toBeNull()
      }
    })

    it('should return null for invalid industry', () => {
      const recommended = pricingManager.getRecommendedTier('invalid')
      expect(recommended).toBeNull()
    })

    it('should return null when no tier is marked as recommended', () => {
      // Create industry config with no recommended tiers
      const noRecommendedConfig: IndustryPricing = {
        industry: 'no_recommended',
        displayName: 'No Recommended',
        description: 'No recommended tiers',
        tiers: [
          {
            id: 'tier1',
            name: 'Tier 1',
            price: 10,
            currency: 'usd',
            interval: 'month',
            features: [],
            limits: {},
            recommended: false,
            popular: false
          }
        ],
        currency: 'usd',
        features: {}
      }

      pricingManager.setIndustryPricing('no_recommended', noRecommendedConfig)
      
      const recommended = pricingManager.getRecommendedTier('no_recommended')
      expect(recommended).toBeNull()
    })
  })

  describe('getMostPopularTier', () => {
    it('should return most popular tier for industry', () => {
      const popular = pricingManager.getMostPopularTier('saas')
      
      if (popular) {
        expect(popular.popular).toBe(true)
      } else {
        // If no tier is explicitly marked as popular, method should return null
        expect(popular).toBeNull()
      }
    })

    it('should return null for invalid industry', () => {
      const popular = pricingManager.getMostPopularTier('invalid')
      expect(popular).toBeNull()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty modifications object', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {})
      const original = pricingManager.getIndustryPricing('saas')
      
      expect(customized).toEqual(original)
    })

    it('should handle zero discount', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        discounts: { 'starter': 0 }
      })
      
      const original = pricingManager.getIndustryPricing('saas')
      const originalStarter = original?.tiers.find(t => t.id === 'starter')
      const customizedStarter = customized?.tiers.find(t => t.id === 'starter')
      
      expect(originalStarter?.price).toBe(customizedStarter?.price)
    })

    it('should handle 100% discount', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        discounts: { 'starter': 100 }
      })
      
      const starterTier = customized?.tiers.find(t => t.id === 'starter')
      expect(starterTier?.price).toBe(0)
    })

    it('should handle negative discount (price increase)', () => {
      const customized = pricingManager.getCustomizedPricing('saas', {
        discounts: { 'starter': -50 } // 50% price increase
      })
      
      const original = pricingManager.getIndustryPricing('saas')
      const originalStarter = original?.tiers.find(t => t.id === 'starter')
      const customizedStarter = customized?.tiers.find(t => t.id === 'starter')
      
      if (originalStarter && customizedStarter) {
        const expectedPrice = Math.round(originalStarter.price * 1.5) // 50% increase
        expect(customizedStarter.price).toBe(expectedPrice)
      }
    })
  })
})