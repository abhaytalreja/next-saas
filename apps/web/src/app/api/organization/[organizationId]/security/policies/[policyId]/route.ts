import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const updateSecurityPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required').optional(),
  description: z.string().optional(),
  configuration: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
})

// GET /api/organization/[organizationId]/security/policies/[policyId] - Get specific security policy
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string; policyId: string } }
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

    // Fetch security policy
    const { data: policy, error } = await supabase
      .from('security_policies')
      .select('*')
      .eq('id', params.policyId)
      .eq('organization_id', params.organizationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Security policy not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching security policy:', error)
      return NextResponse.json(
        { error: 'Failed to fetch security policy' },
        { status: 500 }
      )
    }

    return NextResponse.json({ policy })
  } catch (error) {
    console.error('GET /api/organization/[organizationId]/security/policies/[policyId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/organization/[organizationId]/security/policies/[policyId] - Update security policy
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string; policyId: string } }
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateSecurityPolicySchema.parse(body)

    // Get existing policy
    const { data: existingPolicy, error: fetchError } = await supabase
      .from('security_policies')
      .select('*')
      .eq('id', params.policyId)
      .eq('organization_id', params.organizationId)
      .single()

    if (fetchError || !existingPolicy) {
      return NextResponse.json(
        { error: 'Security policy not found' },
        { status: 404 }
      )
    }

    // Validate configuration if provided
    if (validatedData.configuration) {
      const configValidationResult = validatePolicyConfiguration(
        existingPolicy.policy_type,
        validatedData.configuration
      )

      if (!configValidationResult.valid) {
        return NextResponse.json(
          { 
            error: 'Invalid policy configuration',
            details: configValidationResult.errors,
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description
    }
    if (validatedData.configuration !== undefined) {
      updateData.configuration = validatedData.configuration
    }
    if (validatedData.is_active !== undefined) {
      updateData.is_active = validatedData.is_active
    }

    // Update security policy
    const { data: policy, error } = await supabase
      .from('security_policies')
      .update(updateData)
      .eq('id', params.policyId)
      .eq('organization_id', params.organizationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating security policy:', error)
      return NextResponse.json(
        { error: 'Failed to update security policy' },
        { status: 500 }
      )
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      p_organization_id: params.organizationId,
      p_user_id: session.user.id,
      p_event_type: 'security_policy_updated',
      p_severity: 'medium',
      p_description: `Security policy updated: ${policy.name} (${policy.policy_type})`,
      p_metadata: { 
        policy_id: policy.id,
        policy_type: policy.policy_type,
        changes: Object.keys(validatedData),
      },
    })

    return NextResponse.json({ policy })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PUT /api/organization/[organizationId]/security/policies/[policyId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/organization/[organizationId]/security/policies/[policyId] - Delete security policy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string; policyId: string } }
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

    // Get policy details before deletion for logging
    const { data: policy } = await supabase
      .from('security_policies')
      .select('name, policy_type')
      .eq('id', params.policyId)
      .eq('organization_id', params.organizationId)
      .single()

    // Delete security policy
    const { error } = await supabase
      .from('security_policies')
      .delete()
      .eq('id', params.policyId)
      .eq('organization_id', params.organizationId)

    if (error) {
      console.error('Error deleting security policy:', error)
      return NextResponse.json(
        { error: 'Failed to delete security policy' },
        { status: 500 }
      )
    }

    // Log security event
    if (policy) {
      await supabase.rpc('log_security_event', {
        p_organization_id: params.organizationId,
        p_user_id: session.user.id,
        p_event_type: 'security_policy_deleted',
        p_severity: 'high',
        p_description: `Security policy deleted: ${policy.name} (${policy.policy_type})`,
        p_metadata: { 
          policy_id: params.policyId,
          policy_type: policy.policy_type,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/organization/[organizationId]/security/policies/[policyId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to validate policy configuration
function validatePolicyConfiguration(
  policyType: string,
  configuration: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (policyType) {
    case 'ip_whitelist':
      if (!configuration.allowed_ips || !Array.isArray(configuration.allowed_ips)) {
        errors.push('IP whitelist policy requires allowed_ips array')
      } else if (configuration.allowed_ips.length === 0) {
        errors.push('IP whitelist policy requires at least one IP address')
      }
      break

    case 'mfa_enforcement':
      if (typeof configuration.require_mfa !== 'boolean') {
        errors.push('MFA policy requires require_mfa boolean field')
      }
      if (configuration.mfa_methods && !Array.isArray(configuration.mfa_methods)) {
        errors.push('MFA policy mfa_methods must be an array')
      }
      if (configuration.mfa_grace_period_hours && 
          (typeof configuration.mfa_grace_period_hours !== 'number' || 
           configuration.mfa_grace_period_hours < 0 || 
           configuration.mfa_grace_period_hours > 168)) {
        errors.push('MFA grace period must be between 0 and 168 hours')
      }
      break

    case 'session_timeout':
      if (configuration.idle_timeout_minutes && 
          (typeof configuration.idle_timeout_minutes !== 'number' || 
           configuration.idle_timeout_minutes < 1 || 
           configuration.idle_timeout_minutes > 1440)) {
        errors.push('Idle timeout must be between 1 and 1440 minutes')
      }
      if (configuration.absolute_timeout_hours && 
          (typeof configuration.absolute_timeout_hours !== 'number' || 
           configuration.absolute_timeout_hours < 1 || 
           configuration.absolute_timeout_hours > 168)) {
        errors.push('Absolute timeout must be between 1 and 168 hours')
      }
      break

    case 'password_policy':
      if (configuration.min_length && 
          (typeof configuration.min_length !== 'number' || 
           configuration.min_length < 6 || 
           configuration.min_length > 128)) {
        errors.push('Minimum password length must be between 6 and 128 characters')
      }
      if (configuration.prevent_reuse_count && 
          (typeof configuration.prevent_reuse_count !== 'number' || 
           configuration.prevent_reuse_count < 0 || 
           configuration.prevent_reuse_count > 24)) {
        errors.push('Password reuse prevention count must be between 0 and 24')
      }
      break

    default:
      errors.push(`Unknown policy type: ${policyType}`)
  }

  return { valid: errors.length === 0, errors }
}