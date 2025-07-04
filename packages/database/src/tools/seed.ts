#!/usr/bin/env tsx
/**
 * Database seeding tool
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

class SeedRunner {
  private supabase: any;
  private environment: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.environment = process.env.NODE_ENV || 'development';
  }

  async run(environment?: string) {
    const env = environment || this.environment;
    console.log(`🌱 Seeding database for ${env} environment...\n`);

    const seedsPath = join(__dirname, `../../seeds/${env}`);

    try {
      // Get seed files
      const seedFiles = await this.getSeedFiles(seedsPath);

      if (seedFiles.length === 0) {
        console.log(`No seed files found for ${env} environment`);
        return;
      }

      console.log(`Found ${seedFiles.length} seed files:\n`);
      seedFiles.forEach(f => console.log(`  - ${f}`));
      console.log();

      // Execute seed files
      for (const seedFile of seedFiles) {
        await this.executeSeed(seedsPath, seedFile);
      }

      console.log('\n✅ Database seeding completed successfully');
    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    }
  }

  private async getSeedFiles(path: string): Promise<string[]> {
    try {
      const files = await readdir(path);
      return files
        .filter(f => f.endsWith('.sql'))
        .sort();
    } catch (error) {
      console.warn(`Warning: Could not read seeds directory ${path}`);
      return [];
    }
  }

  private async executeSeed(seedsPath: string, filename: string) {
    console.log(`\nExecuting seed: ${filename}`);

    try {
      // Read seed file
      const filePath = join(seedsPath, filename);
      const sql = await readFile(filePath, 'utf-8');

      // Execute seed
      const { error } = await this.supabase.rpc('exec_sql', { query: sql });
      if (error) throw error;

      console.log(`✅ ${filename} executed successfully`);
    } catch (error) {
      console.error(`❌ Failed to execute ${filename}:`, error);
      throw error;
    }
  }

  async reset() {
    console.log('🔄 Resetting database...\n');
    console.log('⚠️  WARNING: This will delete all data!\n');

    if (this.environment === 'production') {
      console.error('❌ Cannot reset production database!');
      process.exit(1);
    }

    try {
      // List of tables to truncate in order (respecting foreign keys)
      const tables = [
        'api_keys',
        'feature_flag_overrides',
        'feature_flags',
        'notifications',
        'activities',
        'audit_logs',
        'custom_field_values',
        'custom_fields',
        'attachments',
        'item_categories',
        'categories',
        'items',
        'projects',
        'usage_tracking',
        'payments',
        'invoices',
        'subscriptions',
        'plans',
        'email_verifications',
        'password_resets',
        'oauth_accounts',
        'sessions',
        'memberships',
        'organizations',
        'users'
      ];

      console.log('Truncating tables...');
      for (const table of tables) {
        console.log(`  - Truncating ${table}`);
        const { error } = await this.supabase.rpc('exec_sql', { 
          query: `TRUNCATE TABLE ${table} CASCADE;` 
        });
        if (error) {
          console.warn(`  ⚠️  Warning: Could not truncate ${table}:`, error.message);
        }
      }

      console.log('\n✅ Database reset completed');
      
      // Run seeds after reset
      console.log('\nRunning seeds...');
      await this.run();
    } catch (error) {
      console.error('\n❌ Reset failed:', error);
      process.exit(1);
    }
  }

  async generateSampleData() {
    console.log('🎲 Generating sample data...\n');

    try {
      // Generate random items for testing
      const organizations = await this.getOrganizations();
      
      for (const org of organizations) {
        console.log(`\nGenerating data for ${org.name}...`);
        
        // Generate items
        const itemCount = Math.floor(Math.random() * 20) + 10;
        console.log(`  - Creating ${itemCount} items`);
        
        for (let i = 0; i < itemCount; i++) {
          const itemTypes = ['task', 'note', 'document', 'issue'];
          const statuses = ['active', 'completed', 'archived'];
          
          await this.supabase.from('items').insert({
            organization_id: org.id,
            type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
            title: `Sample Item ${i + 1}`,
            description: `This is a sample item for testing purposes.`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: Math.floor(Math.random() * 5),
            tags: ['sample', 'test'],
            created_by: org.created_by
          });
        }
        
        // Generate notifications
        const notificationCount = Math.floor(Math.random() * 10) + 5;
        console.log(`  - Creating ${notificationCount} notifications`);
        
        const members = await this.getOrganizationMembers(org.id);
        for (let i = 0; i < notificationCount; i++) {
          const member = members[Math.floor(Math.random() * members.length)];
          
          await this.supabase.from('notifications').insert({
            user_id: member.user_id,
            organization_id: org.id,
            type: 'system',
            title: `Sample Notification ${i + 1}`,
            message: 'This is a sample notification for testing.',
            priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)]
          });
        }
      }

      console.log('\n✅ Sample data generation completed');
    } catch (error) {
      console.error('\n❌ Sample data generation failed:', error);
      process.exit(1);
    }
  }

  private async getOrganizations() {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('deleted_at', null);
    
    if (error) throw error;
    return data || [];
  }

  private async getOrganizationMembers(organizationId: string) {
    const { data, error } = await this.supabase
      .from('memberships')
      .select('*')
      .eq('organization_id', organizationId)
      .not('accepted_at', 'is', null);
    
    if (error) throw error;
    return data || [];
  }
}

// CLI
const command = process.argv[2];
const runner = new SeedRunner();

switch (command) {
  case 'run':
    const env = process.argv[3];
    runner.run(env);
    break;
  case 'reset':
    runner.reset();
    break;
  case 'generate':
    runner.generateSampleData();
    break;
  default:
    console.log(`
Database Seeding Tool

Usage:
  npm run db:seed run              Run seeds for current environment
  npm run db:seed run production   Run seeds for production
  npm run db:seed reset            Reset database and run seeds
  npm run db:seed generate         Generate sample data
    `);
}