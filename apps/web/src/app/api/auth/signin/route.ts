import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
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

    // Use unified Supabase client
    const supabase = getSupabaseServerClient()

    // Check if email confirmation should be disabled
    const disableEmailConfirmation = true // Hard-coded to true for testing
    console.log(
      'DISABLE_EMAIL_CONFIRMATION (hard-coded):',
      disableEmailConfirmation
    )

    // Try to sign in with password
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    )

    if (signInError) {
      console.log('Sign-in error occurred:', signInError.message)
      // If email confirmation is disabled and error is about email confirmation
      if (
        signInError.message?.includes('Email not confirmed') &&
        disableEmailConfirmation
      ) {
        console.log(
          'Email confirmation error detected. In production, implement proper email confirmation flow'
        )

        // For development purposes, return specific error message
        return NextResponse.json(
          {
            error: 'Email not confirmed',
            details:
              'Please check your email and click the confirmation link, or contact support',
            development_note: 'Email confirmation bypass removed for security',
          },
          { status: 400 }
        )
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
            includesEmailNotConfirmed: signInError.message?.includes(
              'Email not confirmed'
            ),
          },
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
