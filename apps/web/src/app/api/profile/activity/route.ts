import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const activityQuerySchema = z.object({
  action: z.string().optional(),
  status: z.enum(['success', 'failure', 'pending']).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const queryParams = {
      action: searchParams.get('action') || undefined,
      status: searchParams.get('status') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    }

    const { action, status, date_from, date_to, limit, offset } = activityQuerySchema.parse(queryParams)

    // Build query
    let query = supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (date_from) {
      query = query.gte('created_at', date_from)
    }
    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    const { data: activities, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activity' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_activity')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (action) countQuery = countQuery.eq('action', action)
    if (status) countQuery = countQuery.eq('status', status)
    if (date_from) countQuery = countQuery.gte('created_at', date_from)
    if (date_to) countQuery = countQuery.lte('created_at', date_to)

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          total: totalCount || 0,
          limit,
          offset,
          has_more: (totalCount || 0) > offset + limit
        }
      }
    })
  } catch (error) {
    console.error('Activity fetch error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}