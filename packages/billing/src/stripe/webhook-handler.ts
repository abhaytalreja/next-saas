import Stripe from 'stripe'
import type { WebhookEvent, SupportedWebhookEvents } from '../types'
import { getStripeClient } from './stripe-client'

export class WebhookHandler {
  private stripe = getStripeClient()
  private webhookSecret: string

  constructor(webhookSecret?: string) {
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET!
    
    if (!this.webhookSecret) {
      throw new Error('Stripe webhook secret is required')
    }
  }

  /**
   * Verify and construct webhook event from raw body
   */
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    )
  }

  /**
   * Process webhook event with type-safe handlers
   */
  async processEvent(
    event: Stripe.Event,
    handlers: Partial<Record<SupportedWebhookEvents, (data: any) => Promise<void>>>
  ): Promise<void> {
    const eventType = event.type as SupportedWebhookEvents
    const handler = handlers[eventType]

    if (!handler) {
      console.log(`Unhandled webhook event type: ${event.type}`)
      return
    }

    try {
      await handler(event.data.object)
      console.log(`Successfully processed webhook: ${event.type}`)
    } catch (error) {
      console.error(`Error processing webhook ${event.type}:`, error)
      throw error
    }
  }

  /**
   * Default handlers for common webhook events
   */
  getDefaultHandlers(callbacks: {
    onSubscriptionCreated?: (subscription: Stripe.Subscription) => Promise<void>
    onSubscriptionUpdated?: (subscription: Stripe.Subscription) => Promise<void>
    onSubscriptionDeleted?: (subscription: Stripe.Subscription) => Promise<void>
    onInvoicePaymentSucceeded?: (invoice: Stripe.Invoice) => Promise<void>
    onInvoicePaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>
    onCustomerCreated?: (customer: Stripe.Customer) => Promise<void>
    onCustomerUpdated?: (customer: Stripe.Customer) => Promise<void>
    onCustomerDeleted?: (customer: Stripe.Customer) => Promise<void>
  }): Partial<Record<SupportedWebhookEvents, (data: any) => Promise<void>>> {
    return {
      'customer.subscription.created': callbacks.onSubscriptionCreated,
      'customer.subscription.updated': callbacks.onSubscriptionUpdated,
      'customer.subscription.deleted': callbacks.onSubscriptionDeleted,
      'invoice.payment_succeeded': callbacks.onInvoicePaymentSucceeded,
      'invoice.payment_failed': callbacks.onInvoicePaymentFailed,
      'customer.created': callbacks.onCustomerCreated,
      'customer.updated': callbacks.onCustomerUpdated,
      'customer.deleted': callbacks.onCustomerDeleted,
    }
  }

  /**
   * Extract organization ID from webhook metadata
   */
  extractOrganizationId(webhookData: any): string | null {
    // Try subscription metadata first
    if (webhookData.metadata?.organization_id) {
      return webhookData.metadata.organization_id
    }

    // Try customer metadata
    if (webhookData.customer?.metadata?.organization_id) {
      return webhookData.customer.metadata.organization_id
    }

    // For invoice events, check subscription metadata
    if (webhookData.subscription?.metadata?.organization_id) {
      return webhookData.subscription.metadata.organization_id
    }

    return null
  }

  /**
   * Validate webhook signature without constructing event
   */
  validateSignature(payload: string | Buffer, signature: string): boolean {
    try {
      this.constructEvent(payload, signature)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get webhook endpoint info
   */
  async getWebhookEndpoint(endpointId: string) {
    return await this.stripe.webhookEndpoints.retrieve(endpointId)
  }

  /**
   * List all webhook endpoints
   */
  async listWebhookEndpoints() {
    return await this.stripe.webhookEndpoints.list()
  }

  /**
   * Create webhook endpoint
   */
  async createWebhookEndpoint(
    url: string,
    enabledEvents: SupportedWebhookEvents[],
    description?: string
  ) {
    return await this.stripe.webhookEndpoints.create({
      url,
      enabled_events: enabledEvents,
      description
    })
  }

  /**
   * Delete webhook endpoint
   */
  async deleteWebhookEndpoint(endpointId: string) {
    return await this.stripe.webhookEndpoints.del(endpointId)
  }
}