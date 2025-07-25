import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { UniversalProfileManager } from '@nextsaas/auth'
import { z } from 'zod'

// User preferences validation schema
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
  date_format: z.string().max(20).optional(),
  time_format: z.enum(['12h', '24h']).optional(),
  
  // Email Notifications
  email_notifications_enabled: z.boolean().optional(),
  email_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
  email_digest: z.boolean().optional(),
  
  // Notification Types
  notify_security_alerts: z.boolean().optional(),
  notify_account_updates: z.boolean().optional(),
  notify_organization_updates: z.boolean().optional(),
  notify_project_updates: z.boolean().optional(),
  notify_mentions: z.boolean().optional(),
  notify_comments: z.boolean().optional(),
  notify_invitations: z.boolean().optional(),
  notify_billing_alerts: z.boolean().optional(),
  notify_feature_announcements: z.boolean().optional(),
  
  // Push Notifications
  browser_notifications_enabled: z.boolean().optional(),
  desktop_notifications_enabled: z.boolean().optional(),
  mobile_notifications_enabled: z.boolean().optional(),
  
  // Marketing & Communication
  marketing_emails: z.boolean().optional(),
  product_updates: z.boolean().optional(),
  newsletters: z.boolean().optional(),
  surveys: z.boolean().optional(),
  
  // Privacy Settings
  profile_visibility: z.enum(['public', 'organization', 'private']).optional(),
  email_visibility: z.enum(['public', 'organization', 'private']).optional(),
  activity_visibility: z.enum(['public', 'organization', 'private']).optional(),
  hide_last_seen: z.boolean().optional(),
  hide_activity_status: z.boolean().optional(),
  
  // Advanced Settings
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quiet_hours_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone_aware: z.boolean().optional(),
  
  // Accessibility
  reduce_motion: z.boolean().optional(),
  high_contrast: z.boolean().optional(),
  screen_reader_optimized: z.boolean().optional(),
  
  // Data & Privacy
  data_retention_period: z.number().min(30).max(3650).optional(),
  auto_delete_inactive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use Universal Profile Manager to get preferences
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const preferences = await profileManager.getPreferences()

    return NextResponse.json({
      success: true,
      data: {
        preferences,
        has_preferences: preferences !== undefined
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
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Validate request data
    const validatedData = preferencesSchema.parse(body)
    
    // Use Universal Profile Manager to create/update preferences
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const preferences = await profileManager.updatePreferences(validatedData)

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
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Validate partial data
    const validatedData = preferencesSchema.parse(body)
    
    // Use Universal Profile Manager to update preferences
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const preferences = await profileManager.updatePreferences(validatedData)

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
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete user preferences (reset to defaults)
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', session.user.id)

    // Use Universal Profile Manager to get new defaults
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const defaultPreferences = await profileManager.getPreferences()

    return NextResponse.json({
      success: true,
      data: { preferences: defaultPreferences },
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