'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOrganization } from '../../hooks'
import { useOrganizationProfile } from '../../hooks/useOrganizationProfile'
import type { UserProfile, UserActivity, UserPreferences } from '../../types/user'
import type { Organization, Membership } from '../../types/organization'

interface OrganizationProfileContextValue {
  // Organization context
  currentOrganization: Organization | null
  membership: Membership | null
  mode: 'none' | 'single' | 'multi'
  
  // Profile data in current organization context
  profile: UserProfile | null
  preferences: UserPreferences | null
  activities: UserActivity[]
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<UserPreferences>
  refresh: () => Promise<void>
  
  // Context utilities
  canViewTab: (tabId: string) => boolean
  isVisible: (type: 'profile' | 'email' | 'activity') => boolean
  getVisibilitySettings: () => {
    profile_visibility: string
    email_visibility: string
    activity_visibility: string
  }
}

const OrganizationProfileContext = createContext<OrganizationProfileContextValue | null>(null)

interface OrganizationContextProviderProps {
  children: React.ReactNode
  options?: {
    includeActivity?: boolean
    includePreferences?: boolean
    includeAvatars?: boolean
    activityLimit?: number
    restrictedTabs?: string[]
  }
}

export function OrganizationContextProvider({ 
  children, 
  options = {} 
}: OrganizationContextProviderProps) {
  const { currentOrganization } = useOrganization()
  const {
    profile,
    preferences,
    activities,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refresh,
    organizationContext,
    visibilitySettings,
    isVisible
  } = useOrganizationProfile({
    includeActivity: options.includeActivity ?? true,
    includePreferences: options.includePreferences ?? true,
    includeAvatars: options.includeAvatars ?? false,
    activityLimit: options.activityLimit ?? 50
  })

  const canViewTab = (tabId: string): boolean => {
    if (options.restrictedTabs?.includes(tabId)) return false
    
    const { membership, hasOrganization } = organizationContext
    
    // For non-organization contexts, all tabs are available
    if (!hasOrganization) return true
    
    // Organization-specific permission checks
    switch (tabId) {
      case 'activity':
        return organizationContext.canViewActivity
      case 'export':
        return organizationContext.canExportData
      case 'delete':
        return membership?.permissions?.includes('account:delete') || 
               membership?.role === 'owner'
      case 'organization':
        return membership?.role === 'owner' || 
               membership?.role === 'admin'
      default:
        return true
    }
  }

  const contextValue: OrganizationProfileContextValue = {
    // Organization context
    currentOrganization,
    membership: organizationContext.membership,
    mode: organizationContext.mode,
    
    // Profile data
    profile,
    preferences,
    activities,
    
    // State
    loading,
    error,
    
    // Actions
    updateProfile,
    updatePreferences,
    refresh,
    
    // Context utilities
    canViewTab,
    isVisible,
    getVisibilitySettings: () => visibilitySettings
  }

  return (
    <OrganizationProfileContext.Provider value={contextValue}>
      {children}
    </OrganizationProfileContext.Provider>
  )
}

// Hook to use the organization profile context
export function useOrganizationProfileContext(): OrganizationProfileContextValue {
  const context = useContext(OrganizationProfileContext)
  
  if (!context) {
    throw new Error(
      'useOrganizationProfileContext must be used within an OrganizationContextProvider'
    )
  }
  
  return context
}

// Higher-order component for wrapping components with organization context
export function withOrganizationContext<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    includeActivity?: boolean
    includePreferences?: boolean
    includeAvatars?: boolean
    activityLimit?: number
    restrictedTabs?: string[]
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <OrganizationContextProvider options={options}>
        <Component {...props} />
      </OrganizationContextProvider>
    )
  }
  
  WrappedComponent.displayName = `withOrganizationContext(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Mode-specific context providers
export function SingleOrgContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationContextProvider 
      options={{ 
        includeActivity: true, 
        includePreferences: true,
        restrictedTabs: [] // In single org mode, all features are available
      }}
    >
      {children}
    </OrganizationContextProvider>
  )
}

export function MultiOrgContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationContextProvider 
      options={{ 
        includeActivity: true, 
        includePreferences: true,
        includeAvatars: true,
        activityLimit: 100 // More activity data for multi-org contexts
      }}
    >
      {children}
    </OrganizationContextProvider>
  )
}

export function PersonalContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationContextProvider 
      options={{ 
        includeActivity: true, 
        includePreferences: true,
        includeAvatars: true,
        restrictedTabs: ['organization'] // No organization tab in personal mode
      }}
    >
      {children}
    </OrganizationContextProvider>
  )
}