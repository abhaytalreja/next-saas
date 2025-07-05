#!/usr/bin/env node
/**
 * Generates a complete database setup SQL file
 * Combines all migrations into a single file for easy execution
 */

const { readdir, readFile, writeFile } = require('fs').promises;
const { join } = require('path');

async function generateSQL() {
  console.log('🔨 Generating complete database setup SQL...\n');

  const migrationsPath = join(__dirname, '../packages/database/migrations');
  const schemaPath = join(__dirname, '../packages/database/schema');
  
  try {
    let combinedSQL = `-- NextSaaS Complete Database Setup
-- Generated on: ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Go to your Supabase SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
--
-- This will create all tables, functions, triggers, and security policies

`;

    // Process schema files in order
    const schemaDirs = [
      'core',      // Users, organizations first
      'auth',      // Authentication tables
      'billing',   // Billing and subscriptions
      'content',   // Projects and items
      'system',    // Audit logs, etc
      'functions', // Database functions
      'policies'   // RLS policies
    ];

    for (const dir of schemaDirs) {
      const dirPath = join(schemaPath, dir);
      
      try {
        const files = await readdir(dirPath);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
        
        if (sqlFiles.length > 0) {
          combinedSQL += `\n-- ============================================\n`;
          combinedSQL += `-- ${dir.toUpperCase()} SCHEMA\n`;
          combinedSQL += `-- ============================================\n\n`;
          
          for (const file of sqlFiles) {
            console.log(`  Adding ${dir}/${file}`);
            const content = await readFile(join(dirPath, file), 'utf-8');
            
            combinedSQL += `-- ------------------------------------\n`;
            combinedSQL += `-- ${file}\n`;
            combinedSQL += `-- ------------------------------------\n\n`;
            combinedSQL += content;
            combinedSQL += `\n\n`;
          }
        }
      } catch (error) {
        console.log(`  Skipping ${dir} (not found)`);
      }
    }

    // Process main migration file (skip it as it just includes other files)
    // The 001_initial_schema.sql just contains \i includes which we've already processed

    // Add final setup steps
    combinedSQL += `\n-- ============================================
-- FINAL SETUP
-- ============================================

-- Grant necessary permissions for the application
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS public._migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mark this setup as complete
INSERT INTO _migrations (name) VALUES ('complete_database_setup');

-- Success!
-- Your NextSaaS database is now ready to use! 🎉
`;

    // Save the file
    const outputPath = join(__dirname, '../supabase-setup.sql');
    await writeFile(outputPath, combinedSQL);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database setup SQL generated successfully!');
    console.log('='.repeat(60) + '\n');
    
    console.log('📄 File saved to: supabase-setup.sql\n');
    
    console.log('Next steps:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the contents of supabase-setup.sql');
    console.log('5. Click "Run"\n');
    
    console.log('This will set up your entire database schema in one go! 🚀');

  } catch (error) {
    console.error('❌ Failed to generate SQL:', error.message);
    process.exit(1);
  }
}

// Run
generateSQL();