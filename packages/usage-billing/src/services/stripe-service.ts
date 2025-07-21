import Stripe from 'stripe'
import { createClient } from '@nextsaas/supabase/server'
import type { 
  PaymentMethod, 
  Subscription, 
  Invoice,
  BillingPlan 
} from '../types'

export class StripeService {
  private stripe: Stripe
  private supabase = createClient()

  constructor(secretKey?: string) {
    this.stripe = new Stripe(secretKey || process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20'
    })
  }

  /**
   * Create a new customer in Stripe
   */
  async createCustomer(organizationId: string, email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        organization_id: organizationId
      }
    })

    // Update organization with Stripe customer ID
    await this.supabase
      .from('organizations')
      .update({ stripe_customer_id: customer.id })
      .eq('id', organizationId)

    return customer.id
  }

  /**
   * Create a subscription for usage-based billing
   */
  async createSubscription(
    organizationId: string, 
    planId: string,
    paymentMethodId?: string
  ): Promise<Subscription> {
    // Get organization and ensure it has a Stripe customer
    const { data: organization } = await this.supabase
      .from('organizations')
      .select('stripe_customer_id, name')
      .eq('id', organizationId)
      .single()

    if (!organization) {
      throw new Error('Organization not found')
    }

    let customerId = organization.stripe_customer_id
    if (!customerId) {
      // Create customer if it doesn't exist
      customerId = await this.createCustomer(
        organizationId, 
        `billing@${organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
        organization.name
      )
    }

    // Get plan details
    const { data: plan } = await this.supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) {
      throw new Error('Plan not found')
    }

    // Create subscription items
    const subscriptionItems: Stripe.SubscriptionCreateParams.Item[] = [
      {
        price: plan.stripe_price_id,
        quantity: 1
      }
    ]

    // Add usage-based pricing items
    for (const usagePricing of plan.usage_pricing || []) {
      if (usagePricing.stripe_price_id) {
        subscriptionItems.push({
          price: usagePricing.stripe_price_id,
          quantity: 0 // Usage will be reported separately
        })
      }
    }

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: subscriptionItems,
      billing_cycle_anchor: undefined,
      proration_behavior: 'create_prorations',
      metadata: {
        organization_id: organizationId,
        plan_id: planId
      }
    }

    // Add payment method if provided
    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId
    }

    const stripeSubscription = await this.stripe.subscriptions.create(subscriptionData)

    // Create local subscription record
    const subscription: Omit<Subscription, 'plan'> = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      plan_id: planId,
      stripe_subscription_id: stripeSubscription.id,
      status: stripeSubscription.status as any,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      trial_start: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : undefined,
      trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : undefined,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(subscription)
      .select(`
        *,
        plans (*)
      `)
      .single()

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    return data
  }

  /**
   * Report usage to Stripe for billing
   */
  async reportUsage(
    subscriptionId: string,
    usageRecords: Array<{
      subscription_item_id: string
      quantity: number
      timestamp?: number
      action?: 'increment' | 'set'
    }>
  ): Promise<void> {
    for (const record of usageRecords) {
      await this.stripe.subscriptionItems.createUsageRecord(
        record.subscription_item_id,
        {
          quantity: record.quantity,
          timestamp: record.timestamp || Math.floor(Date.now() / 1000),
          action: record.action || 'increment'
        }
      )
    }
  }

  /**
   * Create a payment method and attach to customer
   */
  async createPaymentMethod(
    organizationId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    // Get organization's Stripe customer ID
    const { data: organization } = await this.supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (!organization?.stripe_customer_id) {
      throw new Error('Organization does not have a Stripe customer')
    }

    // Attach payment method to customer
    const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: organization.stripe_customer_id
    })

    // Create local payment method record
    const localPaymentMethod: PaymentMethod = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      stripe_payment_method_id: paymentMethod.id,
      type: paymentMethod.type as 'card' | 'bank_account',
      brand: paymentMethod.card?.brand,
      last_four: paymentMethod.card?.last4 || '',
      exp_month: paymentMethod.card?.exp_month,
      exp_year: paymentMethod.card?.exp_year,
      is_default: false,
      created_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('payment_methods')
      .insert(localPaymentMethod)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save payment method: ${error.message}`)
    }

    return data
  }

  /**
   * Set default payment method for customer
   */
  async setDefaultPaymentMethod(organizationId: string, paymentMethodId: string): Promise<void> {
    // Get organization's Stripe customer ID
    const { data: organization } = await this.supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (!organization?.stripe_customer_id) {
      throw new Error('Organization does not have a Stripe customer')
    }

    // Get the Stripe payment method ID
    const { data: paymentMethod } = await this.supabase
      .from('payment_methods')
      .select('stripe_payment_method_id')
      .eq('id', paymentMethodId)
      .eq('organization_id', organizationId)
      .single()

    if (!paymentMethod) {
      throw new Error('Payment method not found')
    }

    // Update customer's default payment method in Stripe
    await this.stripe.customers.update(organization.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripe_payment_method_id
      }
    })

    // Update local records
    await this.supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('organization_id', organizationId)

    await this.supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately = false): Promise<void> {
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscriptionId)
      .single()

    if (!subscription?.stripe_subscription_id) {
      throw new Error('Subscription not found')
    }

    if (immediately) {
      await this.stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
    } else {
      await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      })

      await this.supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
    }
  }

  /**
   * Retry failed invoice payment
   */
  async retryInvoicePayment(invoiceId: string): Promise<void> {
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('stripe_invoice_id')
      .eq('id', invoiceId)
      .single()

    if (!invoice?.stripe_invoice_id) {
      throw new Error('Invoice not found')
    }

    await this.stripe.invoices.pay(invoice.stripe_invoice_id)
  }

  /**
   * Get upcoming invoice preview
   */
  async getUpcomingInvoice(organizationId: string): Promise<Stripe.Invoice | null> {
    const { data: organization } = await this.supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (!organization?.stripe_customer_id) {
      return null
    }

    try {
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({
        customer: organization.stripe_customer_id
      })
      return upcomingInvoice
    } catch (error) {
      // No upcoming invoice
      return null
    }
  }

  /**
   * Create invoice PDF download URL
   */
  async getInvoiceDownloadUrl(invoiceId: string): Promise<string> {
    const { data: invoice } = await this.supabase
      .from('invoices')
      .select('stripe_invoice_id')
      .eq('id', invoiceId)
      .single()

    if (!invoice?.stripe_invoice_id) {
      throw new Error('Invoice not found')
    }

    const stripeInvoice = await this.stripe.invoices.retrieve(invoice.stripe_invoice_id)
    
    if (!stripeInvoice.invoice_pdf) {
      throw new Error('Invoice PDF not available')
    }

    return stripeInvoice.invoice_pdf
  }

  /**
   * Webhook handler for Stripe events
   */
  async handleWebhook(body: string, signature: string): Promise<void> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
    
    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`)
    }

    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const organizationId = subscription.metadata.organization_id
    if (!organizationId) return

    await this.supabase
      .from('subscriptions')
      .update({
        status: subscription.status as any,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return

    await this.supabase
      .from('invoices')
      .update({
        status: 'paid',
        amount_paid: invoice.amount_paid,
        paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_invoice_id', invoice.id)
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    await this.supabase
      .from('invoices')
      .update({
        status: 'open',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_invoice_id', invoice.id)
  }
}