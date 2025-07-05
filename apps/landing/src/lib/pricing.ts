import { createSupabaseServerClient } from '@nextsaas/supabase/server';

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    projects: number;
    storage_gb: number;
    api_calls: number;
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

/**
 * Fetch active pricing plans from the database
 * This is a server-side function that respects RLS policies
 */
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching pricing plans:', error);
    // Return default plans as fallback
    return getDefaultPlans();
  }

  // Transform database plans to match our interface
  return (data || []).map(plan => ({
    ...plan,
    description: getDescriptionForPlan(plan.slug),
    features: getFeaturesForPlan(plan.slug),
  }));
}

/**
 * Get description based on plan slug
 */
function getDescriptionForPlan(slug: string): string {
  const descriptions: Record<string, string> = {
    starter: 'Perfect for small teams and side projects',
    pro: 'For growing businesses and teams',
    enterprise: 'For large organizations with custom needs',
  };
  return descriptions[slug] || 'Choose the plan that fits your needs';
}

/**
 * Get features list based on plan slug
 */
function getFeaturesForPlan(slug: string): string[] {
  const features: Record<string, string[]> = {
    starter: [
      '3 team members',
      '5 projects',
      '10GB storage',
      '10,000 API calls/month',
      'Email support',
      'Basic analytics'
    ],
    pro: [
      '10 team members',
      '50 projects',
      '100GB storage',
      '100,000 API calls/month',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access'
    ],
    enterprise: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited storage',
      'Unlimited API calls',
      'Dedicated support',
      'Custom domain',
      'SLA guarantee',
      'Advanced security',
      'Custom contracts'
    ]
  };
  return features[slug] || [];
}

/**
 * Default plans as fallback when database is unavailable
 */
function getDefaultPlans(): PricingPlan[] {
  return [
    {
      id: 'starter',
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small teams and side projects',
      price_monthly: 9,
      price_yearly: 90,
      currency: 'USD',
      features: getFeaturesForPlan('starter'),
      limits: {
        users: 3,
        projects: 5,
        storage_gb: 10,
        api_calls: 10000
      },
      is_active: true,
      is_default: true,
      sort_order: 1
    },
    {
      id: 'pro',
      name: 'Pro',
      slug: 'pro',
      description: 'For growing businesses and teams',
      price_monthly: 29,
      price_yearly: 290,
      currency: 'USD',
      features: getFeaturesForPlan('pro'),
      limits: {
        users: 10,
        projects: 50,
        storage_gb: 100,
        api_calls: 100000
      },
      is_active: true,
      is_default: false,
      sort_order: 2
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations with custom needs',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'USD',
      features: getFeaturesForPlan('enterprise'),
      limits: {
        users: -1,
        projects: -1,
        storage_gb: -1,
        api_calls: -1
      },
      is_active: true,
      is_default: false,
      sort_order: 3
    }
  ];
}