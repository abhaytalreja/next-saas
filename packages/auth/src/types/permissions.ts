// Permission and role-based access control types

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  conditions?: PermissionCondition[];
  scope: PermissionScope;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'invite' | 'approve';
export type PermissionScope = 'global' | 'organization' | 'project' | 'personal';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  organizationId?: string;
  isSystem: boolean;
  isDefault: boolean;
  level: number; // Higher number = more permissions
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  conditions?: PermissionCondition[];
  grantedAt: Date;
  grantedBy: string;
}

export interface UserPermission {
  userId: string;
  permissionId: string;
  resourceId?: string;
  conditions?: PermissionCondition[];
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface PermissionCheck {
  resource: string;
  action: PermissionAction;
  resourceId?: string;
  context?: Record<string, any>;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
}

// System roles
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_ADMIN: 'organization_admin',
  ORGANIZATION_MEMBER: 'organization_member',
  ORGANIZATION_VIEWER: 'organization_viewer',
  ORGANIZATION_BILLING: 'organization_billing'
} as const;

// System permissions
export const SYSTEM_PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Organization management
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_READ: 'organization:read',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  ORGANIZATION_MANAGE_MEMBERS: 'organization:manage_members',
  ORGANIZATION_MANAGE_BILLING: 'organization:manage_billing',
  ORGANIZATION_MANAGE_SETTINGS: 'organization:manage_settings',
  
  // Project management
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE: 'project:manage',
  
  // System administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_VIEW_LOGS: 'system:view_logs',
  SYSTEM_MANAGE_USERS: 'system:manage_users',
  SYSTEM_MANAGE_ORGANIZATIONS: 'system:manage_organizations'
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];
export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

// Permission context for evaluation
export interface PermissionContext {
  user: {
    id: string;
    organizationId?: string;
    roles: string[];
  };
  organization?: {
    id: string;
    ownerId: string;
  };
  resource?: {
    id: string;
    ownerId?: string;
    organizationId?: string;
  };
}