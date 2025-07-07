'use client'

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { useSupabase } from '../hooks/useSupabase'
import { PermissionEngine } from '../lib/permissions/permission-engine'
import { AuditLogger } from '../lib/audit/audit-logger'
import type {
  OrganizationContextValue,
  Organization,
  Membership,
  MembershipWithOrganization,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  BulkInviteData,
  OrganizationInvitation,
  MembershipRole,
} from '../types'

export const OrganizationContext = createContext<OrganizationContextValue | null>(null)

interface OrganizationProviderProps {
  children: React.ReactNode
  organizationMode?: 'none' | 'single' | 'multi'
}

export function OrganizationProvider({
  children,
  organizationMode = 'multi',
}: OrganizationProviderProps) {
  const { supabase, user } = useSupabase()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null) // Will be implemented by WorkspaceProvider
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [memberships, setMemberships] = useState<MembershipWithOrganization[]>([])
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const permissionEngine = useRef(new PermissionEngine(supabase))
  const auditLogger = useRef(new AuditLogger(supabase))
  const initializationRef = useRef(false)

  // Fetch user's organizations and memberships
  useEffect(() => {
    if (!user || initializationRef.current || organizationMode === 'none') return
    initializationRef.current = true

    const fetchOrganizations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch memberships with organization details
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .is('deleted_at', null)

        if (membershipError) throw membershipError

        const membershipsWithOrg = membershipData as unknown as MembershipWithOrganization[]
        setMemberships(membershipsWithOrg)

        // Extract organizations
        const orgs = membershipsWithOrg.map(m => m.organization) as Organization[]
        setOrganizations(orgs)

        // Set current organization (prefer last used or first available)
        const lastOrgId = localStorage.getItem('last_organization_id')
        const currentOrg = orgs.find(o => o.id === lastOrgId) || orgs[0]

        if (currentOrg) {
          await switchOrganization(currentOrg.id)
        } else if (organizationMode === 'single' && orgs.length === 0) {
          // Auto-create organization for single mode
          await createDefaultOrganization()
        }
      } catch (err: any) {
        console.error('Error fetching organizations:', err)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizations()
  }, [user, supabase, organizationMode])

  // Create default organization for single mode
  const createDefaultOrganization = async () => {
    if (!user) return

    try {
      const { data: org, error } = await supabase.rpc('create_organization_with_owner', {
        p_name: user.email?.split('@')[0] || 'My Workspace',
        p_slug: user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'workspace',
        p_owner_id: user.id,
      })

      if (error) throw error

      await refreshOrganizations()
    } catch (err) {
      console.error('Error creating default organization:', err)
    }
  }

  // Create new organization
  const createOrganization = useCallback(
    async (data: CreateOrganizationData): Promise<Organization> => {
      if (!user) throw new Error('User not authenticated')

      try {
        const { data: org, error } = await supabase.rpc('create_organization_with_owner', {
          p_name: data.name,
          p_slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          p_owner_id: user.id,
          p_settings: data.settings || {},
        })

        if (error) throw error

        // Refresh organizations list
        await refreshOrganizations()

        // Switch to new organization
        await switchOrganization(org)

        return org
      } catch (err: any) {
        throw new Error(err.message || 'Failed to create organization')
      }
    },
    [user, supabase]
  )

  // Update organization
  const updateOrganization = useCallback(
    async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
      if (!hasPermission('organization:update')) {
        throw new Error('You do not have permission to update this organization')
      }

      try {
        const { data: updatedOrg, error } = await supabase
          .from('organizations')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Log the update
        await auditLogger.current.log({
          action: 'organization.updated',
          resource_type: 'organization',
          resource_id: id,
          resource_name: updatedOrg.name,
          changes: { after: data },
        })

        // Update local state
        setOrganizations(orgs => orgs.map(o => (o.id === id ? updatedOrg : o)))
        if (currentOrganization?.id === id) {
          setCurrentOrganization(updatedOrg)
        }

        return updatedOrg
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update organization')
      }
    },
    [currentOrganization, supabase]
  )

  // Delete organization
  const deleteOrganization = useCallback(
    async (id: string): Promise<void> => {
      if (!isOwner()) {
        throw new Error('Only organization owners can delete organizations')
      }

      try {
        // Soft delete organization
        const { error } = await supabase
          .from('organizations')
          .update({
            deleted_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) throw error

        // Log the deletion
        await auditLogger.current.log({
          action: 'organization.deleted',
          resource_type: 'organization',
          resource_id: id,
        })

        // Remove from local state
        setOrganizations(orgs => orgs.filter(o => o.id !== id))

        // If current org was deleted, switch to another
        if (currentOrganization?.id === id) {
          const nextOrg = organizations.find(o => o.id !== id)
          if (nextOrg) {
            await switchOrganization(nextOrg.id)
          } else {
            setCurrentOrganization(null)
            setCurrentMembership(null)
            setUserPermissions([])
          }
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to delete organization')
      }
    },
    [currentOrganization, organizations, supabase]
  )

  // Switch organization
  const switchOrganization = useCallback(
    async (id: string): Promise<void> => {
      const org = organizations.find(o => o.id === id)
      if (!org) {
        // Fetch organization if not in local state
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw new Error('Organization not found')
        setOrganizations(prev => [...prev, data])
        setCurrentOrganization(data)
      } else {
        setCurrentOrganization(org)
      }

      // Get membership for this organization
      const membership = memberships.find(m => m.organization_id === id)
      if (!membership) {
        // Fetch membership if not in local state
        const { data, error } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', id)
          .eq('user_id', user?.id)
          .single()

        if (error) throw new Error('Membership not found')
        setCurrentMembership(data)
      } else {
        setCurrentMembership(membership)
      }

      // Get user permissions for this organization
      if (user) {
        const permissions = await permissionEngine.current.getUserPermissions(user.id, id)
        setUserPermissions(permissions)
      }

      // Clear workspace context when switching organizations
      setCurrentWorkspace(null)

      // Save to localStorage
      localStorage.setItem('last_organization_id', id)

      // Emit event for other components
      window.dispatchEvent(
        new CustomEvent('organization-changed', { detail: org || { id } })
      )
    },
    [organizations, memberships, user, supabase]
  )

  // Invite member
  const inviteMember = useCallback(
    async (data: InviteMemberData): Promise<OrganizationInvitation> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!canInviteMembers()) {
        throw new Error('You do not have permission to invite members')
      }

      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single()

        if (existingUser) {
          // Check if already a member
          const { data: existingMember } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', currentOrganization.id)
            .eq('user_id', existingUser.id)
            .single()

          if (existingMember) {
            throw new Error('User is already a member of this organization')
          }
        }

        // Create invitation
        const { data: invitation, error } = await supabase
          .from('organization_invitations')
          .insert({
            email: data.email,
            organization_id: currentOrganization.id,
            role: data.role,
            invited_by: user!.id,
          })
          .select()
          .single()

        if (error) throw error

        // Log the invitation
        await auditLogger.current.log({
          action: 'member.invited',
          resource_type: 'invitation',
          resource_id: invitation.id,
          metadata: { email: data.email, role: data.role },
        })

        // Send invitation email if requested
        if (data.send_email !== false) {
          // This would integrate with your email service
          console.log('Sending invitation email to:', data.email)
        }

        return invitation
      } catch (err: any) {
        throw new Error(err.message || 'Failed to invite member')
      }
    },
    [currentOrganization, user, supabase]
  )

  // Bulk invite members
  const bulkInviteMembers = useCallback(
    async (data: BulkInviteData): Promise<OrganizationInvitation[]> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!canInviteMembers()) {
        throw new Error('You do not have permission to invite members')
      }

      const invitations: OrganizationInvitation[] = []
      const errors: string[] = []

      for (const invite of data.invitations) {
        try {
          const invitation = await inviteMember({
            ...invite,
            message: data.message,
            send_email: data.send_emails,
          })
          invitations.push(invitation)
        } catch (err: any) {
          errors.push(`${invite.email}: ${err.message}`)
        }
      }

      if (errors.length > 0) {
        console.error('Bulk invite errors:', errors)
      }

      return invitations
    },
    [inviteMember, currentOrganization]
  )

  // Remove member
  const removeMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to remove members')
      }

      try {
        const { error } = await supabase
          .from('organization_members')
          .update({
            status: 'removed',
            removed_at: new Date().toISOString(),
            removed_by: user?.id,
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error

        // Log the removal
        await auditLogger.current.log({
          action: 'member.removed',
          resource_type: 'member',
          resource_id: userId,
        })

        // Clear their permission cache
        permissionEngine.current.clearUserCache(userId, currentOrganization.id)
      } catch (err: any) {
        throw new Error(err.message || 'Failed to remove member')
      }
    },
    [currentOrganization, user, supabase]
  )

  // Update member role
  const updateMemberRole = useCallback(
    async (userId: string, role: MembershipRole): Promise<void> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to update member roles')
      }

      try {
        const { error } = await supabase
          .from('organization_members')
          .update({
            role,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error

        // Log the role change
        await auditLogger.current.log({
          action: 'member.role.updated',
          resource_type: 'member',
          resource_id: userId,
          changes: { after: { role } },
        })

        // Clear their permission cache
        permissionEngine.current.clearUserCache(userId, currentOrganization.id)
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update member role')
      }
    },
    [currentOrganization, supabase]
  )

  // Update member permissions
  const updateMemberPermissions = useCallback(
    async (userId: string, permissions: string[]): Promise<void> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to update member permissions')
      }

      try {
        const { error } = await supabase
          .from('organization_members')
          .update({
            permissions,
            custom_permissions: permissions,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error

        // Log the permission change
        await auditLogger.current.log({
          action: 'member.permissions.updated',
          resource_type: 'member',
          resource_id: userId,
          changes: { after: { permissions } },
        })

        // Clear their permission cache
        permissionEngine.current.clearUserCache(userId, currentOrganization.id)
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update member permissions')
      }
    },
    [currentOrganization, supabase]
  )

  // Suspend member
  const suspendMember = useCallback(
    async (userId: string, reason?: string): Promise<void> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to suspend members')
      }

      try {
        const { error } = await supabase
          .from('organization_members')
          .update({
            status: 'suspended',
            suspended_at: new Date().toISOString(),
            suspended_reason: reason,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error

        // Log the suspension
        await auditLogger.current.log({
          action: 'member.suspended',
          resource_type: 'member',
          resource_id: userId,
          metadata: { reason },
        })

        // Clear their permission cache
        permissionEngine.current.clearUserCache(userId, currentOrganization.id)
      } catch (err: any) {
        throw new Error(err.message || 'Failed to suspend member')
      }
    },
    [currentOrganization, supabase]
  )

  // Reactivate member
  const reactivateMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to reactivate members')
      }

      try {
        const { error } = await supabase
          .from('organization_members')
          .update({
            status: 'active',
            suspended_at: null,
            suspended_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error

        // Log the reactivation
        await auditLogger.current.log({
          action: 'member.reactivated',
          resource_type: 'member',
          resource_id: userId,
        })

        // Clear their permission cache
        permissionEngine.current.clearUserCache(userId, currentOrganization.id)
      } catch (err: any) {
        throw new Error(err.message || 'Failed to reactivate member')
      }
    },
    [currentOrganization, supabase]
  )

  // Resend invitation
  const resendInvitation = useCallback(
    async (invitationId: string): Promise<void> => {
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to resend invitations')
      }

      try {
        const { data: invitation, error } = await supabase
          .from('organization_invitations')
          .select('*')
          .eq('id', invitationId)
          .single()

        if (error) throw error

        // Send invitation email again
        console.log('Resending invitation email to:', invitation.email)

        // Log the resend
        await auditLogger.current.log({
          action: 'invitation.resent',
          resource_type: 'invitation',
          resource_id: invitationId,
        })
      } catch (err: any) {
        throw new Error(err.message || 'Failed to resend invitation')
      }
    },
    [supabase]
  )

  // Cancel invitation
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<void> => {
      if (!hasPermission('organization:manage_members')) {
        throw new Error('You do not have permission to cancel invitations')
      }

      try {
        const { error } = await supabase
          .from('organization_invitations')
          .delete()
          .eq('id', invitationId)

        if (error) throw error

        // Log the cancellation
        await auditLogger.current.log({
          action: 'invitation.cancelled',
          resource_type: 'invitation',
          resource_id: invitationId,
        })
      } catch (err: any) {
        throw new Error(err.message || 'Failed to cancel invitation')
      }
    },
    [supabase]
  )

  // Accept invitation
  const acceptInvitation = useCallback(
    async (token: string): Promise<void> => {
      try {
        const { data: invitation, error: inviteError } = await supabase
          .from('organization_invitations')
          .select('*')
          .eq('token', token)
          .single()

        if (inviteError) throw new Error('Invalid invitation token')

        // Check if invitation is expired
        if (new Date(invitation.expires_at) < new Date()) {
          throw new Error('Invitation has expired')
        }

        // Create membership
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: invitation.organization_id,
            user_id: user?.id,
            role: invitation.role,
            status: 'active',
            permissions: invitation.permissions || [],
            invited_by: invitation.invited_by,
          })

        if (memberError) throw memberError

        // Mark invitation as accepted
        await supabase
          .from('organization_invitations')
          .update({
            accepted_at: new Date().toISOString(),
            accepted_by: user?.id,
          })
          .eq('id', invitation.id)

        // Log the acceptance
        await auditLogger.current.log({
          action: 'invitation.accepted',
          resource_type: 'invitation',
          resource_id: invitation.id,
        })

        // Refresh organizations
        await refreshOrganizations()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to accept invitation')
      }
    },
    [user, supabase]
  )

  // Permission helper functions
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return userPermissions.includes(permission) || userPermissions.includes('*')
    },
    [userPermissions]
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (userPermissions.includes('*')) return true
      return permissions.some(p => userPermissions.includes(p))
    },
    [userPermissions]
  )

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (userPermissions.includes('*')) return true
      return permissions.every(p => userPermissions.includes(p))
    },
    [userPermissions]
  )

  const canAccessWorkspace = useCallback(
    (workspaceId: string): boolean => {
      // This would check workspace-specific permissions
      return hasPermission('workspace:view')
    },
    [hasPermission]
  )

  const canAccessProject = useCallback(
    (projectId: string): boolean => {
      // This would check project-specific permissions
      return hasPermission('project:view')
    },
    [hasPermission]
  )

  const isOwner = useCallback((): boolean => {
    return currentMembership?.role === 'owner' || false
  }, [currentMembership])

  const isAdmin = useCallback((): boolean => {
    return ['owner', 'admin'].includes(currentMembership?.role || '') || false
  }, [currentMembership])

  const isMember = useCallback((): boolean => {
    return ['owner', 'admin', 'member'].includes(currentMembership?.role || '') || false
  }, [currentMembership])

  const canInviteMembers = useCallback((): boolean => {
    if (!currentOrganization || !currentMembership) return false

    // Check organization settings
    if (!currentOrganization.settings.allowMemberInvites && !isAdmin()) {
      return false
    }

    return hasPermission('organization:manage_members')
  }, [currentOrganization, currentMembership, isAdmin, hasPermission])

  const canManageWorkspaces = useCallback((): boolean => {
    return hasPermission('workspace:create')
  }, [hasPermission])

  const canManageBilling = useCallback((): boolean => {
    return hasPermission('organization:manage_billing')
  }, [hasPermission])

  // Utility functions
  const refreshOrganizations = useCallback(async (): Promise<void> => {
    if (!user) return

    try {
      const { data: membershipData, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (error) throw error

      const membershipsWithOrg = membershipData as unknown as MembershipWithOrganization[]
      setMemberships(membershipsWithOrg)

      const orgs = membershipsWithOrg.map(m => m.organization) as Organization[]
      setOrganizations(orgs)
    } catch (err) {
      console.error('Error refreshing organizations:', err)
    }
  }, [user, supabase])

  const refreshCurrentOrganization = useCallback(async (): Promise<void> => {
    if (!currentOrganization) return

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrganization.id)
        .single()

      if (error) throw error

      setCurrentOrganization(data)
      setOrganizations(orgs => 
        orgs.map(o => o.id === data.id ? data : o)
      )
    } catch (err) {
      console.error('Error refreshing current organization:', err)
    }
  }, [currentOrganization, supabase])

  const clearOrganizationData = useCallback((): void => {
    setCurrentOrganization(null)
    setCurrentWorkspace(null)
    setCurrentMembership(null)
    setUserPermissions([])
    setOrganizations([])
    setMemberships([])
    localStorage.removeItem('last_organization_id')
    permissionEngine.current.clearCache()
  }, [])

  // Context value
  const contextValue = useMemo<OrganizationContextValue>(() => ({
    // State
    currentOrganization,
    currentWorkspace,
    currentMembership,
    organizations,
    memberships,
    userPermissions,
    isLoading,
    error,

    // Organization management
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,

    // Member management
    inviteMember,
    bulkInviteMembers,
    removeMember,
    updateMemberRole,
    updateMemberPermissions,
    suspendMember,
    reactivateMember,

    // Invitation management
    resendInvitation,
    cancelInvitation,
    acceptInvitation,

    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessWorkspace,
    canAccessProject,
    isOwner,
    isAdmin,
    isMember,
    canInviteMembers,
    canManageWorkspaces,
    canManageBilling,

    // Utility functions
    refreshOrganizations,
    refreshCurrentOrganization,
    clearOrganizationData,
  }), [
    currentOrganization,
    currentWorkspace,
    currentMembership,
    organizations,
    memberships,
    userPermissions,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    inviteMember,
    bulkInviteMembers,
    removeMember,
    updateMemberRole,
    updateMemberPermissions,
    suspendMember,
    reactivateMember,
    resendInvitation,
    cancelInvitation,
    acceptInvitation,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessWorkspace,
    canAccessProject,
    isOwner,
    isAdmin,
    isMember,
    canInviteMembers,
    canManageWorkspaces,
    canManageBilling,
    refreshOrganizations,
    refreshCurrentOrganization,
    clearOrganizationData,
  ])

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}