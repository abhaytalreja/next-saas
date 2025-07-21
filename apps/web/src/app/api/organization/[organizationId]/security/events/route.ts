import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/organization/[organizationId]/security/events - List security events
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization access
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', params.organizationId)
      .eq('user_id', session.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('type')
    const severity = searchParams.get('severity')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('security_events')
      .select(`
        *,
        profiles!user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('organization_id', params.organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching security events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch security events' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', params.organizationId)

    if (eventType) countQuery = countQuery.eq('event_type', eventType)
    if (severity) countQuery = countQuery.eq('severity', severity)
    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count } = await countQuery

    return NextResponse.json({
      events: events || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('GET /api/organization/[organizationId]/security/events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organization/[organizationId]/security/events - Create security event (for testing/manual logging)
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization access
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', params.organizationId)
      .eq('user_id', session.user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      event_type,
      severity = 'medium',
      description,
      metadata = {},
      target_user_id,
    } = body

    // Validate required fields
    if (!event_type || !description) {
      return NextResponse.json(
        { error: 'event_type and description are required' },
        { status: 400 }
      )
    }

    // Validate event_type
    const validEventTypes = [
      'login_attempt',
      'mfa_challenge', 
      'ip_blocked',
      'policy_violation',
      'suspicious_activity',
      'manual_event'
    ]
    
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event_type' },
        { status: 400 }
      )
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical']
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent')

    // Create security event
    const { data: event, error } = await supabase
      .from('security_events')
      .insert({
        organization_id: params.organizationId,
        user_id: target_user_id || session.user.id,
        event_type,
        severity,
        description,
        metadata: {
          ...metadata,
          created_by: session.user.id,
          manual_entry: true,
        },
        ip_address: clientIP,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating security event:', error)
      return NextResponse.json(
        { error: 'Failed to create security event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('POST /api/organization/[organizationId]/security/events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (xRealIP) return xRealIP
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
  
  return request.ip || '127.0.0.1'
}