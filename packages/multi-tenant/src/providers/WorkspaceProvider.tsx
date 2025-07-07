'use client'

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useSupabase } from '../hooks/useSupabase'
import { useOrganization } from '../hooks/useOrganization'
import type {
  WorkspaceContextValue,
  Workspace,
  WorkspaceMember,
  CreateWorkspaceData,
  UpdateWorkspaceData,
} from '../types'

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

interface WorkspaceProviderProps {
  children: React.ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { supabase, user } = useSupabase()
  const { currentOrganization, hasPermission } = useOrganization()
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch workspaces when organization changes
  useEffect(() => {
    if (currentOrganization && user) {
      fetchWorkspaces()
    } else {
      setWorkspaces([])
      setCurrentWorkspace(null)
      setIsLoading(false)
    }
  }, [currentOrganization, user])

  // Fetch workspace members when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceMembers()
    } else {
      setWorkspaceMembers([])
    }
  }, [currentWorkspace])

  const fetchWorkspaces = async () => {
    if (!currentOrganization) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .is('deleted_at', null)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      setWorkspaces(data || [])

      // Set current workspace (prefer last used or default)
      const lastWorkspaceId = localStorage.getItem(`last_workspace_${currentOrganization.id}`)
      const currentWs = data?.find(w => w.id === lastWorkspaceId) || 
                       data?.find(w => w.is_default) || 
                       data?.[0]

      if (currentWs) {
        setCurrentWorkspace(currentWs)
      }
    } catch (err: any) {
      console.error('Error fetching workspaces:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkspaceMembers = async () => {
    if (!currentWorkspace) return

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)

      if (error) throw error

      setWorkspaceMembers(data || [])
    } catch (err) {
      console.error('Error fetching workspace members:', err)
    }
  }

  const createWorkspace = useCallback(
    async (data: CreateWorkspaceData): Promise<Workspace> => {
      if (!hasPermission('workspace:create')) {
        throw new Error('You do not have permission to create workspaces')
      }

      try {
        const { data: workspace, error } = await supabase
          .rpc('create_workspace', {
            p_organization_id: data.organization_id,
            p_name: data.name,
            p_slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            p_created_by: user?.id,
            p_description: data.description,
            p_settings: data.settings || {},
          })

        if (error) throw error

        // Refresh workspaces
        await fetchWorkspaces()

        return workspace
      } catch (err: any) {
        throw new Error(err.message || 'Failed to create workspace')
      }
    },
    [user, hasPermission, supabase]
  )

  const updateWorkspace = useCallback(
    async (id: string, data: UpdateWorkspaceData): Promise<Workspace> => {
      if (!canEditWorkspace()) {
        throw new Error('You do not have permission to update this workspace')
      }

      try {
        const { data: updatedWorkspace, error } = await supabase
          .from('workspaces')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Update local state
        setWorkspaces(ws => ws.map(w => w.id === id ? updatedWorkspace : w))
        if (currentWorkspace?.id === id) {
          setCurrentWorkspace(updatedWorkspace)
        }

        return updatedWorkspace
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update workspace')
      }
    },
    [currentWorkspace, supabase]
  )

  const deleteWorkspace = useCallback(
    async (id: string): Promise<void> => {
      if (!canDeleteWorkspace()) {
        throw new Error('You do not have permission to delete this workspace')
      }

      // Prevent deleting default workspace
      const workspace = workspaces.find(w => w.id === id)
      if (workspace?.is_default) {
        throw new Error('Cannot delete default workspace')
      }

      try {
        const { error } = await supabase
          .from('workspaces')
          .update({
            deleted_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) throw error

        // Remove from local state
        setWorkspaces(ws => ws.filter(w => w.id !== id))

        // If current workspace was deleted, switch to another
        if (currentWorkspace?.id === id) {
          const nextWorkspace = workspaces.find(w => w.id !== id)
          if (nextWorkspace) {
            await switchWorkspace(nextWorkspace.id)
          }
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to delete workspace')
      }
    },
    [currentWorkspace, workspaces, supabase]
  )

  const archiveWorkspace = useCallback(
    async (id: string): Promise<void> => {
      try {
        const { error } = await supabase
          .rpc('toggle_workspace_archive', {
            p_workspace_id: id,
            p_user_id: user?.id,
            p_archive: true,
          })

        if (error) throw error

        await refreshWorkspaces()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to archive workspace')
      }
    },
    [user, supabase]
  )

  const restoreWorkspace = useCallback(
    async (id: string): Promise<void> => {
      try {
        const { error } = await supabase
          .rpc('toggle_workspace_archive', {
            p_workspace_id: id,
            p_user_id: user?.id,
            p_archive: false,
          })

        if (error) throw error

        await refreshWorkspaces()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to restore workspace')
      }
    },
    [user, supabase]
  )

  const switchWorkspace = useCallback(
    async (id: string): Promise<void> => {
      const workspace = workspaces.find(w => w.id === id)
      if (!workspace) throw new Error('Workspace not found')

      setCurrentWorkspace(workspace)

      // Save to localStorage
      if (currentOrganization) {
        localStorage.setItem(`last_workspace_${currentOrganization.id}`, id)
      }

      // Update last accessed
      await supabase
        .from('workspace_members')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('workspace_id', id)
        .eq('user_id', user?.id)

      // Emit event
      window.dispatchEvent(
        new CustomEvent('workspace-changed', { detail: workspace })
      )
    },
    [workspaces, currentOrganization, user, supabase]
  )

  const addWorkspaceMember = useCallback(
    async (userId: string, role: 'admin' | 'member' | 'viewer'): Promise<void> => {
      if (!currentWorkspace || !canManageWorkspaceMembers()) {
        throw new Error('You do not have permission to add workspace members')
      }

      try {
        const { error } = await supabase
          .rpc('add_workspace_member', {
            p_workspace_id: currentWorkspace.id,
            p_user_id: userId,
            p_role: role,
            p_added_by: user?.id,
          })

        if (error) throw error

        await fetchWorkspaceMembers()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to add workspace member')
      }
    },
    [currentWorkspace, user, supabase]
  )

  const removeWorkspaceMember = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentWorkspace || !canManageWorkspaceMembers()) {
        throw new Error('You do not have permission to remove workspace members')
      }

      try {
        const { error } = await supabase
          .from('workspace_members')
          .delete()
          .eq('workspace_id', currentWorkspace.id)
          .eq('user_id', userId)

        if (error) throw error

        await fetchWorkspaceMembers()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to remove workspace member')
      }
    },
    [currentWorkspace, supabase]
  )

  const updateWorkspaceMemberRole = useCallback(
    async (userId: string, role: 'admin' | 'member' | 'viewer'): Promise<void> => {
      if (!currentWorkspace || !canManageWorkspaceMembers()) {
        throw new Error('You do not have permission to update workspace member roles')
      }

      try {
        const { error } = await supabase
          .from('workspace_members')
          .update({ role })
          .eq('workspace_id', currentWorkspace.id)
          .eq('user_id', userId)

        if (error) throw error

        await fetchWorkspaceMembers()
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update workspace member role')
      }
    },
    [currentWorkspace, supabase]
  )

  // Permission helpers
  const canEditWorkspace = useCallback((): boolean => {
    if (!currentWorkspace || !user) return false

    // Organization admins can always edit
    if (hasPermission('workspace:update')) return true

    // Check if user is workspace admin
    const membership = workspaceMembers.find(m => m.user_id === user.id)
    return membership?.role === 'admin'
  }, [currentWorkspace, user, workspaceMembers, hasPermission])

  const canDeleteWorkspace = useCallback((): boolean => {
    if (!currentWorkspace) return false

    // Only org admins can delete workspaces
    return hasPermission('workspace:delete')
  }, [currentWorkspace, hasPermission])

  const canManageWorkspaceMembers = useCallback((): boolean => {
    if (!currentWorkspace || !user) return false

    // Organization admins can always manage
    if (hasPermission('workspace:manage_members')) return true

    // Check if user is workspace admin
    const membership = workspaceMembers.find(m => m.user_id === user.id)
    return membership?.role === 'admin'
  }, [currentWorkspace, user, workspaceMembers, hasPermission])

  // Utility functions
  const refreshWorkspaces = useCallback(async (): Promise<void> => {
    await fetchWorkspaces()
  }, [currentOrganization])

  const refreshCurrentWorkspace = useCallback(async (): Promise<void> => {
    if (!currentWorkspace) return

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', currentWorkspace.id)
        .single()

      if (error) throw error

      setCurrentWorkspace(data)
      setWorkspaces(ws => ws.map(w => w.id === data.id ? data : w))
    } catch (err) {
      console.error('Error refreshing workspace:', err)
    }
  }, [currentWorkspace, supabase])

  const contextValue = useMemo<WorkspaceContextValue>(() => ({
    currentWorkspace,
    workspaces,
    workspaceMembers,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    switchWorkspace,
    addWorkspaceMember,
    removeWorkspaceMember,
    updateWorkspaceMemberRole,
    canEditWorkspace,
    canDeleteWorkspace,
    canManageWorkspaceMembers,
    refreshWorkspaces,
    refreshCurrentWorkspace,
  }), [
    currentWorkspace,
    workspaces,
    workspaceMembers,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    switchWorkspace,
    addWorkspaceMember,
    removeWorkspaceMember,
    updateWorkspaceMemberRole,
    canEditWorkspace,
    canDeleteWorkspace,
    canManageWorkspaceMembers,
    refreshWorkspaces,
    refreshCurrentWorkspace,
  ])

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  )
}