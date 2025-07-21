'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import type { OrganizationBilling, Subscription, UsageMetrics } from '../../types/billing'

interface BillingOverviewProps {
  onManageSubscription?: () => void
  onViewUsage?: () => void
  onViewInvoices?: () => void
  className?: string
}

export function BillingOverview({
  onManageSubscription,
  onViewUsage,
  onViewInvoices,
  className = ''
}: BillingOverviewProps) {
  const [billingData, setBillingData] = useState<OrganizationBilling | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { currentOrganization, canManageBilling } = useOrganization()

  useEffect(() => {
    if (currentOrganization?.id) {
      loadBillingData()
    }
  }, [currentOrganization?.id])

  const loadBillingData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Mock data - replace with actual API calls
      const mockBillingData: OrganizationBilling = {
        id: '1',
        organization_id: currentOrganization!.id,
        stripe_customer_id: 'cus_mock123',
        payment_method_id: 'pm_mock123',
        billing_email: 'billing@example.com',
        billing_name: 'Example Corp',
        billing_address: {
          line1: '123 Business St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '94107',
          country: 'US'
        },
        currency: 'usd',
        payment_status: 'active',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const mockSubscription: Subscription = {
        id: 'sub_mock123',
        status: 'active',
        plan: {
          id: 'price_pro',
          name: 'Pro Plan',
          price: 29.99,
          currency: 'usd',
          interval: 'monthly',
          features: [
            'Up to 50 projects',
            '10GB storage',
            'Priority support',
            'Advanced analytics'
          ]
        },
        current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: null,
        cancel_at_period_end: false
      }

      const mockUsage: UsageMetrics = {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        projects: { used: 12, limit: 50 },
        storage: { used: 3.2, limit: 10, unit: 'GB' },
        api_calls: { used: 15420, limit: 100000 },
        team_members: { used: 8, limit: 25 }
      }

      setBillingData(mockBillingData)
      setSubscription(mockSubscription)
      setUsage(mockUsage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-800 bg-green-100'
      case 'past_due':
        return 'text-yellow-800 bg-yellow-100'
      case 'canceled':
        return 'text-red-800 bg-red-100'
      case 'trialing':
        return 'text-blue-800 bg-blue-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!canManageBilling()) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Access Denied</div>
        <p className="text-gray-500">You don't have permission to view billing information</p>
      </div>
    )
  }

  if (isLoading) {
    return <BillingOverviewSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Failed to load billing data</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadBillingData}
          className="mt-4 text-sm text-red-600 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Overview</h2>
          <p className="text-gray-600 mt-1">
            Manage your subscription, usage, and billing information
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onViewInvoices}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Invoices
          </button>
          
          <button
            onClick={onManageSubscription}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">{subscription.plan.name}</h4>
              <p className="text-gray-600">
                {formatCurrency(subscription.plan.price)}/{subscription.plan.interval}
              </p>
              
              {subscription.cancel_at_period_end && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Subscription will cancel on{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Features</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Billing Period</h5>
              <p className="text-sm text-gray-600">
                {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
              
              {billingData?.next_billing_date && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Next billing:</strong>{' '}
                  {new Date(billingData.next_billing_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Overview */}
      {usage && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Usage Overview</h3>
            <button
              onClick={onViewUsage}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Projects */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Projects</h4>
                <span className="text-2xl">📁</span>
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold text-gray-900">{usage.projects.used}</span>
                <span className="text-gray-600">/{usage.projects.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.projects.used, usage.projects.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.projects.used, usage.projects.limit)}%` }}
                />
              </div>
            </div>

            {/* Storage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Storage</h4>
                <span className="text-2xl">💾</span>
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold text-gray-900">{usage.storage.used}</span>
                <span className="text-gray-600">/{usage.storage.limit} {usage.storage.unit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.storage.used, usage.storage.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.storage.used, usage.storage.limit)}%` }}
                />
              </div>
            </div>

            {/* API Calls */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">API Calls</h4>
                <span className="text-2xl">🔄</span>
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold text-gray-900">{usage.api_calls.used.toLocaleString()}</span>
                <span className="text-gray-600">/{usage.api_calls.limit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.api_calls.used, usage.api_calls.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.api_calls.used, usage.api_calls.limit)}%` }}
                />
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Team Members</h4>
                <span className="text-2xl">👥</span>
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold text-gray-900">{usage.team_members.used}</span>
                <span className="text-gray-600">/{usage.team_members.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.team_members.used, usage.team_members.limit))}`}
                  style={{ width: `${getUsagePercentage(usage.team_members.used, usage.team_members.limit)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      {billingData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  💳
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    **** **** **** 4242
                  </p>
                  <p className="text-xs text-gray-500">Expires 12/25</p>
                </div>
                <button className="ml-auto text-sm text-blue-600 hover:text-blue-700">
                  Update
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
              <div className="text-sm text-gray-600">
                <p>{billingData.billing_name}</p>
                <p>{billingData.billing_address?.line1}</p>
                <p>
                  {billingData.billing_address?.city}, {billingData.billing_address?.state}{' '}
                  {billingData.billing_address?.postal_code}
                </p>
                <p>{billingData.billing_address?.country}</p>
              </div>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                Update Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading skeleton
function BillingOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-36"></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}