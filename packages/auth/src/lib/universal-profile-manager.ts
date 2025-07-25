/**
 * Universal Profile Manager for NextSaaS
 * Adapts profile management to different SaaS application types:
 * - 'none': Single-user apps (no organizations)
 * - 'single': One organization per user
 * - 'multi': Multiple organizations per user (full B2B SaaS)
 */

import type { UserProfile, UserPreferences, UserActivity, UserSession, UserAvatar } from '../types/user'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createActivityService, type ActivityContext } from '../services/activity-service'

export type OrganizationMode = 'none' | 'single' | 'multi'

export interface UniversalProfileOptions {
  mode: OrganizationMode
  organizationId?: string
  includePreferences?: boolean
  includeActivity?: boolean
  includeSessions?: boolean
  includeAvatars?: boolean
}

export interface ProfileContext {
  mode: OrganizationMode
  organizationId?: string
  organizationRole?: string
  organizationName?: string
  isOwner?: boolean
  isAdmin?: boolean
  canManageOrgProfile?: boolean
}

export interface UniversalProfileData {
  profile: UserProfile
  preferences?: UserPreferences
  activity?: UserActivity[]
  sessions?: UserSession[]
  avatars?: UserAvatar[]
  context?: ProfileContext
  organizationProfile?: Record<string, any>
  completeness?: {
    overall_score: number
    completion_suggestions: string[]
    missing_fields: string[]
  }
}

export class UniversalProfileManager {
  private supabase: SupabaseClient
  private mode: OrganizationMode
  private userId: string
  private activityService: ReturnType<typeof createActivityService>

  constructor(supabase: SupabaseClient, userId: string, mode?: OrganizationMode) {
    this.supabase = supabase
    this.userId = userId
    this.mode = mode || this.detectOrganizationMode()
    this.activityService = createActivityService(supabase)
  }

  /**
   * Detect organization mode from environment variables
   */
  private detectOrganizationMode(): OrganizationMode {
    const envMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    
    switch (envMode) {
      case 'none':
        return 'none'
      case 'single':
        return 'single'
      case 'multi':
        return 'multi'
      default:
        // Default to single mode if not specified
        return 'single'
    }
  }

  /**
   * Get comprehensive profile data with mode-aware context
   */
  async getProfile(options: Partial<UniversalProfileOptions> = {}): Promise<UniversalProfileData> {
    const opts: UniversalProfileOptions = {
      mode: this.mode,
      includePreferences: false,
      includeActivity: false,
      includeSessions: false,
      includeAvatars: false,
      ...options
    }

    // Base profile query
    const { data: profile, error: profileError } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    const result: UniversalProfileData = { profile }

    // Add profile context based on mode
    result.context = await this.buildProfileContext(opts.organizationId)

    // Include preferences if requested
    if (opts.includePreferences) {
      result.preferences = await this.getPreferences()
    }

    // Include activity if requested
    if (opts.includeActivity) {
      result.activity = await this.getActivity(opts.organizationId)
    }

    // Include sessions if requested
    if (opts.includeSessions) {
      result.sessions = await this.getSessions()
    }

    // Include avatars if requested
    if (opts.includeAvatars) {
      result.avatars = await this.getAvatars()
    }

    // Include organization-specific profile for single/multi modes
    if (opts.mode !== 'none' && opts.organizationId) {
      result.organizationProfile = await this.getOrganizationProfile(opts.organizationId)
    }

    // Include profile completeness
    result.completeness = await this.getProfileCompleteness()

    return result
  }

  /**
   * Update profile with mode-aware validation and context
   */
  async updateProfile(
    data: Partial<UserProfile>,
    organizationId?: string
  ): Promise<UniversalProfileData> {
    // Validate data based on mode requirements
    const validatedData = this.validateProfileData(data, organizationId)

    // Update main profile
    const { data: updatedProfile, error: updateError } = await this.supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', this.userId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    // Log activity based on mode
    await this.logProfileActivity('profile_update', {
      updated_fields: Object.keys(validatedData),
      organization_id: organizationId,
      mode: this.mode
    })

    // Update organization-specific profile if needed
    if (organizationId && this.mode !== 'none') {
      await this.updateOrganizationProfile(organizationId, data)
    }

    // Return updated profile data
    return this.getProfile({ organizationId, includePreferences: true })
  }

