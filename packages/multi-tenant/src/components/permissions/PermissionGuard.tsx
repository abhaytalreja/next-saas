'use client'

import React from 'react'
import { useOrganization } from '../../hooks/useOrganization'

interface PermissionGuardProps {
  permission?: string | string[]
  role?: string | string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
  organizationId?: string
}

/**
 * PermissionGuard component to conditionally render content based on user permissions
 */
export function PermissionGuard({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
  organizationId
}: PermissionGuardProps) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    currentOrganization,
    isOwner,
    isAdmin,
    isMember,
    userRole
  } = useOrganization()

  // If organizationId is specified and doesn't match current, deny access
  if (organizationId && currentOrganization?.id !== organizationId) {
    return <>{fallback}</>
  }

  let hasAccess = true

  // Check permissions if specified
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission]
    
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  }

  // Check roles if specified (and permissions passed)
  if (role && hasAccess) {
    const roles = Array.isArray(role) ? role : [role]
    
    if (requireAll) {
      // For roles, requireAll means user must have ALL specified roles
      // This is rare but might be used for compound role requirements
      hasAccess = roles.every(r => checkUserRole(r, userRole))
    } else {
      // User must have at least one of the specified roles
      hasAccess = roles.some(r => checkUserRole(r, userRole))
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Helper function to check if user has a specific role
 */
function checkUserRole(requiredRole: string, userRole: string): boolean {
  // Exact match
  if (userRole === requiredRole) return true
  
  // Role hierarchy check
  const roleHierarchy: Record<string, number> = {
    guest: 0,
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4
  }

  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  // User role must be equal or higher than required role
  return userLevel >= requiredLevel
}

/**
 * RequirePermission - Higher-order component for permission-based rendering
 */
export function RequirePermission({
  permission,
  fallback,
  children
}: {
  permission: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * RequireRole - Higher-order component for role-based rendering
 */
export function RequireRole({
  role,
  fallback,
  children
}: {
  role: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <PermissionGuard role={role} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * RequireOwner - Only show content to organization owners
 */
export function RequireOwner({
  fallback,
  children
}: {
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <PermissionGuard role="owner" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * RequireAdmin - Show content to admins and owners
 */
export function RequireAdmin({
  fallback,
  children
}: {
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <PermissionGuard role={['admin', 'owner']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * HideFromRole - Hide content from specific roles
 */
export function HideFromRole({
  role,
  children
}: {
  role: string | string[]
  children: React.ReactNode
}) {
  const { userRole } = useOrganization()
  const rolesToHide = Array.isArray(role) ? role : [role]
  
  const shouldHide = rolesToHide.some(r => checkUserRole(r, userRole))
  
  return shouldHide ? null : <>{children}</>
}

/**
 * PermissionDebugger - Development helper to show current permissions
 */
export function PermissionDebugger({ enabled = false }: { enabled?: boolean }) {
  const { 
    currentOrganization,
    userRole,
    hasPermission
  } = useOrganization()

  if (!enabled || process.env.NODE_ENV === 'production') {
    return null
  }

  const testPermissions = [
    'organization:view',
    'organization:update',
    'organization:manage_members',
    'organization:manage_billing',
    'workspace:create',
    'workspace:update',
    'project:create',
    'project:update',
    'item:create',
    'item:update'
  ]

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h4 className="font-bold mb-2">Permission Debug</h4>
      <div className="space-y-1">
        <div><strong>Org:</strong> {currentOrganization?.name}</div>
        <div><strong>Role:</strong> {userRole}</div>
        <div className="border-t border-gray-700 pt-2 mt-2">
          <strong>Permissions:</strong>
          {testPermissions.map(permission => (
            <div key={permission} className="flex justify-between">
              <span className="truncate mr-2">{permission.split(':')[1]}:</span>
              <span className={hasPermission(permission) ? 'text-green-400' : 'text-red-400'}>
                {hasPermission(permission) ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * ConditionalWrapper - Conditionally wrap children with a component
 */
export function ConditionalWrapper({
  condition,
  wrapper,
  children
}: {
  condition: boolean
  wrapper: (children: React.ReactNode) => React.ReactNode
  children: React.ReactNode
}) {
  return condition ? wrapper(children) : <>{children}</>
}

/**
 * FeatureFlag - Simple feature flag component
 */
export function FeatureFlag({
  flag,
  children
}: {
  flag: string
  children: React.ReactNode
}) {
  // This would typically check against a feature flag service
  // For now, we'll use environment variables
  const isEnabled = process.env[`NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`] === 'true'
  
  return isEnabled ? <>{children}</> : null
}