import type { SupabaseClient } from '@supabase/supabase-js';
import { signInSchema, signUpSchema, resetPasswordSchema, updatePasswordSchema } from '../validation';
import type { AuthResponse, SignInCredentials, SignUpCredentials, ResetPasswordCredentials, UpdatePasswordCredentials, AuthSession } from '../types';
import type { Database } from '../../types/supabase';
import { createOrganizationWithOwner } from '../../database/operations/organizations';
import { createUserProfile } from '../../database/operations/users';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  supabase: SupabaseClient<Database>,
  credentials: SignInCredentials
): Promise<AuthResponse<AuthSession>> {
  try {
    // Validate credentials
    const validatedData = signInSchema.parse(credentials);

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    if (!data.session) {
      return {
        data: null,
        error: {
          message: 'No session created',
          status: 401,
        },
      };
    }

    // Load user profile and organizations
    const enhancedSession = await enhanceSession(supabase, data.session);

    return {
      data: enhancedSession,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid credentials',
        status: 400,
      },
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  supabase: SupabaseClient<Database>,
  credentials: SignUpCredentials
): Promise<AuthResponse<AuthSession>> {
  try {
    // Validate credentials
    const validatedData = signUpSchema.parse(credentials);

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    });

    if (authError) {
      return {
        data: null,
        error: {
          message: authError.message,
          status: authError.status,
          code: authError.code,
        },
      };
    }

    if (!authData.user) {
      return {
        data: null,
        error: {
          message: 'User creation failed',
          status: 400,
        },
      };
    }

    // Create user profile
    const { error: profileError } = await createUserProfile(supabase, {
      id: authData.user.id,
      email: authData.user.email!,
      name: validatedData.name,
      metadata: authData.user.user_metadata,
    });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
    }

    // Create organization if requested
    if (validatedData.organizationName) {
      const { error: orgError } = await createOrganizationWithOwner(
        supabase,
        {
          name: validatedData.organizationName,
          slug: validatedData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
        authData.user.id
      );

      if (orgError) {
        console.error('Failed to create organization:', orgError);
      }
    }

    // Return session if available (user might need to verify email first)
    if (authData.session) {
      const enhancedSession = await enhanceSession(supabase, authData.session);
      return {
        data: enhancedSession,
        error: null,
      };
    }

    return {
      data: null,
      error: null, // Success but no session (email verification required)
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Sign up failed',
        status: 400,
      },
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  supabase: SupabaseClient<Database>,
  credentials: ResetPasswordCredentials
): Promise<AuthResponse<void>> {
  try {
    // Validate email
    const validatedData = resetPasswordSchema.parse(credentials);

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: validatedData.redirectTo || `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid email',
        status: 400,
      },
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  supabase: SupabaseClient<Database>,
  credentials: UpdatePasswordCredentials
): Promise<AuthResponse<void>> {
  try {
    // Validate password
    const validatedData = updatePasswordSchema.parse(credentials);

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
        },
      };
    }

    return {
      data: null,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error.message || 'Invalid password',
        status: 400,
      },
    };
  }
}

/**
 * Enhance session with user profile and organization data
 */
async function enhanceSession(
  supabase: SupabaseClient<Database>,
  session: any
): Promise<AuthSession> {
  // Load user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Load user organizations
  const { data: memberships } = await supabase
    .from('memberships')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', session.user.id)
    .not('accepted_at', 'is', null);

  const organizations = memberships?.map(m => m.organization).filter(Boolean) || [];
  const currentOrganization = organizations[0]; // Default to first org
  const membership = memberships?.find(m => m.organization_id === currentOrganization?.id);

  return {
    ...session,
    user: {
      ...session.user,
      profile,
      organizations,
      currentOrganization,
      membership,
    },
  };
}