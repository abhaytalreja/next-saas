import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { UniversalProfileManager } from '@nextsaas/auth'
import { z } from 'zod'

// Profile form validation schema
const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url('Invalid website URL').max(200).optional().or(z.literal('')),
  job_title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().max(50),
  locale: z.string().max(10).default('en'),
})

const getProfileSchema = z.object({
  include_preferences: z.boolean().optional().default(false),
  include_activity: z.boolean().optional().default(false),
  include_sessions: z.boolean().optional().default(false),
  include_avatars: z.boolean().optional().default(false),
  organization_id: z.string().optional(),
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

    const { searchParams } = new URL(req.url)
    const options = {
      includePreferences: searchParams.get('include_preferences') === 'true',
      includeActivity: searchParams.get('include_activity') === 'true',
      includeSessions: searchParams.get('include_sessions') === 'true',
      includeAvatars: searchParams.get('include_avatars') === 'true',
      organizationId: searchParams.get('organization_id') || undefined,
    }

    // Use Universal Profile Manager to get comprehensive profile data
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const profileData = await profileManager.getProfile(options)

    return NextResponse.json({
      success: true,
      data: profileData
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
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Validate request data with proper schema
    const validatedData = profileFormSchema.parse(body)
    
    // Get organization context if provided
    const organizationId = body.organization_id

    // Use Universal Profile Manager to update profile
    const profileManager = new UniversalProfileManager(supabase, session.user.id)
    const updatedProfileData = await profileManager.updateProfile(validatedData, organizationId)

    return NextResponse.json({
      success: true,
      data: updatedProfileData
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