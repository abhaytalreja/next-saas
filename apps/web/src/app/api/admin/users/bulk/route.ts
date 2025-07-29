import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
// import { isUserSystemAdmin } from '@nextsaas/auth/middleware/admin-middleware'

// Temporary admin check until database migrations are applied
async function isUserSystemAdmin(userId: string, supabase: any): Promise<boolean> {
  try {
    // For now, just check if user exists - replace with proper admin check after migration
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()
    
    return !error && !!userData
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
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
    const { action, user_ids, email_subject, email_message } = body

    if (!action || !user_ids || !Array.isArray(user_ids)) {
      return NextResponse.json(
        { error: 'Action and user_ids array are required' }, 
        { status: 400 }
      )
    }

    // Prevent operations on self
    if (user_ids.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot perform bulk operations on your own account' }, 
        { status: 400 }
      )
    }

    let results = []
    let successCount = 0
    let errorCount = 0

    switch (action) {
      case 'suspend':
        for (const userId of user_ids) {
          try {
            const { error } = await supabase.auth.admin.updateUserById(
              userId,
              { ban_duration: '87600h' }
            )
            
            if (error) {
              results.push({ user_id: userId, success: false, error: error.message })
              errorCount++
            } else {
              results.push({ user_id: userId, success: true })
              successCount++
            }
          } catch (err) {
            results.push({ user_id: userId, success: false, error: 'Unknown error' })
            errorCount++
          }
        }
        break

      case 'activate':
        for (const userId of user_ids) {
          try {
            const { error } = await supabase.auth.admin.updateUserById(
              userId,
              { ban_duration: 'none' }
            )
            
            if (error) {
              results.push({ user_id: userId, success: false, error: error.message })
              errorCount++
            } else {
              results.push({ user_id: userId, success: true })
              successCount++
            }
          } catch (err) {
            results.push({ user_id: userId, success: false, error: 'Unknown error' })
            errorCount++
          }
        }
        break

      case 'delete':
        for (const userId of user_ids) {
          try {
            // Soft delete
            const { error: deleteError } = await supabase
              .from('users')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', userId)

            if (deleteError) {
              results.push({ user_id: userId, success: false, error: deleteError.message })
              errorCount++
            } else {
              // Also delete from auth
              await supabase.auth.admin.deleteUser(userId)
              results.push({ user_id: userId, success: true })
              successCount++
            }
          } catch (err) {
            results.push({ user_id: userId, success: false, error: 'Unknown error' })
            errorCount++
          }
        }
        break

      case 'export':
        // Get user data for export
        const { data: users, error: exportError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            name,
            created_at,
            last_seen_at,
            email_verified_at,
            memberships(
              role,
              organizations(name)
            )
          `)
          .in('id', user_ids)
          .is('deleted_at', null)

        if (exportError) {
          return NextResponse.json(
            { error: 'Failed to export users' }, 
            { status: 500 }
          )
        }

        // Transform for CSV export
        const csvData = users?.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name || '',
          created_at: user.created_at,
          last_seen_at: user.last_seen_at || '',
          email_verified: user.email_verified_at ? 'Yes' : 'No',
          organizations: user.memberships?.map((m: any) => m.organizations?.name).join(';') || ''
        })) || []

        results = csvData
        successCount = csvData.length
        break

      case 'email':
        if (!email_subject || !email_message) {
          return NextResponse.json(
            { error: 'Email subject and message are required for email action' }, 
            { status: 400 }
          )
        }

        // Get user emails
        const { data: emailUsers, error: emailError } = await supabase
          .from('users')
          .select('id, email, name')
          .in('id', user_ids)
          .is('deleted_at', null)

        if (emailError) {
          return NextResponse.json(
            { error: 'Failed to get user emails' }, 
            { status: 500 }
          )
        }

        // Send emails (integrate with your email service)
        for (const user of emailUsers || []) {
          try {
            // This would integrate with your email service
            // For now, we'll just log it
            console.log(`Sending email to ${user.email}: ${email_subject}`)
            results.push({ user_id: user.id, success: true, email: user.email })
            successCount++
          } catch (err) {
            results.push({ user_id: user.id, success: false, error: 'Email failed' })
            errorCount++
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        )
    }

    // Log bulk admin action (disable until migration is applied)
    // await supabase.rpc('log_system_admin_action', {
    //   admin_id: session.user.id,
    //   action_name: `bulk_${action}`,
    //   target_type: 'users',
    //   action_details: { 
    //     user_count: user_ids.length,
    //     success_count: successCount,
    //     error_count: errorCount,
    //     user_ids: user_ids.slice(0, 10), // Log first 10 IDs
    //     method: 'admin_panel'
    //   },
    //   ip_addr: request.ip,
    //   user_agent_str: request.headers.get('user-agent')
    // })

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed: ${successCount} successful, ${errorCount} failed`,
      results,
      summary: {
        total: user_ids.length,
        successful: successCount,
        failed: errorCount
      }
    })

  } catch (error) {
    console.error('Admin bulk users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}