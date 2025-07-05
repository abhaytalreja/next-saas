'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../client/browser';
import { signInWithEmail, signUpWithEmail, sendPasswordResetEmail, updatePassword } from '../providers/email-auth';
import { signInWithOAuth } from '../providers/oauth-providers';
import { signInWithMagicLink } from '../providers/magic-link';
import { signInWithPhone } from '../providers/phone-auth';
import type { 
  AuthUser, 
  AuthSession, 
  SignInCredentials, 
  SignUpCredentials, 
  OAuthProvider, 
  MagicLinkCredentials, 
  PhoneCredentials,
  ResetPasswordCredentials,
  UpdatePasswordCredentials,
  AuthResponse,
  AuthError
} from '../types';

interface UseAuthReturn {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse<AuthSession>>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse<AuthSession>>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResponse<void>>;
  signInWithMagicLink: (credentials: MagicLinkCredentials) => Promise<AuthResponse<void>>;
  signInWithPhone: (credentials: PhoneCredentials) => Promise<AuthResponse<AuthSession>>;
  signOut: () => Promise<AuthResponse<void>>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<AuthResponse<void>>;
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<AuthResponse<void>>;
  refreshSession: () => Promise<AuthResponse<AuthSession>>;
}

/**
 * Hook for authentication operations
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session as AuthSession);
          setUser(session.user as AuthUser);
        }
      } catch (error: any) {
        console.error('Failed to load session:', error);
        setError({ message: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session as AuthSession | null);
        setUser(session?.user as AuthUser | null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignIn = useCallback(async (credentials: SignInCredentials) => {
    setError(null);
    const result = await signInWithEmail(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleSignUp = useCallback(async (credentials: SignUpCredentials) => {
    setError(null);
    const result = await signUpWithEmail(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleSignInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setError(null);
    const result = await signInWithOAuth(supabase, provider);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleSignInWithMagicLink = useCallback(async (credentials: MagicLinkCredentials) => {
    setError(null);
    const result = await signInWithMagicLink(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleSignInWithPhone = useCallback(async (credentials: PhoneCredentials) => {
    setError(null);
    const result = await signInWithPhone(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleSignOut = useCallback(async (): Promise<AuthResponse<void>> => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      const authError = { message: error.message };
      setError(authError);
      return { data: null, error: authError };
    }

    return { data: null, error: null };
  }, [supabase]);

  const handleResetPassword = useCallback(async (credentials: ResetPasswordCredentials) => {
    setError(null);
    const result = await sendPasswordResetEmail(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleUpdatePassword = useCallback(async (credentials: UpdatePasswordCredentials) => {
    setError(null);
    const result = await updatePassword(supabase, credentials);
    if (result.error) {
      setError(result.error);
    }
    return result;
  }, [supabase]);

  const handleRefreshSession = useCallback(async (): Promise<AuthResponse<AuthSession>> => {
    setError(null);
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      const authError = { message: error.message };
      setError(authError);
      return { data: null, error: authError };
    }

    return { data: session as AuthSession, error: null };
  }, [supabase]);

  return {
    user,
    session,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithOAuth: handleSignInWithOAuth,
    signInWithMagicLink: handleSignInWithMagicLink,
    signInWithPhone: handleSignInWithPhone,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    refreshSession: handleRefreshSession,
  };
}