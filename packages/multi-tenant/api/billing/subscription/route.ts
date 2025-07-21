import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../../middleware/tenant-context'
import { requireBilling } from '../../../middleware/permission-check'
import { withAuditLog } from '../../../middleware/tenant-context'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const subscriptionChangeSchema = z.object({
  plan_id: z.string().min(1),
  billing_interval: z.enum(['monthly', 'yearly']).optional()
})

// GET /api/billing/subscription - Get current subscription
export const GET = withTenantContext(
  requireBilling()(
    async (req: NextRequest, context) => {
      try {
        // Mock subscription data - replace with actual Stripe integration
        const subscription = {
          id: 'sub_mock123',
          status: 'active',
          plan: {
            id: 'price_pro',
            name: 'Pro Plan',
            price: 29.99,
            currency: 'usd',
            interval: 'monthly' as const,
            features: [
              'Up to 50 projects',
              '10GB storage',
              'Priority support',
              'Advanced analytics'
            ]
          },
          current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: null,
          cancel_at_period_end: false,
          customer_id: 'cus_mock123'
        }

        return NextResponse.json({ subscription })
      } catch (error) {
        console.error('Subscription fetch error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  )
)

// POST /api/billing/subscription - Change subscription plan
export const POST = withTenantContext(
  requireBilling()(
    withAuditLog('change_subscription', 'billing')(
      async (req: NextRequest, context) => {
        try {
          const body = await req.json()
          const { plan_id, billing_interval = 'monthly' } = subscriptionChangeSchema.parse(body)

          // Get available plans
          const plans = [
            {
              id: 'price_free',
              name: 'Free',
              price: 0,
              currency: 'usd',
              interval: billing_interval,
              features: ['Up to 3 projects', '1GB storage', 'Basic support']
            },
            {
              id: 'price_starter',
              name: 'Starter',
              price: billing_interval === 'yearly' ? 99.99 : 9.99,
              currency: 'usd',
              interval: billing_interval,
              features: ['Up to 10 projects', '5GB storage', 'Email support']
            },
            {
              id: 'price_pro',
              name: 'Pro',
              price: billing_interval === 'yearly' ? 299.99 : 29.99,
              currency: 'usd',
              interval: billing_interval,
              features: ['Up to 50 projects', '10GB storage', 'Priority support']
            },
            {
              id: 'price_enterprise',
              name: 'Enterprise',
              price: billing_interval === 'yearly' ? 999.99 : 99.99,
              currency: 'usd',
              interval: billing_interval,
              features: ['Unlimited projects', '100GB storage', 'Dedicated support']
            }
          ]

          const selectedPlan = plans.find(p => p.id === plan_id)
          if (!selectedPlan) {
            return NextResponse.json(
              { error: 'Invalid plan selected' },
              { status: 400 }
            )
          }

          // Mock Stripe subscription update
          // In real implementation, you would:
          // 1. Get customer from Stripe using organization_billing.stripe_customer_id
          // 2. Update subscription with new price
          // 3. Handle proration and immediate charges
          
          await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

          // Update quotas based on new plan
          const quotaUpdates = [
            { 
              resource_type: 'projects',
              limit_value: selectedPlan.id === 'price_free' ? 3 :
                          selectedPlan.id === 'price_starter' ? 10 :
                          selectedPlan.id === 'price_pro' ? 50 : -1
            },
            {
              resource_type: 'storage_gb',
              limit_value: selectedPlan.id === 'price_free' ? 1 :
                          selectedPlan.id === 'price_starter' ? 5 :
                          selectedPlan.id === 'price_pro' ? 10 : 100
            },
            {
              resource_type: 'api_calls',
              limit_value: selectedPlan.id === 'price_free' ? 1000 :
                          selectedPlan.id === 'price_starter' ? 10000 :
                          selectedPlan.id === 'price_pro' ? 100000 : -1
            },
            {
              resource_type: 'team_members',
              limit_value: selectedPlan.id === 'price_free' ? 3 :
                          selectedPlan.id === 'price_starter' ? 5 :
                          selectedPlan.id === 'price_pro' ? 25 : -1
            }
          ]

          // Update quotas in database
          for (const quota of quotaUpdates) {
            await supabase
              .from('usage_quotas')
              .upsert({
                organization_id: context.organizationId,
                ...quota,
                period: 'monthly',
                updated_at: new Date().toISOString()
              }, { onConflict: 'organization_id,resource_type' })
          }

          const updatedSubscription = {
            id: 'sub_mock123',
            status: 'active',
            plan: selectedPlan,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (billing_interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            trial_end: null,
            cancel_at_period_end: false
          }

          return NextResponse.json({
            subscription: updatedSubscription,
            message: `Subscription changed to ${selectedPlan.name} successfully`
          })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Invalid request data', details: error.errors },
              { status: 400 }
            )
          }

          console.error('Subscription change error:', error)
          return NextResponse.json(
            { error: 'Failed to change subscription' },
            { status: 500 }
          )
        }
      }
    )
  )
)

// DELETE /api/billing/subscription - Cancel subscription
export const DELETE = withTenantContext(
  requireBilling()(
    withAuditLog('cancel_subscription', 'billing')(
      async (req: NextRequest, context) => {
        try {
          // Mock subscription cancellation
          // In real implementation:
          // 1. Cancel Stripe subscription at period end
          // 2. Update billing record
          // 3. Send cancellation confirmation email
          
          await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

          const cancelledSubscription = {
            id: 'sub_mock123',
            status: 'active', // Still active until period end
            plan: {
              id: 'price_pro',
              name: 'Pro Plan',
              price: 29.99,
              currency: 'usd',
              interval: 'monthly' as const,
              features: []
            },
            current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            trial_end: null,
            cancel_at_period_end: true,
            cancelled_at: new Date().toISOString()
          }

          return NextResponse.json({
            subscription: cancelledSubscription,
            message: 'Subscription will be cancelled at the end of the current period'
          })
        } catch (error) {
          console.error('Subscription cancellation error:', error)
          return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
          )
        }
      }
    )
  )
)