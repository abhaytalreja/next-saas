import { useContext } from 'react'
import { OrganizationContext } from '../providers/OrganizationProvider'
import type { OrganizationContextValue } from '../types'

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext)
  
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  
  return context
}

// Convenience hooks for common organization operations
export function useCurrentOrganization() {
  const { currentOrganization, isLoading, error } = useOrganization()
  return { organization: currentOrganization, isLoading, error }
}

export function useOrganizationPermissions() {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isAdmin,
    isMember,
    canInviteMembers,
    canManageWorkspaces,
    canManageBilling,
  } = useOrganization()

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    isAdmin,
    isMember,
    canInviteMembers,
    canManageWorkspaces,
    canManageBilling,
    canManageOrganization: () => hasPermission('organization:update'),
    canManageMembers: () => hasPermission('organization:manage_members'),
    canViewAuditLogs: () => hasPermission('organization:view_audit_logs'),
    canManageSecurity: () => hasPermission('organization:manage_security'),
  }
}

export function useOrganizationMembers() {
  const {
    inviteMember,
    bulkInviteMembers,
    removeMember,
    updateMemberRole,
    updateMemberPermissions,
    suspendMember,
    reactivateMember,
    resendInvitation,
    cancelInvitation,
  } = useOrganization()

  return {
    inviteMember,
    bulkInviteMembers,
    removeMember,
    updateMemberRole,
    updateMemberPermissions,
    suspendMember,
    reactivateMember,
    resendInvitation,
    cancelInvitation,
  }
}