import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../middleware/tenant-context'
import { requireBilling } from '../../middleware/permission-check'
import { withAuditLog } from '../../middleware/tenant-context'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/billing - Get organization billing information
export const GET = withTenantContext(
  requireBilling()(
    withAuditLog('view_billing', 'billing')(
      async (req: NextRequest, context) => {
        try {
          // Get billing information
          const { data: billing, error: billingError } = await supabase
            .from('organization_billing')
            .select('*')
            .eq('organization_id', context.organizationId)
            .single()

          if (billingError && billingError.code !== 'PGRST116') {
            console.error('Failed to fetch billing:', billingError)
            return NextResponse.json(
              { error: 'Failed to fetch billing information' },
              { status: 500 }
            )
          }

          // Get current subscription from Stripe or mock data
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
            cancel_at_period_end: false
          }

          // Get usage metrics
          const { data: quotas, error: quotasError } = await supabase
            .from('usage_quotas')
            .select('*')
            .eq('organization_id', context.organizationId)

          if (quotasError) {
            console.error('Failed to fetch quotas:', quotasError)
          }

          // Calculate current usage
          const usage = {
            period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            period_end: new Date().toISOString(),
            projects: { used: 12, limit: 50 },
            storage: { used: 3.2, limit: 10, unit: 'GB' },
            api_calls: { used: 15420, limit: 100000 },
            team_members: { used: 8, limit: 25 }
          }

          return NextResponse.json({
            billing: billing || null,
            subscription,
            usage,
            quotas: quotas || []
          })
        } catch (error) {
          console.error('Billing fetch error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)

// POST /api/billing - Update billing information
export const POST = withTenantContext(
  requireBilling()(
    withAuditLog('update_billing', 'billing')(
      async (req: NextRequest, context) => {
        try {
          const body = await req.json()
          const { billing_email, billing_name, billing_address, tax_id } = body

          const billingData = {
            organization_id: context.organizationId,
            billing_email,
            billing_name,
            billing_address,
            tax_id,
            updated_at: new Date().toISOString()
          }

          // Upsert billing information
          const { data: billing, error } = await supabase
            .from('organization_billing')
            .upsert(billingData, { 
              onConflict: 'organization_id' 
            })
            .select()
            .single()

          if (error) {
            console.error('Failed to update billing:', error)
            return NextResponse.json(
              { error: 'Failed to update billing information' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            billing,
            message: 'Billing information updated successfully'
          })
        } catch (error) {
          console.error('Billing update error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)