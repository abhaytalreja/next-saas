'use client'

import { Button } from '@nextsaas/ui'
import { useState } from 'react'
import type { PricingPlan } from '../lib/pricing'

interface PricingSectionProps {
  plans?: PricingPlan[];
}

// Default plans for client-side fallback
const defaultPricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for small teams and side projects',
    price_monthly: 9,
    price_yearly: 90,
    currency: 'USD',
    features: [
      '3 team members',
      '5 projects',
      '10GB storage',
      '10,000 API calls/month',
      'Email support',
      'Basic analytics'
    ],
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
    features: [
      '10 team members',
      '50 projects',
      '100GB storage',
      '100,000 API calls/month',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'API access'
    ],
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
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited storage',
      'Unlimited API calls',
      'Dedicated support',
      'Custom domain',
      'SLA guarantee',
      'Advanced security',
      'Custom contracts'
    ],
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
]

export function PricingSection({ plans = defaultPricingPlans }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  
  // Transform plans to include necessary UI properties
  const pricingPlans = plans.map(plan => ({
    ...plan,
    cta: plan.price_monthly > 0 ? 'Start Free Trial' : 'Contact Sales',
    highlighted: plan.slug === 'pro',
    savings: plan.price_yearly > 0 
      ? `${Math.round((1 - (plan.price_yearly / 12) / plan.price_monthly) * 100)}% off` 
      : null
  }))

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Yearly
              <span className="ml-1 text-green-600 dark:text-green-400 text-xs">Save up to 25%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-2 border-blue-500 shadow-xl scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-8">
                {plan.price_monthly !== null ? (
                  <>
                    <div className="text-5xl font-bold text-gray-900 dark:text-white">
                      ${billingPeriod === 'monthly' ? plan.price_monthly : Math.floor(plan.price_yearly / 12)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      per month
                      {billingPeriod === 'yearly' && plan.savings && (
                        <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                          ({plan.savings})
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    Custom
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : plan.id === 'enterprise'
                    ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900'
                    : ''
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">SSL encryption</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">GDPR compliant</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">99.9% uptime SLA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}