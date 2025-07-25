'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization, useCurrentMembership } from '../../hooks'
import { OrganizationSwitcher } from '../ui/OrganizationSwitcher'
import { UniversalProfileManager } from '../../lib/universal-profile-manager'
import { createActivityService } from '../../services/activity-service'
import { getSupabaseBrowserClient } from '../../lib/auth-client'
import { useAuth } from '../../hooks/useAuth'
import { 
  BuildingOfficeIcon,
  UserCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import type { UserActivity, UserProfile } from '../../types/user'

interface OrganizationProfileSwitcherProps {
  className?: string
  onProfileChanged?: (profile: UserProfile) => void
  onActivityChanged?: (activities: UserActivity[]) => void
  showActivityPreview?: boolean
  showPermissions?: boolean
}

export function OrganizationProfileSwitcher({
  className = '',
  onProfileChanged,
  onActivityChanged,
  showActivityPreview = true,
  showPermissions = true
}: OrganizationProfileSwitcherProps) {
  const { user } = useAuth()
  const { currentOrganization, loading: orgLoading } = useOrganization()
  const { membership } = useCurrentMembership()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = getSupabaseBrowserClient()

  // Load profile data when organization changes
  useEffect(() => {
    if (!user) return
    
    loadProfileData()
  }, [user, currentOrganization])

  const loadProfileData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const profileManager = new UniversalProfileManager(supabase, user.id)
      
      // Get profile data with organization context
      const profileData = await profileManager.getProfile({
        organizationId: currentOrganization?.id,
        includePreferences: true,
        includeActivity: showActivityPreview,
        includeAvatars: true
      })
      
      setProfile(profileData.profile)
      
      if (profileData.activity) {
        setActivities(profileData.activity)
        onActivityChanged?.(profileData.activity)
      }
      
      onProfileChanged?.(profileData.profile)
      
      // Log organization context switch for profile viewing
      if (currentOrganization) {
        const activityService = createActivityService(supabase)
        await activityService.trackOrganizationActivity(
          { 
            userId: user.id,
            organizationId: currentOrganization.id 
          },
          {
            action: 'org_profile_viewed',
            organizationId: currentOrganization.id,
            details: {
              profile_completeness: profileData.profile.completeness_score,
              membership_role: membership?.role,
              context: 'profile_management'
            }
          }
        )
      }
      
    } catch (err) {
      console.error('Failed to load profile data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const getOrganizationModeInfo = () => {
    if (!currentOrganization) {
      return {
        mode: 'none',
        description: 'Personal Profile - Visible to all users',
        icon: GlobeAltIcon,
        visibility: 'public'
      }
    }
    
    // Check if this is single organization mode or multi-organization mode
    const orgMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    
    if (orgMode === 'single') {
      return {
        mode: 'single',
        description: `Organization Profile - Visible to ${currentOrganization.name} members`,
        icon: BuildingOfficeIcon,
        visibility: 'organization'
      }
    }
    
    return {
      mode: 'multi',
      description: `${currentOrganization.name} Profile - Context-specific settings`,
      icon: UsersIcon,
      visibility: 'organization-context'
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <GlobeAltIcon className="h-4 w-4 text-green-500" />
      case 'organization':
        return <UsersIcon className="h-4 w-4 text-blue-500" />
      case 'private':
        return <EyeSlashIcon className="h-4 w-4 text-gray-500" />
      default:
        return <EyeIcon className="h-4 w-4 text-orange-500" />
    }
  }

  const getMembershipBadge = () => {
    if (!membership) return null
    
    const roleColors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[membership.role] || roleColors.member}`}>
        <ShieldCheckIcon className="h-3 w-3 mr-1" />
        {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
      </span>
    )
  }

  if (orgLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-gray-100 animate-pulse rounded-lg p-4">
          <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  const modeInfo = getOrganizationModeInfo()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Organization Context Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <modeInfo.icon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Profile Context
                </h3>
                {getMembershipBadge()}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {modeInfo.description}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  {getVisibilityIcon(modeInfo.visibility)}
                  <span>Visibility: {modeInfo.visibility.replace('-', ' ')}</span>
                </div>
                
                {profile && (
                  <div className="flex items-center space-x-1">
                    <UserCircleIcon className="h-4 w-4" />
                    <span>Completeness: {profile.completeness_score || 0}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Organization Switcher */}
          <div className="flex-shrink-0">
            <OrganizationSwitcher
              className="min-w-64"
              size="sm"
              showCreateOption={false}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Organization Permissions Summary */}
      {showPermissions && membership && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Your Permissions in {currentOrganization?.name}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs text-blue-800">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${membership.permissions?.includes('profile:update') || membership.role === 'owner' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>Update Profile</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${membership.permissions?.includes('profile:view') || membership.role === 'owner' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>View Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${membership.permissions?.includes('data:export') || membership.role === 'owner' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>Export Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${membership.role === 'owner' || membership.role === 'admin' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>Manage Settings</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Preview */}
      {showActivityPreview && activities.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Activity in {currentOrganization?.name || 'Global Context'}
          </h4>
          <div className="space-y-2">
            {activities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 text-sm">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <span className="text-gray-600 truncate">
                  {activity.description || activity.action}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          
          {activities.length > 3 && (
            <button
              onClick={() => onActivityChanged?.(activities)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              View all {activities.length} activities →
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}

// Helper component for compact organization context display
export function OrganizationContextBadge({ className = '' }: { className?: string }) {
  const { currentOrganization } = useOrganization()
  const { membership } = useCurrentMembership()
  
  if (!currentOrganization) {
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}>
        <GlobeAltIcon className="h-3 w-3 mr-1" />
        Personal Profile
      </div>
    )
  }
  
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      <BuildingOfficeIcon className="h-3 w-3 mr-1" />
      {currentOrganization.name}
      {membership && (
        <span className="ml-1 text-blue-600">
          ({membership.role})
        </span>
      )}
    </div>
  )
}