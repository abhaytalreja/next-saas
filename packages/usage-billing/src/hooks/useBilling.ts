import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@nextsaas/auth'
import { createClient } from '@nextsaas/supabase/client'
import { BillingCalculationService } from '../services/billing-calculator'
import { StripeService } from '../services/stripe-service'
import type { 
  Subscription, 
  Invoice, 
  PaymentMethod, 
  BillingPlan,
  UpgradePreview
} from '../types'

export function useBilling() {
  const { organization } = useOrganization()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [upcomingInvoice, setUpcomingInvoice] = useState<Invoice | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const billingService = new BillingCalculationService()
  const stripeService = new StripeService()

  // Load billing data
  const loadBillingData = useCallback(async () => {
    if (!organization?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const [subscriptionData, invoicesData, paymentMethodsData] = await Promise.all([
        // Get active subscription
        supabase
          .from('subscriptions')
          .select(`
            *,
            plans (*)
          `)
          .eq('organization_id', organization.id)
          .eq('status', 'active')
          .single(),

        // Get recent invoices
        supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(5),

        // Get payment methods
        supabase
          .from('payment_methods')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
      ])

      setSubscription(subscriptionData.data)
      
      if (invoicesData.data && invoicesData.data.length > 0) {
        setCurrentInvoice(invoicesData.data[0])
      }

      setPaymentMethods(paymentMethodsData.data || [])

      // Get upcoming invoice from Stripe
      try {
        const upcoming = await stripeService.getUpcomingInvoice(organization.id)
        if (upcoming) {
          setUpcomingInvoice({
            id: 'upcoming',
            organization_id: organization.id,
            invoice_number: 'UPCOMING',
            amount_due: upcoming.amount_due / 100, // Convert from cents
            amount_paid: 0,
            currency: upcoming.currency,
            status: 'draft',
            period_start: new Date(upcoming.period_start * 1000).toISOString(),
            period_end: new Date(upcoming.period_end * 1000).toISOString(),
            due_date: new Date(upcoming.due_date! * 1000).toISOString(),
            line_items: upcoming.lines.data.map(line => ({
              id: line.id,
              description: line.description || '',
              quantity: line.quantity || 0,
              unit_price: (line.price?.unit_amount || 0) / 100,
              amount: (line.amount || 0) / 100
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } catch (upcomingError) {
        console.warn('Could not fetch upcoming invoice:', upcomingError)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data')
      console.error('Billing data error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id])

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (planId: string) => {
    if (!organization?.id || !subscription) {
      throw new Error('No active subscription found')
    }

    try {
      setIsLoading(true)
      
      // For now, create a new subscription (in production, you'd upgrade the existing one)
      const newSubscription = await stripeService.createSubscription(
        organization.id,
        planId
      )

      setSubscription(newSubscription)
      await loadBillingData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade subscription'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, subscription, loadBillingData])

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!subscription?.id) {
      throw new Error('No active subscription found')
    }

    try {
      setIsLoading(true)
      
      await stripeService.cancelSubscription(subscription.id, false)
      await loadBillingData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [subscription?.id, loadBillingData])

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const paymentMethod = await stripeService.createPaymentMethod(
        organization.id,
        paymentMethodId
      )

      setPaymentMethods(prev => [paymentMethod, ...prev])
      return paymentMethod
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [organization?.id])

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      await stripeService.setDefaultPaymentMethod(organization.id, paymentMethodId)
      
      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId
        }))
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [organization?.id])

  // Retry payment
  const retryPayment = useCallback(async (invoiceId: string) => {
    try {
      await stripeService.retryInvoicePayment(invoiceId)
      await loadBillingData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [loadBillingData])

  // Download invoice
  const downloadInvoice = useCallback(async (invoiceId: string) => {
    try {
      const downloadUrl = await stripeService.getInvoiceDownloadUrl(invoiceId)
      window.open(downloadUrl, '_blank')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Get upgrade preview
  const getUpgradePreview = useCallback(async (targetPlanId: string): Promise<UpgradePreview> => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    return billingService.previewUpgrade(organization.id, targetPlanId)
  }, [organization?.id])

  // Load initial data
  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  // Subscribe to real-time billing updates
  useEffect(() => {
    if (!organization?.id) return

    const subscriptionChannel = supabase
      .channel('billing-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          loadBillingData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          loadBillingData()
        }
      )
      .subscribe()

    return () => {
      subscriptionChannel.unsubscribe()
    }
  }, [organization?.id, supabase, loadBillingData])

  // Calculate billing statistics
  const billingStats = {
    hasActiveSubscription: subscription?.status === 'active',
    isTrialing: subscription?.status === 'trialing',
    isPastDue: subscription?.status === 'past_due',
    willCancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    hasPaymentMethod: paymentMethods.length > 0,
    defaultPaymentMethod: paymentMethods.find(pm => pm.is_default),
    nextBillingDate: subscription?.current_period_end,
    trialEndsAt: subscription?.trial_end
  }

  return {
    // Data
    subscription,
    currentInvoice,
    upcomingInvoice,
    paymentMethods,
    billingStats,
    
    // State
    isLoading,
    error,
    
    // Actions
    upgradeSubscription,
    cancelSubscription,
    addPaymentMethod,
    setDefaultPaymentMethod,
    retryPayment,
    downloadInvoice,
    getUpgradePreview,
    refreshBilling: loadBillingData
  }
}

// Hook for subscription management
export function useSubscription() {
  const { subscription, upgradeSubscription, cancelSubscription, isLoading, error } = useBilling()

  const subscriptionStatus = {
    isActive: subscription?.status === 'active',
    isTrialing: subscription?.status === 'trialing',
    isPastDue: subscription?.status === 'past_due',
    isCanceled: subscription?.status === 'canceled',
    willCancel: subscription?.cancel_at_period_end || false
  }

  return {
    subscription,
    subscriptionStatus,
    upgradeSubscription,
    cancelSubscription,
    isLoading,
    error
  }
}

// Hook for payment methods management
export function usePaymentMethods() {
  const { 
    paymentMethods, 
    addPaymentMethod, 
    setDefaultPaymentMethod, 
    isLoading, 
    error 
  } = useBilling()

  const defaultPaymentMethod = paymentMethods.find(pm => pm.is_default)
  const hasPaymentMethod = paymentMethods.length > 0

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    const { organization } = useOrganization()
    const supabase = createClient()

    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('organization_id', organization.id)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method'
      throw new Error(errorMessage)
    }
  }, [])

  return {
    paymentMethods,
    defaultPaymentMethod,
    hasPaymentMethod,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    isLoading,
    error
  }
}