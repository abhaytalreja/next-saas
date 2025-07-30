import type { CheckoutSessionConfig } from '../types'
import { getStripeClient } from './stripe-client'

export class CheckoutService {
  private stripe = getStripeClient()

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createSubscriptionCheckout(
    priceId: string,
    customerId: string,
    config: {
      success_url: string
      cancel_url: string
      trial_period_days?: number
      metadata?: Record<string, string>
      allow_promotion_codes?: boolean
      automatic_tax?: boolean
      tax_id_collection?: boolean
    }
  ) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: config.success_url,
      cancel_url: config.cancel_url,
      subscription_data: {
        metadata: config.metadata,
        trial_period_days: config.trial_period_days
      },
      allow_promotion_codes: config.allow_promotion_codes ?? true,
      automatic_tax: config.automatic_tax ? { enabled: true } : undefined,
      tax_id_collection: config.tax_id_collection ? { enabled: true } : undefined,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    })

    return session
  }

  /**
   * Create a Stripe Checkout session with email (no existing customer)
   */
  async createEmailCheckout(
    priceId: string,
    customerEmail: string,
    config: {
      success_url: string
      cancel_url: string
      trial_period_days?: number
      metadata?: Record<string, string>
      allow_promotion_codes?: boolean
      automatic_tax?: boolean
    }
  ) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: config.success_url,
      cancel_url: config.cancel_url,
      subscription_data: {
        metadata: config.metadata,
        trial_period_days: config.trial_period_days
      },
      allow_promotion_codes: config.allow_promotion_codes ?? true,
      automatic_tax: config.automatic_tax ? { enabled: true } : undefined,
      billing_address_collection: 'required'
    })

    return session
  }

  /**
   * Create one-time payment checkout
   */
  async createPaymentCheckout(
    amount: number,
    currency: string = 'usd',
    config: {
      success_url: string
      cancel_url: string
      customer_id?: string
      metadata?: Record<string, string>
      description?: string
    }
  ) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer: config.customer_id,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: config.description || 'One-time payment'
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      success_url: config.success_url,
      cancel_url: config.cancel_url,
      metadata: config.metadata,
      billing_address_collection: 'required'
    })

    return session
  }

  /**
   * Retrieve checkout session
   */
  async getCheckoutSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(
    customerId: string,
    returnUrl: string,
    configuration?: string
  ) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration
    })

    return session
  }

  /**
   * List all portal configurations
   */
  async listPortalConfigurations() {
    return await this.stripe.billingPortal.configurations.list()
  }

  /**
   * Create custom portal configuration
   */
  async createPortalConfiguration(config: any) {
    return await this.stripe.billingPortal.configurations.create(config)
  }
}