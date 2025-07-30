import { NextRequest, NextResponse } from 'next/server'
import { CheckoutService } from '@nextsaas/billing/stripe'

const checkoutService = new CheckoutService()

export async function POST(request: NextRequest) {
  try {
    const { customer_id, return_url } = await request.json()

    // Validate required fields
    if (!customer_id || !return_url) {
      return NextResponse.json(
        { error: 'Missing customer_id or return_url' },
        { status: 400 }
      )
    }

    // Create portal session
    const portalSession = await checkoutService.createPortalSession(
      customer_id,
      return_url
    )

    return NextResponse.json({
      url: portalSession.url
    })
  } catch (error) {
    console.error('Portal session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}