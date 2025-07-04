#!/usr/bin/env tsx
/**
 * Database migration runner
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

interface MigrationRecord {
  id: number;
  name: string;
  executed_at: Date;
}

class MigrationRunner {
  private supabase: any;
  private migrationsPath: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.migrationsPath = join(__dirname, '../../migrations');
  }

  async run() {
    console.log('🚀 Running database migrations...\n');

    try {
      // Ensure migrations table exists
      await this.ensureMigrationsTable();

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      const executedNames = new Set(executedMigrations.map(m => m.name));

      // Get pending migrations
      const migrationFiles = await this.getMigrationFiles();
      const pendingMigrations = migrationFiles.filter(f => !executedNames.has(f));

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`Found ${pendingMigrations.length} pending migrations:\n`);
      pendingMigrations.forEach(m => console.log(`  - ${m}`));
      console.log();

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log('\n✅ All migrations completed successfully');
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async ensureMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error } = await this.supabase.rpc('exec_sql', { query });
    if (error) throw error;
  }

  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const { data, error } = await this.supabase
      .from('_migrations')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || [];
  }

  private async getMigrationFiles(): Promise<string[]> {
    const files = await readdir(this.migrationsPath);
    return files
      .filter(f => f.endsWith('.sql'))
      .sort();
  }

  private async executeMigration(filename: string) {
    console.log(`\nExecuting migration: ${filename}`);

    try {
      // Read migration file
      const filePath = join(this.migrationsPath, filename);
      let sql = await readFile(filePath, 'utf-8');

      // Handle include directives
      sql = await this.processIncludes(sql);

      // Execute migration
      const { error } = await this.supabase.rpc('exec_sql', { query: sql });
      if (error) throw error;

      // Record migration
      const { error: recordError } = await this.supabase
        .from('_migrations')
        .insert({ name: filename });

      if (recordError) throw recordError;

      console.log(`✅ ${filename} executed successfully`);
    } catch (error) {
      console.error(`❌ Failed to execute ${filename}:`, error);
      throw error;
    }
  }

  private async processIncludes(sql: string): Promise<string> {
    // Replace \i includes with file contents
    const includePattern = /\\i\s+([^\s]+)/g;
    const matches = Array.from(sql.matchAll(includePattern));

    for (const match of matches) {
      const includePath = match[1];
      const fullPath = join(this.migrationsPath, includePath);
      
      try {
        const includeContent = await readFile(fullPath, 'utf-8');
        sql = sql.replace(match[0], includeContent);
      } catch (error) {
        console.warn(`Warning: Could not include file ${includePath}`);
      }
    }

    return sql;
  }

  async rollback(steps = 1) {
    console.log(`🔄 Rolling back ${steps} migration(s)...\n`);

    try {
      const executedMigrations = await this.getExecutedMigrations();
      const toRollback = executedMigrations.slice(-steps).reverse();

      if (toRollback.length === 0) {
        console.log('✅ No migrations to rollback');
        return;
      }

      for (const migration of toRollback) {
        console.log(`Rolling back: ${migration.name}`);
        
        // Look for down migration
        const downFile = migration.name.replace('.sql', '.down.sql');
        const downPath = join(this.migrationsPath, downFile);
        
        try {
          const downSql = await readFile(downPath, 'utf-8');
          const { error } = await this.supabase.rpc('exec_sql', { query: downSql });
          
          if (error) throw error;

          // Remove migration record
          const { error: deleteError } = await this.supabase
            .from('_migrations')
            .delete()
            .eq('id', migration.id);

          if (deleteError) throw deleteError;

          console.log(`✅ ${migration.name} rolled back successfully`);
        } catch (error) {
          console.error(`❌ No down migration found for ${migration.name}`);
          throw error;
        }
      }

      console.log('\n✅ Rollback completed successfully');
    } catch (error) {
      console.error('\n❌ Rollback failed:', error);
      process.exit(1);
    }
  }

  async status() {
    console.log('📊 Migration status\n');

    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      const executedNames = new Set(executedMigrations.map(m => m.name));

      console.log('Executed migrations:');
      if (executedMigrations.length === 0) {
        console.log('  None');
      } else {
        executedMigrations.forEach(m => {
          console.log(`  ✅ ${m.name} (${new Date(m.executed_at).toLocaleString()})`);
        });
      }

      console.log('\nPending migrations:');
      const pendingMigrations = migrationFiles.filter(f => !executedNames.has(f));
      if (pendingMigrations.length === 0) {
        console.log('  None');
      } else {
        pendingMigrations.forEach(m => {
          console.log(`  ⏳ ${m}`);
        });
      }
    } catch (error) {
      console.error('\n❌ Failed to get migration status:', error);
      process.exit(1);
    }
  }
}

// CLI
const command = process.argv[2];
const runner = new MigrationRunner();

switch (command) {
  case 'up':
    runner.run();
    break;
  case 'down':
    const steps = parseInt(process.argv[3] || '1');
    runner.rollback(steps);
    break;
  case 'status':
    runner.status();
    break;
  default:
    console.log(`
Database Migration Tool

Usage:
  npm run db:migrate up      Run pending migrations
  npm run db:migrate down    Rollback last migration
  npm run db:migrate down 3  Rollback last 3 migrations
  npm run db:migrate status  Show migration status
    `);
}