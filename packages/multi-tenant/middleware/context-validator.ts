import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TenantContext } from './tenant-context'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  context?: TenantContext
}

/**
 * Comprehensive server-side context validation
 */
export class ContextValidator {
  /**
   * Validate complete tenant context
   */
  static async validateTenantContext(
    userId: string,
    organizationId: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 1. Validate user exists and is active
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
      
      if (userError || !user.user) {
        errors.push('Invalid or non-existent user')
        return { isValid: false, errors, warnings }
      }

      if (user.user.banned_until) {
        errors.push('User account is banned')
        return { isValid: false, errors, warnings }
      }

      if (!user.user.email_confirmed_at) {
        warnings.push('User email is not confirmed')
      }

      // 2. Validate organization exists
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, status, deleted_at')
        .eq('id', organizationId)
        .single()

      if (orgError || !organization) {
        errors.push('Invalid or non-existent organization')
        return { isValid: false, errors, warnings }
      }

      if (organization.deleted_at) {
        errors.push('Organization has been deleted')
        return { isValid: false, errors, warnings }
      }

      if (organization.status !== 'active') {
        errors.push(`Organization is ${organization.status}`)
        return { isValid: false, errors, warnings }
      }

      // 3. Validate user membership in organization
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role, status, permissions')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single()

      if (membershipError || !membership) {
        errors.push('User is not a member of this organization')
        return { isValid: false, errors, warnings }
      }

      if (membership.status !== 'active') {
        errors.push(`Membership is ${membership.status}`)
        return { isValid: false, errors, warnings }
      }

      // 4. Get user permissions
      const { data: permissions, error: permissionError } = await supabase
        .rpc('get_user_permissions', {
          p_user_id: userId,
          p_organization_id: organizationId
        })

      if (permissionError) {
        warnings.push('Could not load user permissions')
      }

      // 5. Validate billing status (for paid features)
      const { data: billing } = await supabase
        .from('organization_billing')
        .select('payment_status, next_billing_date')
        .eq('organization_id', organizationId)
        .single()

      if (billing?.payment_status === 'past_due') {
        warnings.push('Organization billing is past due')
      }

      // 6. Check for any security issues
      const securityIssues = await this.checkSecurityIssues(userId, organizationId)
      warnings.push(...securityIssues)

      const context: TenantContext = {
        organizationId,
        userId,
        role: membership.role,
        permissions: permissions || []
      }

      return {
        isValid: true,
        errors,
        warnings,
        context
      }
    } catch (error) {
      console.error('Context validation error:', error)
      errors.push('Context validation failed')
      return { isValid: false, errors, warnings }
    }
  }

  /**
   * Validate workspace access within organization context
   */
  static async validateWorkspaceAccess(
    context: TenantContext,
    workspaceId: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check workspace exists in organization
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('id, name, is_archived, deleted_at')
        .eq('id', workspaceId)
        .eq('organization_id', context.organizationId)
        .single()

      if (error || !workspace) {
        errors.push('Workspace not found or access denied')
        return { isValid: false, errors, warnings }
      }

      if (workspace.deleted_at) {
        errors.push('Workspace has been deleted')
        return { isValid: false, errors, warnings }
      }

      if (workspace.is_archived) {
        warnings.push('Workspace is archived')
      }

      // Check workspace-specific membership
      const { data: workspaceMembership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', context.userId)
        .single()

      // User needs either organization admin role OR workspace membership
      if (!['owner', 'admin'].includes(context.role) && !workspaceMembership) {
        errors.push('No access to this workspace')
        return { isValid: false, errors, warnings }
      }

      return { isValid: true, errors, warnings }
    } catch (error) {
      console.error('Workspace access validation error:', error)
      errors.push('Workspace access validation failed')
      return { isValid: false, errors, warnings }
    }
  }

  /**
   * Validate project access within workspace context
   */
  static async validateProjectAccess(
    context: TenantContext,
    projectId: string,
    workspaceId?: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check project exists in organization
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, workspace_id, organization_id')
        .eq('id', projectId)
        .eq('organization_id', context.organizationId)
        .single()

      if (error || !project) {
        errors.push('Project not found or access denied')
        return { isValid: false, errors, warnings }
      }

      // Validate workspace context if provided
      if (workspaceId && project.workspace_id !== workspaceId) {
        errors.push('Project does not belong to specified workspace')
        return { isValid: false, errors, warnings }
      }

      // Validate workspace access
      if (project.workspace_id) {
        const workspaceValidation = await this.validateWorkspaceAccess(
          context,
          project.workspace_id
        )
        
        if (!workspaceValidation.isValid) {
          errors.push(...workspaceValidation.errors)
          return { isValid: false, errors, warnings }
        }
        
        warnings.push(...workspaceValidation.warnings)
      }

      return { isValid: true, errors, warnings }
    } catch (error) {
      console.error('Project access validation error:', error)
      errors.push('Project access validation failed')
      return { isValid: false, errors, warnings }
    }
  }

  /**
   * Validate API key access and scoping
   */
  static async validateApiKeyAccess(
    apiKey: string,
    organizationId: string,
    requiredPermissions?: string[]
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Hash the API key to match stored hash
      const keyHash = await this.hashApiKey(apiKey)
      
      const { data: apiKeyRecord, error } = await supabase
        .from('api_keys')
        .select('id, organization_id, workspace_id, permissions, expires_at, revoked_at')
        .eq('key_hash', keyHash)
        .single()

      if (error || !apiKeyRecord) {
        errors.push('Invalid API key')
        return { isValid: false, errors, warnings }
      }

      if (apiKeyRecord.revoked_at) {
        errors.push('API key has been revoked')
        return { isValid: false, errors, warnings }
      }

      if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
        errors.push('API key has expired')
        return { isValid: false, errors, warnings }
      }

      if (apiKeyRecord.organization_id !== organizationId) {
        errors.push('API key does not have access to this organization')
        return { isValid: false, errors, warnings }
      }

      // Check required permissions
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          apiKeyRecord.permissions.includes(permission) ||
          apiKeyRecord.permissions.includes('*')
        )

        if (!hasAllPermissions) {
          errors.push('API key lacks required permissions')
          return { isValid: false, errors, warnings }
        }
      }

      // Update last used timestamp
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKeyRecord.id)

      return { isValid: true, errors, warnings }
    } catch (error) {
      console.error('API key validation error:', error)
      errors.push('API key validation failed')
      return { isValid: false, errors, warnings }
    }
  }

  /**
   * Check for security issues
   */
  private static async checkSecurityIssues(
    userId: string,
    organizationId: string
  ): Promise<string[]> {
    const warnings: string[] = []

    try {
      // Check for recent failed login attempts
      const { data: failedLogins } = await supabase
        .from('audit_logs')
        .select('created_at')
        .eq('organization_id', organizationId)
        .eq('actor_id', userId)
        .eq('action', 'failed_login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (failedLogins && failedLogins.length > 5) {
        warnings.push('Multiple failed login attempts detected')
      }

      // Check for suspicious IP activity
      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('ip_address, created_at')
        .eq('organization_id', organizationId)
        .eq('actor_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(10)

      if (recentActivity && recentActivity.length > 0) {
        const uniqueIPs = new Set(recentActivity.map(a => a.ip_address).filter(Boolean))
        if (uniqueIPs.size > 3) {
          warnings.push('Activity from multiple IP addresses detected')
        }
      }

      // Check for permission escalation attempts
      const { data: permissionDenials } = await supabase
        .from('audit_logs')
        .select('action')
        .eq('organization_id', organizationId)
        .eq('actor_id', userId)
        .eq('result', 'failure')
        .ilike('error_message', '%permission%')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

      if (permissionDenials && permissionDenials.length > 10) {
        warnings.push('Multiple permission denial attempts detected')
      }
    } catch (error) {
      console.error('Security check error:', error)
      warnings.push('Could not complete security checks')
    }

    return warnings
  }

  /**
   * Hash API key for secure storage comparison
   */
  private static async hashApiKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate rate limiting compliance
   */
  static async validateRateLimit(
    context: TenantContext,
    resourceType: string,
    operation: string
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Get usage quotas for organization
      const { data: quotas } = await supabase
        .from('usage_quotas')
        .select('resource_type, limit_value, current_value, period')
        .eq('organization_id', context.organizationId)
        .eq('resource_type', resourceType)

      if (quotas && quotas.length > 0) {
        const quota = quotas[0]
        const usagePercentage = (quota.current_value / quota.limit_value) * 100

        if (quota.current_value >= quota.limit_value) {
          errors.push(`${resourceType} quota exceeded (${quota.current_value}/${quota.limit_value})`)
          return { isValid: false, errors, warnings }
        }

        if (usagePercentage >= 90) {
          warnings.push(`${resourceType} quota is at ${usagePercentage.toFixed(0)}% capacity`)
        } else if (usagePercentage >= 75) {
          warnings.push(`${resourceType} quota is at ${usagePercentage.toFixed(0)}% capacity`)
        }
      }

      return { isValid: true, errors, warnings }
    } catch (error) {
      console.error('Rate limit validation error:', error)
      warnings.push('Could not validate rate limits')
      return { isValid: true, errors, warnings } // Don't block on rate limit check errors
    }
  }
}

