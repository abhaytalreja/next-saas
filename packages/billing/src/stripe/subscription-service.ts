import type { StripeSubscriptionData } from '../types'
import { getStripeClient } from './stripe-client'

export class SubscriptionService {
  private stripe = getStripeClient()

  /**
   * Create a new subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    options?: {
      trial_period_days?: number
      metadata?: Record<string, string>
      automatic_tax?: boolean
    }
  ): Promise<StripeSubscriptionData> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: options?.trial_period_days,
      metadata: options?.metadata,
      automatic_tax: options?.automatic_tax ? { enabled: true } : undefined,
      expand: ['latest_invoice.payment_intent']
    })

    return this.mapSubscriptionData(subscription)
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscriptionData | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      return this.mapSubscriptionData(subscription)
    } catch (error) {
      if (error instanceof Error && error.message.includes('No such subscription')) {
        return null
      }
      throw error
    }
  }

  /**
   * Update subscription (change plan, quantity, etc.)
   */
  async updateSubscription(
    subscriptionId: string,
    updates: {
      price_id?: string
      quantity?: number
      metadata?: Record<string, string>
      proration_behavior?: 'none' | 'create_prorations' | 'always_invoice'
    }
  ): Promise<StripeSubscriptionData> {
    const updateParams: any = {
      metadata: updates.metadata,
      proration_behavior: updates.proration_behavior
    }

    // If changing price, update the subscription item
    if (updates.price_id) {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      const subscriptionItem = subscription.items.data[0]

      updateParams.items = [{
        id: subscriptionItem.id,
        price: updates.price_id,
        quantity: updates.quantity
      }]
    }

    const subscription = await this.stripe.subscriptions.update(subscriptionId, updateParams)
    return this.mapSubscriptionData(subscription)
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<StripeSubscriptionData> {
    let subscription
    
    if (cancelAtPeriodEnd) {
      subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    } else {
      subscription = await this.stripe.subscriptions.cancel(subscriptionId)
    }

    return this.mapSubscriptionData(subscription)
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<StripeSubscriptionData> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })

    return this.mapSubscriptionData(subscription)
  }

  /**
   * Get all subscriptions for a customer
   */
  async getCustomerSubscriptions(customerId: string): Promise<StripeSubscriptionData[]> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'all'
    })

    return subscriptions.data.map(sub => this.mapSubscriptionData(sub))
  }

  /**
   * Check if subscription is active
   */
  isActiveSubscription(subscription: StripeSubscriptionData): boolean {
    return ['active', 'trialing'].includes(subscription.status)
  }

  /**
   * Check if subscription is in trial
   */
  isTrialSubscription(subscription: StripeSubscriptionData): boolean {
    return subscription.status === 'trialing' && 
           subscription.trial_end !== undefined &&
           subscription.trial_end > Math.floor(Date.now() / 1000)
  }

  /**
   * Get subscription usage (for usage-based billing)
   */
  async getSubscriptionUsage(
    subscriptionItemId: string,
    timestamp?: number
  ): Promise<any> {
    return await this.stripe.subscriptionItems.listUsageRecordSummaries(subscriptionItemId, {
      limit: 100,
      starting_after: timestamp ? new Date(timestamp * 1000).toISOString() : undefined
    })
  }

  /**
   * Report usage for usage-based billing
   */
  async reportUsage(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ): Promise<any> {
    return await this.stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
      quantity,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      action: 'set'
    })
  }

  private mapSubscriptionData(subscription: any): StripeSubscriptionData {
    return {
      id: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      items: subscription.items,
      trial_start: subscription.trial_start,
      trial_end: subscription.trial_end,
      metadata: subscription.metadata
    }
  }
}