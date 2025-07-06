'use client';

import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './auth-client';

export interface SessionManagerConfig {
  refreshThreshold?: number; // Minutes before expiry to refresh
  maxRetries?: number;
  retryDelay?: number; // Milliseconds
}

export class SessionManager {
  private client: SupabaseClient;
  private refreshTimer: NodeJS.Timeout | null = null;
  private config: Required<SessionManagerConfig>;
  private listeners: Set<(session: Session | null) => void> = new Set();
  private retryCount = 0;

  constructor(config: SessionManagerConfig = {}) {
    this.client = getSupabaseBrowserClient();
    this.config = {
      refreshThreshold: config.refreshThreshold ?? 5, // 5 minutes before expiry
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000
    };

    this.initialize();
  }

  private async initialize() {
    // Set up auth state listener
    this.client.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session);
    });

    // Check for existing session
    const { data: { session } } = await this.client.auth.getSession();
    if (session) {
      this.setupTokenRefresh(session);
    }
  }

  private handleAuthStateChange(event: string, session: Session | null) {
    console.log('Auth state changed:', event, session?.user?.id);

    // Clear existing timer
    this.clearRefreshTimer();

    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
        if (session) {
          this.setupTokenRefresh(session);
          this.retryCount = 0; // Reset retry count on successful refresh
        }
        break;
      case 'SIGNED_OUT':
        this.cleanup();
        break;
    }

    // Notify listeners
    this.notifyListeners(session);
  }

  private setupTokenRefresh(session: Session) {
    const expiresAt = session.expires_at;
    if (!expiresAt) return;

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = expiresAt - now;
    const refreshIn = Math.max(0, expiresIn - (this.config.refreshThreshold * 60));

    console.log(`Setting up token refresh in ${refreshIn} seconds`);

    this.refreshTimer = setTimeout(() => {
      this.refreshSession();
    }, refreshIn * 1000);
  }

  private async refreshSession() {
    try {
      console.log('Refreshing session...');
      
      const { data: { session }, error } = await this.client.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        await this.handleRefreshError();
        return;
      }

      if (session) {
        console.log('Session refreshed successfully');
        this.setupTokenRefresh(session);
        this.retryCount = 0;
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await this.handleRefreshError();
    }
  }

  private async handleRefreshError() {
    this.retryCount++;

    if (this.retryCount < this.config.maxRetries) {
      console.log(`Retrying session refresh (${this.retryCount}/${this.config.maxRetries})`);
      
      setTimeout(() => {
        this.refreshSession();
      }, this.config.retryDelay * this.retryCount);
    } else {
      console.error('Max refresh retries exceeded, signing out user');
      await this.client.auth.signOut();
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private cleanup() {
    this.clearRefreshTimer();
    this.retryCount = 0;
  }

  private notifyListeners(session: Session | null) {
    this.listeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  public addListener(listener: (session: Session | null) => void) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await this.client.auth.getSession();
    return session;
  }

  public async forceRefresh(): Promise<Session | null> {
    const { data: { session }, error } = await this.client.auth.refreshSession();
    
    if (error) {
      console.error('Force refresh failed:', error);
      throw error;
    }

    return session;
  }

  public destroy() {
    this.cleanup();
    this.listeners.clear();
  }
}

// Global session manager instance
let sessionManager: SessionManager | null = null;

export function getSessionManager(config?: SessionManagerConfig): SessionManager {
  if (!sessionManager) {
    sessionManager = new SessionManager(config);
  }
  return sessionManager;
}

export function destroySessionManager() {
  if (sessionManager) {
    sessionManager.destroy();
    sessionManager = null;
  }
}