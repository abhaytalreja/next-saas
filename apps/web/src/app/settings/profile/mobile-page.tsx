'use client'

import React, { useState } from 'react'
import { useAuth } from '@nextsaas/auth'
import { MobileProfileForm } from '@/packages/auth/src/components/forms/MobileProfileForm'
import { TouchOptimizedAvatar } from '@/packages/auth/src/components/ui/TouchOptimizedAvatar'
import { MobileBottomSheet, useBottomSheet } from '@/packages/auth/src/components/ui/MobileBottomSheet'
import { useMobileDetection, useBreakpoint } from '@/packages/auth/src/hooks/useMobileDetection'
import { ActivityDashboard } from '@/packages/auth/src/components/activity/ActivityDashboard'
import { DataExportManager } from '@/packages/auth/src/components/data-export/DataExportManager'
import { AccountDeletionManager } from '@/packages/auth/src/components/account-deletion/AccountDeletionManager'
import { User, Shield, Activity, Download, Trash2, ChevronRightIcon, CogIcon } from 'lucide-react'

type ActiveSection = 'profile' | 'activity' | 'privacy' | 'export' | 'delete' | null

export default function MobileProfileSettingsPage() {
  const { user } = useAuth()
  const { isMobileOrTablet } = useBreakpoint()
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
  const { isOpen, open, close } = useBottomSheet()

  const openSection = (section: ActiveSection) => {
    setActiveSection(section)
    open()
  }

  const getSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return <MobileProfileForm />
      case 'activity':
        return <ActivityDashboard />
      case 'privacy':
        return <div className="p-4">Privacy settings coming soon...</div>
      case 'export':
        return <DataExportManager />
      case 'delete':
        return <AccountDeletionManager />
      default:
        return null
    }
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'profile':
        return 'Edit Profile'
      case 'activity':
        return 'Account Activity'
      case 'privacy':
        return 'Privacy Settings'
      case 'export':
        return 'Export Data'
      case 'delete':
        return 'Delete Account'
      default:
        return ''
    }
  }

  // Desktop fallback - redirect to main profile page
  if (!isMobileOrTablet) {
    return (
      <div className="p-8 text-center">
        <p>This mobile view is only available on mobile devices.</p>
        <a href="/settings/profile" className="text-primary-600 hover:text-primary-700">
          Go to desktop profile settings →
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          <button
            onClick={() => openSection('profile')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit
          </button>
        </div>
      </header>

      {/* Profile Summary Card */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <TouchOptimizedAvatar
            src={user?.user_metadata?.avatar_url}
            firstName={user?.user_metadata?.first_name}
            lastName={user?.user_metadata?.last_name}
            email={user?.email}
            size="xl"
            onUpload={(file) => {
              console.log('Upload avatar:', file)
              // Handle avatar upload
            }}
            onRemove={() => {
              console.log('Remove avatar')
              // Handle avatar removal
            }}
          />
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-gray-900 truncate">
              {user?.user_metadata?.first_name && user?.user_metadata?.last_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : user?.email}
            </h2>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            {user?.user_metadata?.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {user.user_metadata.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="mx-4 mt-4 space-y-2">
        {/* Profile Settings */}
        <button
          onClick={() => openSection('profile')}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Personal Information</p>
              <p className="text-sm text-gray-500">Update your profile details</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Activity */}
        <button
          onClick={() => openSection('activity')}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Account Activity</p>
              <p className="text-sm text-gray-500">View login history and security events</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Privacy */}
        <button
          onClick={() => openSection('privacy')}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Privacy & Security</p>
              <p className="text-sm text-gray-500">Manage your privacy settings</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Data Export */}
        <button
          onClick={() => openSection('export')}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Download className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download your data</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Delete Account */}
        <button
          onClick={() => openSection('delete')}
          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently delete your account</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Account Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary-600">
              {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : '0'}
            </p>
            <p className="text-xs text-gray-500">Days Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">Active</p>
            <p className="text-xs text-gray-500">Account Status</p>
          </div>
        </div>
      </div>

      {/* Bottom padding for safe area */}
      <div className="h-8" />

      {/* Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isOpen}
        onClose={close}
        title={getSectionTitle()}
        className="max-h-[85vh]"
      >
        {getSectionContent()}
      </MobileBottomSheet>
    </div>
  )
}