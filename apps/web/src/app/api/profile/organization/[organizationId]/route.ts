import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { auditService } from '@/packages/auth/src/services/audit-service'
import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

const organizationProfileSchema = z.object({
  user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  display_name: z.string().min(1).max(100),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  start_date: z.string().optional(),
  visibility: z.enum(['public', 'organization', 'private']),
  skills: z.array(z.string()).optional(),
  pronouns: z.string().max(20).optional(),
  status: z.string().max(100).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { organizationId } = params

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, role, status')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this organization' },
        { status: 403 }
      )
    }

    // Get organization profile
    const { data: profile, error } = await supabase
      .from('organization_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return NextResponse.json(
        { success: false, error: 'Failed to fetch organization profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: profile || null
    })

  } catch (error) {
    console.error('Organization profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { organizationId } = params
    const body = await req.json()

    // Validate request data
    const validationResult = organizationProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          field_errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const profileData = validationResult.data

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, role, status')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this organization' },
        { status: 403 }
      )
    }

    // Verify user can only create profile for themselves
    if (profileData.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Can only create profile for yourself' },
        { status: 403 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('organization_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Organization profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    // Create organization profile
    const { data: profile, error } = await supabase
      .from('organization_profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create organization profile' },
        { status: 500 }
      )
    }

    // Log the activity
    await auditService.logUserActivity({
      userId: session.user.id,
      action: 'organization_profile_created',
      resource: 'organization_profile',
      resourceId: profile.id,
      details: {
        organization_id: organizationId,
        display_name: profileData.display_name,
        visibility: profileData.visibility
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      profile,
      message: 'Organization profile created successfully'
    })

  } catch (error) {
    console.error('Organization profile creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { organizationId } = params
    const body = await req.json()

    // Validate request data
    const validationResult = organizationProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          field_errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const profileData = validationResult.data

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, role, status')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this organization' },
        { status: 403 }
      )
    }

    // Verify user can only update their own profile
    if (profileData.user_id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Can only update your own profile' },
        { status: 403 }
      )
    }

    // Update organization profile
    const { data: profile, error } = await supabase
      .from('organization_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update organization profile' },
        { status: 500 }
      )
    }

    // Log the activity
    await auditService.logUserActivity({
      userId: session.user.id,
      action: 'organization_profile_updated',
      resource: 'organization_profile',
      resourceId: profile.id,
      details: {
        organization_id: organizationId,
        display_name: profileData.display_name,
        visibility: profileData.visibility
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      profile,
      message: 'Organization profile updated successfully'
    })

  } catch (error) {
    console.error('Organization profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { organizationId } = params

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, role, status')
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this organization' },
        { status: 403 }
      )
    }

    // Delete organization profile
    const { error } = await supabase
      .from('organization_profiles')
      .delete()
      .eq('user_id', session.user.id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete organization profile' },
        { status: 500 }
      )
    }

    // Log the activity
    await auditService.logUserActivity({
      userId: session.user.id,
      action: 'organization_profile_deleted',
      resource: 'organization_profile',
      details: {
        organization_id: organizationId
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      message: 'Organization profile deleted successfully'
    })

  } catch (error) {
    console.error('Organization profile deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}