  /**
   * Get user preferences with defaults based on mode
   */
  async getPreferences(): Promise<UserPreferences | undefined> {
    const { data: preferences, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      throw new Error(`Failed to fetch preferences: ${error.message}`)
    }

    // Create default preferences if none exist
    if (!preferences) {
      return this.createDefaultPreferences()
    }

    return preferences
  }

  /**
   * Update user preferences with mode-aware defaults
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    const { data: updatedPreferences, error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: this.userId,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update preferences: ${error.message}`)
    }

    await this.logProfileActivity('preferences_update', {
      updated_fields: Object.keys(data),
      mode: this.mode
    })

    return updatedPreferences
  }

  /**
   * Get user activity with organization context
   */
  async getActivity(organizationId?: string, limit = 50): Promise<UserActivity[]> {
    const result = await this.activityService.getUserActivities(this.userId, {
      organizationId: this.mode !== 'none' ? organizationId : undefined,
      limit
    })

    if (!result.success) {
      throw new Error(`Failed to fetch activity: ${result.error}`)
    }

    return result.activities || []
  }

  /**
   * Get activity statistics for the user
   */
  async getActivityStats(organizationId?: string, days: number = 30) {
    return await this.activityService.getUserActivityStats(
      this.userId, 
      this.mode !== 'none' ? organizationId : undefined, 
      days
    )
  }

  /**
   * Get security-related activities for the user
   */
  async getSecurityActivity(limit: number = 20) {
    return await this.activityService.getUserSecurityActivities(this.userId, limit)
  }

  /**
   * Get active user sessions
   */
  async getSessions(): Promise<UserSession[]> {
    const { data: sessions, error } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('user_id', this.userId)
      .is('revoked_at', null)
      .order('last_active_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`)
    }

    return sessions || []
  }

