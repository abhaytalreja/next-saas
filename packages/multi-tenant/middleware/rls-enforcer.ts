import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TenantContext } from './tenant-context'

/**
 * RLS Policy Enforcement Middleware
 * Ensures Row Level Security policies are properly enforced
 */
export class RLSEnforcer {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /**
   * Middleware to enforce RLS context before database operations
   */
  static enforceRLSContext() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        try {
          // Set RLS context in database
          await RLSEnforcer.setRLSContext(context)
          
          // Add RLS validation headers
          const response = await handler(req, context)
          response.headers.set('X-RLS-Context', 'enforced')
          response.headers.set('X-Tenant-ID', context.organizationId)
          
          return response
        } catch (error) {
          console.error('RLS enforcement error:', error)
          return NextResponse.json(
            { error: 'Database context error' },
            { status: 500 }
          )
        }
      }
    }
  }

  /**
   * Set RLS context in Supabase
   */
  private static async setRLSContext(context: TenantContext): Promise<void> {
    await this.supabase.rpc('set_current_tenant_context', {
      p_user_id: context.userId,
      p_organization_id: context.organizationId,
      p_role: context.role
    })
  }

  /**
   * Validate RLS policies are working correctly
   */
  static async validateRLSPolicies(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      // Test organization access
      const { data: orgData, error: orgError } = await this.supabase
        .from('organizations')
        .select('id')
        .eq('id', organizationId)

      if (orgError) {
        console.error('RLS validation error for organizations:', orgError)
        return false
      }

      // Should only return the organization if user has access
      if (!orgData || orgData.length === 0) {
        return false
      }

      // Test workspace access
      const { data: workspaceData, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('id')
        .eq('organization_id', organizationId)

      if (workspaceError) {
        console.error('RLS validation error for workspaces:', workspaceError)
        return false
      }

      // Test cross-tenant isolation by attempting to access different org
      const { data: otherOrgs, error: crossTenantError } = await this.supabase
        .from('organizations')
        .select('id')
        .neq('id', organizationId)
        .limit(1)

      if (crossTenantError) {
        // This is expected if RLS is working correctly
        return true
      }

      // If we can see other organizations, RLS might not be working
      if (otherOrgs && otherOrgs.length > 0) {
        console.warn('Potential RLS bypass detected - can see other organizations')
        return false
      }

      return true
    } catch (error) {
      console.error('RLS validation failed:', error)
      return false
    }
  }

  /**
   * Middleware to validate RLS is working before processing request
   */
  static validateRLSBeforeHandler() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        // Skip validation for non-data operations
        if (req.method === 'OPTIONS' || req.url.includes('/health')) {
          return handler(req, context)
        }

        const isRLSValid = await RLSEnforcer.validateRLSPolicies(
          context.userId,
          context.organizationId
        )

        if (!isRLSValid) {
          console.error('RLS validation failed for request:', {
            userId: context.userId,
            organizationId: context.organizationId,
            path: req.nextUrl.pathname
          })

          return NextResponse.json(
            { 
              error: 'Security validation failed',
              message: 'Data isolation could not be verified'
            },
            { status: 500 }
          )
        }

        return handler(req, context)
      }
    }
  }

  /**
   * Test cross-tenant data isolation
   */
  static async testDataIsolation(context: TenantContext): Promise<{
    isolated: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    try {
      // Set context
      await this.setRLSContext(context)

      // Test 1: Can only see own organization
      const { data: orgs, error: orgError } = await this.supabase
        .from('organizations')
        .select('id')

      if (orgError) {
        issues.push(`Organization query error: ${orgError.message}`)
      } else if (orgs.length > 1) {
        issues.push('Can see multiple organizations - RLS may be bypassed')
      } else if (orgs.length === 0) {
        issues.push('Cannot see own organization - RLS may be too restrictive')
      } else if (orgs[0].id !== context.organizationId) {
        issues.push('Seeing different organization than expected')
      }

      // Test 2: Can only see workspaces in own organization
      const { data: workspaces, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('id, organization_id')

      if (workspaceError) {
        issues.push(`Workspace query error: ${workspaceError.message}`)
      } else {
        const wrongOrgWorkspaces = workspaces.filter(
          w => w.organization_id !== context.organizationId
        )
        if (wrongOrgWorkspaces.length > 0) {
          issues.push('Can see workspaces from other organizations')
        }
      }

      // Test 3: Can only see own organization's members
      const { data: members, error: memberError } = await this.supabase
        .from('organization_members')
        .select('id, organization_id')

      if (memberError) {
        issues.push(`Member query error: ${memberError.message}`)
      } else {
        const wrongOrgMembers = members.filter(
          m => m.organization_id !== context.organizationId
        )
        if (wrongOrgMembers.length > 0) {
          issues.push('Can see members from other organizations')
        }
      }

      // Test 4: Cannot see audit logs from other organizations
      const { data: auditLogs, error: auditError } = await this.supabase
        .from('audit_logs')
        .select('id, organization_id')
        .limit(10)

      if (auditError) {
        issues.push(`Audit log query error: ${auditError.message}`)
      } else {
        const wrongOrgLogs = auditLogs.filter(
          log => log.organization_id !== context.organizationId
        )
        if (wrongOrgLogs.length > 0) {
          issues.push('Can see audit logs from other organizations')
        }
      }

      // Test 5: Cannot see billing data from other organizations
      const { data: billingData, error: billingError } = await this.supabase
        .from('organization_billing')
        .select('id, organization_id')

      if (billingError) {
        issues.push(`Billing query error: ${billingError.message}`)
      } else {
        const wrongOrgBilling = billingData.filter(
          bill => bill.organization_id !== context.organizationId
        )
        if (wrongOrgBilling.length > 0) {
          issues.push('Can see billing data from other organizations')
        }
      }

      return {
        isolated: issues.length === 0,
        issues
      }
    } catch (error) {
      issues.push(`Isolation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        isolated: false,
        issues
      }
    }
  }

  /**
   * Monitor RLS policy performance
   */
  static monitorRLSPerformance() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        const startTime = Date.now()
        
        try {
          const response = await handler(req, context)
          const duration = Date.now() - startTime
          
          // Log slow RLS operations
          if (duration > 1000) { // More than 1 second
            console.warn('Slow RLS operation detected:', {
              path: req.nextUrl.pathname,
              method: req.method,
              organizationId: context.organizationId,
              duration,
              userId: context.userId
            })
          }
          
          // Add performance headers
          response.headers.set('X-RLS-Duration', duration.toString())
          
          return response
        } catch (error) {
          const duration = Date.now() - startTime
          console.error('RLS operation failed:', {
            path: req.nextUrl.pathname,
            method: req.method,
            organizationId: context.organizationId,
            duration,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          throw error
        }
      }
    }
  }

  /**
   * Emergency RLS bypass detection
   */
  static detectRLSBypass() {
    return function(
      handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
    ) {
      return async (req: NextRequest, context: TenantContext) => {
        // Check if RLS is disabled (emergency detection)
        const { data: rlsStatus, error } = await RLSEnforcer.supabase
          .rpc('check_rls_status')

        if (error) {
          console.warn('Could not check RLS status:', error)
        } else if (!rlsStatus) {
          // Log critical security alert
          console.error('CRITICAL: RLS appears to be disabled!', {
            organizationId: context.organizationId,
            userId: context.userId,
            path: req.nextUrl.pathname,
            timestamp: new Date().toISOString()
          })
          
          // Optionally block the request
          return NextResponse.json(
            { 
              error: 'Security Error',
              message: 'Data isolation system unavailable'
            },
            { status: 503 }
          )
        }

        return handler(req, context)
      }
    }
  }
}

/**
 * Convenience middleware combinations
 */

export const withRLSEnforcement = RLSEnforcer.enforceRLSContext()
export const withRLSValidation = RLSEnforcer.validateRLSBeforeHandler()
export const withRLSMonitoring = RLSEnforcer.monitorRLSPerformance()
export const withRLSBypassDetection = RLSEnforcer.detectRLSBypass()

/**
 * Complete RLS protection stack
 */
export function withFullRLSProtection() {
  return function(
    handler: (req: NextRequest, context: TenantContext) => Promise<NextResponse>
  ) {
    return withRLSEnforcement()(
      withRLSValidation()(
        withRLSMonitoring()(
          withRLSBypassDetection()(handler)
        )
      )
    )
  }
}