/**
 * Middleware wrapper for context validation
 */
export function withContextValidation(
  handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: TenantContext) => {
    // Perform full context validation
    const validation = await ContextValidator.validateTenantContext(
      context.userId,
      context.organizationId
    )

    if (!validation.isValid) {
      console.error('Context validation failed:', validation.errors)
      return NextResponse.json(
        {
          error: 'Invalid request context',
          details: validation.errors
        },
        { status: 403 }
      )
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Context validation warnings:', validation.warnings)
      
      // Add warnings to response headers for debugging
      const response = await handler(req, context)
      response.headers.set('X-Context-Warnings', validation.warnings.join('; '))
      return response
    }

    return handler(req, context)
  }
}

/**
 * Enhanced context validation with resource-specific checks
 */
export function withResourceValidation(
  resourceType: 'workspace' | 'project',
  getResourceId: (req: NextRequest) => string
) {
  return function(
    handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
  ) {
    return withContextValidation(async (req: NextRequest, context: TenantContext) => {
      const resourceId = getResourceId(req)
      
      let validation: ValidationResult
      
      if (resourceType === 'workspace') {
        validation = await ContextValidator.validateWorkspaceAccess(context, resourceId)
      } else {
        validation = await ContextValidator.validateProjectAccess(context, resourceId)
      }

      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: `Invalid ${resourceType} access`,
            details: validation.errors
          },
          { status: 403 }
        )
      }

      return handler(req, context)
    })
  }
}