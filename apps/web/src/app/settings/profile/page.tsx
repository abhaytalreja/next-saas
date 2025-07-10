'use client'

import React from 'react'
import { ProfileForm } from '@nextsaas/auth'
import { useAuth } from '@nextsaas/auth'
import { AvatarUpload } from '@/packages/auth/src/components/profile/AvatarUpload'
import { ActivityDashboard } from '@/packages/auth/src/components/activity/ActivityDashboard'
import { DataExportManager } from '@/packages/auth/src/components/data-export/DataExportManager'
import { AccountDeletionManager } from '@/packages/auth/src/components/account-deletion/AccountDeletionManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { User, Shield, Activity, Download, Trash2 } from 'lucide-react'

export default function ProfileSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8" data-testid="profile-settings-page">
      {/* Page Header */}
      <header className="border-b border-gray-200 pb-6" data-testid="page-header">
        <h1 className="text-2xl font-semibold text-gray-900">
          Profile Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your personal information, avatar, activity, and account settings.
        </p>
      </header>

      {/* Profile Tabs */}
      <main className="mt-6" id="main-content">
        <Tabs defaultValue="profile" className="space-y-6" data-testid="profile-tabs">
          <TabsList 
            className="grid w-full grid-cols-5" 
            role="tablist"
            aria-label="Profile settings sections"
          >
            <TabsTrigger 
              value="profile" 
              className="flex items-center space-x-2"
              role="tab"
              aria-controls="profile-panel"
              data-testid="profile-tab-trigger"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="flex items-center space-x-2"
              role="tab"
              aria-controls="activity-panel"
              data-testid="activity-tab-trigger"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="flex items-center space-x-2"
              role="tab"
              aria-controls="privacy-panel"
              data-testid="privacy-tab-trigger"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="flex items-center space-x-2"
              role="tab"
              aria-controls="export-panel"
              data-testid="export-tab-trigger"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Export</span>
            </TabsTrigger>
            <TabsTrigger 
              value="delete" 
              className="flex items-center space-x-2"
              role="tab"
              aria-controls="delete-panel"
              data-testid="delete-tab-trigger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Delete</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent 
            value="profile" 
            className="space-y-6"
            role="tabpanel"
            id="profile-panel"
            aria-labelledby="profile-tab"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <Card data-testid="avatar-card">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload and manage your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvatarUpload />
                </CardContent>
              </Card>

              {/* Profile Form */}
              <div className="lg:col-span-2">
                <Card data-testid="profile-form-card">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent 
            value="activity"
            role="tabpanel"
            id="activity-panel"
            aria-labelledby="activity-tab"
          >
            <Card data-testid="activity-card">
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>
                  View your recent account activity and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">

            <Card data-testid="privacy-card">
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
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Email Verified
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {user?.email_confirmed_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Authentication Method
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {user?.app_metadata?.provider === 'email'
                        ? 'Email/Password'
                        : user?.app_metadata?.provider
                          ? `OAuth (${user.app_metadata.provider})`
                          : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="export">

            <Card data-testid="export-card">
              <CardHeader>
                <CardTitle>Data Export & Privacy</CardTitle>
                <CardDescription>
                  Export your personal data in compliance with GDPR Article 20 (Right to Data Portability)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataExportManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Deletion Tab */}
          <TabsContent value="delete">

            <Card className="border-red-200" data-testid="delete-card">
              <CardHeader>
                <CardTitle className="text-red-600">Account Deletion</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data with GDPR-compliant 30-day grace period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountDeletionManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
