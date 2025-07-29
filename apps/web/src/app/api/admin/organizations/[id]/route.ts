import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const organizationId = params.id

    // Fetch organization with detailed information
    const { data: organization, error: orgError } = await supabase
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
          users(id, name, email, avatar_url)
        )
      `)
      .eq('id', organizationId)
      .is('deleted_at', null)
      .single()

    if (orgError || !organization) {
      console.error('Error fetching organization:', orgError)
      return NextResponse.json(
        { error: 'Organization not found' }, 
        { status: 404 }
      )
    }

    // Find the owner
    const owner = organization.memberships?.find((m: any) => m.role === 'owner')
    
    // Transform data for admin interface
    const transformedOrg = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      status: 'active', // Derive from org data
      plan: 'pro', // Would come from subscription data
      member_count: organization.memberships?.length || 0,
      monthly_revenue: 0, // Would come from billing data
      storage_used: 0, // Would come from usage data
      storage_limit: 100, // Would come from plan data
      created_at: organization.created_at,
      updated_at: organization.updated_at,
      metadata: organization.metadata,
      owner: {
        id: owner?.users?.id || '',
        name: owner?.users?.name || '',
        email: owner?.users?.email || ''
      },
      members: organization.memberships?.map((m: any) => ({
        id: m.user_id,
        name: m.users?.name || '',
        email: m.users?.email || '',
        avatar_url: m.users?.avatar_url || null,
        role: m.role,
        joined_at: m.created_at
      })) || []
    }

    // Log admin action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'organization_viewed',
      target_type: 'organization',
      target_id: organizationId,
      action_details: { method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: transformedOrg,
      success: true
    })

  } catch (error) {
    console.error('Admin organization details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const organizationId = params.id
    const body = await request.json()

    // Handle special actions
    if (body.suspend) {
      // TODO: Implement organization suspension logic
      await supabase.rpc('log_system_admin_action', {
        admin_id: session.user.id,
        action_name: 'organization_suspended',
        target_type: 'organization',
        target_id: organizationId,
        action_details: { reason: body.reason },
        ip_addr: request.ip,
        user_agent_str: request.headers.get('user-agent')
      })

      return NextResponse.json({
        success: true,
        message: 'Organization suspended successfully'
      })
    }

    if (body.activate) {
      // TODO: Implement organization activation logic
      await supabase.rpc('log_system_admin_action', {
        admin_id: session.user.id,
        action_name: 'organization_activated',
        target_type: 'organization',
        target_id: organizationId,
        action_details: { method: 'admin_panel' },
        ip_addr: request.ip,
        user_agent_str: request.headers.get('user-agent')
      })

      return NextResponse.json({
        success: true,
        message: 'Organization activated successfully'
      })
    }

    // Handle regular updates
    const { name, slug, ...otherUpdates } = body
    const updates: any = {}
    
    if (name) updates.name = name
    if (slug) updates.slug = slug
    
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organizationId)

      if (updateError) {
        throw updateError
      }

      // Log admin action
      await supabase.rpc('log_system_admin_action', {
        admin_id: session.user.id,
        action_name: 'organization_updated',
        target_type: 'organization',
        target_id: organizationId,
        action_details: { 
          updated_fields: Object.keys(updates),
          changes: updates
        },
        ip_addr: request.ip,
        user_agent_str: request.headers.get('user-agent')
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully'
    })

  } catch (error) {
    console.error('Admin organization update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const organizationId = params.id

    // Soft delete the organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', organizationId)

    if (deleteError) {
      throw deleteError
    }

    // Log admin action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'organization_deleted',
      target_type: 'organization',
      target_id: organizationId,
      action_details: { method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully'
    })

  } catch (error) {
    console.error('Admin organization delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}