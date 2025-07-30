import type { IndustryPricing, PricingTier, FeatureComparison } from '../types'

/**
 * Industry-specific pricing configurations
 */
export class IndustryPricingManager {
  private industryConfigs: Map<string, IndustryPricing> = new Map()

  constructor() {
    this.initializeIndustryConfigs()
  }

  /**
   * Get pricing configuration for specific industry
   */
  getIndustryPricing(industry: string): IndustryPricing | null {
    return this.industryConfigs.get(industry) || null
  }

  /**
   * Get all available industries
   */
  getAvailableIndustries(): string[] {
    return Array.from(this.industryConfigs.keys())
  }

  /**
   * Add or update industry pricing configuration
   */
  setIndustryPricing(industry: string, config: IndustryPricing): void {
    this.industryConfigs.set(industry, config)
  }

  /**
   * Get pricing tiers for industry with custom modifications
   */
  getCustomizedPricing(
    industry: string,
    modifications?: {
      currency?: string
      discounts?: Record<string, number>
      additionalFeatures?: Array<{
        tier: string
        features: string[]
      }>
    }
  ): IndustryPricing | null {
    const basePricing = this.getIndustryPricing(industry)
    if (!basePricing) return null

    let customPricing = { ...basePricing }

    if (modifications?.currency) {
      customPricing.currency = modifications.currency
    }

    if (modifications?.discounts) {
      customPricing.tiers = customPricing.tiers.map(tier => {
        const discount = modifications.discounts![tier.id] || 0
        return {
          ...tier,
          price_monthly: Math.round(tier.price_monthly * (1 - discount)),
          price_yearly: Math.round(tier.price_yearly * (1 - discount))
        }
      })
    }

    if (modifications?.additionalFeatures) {
      customPricing.tiers = customPricing.tiers.map(tier => {
        const additionalFeatures = modifications.additionalFeatures!
          .find(af => af.tier === tier.id)?.features || []
        
        return {
          ...tier,
          features: [
            ...tier.features,
            ...additionalFeatures.map(feature => ({
              name: feature,
              included: true,
              description: `Additional feature: ${feature}`
            }))
          ]
        }
      })
    }

    return customPricing
  }

