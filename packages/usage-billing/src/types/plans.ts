// Plan management and configuration types

export interface PlanConfiguration {
  organization_id: string
  available_plans: BillingPlan[]
  current_plan?: BillingPlan
  recommended_plan?: BillingPlan
  usage_based_pricing: UsagePricing[]
  plan_comparison: PlanComparison
  upgrade_options: UpgradeOption[]
}

export interface PlanComparison {
  plans: BillingPlan[]
  features: FeatureComparison[]
  pricing_comparison: PricingComparison
  usage_limits_comparison: LimitsComparison[]
}

export interface FeatureComparison {
  feature_name: string
  feature_description: string
  feature_category: string
  plan_availability: Record<string, PlanFeatureAvailability>
}

export interface PlanFeatureAvailability {
  included: boolean
  limit?: number
  unit?: string
  description?: string
}

export interface PricingComparison {
  monthly_pricing: Record<string, number>
  yearly_pricing: Record<string, number>
  usage_pricing: Record<string, UsagePricing[]>
  total_cost_examples: CostExample[]
}

export interface CostExample {
  scenario_name: string
  usage_profile: UsageProfile
  monthly_costs: Record<string, number> // plan_id -> cost
  yearly_costs: Record<string, number>
  recommended_plan: string
}

export interface UsageProfile {
  description: string
  usage_amounts: Record<string, number> // metric_id -> amount
}

export interface LimitsComparison {
  metric_name: string
  unit: string
  plan_limits: Record<string, PlanLimitInfo>
}

export interface PlanLimitInfo {
  limit?: number
  unlimited: boolean
  overage_allowed: boolean
  overage_rate?: number
}

export interface UpgradeOption {
  from_plan_id: string
  to_plan_id: string
  upgrade_type: 'immediate' | 'next_cycle' | 'trial'
  cost_impact: CostImpact
  benefits: string[]
  recommended: boolean
  available: boolean
  restrictions?: string[]
}

export interface CostImpact {
  immediate_charge?: number
  proration_credit?: number
  next_cycle_change: number
  annual_savings?: number
  payback_period_months?: number
}

// Plan builder types for custom plans
export interface PlanBuilder {
  base_plan: BillingPlan
  customizations: PlanCustomization[]
  total_monthly_cost: number
  total_yearly_cost: number
  estimated_usage_cost: number
  is_valid: boolean
  validation_errors: string[]
}

export interface PlanCustomization {
  type: 'feature_addition' | 'limit_increase' | 'usage_pricing_change'
  feature_id?: string
  metric_id?: string
  new_limit?: number
  new_pricing?: UsagePricing
  additional_cost: number
  description: string
}

// Plan recommendation engine types
export interface PlanRecommendation {
  recommended_plan_id: string
  confidence_score: number // 0-100
  reasoning: RecommendationReason[]
  cost_savings: number
  feature_improvements: string[]
  usage_fit_score: number // 0-100
  alternative_options: AlternativeOption[]
}

export interface RecommendationReason {
  factor: 'cost_optimization' | 'usage_pattern' | 'feature_requirements' | 'growth_projection'
  description: string
  impact_score: number // 0-100
  supporting_data?: any
}

export interface AlternativeOption {
  plan_id: string
  reason: string
  trade_offs: string[]
  cost_difference: number
}

// Plan usage simulation types
export interface UsageSimulation {
  plan_id: string
  simulation_period: 'monthly' | 'yearly'
  usage_scenarios: SimulationScenario[]
  results: SimulationResult[]
}

export interface SimulationScenario {
  name: string
  description: string
  usage_multiplier: number // 1.0 = current usage, 1.5 = 50% increase
  growth_rate?: number // monthly growth percentage
  seasonal_factors?: SeasonalFactor[]
}

export interface SeasonalFactor {
  month: number // 1-12
  multiplier: number
}

export interface SimulationResult {
  scenario_name: string
  monthly_costs: number[]
  yearly_total: number
  peak_month_cost: number
  average_monthly_cost: number
  cost_vs_current_plan: number
  limit_violations: LimitViolation[]
}

export interface LimitViolation {
  metric_name: string
  month: number
  usage_amount: number
  limit_amount: number
  overage_cost: number
}

// Enterprise plan types
export interface EnterprisePlan extends BillingPlan {
  is_enterprise: true
  custom_pricing: boolean
  dedicated_support: boolean
  sla_guarantees: SLAGuarantee[]
  custom_features: CustomFeature[]
  volume_discounts: VolumeDiscount[]
  contract_terms: ContractTerms
}

export interface SLAGuarantee {
  metric: 'uptime' | 'response_time' | 'resolution_time'
  guarantee_level: string
  penalty_terms?: string
}

export interface CustomFeature {
  name: string
  description: string
  implementation_timeline: string
  additional_cost?: number
}

export interface VolumeDiscount {
  metric_id: string
  threshold: number
  discount_percentage: number
  applies_to: 'overage_only' | 'all_usage' | 'base_tier'
}

export interface ContractTerms {
  minimum_term_months: number
  payment_terms: string
  renewal_terms: string
  cancellation_policy: string
  data_retention_policy: string
}