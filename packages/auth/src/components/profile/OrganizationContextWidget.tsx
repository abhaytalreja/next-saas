'use client'

import React, { useState } from 'react'
import { useOrganization, useCurrentMembership } from '../../hooks'
import { OrganizationSwitcher } from '../ui/OrganizationSwitcher'
import { 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ShieldCheckIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface OrganizationContextWidgetProps {
  className?: string
  compact?: boolean
  showPermissions?: boolean
  showDescription?: boolean
}

export function OrganizationContextWidget({
  className = '',
  compact = false,
  showPermissions = true,
  showDescription = true
}: OrganizationContextWidgetProps) {
  const { currentOrganization, loading } = useOrganization()
  const { membership } = useCurrentMembership()
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-lg p-4 ${className}`}>
        <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
    )
  }

  const getContextInfo = () => {
    const orgMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase() || 'none'
    
    if (!currentOrganization) {
      return {
        mode: 'Personal',
        description: 'Your profile is visible to all users',
        icon: GlobeAltIcon,
        color: 'green',
        visibility: 'Public'
      }
    }

    if (orgMode === 'single') {
      return {
        mode: 'Organization',
        description: `Profile is scoped to ${currentOrganization.name}`,
        icon: BuildingOfficeIcon,
        color: 'blue',
        visibility: 'Organization Members'
      }
    }

    return {
      mode: 'Multi-Org Context',
      description: `Context-specific profile for ${currentOrganization.name}`,
      icon: UsersIcon,
      color: 'purple',
      visibility: 'Context-Specific'
    }
  }

  const contextInfo = getContextInfo()
  const IconComponent = contextInfo.icon

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100'
      case 'admin': return 'text-blue-600 bg-blue-100'
      case 'member': return 'text-green-600 bg-green-100'
      case 'viewer': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <IconComponent className={`h-5 w-5 text-${contextInfo.color}-500`} />
          <span className="text-sm font-medium text-gray-900">
            {currentOrganization ? currentOrganization.name : 'Personal Profile'}
          </span>
          {membership && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(membership.role)}`}>
              {membership.role}
            </span>
          )}
        </div>
        <OrganizationSwitcher size="sm" showCreateOption={false} />
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${contextInfo.color}-100 rounded-lg`}>
              <IconComponent className={`h-6 w-6 text-${contextInfo.color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {contextInfo.mode}
              </h3>
              {currentOrganization && (
                <p className="text-sm text-gray-600">
                  {currentOrganization.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {membership && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(membership.role)}`}>
                <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
              </span>
            )}
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {showDescription && (
          <div className="mt-3 flex items-start space-x-2">
            <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              {contextInfo.description}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Organization Switcher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Switch Context
            </label>
            <OrganizationSwitcher className="w-full" />
          </div>

          {/* Visibility Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <EyeIcon className="h-4 w-4" />
              <span>{contextInfo.visibility}</span>
            </div>
          </div>

          {/* Permissions */}
          {showPermissions && membership && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Permissions
              </label>
              <div className="space-y-1">
                {membership.permissions?.slice(0, 3).map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>{permission.replace(':', ': ').replace('_', ' ')}</span>
                  </div>
                ))}
                {membership.permissions && membership.permissions.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{membership.permissions.length - 3} more permissions
                  </div>
                )}
                {(!membership.permissions || membership.permissions.length === 0) && (
                  <div className="text-sm text-gray-500 italic">
                    No specific permissions (using role defaults)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {currentOrganization && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Info
              </label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Members</span>
                  <div className="font-medium">{currentOrganization.memberships_count || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-500">Your Role</span>
                  <div className="font-medium">{membership?.role || 'Unknown'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Minimal version for headers or sidebars
export function OrganizationContextBadge({ 
  className = '', 
  onClick 
}: { 
  className?: string
  onClick?: () => void 
}) {
  const { currentOrganization } = useOrganization()
  const { membership } = useCurrentMembership()

  const getBadgeColor = () => {
    if (!currentOrganization) return 'bg-green-100 text-green-800'
    const orgMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    return orgMode === 'multi' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const getIcon = () => {
    if (!currentOrganization) return GlobeAltIcon
    const orgMode = process.env.NEXT_PUBLIC_ORGANIZATION_MODE?.toLowerCase()
    return orgMode === 'multi' ? UsersIcon : BuildingOfficeIcon
  }

  const IconComponent = getIcon()

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
        ${getBadgeColor()} hover:opacity-80 transition-opacity
        ${className}
      `}
    >
      <IconComponent className="h-4 w-4 mr-2" />
      <span>
        {currentOrganization ? currentOrganization.name : 'Personal'}
        {membership && ` (${membership.role})`}
      </span>
    </button>
  )
}