  /**
   * Get user avatars
   */
  async getAvatars(): Promise<UserAvatar[]> {
    const { data: avatars, error } = await this.supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch avatars: ${error.message}`)
    }

    return avatars || []
  }

  /**
   * Get profile completeness information
   */
  async getProfileCompleteness() {
    const { data: completeness, error } = await this.supabase
      .from('profile_completeness')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch profile completeness: ${error.message}`)
    }

    return completeness || {
      overall_score: 0,
      completion_suggestions: [],
      missing_fields: []
    }
  }

  /**
   * Build profile context based on organization mode
   */
  private async buildProfileContext(organizationId?: string): Promise<ProfileContext> {
    const context: ProfileContext = {
      mode: this.mode
    }

    if (this.mode === 'none') {
      return context
    }

    // For single/multi modes, get organization context
    if (organizationId) {
      const { data: membership } = await this.supabase
        .from('memberships')
        .select(`
          role,
          organization_id,
          organizations (
            name,
            slug
          )
        `)
        .eq('user_id', this.userId)
        .eq('organization_id', organizationId)
        .single()

      if (membership) {
        context.organizationId = organizationId
        context.organizationRole = membership.role
        context.organizationName = (membership.organizations as any)?.name
        context.isOwner = membership.role === 'owner'
        context.isAdmin = ['owner', 'admin'].includes(membership.role)
        context.canManageOrgProfile = context.isAdmin
      }
    }

    return context
  }

  /**
   * Get organization-specific profile data
   */
  private async getOrganizationProfile(organizationId: string) {
    // This could be extended to support organization-specific profile fields
    // For now, return organization context from preferences
    const preferences = await this.getPreferences()
    const orgContext = preferences?.organization_context || {}
    return orgContext[organizationId] || {}
  }

  /**
   * Update organization-specific profile
   */
  private async updateOrganizationProfile(organizationId: string, data: any) {
    const preferences = await this.getPreferences()
    const orgContext = preferences?.organization_context || {}
    
    // Store organization-specific data in preferences context
    orgContext[organizationId] = {
      ...orgContext[organizationId],
      ...data,
      updated_at: new Date().toISOString()
    }

    await this.updatePreferences({
      organization_context: orgContext
    })
  }

  /**
   * Validate profile data based on mode requirements
   */
  private validateProfileData(data: Partial<UserProfile>, organizationId?: string) {
    // Basic validation for all modes
    const validatedData: any = {}

    // Copy allowed fields
    const allowedFields = [
      'first_name', 'last_name', 'display_name', 'bio', 'phone', 
      'website', 'job_title', 'company', 'department', 'location', 
      'timezone', 'locale', 'avatar_url'
    ]

    allowedFields.forEach(field => {
      if (field in data) {
        validatedData[field] = data[field as keyof UserProfile]
      }
    })

    // Mode-specific validation
    if (this.mode === 'single' && !organizationId) {
      // For single mode, we might want to ensure organization context
      // This could be handled in the UI layer
    }

    if (this.mode === 'multi' && organizationId) {
      // For multi mode, validate organization membership
      // This validation could be enhanced based on requirements
    }

    return validatedData
  }

  /**
   * Create default preferences based on organization mode
   */
  private async createDefaultPreferences(): Promise<UserPreferences> {
    const defaultPreferences: Partial<UserPreferences> = {
      user_id: this.userId,
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      
      // Mode-specific defaults
      profile_visibility: this.mode === 'none' ? 'public' : 'organization',
      email_visibility: this.mode === 'none' ? 'public' : 'organization',
      activity_visibility: this.mode === 'none' ? 'public' : 'organization',
      
      // Notification defaults based on mode
      notify_organization_updates: this.mode !== 'none',
      notify_project_updates: this.mode !== 'none',
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: preferences, error } = await this.supabase
      .from('user_preferences')
      .insert(defaultPreferences)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create default preferences: ${error.message}`)
    }

    return preferences
  }

  /**
   * Log profile-related activity
   */
  private async logProfileActivity(action: string, metadata: Record<string, any> = {}) {
    const context: ActivityContext = {
      userId: this.userId,
      organizationId: metadata.organization_id
    }

    const profileAction = action as 'profile_update' | 'preferences_update' | 'avatar_upload' | 'avatar_delete' | 'password_change' | 'email_change'

    await this.activityService.trackProfileActivity(context, {
      action: profileAction,
      details: {
        ...metadata,
        organization_mode: this.mode,
        description: this.getActivityDescription(action, metadata)
      },
      metadata: {
        source: 'universal_profile_manager',
        mode: this.mode
      }
    })
  }

  /**
   * Generate user-friendly activity descriptions
   */
  private getActivityDescription(action: string, metadata: Record<string, any>): string {
    switch (action) {
      case 'profile_update':
        const fields = metadata.updated_fields || []
        return `Updated profile fields: ${fields.join(', ')}`
      case 'preferences_update':
        return 'Updated account preferences'
      case 'avatar_upload':
        return 'Updated profile avatar'
      case 'password_change':
        return 'Changed account password'
      default:
        return `Profile action: ${action}`
    }
  }

  /**
   * Static method to create instance with automatic configuration
   */
  static create(supabase: SupabaseClient, userId: string): UniversalProfileManager {
    return new UniversalProfileManager(supabase, userId)
  }

  /**
   * Static method to get organization mode from environment
   */
  static getOrganizationMode(): OrganizationMode {
    const envMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    
    switch (envMode) {
      case 'none':
        return 'none'
      case 'single':
        return 'single'
      case 'multi':
        return 'multi'
      default:
        return 'single'
    }
  }

  /**
   * Static method to check if organization features are enabled
   */
  static hasOrganizations(): boolean {
    return UniversalProfileManager.getOrganizationMode() !== 'none'
  }

  /**
   * Static method to check if multi-organization features are enabled
   */
  static isMultiOrganization(): boolean {
    return UniversalProfileManager.getOrganizationMode() === 'multi'
  }
}