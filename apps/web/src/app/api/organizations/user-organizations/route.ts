import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create supabase client with user token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('Fetching organizations for user:', user.id)

    // First, try to get memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', user.id)

    if (membershipError) {
      console.error('Membership fetch error:', membershipError)
    } else {
      console.log('Found memberships:', memberships?.length || 0)
    }

    // Also get organizations where user is the creator (in case membership is missing)
    const { data: ownedOrgs, error: ownedOrgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('created_by', user.id)

    if (ownedOrgError) {
      console.error('Owned orgs fetch error:', ownedOrgError)
    } else {
      console.log('Found owned organizations:', ownedOrgs?.length || 0)
    }

    // If user has organizations but no memberships, create missing memberships
    if (ownedOrgs?.length && (!memberships || memberships.length === 0)) {
      console.log('Creating missing memberships for owned organizations')
      
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      for (const org of ownedOrgs) {
        const { error: createError } = await adminSupabase
          .from('memberships')
          .insert({
            user_id: user.id,
            organization_id: org.id,
            role: 'owner',
            status: 'active',
            accepted_at: new Date().toISOString(),
          })

        if (createError) {
          console.error('Error creating membership for org', org.id, ':', createError)
        } else {
          console.log('Created membership for org:', org.id)
        }
      }

      // Refetch memberships after creating them
      const { data: newMemberships, error: refetchError } = await supabase
        .from('memberships')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)

      if (!refetchError && newMemberships) {
        return NextResponse.json({
          memberships: newMemberships,
          organizations: newMemberships.map(m => m.organization),
        })
      }
    }

    // Return existing memberships and organizations
    const organizations = memberships?.map(m => m.organization) || []
    
    return NextResponse.json({
      memberships: memberships || [],
      organizations,
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}