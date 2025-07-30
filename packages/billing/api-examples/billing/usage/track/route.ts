import { NextRequest, NextResponse } from 'next/server'
import { UsageTracker } from '@nextsaas/billing/usage'

const usageTracker = new UsageTracker()

export async function POST(request: NextRequest) {
  try {
    const {
      organization_id,
      feature,
      quantity = 1,
      metadata
    } = await request.json()

    // Validate required fields
    if (!organization_id || !feature) {
      return NextResponse.json(
        { error: 'Missing organization_id or feature' },
        { status: 400 }
      )
    }

    // Track usage
    await usageTracker.trackUsage({
      organization_id,
      feature,
      quantity,
      metadata
    })

    // Get updated usage metrics
    const metrics = await usageTracker.getUsageMetrics(organization_id)
    const updatedMetric = metrics.find(m => m.feature === feature)

    return NextResponse.json({
      success: true,
      usage: updatedMetric
    })
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organization_id = searchParams.get('organization_id')
    const feature = searchParams.get('feature')

    if (!organization_id) {
      return NextResponse.json(
        { error: 'Missing organization_id' },
        { status: 400 }
      )
    }

    if (feature) {
      // Get usage for specific feature
      const usage = await usageTracker.getCurrentUsage(organization_id, feature)
      return NextResponse.json({ usage })
    } else {
      // Get all usage metrics for organization
      const metrics = await usageTracker.getUsageMetrics(organization_id)
      return NextResponse.json({ metrics })
    }
  } catch (error) {
    console.error('Usage retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve usage' },
      { status: 500 }
    )
  }
}