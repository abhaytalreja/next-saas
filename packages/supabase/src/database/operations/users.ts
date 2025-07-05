import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import type { UserRow, UserInsert, UserUpdate, QueryResult, QueryOptions } from '../types/database';
import { queryOptionsSchema, uuidSchema } from '../validation';
import { buildQuery } from '../helpers/query-builder';

/**
 * Get user by ID
 */
export async function getUserById(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<QueryResult<UserRow>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', validatedId)
      .is('deleted_at', null)
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid user ID',
        code: 'VALIDATION_ERROR',
      },
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<QueryResult<UserRow>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to get user',
        code: 'QUERY_ERROR',
      },
    };
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(
  supabase: SupabaseClient<Database>,
  user: UserInsert
): Promise<QueryResult<UserRow>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...user,
        email: user.email.toLowerCase(),
      })
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to create user profile',
        code: 'INSERT_ERROR',
      },
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: UserUpdate
): Promise<QueryResult<UserRow>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    
    const { data, error } = await supabase
      .from('users')
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
        message: error.message || 'Failed to update user profile',
        code: 'UPDATE_ERROR',
      },
    };
  }
}

/**
 * Update last seen timestamp
 */
export async function updateLastSeen(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<QueryResult<void>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    
    const { error } = await supabase
      .from('users')
      .update({
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', validatedId);

    return { data: null, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to update last seen',
        code: 'UPDATE_ERROR',
      },
    };
  }
}

/**
 * Verify user email
 */
export async function verifyUserEmail(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<QueryResult<UserRow>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedId)
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to verify email',
        code: 'UPDATE_ERROR',
      },
    };
  }
}

/**
 * Soft delete user
 */
export async function softDeleteUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<QueryResult<void>> {
  try {
    const validatedId = uuidSchema.parse(userId);
    
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedId);

    return { data: null, error };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Failed to delete user',
        code: 'DELETE_ERROR',
      },
    };
  }
}

/**
 * Search users
 */
export async function searchUsers(
  supabase: SupabaseClient<Database>,
  searchTerm: string,
  options?: QueryOptions
): Promise<QueryResult<UserRow[]>> {
  try {
    const validatedOptions = options ? queryOptionsSchema.parse(options) : {};
    
    let query = supabase
      .from('users')
      .select(validatedOptions.select || '*', { count: 'exact' });

    // Apply search filter
    query = query.or(`email.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);

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
        message: error.message || 'Failed to search users',
        code: 'SEARCH_ERROR',
      },
    };
  }
}

/**
 * Get users by organization
 */
export async function getUsersByOrganization(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  options?: QueryOptions
): Promise<QueryResult<UserRow[]>> {
  try {
    const validatedId = uuidSchema.parse(organizationId);
    const validatedOptions = options ? queryOptionsSchema.parse(options) : {};
    
    let query = supabase
      .from('users')
      .select(`
        *,
        memberships!inner(
          organization_id,
          role,
          accepted_at
        )
      `, { count: 'exact' })
      .eq('memberships.organization_id', validatedId)
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
        message: error.message || 'Failed to get organization users',
        code: 'QUERY_ERROR',
      },
    };
  }
}