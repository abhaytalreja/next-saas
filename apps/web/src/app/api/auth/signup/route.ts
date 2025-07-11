import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, organizationName } =
      signupSchema.parse(body)

    // Create admin client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check if email confirmation should be disabled
    const disableEmailConfirmation = true // Hard-coded to true for testing
    console.log('DISABLE_EMAIL_CONFIRMATION (hard-coded):', disableEmailConfirmation)

    // Create user with admin API (bypasses triggers)
    const createUserOptions = {
      email,
      password,
      email_confirm: disableEmailConfirmation, // When true, email is automatically confirmed
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    }

    console.log('Creating user with options:', JSON.stringify(createUserOptions, null, 2))
    
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser(createUserOptions)

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user', details: userError.message },
        { status: 400 }
      )
    }

    if (!userData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    console.log('User created:', userData.user.id)
    console.log('User email_confirmed_at:', userData.user.email_confirmed_at)
    console.log('User confirmation_sent_at:', userData.user.confirmation_sent_at)

    // If email confirmation is disabled but the user still shows as unconfirmed, manually confirm
    if (disableEmailConfirmation && !userData.user.email_confirmed_at) {
      console.log('Email confirmation disabled but user not confirmed, manually confirming...')
      const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
        userData.user.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.error('Failed to manually confirm user email:', confirmError)
      } else {
        console.log('User email manually confirmed:', confirmData.user.email_confirmed_at)
      }
    }

    // Create corresponding user record in public.users table now that triggers are fixed
    console.log('Creating user record in public.users table for user:', userData.user.id)
    const { error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id, // Use the same ID as auth.users
        email: userData.user.email,
        name: `${firstName} ${lastName}`,
        email_verified_at: disableEmailConfirmation ? new Date().toISOString() : null,
      })

    if (publicUserError) {
      console.error('Failed to create public user record:', publicUserError)
      console.error('Public user error details:', JSON.stringify(publicUserError, null, 2))
      // Continue without failing the whole signup
    } else {
      console.log('Public user record created successfully for:', userData.user.email)
    }

    // Create organization if provided
    let organizationId = null
    if (organizationName) {
      try {
        console.log('Starting organization creation process...')
        console.log('Organization name:', organizationName)
        console.log('User ID for created_by:', userData.user.id)
        
        // Wait a moment to ensure public user record is created
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const slug = organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50)

        const uniqueSlug = `${slug}-${Date.now()}`
        console.log('Generated slug:', uniqueSlug)

        // Create organization with created_by field now that user exists in public.users
        console.log('Creating organization with name:', organizationName, 'for user:', userData.user.id)
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName,
            slug: uniqueSlug,
            created_by: userData.user.id,
          })
          .select()
          .single()

        if (orgError) {
          console.error('Organization creation error:', orgError)
          console.error('Organization error details:', JSON.stringify(orgError, null, 2))
          console.error('Error code:', orgError.code)
          console.error('Error message:', orgError.message)
        } else {
          console.log('Organization created successfully:', org)
          organizationId = org.id

          // Create membership
          console.log('Creating membership for user:', userData.user.id, 'in org:', org.id)
          const { error: membershipError } = await supabase
            .from('memberships')
            .insert({
              user_id: userData.user.id,
              organization_id: org.id,
              role: 'owner',
              accepted_at: new Date().toISOString(),
            })

          if (membershipError) {
            console.error('Membership creation error:', membershipError)
            console.error('Membership error details:', JSON.stringify(membershipError, null, 2))
          } else {
            console.log('Membership created successfully for user:', userData.user.id)
          }
        }
      } catch (orgError) {
        console.error('Organization creation failed with exception:', orgError)
        console.error('Exception stack:', orgError.stack)
        // Don't fail the whole signup if organization creation fails
      }
    } else {
      console.log('No organization name provided, skipping organization creation')
    }

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        firstName,
        lastName,
      },
      organization: organizationId ? { id: organizationId } : null,
    })
  } catch (error) {
    console.error('Signup API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
