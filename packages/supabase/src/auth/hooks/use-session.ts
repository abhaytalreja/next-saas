'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../client/browser';
import type { AuthSession } from '../types';

interface UseSessionReturn {
  session: AuthSession | null;
  loading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

/**
 * Hook to manage user session
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            setError(error);
          } else {
            setSession(session as AuthSession);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    loadSession();

    // Subscribe to session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session as AuthSession | null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setError(error);
      } else {
        setSession(session as AuthSession);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    loading,
    error,
    refreshSession,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { session } = useSession();
  return !!session;
}

/**
 * Hook to get session expiry time
 */
export function useSessionExpiry(): Date | null {
  const { session } = useSession();
  
  if (!session?.expires_at) {
    return null;
  }

  return new Date(session.expires_at * 1000);
}

/**
 * Hook to check if session is about to expire
 */
export function useIsSessionExpiring(thresholdMinutes: number = 5): boolean {
  const expiry = useSessionExpiry();
  
  if (!expiry) {
    return false;
  }

  const now = new Date();
  const timeDiff = expiry.getTime() - now.getTime();
  const minutesRemaining = timeDiff / (1000 * 60);
  
  return minutesRemaining <= thresholdMinutes;
}