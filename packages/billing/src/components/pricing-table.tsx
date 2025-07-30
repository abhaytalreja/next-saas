'use client'

import React, { useState } from 'react'
import { IndustryPricingManager } from '../pricing/industry-pricing'
import { CheckoutButton } from './checkout-button'
import type { PricingTier, BillingCycle } from '../types'

interface PricingTableProps {
  industry: string
  billingCycle?: 'monthly' | 'yearly'
  highlightTier?: string
  showAnnualToggle?: boolean
  organizationId?: string
  className?: string
  customizations?: {
    currency?: string
    discounts?: Record<string, number>
    additionalFeatures?: Array<{
      tier: string
      features: string[]
    }>
  }
}

export function PricingTable({
  industry,
  billingCycle = 'monthly',
  highlightTier,
  showAnnualToggle = true,
  organizationId,
  className = '',
  customizations
}: PricingTableProps) {
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>(billingCycle)
  const pricingManager = new IndustryPricingManager()

  const industryPricing = customizations 
    ? pricingManager.getCustomizedPricing(industry, customizations)
    : pricingManager.getIndustryPricing(industry)

  if (!industryPricing) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Industry not found</h3>
        <p className="text-gray-600">The pricing configuration for "{industry}" could not be loaded.</p>
      </div>
    )
  }

  const currentCycles = industryPricing.billing_cycles
  const annualCycle = currentCycles.find(c => c.interval === 'yearly')
  const monthlyCycle = currentCycles.find(c => c.interval === 'monthly')

  return (
    <div className={`py-12 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your {industry} business needs.
          All plans include our core features with room to grow.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      {showAnnualToggle && annualCycle && monthlyCycle && (
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              {annualCycle.savings_text && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {annualCycle.savings_text}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {industryPricing.tiers.map((tier) => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            billingCycle={selectedCycle}
            isHighlighted={tier.id === highlightTier || Boolean(tier.popular)}
            isPopular={tier.popular}
            organizationId={organizationId}
            currency={industryPricing.currency}
          />
        ))}
      </div>

      {/* Features Comparison */}
      {industryPricing.features_comparison.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Features
          </h3>
          <FeaturesComparison
            featuresComparison={industryPricing.features_comparison}
            tiers={industryPricing.tiers}
          />
        </div>
      )}

      {/* Testimonials */}
      {industryPricing.testimonials && industryPricing.testimonials.length > 0 && (
        <div className="mt-16">
          <TestimonialsSection testimonials={industryPricing.testimonials} />
        </div>
      )}
    </div>
  )
}

interface PricingTierCardProps {
  tier: PricingTier
  billingCycle: 'monthly' | 'yearly'
  isHighlighted: boolean
  isPopular?: boolean
  organizationId?: string
  currency: string
}

function PricingTierCard({
  tier,
  billingCycle,
  isHighlighted,
  isPopular,
  organizationId,
  currency
}: PricingTierCardProps) {
  const price = billingCycle === 'yearly' ? tier.price_yearly : tier.price_monthly
  const priceId = billingCycle === 'yearly' ? tier.stripe_price_id_yearly : tier.stripe_price_id_monthly

  return (
    <div className={`relative rounded-2xl p-8 ${
      isHighlighted
        ? 'bg-blue-50 border-2 border-blue-200 shadow-lg'
        : 'bg-white border border-gray-200'
    }`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
        <p className="mt-2 text-gray-600">{tier.description}</p>
        
        <div className="mt-6">
          <span className="text-4xl font-bold text-gray-900">
            ${price}
          </span>
          <span className="text-gray-600">
            /{billingCycle === 'yearly' ? 'year' : 'month'}
          </span>
        </div>

        {billingCycle === 'yearly' && tier.price_monthly && (
          <p className="mt-2 text-sm text-gray-500">
            ${Math.round(tier.price_yearly / 12)} per month, billed annually
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mt-8 space-y-4">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className={`flex-shrink-0 h-5 w-5 ${
                feature.included ? 'text-green-500' : 'text-gray-300'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={feature.included ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
              />
            </svg>
            <span className={`ml-3 text-sm ${
              feature.included ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {feature.name}
              {feature.limit && ` (${feature.limit})`}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-8">
        {organizationId && priceId ? (
          <CheckoutButton
            priceId={priceId}
            organizationId={organizationId}
            variant={isHighlighted ? 'primary' : 'secondary'}
            size="lg"
            className="w-full"
            trialPeriodDays={tier.id === 'starter' ? 14 : undefined}
          >
            {tier.cta_text || 'Get Started'}
          </CheckoutButton>
        ) : (
          <button
            className={`w-full py-3 px-6 text-center text-sm font-medium rounded-md transition-colors ${
              isHighlighted
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {tier.cta_text || 'Get Started'}
          </button>
        )}
      </div>
    </div>
  )
}

interface FeaturesComparisonProps {
  featuresComparison: any[]
  tiers: PricingTier[]
}

function FeaturesComparison({ featuresComparison, tiers }: FeaturesComparisonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                Features
              </th>
              {tiers.map(tier => (
                <th key={tier.id} className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {featuresComparison.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                <tr className="bg-gray-50">
                  <td colSpan={tiers.length + 1} className="px-6 py-3 text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                </tr>
                {category.features.map((feature: any, featureIndex: number) => (
                  <tr key={featureIndex}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {feature.name}
                        </div>
                        {feature.description && (
                          <div className="text-sm text-gray-500">
                            {feature.description}
                          </div>
                        )}
                      </div>
                    </td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        <FeatureValue value={feature.tiers[tier.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FeatureValue({ value }: { value: any }) {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className="mx-auto h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="mx-auto h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  return (
    <span className="text-sm text-gray-900">
      {value}
    </span>
  )
}

function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">
        What Our Customers Say
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
            <div className="flex items-center">
              {testimonial.avatar && (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              )}
              <div className="text-left">
                <div className="font-medium text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}