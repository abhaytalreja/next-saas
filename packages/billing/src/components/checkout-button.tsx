'use client'

import React, { useState } from 'react'

interface CheckoutButtonProps {
  priceId: string
  organizationId: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  trialPeriodDays?: number
  allowPromotionCodes?: boolean
  successUrl?: string
  cancelUrl?: string
}

export function CheckoutButton({
  priceId,
  organizationId,
  children = 'Subscribe',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  trialPeriodDays,
  allowPromotionCodes = true,
  successUrl,
  cancelUrl
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          price_id: priceId,
          success_url: successUrl || `${window.location.origin}/billing?success=true`,
          cancel_url: cancelUrl || window.location.href,
          trial_period_days: trialPeriodDays,
          allow_promotion_codes: allowPromotionCodes,
          automatic_tax: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { checkout_url } = await response.json()
      window.location.href = checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  )
}