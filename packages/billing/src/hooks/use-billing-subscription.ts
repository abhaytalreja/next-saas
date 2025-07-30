'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { Subscription, Plan } from '../types'

export function useBillingSubscription(organizationId?: string) {
  const [subscription, setSubscription] = useState<(Subscription & { plan?: Plan }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!organizationId) {
      setIsLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plans(*)
          `)
          .eq('organization_id', organizationId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setSubscription(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
        setSubscription(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()

    // Subscribe to real-time updates
    const subscription_channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `organization_id=eq.${organizationId}`
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      subscription_channel.unsubscribe()
    }
  }, [organizationId, supabase])

  const isActive = subscription?.status === 'active'
  const isTrialing = subscription?.status === 'trialing'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled'

  const daysUntilExpiry = subscription?.current_period_end
    ? Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    : null

  return {
    subscription,
    isLoading,
    error,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    daysUntilExpiry,
    refetch: () => {
      if (organizationId) {
        setIsLoading(true)
        // Trigger re-fetch by updating a dependency
      }
    }
  }
}