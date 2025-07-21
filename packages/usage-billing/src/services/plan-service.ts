import { createClient } from '@nextsaas/supabase/server'
import type { 
  BillingPlan,
  PlanConfiguration,
  PlanRecommendation,
  UsageSimulation,
  PlanComparison,
  UpgradeOption,
  UsageProfile
} from '../types'

export class PlanService {
  private supabase = createClient()

  /**
   * Get available plans for an organization with recommendations
   */
  async getPlanConfiguration(organizationId: string): Promise<PlanConfiguration> {
    const [availablePlans, currentPlan, usageProfile] = await Promise.all([
      this.getAvailablePlans(),
      this.getCurrentPlan(organizationId),
      this.getOrganizationUsageProfile(organizationId)
    ])

    const planComparison = await this.generatePlanComparison(availablePlans, usageProfile)
    const upgradeOptions = await this.getUpgradeOptions(organizationId, availablePlans)
    const recommendedPlan = await this.getRecommendedPlan(organizationId, availablePlans, usageProfile)

    return {
      organization_id: organizationId,
      available_plans: availablePlans,
      current_plan: currentPlan,
      recommended_plan: recommendedPlan,
      usage_based_pricing: this.extractUsagePricing(availablePlans),
      plan_comparison: planComparison,
      upgrade_options: upgradeOptions
    }
  }

