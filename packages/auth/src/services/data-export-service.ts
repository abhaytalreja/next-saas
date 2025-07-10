import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { auditService } from './audit-service'

type Tables = Database['public']['Tables']

export interface DataExportRequest {
  userId: string
  exportType: 'full' | 'profile' | 'activity' | 'preferences' | 'avatars'
  format: 'json' | 'csv'
  includeDeleted?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface DataExportResult {
  success: boolean
  exportId?: string
  downloadUrl?: string
  expiresAt?: Date
  estimatedSize?: number
  error?: string
}

export interface UserDataExport {
  exportInfo: {
    exportId: string
    userId: string
    exportType: string
    format: string
    createdAt: string
    expiresAt: string
  }
  profile?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    displayName: string | null
    bio: string | null
    location: string | null
    timezone: string | null
    company: string | null
    jobTitle: string | null
    phoneNumber: string | null
    avatarUrl: string | null
    createdAt: string
    updatedAt: string
  }
  preferences?: {
    theme: string
    language: string
    dateFormat: string
    timeFormat: string
    emailNotificationsEnabled: boolean
    emailFrequency: string
    profileVisibility: string
    emailVisibility: string
    activityVisibility: string
    [key: string]: any
  }
  activity?: Array<{
    id: string
    action: string
    resource: string
    resourceId: string | null
    status: string
    severity: string
    ipAddress: string | null
    userAgent: string | null
    details: Record<string, any> | null
    createdAt: string
  }>
  sessions?: Array<{
    id: string
    deviceName: string | null
    deviceType: string | null
    browserName: string | null
    browserVersion: string | null
    osName: string | null
    osVersion: string | null
    ipAddress: string | null
    country: string | null
    city: string | null
    isActive: boolean
    lastActivityAt: string
    createdAt: string
    revokedAt: string | null
    revokedReason: string | null
  }>
  avatars?: Array<{
    id: string
    filename: string
    originalFilename: string
    mimeType: string
    fileSize: number
    imageUrl: string | null
    status: string
    uploadedAt: string
    processedAt: string | null
  }>
}

