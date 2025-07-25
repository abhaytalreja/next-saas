import React from 'react'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { ProfileModeDetector, useProfileFeatures } from '../ProfileModeDetector'

// Mock the profile manager components
jest.mock('../BasicProfileManager', () => ({
  BasicProfileManager: ({ className, defaultTab }: any) => (
    <div data-testid="basic-profile-manager" data-class={className} data-default-tab={defaultTab}>
      Basic Profile Manager
    </div>
  )
}))

jest.mock('../OrganizationAwareProfileManager', () => ({
  OrganizationAwareProfileManager: ({ className, defaultTab, showOrganizationSwitcher }: any) => (
    <div 
      data-testid="organization-aware-profile-manager" 
      data-class={className} 
      data-default-tab={defaultTab}
      data-show-org-switcher={showOrganizationSwitcher}
    >
      Organization Aware Profile Manager
    </div>
  )
}))

// Mock the useOrganization hook
const mockUseOrganization = {
  currentOrganization: null,
  organizations: [],
  loading: false,
  error: null,
  switchOrganization: jest.fn(),
  refreshOrganizations: jest.fn(),
}

jest.mock('../../hooks', () => ({
  useOrganization: () => mockUseOrganization,
}))

// Helper to set environment variables
const setEnvironmentVariable = (key: string, value: string) => {
  const originalEnv = process.env[key]
  process.env[key] = value
  return () => {
    if (originalEnv === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = originalEnv
    }
  }
}

describe('ProfileModeDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset organization mock
    mockUseOrganization.currentOrganization = null
    mockUseOrganization.organizations = []
  })

  describe('Organization Mode: none', () => {
    it('renders BasicProfileManager when organization mode is none', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'none')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('basic-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('organization-aware-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })

    it('renders BasicProfileManager when organization mode is not set', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', '')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('basic-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('organization-aware-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })

    it('passes props correctly to BasicProfileManager', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'none')
      
      render(
        <ProfileModeDetector 
          className="custom-class" 
          defaultTab="settings"
          showOrganizationSwitcher={false}
        />
      )
      
      const basicManager = screen.getByTestId('basic-profile-manager')
      expect(basicManager).toHaveAttribute('data-class', 'custom-class')
      expect(basicManager).toHaveAttribute('data-default-tab', 'settings')
      
      cleanup()
    })
  })

  describe('Organization Mode: single', () => {
    it('renders OrganizationAwareProfileManager when organization mode is single', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'single')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('organization-aware-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('basic-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })

    it('disables organization switcher in single mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'single')
      
      render(<ProfileModeDetector showOrganizationSwitcher={true} />)
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'false')
      
      cleanup()
    })

    it('passes props correctly to OrganizationAwareProfileManager in single mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'single')
      
      render(
        <ProfileModeDetector 
          className="org-class" 
          defaultTab="team"
          showOrganizationSwitcher={true}
        />
      )
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-class', 'org-class')
      expect(orgManager).toHaveAttribute('data-default-tab', 'team')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'false') // Should be false in single mode
      
      cleanup()
    })
  })

  describe('Organization Mode: multi', () => {
    it('renders OrganizationAwareProfileManager when organization mode is multi', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('organization-aware-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('basic-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })

    it('enables organization switcher in multi mode by default', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      render(<ProfileModeDetector />)
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'true')
      
      cleanup()
    })

    it('respects showOrganizationSwitcher prop in multi mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      render(<ProfileModeDetector showOrganizationSwitcher={false} />)
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'false')
      
      cleanup()
    })

    it('passes props correctly to OrganizationAwareProfileManager in multi mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      render(
        <ProfileModeDetector 
          className="multi-class" 
          defaultTab="billing"
          showOrganizationSwitcher={true}
        />
      )
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-class', 'multi-class')
      expect(orgManager).toHaveAttribute('data-default-tab', 'billing')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'true')
      
      cleanup()
    })
  })

  describe('Default Props', () => {
    it('uses default defaultTab when not provided', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'none')
      
      render(<ProfileModeDetector />)
      
      const basicManager = screen.getByTestId('basic-profile-manager')
      expect(basicManager).toHaveAttribute('data-default-tab', 'profile')
      
      cleanup()
    })

    it('uses default showOrganizationSwitcher when not provided', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      render(<ProfileModeDetector />)
      
      const orgManager = screen.getByTestId('organization-aware-profile-manager')
      expect(orgManager).toHaveAttribute('data-show-org-switcher', 'true')
      
      cleanup()
    })
  })

  describe('Case Sensitivity', () => {
    it('handles uppercase organization mode values', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'SINGLE')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('organization-aware-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('basic-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })

    it('handles mixed case organization mode values', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'Multi')
      
      render(<ProfileModeDetector />)
      
      expect(screen.getByTestId('organization-aware-profile-manager')).toBeInTheDocument()
      expect(screen.queryByTestId('basic-profile-manager')).not.toBeInTheDocument()
      
      cleanup()
    })
  })
})

