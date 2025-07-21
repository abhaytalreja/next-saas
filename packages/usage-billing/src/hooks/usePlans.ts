import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { PlanService } from '../services/plan-service'
import type { 
  BillingPlan,
  PlanConfiguration,
  PlanRecommendation,
  UsageSimulation,
  UpgradeOption
} from '../types'

export function usePlans() {
  const { organization } = useOrganization()
  const [planConfig, setPlanConfig] = useState<PlanConfiguration | null>(null)
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<BillingPlan | null>(null)
  const [recommendedPlan, setRecommendedPlan] = useState<BillingPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const planService = new PlanService()

  // Load plan configuration
  const loadPlanConfiguration = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const config = await planService.getPlanConfiguration(organization.id)
      
      setPlanConfig(config)
      setAvailablePlans(config.available_plans)
      setCurrentPlan(config.current_plan || null)
      setRecommendedPlan(config.recommended_plan || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan configuration')
      console.error('Plan configuration error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id])

  // Simulate usage costs for different scenarios
  const simulateUsage = useCallback(async (
    planId: string,
    scenarios: UsageSimulation['usage_scenarios']
  ): Promise<UsageSimulation> => {
    return planService.simulateUsageCosts(planId, scenarios)
  }, [])

  // Get upgrade options
  const getUpgradeOptions = useCallback((): UpgradeOption[] => {
    return planConfig?.upgrade_options || []
  }, [planConfig])

  // Check if plan is current
  const isCurrentPlan = useCallback((planId: string): boolean => {
    return currentPlan?.id === planId
  }, [currentPlan])

  // Check if plan is recommended
  const isRecommendedPlan = useCallback((planId: string): boolean => {
    return recommendedPlan?.id === planId
  }, [recommendedPlan])

  // Get plan by ID
  const getPlanById = useCallback((planId: string): BillingPlan | undefined => {
    return availablePlans.find(plan => plan.id === planId)
  }, [availablePlans])

  // Compare plans
  const comparePlans = useCallback((planIds: string[]) => {
    const plans = planIds.map(id => getPlanById(id)).filter(Boolean) as BillingPlan[]
    
    if (plans.length < 2) {
      return null
    }

    return planConfig?.plan_comparison || null
  }, [planConfig, getPlanById])

  // Get cost estimate for plan with current usage
  const getCostEstimate = useCallback((planId: string) => {
    if (!planConfig) return null

    const plan = getPlanById(planId)
    if (!plan) return null

    // Use cost examples from plan comparison
    const costExamples = planConfig.plan_comparison.pricing_comparison.total_cost_examples
    const currentUsageExample = costExamples.find(example => 
      example.scenario_name === 'Current Usage'
    )

    return {
      monthly: currentUsageExample?.monthly_costs[planId] || plan.base_price,
      yearly: currentUsageExample?.yearly_costs[planId] || plan.base_price * 12
    }
  }, [planConfig, getPlanById])

  // Load initial data
  useEffect(() => {
    loadPlanConfiguration()
  }, [loadPlanConfiguration])

  // Plan statistics
  const planStats = {
    totalPlans: availablePlans.length,
    hasCurrentPlan: !!currentPlan,
    hasRecommendation: !!recommendedPlan,
    upgradeOptionsCount: planConfig?.upgrade_options.length || 0,
    lowestPrice: Math.min(...availablePlans.map(p => p.base_price)),
    highestPrice: Math.max(...availablePlans.map(p => p.base_price))
  }

  return {
    // Data
    planConfig,
    availablePlans,
    currentPlan,
    recommendedPlan,
    planStats,
    
    // State
    isLoading,
    error,
    
    // Actions
    simulateUsage,
    getUpgradeOptions,
    comparePlans,
    getCostEstimate,
    
    // Utilities
    isCurrentPlan,
    isRecommendedPlan,
    getPlanById,
    refreshPlans: loadPlanConfiguration
  }
}

// Hook for plan comparison
export function usePlanComparison(planIds: string[]) {
  const { planConfig, getPlanById } = usePlans()
  
  const plans = planIds.map(id => getPlanById(id)).filter(Boolean) as BillingPlan[]
  const comparison = planConfig?.plan_comparison

  // Feature comparison
  const featureComparison = comparison?.features.map(feature => ({
    ...feature,
    planValues: planIds.map(planId => ({
      planId,
      ...feature.plan_availability[planId]
    }))
  })) || []

  // Pricing comparison
  const pricingComparison = planIds.map(planId => {
    const plan = getPlanById(planId)
    return {
      planId,
      plan,
      monthlyPrice: comparison?.pricing_comparison.monthly_pricing[planId] || plan?.base_price || 0,
      yearlyPrice: comparison?.pricing_comparison.yearly_pricing[planId] || (plan?.base_price || 0) * 12
    }
  })

  // Usage limits comparison
  const limitsComparison = comparison?.usage_limits_comparison.map(limit => ({
    ...limit,
    planLimits: planIds.map(planId => ({
      planId,
      ...limit.plan_limits[planId]
    }))
  })) || []

  return {
    plans,
    featureComparison,
    pricingComparison,
    limitsComparison,
    isReady: !!comparison
  }
}

// Hook for usage simulation
export function useUsageSimulation() {
  const [simulations, setSimulations] = useState<Record<string, UsageSimulation>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planService = new PlanService()

  const runSimulation = useCallback(async (
    planId: string,
    scenarios: UsageSimulation['usage_scenarios']
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const simulation = await planService.simulateUsageCosts(planId, scenarios)
      
      setSimulations(prev => ({
        ...prev,
        [planId]: simulation
      }))

      return simulation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSimulation = useCallback((planId: string) => {
    return simulations[planId] || null
  }, [simulations])

  const clearSimulations = useCallback(() => {
    setSimulations({})
  }, [])

  return {
    simulations,
    isLoading,
    error,
    runSimulation,
    getSimulation,
    clearSimulations
  }
}

// Hook for plan recommendations
export function usePlanRecommendations() {
  const { organization } = useOrganization()
  const [recommendations, setRecommendations] = useState<PlanRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // In a full implementation, this would call a recommendation service
  // For now, we'll use the recommended plan from the plan configuration
  const { recommendedPlan, currentPlan } = usePlans()

  useEffect(() => {
    if (recommendedPlan && currentPlan && recommendedPlan.id !== currentPlan.id) {
      setRecommendations([
        {
          recommended_plan_id: recommendedPlan.id,
          confidence_score: 85,
          reasoning: [
            {
              factor: 'cost_optimization',
              description: 'This plan offers better value for your usage patterns',
              impact_score: 80
            },
            {
              factor: 'feature_requirements',
              description: 'Includes features that match your organization\'s needs',
              impact_score: 75
            }
          ],
          cost_savings: 0, // Would calculate actual savings
          feature_improvements: ['Better usage limits', 'Additional features'],
          usage_fit_score: 85,
          alternative_options: []
        }
      ])
    } else {
      setRecommendations([])
    }
  }, [recommendedPlan, currentPlan])

  const acceptRecommendation = useCallback(async (recommendationId: string) => {
    // This would trigger a plan upgrade
    const recommendation = recommendations.find(r => r.recommended_plan_id === recommendationId)
    if (recommendation) {
      // Would call upgrade subscription here
      console.log('Accepting recommendation:', recommendation)
    }
  }, [recommendations])

  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => 
      prev.filter(r => r.recommended_plan_id !== recommendationId)
    )
  }, [])

  return {
    recommendations,
    isLoading,
    error,
    acceptRecommendation,
    dismissRecommendation
  }
}