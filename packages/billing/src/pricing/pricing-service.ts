import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Plan, PricingTier } from '../types'

export class PricingService {
  private supabase = getSupabaseBrowserClient()

  /**
   * Get all active plans
   */
  async getActivePlans(): Promise<Plan[]> {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching active plans:', error)
      return []
    }
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: string): Promise<Plan | null> {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching plan:', error)
      return null
    }
  }

  /**
   * Get plan by slug
   */
  async getPlanBySlug(slug: string): Promise<Plan | null> {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching plan by slug:', error)
      return null
    }
  }

  /**
   * Convert database plan to pricing tier format
   */
  convertPlanToPricingTier(plan: Plan): PricingTier {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || 0,
      popular: plan.slug === 'professional', // Default popular plan
      features: (plan.features as string[]).map(feature => ({
        name: feature,
        included: true
      })),
      limits: plan.limits as Record<string, number>,
      cta_text: 'Get Started',
      stripe_price_id_monthly: plan.stripe_price_id_monthly || '',
      stripe_price_id_yearly: plan.stripe_price_id_yearly || ''
    }
  }

  /**
   * Get pricing tiers for display
   */
  async getPricingTiers(): Promise<PricingTier[]> {
    const plans = await this.getActivePlans()
    return plans.map(plan => this.convertPlanToPricingTier(plan))
  }

  /**
   * Calculate pricing with discounts
   */
  calculatePricing(
    basePrice: number,
    billingCycle: 'monthly' | 'yearly',
    discount?: number
  ): {
    originalPrice: number
    finalPrice: number
    savings: number
    discountPercentage: number
  } {
    const originalPrice = basePrice
    const discountPercentage = discount || (billingCycle === 'yearly' ? 0.2 : 0) // 20% annual discount
    const savings = Math.round(originalPrice * discountPercentage)
    const finalPrice = originalPrice - savings

    return {
      originalPrice,
      finalPrice,
      savings,
      discountPercentage: discountPercentage * 100
    }
  }

  /**
   * Get recommended plan based on usage
   */
  async getRecommendedPlan(
    currentUsage: Record<string, number>
  ): Promise<Plan | null> {
    const plans = await this.getActivePlans()
    
    // Find the cheapest plan that can accommodate current usage
    for (const plan of plans) {
      const limits = plan.limits as Record<string, number>
      const canAccommodate = Object.entries(currentUsage).every(([feature, usage]) => {
        const limit = limits[feature]
        return !limit || limit === -1 || usage <= limit // -1 means unlimited
      })

      if (canAccommodate) {
        return plan
      }
    }

    // If no plan can accommodate, return the highest tier
    return plans[plans.length - 1] || null
  }

  /**
   * Compare plans
   */
  async comparePlans(planIds: string[]): Promise<{
    plans: Plan[]
    comparison: {
      features: string[]
      featureMatrix: Record<string, Record<string, boolean>>
      limits: Record<string, Record<string, number>>
      pricing: Record<string, { monthly: number; yearly: number }>
    }
  }> {
    const plans = await Promise.all(
      planIds.map(id => this.getPlan(id))
    )
    const validPlans = plans.filter(Boolean) as Plan[]

    // Get all unique features
    const allFeatures = new Set<string>()
    validPlans.forEach(plan => {
      (plan.features as string[]).forEach(feature => allFeatures.add(feature))
    })

    // Build feature matrix
    const featureMatrix: Record<string, Record<string, boolean>> = {}
    Array.from(allFeatures).forEach(feature => {
      featureMatrix[feature] = {}
      validPlans.forEach(plan => {
        featureMatrix[feature][plan.id] = (plan.features as string[]).includes(feature)
      })
    })

    // Build limits comparison
    const limits: Record<string, Record<string, number>> = {}
    const allLimitKeys = new Set<string>()
    validPlans.forEach(plan => {
      Object.keys(plan.limits as Record<string, number>).forEach(key => 
        allLimitKeys.add(key)
      )
    })

    Array.from(allLimitKeys).forEach(limitKey => {
      limits[limitKey] = {}
      validPlans.forEach(plan => {
        limits[limitKey][plan.id] = (plan.limits as Record<string, number>)[limitKey] || 0
      })
    })

    // Build pricing comparison
    const pricing: Record<string, { monthly: number; yearly: number }> = {}
    validPlans.forEach(plan => {
      pricing[plan.id] = {
        monthly: plan.price_monthly || 0,
        yearly: plan.price_yearly || 0
      }
    })

    return {
      plans: validPlans,
      comparison: {
        features: Array.from(allFeatures),
        featureMatrix,
        limits,
        pricing
      }
    }
  }

  /**
   * Get upgrade path recommendations
   */
  async getUpgradePath(
    currentPlanId: string,
    targetFeatures: string[]
  ): Promise<{
    currentPlan: Plan | null
    recommendedPlans: Plan[]
    missingFeatures: string[]
  }> {
    const currentPlan = await this.getPlan(currentPlanId)
    const allPlans = await this.getActivePlans()

    if (!currentPlan) {
      return {
        currentPlan: null,
        recommendedPlans: [],
        missingFeatures: targetFeatures
      }
    }

    const currentFeatures = (currentPlan.features as string[]) || []
    const missingFeatures = targetFeatures.filter(
      feature => !currentFeatures.includes(feature)
    )

    if (missingFeatures.length === 0) {
      return {
        currentPlan,
        recommendedPlans: [],
        missingFeatures: []
      }
    }

    // Find plans that include the missing features and are higher tier
    const recommendedPlans = allPlans.filter(plan => {
      const planFeatures = (plan.features as string[]) || []
      const hasAllMissingFeatures = missingFeatures.every(
        feature => planFeatures.includes(feature)
      )
      const isHigherTier = plan.sort_order > currentPlan.sort_order
      
      return hasAllMissingFeatures && isHigherTier
    })

    return {
      currentPlan,
      recommendedPlans,
      missingFeatures
    }
  }

  /**
   * Validate plan configuration
   */
  validatePlanConfiguration(plan: Partial<Plan>): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!plan.name) errors.push('Plan name is required')
    if (!plan.slug) errors.push('Plan slug is required')
    if (!plan.currency) errors.push('Currency is required')

    // Pricing validation
    if (plan.price_monthly !== undefined && plan.price_monthly < 0) {
      errors.push('Monthly price cannot be negative')
    }
    if (plan.price_yearly !== undefined && plan.price_yearly < 0) {
      errors.push('Yearly price cannot be negative')
    }

    // Yearly pricing should be discounted
    if (plan.price_monthly && plan.price_yearly) {
      const monthlyAnnual = plan.price_monthly * 12
      if (plan.price_yearly >= monthlyAnnual) {
        warnings.push('Yearly price should be discounted compared to monthly')
      }
    }

    // Features validation
    if (!Array.isArray(plan.features)) {
      errors.push('Features must be an array')
    } else if (plan.features.length === 0) {
      warnings.push('Plan has no features defined')
    }

    // Limits validation
    if (plan.limits && typeof plan.limits !== 'object') {
      errors.push('Limits must be an object')
    }

    // Stripe integration
    if (plan.price_monthly && !plan.stripe_price_id_monthly) {
      warnings.push('Monthly Stripe price ID is missing')
    }
    if (plan.price_yearly && !plan.stripe_price_id_yearly) {
      warnings.push('Yearly Stripe price ID is missing')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}