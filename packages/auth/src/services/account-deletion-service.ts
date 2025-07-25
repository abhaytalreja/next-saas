import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { auditService } from './audit-service'
import { dataExportService } from './data-export-service'

export interface DeletionRequest {
  userId: string
  reason?: string
  confirmationText: string
  password?: string
  ipAddress?: string
  userAgent?: string
}

export interface DeletionStatus {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  reason?: string
  requestedAt: string
  scheduledFor: string
  completedAt?: string
  errorMessage?: string
  canCancel: boolean
}

export interface DeletionResult {
  success: boolean
  deletionId?: string
  scheduledFor?: Date
  error?: string
}

export interface DataCleanupSummary {
  profiles: number
  preferences: number
  activities: number
  sessions: number
  avatars: number
  exports: number
  organizations: number
  totalItems: number
}

export class AccountDeletionService {
  private supabase: ReturnType<typeof createClient<Database>>
  private readonly DELETION_GRACE_PERIOD_DAYS = 30 // GDPR compliance - 30 day grace period

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables')
    }

    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  /**
   * Request account deletion with grace period
   */
  async requestAccountDeletion(request: DeletionRequest): Promise<DeletionResult> {
    try {
      const { userId, reason, confirmationText, password, ipAddress, userAgent } = request

      // Validate confirmation text
      if (confirmationText !== 'DELETE MY ACCOUNT') {
        return { success: false, error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" exactly.' }
      }

      // Check for existing pending deletion requests
      const { data: existingRequest } = await this.supabase
        .from('account_deletions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending', 'processing'])
        .single()

      if (existingRequest) {
        return { 
          success: false, 
          error: 'Account deletion is already in progress',
          deletionId: existingRequest.id,
          scheduledFor: new Date(existingRequest.scheduled_for)
        }
      }

      // Calculate deletion date (30 days from now for grace period)
      const scheduledFor = new Date()
      scheduledFor.setDate(scheduledFor.getDate() + this.DELETION_GRACE_PERIOD_DAYS)

      const deletionId = crypto.randomUUID()

      // Create deletion request
      const { error: insertError } = await this.supabase
        .from('account_deletions')
        .insert({
          id: deletionId,
          user_id: userId,
          status: 'pending',
          reason: reason || 'User requested',
          confirmation_text: confirmationText,
          requested_at: new Date().toISOString(),
          scheduled_for: scheduledFor.toISOString(),
          grace_period_days: this.DELETION_GRACE_PERIOD_DAYS,
          can_cancel: true
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      // Log the deletion request
      await auditService.logSecurityEvent({
        userId,
        action: 'account_deletion_requested',
        resource: 'account',
        resourceId: deletionId,
        details: {
          reason,
          scheduled_for: scheduledFor.toISOString(),
          grace_period_days: this.DELETION_GRACE_PERIOD_DAYS,
          can_cancel: true
        },
        ipAddress,
        userAgent,
        status: 'success',
        severity: 'high',
        eventType: 'configuration_change',
        riskLevel: 'high'
      })

      // TODO: Send email notification about deletion request
      // await this.sendDeletionNotificationEmail(userId, deletionId, scheduledFor)

      return {
        success: true,
        deletionId,
        scheduledFor
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request account deletion'
      }
    }
  }

  /**
   * Cancel pending account deletion
   */
  async cancelAccountDeletion(deletionId: string, userId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get deletion request
      const { data: deletion, error: fetchError } = await this.supabase
        .from('account_deletions')
        .select('*')
        .eq('id', deletionId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !deletion) {
        return { success: false, error: 'Deletion request not found' }
      }

      if (deletion.status !== 'pending') {
        return { success: false, error: 'Cannot cancel deletion request in current status' }
      }

      if (!deletion.can_cancel) {
        return { success: false, error: 'This deletion request cannot be cancelled' }
      }

      // Cancel the deletion
      const { error: updateError } = await this.supabase
        .from('account_deletions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'User cancelled',
          can_cancel: false
        })
        .eq('id', deletionId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Log the cancellation
      await auditService.logSecurityEvent({
        userId,
        action: 'account_deletion_cancelled',
        resource: 'account',
        resourceId: deletionId,
        details: {
          cancellation_reason: reason,
          original_scheduled_for: deletion.scheduled_for
        },
        status: 'success',
        severity: 'medium',
        eventType: 'configuration_change',
        riskLevel: 'medium'
      })

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel account deletion'
      }
    }
  }

  /**
   * Get user's account deletion status
   */
  async getDeletionStatus(userId: string): Promise<{ success: boolean; deletion?: DeletionStatus; error?: string }> {
    try {
      const { data: deletion, error } = await this.supabase
        .from('account_deletions')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { success: false, error: error.message }
      }

      if (!deletion) {
        return { success: true } // No deletion request found
      }

      const deletionStatus: DeletionStatus = {
        id: deletion.id,
        userId: deletion.user_id,
        status: deletion.status as any,
        reason: deletion.reason,
        requestedAt: deletion.requested_at,
        scheduledFor: deletion.scheduled_for,
        completedAt: deletion.completed_at,
        errorMessage: deletion.error_message,
        canCancel: deletion.can_cancel && deletion.status === 'pending'
      }

      return { success: true, deletion: deletionStatus }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deletion status'
      }
    }
  }

  /**
   * Process scheduled deletions (should be run periodically)
   */
  async processScheduledDeletions(): Promise<{ success: boolean; processedCount?: number; error?: string }> {
    try {
      // Get deletions scheduled for today or earlier
      const { data: scheduledDeletions, error: fetchError } = await this.supabase
        .from('account_deletions')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())

      if (fetchError) {
        return { success: false, error: fetchError.message }
      }

      if (!scheduledDeletions || scheduledDeletions.length === 0) {
        return { success: true, processedCount: 0 }
      }

      let processedCount = 0

      for (const deletion of scheduledDeletions) {
        try {
          await this.executeAccountDeletion(deletion.id, deletion.user_id)
          processedCount++
        } catch (error) {
          console.error(`Failed to process deletion ${deletion.id}:`, error)
          
          // Mark deletion as failed
          await this.supabase
            .from('account_deletions')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('id', deletion.id)
        }
      }

      return { success: true, processedCount }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process scheduled deletions'
      }
    }
  }

  /**
   * Execute the actual account deletion
   */
  private async executeAccountDeletion(deletionId: string, userId: string): Promise<void> {
    // Mark deletion as processing
    await this.supabase
      .from('account_deletions')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', deletionId)

    const cleanupSummary: DataCleanupSummary = {
      profiles: 0,
      preferences: 0,
      activities: 0,
      sessions: 0,
      avatars: 0,
      exports: 0,
      organizations: 0,
      totalItems: 0
    }

    try {
      // 1. Delete user avatars and files
      const { data: avatars } = await this.supabase
        .from('user_avatars')
        .select('id')
        .eq('user_id', userId)

      if (avatars) {
        cleanupSummary.avatars = avatars.length
        await this.supabase
          .from('user_avatars')
          .delete()
          .eq('user_id', userId)
      }

      // 2. Delete data exports and files
      const { data: exports } = await this.supabase
        .from('data_exports')
        .select('id')
        .eq('user_id', userId)

      if (exports) {
        cleanupSummary.exports = exports.length
        
        // Delete export files first
        for (const exportRecord of exports) {
          await this.supabase
            .from('data_export_files')
            .delete()
            .eq('export_id', exportRecord.id)
        }
        
        // Delete export records
        await this.supabase
          .from('data_exports')
          .delete()
          .eq('user_id', userId)
      }

      // 3. Delete user sessions
      const { data: sessions } = await this.supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)

      if (sessions) {
        cleanupSummary.sessions = sessions.length
        await this.supabase
          .from('user_sessions')
          .delete()
          .eq('user_id', userId)
      }

      // 4. Delete user activities (keep some for audit purposes - last 100)
      const { data: activities } = await this.supabase
        .from('user_activity')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1000) // Delete older activities, keep recent ones for audit

      if (activities) {
        const activityIds = activities.slice(0, -100).map(a => a.id) // Keep last 100
        if (activityIds.length > 0) {
          cleanupSummary.activities = activityIds.length
          await this.supabase
            .from('user_activity')
            .delete()
            .in('id', activityIds)
        }
      }

      // 5. Delete user preferences
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('user_id')
        .eq('user_id', userId)

      if (preferences && preferences.length > 0) {
        cleanupSummary.preferences = 1
        await this.supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', userId)
      }

      // 6. Anonymize user profile (don't delete completely for referential integrity)
      const { data: user } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (user) {
        cleanupSummary.profiles = 1
        
        // Build update object with only existing columns
        const updateData: any = {
          email: `deleted-${userId}@example.com`,
          name: null,
          avatar_url: null,
          is_deleted: true,
          deleted_at: new Date().toISOString()
        }

        // Only add first_name, last_name, bio, phone, website if they exist in the schema
        // This prevents errors if the profile additions haven't been applied yet
        try {
          // Try to update with all possible fields, database will ignore unknown columns
          const { error } = await this.supabase
            .from('users')
            .update({
              ...updateData,
              first_name: null,
              last_name: null,
              bio: null,
              phone: null,
              website: null
            })
            .eq('id', userId)

          // If that fails, try with just the basic fields
          if (error) {
            await this.supabase
              .from('users')
              .update(updateData)
              .eq('id', userId)
          }
        } catch (fallbackError) {
          // Final fallback - just mark as deleted
          await this.supabase
            .from('users')
            .update({
              email: `deleted-${userId}@example.com`,
              is_deleted: true,
              deleted_at: new Date().toISOString()
            })
            .eq('id', userId)
        }
      }

      // 7. Remove user from organizations (but keep records for audit)
      const { data: orgMembers } = await this.supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', userId)

      if (orgMembers) {
        cleanupSummary.organizations = orgMembers.length
        await this.supabase
          .from('organization_members')
          .update({
            status: 'removed',
            removed_at: new Date().toISOString(),
            removed_reason: 'account_deleted'
          })
          .eq('user_id', userId)
      }

      // 8. Finally, delete the user from auth.users (if using Supabase Auth)
      // Note: This should be done carefully as it affects authentication
      // In production, you might want to disable the user instead
      
      cleanupSummary.totalItems = 
        cleanupSummary.profiles +
        cleanupSummary.preferences +
        cleanupSummary.activities +
        cleanupSummary.sessions +
        cleanupSummary.avatars +
        cleanupSummary.exports +
        cleanupSummary.organizations

      // Mark deletion as completed
      await this.supabase
        .from('account_deletions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          cleanup_summary: cleanupSummary
        })
        .eq('id', deletionId)

      // Log final deletion event
      await auditService.logSecurityEvent({
        userId,
        action: 'account_deletion_completed',
        resource: 'account',
        resourceId: deletionId,
        details: {
          cleanup_summary: cleanupSummary,
          deletion_type: 'full_cleanup'
        },
        status: 'success',
        severity: 'critical',
        eventType: 'configuration_change',
        riskLevel: 'critical'
      })

    } catch (error) {
      // Mark deletion as failed
      await this.supabase
        .from('account_deletions')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
          cleanup_summary: cleanupSummary
        })
        .eq('id', deletionId)

      throw error
    }
  }

  /**
   * Get deletion statistics for admin purposes
   */
  async getDeletionStatistics(dateFrom?: Date, dateTo?: Date): Promise<{
    success: boolean
    statistics?: {
      totalRequests: number
      pendingDeletions: number
      completedDeletions: number
      cancelledDeletions: number
      failedDeletions: number
      averageGracePeriodUsage: number
    }
    error?: string
  }> {
    try {
      let query = this.supabase
        .from('account_deletions')
        .select('*')

      if (dateFrom) {
        query = query.gte('requested_at', dateFrom.toISOString())
      }
      if (dateTo) {
        query = query.lte('requested_at', dateTo.toISOString())
      }

      const { data: deletions, error } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      const statistics = {
        totalRequests: deletions?.length || 0,
        pendingDeletions: deletions?.filter(d => d.status === 'pending').length || 0,
        completedDeletions: deletions?.filter(d => d.status === 'completed').length || 0,
        cancelledDeletions: deletions?.filter(d => d.status === 'cancelled').length || 0,
        failedDeletions: deletions?.filter(d => d.status === 'failed').length || 0,
        averageGracePeriodUsage: 0 // TODO: Calculate based on actual usage
      }

      return { success: true, statistics }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get deletion statistics'
      }
    }
  }
}

// Singleton instance
export const accountDeletionService = new AccountDeletionService()

// Factory function for custom supabase client
export function createAccountDeletionService(supabase: ReturnType<typeof createClient<Database>>) {
  const service = Object.create(AccountDeletionService.prototype)
  service.supabase = supabase
  service.DELETION_GRACE_PERIOD_DAYS = 30
  return service as AccountDeletionService
}