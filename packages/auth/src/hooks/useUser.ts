'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getSupabaseBrowserClient } from '../lib/auth-client'
import { validateFormData, updateProfileSchema } from '../utils/validation'
import type {
  UpdateProfileData,
  UserPreferences,
  AuthResponse,
  UserProfile,
  AuthError,
} from '../types'

/**
 * Hook for user profile management
 */
export function useUser() {
  const { user, updateProfile: authUpdateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const supabase = getSupabaseBrowserClient()

  // Update user profile
  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<AuthResponse<UserProfile>> => {
      if (!user) {
        const error = { message: 'User not authenticated' }
        setError(error)
        return { data: null, error }
      }

      // Validate the input data
      const validation = validateFormData(updateProfileSchema, data)
      if (!validation.success) {
        const error = { message: Object.values(validation.errors!)[0] }
        setError(error)
        return { data: null, error }
      }

      setLoading(true)
      setError(null)

      try {
        // Update user metadata in Supabase Auth
        const { data: authData, error: authError } =
          await supabase.auth.updateUser({
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              full_name:
                data.firstName && data.lastName
                  ? `${data.firstName} ${data.lastName}`
                  : undefined,
              avatar_url: data.avatarUrl,
              timezone: data.timezone,
              locale: data.locale,
            },
          })

        if (authError) {
          setError({ message: authError.message })
          return { data: null, error: { message: authError.message } }
        }

        // Update user profile in the database
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .update({
            name:
              data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : undefined,
            avatar_url: data.avatarUrl,
            timezone: data.timezone,
            locale: data.locale,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()

        if (profileError) {
          setError({ message: profileError.message })
          return { data: null, error: { message: profileError.message } }
        }

        // Create the updated profile object
        const updatedProfile: UserProfile = {
          id: user.id,
          email: user.email!,
          firstName: data.firstName || user.user_metadata.first_name || '',
          lastName: data.lastName || user.user_metadata.last_name || '',
          fullName:
            data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : user.user_metadata.full_name || '',
          avatarUrl: data.avatarUrl || user.user_metadata.avatar_url,
          timezone:
            data.timezone || (user.user_metadata as any).timezone || 'UTC',
          locale: data.locale || (user.user_metadata as any).locale || 'en',
          emailVerified: !!user.email_confirmed_at,
          phoneVerified: !!user.phone_confirmed_at,
          twoFactorEnabled: false, // Would need to check this from user settings
          createdAt: new Date(user.created_at),
          updatedAt: new Date(),
        }

        // Update the auth context
        if (authUpdateProfile) {
          await authUpdateProfile(data)
        }

        return { data: updatedProfile, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to update profile' }
        setError(error)
        return { data: null, error }
      } finally {
        setLoading(false)
      }
    },
    [user, supabase, authUpdateProfile]
  )

  // Get user preferences
  const getPreferences =
    useCallback(async (): Promise<UserPreferences | null> => {
      if (!user) return null

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // Not found error
          console.error('Error fetching user preferences:', error)
          return null
        }

        return data || getDefaultPreferences()
      } catch (err) {
        console.error('Error fetching user preferences:', err)
        return null
      }
    }, [user, supabase])

  // Update user preferences
  const updatePreferences = useCallback(
    async (
      preferences: Partial<UserPreferences>
    ): Promise<AuthResponse<UserPreferences>> => {
      if (!user) {
        const error = { message: 'User not authenticated' }
        return { data: null, error }
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error: dbError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (dbError) {
          setError({ message: dbError.message })
          return { data: null, error: { message: dbError.message } }
        }

        return { data, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to update preferences' }
        setError(error)
        return { data: null, error }
      } finally {
        setLoading(false)
      }
    },
    [user, supabase]
  )

  // Change password
  const changePassword = useCallback(
    async (newPassword: string): Promise<AuthResponse<void>> => {
      if (!user) {
        const error = { message: 'User not authenticated' }
        return { data: null, error }
      }

      setLoading(true)
      setError(null)

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (updateError) {
          setError({ message: updateError.message })
          return { data: null, error: { message: updateError.message } }
        }

        return { data: null, error: null }
      } catch (err: any) {
        const error = { message: err.message || 'Failed to change password' }
        setError(error)
        return { data: null, error }
      } finally {
        setLoading(false)
      }
    },
    [user, supabase]
  )

  // Delete account
  const deleteAccount = useCallback(async (): Promise<AuthResponse<void>> => {
    if (!user) {
      const error = { message: 'User not authenticated' }
      return { data: null, error }
    }

    setLoading(true)
    setError(null)

    try {
      // First, mark user as deleted in the database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (dbError) {
        setError({ message: dbError.message })
        return { data: null, error: { message: dbError.message } }
      }

      // Then sign out the user (actual user deletion would be handled by admin)
      await supabase.auth.signOut()

      return { data: null, error: null }
    } catch (err: any) {
      const error = { message: err.message || 'Failed to delete account' }
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  return {
    user,
    loading,
    error,
    updateProfile,
    getPreferences,
    updatePreferences,
    changePassword,
    deleteAccount,
  }
}

/**
 * Default user preferences
 */
function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    emailNotifications: {
      marketing: true,
      productUpdates: true,
      securityAlerts: true,
      organizationInvites: true,
      projectUpdates: true,
      weeklyDigest: true,
    },
    pushNotifications: {
      enabled: false,
      mentions: true,
      messages: true,
      reminders: true,
      securityAlerts: true,
    },
  }
}

/**
 * Hook for user avatar management
 */
export function useUserAvatar() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const uploadAvatar = useCallback(
    async (file: File): Promise<AuthResponse<string>> => {
      if (!user) {
        const error = { message: 'User not authenticated' }
        return { data: null, error }
      }

      setUploading(true)

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/avatar.${fileExt}`

        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) {
          return { data: null, error: { message: uploadError.message } }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName)

        return { data: publicUrl, error: null }
      } catch (err: any) {
        return {
          data: null,
          error: { message: err.message || 'Failed to upload avatar' },
        }
      } finally {
        setUploading(false)
      }
    },
    [user, supabase]
  )

  return {
    uploading,
    uploadAvatar,
  }
}
