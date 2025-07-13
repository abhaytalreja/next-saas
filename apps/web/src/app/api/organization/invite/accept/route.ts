import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = acceptInviteSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must be logged in to accept an invitation',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    // Verify the invitation token
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*, organizations(*)')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired invitation',
          code: 'INVALID_INVITATION',
        },
        { status: 400 }
      )
    }

    // Get user's email from profile to validate invitation
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (
      profileError ||
      !userProfile ||
      userProfile.email !== invitation.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'This invitation is not for your email address',
          code: 'EMAIL_MISMATCH',
        },
        { status: 400 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update invitation status to expired
      await supabase
        .from('organization_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        {
          success: false,
          error: 'This invitation has expired',
          code: 'INVITATION_EXPIRED',
        },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('organization_id', invitation.organization_id)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are already a member of this organization',
          code: 'ALREADY_MEMBER',
        },
        { status: 400 }
      )
    }

    // Start a transaction to accept the invitation
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: user.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        status: 'active',
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      })

    if (membershipError) {
      console.error('Failed to create membership:', membershipError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to join organization',
          code: 'MEMBERSHIP_CREATION_FAILED',
        },
        { status: 500 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation:', updateError)
    }

    // Log the event
    await supabase.from('organization_events').insert({
      organization_id: invitation.organization_id,
      user_id: user.id,
      event_type: 'member_joined',
      metadata: {
        invitation_id: invitation.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      },
      created_at: new Date().toISOString(),
    })

    // Update user's current organization if they don't have one
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.current_organization_id) {
      await supabase
        .from('profiles')
        .update({ current_organization_id: invitation.organization_id })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: invitation.organizations.id,
        name: invitation.organizations.name,
        slug: invitation.organizations.slug,
      },
      membership: {
        role: invitation.role,
        joined_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Accept invitation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while accepting the invitation',
      },
      { status: 500 }
    )
  }
}
