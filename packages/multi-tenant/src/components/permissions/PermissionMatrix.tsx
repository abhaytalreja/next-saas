'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import type { Permission, Role, SystemPermission } from '../../types/permissions'

interface PermissionMatrixProps {
  onPermissionChange?: (role: string, permission: string, granted: boolean) => void
  readOnly?: boolean
  className?: string
}

// System permissions organized by category
const PERMISSION_CATEGORIES = {
  organization: {
    name: 'Organization',
    permissions: [
      { key: 'organization:view', name: 'View Organization', description: 'View organization details' },
      { key: 'organization:update', name: 'Update Organization', description: 'Edit organization settings' },
      { key: 'organization:delete', name: 'Delete Organization', description: 'Delete the organization' },
      { key: 'organization:manage_members', name: 'Manage Members', description: 'Invite, remove, and manage members' },
      { key: 'organization:manage_billing', name: 'Manage Billing', description: 'Access billing and subscription settings' },
      { key: 'organization:view_audit_logs', name: 'View Audit Logs', description: 'Access audit logs and activity history' },
      { key: 'organization:manage_security', name: 'Manage Security', description: 'Configure security policies' },
    ]
  },
  workspace: {
    name: 'Workspace',
    permissions: [
      { key: 'workspace:view', name: 'View Workspaces', description: 'View workspace information' },
      { key: 'workspace:create', name: 'Create Workspaces', description: 'Create new workspaces' },
      { key: 'workspace:update', name: 'Update Workspaces', description: 'Edit workspace settings' },
      { key: 'workspace:delete', name: 'Delete Workspaces', description: 'Delete workspaces' },
      { key: 'workspace:manage_members', name: 'Manage Workspace Members', description: 'Add/remove workspace members' },
    ]
  },
  project: {
    name: 'Project',
    permissions: [
      { key: 'project:view', name: 'View Projects', description: 'View project information' },
      { key: 'project:create', name: 'Create Projects', description: 'Create new projects' },
      { key: 'project:update', name: 'Update Projects', description: 'Edit project details' },
      { key: 'project:delete', name: 'Delete Projects', description: 'Delete projects' },
      { key: 'project:manage', name: 'Manage Projects', description: 'Full project management access' },
    ]
  },
  item: {
    name: 'Content',
    permissions: [
      { key: 'item:view', name: 'View Items', description: 'View project items and content' },
      { key: 'item:create', name: 'Create Items', description: 'Create new items' },
      { key: 'item:update', name: 'Update Items', description: 'Edit existing items' },
      { key: 'item:delete', name: 'Delete Items', description: 'Delete items' },
    ]
  },
  api: {
    name: 'API Access',
    permissions: [
      { key: 'api:access', name: 'API Access', description: 'Access to API endpoints' },
      { key: 'api:admin', name: 'Admin API Access', description: 'Administrative API operations' },
    ]
  }
}

// Standard role definitions
const STANDARD_ROLES = [
  {
    key: 'owner',
    name: 'Owner',
    description: 'Full access to all organization features',
    permissions: ['*'],
    color: 'red',
    immutable: true
  },
  {
    key: 'admin',
    name: 'Admin',
    description: 'Administrative access to most features',
    permissions: [
      'organization:view', 'organization:update', 'organization:manage_members',
      'organization:manage_billing', 'organization:view_audit_logs',
      'workspace:*', 'project:*', 'item:*', 'api:*'
    ],
    color: 'orange',
    immutable: true
  },
  {
    key: 'member',
    name: 'Member',
    description: 'Standard member with project access',
    permissions: [
      'organization:view', 'workspace:view', 'workspace:create',
      'project:*', 'item:*', 'api:access'
    ],
    color: 'blue',
    immutable: true
  },
  {
    key: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to most features',
    permissions: [
      'organization:view', 'workspace:view', 'project:view', 'item:view'
    ],
    color: 'gray',
    immutable: true
  },
  {
    key: 'guest',
    name: 'Guest',
    description: 'Limited access to specific resources',
    permissions: ['organization:view'],
    color: 'green',
    immutable: true
  }
]

