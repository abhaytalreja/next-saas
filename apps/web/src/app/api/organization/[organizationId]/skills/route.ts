import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
// TODO: Re-enable when middleware is properly exported from @/packages/auth
// import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  // TODO: Re-enable rate limiting when middleware is properly exported
  // const rateLimitResponse = await withRateLimit(
  //   async () => NextResponse.next(),
  //   rateLimiters.api
  // )(req)

  // if (rateLimitResponse.status === 429) {
  //   return rateLimitResponse
  // }

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

    // Get skills using the database function
    const { data: skills, error } = await supabase
      .rpc('get_organization_skills', {
        p_organization_id: organizationId
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch skills' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      skills: skills || []
    })

  } catch (error) {
    console.error('Organization skills error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}