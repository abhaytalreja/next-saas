'use client'

import { useState } from 'react'

interface CheckoutConfig {
  organizationId: string
  priceId: string
  successUrl?: string
  cancelUrl?: string
  trialPeriodDays?: number
  allowPromotionCodes?: boolean
  automaticTax?: boolean
}

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (config: CheckoutConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: config.organizationId,
          price_id: config.priceId,
          success_url: config.successUrl || `${window.location.origin}/billing?success=true`,
          cancel_url: config.cancelUrl || window.location.href,
          trial_period_days: config.trialPeriodDays,
          allow_promotion_codes: config.allowPromotionCodes ?? true,
          automatic_tax: config.automaticTax ?? true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { checkout_url, session_id } = await response.json()
      
      return {
        url: checkout_url,
        sessionId: session_id
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const redirectToCheckout = async (config: CheckoutConfig) => {
    try {
      const { url } = await createCheckoutSession(config)
      window.location.href = url
    } catch (err) {
      // Error is already set by createCheckoutSession
      console.error('Checkout redirect failed:', err)
    }
  }

  return {
    createCheckoutSession,
    redirectToCheckout,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}

export function useCustomerPortal() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPortal = async (customerId: string, returnUrl?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: returnUrl || window.location.href
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open customer portal'
      setError(errorMessage)
      console.error('Portal error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    openPortal,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}