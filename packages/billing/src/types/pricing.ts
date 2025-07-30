export interface PricingTier {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  popular?: boolean
  features: PricingFeature[]
  limits: Record<string, number>
  cta_text?: string
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
}

export interface PricingFeature {
  name: string
  included: boolean
  limit?: number
  description?: string
}

export interface IndustryPricing {
  industry: string
  tiers: PricingTier[]
  currency: string
  billing_cycles: BillingCycle[]
  features_comparison: FeatureComparison[]
  testimonials?: Testimonial[]
}

export interface BillingCycle {
  interval: 'monthly' | 'yearly'
  label: string
  discount?: number
  savings_text?: string
}

export interface FeatureComparison {
  category: string
  features: {
    name: string
    description?: string
    tiers: Record<string, boolean | number | string>
  }[]
}

export interface Testimonial {
  name: string
  company: string
  role: string
  content: string
  avatar?: string
}

export interface PricingPageConfig {
  industry: string
  highlight_tier?: string
  show_annual_toggle: boolean
  show_testimonials: boolean
  show_faq: boolean
  custom_features?: PricingFeature[]
  custom_cta?: string
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

export interface PricingCalculator {
  base_price: number
  usage_tiers: Array<{
    up_to: number
    rate: number
  }>
  overage_rate: number
}