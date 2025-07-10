'use client'

import React from 'react'
import { UserPreferencesManager } from '@/packages/auth/src/components/preferences/UserPreferencesManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Settings, Palette, Bell, Globe, Shield, Monitor } from 'lucide-react'

export default function PreferencesPage() {
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          User Preferences
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Customize your experience with personalized settings and preferences.
        </p>
      </div>

      {/* Preferences Overview */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Theme</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">System</div>
            <p className="text-xs text-muted-foreground">
              Follows system preference
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Language</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">English</div>
            <p className="text-xs text-muted-foreground">
              Primary language
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enabled</div>
            <p className="text-xs text-muted-foreground">
              All notifications active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Preferences Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Preferences Management</span>
          </CardTitle>
          <CardDescription>
            Configure your personalized settings for themes, notifications, privacy, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserPreferencesManager />
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Display Settings</span>
            </CardTitle>
            <CardDescription>
              Configure how the interface appears and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dense mode</span>
              <span className="text-sm text-gray-500">Disabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Animations</span>
              <span className="text-sm text-gray-500">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sound effects</span>
              <span className="text-sm text-gray-500">Disabled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy Settings</span>
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Analytics tracking</span>
              <span className="text-sm text-gray-500">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile visibility</span>
              <span className="text-sm text-gray-500">Private</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data collection</span>
              <span className="text-sm text-gray-500">Essential only</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">
          Preference Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>
              Changes to most preferences take effect immediately
            </span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>
              Some settings may require refreshing the page
            </span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>
              Your preferences are synced across all your devices
            </span>
          </li>
          <li className="flex items-start">
            <span className="block mt-0.5 mr-2">•</span>
            <span>
              You can reset all preferences to defaults at any time
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}