describe('useProfileFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseOrganization.currentOrganization = null
  })

  describe('Organization Mode: none', () => {
    it('returns correct features for none mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'none')
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current).toEqual({
        hasOrganizations: false,
        isMultiOrg: false,
        isSingleOrg: false,
        isPersonalMode: true,
        currentContext: 'personal',
        features: {
          organizationSwitching: false,
          contextualProfiles: false,
          globalProfile: true,
          memberManagement: false,
          roleBasedPermissions: false,
          activityTracking: true,
          dataExport: true,
          accountDeletion: true
        }
      })
      
      cleanup()
    })
  })

  describe('Organization Mode: single', () => {
    it('returns correct features for single mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'single')
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current).toEqual({
        hasOrganizations: true,
        isMultiOrg: false,
        isSingleOrg: true,
        isPersonalMode: false,
        currentContext: 'personal', // No current organization
        features: {
          organizationSwitching: false,
          contextualProfiles: true,
          globalProfile: false,
          memberManagement: true,
          roleBasedPermissions: true,
          activityTracking: true,
          dataExport: true,
          accountDeletion: true
        }
      })
      
      cleanup()
    })

    it('returns organization context when organization is present', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'single')
      mockUseOrganization.currentOrganization = { id: '123', name: 'Test Org' }
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current.currentContext).toBe('organization')
      
      cleanup()
    })
  })

  describe('Organization Mode: multi', () => {
    it('returns correct features for multi mode', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current).toEqual({
        hasOrganizations: true,
        isMultiOrg: true,
        isSingleOrg: false,
        isPersonalMode: false,
        currentContext: 'personal', // No current organization
        features: {
          organizationSwitching: true,
          contextualProfiles: true,
          globalProfile: false,
          memberManagement: true,
          roleBasedPermissions: true,
          activityTracking: true,
          dataExport: true,
          accountDeletion: true
        }
      })
      
      cleanup()
    })

    it('returns organization context when organization is present', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', 'multi')
      mockUseOrganization.currentOrganization = { id: '456', name: 'Multi Org' }
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current.currentContext).toBe('organization')
      
      cleanup()
    })
  })

  describe('Default behavior', () => {
    it('defaults to none mode when env var is not set', () => {
      const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', '')
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current.isPersonalMode).toBe(true)
      expect(result.current.hasOrganizations).toBe(false)
      
      cleanup()
    })

    it('handles undefined organization mode', () => {
      const originalEnv = process.env.NEXT_PUBLIC_ORGANIZATION_MODE
      delete process.env.NEXT_PUBLIC_ORGANIZATION_MODE
      
      const { result } = renderHook(() => useProfileFeatures())
      
      expect(result.current.isPersonalMode).toBe(true)
      expect(result.current.hasOrganizations).toBe(false)
      
      // Restore original env
      if (originalEnv !== undefined) {
        process.env.NEXT_PUBLIC_ORGANIZATION_MODE = originalEnv
      }
    })
  })

  describe('Feature flags consistency', () => {
    it('ensures consistent feature availability across modes', () => {
      const modes = ['none', 'single', 'multi']
      
      modes.forEach(mode => {
        const cleanup = setEnvironmentVariable('NEXT_PUBLIC_ORGANIZATION_MODE', mode)
        
        const { result } = renderHook(() => useProfileFeatures())
        const features = result.current.features
        
        // These features should always be available
        expect(features.activityTracking).toBe(true)
        expect(features.dataExport).toBe(true)
        expect(features.accountDeletion).toBe(true)
        
        // Organization-specific features
        if (mode !== 'none') {
          expect(features.contextualProfiles).toBe(true)
          expect(features.memberManagement).toBe(true)
          expect(features.roleBasedPermissions).toBe(true)
          expect(features.globalProfile).toBe(false)
        } else {
          expect(features.contextualProfiles).toBe(false)
          expect(features.memberManagement).toBe(false)
          expect(features.roleBasedPermissions).toBe(false)
          expect(features.globalProfile).toBe(true)
        }
        
        // Multi-org specific features
        if (mode === 'multi') {
          expect(features.organizationSwitching).toBe(true)
        } else {
          expect(features.organizationSwitching).toBe(false)
        }
        
        cleanup()
      })
    })
  })
})