'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@nextsaas/ui'
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface BillingInfo {
  plan: string
  status: 'active' | 'past_due' | 'canceled' | 'trialing'
  amount: number
  currency: string
  interval: 'month' | 'year'
  nextBilling: string
  paymentMethod: {
    type: 'card' | 'bank'
    last4: string
    brand?: string
  }
  usage: {
    storage: { used: number; limit: number }
    bandwidth: { used: number; limit: number }
    members: { used: number; limit: number }
  }
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  date: string
  downloadUrl?: string
}

interface OrganizationBillingProps {
  organizationId: string
}

export function OrganizationBilling({ organizationId }: OrganizationBillingProps) {
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchBillingInfo()
  }, [organizationId])

  const fetchBillingInfo = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual API call to fetch billing information
      // const response = await fetch(`/api/admin/organizations/${organizationId}/billing`)
      // const data = await response.json()
      
      // Mock data for now
      const mockBilling: BillingInfo = {
        plan: 'Pro',
        status: 'active',
        amount: 29.99,
        currency: 'USD',
        interval: 'month',
        nextBilling: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'Visa'
        },
        usage: {
          storage: { used: 45, limit: 100 },
          bandwidth: { used: 120, limit: 500 },
          members: { used: 8, limit: 25 }
        }
      }

      const mockInvoices: Invoice[] = [
        {
          id: 'inv_001',
          amount: 29.99,
          currency: 'USD',
          status: 'paid',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        {
          id: 'inv_002',
          amount: 29.99,
          currency: 'USD',
          status: 'paid',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
        },
        {
          id: 'inv_003',
          amount: 29.99,
          currency: 'USD',
          status: 'pending',
          date: new Date().toISOString()
        }
      ]
      
      setBilling(mockBilling)
      setInvoices(mockInvoices)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      trialing: 'bg-blue-100 text-blue-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.canceled}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
      </span>
    )
  }

  const getInvoiceStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.failed}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !billing) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading billing information</div>
        <p className="text-gray-600">{error?.message || 'Billing information not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Billing & Subscription</h3>
        <p className="text-sm text-gray-600">
          Manage billing information and view usage details.
        </p>
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Current Plan</h4>
            {getStatusBadge(billing.status)}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{billing.plan}</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ${billing.amount}/{billing.interval}
                </div>
                <div className="text-sm text-gray-500">{billing.currency}</div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              Next billing: {new Date(billing.nextBilling).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Payment Method</h4>
            <Button size="sm" variant="outline">
              Update
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
              </div>
              <div className="text-sm text-gray-500">
                {billing.paymentMethod.type === 'card' ? 'Credit Card' : 'Bank Account'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Usage This Billing Period</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(billing.usage).map(([key, value]) => {
            const percentage = (value.used / value.limit) * 100
            const isNearLimit = percentage > 80
            
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {key === 'storage' ? 'Storage (GB)' : 
                     key === 'bandwidth' ? 'Bandwidth (GB)' : 
                     'Members'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {value.used} / {value.limit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isNearLimit ? 'bg-red-600' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                {isNearLimit && (
                  <div className="text-xs text-red-600 mt-1">
                    Approaching limit
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing Actions */}
      <div className="flex items-center space-x-3">
        <Button>
          <TrendingUp className="h-4 w-4 mr-2" />
          Upgrade Plan
        </Button>
        <Button variant="outline">
          <DollarSign className="h-4 w-4 mr-2" />
          Update Billing
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Invoice History</h4>
        
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Invoice #{invoice.id}
                  </div>
                </div>
                {getInvoiceStatusBadge(invoice.status)}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.currency}
                  </div>
                </div>
                
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {invoices.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Invoice history will appear here once billing begins.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}