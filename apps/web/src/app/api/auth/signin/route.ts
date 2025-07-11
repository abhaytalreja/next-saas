import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = signinSchema.parse(body)

    // Create standard client for authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if email confirmation should be disabled
    const disableEmailConfirmation = true // Hard-coded to true for testing
    console.log('DISABLE_EMAIL_CONFIRMATION (hard-coded):', disableEmailConfirmation)

    // Try to sign in with password
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.log('Sign-in error occurred:', signInError.message)
      // If email confirmation is disabled and error is about email confirmation, try with admin client
      if (signInError.message?.includes('Email not confirmed') && disableEmailConfirmation) {
        console.log('Email confirmation error detected, attempting admin bypass...')
        
        // Create admin client to manually confirm email
        const adminSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        )

        // Get user by email to confirm them
        const { data: userData, error: getUserError } = await adminSupabase.auth.admin.getUserByEmail(email)
        
        if (getUserError || !userData.user) {
          console.error('Failed to get user for email confirmation:', getUserError)
          return NextResponse.json(
            { error: 'User not found', details: getUserError?.message },
            { status: 400 }
          )
        }

        console.log('Found user, confirming email for:', userData.user.email)

        // Update user to confirm email
        const { data: updateData, error: confirmError } = await adminSupabase.auth.admin.updateUserById(
          userData.user.id,
          { email_confirm: true }
        )

        if (confirmError) {
          console.error('Failed to confirm user email:', confirmError)
          return NextResponse.json(
            { error: 'Failed to confirm email', details: confirmError.message },
            { status: 400 }
          )
        }

        console.log('User email confirmed successfully for:', userData.user.email)

        // Wait a moment for the confirmation to propagate
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Retry sign-in after confirming email
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (retryError) {
          console.error('Retry sign-in failed:', retryError)
          return NextResponse.json(
            { error: 'Sign-in failed after email confirmation', details: retryError.message },
            { status: 400 }
          )
        }

        // Return successful sign-in
        return NextResponse.json({
          success: true,
          session: retryData.session,
          user: retryData.user,
        })
      }

      console.error('Sign-in error:', signInError)
      return NextResponse.json(
        { 
          error: 'Sign-in failed', 
          details: signInError.message,
          debug: {
            disableEmailConfirmation,
            envVar: process.env.DISABLE_EMAIL_CONFIRMATION,
            errorMessage: signInError.message,
            includesEmailNotConfirmed: signInError.message?.includes('Email not confirmed')
          }
        },
        { status: 400 }
      )
    }

    // Return successful sign-in
    return NextResponse.json({
      success: true,
      session: data.session,
      user: data.user,
    })
  } catch (error) {
    console.error('Signin API error:', error)

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