  /**
   * Get all available billing plans
   */
  private async getAvailablePlans(): Promise<BillingPlan[]> {
    const { data, error } = await this.supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('base_price', { ascending: true })

    if (error) {
      throw new Error(`Failed to get plans: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get organization's current plan
   */
  private async getCurrentPlan(organizationId: string): Promise<BillingPlan | undefined> {
    const { data } = await this.supabase
      .from('subscriptions')
      .select(`
        plan_id,
        plans (*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()

    return data?.plans
  }

  /**
   * Get organization's usage profile for plan recommendations
   */
  private async getOrganizationUsageProfile(organizationId: string): Promise<UsageProfile> {
    const { data } = await this.supabase
      .rpc('get_organization_usage_profile', {
        org_id: organizationId,
        days: 30
      })

    return data || {
      description: 'Low usage profile',
      usage_amounts: {}
    }
  }

  /**
   * Generate comprehensive plan comparison
   */
  private async generatePlanComparison(
    plans: BillingPlan[], 
    usageProfile: UsageProfile
  ): Promise<PlanComparison> {
    const features = this.extractFeatures(plans)
    const pricingComparison = this.generatePricingComparison(plans, usageProfile)
    const limitsComparison = this.generateLimitsComparison(plans)

    return {
      plans,
      features,
      pricing_comparison: pricingComparison,
      usage_limits_comparison: limitsComparison
    }
  }

  /**
   * Extract unique features across all plans
   */
  private extractFeatures(plans: BillingPlan[]) {
    const allFeatures = new Map<string, any>()

    for (const plan of plans) {
      for (const feature of plan.features || []) {
        if (!allFeatures.has(feature.name)) {
          allFeatures.set(feature.name, {
            feature_name: feature.name,
            feature_description: feature.description,
            feature_category: 'General',
            plan_availability: {}
          })
        }

        const featureData = allFeatures.get(feature.name)!
        featureData.plan_availability[plan.id] = {
          included: feature.included,
          limit: feature.limit,
          unit: feature.unit,
          description: feature.description
        }
      }
    }

    return Array.from(allFeatures.values())
  }

  /**
   * Generate pricing comparison with usage examples
   */
  private generatePricingComparison(plans: BillingPlan[], usageProfile: UsageProfile) {
    const monthlyPricing: Record<string, number> = {}
    const yearlyPricing: Record<string, number> = {}
    const usagePricing: Record<string, any> = {}

    for (const plan of plans) {
      monthlyPricing[plan.id] = plan.base_price
      yearlyPricing[plan.id] = plan.billing_interval === 'yearly' 
        ? plan.base_price 
        : plan.base_price * 12 * 0.9 // 10% annual discount

      usagePricing[plan.id] = plan.usage_pricing || []
    }

    const costExamples = this.generateCostExamples(plans, usageProfile)

    return {
      monthly_pricing: monthlyPricing,
      yearly_pricing: yearlyPricing,
      usage_pricing: usagePricing,
      total_cost_examples: costExamples
    }
  }

  /**
   * Generate cost examples for different usage scenarios
   */
  private generateCostExamples(plans: BillingPlan[], baseUsage: UsageProfile) {
    const scenarios = [
      { name: 'Light Usage', multiplier: 0.5 },
      { name: 'Current Usage', multiplier: 1.0 },
      { name: 'Growth Scenario', multiplier: 2.0 },
      { name: 'Enterprise Scale', multiplier: 5.0 }
    ]

    return scenarios.map(scenario => {
      const usageProfile = {
        ...baseUsage,
        description: scenario.name,
        usage_amounts: Object.fromEntries(
          Object.entries(baseUsage.usage_amounts).map(([key, value]) => [
            key, 
            (value as number) * scenario.multiplier
          ])
        )
      }

      const monthlyCosts: Record<string, number> = {}
      const yearlyCosts: Record<string, number> = {}
      let recommendedPlan = plans[0]?.id

      for (const plan of plans) {
        const monthlyCost = this.calculatePlanCost(plan, usageProfile)
        monthlyCosts[plan.id] = monthlyCost
        yearlyCosts[plan.id] = monthlyCost * 12

        // Simple recommendation logic: lowest cost that meets requirements
        if (monthlyCost < monthlyCosts[recommendedPlan]) {
          recommendedPlan = plan.id
        }
      }

      return {
        scenario_name: scenario.name,
        usage_profile: usageProfile,
        monthly_costs: monthlyCosts,
        yearly_costs: yearlyCosts,
        recommended_plan: recommendedPlan
      }
    })
  }

  /**
   * Calculate total cost for a plan given usage profile
   */
  private calculatePlanCost(plan: BillingPlan, usageProfile: UsageProfile): number {
    let totalCost = plan.base_price

    for (const usagePricing of plan.usage_pricing || []) {
      const usage = usageProfile.usage_amounts[usagePricing.metric_id] || 0
      const freeTier = usagePricing.free_tier || 0
      const billableUsage = Math.max(0, usage - freeTier)

      switch (usagePricing.pricing_model) {
        case 'per_unit':
          totalCost += billableUsage * (usagePricing.unit_price || 0)
          break
        case 'tiered':
        case 'graduated':
          totalCost += this.calculateTieredCost(billableUsage, usagePricing.tiers || [])
          break
        case 'volume':
          totalCost += this.calculateVolumeCost(billableUsage, usagePricing.tiers || [])
          break
      }
    }

    return totalCost
  }

  /**
   * Calculate tiered pricing cost
   */
  private calculateTieredCost(usage: number, tiers: any[]): number {
    let cost = 0
    let remainingUsage = usage

    for (const tier of tiers.sort((a, b) => a.from - b.from)) {
      if (remainingUsage <= 0) break

      const tierStart = tier.from
      const tierEnd = tier.to || Infinity
      const tierCapacity = tierEnd - tierStart
      const usageInTier = Math.min(remainingUsage, tierCapacity)

      if (usageInTier > 0) {
        cost += usageInTier * tier.unit_price + (tier.flat_fee || 0)
        remainingUsage -= usageInTier
      }
    }

    return cost
  }

  /**
   * Calculate volume pricing cost
   */
  private calculateVolumeCost(usage: number, tiers: any[]): number {
    const sortedTiers = tiers.sort((a, b) => a.from - b.from)
    
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      const tier = sortedTiers[i]
      if (usage >= tier.from) {
        return usage * tier.unit_price + (tier.flat_fee || 0)
      }
    }

    return 0
  }

  /**
   * Generate limits comparison
   */
  private generateLimitsComparison(plans: BillingPlan[]) {
    const limitsMap = new Map<string, any>()

    for (const plan of plans) {
      for (const limit of plan.limits || []) {
        if (!limitsMap.has(limit.metric_id)) {
          limitsMap.set(limit.metric_id, {
            metric_name: limit.metric_name,
            unit: limit.unit,
            plan_limits: {}
          })
        }

        const limitData = limitsMap.get(limit.metric_id)!
        limitData.plan_limits[plan.id] = {
          limit: limit.limit_value,
          unlimited: limit.limit_value === -1,
          overage_allowed: limit.limit_type === 'soft',
          overage_rate: 0 // Would need to calculate from usage pricing
        }
      }
    }

    return Array.from(limitsMap.values())
  }

  /**
   * Get upgrade options for current plan
   */
  private async getUpgradeOptions(organizationId: string, plans: BillingPlan[]): Promise<UpgradeOption[]> {
    const currentPlan = await this.getCurrentPlan(organizationId)
    if (!currentPlan) return []

    const upgradeOptions: UpgradeOption[] = []

    for (const targetPlan of plans) {
      if (targetPlan.id === currentPlan.id) continue
      if (targetPlan.base_price <= currentPlan.base_price) continue

      const costImpact = await this.calculateUpgradeCostImpact(
        organizationId, 
        currentPlan.id, 
        targetPlan.id
      )

      const benefits = this.calculateUpgradeBenefits(currentPlan, targetPlan)

      upgradeOptions.push({
        from_plan_id: currentPlan.id,
        to_plan_id: targetPlan.id,
        upgrade_type: 'next_cycle',
        cost_impact: costImpact,
        benefits,
        recommended: targetPlan.base_price <= currentPlan.base_price * 2, // Simple recommendation
        available: true,
        restrictions: []
      })
    }

    return upgradeOptions
  }

  /**
   * Calculate cost impact of upgrading
   */
  private async calculateUpgradeCostImpact(
    organizationId: string, 
    fromPlanId: string, 
    toPlanId: string
  ) {
    // Get usage profile to estimate costs
    const usageProfile = await this.getOrganizationUsageProfile(organizationId)
    
    const [fromPlan, toPlan] = await Promise.all([
      this.supabase.from('plans').select('*').eq('id', fromPlanId).single(),
      this.supabase.from('plans').select('*').eq('id', toPlanId).single()
    ])

    const currentMonthlyCost = this.calculatePlanCost(fromPlan.data!, usageProfile)
    const newMonthlyCost = this.calculatePlanCost(toPlan.data!, usageProfile)

    return {
      immediate_charge: 0, // Would calculate prorated amount
      proration_credit: 0,
      next_cycle_change: newMonthlyCost - currentMonthlyCost,
      annual_savings: (currentMonthlyCost - newMonthlyCost) * 12,
      payback_period_months: 0
    }
  }

  /**
   * Calculate benefits of upgrading
   */
  private calculateUpgradeBenefits(currentPlan: BillingPlan, targetPlan: BillingPlan): string[] {
    const benefits: string[] = []

    // Compare features
    const currentFeatures = new Set(currentPlan.features?.map(f => f.name) || [])
    const targetFeatures = targetPlan.features || []

    for (const feature of targetFeatures) {
      if (!currentFeatures.has(feature.name) && feature.included) {
        benefits.push(`Access to ${feature.name}`)
      }
    }

    // Compare limits
    const currentLimits = new Map(currentPlan.limits?.map(l => [l.metric_id, l.limit_value]) || [])
    
    for (const limit of targetPlan.limits || []) {
      const currentLimit = currentLimits.get(limit.metric_id)
      if (!currentLimit || limit.limit_value > currentLimit) {
        benefits.push(`Increased ${limit.metric_name} limit: ${limit.limit_value} ${limit.unit}`)
      }
    }

    return benefits
  }

  /**
   * Get recommended plan using ML/heuristics
   */
  private async getRecommendedPlan(
    organizationId: string, 
    plans: BillingPlan[], 
    usageProfile: UsageProfile
  ): Promise<BillingPlan | undefined> {
    // Simple recommendation logic - can be enhanced with ML
    let bestPlan = plans[0]
    let bestScore = 0

    for (const plan of plans) {
      const cost = this.calculatePlanCost(plan, usageProfile)
      const value = this.calculatePlanValue(plan, usageProfile)
      const score = value / Math.max(cost, 1) // Value per dollar

      if (score > bestScore) {
        bestScore = score
        bestPlan = plan
      }
    }

    return bestPlan
  }

  /**
   * Calculate value score for a plan
   */
  private calculatePlanValue(plan: BillingPlan, usageProfile: UsageProfile): number {
    let value = 100 // Base value

    // Add value for included features
    value += (plan.features?.filter(f => f.included).length || 0) * 10

    // Add value for generous limits
    for (const limit of plan.limits || []) {
      const usage = usageProfile.usage_amounts[limit.metric_id] || 0
      if (limit.limit_value > usage * 2) {
        value += 20 // Room to grow
      }
    }

    return value
  }

  /**
   * Extract usage pricing from all plans
   */
  private extractUsagePricing(plans: BillingPlan[]) {
    const allUsagePricing = new Map<string, any>()

    for (const plan of plans) {
      for (const pricing of plan.usage_pricing || []) {
        allUsagePricing.set(pricing.metric_id, pricing)
      }
    }

    return Array.from(allUsagePricing.values())
  }

  /**
   * Simulate usage costs across different scenarios
   */
  async simulateUsageCosts(
    planId: string, 
    scenarios: UsageSimulation['usage_scenarios']
  ): Promise<UsageSimulation> {
    const { data: plan } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) {
      throw new Error('Plan not found')
    }

    const results = scenarios.map(scenario => {
      const monthlyCosts: number[] = []
      let totalYearlyCost = 0

      // Simulate 12 months
      for (let month = 1; month <= 12; month++) {
        const seasonalMultiplier = scenario.seasonal_factors?.find(f => f.month === month)?.multiplier || 1
        const growthMultiplier = Math.pow(1 + (scenario.growth_rate || 0) / 100, month - 1)
        const totalMultiplier = scenario.usage_multiplier * seasonalMultiplier * growthMultiplier

        // Calculate cost for this month (simplified)
        const monthlyCost = plan.base_price * totalMultiplier
        monthlyCosts.push(monthlyCost)
        totalYearlyCost += monthlyCost
      }

      return {
        scenario_name: scenario.name,
        monthly_costs: monthlyCosts,
        yearly_total: totalYearlyCost,
        peak_month_cost: Math.max(...monthlyCosts),
        average_monthly_cost: totalYearlyCost / 12,
        cost_vs_current_plan: 0, // Would compare to current plan
        limit_violations: [] // Would check against plan limits
      }
    })

    return {
      plan_id: planId,
      simulation_period: 'yearly',
      usage_scenarios: scenarios,
      results
    }
  }
}