/**
 * Database client initialization and management
 */

import { PrismaClient } from '@prisma/client';
import { SupabaseProvider } from './abstractions/supabase/supabase-provider';
import { UserRepository } from './repositories/user-repository';
import { OrganizationRepository } from './repositories/organization-repository';
import type { DatabaseProvider, DatabaseConfig } from './abstractions/interfaces/database-provider';

// Keep Prisma for compatibility
declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

// New database abstraction
export interface DatabaseClientConfig {
  provider: 'supabase' | 'firebase';
  config: DatabaseConfig;
}

export class Database {
  private provider: DatabaseProvider;
  
  // Repositories
  public users: UserRepository;
  public organizations: OrganizationRepository;

  constructor(config: DatabaseClientConfig) {
    // Initialize provider based on config
    switch (config.provider) {
      case 'supabase':
        this.provider = new SupabaseProvider(config.config);
        break;
      case 'firebase':
        throw new Error('Firebase provider not implemented yet');
      default:
        throw new Error(`Unknown database provider: ${config.provider}`);
    }

    // Initialize repositories
    this.users = new UserRepository(this.provider);
    this.organizations = new OrganizationRepository(this.provider);
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.provider.connect();
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.provider.isConnected();
  }

  /**
   * Get the underlying provider
   */
  getProvider(): DatabaseProvider {
    return this.provider;
  }

  /**
   * Execute raw query
   */
  async raw<T = any>(query: string, params?: any[]) {
    return this.provider.raw<T>(query, params);
  }

  /**
   * Begin a transaction (if supported)
   */
  async transaction<T>(fn: (db: Database) => Promise<T>): Promise<T> {
    // For now, just execute the function
    // Real transaction support depends on the provider
    return fn(this);
  }
}

// Singleton instance
let databaseInstance: Database | null = null;

/**
 * Initialize the database client
 */
export function initializeDatabase(config: DatabaseClientConfig): Database {
  if (!databaseInstance) {
    databaseInstance = new Database(config);
  }
  return databaseInstance;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database {
  if (!databaseInstance) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return databaseInstance;
}

/**
 * Create a new database instance (useful for testing)
 */
export function createDatabase(config: DatabaseClientConfig): Database {
  return new Database(config);
}