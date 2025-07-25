'use client'

import React from 'react'
import { OrganizationAwareProfileManager } from './OrganizationAwareProfileManager'
import { BasicProfileManager } from './BasicProfileManager'
import { useOrganization } from '../../hooks'

interface ProfileModeDetectorProps {
  className?: string
  defaultTab?: string
  showOrganizationSwitcher?: boolean
}

/**
 * Adaptive profile component that renders the appropriate profile manager
 * based on the organization mode and current context
 */
export function ProfileModeDetector({
  className,
  defaultTab = 'profile',
  showOrganizationSwitcher = true
}: ProfileModeDetectorProps) {
  const organizationMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase() || 'none'
  
  // For organization-based applications, always use the organization-aware manager
  if (organizationMode === 'single' || organizationMode === 'multi') {
    return (
      <OrganizationAwareProfileManager
        className={className}
        defaultTab={defaultTab}
        showOrganizationSwitcher={showOrganizationSwitcher && organizationMode === 'multi'}
      />
    )
  }
  
  // For non-organization applications, use the basic profile manager
  return (
    <BasicProfileManager
      className={className}
      defaultTab={defaultTab}
    />
  )
}

/**
 * Hook to determine which profile features are available based on the current mode
 */
export function useProfileFeatures() {
  const organizationMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase() || 'none'
  const { currentOrganization } = useOrganization()
  
  return {
    hasOrganizations: organizationMode !== 'none',
    isMultiOrg: organizationMode === 'multi',
    isSingleOrg: organizationMode === 'single',
    isPersonalMode: organizationMode === 'none',
    currentContext: currentOrganization ? 'organization' : 'personal',
    features: {
      organizationSwitching: organizationMode === 'multi',
      contextualProfiles: organizationMode !== 'none',
      globalProfile: organizationMode === 'none',
      memberManagement: organizationMode !== 'none',
      roleBasedPermissions: organizationMode !== 'none',
      activityTracking: true,
      dataExport: true,
      accountDeletion: true
    }
  }
}