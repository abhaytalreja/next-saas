'use client'

import React from 'react'
import type { Subscription, Plan } from '../types'

interface SubscriptionStatusProps {
  subscription?: (Subscription & { plan?: Plan }) | null
  showUpgradePrompts?: boolean
  className?: string
}

export function SubscriptionStatusCard({
  subscription,
  showUpgradePrompts = true,
  className = ''
}: SubscriptionStatusProps) {
  if (!subscription) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">No Active Subscription</h3>
            <p className="text-gray-600">Get started with a plan that fits your needs.</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: (
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Active Subscription',
          titleColor: 'text-green-900',
          description: 'Your subscription is active and all features are available.',
          descriptionColor: 'text-green-700'
        }
      case 'trialing':
        return {
          icon: (
            <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Free Trial Active',
          titleColor: 'text-blue-900',
          description: 'You\'re currently on a free trial. All features are available.',
          descriptionColor: 'text-blue-700'
        }
      case 'past_due':
        return {
          icon: (
            <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Past Due',
          titleColor: 'text-yellow-900',
          description: 'Your payment is past due. Please update your payment method.',
          descriptionColor: 'text-yellow-700'
        }
      case 'canceled':
        return {
          icon: (
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Subscription Canceled',
          titleColor: 'text-red-900',
          description: subscription.cancel_at_period_end 
            ? 'Your subscription will end at the current period.'
            : 'Your subscription has been canceled.',
          descriptionColor: 'text-red-700'
        }
      default:
        return {
          icon: (
            <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          titleColor: 'text-gray-900',
          description: `Subscription status: ${status}`,
          descriptionColor: 'text-gray-700'
        }
    }
  }

  const statusConfig = getStatusConfig(subscription.status)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiry = () => {
    if (!subscription.current_period_end) return null
    const endDate = new Date(subscription.current_period_end)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  return (
    <div className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {statusConfig.icon}
          </div>
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-medium ${statusConfig.titleColor}`}>
              {statusConfig.title}
            </h3>
            <p className={`mt-1 ${statusConfig.descriptionColor}`}>
              {statusConfig.description}
            </p>
            
            {/* Plan Details */}
            {subscription.plan && (
              <div className="mt-3 space-y-1">
                <p className={`text-sm font-medium ${statusConfig.titleColor}`}>
                  Current Plan: {subscription.plan.name}
                </p>
                <p className={`text-sm ${statusConfig.descriptionColor}`}>
                  {subscription.billing_cycle === 'yearly' ? 'Annual' : 'Monthly'} billing
                  {subscription.plan.price_monthly && (
                    <span className="ml-2">
                      • ${subscription.billing_cycle === 'yearly' 
                        ? subscription.plan.price_yearly 
                        : subscription.plan.price_monthly
                      }/{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Period Information */}
            {subscription.current_period_end && (
              <div className="mt-2">
                <p className={`text-sm ${statusConfig.descriptionColor}`}>
                  {subscription.status === 'trialing' ? 'Trial ends' : 'Next billing'}: {' '}
                  {formatDate(subscription.current_period_end)}
                  {daysUntilExpiry !== null && (
                    <span className="ml-2">
                      ({daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} remaining)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showUpgradePrompts && (
          <div className="flex-shrink-0 ml-4">
            {(subscription.status === 'trialing' || subscription.status === 'active') && (
              <div className="space-y-2">
                {subscription.plan?.slug !== 'enterprise' && (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Upgrade Plan
                  </button>
                )}
              </div>
            )}

            {subscription.status === 'past_due' && (
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Update Payment
              </button>
            )}

            {subscription.status === 'canceled' && !subscription.cancel_at_period_end && (
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Reactivate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel at Period End Warning */}
      {subscription.cancel_at_period_end && subscription.current_period_end && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-orange-800">
                Subscription Ending
              </h4>
              <p className="mt-1 text-sm text-orange-700">
                Your subscription will not renew and will end on {formatDate(subscription.current_period_end)}.
                You'll lose access to premium features after this date.
              </p>
              <div className="mt-3">
                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-800 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Don't Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}