export class DataExportService {
  private supabase: ReturnType<typeof createClient<Database>>

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
   * Initiate a data export request
   */
  async requestDataExport(request: DataExportRequest): Promise<DataExportResult> {
    try {
      const exportId = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Exports expire after 7 days

      // Create export record
      const { error: insertError } = await this.supabase
        .from('data_exports')
        .insert({
          id: exportId,
          user_id: request.userId,
          export_type: request.exportType,
          format: request.format,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          requested_at: new Date().toISOString()
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      // Log the export request
      await auditService.logDataAccess({
        userId: request.userId,
        action: 'data_export_requested',
        resource: 'data_export',
        resourceId: exportId,
        details: {
          export_type: request.exportType,
          format: request.format,
          include_deleted: request.includeDeleted,
          date_range: request.dateRange
        }
      })

      // Process export asynchronously
      this.processDataExport(exportId, request).catch(error => {
        console.error('Failed to process data export:', error)
        this.markExportAsFailed(exportId, error.message)
      })

      return {
        success: true,
        exportId,
        expiresAt
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request data export'
      }
    }
  }

  /**
   * Get export status
   */
  async getExportStatus(exportId: string, userId: string): Promise<{ success: boolean; export?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('data_exports')
        .select('*')
        .eq('id', exportId)
        .eq('user_id', userId)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, export: data }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get export status'
      }
    }
  }

  /**
   * Process the actual data export
   */
  private async processDataExport(exportId: string, request: DataExportRequest): Promise<void> {
    try {
      // Update status to processing
      await this.supabase
        .from('data_exports')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', exportId)

      // Collect user data based on export type
      const userData = await this.collectUserData(request)

      // Generate export file
      const exportData: UserDataExport = {
        exportInfo: {
          exportId,
          userId: request.userId,
          exportType: request.exportType,
          format: request.format,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        ...userData
      }

      // Convert to requested format
      let fileContent: string
      let mimeType: string
      let filename: string

      if (request.format === 'json') {
        fileContent = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        filename = `data-export-${exportId}.json`
      } else {
        fileContent = this.convertToCSV(exportData)
        mimeType = 'text/csv'
        filename = `data-export-${exportId}.csv`
      }

      // Store file (in production, you'd upload to secure storage)
      // For now, we'll store the content in the database
      const fileSizeBytes = Buffer.byteLength(fileContent, 'utf8')

      // Update export record with completion
      await this.supabase
        .from('data_exports')
        .update({
          status: 'completed',
          file_size: fileSizeBytes,
          filename,
          mime_type: mimeType,
          completed_at: new Date().toISOString(),
          // In production, you'd store the file URL here
          download_url: `/api/profile/data-export/${exportId}/download`
        })
        .eq('id', exportId)

      // Store the actual file content temporarily (in production, use proper file storage)
      await this.supabase
        .from('data_export_files')
        .insert({
          export_id: exportId,
          content: fileContent,
          created_at: new Date().toISOString()
        })

      // Log completion
      await auditService.logDataAccess({
        userId: request.userId,
        action: 'data_export_completed',
        resource: 'data_export',
        resourceId: exportId,
        details: {
          file_size: fileSizeBytes,
          format: request.format,
          export_type: request.exportType
        }
      })

    } catch (error) {
      console.error('Export processing failed:', error)
      await this.markExportAsFailed(exportId, error instanceof Error ? error.message : 'Processing failed')
    }
  }

  /**
   * Collect user data based on export type
   */
  private async collectUserData(request: DataExportRequest): Promise<Partial<UserDataExport>> {
    const { userId, exportType, includeDeleted = false, dateRange } = request
    const data: Partial<UserDataExport> = {}

    try {
      // Always include profile data for full exports
      if (exportType === 'full' || exportType === 'profile') {
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profile) {
          data.profile = {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            displayName: profile.display_name,
            bio: profile.bio,
            location: profile.location,
            timezone: profile.timezone,
            company: profile.company,
            jobTitle: profile.job_title,
            phoneNumber: profile.phone_number,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          }
        }
      }

      // Include preferences
      if (exportType === 'full' || exportType === 'preferences') {
        const { data: preferences } = await this.supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (preferences) {
          data.preferences = {
            theme: preferences.theme || 'system',
            language: preferences.language || 'en',
            dateFormat: preferences.date_format || 'MM/dd/yyyy',
            timeFormat: preferences.time_format || '12h',
            emailNotificationsEnabled: preferences.email_notifications_enabled || false,
            emailFrequency: preferences.email_frequency || 'daily',
            profileVisibility: preferences.profile_visibility || 'organization',
            emailVisibility: preferences.email_visibility || 'organization',
            activityVisibility: preferences.activity_visibility || 'private',
            // Include all other preference fields
            ...Object.fromEntries(
              Object.entries(preferences).filter(([key]) => 
                !['user_id', 'created_at', 'updated_at'].includes(key)
              )
            )
          }
        }
      }

      // Include activity data
      if (exportType === 'full' || exportType === 'activity') {
        let activityQuery = this.supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (dateRange) {
          activityQuery = activityQuery
            .gte('created_at', dateRange.from.toISOString())
            .lte('created_at', dateRange.to.toISOString())
        }

        const { data: activities } = await activityQuery

        if (activities) {
          data.activity = activities.map(activity => ({
            id: activity.id,
            action: activity.action,
            resource: activity.resource,
            resourceId: activity.resource_id,
            status: activity.status || 'unknown',
            severity: activity.severity || 'low',
            ipAddress: activity.ip_address,
            userAgent: activity.user_agent,
            details: activity.details || {},
            createdAt: activity.created_at
          }))
        }
      }

      // Include session data
      if (exportType === 'full') {
        let sessionQuery = this.supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!includeDeleted) {
          sessionQuery = sessionQuery.is('revoked_at', null)
        }

        const { data: sessions } = await sessionQuery

        if (sessions) {
          data.sessions = sessions.map(session => ({
            id: session.id,
            deviceName: session.device_name,
            deviceType: session.device_type,
            browserName: session.browser_name,
            browserVersion: session.browser_version,
            osName: session.os_name,
            osVersion: session.os_version,
            ipAddress: session.ip_address,
            country: session.country,
            city: session.city,
            isActive: session.is_active || false,
            lastActivityAt: session.last_activity_at || session.created_at,
            createdAt: session.created_at,
            revokedAt: session.revoked_at,
            revokedReason: session.revoked_reason
          }))
        }
      }

      // Include avatar data
      if (exportType === 'full' || exportType === 'avatars') {
        let avatarQuery = this.supabase
          .from('user_avatars')
          .select('*')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false })

        const { data: avatars } = await avatarQuery

        if (avatars) {
          data.avatars = avatars.map(avatar => ({
            id: avatar.id,
            filename: avatar.filename,
            originalFilename: avatar.original_filename || avatar.filename,
            mimeType: avatar.mime_type || 'unknown',
            fileSize: avatar.file_size || 0,
            imageUrl: avatar.image_url,
            status: avatar.status || 'unknown',
            uploadedAt: avatar.uploaded_at,
            processedAt: avatar.processed_at
          }))
        }
      }

      return data

    } catch (error) {
      console.error('Error collecting user data:', error)
      throw error
    }
  }

  /**
   * Convert export data to CSV format
   */
  private convertToCSV(data: UserDataExport): string {
    const sections: string[] = []

    // Profile section
    if (data.profile) {
      sections.push('PROFILE DATA')
      sections.push(this.objectToCSV([data.profile]))
      sections.push('')
    }

    // Preferences section
    if (data.preferences) {
      sections.push('PREFERENCES DATA')
      sections.push(this.objectToCSV([data.preferences]))
      sections.push('')
    }

    // Activity section
    if (data.activity && data.activity.length > 0) {
      sections.push('ACTIVITY DATA')
      sections.push(this.objectToCSV(data.activity))
      sections.push('')
    }

    // Sessions section
    if (data.sessions && data.sessions.length > 0) {
      sections.push('SESSIONS DATA')
      sections.push(this.objectToCSV(data.sessions))
      sections.push('')
    }

    // Avatars section
    if (data.avatars && data.avatars.length > 0) {
      sections.push('AVATARS DATA')
      sections.push(this.objectToCSV(data.avatars))
      sections.push('')
    }

    return sections.join('\n')
  }

  /**
   * Convert array of objects to CSV format
   */
  private objectToCSV(objects: any[]): string {
    if (objects.length === 0) return ''

    const headers = Object.keys(objects[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = objects.map(obj => 
      headers.map(header => {
        const value = obj[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    )

    return [csvHeaders, ...csvRows].join('\n')
  }

  /**
   * Mark export as failed
   */
  private async markExportAsFailed(exportId: string, errorMessage: string): Promise<void> {
    try {
      await this.supabase
        .from('data_exports')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString()
        })
        .eq('id', exportId)
    } catch (error) {
      console.error('Failed to mark export as failed:', error)
    }
  }

  /**
   * Get export file content
   */
  async getExportFile(exportId: string, userId: string): Promise<{ success: boolean; content?: string; filename?: string; mimeType?: string; error?: string }> {
    try {
      // Verify export ownership and status
      const { data: exportRecord, error: exportError } = await this.supabase
        .from('data_exports')
        .select('*')
        .eq('id', exportId)
        .eq('user_id', userId)
        .single()

      if (exportError || !exportRecord) {
        return { success: false, error: 'Export not found' }
      }

      if (exportRecord.status !== 'completed') {
        return { success: false, error: 'Export not ready for download' }
      }

      if (new Date(exportRecord.expires_at) < new Date()) {
        return { success: false, error: 'Export has expired' }
      }

      // Get file content
      const { data: fileData, error: fileError } = await this.supabase
        .from('data_export_files')
        .select('content')
        .eq('export_id', exportId)
        .single()

      if (fileError || !fileData) {
        return { success: false, error: 'Export file not found' }
      }

      // Log download
      await auditService.logDataAccess({
        userId,
        action: 'data_export_downloaded',
        resource: 'data_export',
        resourceId: exportId,
        details: {
          file_size: exportRecord.file_size,
          format: exportRecord.format
        }
      })

      return {
        success: true,
        content: fileData.content,
        filename: exportRecord.filename || `export-${exportId}.json`,
        mimeType: exportRecord.mime_type || 'application/json'
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get export file'
      }
    }
  }

  /**
   * Clean up expired exports
   */
  async cleanupExpiredExports(): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      // Delete expired export files
      const { data: expiredExports } = await this.supabase
        .from('data_exports')
        .select('id')
        .lt('expires_at', new Date().toISOString())

      if (expiredExports && expiredExports.length > 0) {
        const exportIds = expiredExports.map(e => e.id)

        // Delete file contents
        await this.supabase
          .from('data_export_files')
          .delete()
          .in('export_id', exportIds)

        // Delete export records
        await this.supabase
          .from('data_exports')
          .delete()
          .in('id', exportIds)

        return { success: true, deletedCount: expiredExports.length }
      }

      return { success: true, deletedCount: 0 }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup exports'
      }
    }
  }
}

// Singleton instance
export const dataExportService = new DataExportService()