import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = verifyEmailSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Verify the email token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) {
      // Check if token is expired
      if (error.message.includes('expired')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Verification link has expired. Please request a new one.',
            code: 'TOKEN_EXPIRED'
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Failed to verify email',
          code: 'VERIFICATION_FAILED'
        },
        { status: 400 }
      )
    }

    if (data.user) {
      // Update user metadata to mark email as verified
      const { error: updateError } = await supabase.auth.updateUser({
        data: { email_verified: true }
      })

      if (updateError) {
        console.error('Failed to update user metadata:', updateError)
      }

      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Failed to update profile:', profileError)
      }

      // Log verification event
      await supabase
        .from('auth_events')
        .insert({
          user_id: data.user.id,
          event_type: 'email_verified',
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          created_at: new Date().toISOString(),
        })

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          email_verified: true,
        }
      })
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid verification token',
        code: 'INVALID_TOKEN'
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Email verification error:', error)

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
      { 
        success: false, 
        error: 'An error occurred during email verification' 
      },
      { status: 500 }
    )
  }
}