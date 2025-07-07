import { createClient } from '@supabase/supabase-js';
import type { 
  Permission, 
  PermissionCheck, 
  PermissionResult,
  PermissionCondition,
  Role,
  SystemPermission
} from '../../types';

export class PermissionEngine {
  private supabase: any;
  private cache: Map<string, { permissions: string[], timestamp: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(check: PermissionCheck): Promise<PermissionResult> {
    try {
      // Get user's effective permissions
      const permissions = await this.getUserPermissions(
        check.user_id,
        check.organization_id
      );

      // Owner has all permissions
      if (permissions.includes('*')) {
        return { allowed: true };
      }

      // Check exact permission
      if (permissions.includes(check.action) || 
          permissions.includes(`${check.resource}:${check.action}`) ||
          permissions.includes(`${check.resource}:*`)) {
        return { allowed: true };
      }

      // Check wildcard patterns
      const allowed = this.checkWildcardPermissions(
        permissions,
        check.resource,
        check.action
      );

      if (allowed) {
        return { allowed: true };
      }

      // Check conditional permissions
      if (check.context) {
        const conditionalResult = await this.checkConditionalPermissions(
          check.user_id,
          check.organization_id,
          check.resource,
          check.action,
          check.context
        );

        if (conditionalResult.allowed) {
          return conditionalResult;
        }
      }

      return { 
        allowed: false, 
        reason: `Missing permission: ${check.resource}:${check.action}` 
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return { 
        allowed: false, 
        reason: 'Permission check failed' 
      };
    }
  }

  /**
   * Get all effective permissions for a user in an organization
   */
  async getUserPermissions(
    userId: string,
    organizationId: string
  ): Promise<string[]> {
    const cacheKey = `${userId}:${organizationId}`;
    const cached = this.cache.get(cacheKey);

    // Return cached permissions if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.permissions;
    }

    try {
      // Call database function to get permissions
      const { data, error } = await this.supabase.rpc('get_user_permissions', {
        p_user_id: userId,
        p_organization_id: organizationId
      });

      if (error) throw error;

      const permissions = data || [];

      // Cache the result
      this.cache.set(cacheKey, {
        permissions,
        timestamp: Date.now()
      });

      return permissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    organizationId: string,
    permissions: string[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, organizationId);
    
    if (userPermissions.includes('*')) return true;

    return permissions.some(permission => 
      userPermissions.includes(permission) ||
      this.checkWildcardPermissions(userPermissions, permission.split(':')[0], permission.split(':')[1])
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    organizationId: string,
    permissions: string[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, organizationId);
    
    if (userPermissions.includes('*')) return true;

    return permissions.every(permission => 
      userPermissions.includes(permission) ||
      this.checkWildcardPermissions(userPermissions, permission.split(':')[0], permission.split(':')[1])
    );
  }

  /**
   * Check wildcard permissions (e.g., workspace:* matches workspace:create)
   */
  private checkWildcardPermissions(
    userPermissions: string[],
    resource: string,
    action: string
  ): boolean {
    return userPermissions.some(permission => {
      const [permResource, permAction] = permission.split(':');
      
      // Check resource wildcard
      if (permResource === resource && permAction === '*') {
        return true;
      }

      // Check full wildcard patterns
      if (permission.includes('*')) {
        const pattern = permission.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(`${resource}:${action}`);
      }

      return false;
    });
  }

  /**
   * Check conditional permissions based on context
   */
  private async checkConditionalPermissions(
    userId: string,
    organizationId: string,
    resource: string,
    action: string,
    context: Record<string, any>
  ): Promise<PermissionResult> {
    try {
      // Get conditional permissions from database
      const { data: conditions, error } = await this.supabase
        .from('member_permissions')
        .select('conditions')
        .eq('membership_id', userId) // This would need proper join
        .eq('permission', `${resource}:${action}`)
        .single();

      if (error || !conditions?.conditions) {
        return { allowed: false };
      }

      // Evaluate conditions
      const passed = this.evaluateConditions(
        conditions.conditions as PermissionCondition[],
        context
      );

      return {
        allowed: passed,
        conditions: conditions.conditions
      };
    } catch (error) {
      console.error('Error checking conditional permissions:', error);
      return { allowed: false };
    }
  }

  /**
   * Evaluate permission conditions against context
   */
  private evaluateConditions(
    conditions: PermissionCondition[],
    context: Record<string, any>
  ): boolean {
    let result = true;
    let currentLogic: 'and' | 'or' = 'and';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, context);

      if (currentLogic === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogic = condition.logic || 'and';
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: PermissionCondition,
    context: Record<string, any>
  ): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'neq':
        return fieldValue !== condition.value;
      case 'gt':
        return fieldValue > condition.value;
      case 'gte':
        return fieldValue >= condition.value;
      case 'lt':
        return fieldValue < condition.value;
      case 'lte':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'contains':
        return typeof fieldValue === 'string' && 
               fieldValue.includes(condition.value);
      default:
        return false;
    }
  }

  /**
   * Get nested field value from context
   */
  private getFieldValue(field: string, context: Record<string, any>): any {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Clear permission cache for a user
   */
  clearUserCache(userId: string, organizationId?: string): void {
    if (organizationId) {
      this.cache.delete(`${userId}:${organizationId}`);
    } else {
      // Clear all entries for the user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear entire permission cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get role-based permissions
   */
  async getRolePermissions(role: string): Promise<string[]> {
    const rolePermissions: Record<string, string[]> = {
      owner: ['*'],
      admin: [
        'organization:view',
        'organization:update',
        'organization:manage_members',
        'organization:manage_billing',
        'organization:view_audit_logs',
        'workspace:*',
        'project:*',
        'item:*',
        'api:*'
      ],
      member: [
        'organization:view',
        'workspace:view',
        'workspace:create',
        'project:*',
        'item:*',
        'api:access'
      ],
      viewer: [
        'organization:view',
        'workspace:view',
        'project:view',
        'item:view'
      ],
      guest: [
        'organization:view',
        'workspace:view',
        'project:view',
        'item:view'
      ]
    };

    return rolePermissions[role] || [];
  }
}