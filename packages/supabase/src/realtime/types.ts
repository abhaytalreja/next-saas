import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSubscriptionOptions {
  event?: RealtimeEvent;
  schema?: string;
  table?: string;
  filter?: string;
}

export interface PresenceState {
  [key: string]: any;
}

export interface PresenceSubscriptionOptions {
  presenceKey?: string;
}

export interface RealtimeMessage<T = any> {
  event: RealtimeEvent;
  payload: {
    new: T | null;
    old: T | null;
    errors: string[] | null;
  };
  table: string;
  schema: string;
  commit_timestamp: string;
}

export type RealtimeCallback<T = any> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

export type PresenceCallback = (state: PresenceState) => void;

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => Promise<void>;
}

export interface PresenceSubscription extends RealtimeSubscription {
  track: (state: any) => Promise<void>;
  untrack: () => Promise<void>;
}

export interface BroadcastMessage {
  event: string;
  payload: any;
  type: 'broadcast';
}

export type BroadcastCallback = (message: BroadcastMessage) => void;

export interface RealtimeConfig {
  eventsPerSecond?: number;
  heartbeatInterval?: number;
}

export interface CollaborationState {
  users: Map<string, UserPresence>;
  document?: any;
  cursors?: Map<string, CursorPosition>;
  selections?: Map<string, SelectionRange>;
}

export interface UserPresence {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  color: string;
  lastSeen: Date;
  isOnline: boolean;
  metadata?: Record<string, any>;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface SelectionRange {
  userId: string;
  start: number;
  end: number;
  timestamp: number;
}