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
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        created_at,
        updated_at,
        metadata,
        memberships!inner(
          id,
          role,
          user_id,
          created_at,
          users(id, name, email)
        )
      `, { count: 'exact' })
      .is('deleted_at', null)

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Apply pagination
    const start = (page - 1) * limit
    const end = start + limit - 1
    
    const { data: organizations, error: orgsError, count } = await query
      .range(start, end)
      .order(sort, { ascending: order === 'asc' })

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' }, 
        { status: 500 }
      )
    }

    // Transform data for admin interface
    const transformedOrgs = organizations?.map(org => {
      const owner = org.memberships?.find((m: any) => m.role === 'owner')
      
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: 'active', // Derive from org data
        plan: 'pro', // Would come from subscription data
        member_count: org.memberships?.length || 0,
        monthly_revenue: 0, // Would come from billing data
        storage_used: 0, // Would come from usage data
        storage_limit: 100, // Would come from plan data
        created_at: org.created_at,
        updated_at: org.updated_at,
        metadata: org.metadata,
        owner: {
          id: owner?.users?.id || '',
          name: owner?.users?.name || '',
          email: owner?.users?.email || ''
        },
        members: org.memberships?.map((m: any) => ({
          id: m.user_id,
          name: m.users?.name || '',
          email: m.users?.email || '',
          role: m.role,
          joined_at: m.created_at
        })) || []
      }
    }) || []

    // Log admin action (disable until migration is applied)
    // await supabase.rpc('log_system_admin_action', {
    //   admin_id: session.user.id,
    //   action_name: 'organizations_list_viewed',
    //   target_type: 'organizations',
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
      data: transformedOrgs,
      success: true,
      metadata: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin organizations API error:', error)
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
    const { name, slug, owner_email } = body

    if (!name || !slug || !owner_email) {
      return NextResponse.json(
        { error: 'Name, slug, and owner email are required' }, 
        { status: 400 }
      )
    }

    // Check if slug is available
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug already exists' }, 
        { status: 400 }
      )
    }

    // Find or create owner user
    let { data: owner } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', owner_email)
      .single()

    if (!owner) {
      // For security, don't create users via admin API directly
      // Instead, send invitation or require existing user
      return NextResponse.json(
        { error: 'Owner user does not exist. Please use the user invitation system first.' }, 
        { status: 400 }
      )
    }

    // Create organization
    const { data: newOrg, error: createOrgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        metadata: { created_by_admin: session.user.id }
      })
      .select()
      .single()

    if (createOrgError) {
      return NextResponse.json(
        { error: 'Failed to create organization' }, 
        { status: 500 }
      )
    }

    // Add owner membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: owner.id,
        organization_id: newOrg.id,
        role: 'owner',
        accepted_at: new Date().toISOString()
      })

    if (membershipError) {
      // Rollback organization creation
      await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrg.id)

      return NextResponse.json(
        { error: 'Failed to create organization membership' }, 
        { status: 500 }
      )
    }

    // Log admin action (disable until migration is applied)
    // await supabase.rpc('log_system_admin_action', {
    //   admin_id: session.user.id,
    //   action_name: 'organization_created',
    //   target_type: 'organization',
    //   target_id: newOrg.id,
    //   action_details: { 
    //     name,
    //     slug,
    //     owner_email,
    //     method: 'admin_panel'
    //   },
    //   ip_addr: request.ip,
    //   user_agent_str: request.headers.get('user-agent')
    // })

    return NextResponse.json({
      data: newOrg,
      success: true,
      message: 'Organization created successfully'
    })

  } catch (error) {
    console.error('Admin create organization API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}