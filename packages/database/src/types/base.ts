/**
 * Base database types that are manually defined
 * Auto-generated types will extend these
 */

export type UUID = string;
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };

export interface TimestampFields {
  created_at: Date;
  updated_at: Date;
}

export interface SoftDeleteFields {
  deleted_at: Date | null;
}

export interface BaseEntity extends TimestampFields {
  id: UUID;
}

export interface BaseEntityWithSoftDelete extends BaseEntity, SoftDeleteFields {}

// Enum types
export type UserRole = 'owner' | 'admin' | 'member';
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'past_due' | 'paused';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ItemStatus = 'active' | 'archived' | 'completed' | 'cancelled';
export type ProjectType = 'general' | 'real_estate' | 'crypto' | 'ecommerce' | 'custom';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'json' | 'file';
export type ActionType = 'INSERT' | 'UPDATE' | 'DELETE' | 'ACCESS';

// Database operation types
export interface FindOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: { column: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  include?: Record<string, boolean | FindOptions>;
}

export interface CreateOptions {
  returning?: string[];
}

export interface UpdateOptions {
  where: Record<string, any>;
  returning?: string[];
}

export interface DeleteOptions {
  where: Record<string, any>;
  soft?: boolean;
}

export interface CountOptions {
  where?: Record<string, any>;
  distinct?: string[];
}

// Query result types
export interface QueryResult<T> {
  data: T[];
  count?: number;
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface SingleResult<T> {
  data: T | null;
}

export interface MutationResult<T> {
  data: T;
  affected: number;
}

// Transaction types
export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Database client interface
export interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<SingleResult<T>>;
  execute(sql: string, params?: any[]): Promise<MutationResult<any>>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}