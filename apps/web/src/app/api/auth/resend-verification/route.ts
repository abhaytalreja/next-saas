import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createRateLimiter } from '@/packages/auth/src/middleware/rate-limiting'

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Rate limiter: 3 requests per hour per email
const rateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyGenerator: (req: NextRequest) => {
    // Use IP address for now, we'll get email after parsing body
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `resend-verification:${ip}`
  }
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimiter(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await req.json()
    const { email } = resendVerificationSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Check if user exists and is not already verified
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email_verified_at')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      })
    }

    if (user.email_verified_at) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already verified',
          code: 'ALREADY_VERIFIED'
        },
        { status: 400 }
      )
    }

    // Resend verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`
      }
    })

    if (resendError) {
      console.error('Failed to resend verification email:', resendError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to resend verification email' 
        },
        { status: 500 }
      )
    }

    // Log resend event
    await supabase
      .from('auth_events')
      .insert({
        user_id: user.id,
        event_type: 'verification_email_resent',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent'),
        metadata: { email },
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox.'
    })
  } catch (error) {
    console.error('Resend verification error:', error)

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
        error: 'An error occurred while resending verification email' 
      },
      { status: 500 }
    )
  }
}