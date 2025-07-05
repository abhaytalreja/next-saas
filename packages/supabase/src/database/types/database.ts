import type { Database } from '../../types/supabase';

// Table types
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

// Row types for each table
export type UserRow = Tables['users']['Row'];
export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];

export type OrganizationRow = Tables['organizations']['Row'];
export type OrganizationInsert = Tables['organizations']['Insert'];
export type OrganizationUpdate = Tables['organizations']['Update'];

export type MembershipRow = Tables['memberships']['Row'];
export type MembershipInsert = Tables['memberships']['Insert'];
export type MembershipUpdate = Tables['memberships']['Update'];

export type ProjectRow = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

// Query options
export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: OrderByOption[];
  filters?: FilterOption[];
}

export interface OrderByOption {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

export interface FilterOption {
  column: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'eq'    // equals
  | 'neq'   // not equals
  | 'gt'    // greater than
  | 'gte'   // greater than or equal
  | 'lt'    // less than
  | 'lte'   // less than or equal
  | 'like'  // LIKE
  | 'ilike' // ILIKE (case insensitive)
  | 'is'    // IS
  | 'in'    // IN
  | 'cs'    // contains (array)
  | 'cd'    // contained by (array)
  | 'sl'    // starts with (text)
  | 'sr'    // ends with (text)
  | 'nxl'   // not left of (range)
  | 'nxr'   // not right of (range)
  | 'adj';  // adjacent (range)

// Response types
export interface QueryResult<T> {
  data: T | null;
  error: QueryError | null;
  count?: number;
}

export interface QueryError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Pagination
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Transaction types
export interface TransactionOptions {
  isolationLevel?: 'read-committed' | 'repeatable-read' | 'serializable';
}

export type TransactionCallback<T> = (tx: any) => Promise<T>;