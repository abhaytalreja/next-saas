'use client'

import { useContext } from 'react'
import { OrganizationContext } from '../providers/OrganizationProvider'
import type { OrganizationContextValue } from '../types'

/**
 * Hook to access organization context
 * Must be used within an OrganizationProvider
 */
export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    )
  }

  return context
}

/**
 * Hook to get current organization
 */
export function useCurrentOrganization() {
  const { currentOrganization, loading } = useOrganization()
  return { organization: currentOrganization, loading }
}

/**
 * Hook to get user's organizations list
 */
export function useOrganizations() {
  const { organizations, loading } = useOrganization()
  return { organizations, loading }
}

/**
 * Hook to get current membership details
 */
export function useCurrentMembership() {
  const { currentMembership, loading } = useOrganization()
  return { membership: currentMembership, loading }
}

/**
 * Hook to check organization permissions
 */
export function useOrganizationPermissions() {
  const { hasPermission, isOwner, isAdmin, canInviteMembers } =
    useOrganization()

  return {
    hasPermission,
    isOwner,
    isAdmin,
    canInviteMembers,
    canManageMembers: () => hasPermission('organization:manage_members'),
    canManageBilling: () => hasPermission('organization:manage_billing'),
    canManageSettings: () => hasPermission('organization:manage_settings'),
    canDeleteOrganization: () => isOwner(),
    canCreateProjects: () => hasPermission('project:create'),
    canManageProjects: () => hasPermission('project:manage'),
  }
}
