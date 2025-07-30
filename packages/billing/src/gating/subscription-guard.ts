import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Subscription, Plan } from '../types'

export class SubscriptionGuard {
  private supabase = getSupabaseBrowserClient()

  /**
   * Check if organization has active subscription
   */
  async hasActiveSubscription(organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('status')
        .eq('organization_id', organizationId)
        .in('status', ['active', 'trialing'])
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  /**
   * Check if organization has specific plan
   */
  async hasPlan(organizationId: string, planSlug: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(`
          status,
          plans!inner(slug)
        `)
        .eq('organization_id', organizationId)
        .eq('plans.slug', planSlug)
        .in('status', ['active', 'trialing'])
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking plan:', error)
      return false
    }
  }

  /**
   * Check if organization has feature access
   */
  async hasFeatureAccess(
    organizationId: string,
    feature: string
  ): Promise<{
    hasAccess: boolean
    reason?: 'no_subscription' | 'feature_not_included' | 'subscription_inactive'
    currentPlan?: string
  }> {
    try {
      // Get current subscription with plan details
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select(`
          status,
          plans!inner(
            slug,
            features
          )
        `)
        .eq('organization_id', organizationId)
        .single()

      if (error || !subscription) {
        return {
          hasAccess: false,
          reason: 'no_subscription'
        }
      }

      if (!['active', 'trialing'].includes(subscription.status)) {
        return {
          hasAccess: false,
          reason: 'subscription_inactive',
          currentPlan: subscription.plans.slug
        }
      }

      const planFeatures = subscription.plans.features as string[]
      const hasFeature = planFeatures.includes(feature)

      return {
        hasAccess: hasFeature,
        reason: hasFeature ? undefined : 'feature_not_included',
        currentPlan: subscription.plans.slug
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      return {
        hasAccess: false,
        reason: 'no_subscription'
      }
    }
  }

  /**
   * Get organization subscription with plan details
   */
  async getSubscriptionDetails(organizationId: string): Promise<{
    subscription?: Subscription & { plan?: Plan }
    isActive: boolean
    isTrialing: boolean
    daysUntilExpiry?: number
  }> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(`
          *,
          plans(*)
        `)
        .eq('organization_id', organizationId)
        .single()

      if (error || !data) {
        return { isActive: false, isTrialing: false }
      }

      const subscription = data as Subscription & { plan: Plan }
      const isActive = subscription.status === 'active'
      const isTrialing = subscription.status === 'trialing'

      let daysUntilExpiry: number | undefined
      if (subscription.current_period_end) {
        const endDate = new Date(subscription.current_period_end)
        const now = new Date()
        const diffTime = endDate.getTime() - now.getTime()
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }

      return {
        subscription,
        isActive,
        isTrialing,
        daysUntilExpiry
      }
    } catch (error) {
      console.error('Error getting subscription details:', error)
      return { isActive: false, isTrialing: false }
    }
  }

  /**
   * Check multiple features at once
   */
  async checkMultipleFeatures(
    organizationId: string,
    features: string[]
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select(`
          status,
          plans!inner(features)
        `)
        .eq('organization_id', organizationId)
        .in('status', ['active', 'trialing'])
        .single()

      if (error || !subscription) {
        return features.reduce((acc, feature) => ({
          ...acc,
          [feature]: false
        }), {})
      }

      const planFeatures = subscription.plans.features as string[]

      return features.reduce((acc, feature) => ({
        ...acc,
        [feature]: planFeatures.includes(feature)
      }), {})
    } catch (error) {
      console.error('Error checking multiple features:', error)
      return features.reduce((acc, feature) => ({
        ...acc,
        [feature]: false
      }), {})
    }
  }

  /**
   * Check if organization can upgrade to specific plan
   */
  async canUpgradeTo(
    organizationId: string,
    targetPlanSlug: string
  ): Promise<{
    canUpgrade: boolean
    currentPlan?: string
    reason?: string
  }> {
    try {
      // Get current subscription
      const details = await this.getSubscriptionDetails(organizationId)
      
      if (!details.subscription) {
        return {
          canUpgrade: true,
          reason: 'No current subscription'
        }
      }

      // Get target plan details
      const { data: targetPlan, error } = await this.supabase
        .from('plans')
        .select('*')
        .eq('slug', targetPlanSlug)
        .eq('is_active', true)
        .single()

      if (error || !targetPlan) {
        return {
          canUpgrade: false,
          reason: 'Target plan not found or inactive'
        }
      }

      const currentPlan = details.subscription.plan
      if (!currentPlan) {
        return {
          canUpgrade: true,
          reason: 'No current plan'
        }
      }

      // Check if it's actually an upgrade (based on price or sort order)
      const isUpgrade = targetPlan.sort_order > currentPlan.sort_order ||
                       (targetPlan.price_monthly || 0) > (currentPlan.price_monthly || 0)

      return {
        canUpgrade: isUpgrade,
        currentPlan: currentPlan.slug,
        reason: isUpgrade ? undefined : 'Target plan is not an upgrade'
      }
    } catch (error) {
      console.error('Error checking upgrade eligibility:', error)
      return {
        canUpgrade: false,
        reason: 'Error checking upgrade eligibility'
      }
    }
  }

  /**
   * Middleware function for API route protection
   */
  createMiddleware() {
    return async (
      organizationId: string,
      requiredFeatures: string | string[]
    ): Promise<{
      allowed: boolean
      reason?: string
      statusCode?: number
    }> => {
      const features = Array.isArray(requiredFeatures) ? requiredFeatures : [requiredFeatures]

      try {
        const featureChecks = await this.checkMultipleFeatures(organizationId, features)
        const hasAllFeatures = features.every(feature => featureChecks[feature])

        if (hasAllFeatures) {
          return { allowed: true }
        }

        const missingFeatures = features.filter(feature => !featureChecks[feature])
        
        return {
          allowed: false,
          reason: `Missing required features: ${missingFeatures.join(', ')}`,
          statusCode: 403
        }
      } catch (error) {
        console.error('Subscription middleware error:', error)
        return {
          allowed: false,
          reason: 'Error checking subscription',
          statusCode: 500
        }
      }
    }
  }
}