import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import type { 
  OrganizationRow, 
  OrganizationInsert, 
  OrganizationUpdate, 
  MembershipInsert,
  QueryResult, 
  QueryOptions 
} from '../types/database';
import { organizationSlugSchema } from '../../auth/validation';
import { queryOptionsSchema, uuidSchema } from '../validation';
import { buildQuery } from '../helpers/query-builder';

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<QueryResult<OrganizationRow>> {
  try {
    const validatedId = uuidSchema.parse(organizationId);
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', validatedId)
      .is('deleted_at', null)
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid organization ID',
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<QueryResult<OrganizationRow>> {
  try {
    const validatedSlug = organizationSlugSchema.parse(slug);
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', validatedSlug)
      .is('deleted_at', null)
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid organization slug',
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

/**
 * Create organization with owner
 */
export async function createOrganizationWithOwner(
  supabase: SupabaseClient<Database>,
  organization: Omit<OrganizationInsert, 'created_by'>,
  userId: string
): Promise<QueryResult<OrganizationRow>> {
  try {
    const validatedUserId = uuidSchema.parse(userId);
    
    // Start a transaction
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        ...organization,
        created_by: validatedUserId,
      })
      .select()
      .single();

    if (orgError || !org) {
      return { data: null, error: orgError };
    }

    // Create owner membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: validatedUserId,
        organization_id: org.id,
        role: 'owner',
        accepted_at: new Date().toISOString(),
      });

    if (membershipError) {
      // Rollback by deleting the organization
      await supabase.from('organizations').delete().eq('id', org.id);
      return { 
        data: null, 
        error: {
          message: 'Failed to create membership',
          code: 'MEMBERSHIP_ERROR',
          details: membershipError.message,
        },
      };
    }

    return { data: org, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to create organization',
        code: 'CREATE_ERROR',
      },
    };
  }
}

/**
 * Update organization
 */
export async function updateOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  updates: OrganizationUpdate
): Promise<QueryResult<OrganizationRow>> {
  try {
    const validatedId = uuidSchema.parse(organizationId);
    
    const { data, error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedId)
      .is('deleted_at', null)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to update organization',
        code: 'UPDATE_ERROR',
      },
    };
  }
}

/**
 * Get user organizations
 */
export async function getUserOrganizations(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: QueryOptions
): Promise<QueryResult<OrganizationRow[]>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    const validatedOptions = options ? queryOptionsSchema.parse(options) : {};
    
    let query = supabase
      .from('organizations')
      .select(`
        *,
        memberships!inner(
          user_id,
          role,
          accepted_at
        )
      `, { count: 'exact' })
      .eq('memberships.user_id', validatedId)
      .not('memberships.accepted_at', 'is', null);

    // Apply soft delete filter
    query = query.is('deleted_at', null);

    // Build query with options
    query = buildQuery(query, validatedOptions);

    const { data, error, count } = await query;

    return { data, error, count: count || undefined };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to get user organizations',
        code: 'QUERY_ERROR',
      },
    };
  }
}

/**
 * Add member to organization
 */
export async function addOrganizationMember(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  userId: string,
  role: string = 'member',
  invitedBy?: string
): Promise<QueryResult<void>> {
  try {
    const validatedOrgId = uuidSchema.parse(organizationId);
    const validatedUserId = uuidSchema.parse(userId);
    
    const membership: MembershipInsert = {
      organization_id: validatedOrgId,
      user_id: validatedUserId,
      role,
      invited_at: new Date().toISOString(),
      invited_by: invitedBy,
    };

    const { error } = await supabase
      .from('memberships')
      .insert(membership);

    return { data: null, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to add member',
        code: 'INSERT_ERROR',
      },
    };
  }
}

/**
 * Remove member from organization
 */
export async function removeOrganizationMember(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  userId: string
): Promise<QueryResult<void>> {
  try {
    const validatedOrgId = uuidSchema.parse(organizationId);
    const validatedUserId = uuidSchema.parse(userId);
    
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('organization_id', validatedOrgId)
      .eq('user_id', validatedUserId);

    return { data: null, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to remove member',
        code: 'DELETE_ERROR',
      },
    };
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  userId: string,
  role: string
): Promise<QueryResult<void>> {
  try {
    const validatedOrgId = uuidSchema.parse(organizationId);
    const validatedUserId = uuidSchema.parse(userId);
    
    const { error } = await supabase
      .from('memberships')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', validatedOrgId)
      .eq('user_id', validatedUserId);

    return { data: null, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to update member role',
        code: 'UPDATE_ERROR',
      },
    };
  }
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<boolean> {
  try {
    const validatedSlug = organizationSlugSchema.parse(slug);
    
    const { count } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })
      .eq('slug', validatedSlug);

    return count === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(
  supabase: SupabaseClient<Database>,
  organizationId: string
): Promise<QueryResult<{
  memberCount: number;
  projectCount: number;
  activeProjects: number;
}>> {
  try {
    const validatedId = uuidSchema.parse(organizationId);
    
    // Get member count
    const { count: memberCount } = await supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', validatedId)
      .not('accepted_at', 'is', null);

    // Get project stats
    const { data: projects } = await supabase
      .from('projects')
      .select('is_archived')
      .eq('organization_id', validatedId)
      .is('deleted_at', null);

    const projectCount = projects?.length || 0;
    const activeProjects = projects?.filter(p => !p.is_archived).length || 0;

    return {
      data: {
        memberCount: memberCount || 0,
        projectCount,
        activeProjects,
      },
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to get organization stats',
        code: 'STATS_ERROR',
      },
    };
  }
}