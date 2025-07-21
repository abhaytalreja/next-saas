'use client'

import React from 'react'
import { useOrganization } from '../../hooks/useOrganization'

interface AccessDeniedProps {
  title?: string
  message?: string
  requiredPermission?: string
  requiredRole?: string
  showContactAdmin?: boolean
  showUpgrade?: boolean
  onContactAdmin?: () => void
  onUpgrade?: () => void
  className?: string
}

export function AccessDenied({
  title,
  message,
  requiredPermission,
  requiredRole,
  showContactAdmin = true,
  showUpgrade = false,
  onContactAdmin,
  onUpgrade,
  className = ''
}: AccessDeniedProps) {
  const { currentOrganization, userRole, isGuest } = useOrganization()

  // Generate contextual messages based on the missing permission/role
  const getContextualMessage = () => {
    if (requiredRole) {
      const roleMessages: Record<string, string> = {
        owner: 'Only organization owners can access this feature.',
        admin: 'Admin privileges are required for this action.',
        member: 'Member level access is required.',
        viewer: 'Viewer access or higher is required.'
      }
      return roleMessages[requiredRole] || `${requiredRole} role is required.`
    }

    if (requiredPermission) {
      const permissionMessages: Record<string, string> = {
        'organization:update': 'You need permission to modify organization settings.',
        'organization:manage_members': 'You need permission to manage organization members.',
        'organization:manage_billing': 'You need permission to manage billing and subscriptions.',
        'organization:view_audit_logs': 'You need permission to view audit logs.',
        'workspace:create': 'You need permission to create workspaces.',
        'workspace:update': 'You need permission to modify workspaces.',
        'workspace:delete': 'You need permission to delete workspaces.',
        'project:create': 'You need permission to create projects.',
        'project:update': 'You need permission to modify projects.',
        'project:delete': 'You need permission to delete projects.'
      }
      return permissionMessages[requiredPermission] || `The permission "${requiredPermission}" is required.`
    }

    return 'You don\'t have access to this resource.'
  }

  const defaultTitle = title || 'Access Denied'
  const defaultMessage = message || getContextualMessage()

  // Determine the appropriate icon based on the error type
  const getIcon = () => {
    if (isGuest()) {
      return (
        <svg className="h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }

    return (
      <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-6v2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  // Get suggested actions based on context
  const getSuggestedActions = () => {
    const actions = []

    if (isGuest() && showUpgrade) {
      actions.push({
        label: 'Request Access',
        action: onUpgrade || (() => {}),
        primary: true,
        icon: (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      })
    }

    if (showContactAdmin && !isGuest()) {
      actions.push({
        label: 'Contact Admin',
        action: onContactAdmin || (() => {}),
        primary: !isGuest(),
        icon: (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      })
    }

    // Add back navigation
    actions.push({
      label: 'Go Back',
      action: () => window.history.back(),
      primary: false,
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )
    })

    return actions
  }

  const suggestedActions = getSuggestedActions()

  return (
    <div className={`min-h-96 flex items-center justify-center ${className}`}>
      <div className="text-center max-w-md mx-auto p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {defaultTitle}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {defaultMessage}
        </p>

        {/* Context Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-500">Organization:</span>
              <div className="text-gray-900">{currentOrganization?.name || 'Unknown'}</div>
            </div>
            <div>
              <span className="font-medium text-gray-500">Your Role:</span>
              <div className="text-gray-900 capitalize">{userRole || 'Unknown'}</div>
            </div>
            {requiredPermission && (
              <div className="col-span-2 pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-500">Required Permission:</span>
                <code className="block text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs mt-1">
                  {requiredPermission}
                </code>
              </div>
            )}
            {requiredRole && (
              <div className="col-span-2 pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-500">Required Role:</span>
                <div className="text-gray-900 capitalize font-medium">
                  {requiredRole}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {suggestedActions.length > 0 && (
          <div className="space-y-3">
            {suggestedActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${
                  action.primary
                    ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } ${index === 0 ? 'w-full' : ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-xs text-gray-500">
          <p>
            If you believe this is an error, please contact your organization administrator.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                <strong>Dev Info:</strong> Required: {requiredPermission || requiredRole || 'Unknown'} | 
                Current: {userRole} | 
                Org: {currentOrganization?.id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Specific access denied variants
export function InsufficientPermissions({
  permission,
  ...props
}: Omit<AccessDeniedProps, 'requiredPermission'> & { permission: string }) {
  return (
    <AccessDenied
      title="Insufficient Permissions"
      requiredPermission={permission}
      {...props}
    />
  )
}

export function InsufficientRole({
  role,
  ...props
}: Omit<AccessDeniedProps, 'requiredRole'> & { role: string }) {
  return (
    <AccessDenied
      title="Insufficient Role"
      requiredRole={role}
      {...props}
    />
  )
}

export function AdminRequired(props: Omit<AccessDeniedProps, 'requiredRole'>) {
  return (
    <AccessDenied
      title="Admin Access Required"
      requiredRole="admin"
      message="This feature is only available to organization administrators."
      {...props}
    />
  )
}

export function OwnerRequired(props: Omit<AccessDeniedProps, 'requiredRole'>) {
  return (
    <AccessDenied
      title="Owner Access Required"
      requiredRole="owner"
      message="This feature is only available to organization owners."
      {...props}
    />
  )
}

export function MembershipRequired(props: Omit<AccessDeniedProps, 'title' | 'message'>) {
  return (
    <AccessDenied
      title="Membership Required"
      message="You need to be a member of this organization to access this resource."
      showUpgrade={true}
      {...props}
    />
  )
}

// Error boundary for permission errors
export function PermissionErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    setHasError(false)
    setError(null)
  }, [children])

  const handleError = (error: Error) => {
    setHasError(true)
    setError(error)
    console.error('Permission Error:', error)
  }

  if (hasError && error) {
    if (fallback) {
      const FallbackComponent = fallback
      return <FallbackComponent error={error} />
    }

    // Check if it's a permission-related error
    if (error.message.includes('permission') || error.message.includes('access')) {
      return <AccessDenied message={error.message} />
    }

    return <AccessDenied title="Error" message="An unexpected error occurred." />
  }

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {children}
    </React.Suspense>
  )
}