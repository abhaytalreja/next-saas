#!/usr/bin/env node
/**
 * Supabase initial setup script
 * Sets up the necessary functions and permissions for migrations to work
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function setupSupabase() {
  log('\n🚀 Supabase Initial Setup', 'bright');
  log('========================\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    logError('Missing required environment variables!');
    log('\nPlease ensure your .env.local file contains:');
    log('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  logInfo('This script will set up your Supabase database for NextSaaS.');
  logWarning('You need to run the SQL commands in the Supabase SQL editor.\n');

  const setupSQL = `
-- Step 1: Create exec_sql function for migrations
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Step 2: Set proper permissions
REVOKE ALL ON FUNCTION public.exec_sql(query text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(query text) FROM anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(query text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(query text) TO service_role;

-- Step 3: Create migrations table
CREATE TABLE IF NOT EXISTS public._migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 5: Add comment
COMMENT ON FUNCTION public.exec_sql(query text) IS 'Used by migration system. Only accessible via service role.';
`;

  log('Please follow these steps:\n');
  log('1. Go to your Supabase Dashboard: ' + supabaseUrl);
  log('2. Navigate to the SQL Editor (SQL icon in sidebar)');
  log('3. Create a new query');
  log('4. Copy and paste the following SQL:\n');
  
  console.log('━'.repeat(60));
  console.log(setupSQL);
  console.log('━'.repeat(60));

  log('\n5. Click "Run" to execute the SQL');
  log('6. Once complete, you can run: npm run db:setup\n');

  // Create a simple check
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nHave you run the SQL commands above? (y/N): ', async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'y') {
      logSuccess('Great! You can now run: npm run db:setup');
      logInfo('This will create all your database tables and set up your SaaS.');
    } else {
      logInfo('No problem! Run this script again when you\'re ready.');
      log('\nAlternatively, you can manually run the migrations by:');
      log('1. Going to each .sql file in packages/database/migrations/');
      log('2. Running them in order in the Supabase SQL editor');
    }
  });
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run setup
setupSupabase();