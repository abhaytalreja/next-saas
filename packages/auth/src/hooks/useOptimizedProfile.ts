'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { useLoadingState } from './useLoadingState'
import { profileCache, organizationCache, cacheManager } from '../utils/cache'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  email: string
  first_name?: string
  last_name?: string
  name?: string
  bio?: string
  avatar_url?: string
  phone?: string
  website?: string
  location?: string
  timezone?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

interface UseOptimizedProfileOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  preloadAvatar?: boolean
  enableCache?: boolean
}

export function useOptimizedProfile(options: UseOptimizedProfileOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    preloadAvatar = true,
    enableCache = true
  } = options

  const { user } = useAuth()
  const loadingState = useLoadingState()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Memoized cache key
  const cacheKey = useMemo(() => 
    user ? `profile:${user.id}` : null, 
    [user?.id]
  )

  // Load profile data with caching
  const loadProfile = useCallback(async (force = false) => {
    if (!user || !cacheKey) return null

    // Check cache first if not forcing refresh
    if (enableCache && !force) {
      const cached = profileCache.get(cacheKey)
      if (cached && !profileCache.get(`${cacheKey}:stale`)) {
        setProfile(cached)
        setLastFetch(Date.now())
        return cached
      }
    }

    return loadingState.withLoading(
      async () => {
        let data: ProfileData

        if (enableCache) {
          // Use cached fetch with automatic caching
          data = await profileCache.fetch<{ success: boolean; profile: ProfileData }>(
            '/api/profile',
            { method: 'GET' },
            cacheKey
          ).then(response => {
            if (!response.success) {
              throw new Error(response.error || 'Failed to fetch profile')
            }
            return response.profile
          })
        } else {
          // Direct fetch without caching
          const response = await fetch('/api/profile')
          const result = await response.json()
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch profile')
          }
          
          data = result.profile
        }

        setProfile(data)
        setLastFetch(Date.now())

        // Preload avatar if enabled and URL exists
        if (preloadAvatar && data.avatar_url) {
          const img = new Image()
          img.src = data.avatar_url
        }

        return data
      },
      'loadProfile',
      {
        errorMessage: 'Failed to load profile data'
      }
    )
  }, [user, cacheKey, enableCache, preloadAvatar, loadingState])

  // Update profile data
  const updateProfile = useCallback(async (updates: Partial<ProfileData>) => {
    if (!user || !cacheKey) return null

    return loadingState.withLoading(
      async () => {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update profile')
        }

        const updatedProfile = result.profile
        setProfile(updatedProfile)

        // Update cache
        if (enableCache) {
          profileCache.set(cacheKey, updatedProfile)
          // Invalidate related caches
          profileCache.invalidate(/^profile:.*:preferences/)
          organizationCache.invalidate(/directory/)
        }

        toast.success('Profile updated successfully')
        return updatedProfile
      },
      'updateProfile',
      {
        errorMessage: 'Failed to update profile'
      }
    )
  }, [user, cacheKey, enableCache, loadingState])

  // Upload avatar with optimization
  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return null

    return loadingState.withLoading(
      async () => {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to upload avatar')
        }

        // Update profile with new avatar URL
        const updatedProfile = { ...profile, avatar_url: result.avatar_url }
        setProfile(updatedProfile as ProfileData)

        // Update cache
        if (enableCache && cacheKey) {
          profileCache.set(cacheKey, updatedProfile)
          // Invalidate avatar-related caches
          profileCache.invalidate(/avatar/)
          organizationCache.invalidate(/directory/)
        }

        // Preload new avatar
        if (preloadAvatar && result.avatar_url) {
          const img = new Image()
          img.src = result.avatar_url
        }

        toast.success('Avatar updated successfully')
        return result.avatar_url
      },
      'uploadAvatar',
      {
        errorMessage: 'Failed to upload avatar'
      }
    )
  }, [user, profile, cacheKey, enableCache, preloadAvatar, loadingState])

  // Refresh profile data
  const refresh = useCallback(() => {
    return loadProfile(true)
  }, [loadProfile])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return

    const interval = setInterval(() => {
      const age = Date.now() - lastFetch
      if (age >= refreshInterval) {
        loadProfile(false) // Use cache if available
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, lastFetch, loadProfile])

  // Initial load
  useEffect(() => {
    if (user && !profile) {
      loadProfile(false)
    }
  }, [user, profile, loadProfile])

  // Computed values
  const displayName = useMemo(() => {
    if (!profile) return user?.email || 'Unknown User'
    return profile.name || 
           (profile.first_name && profile.last_name 
             ? `${profile.first_name} ${profile.last_name}` 
             : profile.first_name || profile.last_name || profile.email || 'Unknown User')
  }, [profile, user?.email])

  const hasAvatar = useMemo(() => Boolean(profile?.avatar_url), [profile?.avatar_url])

  const isComplete = useMemo(() => {
    if (!profile) return false
    return Boolean(
      profile.first_name && 
      profile.last_name && 
      profile.bio
    )
  }, [profile])

  return {
    // Data
    profile,
    displayName,
    hasAvatar,
    isComplete,
    lastFetch: new Date(lastFetch),

    // Loading states
    isLoading: loadingState.isLoading('loadProfile'),
    isUpdating: loadingState.isLoading('updateProfile'),
    isUploadingAvatar: loadingState.isLoading('uploadAvatar'),
    hasAnyLoading: loadingState.hasAnyLoading,

    // Errors
    loadError: loadingState.error('loadProfile'),
    updateError: loadingState.error('updateProfile'),
    uploadError: loadingState.error('uploadAvatar'),
    hasAnyErrors: loadingState.hasAnyErrors,

    // Actions
    loadProfile,
    updateProfile,
    uploadAvatar,
    refresh,
    clearErrors: loadingState.reset,

    // Cache control
    invalidateCache: () => {
      if (enableCache && cacheKey) {
        profileCache.invalidate(new RegExp(`^${cacheKey}`))
      }
    }
  }
}

