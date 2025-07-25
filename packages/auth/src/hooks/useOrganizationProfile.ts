'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization, useCurrentMembership } from './useOrganization'
import { useAuth } from './useAuth'
import { UniversalProfileManager } from '../lib/universal-profile-manager'
import { createActivityService } from '../services/activity-service'
import { getSupabaseBrowserClient } from '../lib/auth-client'
import type { UserProfile, UserActivity, UserPreferences, UserAvatar } from '../types/user'

interface UseOrganizationProfileOptions {
  includeActivity?: boolean
  includePreferences?: boolean
  includeAvatars?: boolean
  activityLimit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface OrganizationProfileData {
  profile: UserProfile | null
  preferences: UserPreferences | null
  activities: UserActivity[]
  avatars: UserAvatar[]
  stats: {
    completeness_score: number
    activity_count: number
    last_activity?: string
  } | null
}

export function useOrganizationProfile(options: UseOrganizationProfileOptions = {}) {
  const {
    includeActivity = true,
    includePreferences = true,
    includeAvatars = false,
    activityLimit = 50,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const { user } = useAuth()
  const { currentOrganization, loading: orgLoading } = useOrganization()
  const { membership } = useCurrentMembership()
  
  const [data, setData] = useState<OrganizationProfileData>({
    profile: null,
    preferences: null,
    activities: [],
    avatars: [],
    stats: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const supabase = getSupabaseBrowserClient()

  // Load profile data for the current organization context
  const loadProfileData = useCallback(async (force = false) => {
    if (!user || (loading && !force) || orgLoading) return

    setLoading(true)
    setError(null)

    try {
      const profileManager = new UniversalProfileManager(supabase, user.id)
      const activityService = createActivityService(supabase)

      // Get profile data with organization context
      const profileData = await profileManager.getProfile({
        organizationId: currentOrganization?.id,
        includePreferences,
        includeActivity,
        includeAvatars
      })

      let activities: UserActivity[] = []
      let stats = null

      // Get additional activity data if requested
      if (includeActivity) {
        const activityResult = await activityService.getUserActivities(user.id, {
          organizationId: currentOrganization?.id,
          limit: activityLimit
        })

        if (activityResult.success) {
          activities = activityResult.activities || []
        }

        // Get activity statistics
        const statsResult = await activityService.getUserActivityStats(
          user.id,
          currentOrganization?.id,
          30 // Last 30 days
        )

        if (statsResult.success && statsResult.stats) {
          stats = {
            completeness_score: profileData.profile.completeness_score || 0,
            activity_count: statsResult.stats.totalActivities,
            last_activity: statsResult.stats.lastActivity
          }
        }
      }

      setData({
        profile: profileData.profile,
        preferences: profileData.preferences,
        activities: includeActivity ? activities : [],
        avatars: profileData.avatars || [],
        stats
      })

      setLastRefresh(new Date())

      // Log organization context view
      if (currentOrganization) {
        await activityService.trackOrganizationActivity(
          {
            userId: user.id,
            organizationId: currentOrganization.id
          },
          {
            action: 'org_profile_loaded',
            organizationId: currentOrganization.id,
            details: {
              has_preferences: !!profileData.preferences,
              activity_count: activities.length,
              completeness_score: profileData.profile.completeness_score,
              membership_role: membership?.role
            }
          }
        )
      }

    } catch (err) {
      console.error('Failed to load organization profile data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [
    user, 
    currentOrganization, 
    membership,
    includeActivity, 
    includePreferences, 
    includeAvatars, 
    activityLimit,
    orgLoading
  ])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return

    const interval = setInterval(() => {
      loadProfileData(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadProfileData])

  // Load data when dependencies change
  useEffect(() => {
    if (!orgLoading) {
      loadProfileData()
    }
  }, [loadProfileData, orgLoading])

  // Update profile in current organization context
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    try {
      const profileManager = new UniversalProfileManager(supabase, user.id)
      const updatedProfile = await profileManager.updateProfile(updates, currentOrganization?.id)

      setData(prev => ({
        ...prev,
        profile: updatedProfile
      }))

      return updatedProfile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user, currentOrganization])

  // Update preferences in current organization context
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    try {
      const profileManager = new UniversalProfileManager(supabase, user.id)
      const updatedPreferences = await profileManager.updatePreferences(updates)

      setData(prev => ({
        ...prev,
        preferences: updatedPreferences
      }))

      return updatedPreferences
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  // Get organization context information
  const getOrganizationContext = useCallback(() => {
    const mode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase() || 'none'
    
    return {
      mode: mode as 'none' | 'single' | 'multi',
      organization: currentOrganization,
      membership,
      hasOrganization: !!currentOrganization,
      isOwner: membership?.role === 'owner',
      isAdmin: membership?.role === 'admin' || membership?.role === 'owner',
      permissions: membership?.permissions || [],
      canUpdateProfile: !currentOrganization || 
        membership?.permissions?.includes('profile:update') || 
        membership?.role === 'owner',
      canViewActivity: !currentOrganization ||
        membership?.permissions?.includes('profile:view_activity') ||
        membership?.role === 'owner' ||
        membership?.role === 'admin',
      canExportData: !currentOrganization ||
        membership?.permissions?.includes('data:export') ||
        membership?.role === 'owner'
    }
  }, [currentOrganization, membership])

  // Get visibility settings for current context
  const getVisibilitySettings = useCallback(() => {
    if (!data.preferences) {
      return {
        profile_visibility: currentOrganization ? 'organization' : 'public',
        email_visibility: currentOrganization ? 'organization' : 'public',
        activity_visibility: 'private'
      }
    }

    return {
      profile_visibility: data.preferences.profile_visibility || (currentOrganization ? 'organization' : 'public'),
      email_visibility: data.preferences.email_visibility || (currentOrganization ? 'organization' : 'public'),
      activity_visibility: data.preferences.activity_visibility || 'private'
    }
  }, [data.preferences, currentOrganization])

  // Check if specific data is visible to current user in current context
  const isVisible = useCallback((type: 'profile' | 'email' | 'activity') => {
    const visibility = getVisibilitySettings()
    const setting = visibility[`${type}_visibility` as keyof typeof visibility]

    if (setting === 'public') return true
    if (setting === 'private') return false
    if (setting === 'organization' && currentOrganization) return true

    return false
  }, [getVisibilitySettings, currentOrganization])

  // Refresh data manually
  const refresh = useCallback(() => {
    return loadProfileData(true)
  }, [loadProfileData])

  return {
    // Data
    ...data,
    loading: loading || orgLoading,
    error,
    lastRefresh,
    
    // Context
    organizationContext: getOrganizationContext(),
    visibilitySettings: getVisibilitySettings(),
    
    // Actions
    updateProfile,
    updatePreferences,
    refresh,
    
    // Utilities
    isVisible,
    
    // Computed values
    isEmpty: !data.profile && !loading,
    hasChanges: false, // Would track if there are unsaved changes
    isStale: lastRefresh ? (Date.now() - lastRefresh.getTime()) > (refreshInterval || 30000) : false
  }
}

// Specialized hooks for specific use cases
export function useOrganizationActivity(limit = 20) {
  const { activities, loading, refresh } = useOrganizationProfile({
    includeActivity: true,
    includePreferences: false,
    includeAvatars: false,
    activityLimit: limit
  })

  return { activities, loading, refresh }
}

export function useOrganizationProfileStats() {
  const { stats, loading, refresh } = useOrganizationProfile({
    includeActivity: true,
    includePreferences: true,
    includeAvatars: true
  })

  return { stats, loading, refresh }
}

export function useOrganizationVisibility() {
  const { visibilitySettings, isVisible, organizationContext, updatePreferences } = useOrganizationProfile({
    includePreferences: true
  })

  const updateVisibility = useCallback(async (type: 'profile' | 'email' | 'activity', visibility: 'public' | 'organization' | 'private') => {
    const key = `${type}_visibility` as const
    return updatePreferences({ [key]: visibility })
  }, [updatePreferences])

  return {
    visibilitySettings,
    isVisible,
    organizationContext,
    updateVisibility
  }
}