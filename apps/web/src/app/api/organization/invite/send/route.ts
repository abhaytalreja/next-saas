import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import crypto from 'crypto'

const sendInviteSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  invitations: z.array(z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'member']),
  })).min(1, 'At least one invitation is required'),
  message: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { organizationId, invitations, message } = sendInviteSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You must be logged in to send invitations',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }

    // Check if user has permission to invite members
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You do not have permission to invite members to this organization',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      )
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization not found',
          code: 'ORGANIZATION_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Process each invitation
    const results = []
    const errors = []

    for (const invite of invitations) {
      try {
        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('memberships')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('user_email', invite.email)
          .single()

        if (existingMember) {
          errors.push({
            email: invite.email,
            error: 'Already a member of this organization'
          })
          continue
        }

        // Check if there's already a pending invitation
        const { data: existingInvite } = await supabase
          .from('organization_invitations')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('email', invite.email)
          .eq('status', 'pending')
          .single()

        if (existingInvite) {
          errors.push({
            email: invite.email,
            error: 'An invitation has already been sent to this email'
          })
          continue
        }

        // Generate invitation token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        // Create invitation record
        const { data: invitation, error: inviteError } = await supabase
          .from('organization_invitations')
          .insert({
            organization_id: organizationId,
            email: invite.email,
            role: invite.role,
            token,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
            message,
          })
          .select()
          .single()

        if (inviteError) {
          console.error('Failed to create invitation:', inviteError)
          errors.push({
            email: invite.email,
            error: 'Failed to create invitation'
          })
          continue
        }

        // Send invitation email (in production, use email service)
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${token}`
        
        // TODO: Integrate with email service
        console.log('Sending invitation email to:', invite.email, 'with URL:', inviteUrl)

        results.push({
          email: invite.email,
          success: true,
          invitationId: invitation.id,
        })

        // Log the event
        await supabase
          .from('organization_events')
          .insert({
            organization_id: organizationId,
            user_id: user.id,
            event_type: 'invitation_sent',
            metadata: {
              invitation_id: invitation.id,
              email: invite.email,
              role: invite.role,
            },
            created_at: new Date().toISOString(),
          })
      } catch (err) {
        console.error('Error processing invitation for', invite.email, err)
        errors.push({
          email: invite.email,
          error: 'An unexpected error occurred'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        sent: results.length,
        failed: errors.length,
        total: invitations.length,
      }
    })
  } catch (error) {
    console.error('Send invitations error:', error)

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
        error: 'An error occurred while sending invitations' 
      },
      { status: 500 }
    )
  }
}