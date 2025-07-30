import Stripe from 'stripe'

export interface StripeConfig {
  secret_key: string
  publishable_key: string
  webhook_secret: string
  api_version?: Stripe.LatestApiVersion
}

export interface CheckoutSessionConfig {
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
  mode: 'payment' | 'setup' | 'subscription'
  success_url: string
  cancel_url: string
  customer?: string
  customer_email?: string
  metadata?: Record<string, string>
  subscription_data?: {
    metadata?: Record<string, string>
    trial_period_days?: number
  }
  allow_promotion_codes?: boolean
  automatic_tax?: {
    enabled: boolean
  }
  tax_id_collection?: {
    enabled: boolean
  }
}

export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
  livemode: boolean
  pending_webhooks: number
  request: {
    id: string | null
    idempotency_key: string | null
  }
}

export type SupportedWebhookEvents = 
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'

export interface StripeCustomerData {
  id: string
  email: string
  name?: string
  metadata: Record<string, string>
  created: number
  subscriptions?: {
    data: Stripe.Subscription[]
  }
}

export interface StripeSubscriptionData {
  id: string
  customer: string
  status: Stripe.Subscription.Status
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at?: number
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        recurring?: {
          interval: 'month' | 'year'
        }
      }
    }>
  }
  trial_start?: number
  trial_end?: number
  metadata: Record<string, string>
}