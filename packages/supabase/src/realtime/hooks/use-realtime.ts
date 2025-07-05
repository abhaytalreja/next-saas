'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '../../client/browser';
import { SubscriptionManager } from '../subscription-manager';
import type {
  RealtimeSubscriptionOptions,
  RealtimeCallback,
  RealtimeSubscription,
} from '../types';

/**
 * Hook to subscribe to real-time database changes
 */
export function useRealtimeSubscription<T = any>(
  table: string,
  callback: RealtimeCallback<T>,
  options: RealtimeSubscriptionOptions = {},
  deps: any[] = []
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const managerRef = useRef<SubscriptionManager | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    if (!managerRef.current) {
      managerRef.current = new SubscriptionManager(supabase);
    }

    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Create new subscription
    subscriptionRef.current = managerRef.current.subscribeToTable(
      table,
      callback,
      options
    );

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [table, ...deps]);
}

/**
 * Hook to subscribe to multiple tables
 */
export function useMultipleRealtimeSubscriptions(
  subscriptions: Array<{
    table: string;
    callback: RealtimeCallback;
    options?: RealtimeSubscriptionOptions;
  }>,
  deps: any[] = []
) {
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);
  const managerRef = useRef<SubscriptionManager | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    if (!managerRef.current) {
      managerRef.current = new SubscriptionManager(supabase);
    }

    // Unsubscribe from all previous subscriptions
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];

    // Create new subscriptions
    subscriptions.forEach(({ table, callback, options }) => {
      const subscription = managerRef.current!.subscribeToTable(
        table,
        callback,
        options || {}
      );
      subscriptionsRef.current.push(subscription);
    });

    // Cleanup
    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    };
  }, deps);
}