import { z } from 'zod';

/**
 * Database Configuration Schema
 * 
 * Validates database connection settings including:
 * - Connection URLs and credentials
 * - Connection pool settings
 * - SSL configuration
 * - Query timeout and retry settings
 * - Backup and replication settings
 */

// Database provider enum
export const DatabaseProvider = z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb']);

// SSL configuration schema
const sslConfigSchema = z.object({
  enabled: z.boolean().default(false),
  rejectUnauthorized: z.boolean().default(true),
  ca: z.string().optional(),
  cert: z.string().optional(),
  key: z.string().optional(),
}).describe('SSL configuration for database connections');

// Connection pool configuration
const poolConfigSchema = z.object({
  min: z.number().int().min(0).default(2),
  max: z.number().int().min(1).default(10),
  acquireTimeoutMillis: z.number().int().min(1000).default(30000),
  createTimeoutMillis: z.number().int().min(1000).default(30000),
  destroyTimeoutMillis: z.number().int().min(1000).default(5000),
  idleTimeoutMillis: z.number().int().min(1000).default(30000),
  reapIntervalMillis: z.number().int().min(1000).default(1000),
}).describe('Database connection pool settings');

// Query configuration
const queryConfigSchema = z.object({
  timeout: z.number().int().min(1000).default(30000),
  retries: z.number().int().min(0).default(3),
  retryDelay: z.number().int().min(100).default(1000),
}).describe('Database query configuration');

// Backup configuration
const backupConfigSchema = z.object({
  enabled: z.boolean().default(false),
  schedule: z.string().regex(/^(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)\s+(\d+|\*)$/).optional(),
  retention: z.number().int().min(1).default(7),
  location: z.string().optional(),
}).describe('Database backup configuration');

// Read replica configuration
const replicaConfigSchema = z.object({
  enabled: z.boolean().default(false),
  urls: z.array(z.string().url()).default([]),
  loadBalancing: z.enum(['round-robin', 'random', 'least-connections']).default('round-robin'),
}).describe('Database read replica configuration');

// Main database configuration schema
export const databaseConfigSchema = z.object({
  // Basic connection settings
  provider: DatabaseProvider.default('postgresql'),
  url: z.string()
    .url()
    .refine((url) => {
      // Validate database URL format
      const supportedProtocols = ['postgresql://', 'postgres://', 'mysql://', 'sqlite://', 'mongodb://'];
      return supportedProtocols.some(protocol => url.startsWith(protocol));
    }, {
      message: 'Invalid database URL format. Must be a valid database connection string.',
    })
    .describe('Primary database connection URL'),
  
  // Connection settings
  host: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  database: z.string().min(1).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  
  // SSL configuration
  ssl: sslConfigSchema.optional(),
  
  // Connection pool settings
  pool: poolConfigSchema.default({}),
  
  // Query configuration
  query: queryConfigSchema.default({}),
  
  // Backup configuration
  backup: backupConfigSchema.default({}),
  
  // Read replicas
  readReplicas: replicaConfigSchema.default({}),
  
  // Migration settings
  migrations: z.object({
    enabled: z.boolean().default(true),
    directory: z.string().default('./migrations'),
    tableName: z.string().default('migrations'),
    autoRun: z.boolean().default(false),
  }).default({}),
  
  // Logging configuration
  logging: z.object({
    enabled: z.boolean().default(true),
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    queries: z.boolean().default(false),
    slowQueries: z.boolean().default(true),
    slowQueryThreshold: z.number().int().min(100).default(1000),
  }).default({}),
  
  // Performance settings
  performance: z.object({
    connectionTimeout: z.number().int().min(1000).default(10000),
    maxQueryExecutionTime: z.number().int().min(1000).default(30000),
    statementCacheSize: z.number().int().min(0).default(100),
  }).default({}),
  
  // Development settings
  development: z.object({
    dropSchema: z.boolean().default(false),
    seedData: z.boolean().default(false),
    debugMode: z.boolean().default(false),
  }).default({}),
}).describe('Database configuration settings');

// Export types
export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;
export type DatabaseProvider = z.infer<typeof DatabaseProvider>;

// Environment-specific database configurations
export const developmentDatabaseDefaults: Partial<DatabaseConfig> = {
  provider: 'postgresql',
  url: 'postgresql://localhost:5432/nextsaas_dev',
  logging: {
    enabled: true,
    level: 'debug',
    queries: true,
    slowQueries: true,
    slowQueryThreshold: 100,
  },
  development: {
    dropSchema: false,
    seedData: true,
    debugMode: true,
  },
  pool: {
    min: 2,
    max: 5,
  },
};

export const productionDatabaseDefaults: Partial<DatabaseConfig> = {
  ssl: {
    enabled: true,
    rejectUnauthorized: true,
  },
  logging: {
    enabled: true,
    level: 'warn',
    queries: false,
    slowQueries: true,
    slowQueryThreshold: 1000,
  },
  pool: {
    min: 5,
    max: 20,
  },
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: 30,
  },
  performance: {
    connectionTimeout: 5000,
    maxQueryExecutionTime: 10000,
    statementCacheSize: 500,
  },
};

export const testDatabaseDefaults: Partial<DatabaseConfig> = {
  provider: 'postgresql',
  url: 'postgresql://localhost:5432/nextsaas_test',
  logging: {
    enabled: false,
    level: 'error',
    queries: false,
    slowQueries: false,
  },
  development: {
    dropSchema: true,
    seedData: false,
    debugMode: false,
  },
  pool: {
    min: 1,
    max: 3,
  },
};