import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { profileFormSchema } from '@nextsaas/auth/validation/profile-schemas'
import { z } from 'zod'

const getProfileSchema = z.object({
  include_preferences: z.boolean().optional().default(false),
  include_activity: z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const includePreferences = searchParams.get('include_preferences') === 'true'
    const includeActivity = searchParams.get('include_activity') === 'true'

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    const result: any = { profile }

    // Include preferences if requested
    if (includePreferences) {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      result.preferences = preferences
    }

    // Include recent activity if requested
    if (includeActivity) {
      const { data: activities } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      result.activities = activities
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = profileFormSchema.parse(body)

    // Get current profile to check for changes
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Log profile update activity
    const changes = []
    if (currentProfile) {
      if (currentProfile.first_name !== validatedData.first_name) changes.push('first_name')
      if (currentProfile.last_name !== validatedData.last_name) changes.push('last_name')
      if (currentProfile.display_name !== validatedData.display_name) changes.push('display_name')
      if (currentProfile.bio !== validatedData.bio) changes.push('bio')
      if (currentProfile.phone_number !== validatedData.phone_number) changes.push('phone_number')
      if (currentProfile.company !== validatedData.company) changes.push('company')
      if (currentProfile.job_title !== validatedData.job_title) changes.push('job_title')
      if (currentProfile.timezone !== validatedData.timezone) changes.push('timezone')
      if (currentProfile.location !== validatedData.location) changes.push('location')
    }

    if (changes.length > 0) {
      await supabase
        .from('user_activity')
        .insert({
          user_id: session.user.id,
          action: 'profile_update',
          description: `Updated profile fields: ${changes.join(', ')}`,
          status: 'success',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          metadata: { updated_fields: changes },
        })
    }

    return NextResponse.json({
      success: true,
      data: { profile }
    })
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}