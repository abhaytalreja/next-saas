import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { userPreferencesSchema } from '@nextsaas/auth/validation/profile-schemas'
import { z } from 'zod'

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

    // Get user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return default values
        return NextResponse.json({
          success: true,
          data: {
            preferences: null,
            has_preferences: false
          }
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        preferences,
        has_preferences: true
      }
    })
  } catch (error) {
    console.error('Preferences fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    const validatedData = userPreferencesSchema.parse(body)

    // Create new preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: session.user.id,
        ...validatedData,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - preferences already exist
        return NextResponse.json(
          { success: false, error: 'Preferences already exist. Use PATCH to update.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create preferences' },
        { status: 500 }
      )
    }

    // Log preferences creation activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: session.user.id,
        action: 'preferences_create',
        description: 'Created user preferences',
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      })

    return NextResponse.json({
      success: true,
      data: { preferences }
    })
  } catch (error) {
    console.error('Preferences creation error:', error)

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
    
    // For partial updates, we need to validate only the provided fields
    const partialSchema = userPreferencesSchema.partial()
    const validatedData = partialSchema.parse(body)

    // Get current preferences to check for changes
    const { data: currentPreferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // Update preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    // Log significant preference changes
    const significantChanges = []
    if (currentPreferences) {
      if (currentPreferences.theme !== validatedData.theme && validatedData.theme) {
        significantChanges.push(`theme changed to ${validatedData.theme}`)
      }
      if (currentPreferences.language !== validatedData.language && validatedData.language) {
        significantChanges.push(`language changed to ${validatedData.language}`)
      }
      if (currentPreferences.email_notifications_enabled !== validatedData.email_notifications_enabled && typeof validatedData.email_notifications_enabled === 'boolean') {
        significantChanges.push(`email notifications ${validatedData.email_notifications_enabled ? 'enabled' : 'disabled'}`)
      }
    }

    if (significantChanges.length > 0) {
      await supabase
        .from('user_activity')
        .insert({
          user_id: session.user.id,
          action: 'preferences_update',
          description: `Updated preferences: ${significantChanges.join(', ')}`,
          status: 'success',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          metadata: { updated_fields: Object.keys(validatedData) },
        })
    }

    return NextResponse.json({
      success: true,
      data: { preferences }
    })
  } catch (error) {
    console.error('Preferences update error:', error)

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

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete user preferences (reset to defaults)
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', session.user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset preferences' },
        { status: 500 }
      )
    }

    // Log preferences reset activity
    await supabase
      .from('user_activity')
      .insert({
        user_id: session.user.id,
        action: 'preferences_reset',
        description: 'Reset preferences to defaults',
        status: 'success',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
      })

    return NextResponse.json({
      success: true,
      message: 'Preferences reset to defaults'
    })
  } catch (error) {
    console.error('Preferences reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}