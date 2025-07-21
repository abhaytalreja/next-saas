'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import type { Subscription, Plan, BillingInterval } from '../../types/billing'

interface SubscriptionManagerProps {
  onSubscriptionChanged?: (subscription: Subscription) => void
  onCancel?: () => void
  className?: string
}

// Available plans
const AVAILABLE_PLANS: Plan[] = [
  {
    id: 'price_free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'monthly',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 projects',
      '1GB storage',
      'Basic support',
      'Community access'
    ],
    limits: {
      projects: 3,
      storage: 1, // GB
      api_calls: 1000,
      team_members: 3
    }
  },
  {
    id: 'price_starter',
    name: 'Starter',
    price: 9.99,
    currency: 'usd',
    interval: 'monthly',
    description: 'Great for small teams',
    features: [
      'Up to 10 projects',
      '5GB storage',
      'Email support',
      'Basic analytics',
      'API access'
    ],
    limits: {
      projects: 10,
      storage: 5,
      api_calls: 10000,
      team_members: 5
    },
    popular: false
  },
  {
    id: 'price_pro',
    name: 'Pro',
    price: 29.99,
    currency: 'usd',
    interval: 'monthly',
    description: 'Best for growing businesses',
    features: [
      'Up to 50 projects',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
      'Full API access',
      'Custom integrations'
    ],
    limits: {
      projects: 50,
      storage: 10,
      api_calls: 100000,
      team_members: 25
    },
    popular: true
  },
  {
    id: 'price_enterprise',
    name: 'Enterprise',
    price: 99.99,
    currency: 'usd',
    interval: 'monthly',
    description: 'For large organizations',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Dedicated support',
      'Advanced security',
      'SSO integration',
      'Custom contracts',
      'SLA guarantees'
    ],
    limits: {
      projects: -1, // Unlimited
      storage: 100,
      api_calls: -1,
      team_members: -1
    }
  }
]

export function SubscriptionManager({
  onSubscriptionChanged,
  onCancel,
  className = ''
}: SubscriptionManagerProps) {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
  const [isLoading, setIsLoading] = useState(true)
  const [isChanging, setIsChanging] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  const { currentOrganization, canManageBilling } = useOrganization()

  useEffect(() => {
    if (currentOrganization?.id) {
      loadCurrentSubscription()
    }
  }, [currentOrganization?.id])

  const loadCurrentSubscription = async () => {
    setIsLoading(true)
    
    try {
      // Mock current subscription
      const mockSubscription: Subscription = {
        id: 'sub_current',
        status: 'active',
        plan: AVAILABLE_PLANS.find(p => p.id === 'price_pro')!,
        current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: null,
        cancel_at_period_end: false
      }

      setCurrentSubscription(mockSubscription)
      setBillingInterval(mockSubscription.plan.interval)
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanChange = async (planId: string) => {
    if (!canManageBilling()) return

    setIsChanging(true)
    setSelectedPlan(planId)

    try {
      // Mock API call to change subscription
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newPlan = AVAILABLE_PLANS.find(p => p.id === planId)!
      const updatedSubscription: Subscription = {
        ...currentSubscription!,
        plan: { ...newPlan, interval: billingInterval }
      }

      setCurrentSubscription(updatedSubscription)
      onSubscriptionChanged?.(updatedSubscription)
    } catch (error) {
      console.error('Failed to change subscription:', error)
    } finally {
      setIsChanging(false)
      setSelectedPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!canManageBilling() || !currentSubscription) return

    setIsChanging(true)

    try {
      // Mock API call to cancel subscription
      await new Promise(resolve => setTimeout(resolve, 1500))

      const updatedSubscription: Subscription = {
        ...currentSubscription,
        cancel_at_period_end: true
      }

      setCurrentSubscription(updatedSubscription)
      onSubscriptionChanged?.(updatedSubscription)
      setShowCancelConfirmation(false)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setIsChanging(false)
    }
  }

  const formatPrice = (price: number, interval: BillingInterval = 'monthly') => {
    if (price === 0) return 'Free'
    
    const yearlyPrice = interval === 'yearly' ? price * 10 : price * 12 // 20% discount for yearly
    const displayPrice = interval === 'yearly' ? yearlyPrice : price
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(displayPrice)
  }

  const getDiscountPercentage = () => {
    return billingInterval === 'yearly' ? 20 : 0
  }

  if (!canManageBilling()) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Access Denied</div>
        <p className="text-gray-500">You don't have permission to manage subscriptions</p>
      </div>
    )
  }

  if (isLoading) {
    return <SubscriptionManagerSkeleton />
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Scale with your business needs
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              billingInterval === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
            {getDiscountPercentage() > 0 && (
              <span className="ml-1 text-green-600 font-bold">
                (Save {getDiscountPercentage()}%)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Current Plan: {currentSubscription.plan.name}
              </h3>
              <p className="text-sm text-blue-700">
                {currentSubscription.cancel_at_period_end
                  ? `Cancels on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                  : `Renews on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                }
              </p>
            </div>
            
            {currentSubscription.cancel_at_period_end && (
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Reactivate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {AVAILABLE_PLANS.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan.id === plan.id
          const isSelected = selectedPlan === plan.id
          const isChangingToPlan = isChanging && isSelected
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white border rounded-lg shadow-sm p-6 ${
                plan.popular 
                  ? 'border-blue-500 ring-1 ring-blue-500' 
                  : isCurrentPlan 
                    ? 'border-green-500 ring-1 ring-green-500'
                    : 'border-gray-200'
              } ${isChangingToPlan ? 'opacity-50' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price, billingInterval)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">
                      /{billingInterval === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                  
                  {billingInterval === 'yearly' && plan.price > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Save {formatPrice(plan.price * 2.4)} per year
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="mt-6">
                  {isCurrentPlan ? (
                    <button
                      onClick={() => setShowCancelConfirmation(true)}
                      disabled={currentSubscription?.cancel_at_period_end || isChanging}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentSubscription?.cancel_at_period_end ? 'Cancelled' : 'Cancel Plan'}
                    </button>
                  ) : plan.price === 0 ? (
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isChanging}
                      className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingToPlan ? 'Processing...' : 'Downgrade'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isChanging}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                          : 'text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500 border border-blue-200'
                      }`}
                    >
                      {isChangingToPlan ? 'Processing...' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise Contact */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Need something custom?
        </h3>
        <p className="text-gray-600 mb-4">
          Contact us for enterprise pricing, custom features, and dedicated support.
        </p>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Contact Sales
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Cancel Subscription
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll still have access to all features until your current period ends on{' '}
              {currentSubscription && new Date(currentSubscription.current_period_end).toLocaleDateString()}.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirmation(false)}
                disabled={isChanging}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isChanging}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading skeleton
function SubscriptionManagerSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-40 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-6"></div>
              
              <div className="space-y-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}