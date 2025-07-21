import { useContext } from 'react'
import { WorkspaceContext } from '../providers/WorkspaceProvider'
import type { 
  WorkspaceContextValue, 
  Workspace,
  CreateWorkspaceData,
  UpdateWorkspaceData 
} from '../types'

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  
  return context
}

// Convenience hooks
export function useCurrentWorkspace() {
  const { currentWorkspace, isLoading, error } = useWorkspace()
  return { workspace: currentWorkspace, isLoading, error }
}

export function useWorkspacePermissions() {
  const {
    canEditWorkspace,
    canDeleteWorkspace,
    canManageWorkspaceMembers,
  } = useWorkspace()

  return {
    canEdit: canEditWorkspace,
    canDelete: canDeleteWorkspace,
    canManageMembers: canManageWorkspaceMembers,
  }
}

// Workspace management hooks
export function useWorkspaceActions() {
  const {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    setCurrentWorkspace
  } = useWorkspace()

  return {
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    archiveWorkspace,
    restoreWorkspace,
    setCurrentWorkspace
  }
}

// Workspace data hooks
export function useWorkspaceList() {
  const { workspaces, isLoading, error, refreshWorkspaces } = useWorkspace()
  
  const activeWorkspaces = workspaces?.filter(w => !w.is_archived) || []
  const archivedWorkspaces = workspaces?.filter(w => w.is_archived) || []
  
  return {
    workspaces,
    activeWorkspaces,
    archivedWorkspaces,
    isLoading,
    error,
    refreshWorkspaces
  }
}

// Individual workspace hook
export function useWorkspaceById(workspaceId: string) {
  const { getWorkspaceById, workspaces } = useWorkspace()
  
  const workspace = getWorkspaceById(workspaceId)
  
  return {
    workspace,
    exists: !!workspace,
    isArchived: workspace?.is_archived || false,
    isDefault: workspace?.is_default || false
  }
}