export function PermissionMatrix({
  onPermissionChange,
  readOnly = false,
  className = ''
}: PermissionMatrixProps) {
  const [selectedRole, setSelectedRole] = useState<string>('member')
  const [customRoles, setCustomRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['organization']))

  const { isOwner, isAdmin } = useOrganization()
  const canEdit = !readOnly && (isOwner() || isAdmin())

  // Get all roles (standard + custom)
  const allRoles = [
    ...STANDARD_ROLES,
    ...customRoles
  ]

  const selectedRoleData = allRoles.find(role => role.key === selectedRole)

  // Check if role has permission
  const hasPermission = (role: Role, permissionKey: string): boolean => {
    if (role.permissions.includes('*')) return true
    if (role.permissions.includes(permissionKey)) return true
    
    // Check wildcard permissions
    const [resource, action] = permissionKey.split(':')
    if (role.permissions.includes(`${resource}:*`)) return true
    if (role.permissions.includes(`*:${action}`)) return true
    
    return false
  }

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey: string, granted: boolean) => {
    if (!canEdit || selectedRoleData?.immutable) return
    
    onPermissionChange?.(selectedRole, permissionKey, granted)
    
    // Update local state for custom roles
    if (!selectedRoleData?.immutable) {
      setCustomRoles(prev => prev.map(role => {
        if (role.key === selectedRole) {
          const permissions = granted
            ? [...role.permissions.filter(p => p !== permissionKey), permissionKey]
            : role.permissions.filter(p => p !== permissionKey)
          
          return { ...role, permissions }
        }
        return role
      }))
    }
  }

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey)
      } else {
        newSet.add(categoryKey)
      }
      return newSet
    })
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Permission Matrix</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review and configure role-based permissions for your organization
            </p>
          </div>
          
          {canEdit && (
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Custom Role
            </button>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Role Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Roles</h4>
            <div className="space-y-1">
              {allRoles.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedRole === role.key
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 bg-${role.color}-500`}
                    />
                    <span className="font-medium">{role.name}</span>
                  </div>
                  
                  {role.immutable && (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Content */}
        <div className="flex-1">
          {selectedRoleData && (
            <>
              {/* Role Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full mr-3 bg-${selectedRoleData.color}-500`}
                    />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {selectedRoleData.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedRoleData.description}
                      </p>
                    </div>
                  </div>
                  
                  {!selectedRoleData.immutable && canEdit && (
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Edit Role
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Delete Role
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedRoleData.immutable && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-800">
                      This is a system role and cannot be modified
                    </p>
                  </div>
                )}
              </div>

              {/* Permission Categories */}
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                  const isExpanded = expandedCategories.has(categoryKey)
                  
                  return (
                    <div key={categoryKey} className="border-b border-gray-100 last:border-b-0">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(categoryKey)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <svg
                            className={`w-4 h-4 mr-2 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {category.permissions.filter(p => hasPermission(selectedRoleData, p.key)).length} / {category.permissions.length}
                        </div>
                      </button>

                      {/* Category Permissions */}
                      {isExpanded && (
                        <div className="bg-gray-50">
                          {category.permissions.map((permission) => {
                            const hasCurrentPermission = hasPermission(selectedRoleData, permission.key)
                            const canToggle = canEdit && !selectedRoleData.immutable
                            
                            return (
                              <div
                                key={permission.key}
                                className="flex items-center justify-between px-6 py-3 border-b border-gray-200 last:border-b-0"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {permission.name}
                                    </h5>
                                    <code className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                                      {permission.key}
                                    </code>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                                
                                <div className="ml-4">
                                  {canToggle ? (
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={hasCurrentPermission}
                                        onChange={(e) => handlePermissionToggle(permission.key, e.target.checked)}
                                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-blue-500"
                                      />
                                      <span className="ml-2 text-sm text-gray-600">
                                        {hasCurrentPermission ? 'Granted' : 'Denied'}
                                      </span>
                                    </label>
                                  ) : (
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      hasCurrentPermission
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {hasCurrentPermission ? (
                                        <>
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Granted
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                          Denied
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}