  private initializeIndustryConfigs(): void {
    // SaaS Industry Pricing
    this.industryConfigs.set('saas', {
      industry: 'saas',
      currency: 'USD',
      billing_cycles: [
        { interval: 'monthly', label: 'Monthly', discount: 0 },
        { interval: 'yearly', label: 'Annual', discount: 0.2, savings_text: 'Save 20%' }
      ],
      tiers: [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Perfect for small teams getting started',
          price_monthly: 29,
          price_yearly: 290,
          features: [
            { name: 'Up to 5 team members', included: true },
            { name: '10GB storage', included: true },
            { name: 'Basic analytics', included: true },
            { name: 'Email support', included: true },
            { name: 'API access', included: false },
            { name: 'Custom integrations', included: false },
            { name: 'Advanced analytics', included: false },
            { name: 'Priority support', included: false }
          ],
          limits: { users: 5, storage_gb: 10, api_calls: 1000 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_starter_monthly',
          stripe_price_id_yearly: 'price_starter_yearly'
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'For growing teams that need more power',
          price_monthly: 99,
          price_yearly: 990,
          popular: true,
          features: [
            { name: 'Up to 25 team members', included: true },
            { name: '100GB storage', included: true },
            { name: 'Advanced analytics', included: true },
            { name: 'Priority email support', included: true },
            { name: 'API access', included: true },
            { name: 'Custom integrations', included: true },
            { name: 'SSO integration', included: false },
            { name: '24/7 phone support', included: false }
          ],
          limits: { users: 25, storage_gb: 100, api_calls: 10000 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_pro_monthly',
          stripe_price_id_yearly: 'price_pro_yearly'
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For large organizations with custom needs',
          price_monthly: 299,
          price_yearly: 2990,
          features: [
            { name: 'Unlimited team members', included: true },
            { name: 'Unlimited storage', included: true },
            { name: 'Advanced analytics & reporting', included: true },
            { name: '24/7 phone & chat support', included: true },
            { name: 'Full API access', included: true },
            { name: 'Custom integrations', included: true },
            { name: 'SSO & SAML integration', included: true },
            { name: 'Dedicated account manager', included: true }
          ],
          limits: { users: -1, storage_gb: -1, api_calls: -1 }, // -1 means unlimited
          cta_text: 'Contact Sales',
          stripe_price_id_monthly: 'price_enterprise_monthly',
          stripe_price_id_yearly: 'price_enterprise_yearly'
        }
      ],
      features_comparison: [
        {
          category: 'Team Management',
          features: [
            {
              name: 'Team Members',
              description: 'Number of users who can access your account',
              tiers: { starter: '5', professional: '25', enterprise: 'Unlimited' }
            },
            {
              name: 'Role-based Permissions',
              description: 'Control what team members can see and do',
              tiers: { starter: false, professional: true, enterprise: true }
            }
          ]
        },
        {
          category: 'Storage & Data',
          features: [
            {
              name: 'Storage Space',
              description: 'Total storage available for your data',
              tiers: { starter: '10GB', professional: '100GB', enterprise: 'Unlimited' }
            },
            {
              name: 'Data Export',
              description: 'Export your data in various formats',
              tiers: { starter: true, professional: true, enterprise: true }
            }
          ]
        },
        {
          category: 'Analytics & Reporting',
          features: [
            {
              name: 'Basic Analytics',
              description: 'Essential metrics and insights',
              tiers: { starter: true, professional: true, enterprise: true }
            },
            {
              name: 'Advanced Analytics',
              description: 'Detailed reports and custom dashboards',
              tiers: { starter: false, professional: true, enterprise: true }
            }
          ]
        }
      ],
      testimonials: [
        {
          name: 'Sarah Johnson',
          company: 'TechStart Inc.',
          role: 'CEO',
          content: 'This platform has transformed how we manage our team. The analytics are incredibly insightful.',
          avatar: '/testimonials/sarah.jpg'
        }
      ]
    })

    // E-commerce Industry Pricing
    this.industryConfigs.set('ecommerce', {
      industry: 'ecommerce',
      currency: 'USD',
      billing_cycles: [
        { interval: 'monthly', label: 'Monthly', discount: 0 },
        { interval: 'yearly', label: 'Annual', discount: 0.15, savings_text: 'Save 15%' }
      ],
      tiers: [
        {
          id: 'basic',
          name: 'Basic Store',
          description: 'Everything you need to start selling online',
          price_monthly: 19,
          price_yearly: 190,
          features: [
            { name: 'Up to 100 products', included: true },
            { name: 'Unlimited orders', included: true },
            { name: 'Basic store customization', included: true },
            { name: 'SSL certificate', included: true },
            { name: 'Payment processing', included: true },
            { name: 'Advanced SEO tools', included: false },
            { name: 'Abandoned cart recovery', included: false },
            { name: 'Multi-channel selling', included: false }
          ],
          limits: { products: 100, orders: -1, storage_gb: 5 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_ecom_basic_monthly',
          stripe_price_id_yearly: 'price_ecom_basic_yearly'
        },
        {
          id: 'growth',
          name: 'Growth',
          description: 'Scale your business with advanced features',
          price_monthly: 49,
          price_yearly: 490,
          popular: true,
          features: [
            { name: 'Up to 1,000 products', included: true },
            { name: 'Unlimited orders', included: true },
            { name: 'Advanced store customization', included: true },
            { name: 'SSL certificate', included: true },
            { name: 'Payment processing', included: true },
            { name: 'Advanced SEO tools', included: true },
            { name: 'Abandoned cart recovery', included: true },
            { name: 'Multi-channel selling', included: true }
          ],
          limits: { products: 1000, orders: -1, storage_gb: 50 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_ecom_growth_monthly',
          stripe_price_id_yearly: 'price_ecom_growth_yearly'
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For high-volume businesses with custom needs',
          price_monthly: 199,
          price_yearly: 1990,
          features: [
            { name: 'Unlimited products', included: true },
            { name: 'Unlimited orders', included: true },
            { name: 'Custom store development', included: true },
            { name: 'Priority SSL & security', included: true },
            { name: 'Advanced payment options', included: true },
            { name: 'Enterprise SEO suite', included: true },
            { name: 'Advanced automation', included: true },
            { name: 'Omnichannel integration', included: true }
          ],
          limits: { products: -1, orders: -1, storage_gb: -1 },
          cta_text: 'Contact Sales',
          stripe_price_id_monthly: 'price_ecom_enterprise_monthly',
          stripe_price_id_yearly: 'price_ecom_enterprise_yearly'
        }
      ],
      features_comparison: [
        {
          category: 'Products & Inventory',
          features: [
            {
              name: 'Product Listings',
              description: 'Number of products you can list in your store',
              tiers: { basic: '100', growth: '1,000', enterprise: 'Unlimited' }
            },
            {
              name: 'Inventory Management',
              description: 'Track stock levels and get low stock alerts',
              tiers: { basic: true, growth: true, enterprise: true }
            }
          ]
        }
      ],
      testimonials: []
    })

    // Real Estate Industry Pricing
    this.industryConfigs.set('realestate', {
      industry: 'realestate',
      currency: 'USD',
      billing_cycles: [
        { interval: 'monthly', label: 'Monthly', discount: 0 }
      ],
      tiers: [
        {
          id: 'agent',
          name: 'Individual Agent',
          description: 'Perfect for individual real estate agents',
          price_monthly: 39,
          price_yearly: 390,
          features: [
            { name: 'Up to 50 active listings', included: true },
            { name: 'Lead management', included: true },
            { name: 'Basic CRM', included: true },
            { name: 'Mobile app access', included: true },
            { name: 'Team collaboration', included: false },
            { name: 'Advanced analytics', included: false },
            { name: 'MLS integration', included: false }
          ],
          limits: { listings: 50, leads: 500, storage_gb: 10 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_re_agent_monthly',
          stripe_price_id_yearly: 'price_re_agent_yearly'
        },
        {
          id: 'team',
          name: 'Team/Brokerage',
          description: 'For real estate teams and small brokerages',
          price_monthly: 99,
          price_yearly: 990,
          popular: true,
          features: [
            { name: 'Up to 500 active listings', included: true },
            { name: 'Advanced lead management', included: true },
            { name: 'Full CRM suite', included: true },
            { name: 'Mobile app access', included: true },
            { name: 'Team collaboration', included: true },
            { name: 'Advanced analytics', included: true },
            { name: 'MLS integration', included: true }
          ],
          limits: { listings: 500, leads: 5000, storage_gb: 100 },
          cta_text: 'Start Free Trial',
          stripe_price_id_monthly: 'price_re_team_monthly',
          stripe_price_id_yearly: 'price_re_team_yearly'
        }
      ],
      features_comparison: [],
      testimonials: []
    })
  }
}