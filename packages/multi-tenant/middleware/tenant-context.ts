import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface TenantContext {
  organizationId: string
  userId: string
  role: string
  permissions: string[]
}

/**
 * Middleware to enforce tenant context on API requests
 */
export function withTenantContext<T extends any[]>(
  handler: (req: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T) => {
    try {
      // Extract tenant context from request
      const tenantContext = await extractTenantContext(req)
      
      if (!tenantContext) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid tenant context' },
          { status: 401 }
        )
      }

      // Set RLS context in Supabase
      await setRLSContext(tenantContext)

      // Add tenant context to request headers for downstream use
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-tenant-org-id', tenantContext.organizationId)
      requestHeaders.set('x-tenant-user-id', tenantContext.userId)
      requestHeaders.set('x-tenant-role', tenantContext.role)

      // Call the actual handler with tenant context
      const response = await handler(req, tenantContext, ...args)

      // Add security headers to response
      addSecurityHeaders(response)

      return response
    } catch (error) {
      console.error('Tenant context middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Extract tenant context from request
 */
async function extractTenantContext(req: NextRequest): Promise<TenantContext | null> {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return null
    }

    // Extract organization ID from request path or headers
    const orgId = extractOrganizationId(req)
    if (!orgId) {
      return null
    }

    // Get user's membership and permissions for this organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        role,
        status,
        organization:organizations!inner(id, name)
      `)
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership) {
      return null
    }

    // Get user permissions using the database function
    const { data: permissions, error: permError } = await supabase
      .rpc('get_user_permissions', {
        p_user_id: user.id,
        p_organization_id: orgId
      })

    if (permError) {
      console.error('Error fetching permissions:', permError)
      return null
    }

    return {
      organizationId: orgId,
      userId: user.id,
      role: membership.role,
      permissions: permissions || []
    }
  } catch (error) {
    console.error('Error extracting tenant context:', error)
    return null
  }
}

/**
 * Extract organization ID from request
 */
function extractOrganizationId(req: NextRequest): string | null {
  // Check URL path parameters
  const urlParts = req.nextUrl.pathname.split('/')
  const orgIndex = urlParts.findIndex(part => part === 'organization')
  
  if (orgIndex !== -1 && urlParts[orgIndex + 1]) {
    return urlParts[orgIndex + 1]
  }

  // Check for organizationId in URL path
  const orgIdIndex = urlParts.findIndex(part => part === 'organizations')
  if (orgIdIndex !== -1 && urlParts[orgIdIndex + 1]) {
    return urlParts[orgIdIndex + 1]
  }

  // Check query parameters
  const orgId = req.nextUrl.searchParams.get('organizationId') || 
                req.nextUrl.searchParams.get('orgId')
  if (orgId) {
    return orgId
  }

  // Check headers
  const headerOrgId = req.headers.get('x-organization-id')
  if (headerOrgId) {
    return headerOrgId
  }

  return null
}

/**
 * Set RLS context in Supabase
 */
async function setRLSContext(context: TenantContext): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Set context variables for RLS policies
  await supabase.rpc('set_current_tenant_context', {
    p_user_id: context.userId,
    p_organization_id: context.organizationId,
    p_role: context.role
  })
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add tenant isolation header
  response.headers.set('X-Tenant-Isolation', 'enforced')
}

/**
 * Permission checking middleware
 */
export function requirePermission(permission: string) {
  return function <T extends any[]>(
    handler: (req: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>
  ) {
    return withTenantContext(async (req: NextRequest, context: TenantContext, ...args: T) => {
      // Check if user has required permission
      if (!hasPermission(context.permissions, permission)) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Missing required permission: ${permission}`
          },
          { status: 403 }
        )
      }

      return handler(req, context, ...args)
    })
  }
}

/**
 * Role checking middleware
 */
export function requireRole(roles: string | string[]) {
  const requiredRoles = Array.isArray(roles) ? roles : [roles]
  
  return function <T extends any[]>(
    handler: (req: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>
  ) {
    return withTenantContext(async (req: NextRequest, context: TenantContext, ...args: T) => {
      // Check if user has required role
      if (!requiredRoles.includes(context.role)) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Missing required role. Need one of: ${requiredRoles.join(', ')}`
          },
          { status: 403 }
        )
      }

      return handler(req, context, ...args)
    })
  }
}

/**
 * Check if user has a specific permission
 */
function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Owner has all permissions
  if (userPermissions.includes('*')) {
    return true
  }

  // Exact match
  if (userPermissions.includes(requiredPermission)) {
    return true
  }

  // Check wildcard patterns
  return userPermissions.some(permission => {
    if (permission.includes('*')) {
      const pattern = permission.replace(/\*/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(requiredPermission)
    }
    return false
  })
}

/**
 * Audit logging middleware
 */
export function withAuditLog(action: string, resourceType: string) {
  return function <T extends any[]>(
    handler: (req: NextRequest, context: TenantContext, ...args: T) => Promise<NextResponse>
  ) {
    return withTenantContext(async (req: NextRequest, context: TenantContext, ...args: T) => {
      const startTime = Date.now()
      let result = 'success'
      let error: string | undefined

      try {
        const response = await handler(req, context, ...args)
        
        // Log successful action
        await logAuditEvent({
          organizationId: context.organizationId,
          actorId: context.userId,
          action,
          resourceType,
          result,
          metadata: {
            method: req.method,
            url: req.url,
            duration: Date.now() - startTime,
            userAgent: req.headers.get('user-agent'),
            ipAddress: getClientIP(req)
          }
        })

        return response
      } catch (err) {
        result = 'failure'
        error = err instanceof Error ? err.message : 'Unknown error'
        
        // Log failed action
        await logAuditEvent({
          organizationId: context.organizationId,
          actorId: context.userId,
          action,
          resourceType,
          result,
          errorMessage: error,
          metadata: {
            method: req.method,
            url: req.url,
            duration: Date.now() - startTime,
            userAgent: req.headers.get('user-agent'),
            ipAddress: getClientIP(req)
          }
        })

        throw err
      }
    })
  }
}

/**
 * Log audit event
 */
async function logAuditEvent(event: {
  organizationId: string
  actorId: string
  action: string
  resourceType: string
  result: string
  errorMessage?: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('audit_logs').insert({
      organization_id: event.organizationId,
      actor_id: event.actorId,
      actor_type: 'user',
      action: event.action,
      resource_type: event.resourceType,
      result: event.result,
      error_message: event.errorMessage,
      metadata: event.metadata,
      ip_address: event.metadata?.ipAddress,
      user_agent: event.metadata?.userAgent
    })
  } catch (error) {
    // Don't throw audit logging errors
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Get client IP address
 */
function getClientIP(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const remoteIP = req.headers.get('x-remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteIP || null
}