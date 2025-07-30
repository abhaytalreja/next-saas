export interface BillingCustomer {
  id: string
  organization_id: string
  stripe_customer_id: string
  email: string
  name?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  organization_id: string
  plan_id?: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  billing_cycle: 'monthly' | 'yearly'
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  trial_start?: string
  trial_end?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export interface Plan {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly?: number
  price_yearly?: number
  currency: string
  features: string[]
  limits: Record<string, number>
  metadata?: Record<string, any>
  is_active: boolean
  is_default: boolean
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  stripe_product_id?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FeatureQuota {
  id: string
  organization_id: string
  feature: string
  limit: number
  used: number
  period_start: string
  period_end: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface BillingPortalConfig {
  return_url?: string
  configuration?: {
    business_profile?: {
      privacy_policy_url?: string
      terms_of_service_url?: string
    }
    features?: {
      customer_update?: {
        enabled?: boolean
        allowed_updates?: string[]
      }
      invoice_history?: {
        enabled?: boolean
      }
      payment_method_update?: {
        enabled?: boolean
      }
      subscription_cancel?: {
        enabled?: boolean
        mode?: 'at_period_end' | 'immediately'
      }
      subscription_pause?: {
        enabled?: boolean
      }
      subscription_update?: {
        enabled?: boolean
        default_allowed_updates?: string[]
        proration_behavior?: 'none' | 'create_prorations' | 'always_invoice'
      }
    }
  }
}