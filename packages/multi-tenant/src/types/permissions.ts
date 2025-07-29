export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
  conditions?: PermissionCondition[]
  metadata?: Record<string, any>
}

export interface PermissionCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'
  value: any
  logic?: 'and' | 'or'
}

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  level: 'organization' | 'workspace' | 'project'
  permissions: Permission[]
  inherits_from?: string[]
  is_system: boolean
  is_custom: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CustomRole extends Role {
  organization_id: string
  created_by: string
}

// System permissions
export const SYSTEM_PERMISSIONS = {
  // Organization permissions
  'organization:view': 'View organization details',
  'organization:update': 'Update organization settings',
  'organization:delete': 'Delete organization',
  'organization:manage_billing': 'Manage billing and subscriptions',
  'organization:manage_members': 'Manage organization members',
  'organization:manage_roles': 'Manage custom roles',
  'organization:view_audit_logs': 'View audit logs',
  'organization:manage_security': 'Manage security settings',

  // Workspace permissions
  'workspace:create': 'Create workspaces',
  'workspace:view': 'View workspace details',
  'workspace:update': 'Update workspace settings',
  'workspace:delete': 'Delete workspaces',
  'workspace:archive': 'Archive/unarchive workspaces',
  'workspace:manage_members': 'Manage workspace members',
  'workspace:manage_integrations': 'Manage workspace integrations',

  // Project permissions
  'project:create': 'Create projects',
  'project:view': 'View project details',
  'project:update': 'Update project settings',
  'project:delete': 'Delete projects',
  'project:manage_members': 'Manage project members',

  // Item permissions
  'item:create': 'Create items',
  'item:view': 'View items',
  'item:update': 'Update items',
  'item:delete': 'Delete items',
  'item:assign': 'Assign items to users',
  'item:comment': 'Comment on items',

  // API permissions
  'api:access': 'Access API',
  'api:manage_keys': 'Manage API keys',
  'api:view_logs': 'View API logs',

  // System permissions
  'system:manage_webhooks': 'Manage webhooks',
  'system:export_data': 'Export data',
  'system:import_data': 'Import data',

  // Super Admin permissions (system-wide)
  'admin:access_dashboard': 'Access admin dashboard',
  'admin:manage_users': 'Manage all users across platform',
  'admin:manage_organizations': 'Manage all organizations',
  'admin:view_analytics': 'View system-wide analytics',
  'admin:manage_billing': 'Manage system billing and subscriptions',
  'admin:manage_email': 'Manage email system and campaigns',
  'admin:manage_security': 'Manage platform security settings',
  'admin:view_audit_logs': 'View all system audit logs',
  'admin:manage_system': 'Manage system health and configuration',
  'admin:manage_settings': 'Manage platform settings',
  'admin:impersonate_users': 'Impersonate other users',
  'admin:manage_features': 'Manage feature flags',
  'admin:view_system_health': 'View system health and monitoring',
  'admin:manage_announcements': 'Manage system announcements',
  'admin:export_data': 'Export system data',
  'admin:suspend_users': 'Suspend/activate user accounts',
  'admin:delete_organizations': 'Delete organizations',
} as const

export type SystemPermission = keyof typeof SYSTEM_PERMISSIONS

// Default role templates
export const DEFAULT_ROLES: Partial<Role>[] = [
  {
    name: 'super_admin',
    display_name: 'Super Admin',
    description: 'System-wide administrative access to all platform resources',
    level: 'organization', // Super admins are still bound to organizations for RLS
    is_system: true,
    permissions: [], // All admin permissions granted by default
  },
  {
    name: 'owner',
    display_name: 'Owner',
    description: 'Full access to all organization resources',
    level: 'organization',
    is_system: true,
    permissions: [], // All permissions granted by default
  },
  {
    name: 'admin',
    display_name: 'Admin',
    description: 'Administrative access with some restrictions',
    level: 'organization',
    is_system: true,
    permissions: [], // Most permissions except org deletion
  },
  {
    name: 'member',
    display_name: 'Member',
    description: 'Standard member access',
    level: 'organization',
    is_system: true,
    permissions: [], // Basic CRUD permissions
  },
  {
    name: 'viewer',
    display_name: 'Viewer',
    description: 'Read-only access',
    level: 'organization',
    is_system: true,
    permissions: [], // Only view permissions
  },
  {
    name: 'guest',
    display_name: 'Guest',
    description: 'Limited guest access',
    level: 'organization',
    is_system: true,
    permissions: [], // Very limited permissions
  },
]

export interface PermissionCheck {
  user_id: string
  organization_id: string
  workspace_id?: string
  project_id?: string
  resource: string
  action: string
  context?: Record<string, any>
}

export interface PermissionResult {
  allowed: boolean
  reason?: string
  conditions?: PermissionCondition[]
}
