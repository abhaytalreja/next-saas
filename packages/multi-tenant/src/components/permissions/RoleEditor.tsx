'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import type { Role, Permission } from '../../types/permissions'

interface RoleEditorProps {
  roleId?: string
  onSave?: (role: Role) => void
  onCancel?: () => void
  className?: string
}

const ROLE_COLORS = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
  { name: 'Green', value: 'green', bg: 'bg-green-500' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500' },
  { name: 'Red', value: 'red', bg: 'bg-red-500' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-500' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500' },
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-500' },
  { name: 'Gray', value: 'gray', bg: 'bg-gray-500' }
]

const AVAILABLE_PERMISSIONS = [
  // Organization permissions
  { key: 'organization:view', name: 'View Organization', category: 'Organization' },
  { key: 'organization:update', name: 'Update Organization', category: 'Organization' },
  { key: 'organization:manage_members', name: 'Manage Members', category: 'Organization' },
  { key: 'organization:manage_billing', name: 'Manage Billing', category: 'Organization' },
  { key: 'organization:view_audit_logs', name: 'View Audit Logs', category: 'Organization' },
  { key: 'organization:manage_security', name: 'Manage Security', category: 'Organization' },
  
  // Workspace permissions
  { key: 'workspace:view', name: 'View Workspaces', category: 'Workspace' },
  { key: 'workspace:create', name: 'Create Workspaces', category: 'Workspace' },
  { key: 'workspace:update', name: 'Update Workspaces', category: 'Workspace' },
  { key: 'workspace:delete', name: 'Delete Workspaces', category: 'Workspace' },
  { key: 'workspace:manage_members', name: 'Manage Workspace Members', category: 'Workspace' },
  
  // Project permissions
  { key: 'project:view', name: 'View Projects', category: 'Project' },
  { key: 'project:create', name: 'Create Projects', category: 'Project' },
  { key: 'project:update', name: 'Update Projects', category: 'Project' },
  { key: 'project:delete', name: 'Delete Projects', category: 'Project' },
  { key: 'project:manage', name: 'Manage Projects', category: 'Project' },
  
  // Content permissions
  { key: 'item:view', name: 'View Items', category: 'Content' },
  { key: 'item:create', name: 'Create Items', category: 'Content' },
  { key: 'item:update', name: 'Update Items', category: 'Content' },
  { key: 'item:delete', name: 'Delete Items', category: 'Content' },
  
  // API permissions
  { key: 'api:access', name: 'API Access', category: 'API' },
  { key: 'api:admin', name: 'Admin API Access', category: 'API' }
]

const PERMISSION_PRESETS = [
  {
    name: 'Read Only',
    description: 'View access to all resources',
    permissions: ['organization:view', 'workspace:view', 'project:view', 'item:view']
  },
  {
    name: 'Content Editor',
    description: 'Create and edit content',
    permissions: [
      'organization:view', 'workspace:view', 'workspace:create',
      'project:view', 'project:create', 'project:update',
      'item:view', 'item:create', 'item:update', 'api:access'
    ]
  },
  {
    name: 'Project Manager',
    description: 'Full project management access',
    permissions: [
      'organization:view', 'workspace:view', 'workspace:create', 'workspace:update',
      'project:*', 'item:*', 'api:access'
    ]
  },
  {
    name: 'Administrator',
    description: 'Full administrative access (excluding organization management)',
    permissions: [
      'organization:view', 'organization:manage_members', 'organization:view_audit_logs',
      'workspace:*', 'project:*', 'item:*', 'api:*'
    ]
  }
]

export function RoleEditor({
  roleId,
  onSave,
  onCancel,
  className = ''
}: RoleEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    permissions: [] as string[],
    level: 'organization' as 'organization' | 'workspace' | 'project'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const { isOwner, isAdmin } = useOrganization()
  const canEdit = isOwner() || isAdmin()

  // Filter permissions based on search and category
  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.key.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || permission.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group permissions by category
  const permissionCategories = [...new Set(AVAILABLE_PERMISSIONS.map(p => p.category))]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Role name must be less than 50 characters'
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const roleData: Role = {
        id: roleId || `custom_${Date.now()}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        permissions: formData.permissions,
        level: formData.level,
        immutable: false
      }

      onSave?.(roleData)
    } catch (error) {
      console.error('Failed to save role:', error)
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save role'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionToggle = (permissionKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }))
    
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }))
    }
  }

  const applyPreset = (preset: typeof PERMISSION_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      permissions: preset.permissions
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!canEdit) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Access Denied</div>
        <p className="text-gray-500">You don't have permission to create or edit roles</p>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {roleId ? 'Edit Role' : 'Create Custom Role'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {roleId ? 'Modify the role permissions and settings' : 'Create a new role with specific permissions for your organization'}
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Content Editor, Project Manager"
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/50 characters
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('color', color.value)}
                      className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                        formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                          : 'hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
                
                {/* Preview */}
                <div className="mt-3 flex items-center">
                  <div className={`w-6 h-6 rounded-full mr-2 bg-${formData.color}-500`} />
                  <span className="text-sm text-gray-700">{formData.name || 'Role Preview'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this role is for and who should have it..."
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300' : ''
                }`}
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Role Level */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Level
              </label>
              <div className="flex space-x-4">
                {[
                  { key: 'organization', name: 'Organization', desc: 'Organization-wide role' },
                  { key: 'workspace', name: 'Workspace', desc: 'Workspace-specific role' },
                  { key: 'project', name: 'Project', desc: 'Project-specific role' }
                ].map((level) => (
                  <label key={level.key} className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      value={level.key}
                      checked={formData.level === level.key}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-2">
                      <span className="text-sm font-medium text-gray-900">{level.name}</span>
                      <p className="text-xs text-gray-500">{level.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Presets */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Quick Start Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PERMISSION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                >
                  <h5 className="font-medium text-gray-900 mb-1">{preset.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                  <div className="text-xs text-blue-600">
                    {preset.permissions.length} permissions
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium text-gray-900">
                Permissions ({formData.permissions.length} selected)
              </h4>
              
              {errors.permissions && (
                <p className="text-sm text-red-600">{errors.permissions}</p>
              )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Categories</option>
                  {permissionCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permissions List */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {filteredPermissions.map((permission) => {
                const isSelected = formData.permissions.includes(permission.key)
                
                return (
                  <label
                    key={permission.key}
                    className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePermissionToggle(permission.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {permission.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {permission.category}
                        </span>
                      </div>
                      <code className="text-xs text-gray-600 mt-1 block">
                        {permission.key}
                      </code>
                    </div>
                  </label>
                )
              })}
            </div>

            {filteredPermissions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>No permissions found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {errors.submit && (
                <p className="text-sm text-red-600">{errors.submit}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || !formData.name.trim() || formData.permissions.length === 0}
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
                  `${roleId ? 'Update' : 'Create'} Role`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}