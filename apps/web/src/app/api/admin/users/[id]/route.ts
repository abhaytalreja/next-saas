import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const userId = params.id

    // Get user details with organizations and activity
    const { data: user, error: userError } = await supabase
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
        timezone,
        locale,
        metadata,
        memberships(
          id,
          role,
          created_at,
          accepted_at,
          organization_id,
          organizations(id, name, slug)
        )
      `)
      .eq('id', userId)
      .is('deleted_at', null)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent activity for this user
    const { data: activity, error: activityError } = await supabase
      .from('audit_logs')
      .select('id, action, resource_type, created_at, details')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get session information (if available)
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('id, ip_address, user_agent, created_at, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Transform data
    const transformedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.email_verified_at ? 'active' : 'pending',
      is_system_admin: user.is_system_admin,
      last_seen_at: user.last_seen_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_verified_at: user.email_verified_at,
      timezone: user.timezone,
      locale: user.locale,
      metadata: user.metadata,
      organizations: user.memberships?.map((membership: any) => ({
        id: membership.organization_id,
        name: membership.organizations?.name || '',
        slug: membership.organizations?.slug || '',
        role: membership.role,
        joined_at: membership.created_at,
        accepted_at: membership.accepted_at
      })) || [],
      recent_activity: activity || [],
      active_sessions: sessions || []
    }

    // Log admin action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'user_details_viewed',
      target_type: 'user',
      target_id: userId,
      action_details: { method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      data: transformedUser,
      success: true
    })

  } catch (error) {
    console.error('Admin user details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const userId = params.id
    const body = await request.json()
    const { name, email, is_system_admin, suspend, activate } = body

    // Handle suspension/activation
    if (suspend) {
      // Suspend user (disable their account)
      const { error: suspendError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: '87600h' } // 10 years ban
      )

      if (suspendError) {
        return NextResponse.json(
          { error: 'Failed to suspend user' }, 
          { status: 500 }
        )
      }

      // Log admin action
      await supabase.rpc('log_system_admin_action', {
        admin_id: session.user.id,
        action_name: 'user_suspended',
        target_type: 'user',
        target_id: userId,
        action_details: { method: 'admin_panel', reason: body.reason },
        ip_addr: request.ip,
        user_agent_str: request.headers.get('user-agent')
      })

      return NextResponse.json({
        success: true,
        message: 'User suspended successfully'
      })
    }

    if (activate) {
      // Activate user (remove ban)
      const { error: activateError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: 'none' }
      )

      if (activateError) {
        return NextResponse.json(
          { error: 'Failed to activate user' }, 
          { status: 500 }
        )
      }

      // Log admin action
      await supabase.rpc('log_system_admin_action', {
        admin_id: session.user.id,
        action_name: 'user_activated',
        target_type: 'user',
        target_id: userId,
        action_details: { method: 'admin_panel' },
        ip_addr: request.ip,
        user_agent_str: request.headers.get('user-agent')
      })

      return NextResponse.json({
        success: true,
        message: 'User activated successfully'
      })
    }

    // Regular user update
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email

    // Update user in auth
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        updateData
      )

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update user' }, 
          { status: 500 }
        )
      }
    }

    // Update system admin status if provided
    if (is_system_admin !== undefined) {
      const { error: adminError } = await supabase
        .from('users')
        .update({ is_system_admin })
        .eq('id', userId)

      if (adminError) {
        return NextResponse.json(
          { error: 'Failed to update admin status' }, 
          { status: 500 }
        )
      }

      // Handle system_admins table
      if (is_system_admin) {
        await supabase
          .from('system_admins')
          .upsert({
            user_id: userId,
            granted_by: session.user.id,
            granted_at: new Date().toISOString()
          })
      } else {
        await supabase
          .from('system_admins')
          .update({ revoked_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('revoked_at', null)
      }
    }

    // Log admin action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'user_updated',
      target_type: 'user',
      target_id: userId,
      action_details: { 
        changes: updateData,
        admin_status_changed: is_system_admin !== undefined,
        method: 'admin_panel'
      },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Admin update user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const userId = params.id

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' }, 
        { status: 400 }
      )
    }

    // Soft delete user (set deleted_at timestamp)
    const { error: deleteError } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete user' }, 
        { status: 500 }
      )
    }

    // Also delete from auth (optional - you might want to just disable)
    await supabase.auth.admin.deleteUser(userId)

    // Log admin action
    await supabase.rpc('log_system_admin_action', {
      admin_id: session.user.id,
      action_name: 'user_deleted',
      target_type: 'user',
      target_id: userId,
      action_details: { method: 'admin_panel' },
      ip_addr: request.ip,
      user_agent_str: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}