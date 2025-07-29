import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { isUserSystemAdmin, ADMIN_PERMISSIONS } from '@nextsaas/auth/middleware/admin-middleware'

/**
 * Admin API middleware for consistent authentication and authorization
 * Ensures all admin API endpoints have proper security checks
 */
export async function adminAPIMiddleware(
  request: NextRequest,
  requiredPermissions: string[] = []
): Promise<{ 
  success: boolean
  session?: any
  supabase?: any
  error?: string
  status?: number
}> {
  try {
    const supabase = getSupabaseServerClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return {
        success: false,
        error: 'Unauthorized - No valid session',
        status: 401
      }
    }

    // Check if user is system admin
    const isAdmin = await isUserSystemAdmin(session.user.id, supabase)
    if (!isAdmin) {
      // Log unauthorized access attempt
      console.warn(`Unauthorized admin API access attempt by user ${session.user.id} to ${request.url}`)
      
      // Log security event
      try {
        await supabase.rpc('log_system_admin_action', {
          admin_id: session.user.id,
          action_name: 'unauthorized_admin_access_attempt',
          target_type: 'admin_api',
          action_details: { 
            endpoint: request.url,
            method: request.method,
            user_agent: request.headers.get('user-agent') || 'unknown',
            ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
          },
          ip_addr: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          user_agent_str: request.headers.get('user-agent') || 'unknown'
        })
      } catch (logError) {
        console.error('Failed to log security event:', logError)
      }
      
      return {
        success: false,
        error: 'Forbidden - System admin privileges required',
        status: 403
      }
    }

    // If specific permissions are required, check them
    if (requiredPermissions.length > 0) {
      const { data: adminData } = await supabase
        .from('system_admins')
        .select('permissions')
        .eq('user_id', session.user.id)
        .is('revoked_at', null)
        .single()

      const userPermissions = adminData?.permissions || []
      const hasRequiredPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      )

      if (!hasRequiredPermissions) {
        console.warn(`Admin user ${session.user.id} lacks required permissions: ${requiredPermissions.join(', ')}`)
        return {
          success: false,
          error: 'Forbidden - Insufficient permissions',
          status: 403
        }
      }
    }

    return {
      success: true,
      session,
      supabase
    }

  } catch (error) {
    console.error('Admin API middleware error:', error)
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    }
  }
}

/**
 * Wrapper function to apply admin middleware to API routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: { session: any; supabase: any }) => Promise<NextResponse>,
  requiredPermissions: string[] = []
) {
  return async function wrappedHandler(request: NextRequest) {
    const authResult = await adminAPIMiddleware(request, requiredPermissions)
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 500 }
      )
    }

    // Call the original handler with authenticated context
    return handler(request, {
      session: authResult.session!,
      supabase: authResult.supabase!
    })
  }
}

/**
 * Rate limiting for admin API endpoints
 */
const adminAPIRateLimit = new Map<string, { count: number; resetTime: number }>()

export function adminRateLimit(request: NextRequest, maxRequests = 100, windowMs = 60000): boolean {
  const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  const clientData = adminAPIRateLimit.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    adminAPIRateLimit.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (clientData.count >= maxRequests) {
    return false
  }
  
  clientData.count++
  return true
}

/**
 * Log admin API access for audit purposes
 */
export async function logAdminAPIAccess(
  supabase: any,
  session: any,
  request: NextRequest,
  action: string,
  targetType?: string,
  targetId?: string,
  details: Record<string, any> = {}
) {
  try {
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: action,
      target_type: targetType,
      target_id: targetId,
      action_details: {
        ...details,
        endpoint: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      },
      ip_addr: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      user_agent_str: request.headers.get('user-agent') || 'unknown'
    })
  } catch (error) {
    console.error('Failed to log admin API access:', error)
  }
}