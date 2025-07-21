'use client'

import React from 'react'
import { useState } from 'react'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useOrganization } from '../../hooks/useOrganization'
import type { Workspace } from '../../types/workspace'

interface WorkspaceListProps {
  onWorkspaceSelect?: (workspace: Workspace) => void
  onCreateWorkspace?: () => void
  className?: string
}

export function WorkspaceList({
  onWorkspaceSelect,
  onCreateWorkspace,
  className = ''
}: WorkspaceListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([])
  
  const { workspaces, isLoading, error, archiveWorkspace, restoreWorkspace } = useWorkspace()
  const { hasPermission, canManageWorkspaces } = useOrganization()

  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces?.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Group workspaces by archived status
  const activeWorkspaces = filteredWorkspaces.filter(w => !w.is_archived)
  const archivedWorkspaces = filteredWorkspaces.filter(w => w.is_archived)

  const handleWorkspaceClick = (workspace: Workspace) => {
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspace)
    }
  }

  const handleArchive = async (workspaceId: string) => {
    try {
      await archiveWorkspace(workspaceId)
    } catch (error) {
      console.error('Failed to archive workspace:', error)
    }
  }

  const handleRestore = async (workspaceId: string) => {
    try {
      await restoreWorkspace(workspaceId)
    } catch (error) {
      console.error('Failed to restore workspace:', error)
    }
  }

  const toggleWorkspaceSelection = (workspaceId: string) => {
    setSelectedWorkspaces(prev =>
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    )
  }

  if (isLoading) {
    return <WorkspaceListSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-2">Failed to load workspaces</div>
        <p className="text-gray-500 text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workspaces</h2>
          <p className="text-gray-600 mt-1">
            Organize your projects and team collaboration
          </p>
        </div>
        
        {canManageWorkspaces() && (
          <button
            onClick={onCreateWorkspace}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Workspace
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search workspaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Bulk Actions */}
      {selectedWorkspaces.length > 0 && canManageWorkspaces() && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <span className="text-blue-800 text-sm font-medium">
            {selectedWorkspaces.length} workspace{selectedWorkspaces.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Archive Selected
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Active Workspaces */}
      {activeWorkspaces.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Workspaces ({activeWorkspaces.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isSelected={selectedWorkspaces.includes(workspace.id)}
                onSelect={() => toggleWorkspaceSelection(workspace.id)}
                onWorkspaceClick={() => handleWorkspaceClick(workspace)}
                onArchive={() => handleArchive(workspace.id)}
                canManage={canManageWorkspaces()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived Workspaces */}
      {archivedWorkspaces.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-500 mb-4">
            Archived Workspaces ({archivedWorkspaces.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archivedWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isSelected={selectedWorkspaces.includes(workspace.id)}
                onSelect={() => toggleWorkspaceSelection(workspace.id)}
                onWorkspaceClick={() => handleWorkspaceClick(workspace)}
                onRestore={() => handleRestore(workspace.id)}
                canManage={canManageWorkspaces()}
                isArchived
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredWorkspaces.length === 0 && !isLoading && (
        <div className="text-center py-12">
          {searchTerm ? (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
              <p className="text-gray-500">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first workspace.</p>
              {canManageWorkspaces() && (
                <button
                  onClick={onCreateWorkspace}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Workspace
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Workspace Card Component
interface WorkspaceCardProps {
  workspace: Workspace
  isSelected: boolean
  onSelect: () => void
  onWorkspaceClick: () => void
  onArchive?: () => void
  onRestore?: () => void
  canManage: boolean
  isArchived?: boolean
}

function WorkspaceCard({
  workspace,
  isSelected,
  onSelect,
  onWorkspaceClick,
  onArchive,
  onRestore,
  canManage,
  isArchived = false
}: WorkspaceCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${isArchived ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {canManage && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-semibold`}
              style={{ backgroundColor: workspace.color || '#3B82F6' }}
            >
              {workspace.icon || workspace.name[0]?.toUpperCase()}
            </div>
          </div>
          
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      Edit Workspace
                    </button>
                    <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      Manage Members
                    </button>
                    {isArchived ? (
                      <button
                        onClick={onRestore}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Restore Workspace
                      </button>
                    ) : (
                      <button
                        onClick={onArchive}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Archive Workspace
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 cursor-pointer" onClick={onWorkspaceClick}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {workspace.name}
            {workspace.is_default && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Default
              </span>
            )}
          </h3>
          
          {workspace.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {workspace.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              {workspace.project_count || 0} project{workspace.project_count === 1 ? '' : 's'}
            </span>
            <span>
              Updated {new Date(workspace.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton
function WorkspaceListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      
      <div className="h-10 bg-gray-200 rounded"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}