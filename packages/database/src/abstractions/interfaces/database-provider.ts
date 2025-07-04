/**
 * Database provider interface for abstraction
 */

import type { 
  DatabaseClient, 
  FindOptions, 
  CreateOptions, 
  UpdateOptions, 
  DeleteOptions,
  QueryResult,
  SingleResult,
  MutationResult
} from '../../types/base';

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  poolSize?: number;
  connectionTimeout?: number;
}

export interface DatabaseProvider {
  name: string;
  config: DatabaseConfig;
  client: DatabaseClient;
  
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Query building
  find<T>(table: string, options?: FindOptions): Promise<QueryResult<T>>;
  findOne<T>(table: string, options?: FindOptions): Promise<SingleResult<T>>;
  count(table: string, options?: FindOptions): Promise<number>;
  
  // Mutations
  create<T>(table: string, data: Partial<T>, options?: CreateOptions): Promise<MutationResult<T>>;
  update<T>(table: string, data: Partial<T>, options?: UpdateOptions): Promise<MutationResult<T>>;
  delete(table: string, options?: DeleteOptions): Promise<MutationResult<any>>;
  
  // Raw queries
  raw<T = any>(query: string, params?: any[]): Promise<QueryResult<T>>;
  
  // Utilities
  exists(table: string, where: Record<string, any>): Promise<boolean>;
  truncate(table: string): Promise<void>;
}

export interface RealtimeProvider extends DatabaseProvider {
  // Realtime subscriptions
  subscribe<T>(
    table: string,
    callback: (payload: RealtimePayload<T>) => void,
    options?: SubscriptionOptions
  ): Subscription;
  
  unsubscribe(subscription: Subscription): void;
  unsubscribeAll(): void;
}

export interface RealtimePayload<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: T;
  old_record?: T;
  timestamp: Date;
}

export interface SubscriptionOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
}

export interface Subscription {
  id: string;
  table: string;
  unsubscribe(): void;
}