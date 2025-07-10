import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

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
    const { searchParams } = new URL(req.url)
    
    const searchQuery = searchParams.get('search') || undefined
    const department = searchParams.get('department') || undefined
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Use the database function to get member profiles
    const { data: profiles, error } = await supabase
      .rpc('get_organization_member_profiles', {
        p_organization_id: organizationId,
        p_requesting_user_id: session.user.id
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch organization directory' },
        { status: 500 }
      )
    }

    // Apply client-side filtering if search parameters are provided
    let filteredProfiles = profiles || []

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredProfiles = filteredProfiles.filter((profile: any) => 
        profile.display_name?.toLowerCase().includes(query) ||
        profile.title?.toLowerCase().includes(query) ||
        profile.department?.toLowerCase().includes(query) ||
        profile.bio?.toLowerCase().includes(query) ||
        profile.skills?.some((skill: string) => skill.toLowerCase().includes(query))
      )
    }

    if (department) {
      filteredProfiles = filteredProfiles.filter((profile: any) => 
        profile.department === department
      )
    }

    if (skills && skills.length > 0) {
      filteredProfiles = filteredProfiles.filter((profile: any) => 
        skills.every(skill => profile.skills?.includes(skill))
      )
    }

    // Apply pagination
    const paginatedProfiles = filteredProfiles.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      profiles: paginatedProfiles,
      total: filteredProfiles.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Organization directory error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}