'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useUsageTracking } from '../../hooks/useUsageTracking'
import { useBilling } from '../../hooks/useBilling'
import { usePlans } from '../../hooks/usePlans'
import type { 
  UsageSummary, 
  UsageAlert, 
  UsageLimit,
  Subscription,
  Invoice,
  PaymentMethod,
  BillingPlan,
  PlanConfiguration
} from '../../types'

interface UsageBillingContextValue {
  // Usage tracking
  usage: UsageSummary[]
  usageAlerts: UsageAlert[]
  usageLimits: UsageLimit[]
  usageStats: {
    totalMetrics: number
    activeAlerts: number
    criticalAlerts: number
    limitsExceeded: number
    averageUsage: number
  }
  usageLoading: boolean
  usageError: string | null
  trackUsage: (event: any) => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  refreshUsage: () => Promise<void>

  // Billing
  subscription: Subscription | null
  currentInvoice: Invoice | null
  upcomingInvoice: Invoice | null
  paymentMethods: PaymentMethod[]
  billingStats: {
    hasActiveSubscription: boolean
    isTrialing: boolean
    isPastDue: boolean
    willCancelAtPeriodEnd: boolean
    hasPaymentMethod: boolean
    defaultPaymentMethod?: PaymentMethod
    nextBillingDate?: string
    trialEndsAt?: string
  }
  billingLoading: boolean
  billingError: string | null
  upgradeSubscription: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  addPaymentMethod: (paymentMethodId: string) => Promise<PaymentMethod>
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>
  retryPayment: (invoiceId: string) => Promise<void>
  downloadInvoice: (invoiceId: string) => Promise<void>
  refreshBilling: () => Promise<void>

  // Plans
  planConfig: PlanConfiguration | null
  availablePlans: BillingPlan[]
  currentPlan: BillingPlan | null
  recommendedPlan: BillingPlan | null
  planStats: {
    totalPlans: number
    hasCurrentPlan: boolean
    hasRecommendation: boolean
    upgradeOptionsCount: number
    lowestPrice: number
    highestPrice: number
  }
  plansLoading: boolean
  plansError: string | null
  isCurrentPlan: (planId: string) => boolean
  isRecommendedPlan: (planId: string) => boolean
  getPlanById: (planId: string) => BillingPlan | undefined
  getCostEstimate: (planId: string) => { monthly: number; yearly: number } | null
  refreshPlans: () => Promise<void>
}

const UsageBillingContext = createContext<UsageBillingContextValue | undefined>(undefined)

interface UsageBillingProviderProps {
  children: ReactNode
}

export function UsageBillingProvider({ children }: UsageBillingProviderProps) {
  // Usage tracking hook
  const {
    usage,
    alerts: usageAlerts,
    limits: usageLimits,
    usageStats,
    isLoading: usageLoading,
    error: usageError,
    trackUsage,
    acknowledgeAlert,
    refreshUsage
  } = useUsageTracking()

  // Billing hook
  const {
    subscription,
    currentInvoice,
    upcomingInvoice,
    paymentMethods,
    billingStats,
    isLoading: billingLoading,
    error: billingError,
    upgradeSubscription,
    cancelSubscription,
    addPaymentMethod,
    setDefaultPaymentMethod,
    retryPayment,
    downloadInvoice,
    refreshBilling
  } = useBilling()

  // Plans hook
  const {
    planConfig,
    availablePlans,
    currentPlan,
    recommendedPlan,
    planStats,
    isLoading: plansLoading,
    error: plansError,
    isCurrentPlan,
    isRecommendedPlan,
    getPlanById,
    getCostEstimate,
    refreshPlans
  } = usePlans()

  const contextValue: UsageBillingContextValue = {
    // Usage tracking
    usage,
    usageAlerts,
    usageLimits,
    usageStats,
    usageLoading,
    usageError,
    trackUsage,
    acknowledgeAlert,
    refreshUsage,

    // Billing
    subscription,
    currentInvoice,
    upcomingInvoice,
    paymentMethods,
    billingStats,
    billingLoading,
    billingError,
    upgradeSubscription,
    cancelSubscription,
    addPaymentMethod,
    setDefaultPaymentMethod,
    retryPayment,
    downloadInvoice,
    refreshBilling,

    // Plans
    planConfig,
    availablePlans,
    currentPlan,
    recommendedPlan,
    planStats,
    plansLoading,
    plansError,
    isCurrentPlan,
    isRecommendedPlan,
    getPlanById,
    getCostEstimate,
    refreshPlans
  }

  return (
    <UsageBillingContext.Provider value={contextValue}>
      {children}
    </UsageBillingContext.Provider>
  )
}

export function useUsageBillingContext() {
  const context = useContext(UsageBillingContext)
  if (context === undefined) {
    throw new Error('useUsageBillingContext must be used within a UsageBillingProvider')
  }
  return context
}

// Convenience hooks for accessing specific parts of the context
export function useUsageBillingUsage() {
  const context = useUsageBillingContext()
  return {
    usage: context.usage,
    alerts: context.usageAlerts,
    limits: context.usageLimits,
    stats: context.usageStats,
    isLoading: context.usageLoading,
    error: context.usageError,
    trackUsage: context.trackUsage,
    acknowledgeAlert: context.acknowledgeAlert,
    refresh: context.refreshUsage
  }
}

export function useUsageBillingBilling() {
  const context = useUsageBillingContext()
  return {
    subscription: context.subscription,
    currentInvoice: context.currentInvoice,
    upcomingInvoice: context.upcomingInvoice,
    paymentMethods: context.paymentMethods,
    stats: context.billingStats,
    isLoading: context.billingLoading,
    error: context.billingError,
    upgradeSubscription: context.upgradeSubscription,
    cancelSubscription: context.cancelSubscription,
    addPaymentMethod: context.addPaymentMethod,
    setDefaultPaymentMethod: context.setDefaultPaymentMethod,
    retryPayment: context.retryPayment,
    downloadInvoice: context.downloadInvoice,
    refresh: context.refreshBilling
  }
}

export function useUsageBillingPlans() {
  const context = useUsageBillingContext()
  return {
    config: context.planConfig,
    availablePlans: context.availablePlans,
    currentPlan: context.currentPlan,
    recommendedPlan: context.recommendedPlan,
    stats: context.planStats,
    isLoading: context.plansLoading,
    error: context.plansError,
    isCurrentPlan: context.isCurrentPlan,
    isRecommendedPlan: context.isRecommendedPlan,
    getPlanById: context.getPlanById,
    getCostEstimate: context.getCostEstimate,
    refresh: context.refreshPlans
  }
}