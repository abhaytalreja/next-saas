/**
 * NextSaaS Database Package
 * 
 * Comprehensive database solution with:
 * - Multi-tenant architecture with RLS
 * - Type-safe database operations
 * - Database provider abstraction
 * - Migration and seeding tools
 * - Real-time subscriptions
 */

// Legacy Prisma exports for compatibility
export { PrismaClient } from '@prisma/client'
export type { User as PrismaUser, Organization as PrismaOrganization } from '@prisma/client'

// Database client and initialization
export * from './client';

// Types
export * from './types/base';
export * from './types/tables';

// Validation schemas
export * from './validation/schemas';

// Repositories
export { BaseRepository } from './repositories/base-repository';
export { UserRepository } from './repositories/user-repository';
export { OrganizationRepository } from './repositories/organization-repository';

// Database providers
export type { 
  DatabaseProvider, 
  RealtimeProvider,
  DatabaseConfig,
  RealtimePayload,
  Subscription,
  SubscriptionOptions
} from './abstractions/interfaces/database-provider';

// Re-export legacy schemas for compatibility
export * from './schemas';