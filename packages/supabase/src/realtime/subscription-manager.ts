import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import type {
  RealtimeSubscriptionOptions,
  RealtimeCallback,
  RealtimeSubscription,
  PresenceCallback,
  PresenceSubscription,
  BroadcastCallback,
} from './types';

export class SubscriptionManager {
  private supabase: SupabaseClient<Database>;
  private channels: Map<string, RealtimeChannel>;
  private subscriptions: Map<string, RealtimeSubscription>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
    this.channels = new Map();
    this.subscriptions = new Map();
  }

  /**
   * Subscribe to database changes
   */
  subscribeToTable<T = any>(
    table: string,
    callback: RealtimeCallback<T>,
    options: RealtimeSubscriptionOptions = {}
  ): RealtimeSubscription {
    const channelName = `db-${table}-${Date.now()}`;
    
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table,
          filter: options.filter,
        },
        callback
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: async () => {
        await channel.unsubscribe();
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      },
    };

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  /**
   * Subscribe to presence updates
   */
  subscribeToPresence(
    channelName: string,
    callbacks: {
      onSync?: PresenceCallback;
      onJoin?: PresenceCallback;
      onLeave?: PresenceCallback;
    }
  ): PresenceSubscription {
    const channel = this.supabase.channel(channelName);

    if (callbacks.onSync) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        callbacks.onSync!(state);
      });
    }

    if (callbacks.onJoin) {
      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        callbacks.onJoin!({ [key]: newPresences });
      });
    }

    if (callbacks.onLeave) {
      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        callbacks.onLeave!({ [key]: leftPresences });
      });
    }

    channel.subscribe();

    const subscription: PresenceSubscription = {
      channel,
      track: async (state: any) => {
        await channel.track(state);
      },
      untrack: async () => {
        await channel.untrack();
      },
      unsubscribe: async () => {
        await channel.unsubscribe();
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      },
    };

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  /**
   * Subscribe to broadcast messages
   */
  subscribeToBroadcast(
    channelName: string,
    event: string,
    callback: BroadcastCallback
  ): RealtimeSubscription {
    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event }, callback)
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: async () => {
        await channel.unsubscribe();
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      },
    };

    this.channels.set(channelName, channel);
    this.subscriptions.set(channelName, subscription);

    return subscription;
  }

  /**
   * Send a broadcast message
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<void> {
    const channel = this.channels.get(channelName) || 
      this.supabase.channel(channelName);

    await channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    const promises = Array.from(this.subscriptions.values()).map(
      (subscription) => subscription.unsubscribe()
    );
    await Promise.all(promises);
  }

  /**
   * Get active channel by name
   */
  getChannel(channelName: string): RealtimeChannel | undefined {
    return this.channels.get(channelName);
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if a channel is active
   */
  isChannelActive(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}