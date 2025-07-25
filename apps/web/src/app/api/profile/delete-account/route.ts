import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { z } from 'zod'
import { createAccountDeletionService } from '@nextsaas/auth/services/account-deletion-service'
import { createAuditService } from '@nextsaas/auth/services/audit-service'

const deletionRequestSchema = z.object({
  confirmation_text: z.string().min(1, 'Confirmation text is required'),
  reason: z.string().optional(),
  password: z.string().optional(),
  understand_consequences: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge that you understand the consequences'
  })
})

const cancellationSchema = z.object({
  deletion_id: z.string().uuid('Invalid deletion ID'),
  reason: z.string().optional()
})

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
    const { confirmation_text, reason, password, understand_consequences } = deletionRequestSchema.parse(body)

    // Create service instances
    const accountDeletionService = createAccountDeletionService(supabase)
    const auditService = createAuditService(supabase)

    // Check if user already has a pending deletion request
    const statusResult = await accountDeletionService.getDeletionStatus(session.user.id)
    
    if (statusResult.success && statusResult.deletion && 
        ['pending', 'processing'].includes(statusResult.deletion.status)) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending account deletion request',
        existing_deletion: {
          id: statusResult.deletion.id,
          status: statusResult.deletion.status,
          scheduledFor: statusResult.deletion.scheduledFor,
          canCancel: statusResult.deletion.canCancel
        }
      }, { status: 400 })
    }

    // Validate confirmation text
    if (confirmation_text !== 'DELETE MY ACCOUNT') {
      await auditService.logSecurityViolation({
        userId: session.user.id,
        violationType: 'suspicious_activity',
        resource: 'account_deletion',
        details: {
          invalid_confirmation: confirmation_text,
          expected: 'DELETE MY ACCOUNT'
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
        userAgent: req.headers.get('user-agent') || undefined
      })

      return NextResponse.json({
        success: false,
        error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" exactly as shown.',
        field_errors: {
          confirmation_text: 'Must match exactly: DELETE MY ACCOUNT'
        }
      }, { status: 400 })
    }

    // Check if user has active organization admin roles
    const { data: organizationMembers } = await supabase
      .from('organization_members')
      .select('role, organization_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')

    const hasAdminRoles = organizationMembers?.some(member => 
      member.role === 'admin' || member.role === 'owner'
    )

    if (hasAdminRoles) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete account while you are an admin or owner of organizations. Please transfer ownership or leave organizations first.',
        blocked_by: 'organization_admin_role'
      }, { status: 400 })
    }

    // Request account deletion with grace period
    const deletionResult = await accountDeletionService.requestAccountDeletion({
      userId: session.user.id,
      reason,
      confirmationText: confirmation_text,
      password,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    if (!deletionResult.success) {
      return NextResponse.json({
        success: false,
        error: deletionResult.error
      }, { status: 400 })
    }

    // Calculate days until deletion
    const daysUntilDeletion = Math.ceil(
      (deletionResult.scheduledFor!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return NextResponse.json({
      success: true,
      data: {
        deletionId: deletionResult.deletionId,
        scheduledFor: deletionResult.scheduledFor,
        daysUntilDeletion,
        gracePeriod: 30,
        canCancel: true,
        message: `Your account deletion has been scheduled for ${deletionResult.scheduledFor?.toDateString()}. You have ${daysUntilDeletion} days to cancel this request if you change your mind.`,
        next_steps: [
          'You will receive email confirmations about this deletion request',
          'You can cancel this request at any time during the grace period',
          'All your data will be permanently deleted after the grace period',
          'Some data may be retained for legal or audit purposes as outlined in our privacy policy'
        ]
      }
    })

  } catch (error) {
    console.error('Account deletion request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        field_errors: Object.fromEntries(
          error.errors.map(err => [err.path.join('.'), err.message])
        )
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Create service instance
    const accountDeletionService = createAccountDeletionService(supabase)

    // Get user's current deletion status
    const result = await accountDeletionService.getDeletionStatus(session.user.id)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

    // Calculate additional information if deletion exists
    let deletionInfo = null
    if (result.deletion) {
      const scheduledDate = new Date(result.deletion.scheduledFor)
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      deletionInfo = {
        ...result.deletion,
        daysRemaining,
        isOverdue: scheduledDate < now,
        canStillCancel: result.deletion.canCancel && result.deletion.status === 'pending',
        formattedScheduledDate: scheduledDate.toLocaleDateString(),
        formattedRequestDate: new Date(result.deletion.requestedAt).toLocaleDateString()
      }
    }

    // Check if user can request new deletion
    const { data: recentRequests } = await supabase
      .from('account_deletions')
      .select('requested_at')
      .eq('user_id', session.user.id)
      .gte('requested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const canRequestNew = !deletionInfo && (!recentRequests || recentRequests.length === 0)

    return NextResponse.json({
      success: true,
      data: {
        hasPendingDeletion: !!deletionInfo,
        deletion: deletionInfo,
        canRequestNew,
        info: {
          gracePeriodDays: 30,
          whatGetsDeleted: [
            'Profile information and personal data',
            'Activity history and audit logs',
            'User preferences and settings',
            'Uploaded files and avatars',
            'Session data and login history'
          ],
          whatIsRetained: [
            'Some audit logs for legal compliance',
            'Anonymized usage statistics',
            'Billing records (if applicable)',
            'Legal documents and agreements'
          ],
          gdprRights: [
            'Right to request account deletion (Art. 17)',
            'Right to data portability (Art. 20)',
            'Right to be informed about data processing',
            '30-day grace period to change your mind'
          ]
        }
      }
    })

  } catch (error) {
    console.error('Deletion status check error:', error)
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

    const body = await req.json()
    const { deletion_id, reason } = cancellationSchema.parse(body)

    // Create service instance
    const accountDeletionService = createAccountDeletionService(supabase)

    // Cancel the deletion request
    const result = await accountDeletionService.cancelAccountDeletion(
      deletion_id,
      session.user.id,
      reason
    )

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Account deletion request has been successfully cancelled.',
        deletionId: deletion_id,
        cancelledAt: new Date().toISOString(),
        reason: reason || 'User cancelled'
      }
    })

  } catch (error) {
    console.error('Deletion cancellation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        field_errors: Object.fromEntries(
          error.errors.map(err => [err.path.join('.'), err.message])
        )
      }, { status: 400 })
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}