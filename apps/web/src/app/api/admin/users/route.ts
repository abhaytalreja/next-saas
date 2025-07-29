import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is system admin
    const isAdmin = await isUserSystemAdmin(session.user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        is_system_admin,
        last_seen_at,
        created_at,
        updated_at,
        email_verified_at,
        memberships!inner(
          id,
          role,
          created_at,
          organization_id,
          organizations(id, name)
        )
      `, { count: 'exact' })
      .is('deleted_at', null)

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply status filter (would need to derive status from user data)
    if (status) {
      // Add status filtering logic based on your business rules
    }

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit - 1
    
    const { data: users, error: usersError, count } = await query
      .range(start, end)
      .order(sort, { ascending: order === 'asc' })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' }, 
        { status: 500 }
      )
    }

    // Transform data for admin interface
    const transformedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.email_verified_at ? 'active' : 'pending', // Derive status
      is_system_admin: user.is_system_admin,
      organizations: user.memberships?.map((membership: any) => ({
        id: membership.organization_id,
        name: membership.organizations?.name || '',
        role: membership.role,
        joined_at: membership.created_at
      })) || [],
      last_seen_at: user.last_seen_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_verified_at: user.email_verified_at,
      login_count: 0, // Would come from session analytics
      last_ip: null // Would come from session data
    })) || []

    // Log admin action (disable until migration is applied)
    // await supabase.rpc('log_system_admin_action', {
    //   admin_id: session.user.id,
    //   action_name: 'users_list_viewed',
    //   target_type: 'users',
    //   action_details: { 
    //     page,
    //     limit,
    //     search: search || undefined,
    //     total_results: count
    //   },
    //   ip_addr: request.ip,
    //   user_agent_str: request.headers.get('user-agent')
    // })

    return NextResponse.json({
      data: transformedUsers,
      success: true,
      metadata: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is system admin
    const isAdmin = await isUserSystemAdmin(session.user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, send_invitation = true } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Note: User creation via admin API should use proper invitation system
    // This is a placeholder - in production, use proper user invitation flow
    return NextResponse.json(
      { error: 'User invitation system not implemented - use proper invitation flow' }, 
      { status: 501 }
    )

  } catch (error) {
    console.error('Admin create user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}