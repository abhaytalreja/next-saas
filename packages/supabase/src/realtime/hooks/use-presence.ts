'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../../client/browser';
import { SubscriptionManager } from '../subscription-manager';
import type { PresenceState, PresenceSubscription, UserPresence } from '../types';

interface UsePresenceOptions {
  channelName: string;
  userInfo: Omit<UserPresence, 'lastSeen' | 'isOnline'>;
}

interface UsePresenceReturn {
  presenceState: PresenceState;
  onlineUsers: UserPresence[];
  track: (state: any) => Promise<void>;
  untrack: () => Promise<void>;
  updatePresence: (updates: Partial<UserPresence>) => Promise<void>;
}

/**
 * Hook for managing user presence
 */
export function usePresence({
  channelName,
  userInfo,
}: UsePresenceOptions): UsePresenceReturn {
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const subscriptionRef = useRef<PresenceSubscription | null>(null);
  const managerRef = useRef<SubscriptionManager | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    if (!managerRef.current) {
      managerRef.current = new SubscriptionManager(supabase);
    }

    // Create presence subscription
    subscriptionRef.current = managerRef.current.subscribeToPresence(
      channelName,
      {
        onSync: (state) => {
          setPresenceState(state);
          updateOnlineUsers(state);
        },
        onJoin: (state) => {
          setPresenceState(prev => ({ ...prev, ...state }));
          updateOnlineUsers({ ...presenceState, ...state });
        },
        onLeave: (state) => {
          const newState = { ...presenceState };
          Object.keys(state).forEach(key => {
            delete newState[key];
          });
          setPresenceState(newState);
          updateOnlineUsers(newState);
        },
      }
    );

    // Track initial presence
    const initialPresence: UserPresence = {
      ...userInfo,
      lastSeen: new Date(),
      isOnline: true,
    };
    subscriptionRef.current.track(initialPresence);

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.untrack();
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [channelName, userInfo.id]);

  const updateOnlineUsers = (state: PresenceState) => {
    const users: UserPresence[] = [];
    Object.values(state).forEach((presences: any[]) => {
      presences.forEach(presence => {
        users.push(presence);
      });
    });
    setOnlineUsers(users);
  };

  const track = useCallback(async (state: any) => {
    if (subscriptionRef.current) {
      await subscriptionRef.current.track(state);
    }
  }, []);

  const untrack = useCallback(async () => {
    if (subscriptionRef.current) {
      await subscriptionRef.current.untrack();
    }
  }, []);

  const updatePresence = useCallback(async (updates: Partial<UserPresence>) => {
    if (subscriptionRef.current) {
      const currentPresence: UserPresence = {
        ...userInfo,
        ...updates,
        lastSeen: new Date(),
        isOnline: true,
      };
      await subscriptionRef.current.track(currentPresence);
    }
  }, [userInfo]);

  return {
    presenceState,
    onlineUsers,
    track,
    untrack,
    updatePresence,
  };
}

/**
 * Hook to track cursor position for collaborative editing
 */
export function useCursorPresence(
  channelName: string,
  userId: string
) {
  const managerRef = useRef<SubscriptionManager | null>(null);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    if (!managerRef.current) {
      managerRef.current = new SubscriptionManager(supabase);
    }

    const subscription = managerRef.current.subscribeToBroadcast(
      channelName,
      'cursor',
      (message) => {
        const { userId: senderId, x, y } = message.payload;
        if (senderId !== userId) {
          setCursors(prev => new Map(prev).set(senderId, { x, y }));
        }
      }
    );

    // Remove cursor when user leaves
    const presenceSubscription = managerRef.current.subscribeToPresence(
      channelName,
      {
        onLeave: (state) => {
          Object.keys(state).forEach(key => {
            setCursors(prev => {
              const newCursors = new Map(prev);
              newCursors.delete(key);
              return newCursors;
            });
          });
        },
      }
    );

    return () => {
      subscription.unsubscribe();
      presenceSubscription.unsubscribe();
    };
  }, [channelName, userId]);

  const updateCursor = useCallback(
    async (x: number, y: number) => {
      if (managerRef.current) {
        await managerRef.current.broadcast(channelName, 'cursor', {
          userId,
          x,
          y,
          timestamp: Date.now(),
        });
      }
    },
    [channelName, userId]
  );

  return {
    cursors,
    updateCursor,
  };
}