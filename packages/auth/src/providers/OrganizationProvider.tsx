'use client'

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import { getSupabaseBrowserClient } from '../lib/auth-client'
import { validateFormData } from '../utils/validation'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
} from '../utils/validation'
import type {
  OrganizationContextValue,
  Organization,
  Membership,
  MembershipWithOrganization,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteMemberData,
  OrganizationInvitation,
  MembershipRole,
  SYSTEM_PERMISSIONS,
} from '../types'

export const OrganizationContext =
  createContext<OrganizationContextValue | null>(null)

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [memberships, setMemberships] = useState<MembershipWithOrganization[]>(
    []
  )
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()
  const initializationRef = useRef(false)

  // Fetch user's organizations and memberships
  useEffect(() => {
    if (!user || initializationRef.current) return
    initializationRef.current = true

    const fetchOrganizations = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch memberships with organization details
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select(
            `
            *,
            organization:organizations(*)
          `
          )
          .eq('user_id', user.id)

        if (membershipError) {
          console.warn('Membership fetch error:', membershipError)
          // Continue to check for owned organizations
        }

        let membershipsWithOrg = (membershipData as unknown as MembershipWithOrganization[]) || []

        // If no memberships found, check for organizations owned by this user
        if (membershipsWithOrg.length === 0) {
          console.log('No memberships found, checking for owned organizations...')
          
          const { data: ownedOrgs, error: ownedOrgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('created_by', user.id)

          if (ownedOrgError) {
            console.warn('Owned organizations fetch error:', ownedOrgError)
          } else if (ownedOrgs && ownedOrgs.length > 0) {
            console.log('Found owned organizations without memberships, will need to create memberships')
            // Set organizations even without memberships for now
            setOrganizations(ownedOrgs as Organization[])
            
            // Set the first organization as current
            const currentOrg = ownedOrgs[0] as Organization
            setCurrentOrganization(currentOrg)
            localStorage.setItem('last_organization_id', currentOrg.id)
            
            // Note: In a real app, you'd want to create the missing membership here
            return
          }
        }

        setMemberships(membershipsWithOrg)

        // Extract organizations
        const orgs = membershipsWithOrg.map(
          m => m.organization
        ) as Organization[]
        setOrganizations(orgs)

        // Set current organization (prefer last used or first available)
        const lastOrgId = localStorage.getItem('last_organization_id')
        const currentOrg = orgs.find(o => o.id === lastOrgId) || orgs[0]

        if (currentOrg) {
          await switchOrganization(currentOrg.id)
        }
      } catch (err: any) {
        console.error('Error fetching organizations:', err)
        setError(err.message || 'Failed to fetch organizations')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [user, supabase])

  // Create new organization
  const createOrganization = useCallback(
    async (data: CreateOrganizationData): Promise<Organization> => {
      if (!user) throw new Error('User not authenticated')

      const validation = validateFormData(createOrganizationSchema, data)
      if (!validation.success) {
        throw new Error(Object.values(validation.errors!)[0])
      }

      try {
        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: data.name,
            slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            description: data.description,
            industry: data.industry,
            size: data.size,
            website: data.website,
            owner_id: user.id,
            settings: {
              allowMemberInvites: true,
              requireEmailVerification: false,
              requireTwoFactor: false,
              sessionTimeout: 60,
              ipWhitelist: [],
              ssoEnabled: false,
              brandingEnabled: false,
            },
          })
          .select()
          .single()

        if (orgError) throw orgError

        // Create owner membership
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            user_id: user.id,
            organization_id: org.id,
            role: 'owner',
            permissions: ['*'], // All permissions for owner
          })

        if (membershipError) throw membershipError

        // Add to local state
        setOrganizations([...organizations, org])

        // Switch to new organization
        await switchOrganization(org.id)

        return org
      } catch (err: any) {
        throw new Error(err.message || 'Failed to create organization')
      }
    },
    [user, organizations, supabase]
  )

  // Update organization
  const updateOrganization = useCallback(
    async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
      if (!hasPermission('organization:update')) {
        throw new Error(
          'You do not have permission to update this organization'
        )
      }

      const validation = validateFormData(updateOrganizationSchema, data)
      if (!validation.success) {
        throw new Error(Object.values(validation.errors!)[0])
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
      if (!org) throw new Error('Organization not found')

      const membership = memberships.find(m => m.organizationId === id)
      if (!membership) throw new Error('Membership not found')

      setCurrentOrganization(org)
      setCurrentMembership(membership)

      // Save to localStorage
      localStorage.setItem('last_organization_id', id)

      // Emit event for other components
      window.dispatchEvent(
        new CustomEvent('organization-changed', { detail: org })
      )
    },
    [organizations, memberships]
  )

  // Invite member
  const inviteMember = useCallback(
    async (data: InviteMemberData): Promise<OrganizationInvitation> => {
      if (!currentOrganization) throw new Error('No organization selected')
      if (!canInviteMembers()) {
        throw new Error('You do not have permission to invite members')
      }

      const validation = validateFormData(inviteMemberSchema, data)
      if (!validation.success) {
        throw new Error(Object.values(validation.errors!)[0])
      }

      try {
        // Check if user already exists
        const { data: existingMember } = await supabase
          .from('memberships')
          .select('id')
          .eq('organization_id', currentOrganization.id)
          .eq(
            'user_id',
            (
              await supabase
                .from('users')
                .select('id')
                .eq('email', data.email)
                .single()
            ).data?.id
          )
          .single()

        if (existingMember) {
          throw new Error('User is already a member of this organization')
        }

        // Create invitation
        const { data: invitation, error } = await supabase
          .from('organization_invitations')
          .insert({
            email: data.email,
            organization_id: currentOrganization.id,
            role: data.role,
            invited_by: user!.id,
            expires_at: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 days
            token: crypto.randomUUID(),
          })
          .select()
          .single()

        if (error) throw error

        // Send invitation email (would be handled by email service)
        console.log('Sending invitation email to:', data.email)

        return invitation
      } catch (err: any) {
        throw new Error(err.message || 'Failed to invite member')
      }
    },
    [currentOrganization, user, supabase]
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
          .from('memberships')
          .delete()
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err: any) {
        throw new Error(err.message || 'Failed to remove member')
      }
    },
    [currentOrganization, supabase]
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
          .from('memberships')
          .update({
            role,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', currentOrganization.id)
          .eq('user_id', userId)

        if (error) throw error
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update member role')
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
      } catch (err: any) {
        throw new Error(err.message || 'Failed to cancel invitation')
      }
    },
    [supabase]
  )

  // Permission helpers
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!currentMembership) return false

      // Owner has all permissions
      if (currentMembership.role === 'owner') return true

      // Check for wildcard permission
      if (currentMembership.permissions?.includes('*')) return true

      // Check specific permissions
      return currentMembership.permissions?.includes(permission) || false
    },
    [currentMembership]
  )

  const isOwner = useCallback((): boolean => {
    return currentMembership?.role === 'owner' || false
  }, [currentMembership])

  const isAdmin = useCallback((): boolean => {
    return ['owner', 'admin'].includes(currentMembership?.role || '') || false
  }, [currentMembership])

  const canInviteMembers = useCallback((): boolean => {
    if (!currentOrganization || !currentMembership) return false

    // Owners and admins can always invite members
    if (isOwner() || isAdmin()) return true

    // Check organization settings for regular members
    if (!currentOrganization.settings?.allowMemberInvites) {
      return false
    }

    return hasPermission('organization:manage_members')
  }, [currentOrganization, currentMembership, isOwner, isAdmin, hasPermission])

  const contextValue: OrganizationContextValue = {
    currentOrganization,
    organizations,
    memberships,
    currentMembership,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    resendInvitation,
    cancelInvitation,
    hasPermission,
    isOwner,
    isAdmin,
    canInviteMembers,
  }

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  )
}
