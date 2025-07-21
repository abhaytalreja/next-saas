import { NextRequest, NextResponse } from 'next/server'
import { createSharedServerClient } from '@/lib/supabase/shared'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Request headers:', {
      cookie: request.headers.get('cookie') ? 'Present' : 'Missing',
      authorization: request.headers.get('authorization') ? 'Present' : 'Missing',
      userAgent: request.headers.get('user-agent')?.substring(0, 50)
    })

    const supabase = await createSharedServerClient()
    
    // Try Authorization header first, then cookies
    const authHeader = request.headers.get('authorization')
    let user = null
    let authError = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use Authorization header token
      const token = authHeader.replace('Bearer ', '')
      const { data: userData, error } = await supabase.auth.getUser(token)
      user = userData.user
      authError = error
      console.log('🔍 Auth via header:', { hasUser: !!user, userId: user?.id })
    } else {
      // Fall back to cookie-based auth
      const { data: userData, error } = await supabase.auth.getUser()
      user = userData.user
      authError = error
      console.log('🔍 Auth via cookies:', { hasUser: !!user, userId: user?.id })
    }

    if (authError || !user) {
      console.log('🚨 Authentication failed:', { authError: authError?.message, hasUser: !!user })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the project
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        slug,
        description,
        type,
        settings,
        metadata,
        is_archived,
        created_by,
        created_at,
        updated_at,
        organization_id
      `)
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user has access to this project through organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('user_id, organization_id, role')
      .eq('user_id', user.id)
      .eq('organization_id', data.organization_id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get creator info
    let creator = null
    if (data.created_by) {
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('id, name, first_name, last_name, email, avatar_url')
        .eq('id', data.created_by)
        .single()
      
      if (!creatorError && creatorData) {
        creator = creatorData
      }
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get item count
    const { count: itemCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .is('deleted_at', null)

    // Return complete project data
    const response = {
      ...data,
      creator,
      _count: {
        members: memberCount || 0,
        items: itemCount || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}