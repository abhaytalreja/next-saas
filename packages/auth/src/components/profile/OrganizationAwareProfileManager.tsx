'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization, useCurrentMembership } from '../../hooks'
import { useAuth } from '../../hooks/useAuth'
import { OrganizationProfileSwitcher } from './OrganizationProfileSwitcher'
import { UniversalProfileManager } from '../../lib/universal-profile-manager'
import { getSupabaseBrowserClient } from '../../lib/auth-client'
import { ProfileForm } from '../forms/ProfileForm'
import { AvatarUpload } from './AvatarUpload'
import { ActivityDashboard } from '../ui/ActivityDashboard'
import { DataExportManager } from '../data-export/DataExportManager'
import { AccountDeletionManager } from '../account-deletion/AccountDeletionManager'
import { 
  LegacyCard as Card, 
  LegacyCardContent as CardContent, 
  LegacyCardDescription as CardDescription, 
  LegacyCardHeader as CardHeader, 
  LegacyCardTitle as CardTitle 
} from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { 
  User, 
  Shield, 
  Activity, 
  Download, 
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Building,
  AlertTriangle
} from 'lucide-react'
import type { UserProfile, UserActivity, UserPreferences } from '../../types/user'

interface OrganizationAwareProfileManagerProps {
  className?: string
  defaultTab?: string
  showOrganizationSwitcher?: boolean
  restrictedTabs?: string[]
}

export function OrganizationAwareProfileManager({
  className = '',
  defaultTab = 'profile',
  showOrganizationSwitcher = true,
  restrictedTabs = []
}: OrganizationAwareProfileManagerProps) {
  const { user } = useAuth()
  const { currentOrganization } = useOrganization()
  const { membership } = useCurrentMembership()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  const supabase = getSupabaseBrowserClient()

  // Check permissions for different tabs
  const canViewTab = (tabId: string): boolean => {
    if (restrictedTabs.includes(tabId)) return false
    
    // Organization-specific permission checks
    if (currentOrganization && membership) {
      switch (tabId) {
        case 'activity':
          return membership.permissions?.includes('profile:view_activity') || 
                 membership.role === 'owner' || 
                 membership.role === 'admin'
        case 'export':
          return membership.permissions?.includes('data:export') || 
                 membership.role === 'owner'
        case 'delete':
          return membership.permissions?.includes('account:delete') || 
                 membership.role === 'owner'
        case 'organization':
          return membership.role === 'owner' || 
                 membership.role === 'admin'
        default:
          return true
      }
    }
    
    // For non-organization contexts, all tabs are available
    return true
  }

  const getProfileVisibilitySettings = () => {
    if (!preferences || !currentOrganization) {
      return {
        profile_visibility: 'public',
        email_visibility: 'public',
        activity_visibility: 'public'
      }
    }
    
    return {
      profile_visibility: preferences.profile_visibility || 'organization',
      email_visibility: preferences.email_visibility || 'organization', 
      activity_visibility: preferences.activity_visibility || 'private'
    }
  }

  const handleProfileChanged = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  const handleActivityChanged = (updatedActivities: UserActivity[]) => {
    setActivities(updatedActivities)
  }

  const getOrganizationContextWarning = () => {
    if (!currentOrganization) return null
    
    const orgMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    
    if (orgMode === 'multi') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                Multi-Organization Context
              </h4>
              <p className="mt-1 text-sm text-amber-700">
                You're viewing and managing your profile within the context of <strong>{currentOrganization.name}</strong>. 
                Some settings and data may be organization-specific. Use the switcher above to change contexts.
              </p>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  const availableTabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Personal information and preferences'
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: Activity,
      description: 'Account activity and security events',
      show: canViewTab('activity')
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: Shield,
      description: 'Privacy settings and account information'
    },
    {
      id: 'organization',
      name: 'Organization',
      icon: Building,
      description: 'Organization-specific settings',
      show: canViewTab('organization') && currentOrganization
    },
    {
      id: 'export',
      name: 'Export',
      icon: Download,
      description: 'Export your data',
      show: canViewTab('export')
    },
    {
      id: 'delete',
      name: 'Delete',
      icon: Trash2,
      description: 'Delete your account',
      show: canViewTab('delete')
    }
  ].filter(tab => tab.show !== false)

  return (
    <div className={`space-y-6 ${className}`} data-testid="organization-aware-profile-manager">
      {/* Organization Context Switcher */}
      {showOrganizationSwitcher && (
        <OrganizationProfileSwitcher
          onProfileChanged={handleProfileChanged}
          onActivityChanged={handleActivityChanged}
          showActivityPreview={true}
          showPermissions={true}
        />
      )}

      {/* Organization Context Warning */}
      {getOrganizationContextWarning()}

      {/* Profile Management Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Management
            {currentOrganization && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                in {currentOrganization.name}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile settings and data
            {currentOrganization ? ' within this organization context' : ' globally'}.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-6">
              {availableTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2"
                  disabled={!canViewTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>
                      Upload and manage your profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvatarUpload
                      data-testid="profile-avatar-upload"
                      onSuccess={(url) => console.log('Avatar uploaded:', url)}
                      onError={(error) => console.error('Avatar error:', error)}
                    />
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProfileForm 
                        organizationId={currentOrganization?.id}
                        onProfileUpdated={handleProfileChanged}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Visibility Settings */}
              {currentOrganization && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                    <CardDescription>
                      Control who can see your profile information in {currentOrganization.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(getProfileVisibilitySettings()).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {value === 'public' ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                            <span className="text-sm font-medium">
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 capitalize">
                            {value.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            {canViewTab('activity') && (
              <TabsContent value="activity" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Activity</CardTitle>
                    <CardDescription>
                      View your recent account activity and security events
                      {currentOrganization && ` within ${currentOrganization.name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityDashboard />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View your account details and verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono">
                        {user?.id}
                      </dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Account Created
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </dd>
                    </div>
                    {currentOrganization && membership && (
                      <>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">
                            Organization Role
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)} in {currentOrganization.name}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">
                            Member Since
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {membership.created_at
                              ? new Date(membership.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'N/A'}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organization Tab */}
            {canViewTab('organization') && currentOrganization && (
              <TabsContent value="organization" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>
                      Manage your settings specific to {currentOrganization.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900">
                          Organization Context
                        </h4>
                        <p className="mt-1 text-sm text-blue-700">
                          Settings and data in this context are specific to {currentOrganization.name} and 
                          may not be visible in other organizational contexts.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-900">Permissions</h5>
                          {membership?.permissions?.map((permission, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                              <span className="text-sm text-gray-600">{permission}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-900">Status</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Role</span>
                              <span className="font-medium">{membership?.role}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status</span>
                              <span className="font-medium text-green-600">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Data Export Tab */}
            {canViewTab('export') && (
              <TabsContent value="export" className="mt-0">
                <DataExportManager />
              </TabsContent>
            )}

            {/* Account Deletion Tab */}
            {canViewTab('delete') && (
              <TabsContent value="delete" className="mt-0">
                <AccountDeletionManager />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )
}