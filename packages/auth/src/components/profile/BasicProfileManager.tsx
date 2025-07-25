'use client'

import React, { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Tab } from '@headlessui/react'
import { 
  UserIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CogIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { EnhancedProfileForm } from '../forms/EnhancedProfileForm'
import { PreferencesForm } from '../forms/PreferencesForm'
import { AvatarUpload } from './AvatarUpload'
import { ActivityDashboard } from '../ui/ActivityDashboard'
import { DataExportManager } from '../data-export/DataExportManager'
import { AccountDeletionManager } from '../account-deletion/AccountDeletionManager'
import type { UserProfile, UserActivity, UserPreferences } from '../../types/user'

interface BasicProfileManagerProps {
  className?: string
  defaultTab?: string
}

const tabs = [
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'avatar', name: 'Avatar', icon: PhotoIcon },
  { id: 'preferences', name: 'Preferences', icon: CogIcon },
  { id: 'activity', name: 'Activity', icon: ClockIcon },
  { id: 'export', name: 'Data Export', icon: ArrowDownTrayIcon },
  { id: 'delete', name: 'Delete Account', icon: TrashIcon }
]

/**
 * Basic profile manager for non-organization applications
 * Provides standard profile management without organization context
 */
export function BasicProfileManager({
  className = '',
  defaultTab = 'profile'
}: BasicProfileManagerProps) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [selectedTab, setSelectedTab] = useState(defaultTab)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load profile data
  useEffect(() => {
    if (!user) return

    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      setProfile(profileData)

      // Load preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        console.warn('Failed to load preferences:', preferencesError)
      } else {
        setPreferences(preferencesData)
      }

      // Load recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (activitiesError) {
        console.warn('Failed to load activities:', activitiesError)
      } else {
        setActivities(activitiesData || [])
      }

    } catch (err) {
      console.error('Failed to load profile data:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('No user')

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    setProfile(data)
    return data
  }

  const updatePreferences = async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
    if (!user) throw new Error('No user')

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    setPreferences(data)
    return data
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Profile</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadProfileData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const getTabIndex = (tabId: string) => tabs.findIndex(tab => tab.id === tabId)
  const selectedIndex = getTabIndex(selectedTab)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal profile and account settings
        </p>
      </div>

      {/* Tab Navigation */}
      <Tab.Group selectedIndex={selectedIndex} onChange={(index) => setSelectedTab(tabs[index].id)}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-gray-700 hover:bg-white/[0.5] hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </div>
              </Tab>
            )
          })}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {/* Profile Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <EnhancedProfileForm
                profile={profile}
                onUpdate={updateProfile}
                onRefresh={loadProfileData}
              />
            </div>
          </Tab.Panel>

          {/* Avatar Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <AvatarUpload
                userId={user?.id || ''}
                currentAvatarUrl={profile?.avatar_url}
                onAvatarUpdate={(url) => {
                  if (profile) {
                    setProfile({ ...profile, avatar_url: url })
                  }
                }}
              />
            </div>
          </Tab.Panel>

          {/* Preferences Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Preferences</h3>
              <PreferencesForm
                preferences={preferences}
                onUpdate={updatePreferences}
              />
            </div>
          </Tab.Panel>

          {/* Activity Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Activity</h3>
              <ActivityDashboard
                activities={activities}
                userId={user?.id || ''}
                context="personal"
              />
            </div>
          </Tab.Panel>

          {/* Data Export Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Your Data</h3>
              <DataExportManager
                userId={user?.id || ''}
                context="personal"
              />
            </div>
          </Tab.Panel>

          {/* Delete Account Tab */}
          <Tab.Panel className="focus:outline-none">
            <div className="bg-white rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
              <AccountDeletionManager
                userId={user?.id || ''}
                context="personal"
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}