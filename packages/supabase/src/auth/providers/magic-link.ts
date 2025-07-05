import type { SupabaseClient } from '@supabase/supabase-js';
import { magicLinkSchema } from '../validation';
import type { AuthResponse, MagicLinkCredentials } from '../types';
import type { Database } from '../../types/supabase';

/**
 * Sign in with magic link
 */
export async function signInWithMagicLink(
  supabase: SupabaseClient<Database>,
  credentials: MagicLinkCredentials
): Promise<AuthResponse<void>> {
  try {
    // Validate email
    const validatedData = magicLinkSchema.parse(credentials);

    const { error } = await supabase.auth.signInWithOtp({
      email: validatedData.email,
      options: {
        emailRedirectTo: validatedData.redirectTo || `${window.location.origin}/auth/callback`,
      },
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
        message: error.message || 'Invalid email',
        status: 400,
      },
    };
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLinkToken(
  supabase: SupabaseClient<Database>,
  token: string,
  type: 'magiclink' | 'recovery' | 'invite' = 'magiclink'
): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type,
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
        message: error.message || 'Invalid token',
        status: 400,
      },
    };
  }
}

/**
 * Resend magic link email
 */
export async function resendMagicLink(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<AuthResponse<void>> {
  try {
    // Validate email
    const validatedEmail = magicLinkSchema.parse({ email }).email;

    const { error } = await supabase.auth.resend({
      type: 'magiclink',
      email: validatedEmail,
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
        message: error.message || 'Invalid email',
        status: 400,
      },
    };
  }
}