import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
// TODO: Re-enable when services and middleware are properly exported from @/packages/auth
// import { sessionService } from '@/packages/auth/src/services/session-service'
// import { auditService } from '@/packages/auth/src/services/audit-service'
// import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

const revokeSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session ID').optional(),
  reason: z.string().optional().default('user_action'),
  revoke_all: z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  // TODO: Re-enable rate limiting when middleware is properly exported
  // const rateLimitResponse = await withRateLimit(
  //   async () => NextResponse.next(),
  //   rateLimiters.sessionManagement
  // )(req)

  // if (rateLimitResponse.status === 429) {
  //   return rateLimitResponse
  // }

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
    const includeRevoked = searchParams.get('include_revoked') === 'true'

    // Build query
    let query = supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('last_activity_at', { ascending: false })

    if (!includeRevoked) {
      query = query.is('revoked_at', null)
    }

    const { data: sessions, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sessions' },
        { status: 500 }
      )
    }

    // Enhance session data with current session marker
    const enhancedSessions = sessions?.map(s => ({
      ...s,
      is_current: s.session_token === session.access_token || s.id === session.user.id
    }))

    // TODO: Re-enable audit logging when service is properly exported
    // await auditService.logEvent({
    //   userId: session.user.id,
    //   action: 'sessions_viewed',
    //   resource: 'sessions',
    //   ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
    //   userAgent: req.headers.get('user-agent') || undefined,
    //   status: 'success',
    //   severity: 'low'
    // })

    return NextResponse.json({
      success: true,
      data: { sessions: enhancedSessions }
    })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  // TODO: Re-enable rate limiting when middleware is properly exported
  // const rateLimitResponse = await withRateLimit(
  //   async () => NextResponse.next(),
  //   rateLimiters.sessionManagement
  // )(req)

  // if (rateLimitResponse.status === 429) {
  //   return rateLimitResponse
  // }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { session_id, reason, revoke_all } = revokeSessionSchema.parse(body)

    if (!session_id && !revoke_all) {
      return NextResponse.json(
        { success: false, error: 'Either session_id or revoke_all must be provided' },
        { status: 400 }
      )
    }

    let revokedCount = 0
    let result

    if (revoke_all) {
      // Get current session ID to exclude it from bulk revocation
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_token', session.access_token)
        .single()

      const currentSessionId = currentSession?.id

      // Revoke all other sessions
      const { data: revokedSessions, error: bulkRevokeError } = await supabase
        .from('user_sessions')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_reason: reason,
          revoked_by_user_id: session.user.id,
        })
        .eq('user_id', session.user.id)
        .is('revoked_at', null)
        .neq('id', currentSessionId || '')
        .select('id, device_type, browser_name')

      if (bulkRevokeError) {
        return NextResponse.json(
          { success: false, error: 'Failed to revoke sessions' },
          { status: 500 }
        )
      }

      revokedCount = revokedSessions?.length || 0

      // TODO: Re-enable audit logging when service is properly exported
      // await auditService.logSecurityEvent({
      //   userId: session.user.id,
      //   action: 'sessions_bulk_revoked',
      //   resource: 'sessions',
      //   details: {
      //     revoked_count: revokedCount,
      //     reason,
      //     current_session_excluded: true
      //   },
      //   ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      //   userAgent: req.headers.get('user-agent') || undefined,
      //   status: 'success',
      //   severity: 'medium',
      //   eventType: 'authentication',
      //   riskLevel: 'medium'
      // })

      result = { success: true, revokedCount }

    } else if (session_id) {
      // Verify session ownership
      const { data: targetSession, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', session.user.id)
        .single()

      if (sessionError || !targetSession) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        )
      }

      if (targetSession.revoked_at) {
        return NextResponse.json(
          { success: false, error: 'Session already revoked' },
          { status: 400 }
        )
      }

      // Check if trying to revoke current session
      const isCurrentSession = targetSession.session_token === session.access_token

      if (isCurrentSession) {
        return NextResponse.json(
          { success: false, error: 'Cannot revoke current session' },
          { status: 400 }
        )
      }

      // Revoke specific session
      const { error: revokeError } = await supabase
        .from('user_sessions')
        .update({
          revoked_at: new Date().toISOString(),
          revoked_reason: reason,
          revoked_by_user_id: session.user.id,
        })
        .eq('id', session_id)

      if (revokeError) {
        return NextResponse.json(
          { success: false, error: 'Failed to revoke session' },
          { status: 500 }
        )
      }

      // TODO: Re-enable audit logging when service is properly exported
      // await auditService.logSecurityEvent({
      //   userId: session.user.id,
      //   action: 'session_revoked',
      //   resource: 'sessions',
      //   resourceId: session_id,
      //   details: {
      //     device_type: targetSession.device_type,
      //     browser: targetSession.browser_name,
      //     reason
      //   },
      //   ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      //   userAgent: req.headers.get('user-agent') || undefined,
      //   status: 'success',
      //   severity: 'medium',
      //   eventType: 'authentication',
      //   riskLevel: 'medium'
      // })

      revokedCount = 1
      result = { success: true }
    }

    return NextResponse.json({
      success: true,
      message: revoke_all 
        ? `Successfully revoked ${revokedCount} sessions` 
        : 'Session revoked successfully',
      revokedCount
    })
  } catch (error) {
    console.error('Session revocation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
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