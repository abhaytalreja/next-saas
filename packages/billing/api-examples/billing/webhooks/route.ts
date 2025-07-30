import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { WebhookHandler } from '@nextsaas/billing/stripe'
import { getSupabaseAdminClient } from '@nextsaas/supabase'

const webhookHandler = new WebhookHandler()
const supabase = getSupabaseAdminClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Construct and verify the event
    const event = webhookHandler.constructEvent(body, signature)

    // Process the webhook with handlers
    await webhookHandler.processEvent(event, {
      'customer.subscription.created': async (subscription) => {
        const organizationId = webhookHandler.extractOrganizationId(subscription)
        
        if (organizationId) {
          // Create or update subscription record
          await supabase
            .from('subscriptions')
            .upsert({
              organization_id: organizationId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer,
              status: subscription.status,
              billing_cycle: subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              metadata: subscription.metadata
            })

          console.log(`Subscription created for organization ${organizationId}`)
        }
      },

      'customer.subscription.updated': async (subscription) => {
        const organizationId = webhookHandler.extractOrganizationId(subscription)
        
        if (organizationId) {
          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              metadata: subscription.metadata,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          console.log(`Subscription updated for organization ${organizationId}`)
        }
      },

      'customer.subscription.deleted': async (subscription) => {
        // Mark subscription as deleted
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Subscription deleted: ${subscription.id}`)
      },

      'invoice.payment_succeeded': async (invoice) => {
        const subscriptionId = invoice.subscription
        
        if (subscriptionId) {
          // Update subscription status to active if it was past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId)
            .eq('status', 'past_due')

          console.log(`Payment succeeded for subscription: ${subscriptionId}`)
        }
      },

      'invoice.payment_failed': async (invoice) => {
        const subscriptionId = invoice.subscription
        
        if (subscriptionId) {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId)

          console.log(`Payment failed for subscription: ${subscriptionId}`)
        }
      },

      'customer.created': async (customer) => {
        const organizationId = customer.metadata.organization_id
        
        if (organizationId) {
          // Create billing customer record
          await supabase
            .from('billing_customers')
            .upsert({
              organization_id: organizationId,
              stripe_customer_id: customer.id,
              email: customer.email,
              name: customer.name,
              metadata: customer.metadata
            })

          console.log(`Customer created for organization ${organizationId}`)
        }
      },

      'customer.updated': async (customer) => {
        // Update customer record
        await supabase
          .from('billing_customers')
          .update({
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customer.id)

        console.log(`Customer updated: ${customer.id}`)
      },

      'customer.deleted': async (customer) => {
        // Mark customer as deleted
        await supabase
          .from('billing_customers')
          .delete()
          .eq('stripe_customer_id', customer.id)

        console.log(`Customer deleted: ${customer.id}`)
      }
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}