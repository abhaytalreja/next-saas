import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const securityPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  policy_type: z.enum(['ip_whitelist', 'mfa_enforcement', 'session_timeout', 'password_policy']),
  configuration: z.record(z.any()),
  is_active: z.boolean().default(true),
})

// GET /api/organization/[organizationId]/security/policies - List security policies
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
    const policyType = searchParams.get('type')
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase
      .from('security_policies')
      .select('*')
      .eq('organization_id', params.organizationId)
      .order('created_at', { ascending: false })

    if (policyType) {
      query = query.eq('policy_type', policyType)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: policies, error } = await query

    if (error) {
      console.error('Error fetching security policies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch security policies' },
        { status: 500 }
      )
    }

    return NextResponse.json({ policies: policies || [] })
  } catch (error) {
    console.error('GET /api/organization/[organizationId]/security/policies error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organization/[organizationId]/security/policies - Create security policy
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = securityPolicySchema.parse(body)

    // Validate configuration based on policy type
    const configValidationResult = validatePolicyConfiguration(
      validatedData.policy_type,
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

    // Create security policy
    const { data: policy, error } = await supabase
      .from('security_policies')
      .insert({
        organization_id: params.organizationId,
        name: validatedData.name,
        description: validatedData.description,
        policy_type: validatedData.policy_type,
        configuration: validatedData.configuration,
        is_active: validatedData.is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating security policy:', error)
      return NextResponse.json(
        { error: 'Failed to create security policy' },
        { status: 500 }
      )
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      p_organization_id: params.organizationId,
      p_user_id: session.user.id,
      p_event_type: 'security_policy_created',
      p_severity: 'medium',
      p_description: `Security policy created: ${validatedData.name} (${validatedData.policy_type})`,
      p_metadata: { policy_id: policy.id, policy_type: validatedData.policy_type },
    })

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/organization/[organizationId]/security/policies error:', error)
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