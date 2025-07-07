import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = revokeSessionSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You must be logged in to revoke sessions',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }

    // Get the session to revoke
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Don't allow revoking the current session
    const currentSessionId = req.headers.get('x-session-id')
    if (sessionId === currentSessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot revoke the current session. Use logout instead.',
          code: 'CANNOT_REVOKE_CURRENT'
        },
        { status: 400 }
      )
    }

    // Revoke the session
    const { error: revokeError } = await supabase
      .from('sessions')
      .update({ 
        revoked_at: new Date().toISOString(),
        status: 'revoked' 
      })
      .eq('id', sessionId)

    if (revokeError) {
      console.error('Failed to revoke session:', revokeError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to revoke session',
          code: 'REVOCATION_FAILED'
        },
        { status: 500 }
      )
    }

    // Log the security event
    await supabase
      .from('auth_events')
      .insert({
        user_id: user.id,
        event_type: 'session_revoked',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          revoked_session_id: sessionId,
          device: session.device_info,
        },
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
      revokedSessionId: sessionId,
    })
  } catch (error) {
    console.error('Revoke session error:', error)

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
      { 
        success: false, 
        error: 'An error occurred while revoking the session' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to list user sessions
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You must be logged in to view sessions',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }

    // Get all active sessions for the user
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('last_active_at', { ascending: false })

    if (sessionsError) {
      console.error('Failed to fetch sessions:', sessionsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch sessions',
          code: 'FETCH_FAILED'
        },
        { status: 500 }
      )
    }

    // Format sessions for response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      device: session.device_info || 'Unknown Device',
      browser: session.browser || 'Unknown Browser',
      os: session.os || 'Unknown OS',
      ipAddress: session.ip_address,
      location: session.location || 'Unknown',
      lastActive: session.last_active_at,
      createdAt: session.created_at,
      isCurrent: session.id === req.headers.get('x-session-id'),
    }))

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      count: formattedSessions.length,
    })
  } catch (error) {
    console.error('Get sessions error:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while fetching sessions' 
      },
      { status: 500 }
    )
  }
}