import type { QueryOptions, OrderByOption, FilterOption } from '../types/database';

/**
 * Build a Supabase query with common options
 */
export function buildQuery(query: any, options: QueryOptions): any {
  let modifiedQuery = query;

  // Apply filters
  if (options.filters && options.filters.length > 0) {
    for (const filter of options.filters) {
      modifiedQuery = applyFilter(modifiedQuery, filter);
    }
  }

  // Apply ordering
  if (options.orderBy && options.orderBy.length > 0) {
    for (const order of options.orderBy) {
      modifiedQuery = modifiedQuery.order(order.column, {
        ascending: order.ascending ?? true,
        nullsFirst: order.nullsFirst,
      });
    }
  }

  // Apply limit
  if (options.limit !== undefined) {
    modifiedQuery = modifiedQuery.limit(options.limit);
  }

  // Apply offset
  if (options.offset !== undefined) {
    modifiedQuery = modifiedQuery.range(
      options.offset,
      options.offset + (options.limit || 10) - 1
    );
  }

  return modifiedQuery;
}

/**
 * Apply a filter to a query
 */
function applyFilter(query: any, filter: FilterOption): any {
  const { column, operator, value } = filter;

  switch (operator) {
    case 'eq':
      return query.eq(column, value);
    case 'neq':
      return query.neq(column, value);
    case 'gt':
      return query.gt(column, value);
    case 'gte':
      return query.gte(column, value);
    case 'lt':
      return query.lt(column, value);
    case 'lte':
      return query.lte(column, value);
    case 'like':
      return query.like(column, value);
    case 'ilike':
      return query.ilike(column, value);
    case 'is':
      return query.is(column, value);
    case 'in':
      return query.in(column, value);
    case 'cs':
      return query.contains(column, value);
    case 'cd':
      return query.containedBy(column, value);
    case 'sl':
      return query.textSearch(column, value, { type: 'plain', config: 'english' });
    default:
      console.warn(`Unsupported filter operator: ${operator}`);
      return query;
  }
}

/**
 * Build pagination options
 */
export function buildPaginationOptions(
  page: number,
  pageSize: number
): { limit: number; offset: number } {
  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  totalItems: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}