// Hook for organization profile optimization
export function useOptimizedOrganizationProfile(organizationId?: string) {
  const { user } = useAuth()
  const loadingState = useLoadingState()
  const [orgProfile, setOrgProfile] = useState<any>(null)

  const cacheKey = useMemo(() => 
    user && organizationId ? `orgProfile:${user.id}:${organizationId}` : null,
    [user?.id, organizationId]
  )

  const loadOrganizationProfile = useCallback(async (force = false) => {
    if (!user || !organizationId || !cacheKey) return null

    // Check cache first
    if (!force) {
      const cached = organizationCache.get(cacheKey)
      if (cached) {
        setOrgProfile(cached)
        return cached
      }
    }

    return loadingState.withLoading(
      async () => {
        const data = await organizationCache.fetch(
          `/api/profile/organization/${organizationId}`,
          { method: 'GET' },
          cacheKey
        )

        setOrgProfile(data.profile)
        return data.profile
      },
      'loadOrgProfile',
      {
        errorMessage: 'Failed to load organization profile'
      }
    )
  }, [user, organizationId, cacheKey, loadingState])

  const updateOrganizationProfile = useCallback(async (updates: any) => {
    if (!user || !organizationId || !cacheKey) return null

    return loadingState.withLoading(
      async () => {
        const response = await fetch(`/api/profile/organization/${organizationId}`, {
          method: orgProfile ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updates, user_id: user.id, organization_id: organizationId })
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to update organization profile')
        }

        setOrgProfile(result.profile)
        organizationCache.set(cacheKey, result.profile)
        
        // Invalidate directory cache
        organizationCache.invalidate(/directory/)

        toast.success('Organization profile updated successfully')
        return result.profile
      },
      'updateOrgProfile',
      {
        errorMessage: 'Failed to update organization profile'
      }
    )
  }, [user, organizationId, orgProfile, cacheKey, loadingState])

  // Initial load
  useEffect(() => {
    if (user && organizationId && !orgProfile) {
      loadOrganizationProfile(false)
    }
  }, [user, organizationId, orgProfile, loadOrganizationProfile])

  return {
    orgProfile,
    isLoading: loadingState.isLoading('loadOrgProfile'),
    isUpdating: loadingState.isLoading('updateOrgProfile'),
    loadError: loadingState.error('loadOrgProfile'),
    updateError: loadingState.error('updateOrgProfile'),
    loadOrganizationProfile,
    updateOrganizationProfile,
    refresh: () => loadOrganizationProfile(true)
  }
}