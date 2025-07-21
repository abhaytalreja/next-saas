// Billing and subscription types

export interface BillingPlan {
  id: string
  name: string
  description: string
  pricing_type: 'fixed' | 'usage_based' | 'hybrid'
  base_price: number
  currency: string
  billing_interval: 'monthly' | 'yearly'
  usage_pricing: UsagePricing[]
  features: PlanFeature[]
  limits: PlanLimit[]
  is_active: boolean
  stripe_price_id?: string
  created_at: string
  updated_at: string
}

export interface UsagePricing {
  metric_id: string
  metric_name: string
  pricing_model: 'per_unit' | 'tiered' | 'volume' | 'graduated'
  unit_price?: number
  free_tier?: number
  tiers?: PricingTier[]
}

export interface PricingTier {
  from: number
  to?: number // null for infinite
  unit_price: number
  flat_fee?: number
}

export interface PlanFeature {
  name: string
  description: string
  included: boolean
  limit?: number
  unit?: string
}

export interface PlanLimit {
  metric_id: string
  metric_name: string
  limit_value: number
  unit: string
  limit_type: 'hard' | 'soft'
}

export interface Subscription {
  id: string
  organization_id: string
  plan_id: string
  stripe_subscription_id?: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
  plan?: BillingPlan
}

export type SubscriptionStatus = 
  | 'active'
  | 'past_due' 
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'

export interface Invoice {
  id: string
  organization_id: string
  subscription_id?: string
  stripe_invoice_id?: string
  invoice_number: string
  amount_due: number
  amount_paid: number
  currency: string
  status: InvoiceStatus
  period_start: string
  period_end: string
  due_date: string
  paid_at?: string
  line_items: InvoiceLineItem[]
  usage_details?: UsageInvoiceDetail[]
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  period_start?: string
  period_end?: string
  metadata?: Record<string, any>
}

export interface UsageInvoiceDetail {
  metric_id: string
  metric_name: string
  total_usage: number
  unit: string
  unit_price: number
  total_cost: number
  free_tier_used: number
  billable_usage: number
  tier_breakdown?: TierUsageBreakdown[]
}

export interface TierUsageBreakdown {
  tier_from: number
  tier_to?: number
  usage_in_tier: number
  unit_price: number
  tier_cost: number
}

// Billing calculation types
export interface BillingCalculator {
  calculateUsageCost(
    usage: UsageSummary[],
    plan: BillingPlan,
    period: DateRange
  ): Promise<UsageCostCalculation>
  
  generateInvoice(
    organizationId: string,
    subscriptionId: string,
    period: DateRange
  ): Promise<Invoice>
  
  previewUpgrade(
    organizationId: string,
    targetPlanId: string
  ): Promise<UpgradePreview>
}

export interface UsageCostCalculation {
  total_cost: number
  base_cost: number
  usage_cost: number
  currency: string
  usage_details: UsageInvoiceDetail[]
  period: DateRange
}

export interface UpgradePreview {
  current_plan: BillingPlan
  target_plan: BillingPlan
  prorated_amount: number
  next_invoice_amount: number
  effective_date: string
  billing_cycle_impact: string
}

// Payment and billing management
export interface PaymentMethod {
  id: string
  organization_id: string
  stripe_payment_method_id: string
  type: 'card' | 'bank_account'
  brand?: string
  last_four: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

// Billing context for React components
export interface BillingContextValue {
  subscription: Subscription | null
  currentInvoice: Invoice | null
  upcomingInvoice: Invoice | null
  paymentMethods: PaymentMethod[]
  isLoading: boolean
  error: string | null
  
  // Actions
  upgradeSubscription: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  addPaymentMethod: (paymentMethodId: string) => Promise<void>
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>
  retryPayment: (invoiceId: string) => Promise<void>
  downloadInvoice: (invoiceId: string) => Promise<void>
}