'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from './useAuth'
import type { UserPreferences } from '../types/user'

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null
  loading: boolean
  error: string | null
  updatePreferences: (data: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>
  resetPreferences: () => Promise<{ success: boolean; error?: string }>
  refreshPreferences: () => Promise<void>
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No preferences found, create default ones
          const defaultPreferences = await createDefaultPreferences()
          setPreferences(defaultPreferences)
        } else {
          throw fetchError
        }
      } else {
        setPreferences(data as UserPreferences)
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Create default preferences for new users
  const createDefaultPreferences = useCallback(async (): Promise<UserPreferences> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    const defaultData = {
      user_id: user.id,
      theme: 'system' as const,
      language: 'en',
      date_format: 'MM/dd/yyyy',
      time_format: '12h' as const,
      email_notifications_enabled: true,
      email_frequency: 'immediate' as const,
      email_digest: true,
      notify_security_alerts: true,
      notify_account_updates: true,
      notify_organization_updates: true,
      notify_project_updates: true,
      notify_mentions: true,
      notify_comments: true,
      notify_invitations: true,
      notify_billing_alerts: true,
      notify_feature_announcements: false,
      browser_notifications_enabled: false,
      desktop_notifications_enabled: false,
      mobile_notifications_enabled: false,
      marketing_emails: false,
      product_updates: true,
      newsletters: false,
      surveys: false,
      profile_visibility: 'organization' as const,
      email_visibility: 'organization' as const,
      activity_visibility: 'organization' as const,
      hide_last_seen: false,
      hide_activity_status: false,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone_aware: true,
      reduce_motion: false,
      high_contrast: false,
      screen_reader_optimized: false,
      data_retention_period: 365,
      auto_delete_inactive: false,
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .insert(defaultData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as UserPreferences
  }, [user, supabase])

  // Update preferences
  const updatePreferences = useCallback(async (
    updateData: Partial<UserPreferences>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !preferences) {
      return { success: false, error: 'User not authenticated or preferences not loaded' }
    }

    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setPreferences(data as UserPreferences)
      
      // Apply theme change immediately
      if (updateData.theme) {
        applyTheme(updateData.theme)
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to update preferences:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [user, preferences, supabase])

  // Reset preferences to defaults
  const resetPreferences = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    try {
      setError(null)

      // Delete existing preferences
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)

      // Create new default preferences
      const defaultPreferences = await createDefaultPreferences()
      setPreferences(defaultPreferences)

      return { success: true }
    } catch (err) {
      console.error('Failed to reset preferences:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset preferences'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [user, supabase, createDefaultPreferences])

  // Refresh preferences
  const refreshPreferences = useCallback(async () => {
    setLoading(true)
    await loadPreferences()
  }, [loadPreferences])

  // Apply theme to document
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (theme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemPrefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [])

  // Load preferences on mount and user change
  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  // Apply initial theme
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme)
    }
  }, [preferences?.theme, applyTheme])

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (preferences?.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        applyTheme('system')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [preferences?.theme, applyTheme])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    refreshPreferences,
  }
}