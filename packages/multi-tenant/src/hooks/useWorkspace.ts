import { useContext } from 'react'
import { WorkspaceContext } from '../providers/WorkspaceProvider'
import type { WorkspaceContextValue } from '../types'

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