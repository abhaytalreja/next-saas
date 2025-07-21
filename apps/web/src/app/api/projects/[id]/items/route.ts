import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@nextsaas/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseRouteHandlerClient()
    
    // Use getUser() instead of getSession() as recommended by Supabase docs
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get items for the project
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        type,
        status,
        priority,
        tags,
        assigned_to,
        due_date,
        created_at,
        updated_at,
        created_by,
        assignee:assigned_to(
          id,
          email,
          first_name,
          last_name,
          name,
          avatar_url
        ),
        creator:created_by(
          id,
          email,
          first_name,
          last_name,
          name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching items:', error)
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (error: any) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseRouteHandlerClient()
    
    // Use getUser() instead of getSession() as recommended by Supabase docs
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()

    const { title, description, type, priority, assigned_to, due_date, tags } = body

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }

    // Get user's organization from project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create the item
    const { data: item, error } = await supabase
      .from('items')
      .insert({
        title,
        description,
        type,
        priority: priority || 0,
        assigned_to,
        due_date,
        tags: tags || [],
        project_id: projectId,
        organization_id: project.organization_id,
        created_by: user.id,
        status: 'active'
      })
      .select(`
        id,
        title,
        description,
        type,
        status,
        priority,
        tags,
        assigned_to,
        due_date,
        created_at,
        updated_at,
        created_by,
        assignee:assigned_to(
          id,
          email,
          first_name,
          last_name,
          name,
          avatar_url
        ),
        creator:created_by(
          id,
          email,
          first_name,
          last_name,
          name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating item:', error)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json(item)
  } catch (error: any) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}