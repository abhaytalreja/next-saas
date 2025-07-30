'use client'

import React from 'react'
import { useBillingSubscription } from '../hooks/use-billing-subscription'
import { useUsageTracking } from '../hooks/use-usage-tracking'
import { SubscriptionStatusCard } from './subscription-status'
import { UsageDashboard } from './usage-dashboard'
import { CheckoutButton } from './checkout-button'

interface BillingDashboardProps {
  organizationId: string
  showUsage?: boolean
  showUpgradePrompts?: boolean
  className?: string
}

export function BillingDashboard({
  organizationId,
  showUsage = true,
  showUpgradePrompts = true,
  className = ''
}: BillingDashboardProps) {
  const { 
    subscription, 
    isLoading: subLoading, 
    isActive, 
    isTrialing,
    daysUntilExpiry 
  } = useBillingSubscription(organizationId)

  const {
    metrics,
    isLoading: usageLoading
  } = useUsageTracking(organizationId)

  if (subLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Usage</h2>
        
        {subscription?.stripe_customer_id && (
          <CustomerPortalButton 
            customerId={subscription.stripe_customer_id}
            returnUrl={window.location.href}
          />
        )}
      </div>

      {/* Subscription Status */}
      <SubscriptionStatusCard 
        subscription={subscription}
        showUpgradePrompts={showUpgradePrompts}
      />

      {/* Trial Warning */}
      {isTrialing && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Your trial ends in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Choose a plan to continue using all features after your trial expires.
              </p>
              <div className="mt-3">
                <CheckoutButton
                  priceId="price_pro_monthly" // Default to professional plan
                  organizationId={organizationId}
                  size="sm"
                  variant="warning"
                >
                  Upgrade Now
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Subscription State */}
      {!subscription && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Ready to get started?
          </h3>
          <p className="text-blue-700 mb-4">
            Choose a plan that fits your needs and start building amazing things.
          </p>
          <CheckoutButton
            priceId="price_starter_monthly"
            organizationId={organizationId}
            variant="primary"
          >
            Start Free Trial
          </CheckoutButton>
        </div>
      )}

      {/* Usage Dashboard */}
      {showUsage && (isActive || isTrialing) && (
        <UsageDashboard 
          organizationId={organizationId}
          metrics={metrics}
          isLoading={usageLoading}
        />
      )}

      {/* Billing History Preview */}
      {subscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {subscription.plan?.name} Plan
                </p>
                <p className="text-sm text-gray-500">
                  {subscription.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'} billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ${subscription.billing_cycle === 'yearly' 
                    ? subscription.plan?.price_yearly 
                    : subscription.plan?.price_monthly
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Next billing: {subscription.current_period_end 
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {subscription?.stripe_customer_id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <CustomerPortalButton 
                customerId={subscription.stripe_customer_id}
                returnUrl={window.location.href}
                variant="secondary"
                size="sm"
              >
                View Full Billing History
              </CustomerPortalButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Customer Portal Button Component
interface CustomerPortalButtonProps {
  customerId: string
  returnUrl: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function CustomerPortalButton({
  customerId,
  returnUrl,
  children = 'Manage Billing',
  variant = 'primary',
  size = 'md',
  className = ''
}: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: returnUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error opening customer portal:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}