import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Plan } from '../types'

export class PlanChecker {
  private supabase = getSupabaseBrowserClient()
  private planCache = new Map<string, Plan>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes

  /**
   * Get plan by ID with caching
   */
  async getPlan(planId: string): Promise<Plan | null> {
    // Check cache first
    if (this.planCache.has(planId)) {
      return this.planCache.get(planId) || null
    }

    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error || !data) {
        return null
      }

      // Cache the result
      this.planCache.set(planId, data)
      setTimeout(() => this.planCache.delete(planId), this.cacheExpiry)

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

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching plan by slug:', error)
      return null
    }
  }

  /**
   * Check if plan has specific feature
   */
  async planHasFeature(planId: string, feature: string): Promise<boolean> {
    const plan = await this.getPlan(planId)
    
    if (!plan) {
      return false
    }

    const features = plan.features as string[]
    return features.includes(feature)
  }

  /**
   * Check if plan has all specified features
   */
  async planHasAllFeatures(planId: string, features: string[]): Promise<boolean> {
    const plan = await this.getPlan(planId)
    
    if (!plan) {
      return false
    }

    const planFeatures = plan.features as string[]
    return features.every(feature => planFeatures.includes(feature))
  }

  /**
   * Check if plan has any of the specified features
   */
  async planHasAnyFeature(planId: string, features: string[]): Promise<boolean> {
    const plan = await this.getPlan(planId)
    
    if (!plan) {
      return false
    }

    const planFeatures = plan.features as string[]
    return features.some(feature => planFeatures.includes(feature))
  }

  /**
   * Get plan feature limits
   */
  async getPlanLimits(planId: string): Promise<Record<string, number>> {
    const plan = await this.getPlan(planId)
    
    if (!plan) {
      return {}
    }

    return plan.limits as Record<string, number>
  }

  /**
   * Check if plan has sufficient limit for feature
   */
  async checkPlanLimit(
    planId: string,
    feature: string,
    requiredAmount: number
  ): Promise<{
    hasLimit: boolean
    limit?: number
    sufficient: boolean
  }> {
    const limits = await this.getPlanLimits(planId)
    const limit = limits[feature]

    if (limit === undefined) {
      return {
        hasLimit: false,
        sufficient: true // No limit means unlimited
      }
    }

    return {
      hasLimit: true,
      limit,
      sufficient: requiredAmount <= limit
    }
  }

  /**
   * Compare two plans
   */
  async comparePlans(planId1: string, planId2: string): Promise<{
    plan1: Plan | null
    plan2: Plan | null
    comparison: {
      price_difference_monthly: number
      price_difference_yearly: number
      feature_differences: {
        plan1_only: string[]
        plan2_only: string[]
        common: string[]
      }
      limit_differences: Record<string, {
        plan1: number
        plan2: number
        difference: number
      }>
      upgrade_recommended: 'plan1' | 'plan2' | 'similar'
    }
  }> {
    const [plan1, plan2] = await Promise.all([
      this.getPlan(planId1),
      this.getPlan(planId2)
    ])

    if (!plan1 || !plan2) {
      return {
        plan1,
        plan2,
        comparison: {
          price_difference_monthly: 0,
          price_difference_yearly: 0,
          feature_differences: { plan1_only: [], plan2_only: [], common: [] },
          limit_differences: {},
          upgrade_recommended: 'similar'
        }
      }
    }

    // Price differences
    const priceDiffMonthly = (plan2.price_monthly || 0) - (plan1.price_monthly || 0)
    const priceDiffYearly = (plan2.price_yearly || 0) - (plan1.price_yearly || 0)

    // Feature differences
    const features1 = plan1.features as string[]
    const features2 = plan2.features as string[]
    const allFeatures = new Set([...features1, ...features2])

    const plan1Only = features1.filter(f => !features2.includes(f))
    const plan2Only = features2.filter(f => !features1.includes(f))
    const common = features1.filter(f => features2.includes(f))

    // Limit differences
    const limits1 = plan1.limits as Record<string, number>
    const limits2 = plan2.limits as Record<string, number>
    const allLimitKeys = new Set([...Object.keys(limits1), ...Object.keys(limits2)])

    const limitDifferences: Record<string, any> = {}
    for (const key of allLimitKeys) {
      const limit1 = limits1[key] || 0
      const limit2 = limits2[key] || 0
      limitDifferences[key] = {
        plan1: limit1,
        plan2: limit2,
        difference: limit2 - limit1
      }
    }

    // Upgrade recommendation based on sort order
    let upgradeRecommended: 'plan1' | 'plan2' | 'similar'
    if (plan2.sort_order > plan1.sort_order) {
      upgradeRecommended = 'plan2'
    } else if (plan1.sort_order > plan2.sort_order) {
      upgradeRecommended = 'plan1'
    } else {
      upgradeRecommended = 'similar'
    }

    return {
      plan1,
      plan2,
      comparison: {
        price_difference_monthly: priceDiffMonthly,
        price_difference_yearly: priceDiffYearly,
        feature_differences: {
          plan1_only: plan1Only,
          plan2_only: plan2Only,
          common
        },
        limit_differences: limitDifferences,
        upgrade_recommended: upgradeRecommended
      }
    }
  }

  /**
   * Get all available plans
   */
  async getAvailablePlans(): Promise<Plan[]> {
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
      console.error('Error fetching available plans:', error)
      return []
    }
  }

  /**
   * Find plans that include specific feature
   */
  async findPlansWithFeature(feature: string): Promise<Plan[]> {
    try {
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .contains('features', [feature])
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error finding plans with feature:', error)
      return []
    }
  }

  /**
   * Get cheapest plan that includes all features
   */
  async getCheapestPlanWithFeatures(features: string[]): Promise<Plan | null> {
    const plans = await this.getAvailablePlans()

    const suitablePlans = plans.filter(plan => {
      const planFeatures = plan.features as string[]
      return features.every(feature => planFeatures.includes(feature))
    })

    if (suitablePlans.length === 0) {
      return null
    }

    // Sort by monthly price (ascending)
    suitablePlans.sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0))

    return suitablePlans[0]
  }

  /**
   * Clear plan cache
   */
  clearCache(): void {
    this.planCache.clear()
  }

  /**
   * Validate plan configuration
   */
  async validatePlan(plan: Partial<Plan>): Promise<{
    isValid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    if (!plan.name) {
      errors.push('Plan name is required')
    }

    if (!plan.slug) {
      errors.push('Plan slug is required')
    }

    if (!plan.currency) {
      errors.push('Plan currency is required')
    }

    if (!Array.isArray(plan.features)) {
      errors.push('Plan features must be an array')
    }

    if (!plan.limits || typeof plan.limits !== 'object') {
      errors.push('Plan limits must be an object')
    }

    if (plan.price_monthly !== undefined && plan.price_monthly < 0) {
      errors.push('Monthly price cannot be negative')
    }

    if (plan.price_yearly !== undefined && plan.price_yearly < 0) {
      errors.push('Yearly price cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}