import { NextRequest, NextResponse } from 'next/server'

// Mock service for testing
class MockSubscriptionService {
  async updateSubscription(subscriptionId: string, options: any) {
    return {
      id: subscriptionId,
      status: 'active',
      current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      ...options
    }
  }
}

const subscriptionService = new MockSubscriptionService()

export async function GET(request: NextRequest) {
  try {
    // This would typically get the current user's organization from auth context
    // For testing purposes, we'll return mock data or handle test scenarios
    
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organization_id')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Mock subscription data for testing
    const subscription = {
      id: 'sub_test_subscription',
      status: 'active',
      plan_id: 'price_starter',
      organization_id: organizationId
    }

    return NextResponse.json({
      organization_id: organizationId,
      subscription: subscription || null
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { subscription_id, new_price_id, proration_behavior } = await request.json()

    if (!subscription_id || !new_price_id) {
      return NextResponse.json(
        { error: 'Missing required fields: subscription_id and new_price_id' },
        { status: 400 }
      )
    }

    // Update subscription
    const updatedSubscription = await subscriptionService.updateSubscription(
      subscription_id,
      {
        price_id: new_price_id,
        proration_behavior: proration_behavior || 'always_invoice'
      }
    )

    return NextResponse.json({
      subscription: updatedSubscription
    })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}