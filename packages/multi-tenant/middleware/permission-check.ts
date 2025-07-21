import { NextRequest, NextResponse } from 'next/server'
import { TenantContext } from './tenant-context'

/**
 * Permission-based route protection
 */
export class PermissionMiddleware {
  /**
   * Check if request should be allowed based on method and permissions
   */
  static checkMethodPermissions(
    method: string,
    resourceType: string,
    permissions: string[]
  ): boolean {
    const methodPermissionMap: Record<string, string[]> = {
      GET: [`${resourceType}:read`, `${resourceType}:view`],
      POST: [`${resourceType}:create`, `${resourceType}:write`],
      PUT: [`${resourceType}:update`, `${resourceType}:write`],
      PATCH: [`${resourceType}:update`, `${resourceType}:write`],
      DELETE: [`${resourceType}:delete`, `${resourceType}:write`]
    }

    const requiredPermissions = methodPermissionMap[method] || []
    
    return requiredPermissions.some(permission =>
      this.hasPermission(permissions, permission)
    )
  }

  /**
   * Check if user has a specific permission
   */
  private static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Owner has all permissions
    if (userPermissions.includes('*')) {
      return true
    }

    // Exact match
    if (userPermissions.includes(requiredPermission)) {
      return true
    }

    // Check wildcard patterns
    const [resource, action] = requiredPermission.split(':')
    
    // Resource wildcard (e.g., workspace:* matches workspace:read)
    if (userPermissions.includes(`${resource}:*`)) {
      return true
    }

    // Action wildcard (e.g., *:read matches workspace:read)
    if (userPermissions.includes(`*:${action}`)) {
      return true
    }

    // Full wildcard patterns
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
   * Resource-specific permission middleware
   */
  static requireResourceAccess(resourceType: string) {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        const hasAccess = PermissionMiddleware.checkMethodPermissions(
          req.method,
          resourceType,
          context.permissions
        )

        if (!hasAccess) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: `Insufficient permissions for ${req.method} ${resourceType}`,
              required: `${resourceType}:${req.method.toLowerCase()}`
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Admin-only operations
   */
  static requireAdmin() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        if (!['owner', 'admin'].includes(context.role)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Admin privileges required'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Owner-only operations
   */
  static requireOwner() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        if (context.role !== 'owner') {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Owner privileges required'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Conditional permission check based on resource ownership
   */
  static requireResourceOwnership(
    getResourceOwnerId: (req: NextRequest) => Promise<string>
  ) {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        // Admins and owners can access any resource
        if (['owner', 'admin'].includes(context.role)) {
          return handler(req, context)
        }

        // Check if user owns the resource
        try {
          const resourceOwnerId = await getResourceOwnerId(req)
          
          if (resourceOwnerId !== context.userId) {
            return NextResponse.json(
              {
                error: 'Forbidden',
                message: 'Can only access your own resources'
              },
              { status: 403 }
            )
          }
        } catch (error) {
          return NextResponse.json(
            {
              error: 'Bad Request',
              message: 'Invalid resource identifier'
            },
            { status: 400 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Rate limiting per tenant
   */
  static rateLimitByTenant(
    requests: number,
    windowMs: number,
    skipSuccessful: boolean = false
  ) {
    const requestCounts = new Map<string, { count: number; resetTime: number }>()

    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        const key = `${context.organizationId}:${context.userId}`
        const now = Date.now()
        
        let bucket = requestCounts.get(key)
        
        if (!bucket || now > bucket.resetTime) {
          bucket = { count: 0, resetTime: now + windowMs }
        }

        bucket.count++
        requestCounts.set(key, bucket)

        if (bucket.count > requests) {
          return NextResponse.json(
            {
              error: 'Too Many Requests',
              message: 'Rate limit exceeded',
              retryAfter: Math.ceil((bucket.resetTime - now) / 1000)
            },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((bucket.resetTime - now) / 1000).toString()
              }
            }
          )
        }

        const response = await handler(req, context)

        // Only count failed requests if skipSuccessful is true
        if (skipSuccessful && response.status < 400) {
          bucket.count--
          requestCounts.set(key, bucket)
        }

        return response
      }
    }
  }

  /**
   * Workspace-specific permissions
   */
  static requireWorkspaceAccess(workspaceIdExtractor: (req: NextRequest) => string) {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        const workspaceId = workspaceIdExtractor(req)
        
        // Check if user has access to the workspace
        if (!PermissionMiddleware.hasPermission(context.permissions, 'workspace:view') &&
            !PermissionMiddleware.hasPermission(context.permissions, `workspace:${workspaceId}:view`)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'No access to this workspace'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Billing-specific permissions
   */
  static requireBillingAccess() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        if (!PermissionMiddleware.hasPermission(context.permissions, 'organization:manage_billing') &&
            !['owner', 'admin'].includes(context.role)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Billing management privileges required'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Member management permissions
   */
  static requireMemberManagement() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        if (!PermissionMiddleware.hasPermission(context.permissions, 'organization:manage_members') &&
            !['owner', 'admin'].includes(context.role)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Member management privileges required'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Audit log access permissions
   */
  static requireAuditAccess() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        if (!PermissionMiddleware.hasPermission(context.permissions, 'organization:view_audit_logs') &&
            !['owner', 'admin'].includes(context.role)) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Audit log access privileges required'
            },
            { status: 403 }
          )
        }

        return handler(req, context)
      }
    }
  }
}

/**
 * Convenience functions for common permission patterns
 */

export const requirePermission = (permission: string) =>
  PermissionMiddleware.requireResourceAccess(permission.split(':')[0])

export const requireRole = (roles: string | string[]) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles]
  
  return function(
    handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context: TenantContext) => {
      if (!requiredRoles.includes(context.role)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: `Required role: ${requiredRoles.join(' or ')}`
          },
          { status: 403 }
        )
      }

      return handler(req, context)
    }
  }
}

export const requireAdmin = PermissionMiddleware.requireAdmin
export const requireOwner = PermissionMiddleware.requireOwner
export const requireBilling = PermissionMiddleware.requireBillingAccess
export const requireMemberManagement = PermissionMiddleware.requireMemberManagement
export const requireAuditAccess = PermissionMiddleware.requireAuditAccess
export const rateLimitByTenant = PermissionMiddleware.rateLimitByTenant