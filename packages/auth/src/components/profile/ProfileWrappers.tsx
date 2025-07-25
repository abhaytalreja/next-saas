'use client'

import React from 'react'
import { ProfileModeDetector } from './ProfileModeDetector'
import { BasicProfileManager } from './BasicProfileManager'
import { OrganizationAwareProfileManager } from './OrganizationAwareProfileManager'
import { OrganizationProvider } from '../../providers'

/**
 * Universal profile component that automatically adapts to any SaaS type
 * This is the main component that should be used in applications
 */
export function UniversalProfile({
  className,
  defaultTab,
  showOrganizationSwitcher = true
}: {
  className?: string
  defaultTab?: string
  showOrganizationSwitcher?: boolean
}) {
  const organizationMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase() || 'none'
  
  // Wrap with OrganizationProvider only if needed
  if (organizationMode !== 'none') {
    return (
      <OrganizationProvider>
        <ProfileModeDetector
          className={className}
          defaultTab={defaultTab}
          showOrganizationSwitcher={showOrganizationSwitcher}
        />
      </OrganizationProvider>
    )
  }
  
  return (
    <ProfileModeDetector
      className={className}
      defaultTab={defaultTab}
      showOrganizationSwitcher={false}
    />
  )
}

/**
 * Single Organization Profile - for single-org SaaS applications
 */
export function SingleOrgProfile({
  className,
  defaultTab = 'profile'
}: {
  className?: string
  defaultTab?: string
}) {
  return (
    <OrganizationProvider>
      <OrganizationAwareProfileManager
        className={className}
        defaultTab={defaultTab}
        showOrganizationSwitcher={false}
      />
    </OrganizationProvider>
  )
}

/**
 * Multi Organization Profile - for multi-tenant SaaS applications
 */
export function MultiOrgProfile({
  className,
  defaultTab = 'profile',
  showOrganizationSwitcher = true
}: {
  className?: string
  defaultTab?: string
  showOrganizationSwitcher?: boolean
}) {
  return (
    <OrganizationProvider>
      <OrganizationAwareProfileManager
        className={className}
        defaultTab={defaultTab}
        showOrganizationSwitcher={showOrganizationSwitcher}
      />
    </OrganizationProvider>
  )
}

/**
 * Personal Profile - for single-user SaaS applications
 */
export function PersonalProfile({
  className,
  defaultTab = 'profile'
}: {
  className?: string
  defaultTab?: string
}) {
  return (
    <BasicProfileManager
      className={className}
      defaultTab={defaultTab}
    />
  )
}

/**
 * Profile Page Layout - Ready-to-use page component
 */
export function ProfilePageLayout({
  title = 'Profile Settings',
  description = 'Manage your profile and account settings',
  children,
  className
}: {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-6 sm:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="mt-2 text-gray-600">{description}</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6 sm:px-8">
            {children || <UniversalProfile />}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Embedded Profile - For use within existing layouts
 */
export function EmbeddedProfile({
  showHeader = true,
  title = 'Profile Settings',
  description,
  className,
  defaultTab,
  showOrganizationSwitcher
}: {
  showHeader?: boolean
  title?: string
  description?: string
  className?: string
  defaultTab?: string
  showOrganizationSwitcher?: boolean
}) {
  return (
    <div className={className}>
      {showHeader && (
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <UniversalProfile
        defaultTab={defaultTab}
        showOrganizationSwitcher={showOrganizationSwitcher}
      />
    </div>
  )
}