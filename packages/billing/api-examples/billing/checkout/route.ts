import { NextRequest, NextResponse } from 'next/server'
import { CheckoutService, CustomerService } from '@nextsaas/billing/stripe'
import { getSupabaseAdminClient } from '@nextsaas/supabase'

const checkoutService = new CheckoutService()
const customerService = new CustomerService()
const supabase = getSupabaseAdminClient()

export async function POST(request: NextRequest) {
  try {
    const {
      organization_id,
      price_id,
      success_url,
      cancel_url,
      trial_period_days,
      allow_promotion_codes = true,
      automatic_tax = true
    } = await request.json()

    // Validate required fields
    if (!organization_id || !price_id || !success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, email')
      .eq('id', organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Ensure Stripe customer exists
    const customer = await customerService.ensureStripeCustomer(
      organization_id,
      organization.email,
      organization.name,
      {
        organization_id: organization_id,
        organization_name: organization.name
      }
    )

    // Create checkout session
    const session = await checkoutService.createSubscriptionCheckout(
      price_id,
      customer.id,
      {
        success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url,
        trial_period_days,
        metadata: {
          organization_id: organization_id,
          organization_name: organization.name
        },
        allow_promotion_codes,
        automatic_tax
      }
    )

    // Store customer record if it doesn't exist
    await supabase
      .from('billing_customers')
      .upsert({
        organization_id,
        stripe_customer_id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata
      })

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id
    })
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}