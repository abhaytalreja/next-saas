'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import type { BillingCustomer } from '../types'

export function useBillingCustomer(organizationId?: string) {
  const [customer, setCustomer] = useState<BillingCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!organizationId) {
      setIsLoading(false)
      return
    }

    const fetchCustomer = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('billing_customers')
          .select('*')
          .eq('organization_id', organizationId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        setCustomer(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching billing customer:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch customer')
        setCustomer(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomer()

    // Subscribe to real-time updates
    const customerChannel = supabase
      .channel('customer_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'billing_customers',
          filter: `organization_id=eq.${organizationId}`
        },
        () => {
          fetchCustomer()
        }
      )
      .subscribe()

    return () => {
      customerChannel.unsubscribe()
    }
  }, [organizationId, supabase])

  return {
    customer,
    isLoading,
    error,
    hasCustomer: !!customer,
    stripeCustomerId: customer?.stripe_customer_id
  }
}