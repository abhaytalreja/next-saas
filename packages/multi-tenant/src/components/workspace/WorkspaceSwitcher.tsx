'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useOrganization } from '../../hooks/useOrganization'
import type { Workspace } from '../../types/workspace'

interface WorkspaceSwitcherProps {
  onWorkspaceChange?: (workspace: Workspace) => void
  className?: string
  showCreateButton?: boolean
  onCreateWorkspace?: () => void
}

export function WorkspaceSwitcher({
  onWorkspaceChange,
  className = '',
  showCreateButton = true,
  onCreateWorkspace
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    isLoading 
  } = useWorkspace()
  
  const { canManageWorkspaces } = useOrganization()

  // Filter workspaces based on search
  const filteredWorkspaces = workspaces?.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !workspace.is_archived
  ) || []

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace.id)
    setIsOpen(false)
    setSearchTerm('')
    onWorkspaceChange?.(workspace)
  }

  const handleCreateNew = () => {
    setIsOpen(false)
    setSearchTerm('')
    onCreateWorkspace?.()
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
      </div>
    )
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className={className}>
        {showCreateButton && canManageWorkspaces() && (
          <button
            onClick={onCreateWorkspace}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create First Workspace
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {currentWorkspace ? (
          <>
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-sm font-semibold mr-3"
              style={{ backgroundColor: currentWorkspace.color || '#3B82F6' }}
            >
              {currentWorkspace.icon || currentWorkspace.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="truncate max-w-40">
                {currentWorkspace.name}
              </div>
              {currentWorkspace.is_default && (
                <div className="text-xs text-gray-500">Default</div>
              )}
            </div>
          </>
        ) : (
          <span className="flex-1 text-left text-gray-500">Select workspace...</span>
        )}
        
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredWorkspaces.length > 0 ? (
              <>
                <div className="py-1">
                  {filteredWorkspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-50 ${
                        currentWorkspace?.id === workspace.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold mr-3 flex-shrink-0"
                        style={{ backgroundColor: workspace.color || '#3B82F6' }}
                      >
                        {workspace.icon || workspace.name[0]?.toUpperCase()}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center">
                          <span className="font-medium truncate">{workspace.name}</span>
                          {workspace.is_default && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                          {currentWorkspace?.id === workspace.id && (
                            <svg className="ml-2 w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {workspace.description && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {workspace.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {workspace.project_count || 0} project{workspace.project_count === 1 ? '' : 's'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {showCreateButton && canManageWorkspaces() && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleCreateNew}
                      className="w-full flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="font-medium">Create new workspace</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center">
                {searchTerm ? (
                  <>
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-3">
                      No workspaces found for "{searchTerm}"
                    </p>
                    {showCreateButton && canManageWorkspaces() && (
                      <button
                        onClick={handleCreateNew}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Create "{searchTerm}" workspace
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-3">
                      No active workspaces found
                    </p>
                    {showCreateButton && canManageWorkspaces() && (
                      <button
                        onClick={handleCreateNew}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Create your first workspace
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for mobile/small spaces
export function CompactWorkspaceSwitcher({
  onWorkspaceChange,
  className = ''
}: {
  onWorkspaceChange?: (workspace: Workspace) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace()

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace.id)
    setIsOpen(false)
    onWorkspaceChange?.(workspace)
  }

  if (!workspaces || workspaces.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={currentWorkspace?.name}
      >
        {currentWorkspace && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: currentWorkspace.color || '#3B82F6' }}
          >
            {currentWorkspace.icon || currentWorkspace.name[0]?.toUpperCase()}
          </div>
        )}
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1 max-h-64 overflow-y-auto">
            {workspaces.filter(w => !w.is_archived).map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 ${
                  currentWorkspace?.id === workspace.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-semibold mr-3"
                  style={{ backgroundColor: workspace.color || '#3B82F6' }}
                >
                  {workspace.icon || workspace.name[0]?.toUpperCase()}
                </div>
                <span className="truncate">{workspace.name}</span>
                {currentWorkspace?.id === workspace.id && (
                  <svg className="ml-auto w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}