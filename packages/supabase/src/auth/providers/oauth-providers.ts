import type { SupabaseClient } from '@supabase/supabase-js';
import { oauthProviderSchema } from '../validation';
import type { AuthResponse, OAuthProvider } from '../types';
import type { Database } from '../../types/supabase';

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  supabase: SupabaseClient<Database>,
  provider: OAuthProvider
): Promise<AuthResponse<void>> {
  try {
    // Validate provider
    const validatedData = oauthProviderSchema.parse(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: validatedData.provider,
      options: {
        redirectTo: validatedData.redirectTo || `${window.location.origin}/auth/callback`,
        scopes: validatedData.scopes,
        queryParams: validatedData.queryParams,
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
        message: error.message || 'OAuth sign in failed',
        status: 400,
      },
    };
  }
}

/**
 * OAuth provider configurations
 */
export const oauthProviders = {
  google: {
    name: 'Google',
    icon: 'google',
    scopes: 'email profile',
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    scopes: 'read:user user:email',
  },
  gitlab: {
    name: 'GitLab',
    icon: 'gitlab',
    scopes: 'read_user',
  },
  bitbucket: {
    name: 'Bitbucket',
    icon: 'bitbucket',
    scopes: 'account email',
  },
  azure: {
    name: 'Microsoft',
    icon: 'microsoft',
    scopes: 'openid profile email',
  },
  discord: {
    name: 'Discord',
    icon: 'discord',
    scopes: 'identify email',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    scopes: 'email public_profile',
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    scopes: 'users.read tweet.read',
  },
} as const;

/**
 * Get OAuth provider configuration
 */
export function getOAuthProviderConfig(provider: OAuthProvider['provider']) {
  return oauthProviders[provider];
}

/**
 * Check if OAuth provider is enabled
 */
export function isOAuthProviderEnabled(provider: OAuthProvider['provider']): boolean {
  // Check environment variables for provider configuration
  const envKey = `NEXT_PUBLIC_SUPABASE_OAUTH_${provider.toUpperCase()}_ENABLED`;
  return process.env[envKey] === 'true';
}

/**
 * Get enabled OAuth providers
 */
export function getEnabledOAuthProviders(): OAuthProvider['provider'][] {
  return Object.keys(oauthProviders).filter((provider) =>
    isOAuthProviderEnabled(provider as OAuthProvider['provider'])
  ) as OAuthProvider['provider'][];
}