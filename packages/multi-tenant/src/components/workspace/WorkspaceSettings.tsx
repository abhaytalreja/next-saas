'use client'

import React, { useState, useEffect } from 'react'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useOrganization } from '../../hooks/useOrganization'
import type { Workspace, UpdateWorkspaceData } from '../../types/workspace'

interface WorkspaceSettingsProps {
  workspaceId: string
  onSaved?: (workspace: Workspace) => void
  onDeleted?: () => void
  className?: string
}

const WORKSPACE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
]

const WORKSPACE_ICONS = [
  '🏢', '💼', '🚀', '⚡', '🎯', '💡', '🔥', '⭐', '🎨', '🛠️',
  '📊', '🎭', '🎪', '🎲', '🎸', '🎬', '📱', '💻', '🌟', '🔮'
]

export function WorkspaceSettings({
  workspaceId,
  onSaved,
  onDeleted,
  className = ''
}: WorkspaceSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general')
  const [formData, setFormData] = useState<UpdateWorkspaceData>({})
  const [originalData, setOriginalData] = useState<Workspace | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')

  const { 
    getWorkspaceById, 
    updateWorkspace, 
    deleteWorkspace,
    workspaces 
  } = useWorkspace()
  
  const { canManageWorkspaces, isOwner, isAdmin } = useOrganization()

  const workspace = getWorkspaceById(workspaceId)

  useEffect(() => {
    if (workspace) {
      setOriginalData(workspace)
      setFormData({
        name: workspace.name,
        description: workspace.description,
        icon: workspace.icon,
        color: workspace.color,
        is_default: workspace.is_default,
        settings: workspace.settings
      })
    }
  }, [workspace])

  const hasChanges = () => {
    if (!originalData) return false
    
    return (
      formData.name !== originalData.name ||
      formData.description !== originalData.description ||
      formData.icon !== originalData.icon ||
      formData.color !== originalData.color ||
      formData.is_default !== originalData.is_default
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Workspace name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Workspace name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters'
    }

    // Check for duplicate names (excluding current workspace)
    if (workspaces?.some(w => 
      w.id !== workspaceId && 
      w.name.toLowerCase() === formData.name?.trim().toLowerCase()
    )) {
      newErrors.name = 'A workspace with this name already exists'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm() || !workspace) return

    setIsSubmitting(true)

    try {
      const updatedWorkspace = await updateWorkspace(workspaceId, {
        ...formData,
        name: formData.name!.trim(),
        description: formData.description?.trim() || null
      })

      setOriginalData(updatedWorkspace)
      onSaved?.(updatedWorkspace)
    } catch (error) {
      console.error('Failed to update workspace:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update workspace'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!workspace || deleteConfirmationText !== workspace.name) return

    setIsSubmitting(true)

    try {
      await deleteWorkspace(workspaceId)
      onDeleted?.()
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      setErrors({
        delete: error instanceof Error ? error.message : 'Failed to delete workspace'
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirmation(false)
    }
  }

  const handleInputChange = (field: keyof UpdateWorkspaceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!workspace) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Workspace not found</p>
      </div>
    )
  }

  if (!canManageWorkspaces() && !isAdmin()) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Access Denied</div>
        <p className="text-gray-500">You don't have permission to manage workspace settings</p>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-semibold"
            style={{ backgroundColor: workspace.color || '#3B82F6' }}
          >
            {workspace.icon || workspace.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-gray-500">Workspace Settings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', name: 'General', icon: '⚙️' },
            { id: 'members', name: 'Members', icon: '👥' },
            { id: 'danger', name: 'Danger Zone', icon: '⚠️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          {/* General Settings Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>

            <div className="space-y-6">
              {/* Icon and Color */}
              <div className="flex items-start space-x-8">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2 w-48">
                    {WORKSPACE_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleInputChange('icon', icon)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
                          formData.icon === icon
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {WORKSPACE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange('color', color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-semibold shadow-md"
                    style={{ backgroundColor: formData.color || '#3B82F6' }}
                  >
                    {formData.icon || '🏢'}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.name || '').length}/50 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  maxLength={200}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.description || '').length}/200 characters
                </p>
              </div>

              {/* Default Workspace */}
              <div className="flex items-center">
                <input
                  id="is_default"
                  type="checkbox"
                  checked={formData.is_default || false}
                  onChange={(e) => handleInputChange('is_default', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                  Set as default workspace
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <div>
                {errors.submit && (
                  <p className="text-sm text-red-600">{errors.submit}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData({
                    name: originalData?.name,
                    description: originalData?.description,
                    icon: originalData?.icon,
                    color: originalData?.color,
                    is_default: originalData?.is_default,
                    settings: originalData?.settings
                  })}
                  disabled={!hasChanges() || isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges() || isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workspace Members</h3>
          <p className="text-gray-500 mb-6">
            Manage who has access to this workspace and their permissions.
          </p>
          
          <div className="text-center py-8">
            <p className="text-gray-500">Member management coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
              <p className="text-red-700 mb-6">
                These actions are permanent and cannot be undone. Please proceed with caution.
              </p>

              {/* Delete Workspace */}
              <div className="border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-base font-medium text-gray-900 mb-1">
                      Delete Workspace
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Permanently delete this workspace and all its projects, items, and data.
                      This action cannot be undone.
                    </p>
                    
                    {workspace.project_count && workspace.project_count > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> This workspace contains {workspace.project_count} project{workspace.project_count > 1 ? 's' : ''}.
                          All projects and their data will be permanently deleted.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {isOwner() && (
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Workspace
                    </button>
                  )}
                </div>

                {!isOwner() && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600">
                      Only organization owners can delete workspaces.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete Workspace
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the workspace
              "<strong>{workspace.name}</strong>" and all of its projects and data.
            </p>

            <div className="mb-4">
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>{workspace.name}</strong> to confirm deletion:
              </label>
              <input
                type="text"
                id="confirmation"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={workspace.name}
              />
            </div>

            {errors.delete && (
              <p className="text-sm text-red-600 mb-4">{errors.delete}</p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setDeleteConfirmationText('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmationText !== workspace.name || isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Workspace'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}