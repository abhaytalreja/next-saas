/**
 * Supabase implementation of the database provider
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type {
  DatabaseConfig,
  DatabaseProvider,
  RealtimeProvider,
  RealtimePayload,
  Subscription,
  SubscriptionOptions
} from '../interfaces/database-provider';
import type {
  DatabaseClient,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  QueryResult,
  SingleResult,
  MutationResult,
  Transaction
} from '../../types/base';

export class SupabaseProvider implements RealtimeProvider {
  name = 'supabase';
  config: DatabaseConfig;
  client: DatabaseClient;
  private supabase: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(config: DatabaseConfig) {
    this.config = config;
    
    if (!config.connectionString) {
      throw new Error('Supabase connection string is required');
    }

    const [url, anonKey] = config.connectionString.split('::');
    this.supabase = createClient(url, anonKey);
    
    // Create database client wrapper
    this.client = {
      query: this.query.bind(this),
      queryOne: this.queryOne.bind(this),
      execute: this.execute.bind(this),
      transaction: this.transaction.bind(this)
    };
  }

  async connect(): Promise<void> {
    // Supabase client connects automatically
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // Unsubscribe from all channels
    this.unsubscribeAll();
    return Promise.resolve();
  }

  isConnected(): boolean {
    // Supabase maintains persistent connection
    return true;
  }

  // Query building
  async find<T>(table: string, options: FindOptions = {}): Promise<QueryResult<T>> {
    let query = this.supabase.from(table).select(options.select?.join(',') || '*');

    // Apply filters
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(({ column, direction }) => {
        query = query.order(column, { ascending: direction === 'asc' });
      });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as T[],
      count
    };
  }

  async findOne<T>(table: string, options: FindOptions = {}): Promise<SingleResult<T>> {
    const result = await this.find<T>(table, { ...options, limit: 1 });
    return {
      data: result.data[0] || null
    };
  }

  async count(table: string, options: FindOptions = {}): Promise<number> {
    let query = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (value === null) {
          query = query.is(key, null);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  }

  // Mutations
  async create<T>(table: string, data: Partial<T>, options: CreateOptions = {}): Promise<MutationResult<T>> {
    const query = this.supabase
      .from(table)
      .insert(data)
      .select(options.returning?.join(',') || '*');

    const { data: result, error } = await query;

    if (error) throw error;

    return {
      data: result[0] as T,
      affected: 1
    };
  }

  async update<T>(table: string, data: Partial<T>, options: UpdateOptions): Promise<MutationResult<T>> {
    let query = this.supabase
      .from(table)
      .update(data);

    // Apply where clause
    Object.entries(options.where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    if (options.returning) {
      query = query.select(options.returning.join(','));
    }

    const { data: result, error } = await query;

    if (error) throw error;

    return {
      data: result?.[0] as T,
      affected: result?.length || 0
    };
  }

  async delete(table: string, options: DeleteOptions): Promise<MutationResult<any>> {
    if (options.soft) {
      // Soft delete by updating deleted_at
      return this.update(table, { deleted_at: new Date() } as any, {
        where: options.where
      });
    }

    let query = this.supabase.from(table).delete();

    // Apply where clause
    Object.entries(options.where).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;

    if (error) throw error;

    return {
      data: null,
      affected: data?.length || 0
    };
  }

  // Raw queries
  async raw<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const { data, error } = await this.supabase.rpc('exec_sql', {
      query: sql,
      params: params || []
    });

    if (error) throw error;

    return {
      data: data as T[]
    };
  }

  // Utilities
  async exists(table: string, where: Record<string, any>): Promise<boolean> {
    const count = await this.count(table, { where });
    return count > 0;
  }

  async truncate(table: string): Promise<void> {
    await this.raw(`TRUNCATE TABLE ${table} CASCADE`);
  }

  // DatabaseClient implementation
  private async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    return this.raw<T>(sql, params);
  }

  private async queryOne<T>(sql: string, params?: any[]): Promise<SingleResult<T>> {
    const result = await this.raw<T>(sql, params);
    return {
      data: result.data[0] || null
    };
  }

  private async execute(sql: string, params?: any[]): Promise<MutationResult<any>> {
    const result = await this.raw(sql, params);
    return {
      data: result.data[0],
      affected: result.data.length
    };
  }

  private async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    // Supabase doesn't support client-side transactions
    // This is a limitation we'll document
    throw new Error('Client-side transactions are not supported in Supabase. Use database functions instead.');
  }

  // Realtime implementation
  subscribe<T>(
    table: string,
    callback: (payload: RealtimePayload<T>) => void,
    options: SubscriptionOptions = {}
  ): Subscription {
    const channelName = `${table}_${Date.now()}`;
    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table,
          filter: options.filter
        },
        (payload) => {
          const realtimePayload: RealtimePayload<T> = {
            type: payload.eventType as any,
            table: payload.table,
            record: payload.new as T,
            old_record: payload.old as T,
            timestamp: new Date(payload.commit_timestamp)
          };
          callback(realtimePayload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      id: channelName,
      table,
      unsubscribe: () => this.unsubscribe({ id: channelName, table, unsubscribe: () => {} })
    };
  }

  unsubscribe(subscription: Subscription): void {
    const channel = this.channels.get(subscription.id);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(subscription.id);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}