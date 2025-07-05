#!/usr/bin/env node
/**
 * Generates Supabase-compatible database setup SQL
 * Handles auth schema restrictions and Supabase-specific requirements
 */

const { readdir, readFile, writeFile } = require('fs').promises;
const { join } = require('path');

async function generateSQL() {
  console.log('🔨 Generating Supabase-compatible database setup SQL...\n');

  const schemaPath = join(__dirname, '../packages/database/schema');
  
  try {
    let combinedSQL = `-- NextSaaS Database Setup for Supabase
-- Generated on: ${new Date().toISOString()}
-- 
-- Instructions:
-- 1. Go to your Supabase SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`;

    // Helper function to fix SQL for Supabase
    function fixForSupabase(content, filename) {
      let fixed = content;
      
      // Replace auth.check_org_membership with public.check_org_membership
      fixed = fixed.replace(/auth\.check_org_membership/g, 'public.check_org_membership');
      fixed = fixed.replace(/auth\.check_org_role/g, 'public.check_org_role');
      
      // Replace function definitions in auth schema with public schema
      fixed = fixed.replace(/CREATE OR REPLACE FUNCTION auth\./g, 'CREATE OR REPLACE FUNCTION public.');
      
      // Keep auth.uid() as it's a Supabase built-in
      // No changes needed for auth.uid()
      
      return fixed;
    }

    // Process schema files in order
    const schemaDirs = [
      'core',      // Users, organizations first
      'auth',      // Authentication tables (in public schema)
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
            console.log(`  Processing ${dir}/${file}`);
            let content = await readFile(join(dirPath, file), 'utf-8');
            
            // Fix content for Supabase compatibility
            content = fixForSupabase(content, file);
            
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

    // Add final setup steps
    combinedSQL += `\n-- ============================================
-- FINAL SETUP
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, organization_id);

-- Create a simple health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'NextSaaS database is ready! 🎉'::text;
$$;

-- Test the setup
SELECT public.health_check();
`;

    // Save the file
    const outputPath = join(__dirname, '../supabase-setup.sql');
    await writeFile(outputPath, combinedSQL);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Supabase-compatible SQL generated successfully!');
    console.log('='.repeat(60) + '\n');
    
    console.log('📄 File saved to: supabase-setup.sql\n');
    
    console.log('Next steps:');
    console.log('1. Open your Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the contents of supabase-setup.sql');
    console.log('5. Click "Run"\n');
    
    console.log('The SQL has been fixed for Supabase compatibility:');
    console.log('  ✓ Functions moved from auth schema to public schema');
    console.log('  ✓ Proper permissions set');
    console.log('  ✓ Supabase built-in functions preserved\n');
    
    console.log('Your database will be ready to use! 🚀');

  } catch (error) {
    console.error('❌ Failed to generate SQL:', error.message);
    process.exit(1);
  }
}

// Run
generateSQL();