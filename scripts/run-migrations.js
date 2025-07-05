#!/usr/bin/env node
/**
 * Direct migration runner for Supabase
 * Runs SQL migrations directly without needing exec_sql function
 */

const { readdir, readFile } = require('fs').promises;
const { join } = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

async function runMigrations() {
  log('\n🚀 Running Database Migrations', 'bright');
  log('============================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logError('Missing required environment variables!');
    process.exit(1);
  }

  // Since we can't run arbitrary SQL with anon key, we'll output the SQL for manual execution
  const migrationsPath = join(__dirname, '../packages/database/migrations');
  
  try {
    // Get all SQL files
    const files = await readdir(migrationsPath);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      logInfo('No migration files found');
      return;
    }

    log(`Found ${sqlFiles.length} migration files:\n`);
    
    // Generate combined SQL
    let combinedSQL = '-- NextSaaS Database Setup\\n';
    combinedSQL += '-- Run this in your Supabase SQL Editor\\n\\n';
    
    for (const file of sqlFiles) {
      if (file === '000_setup_exec_sql.sql') {
        // Skip the exec_sql setup file
        continue;
      }
      
      log(`  • ${file}`);
      const content = await readFile(join(migrationsPath, file), 'utf-8');
      
      combinedSQL += `\\n-- ============================================\\n`;
      combinedSQL += `-- Migration: ${file}\\n`;
      combinedSQL += `-- ============================================\\n\\n`;
      combinedSQL += content;
      combinedSQL += `\\n\\n`;
    }

    // Save to file
    const outputPath = join(__dirname, '../database-setup.sql');
    await require('fs').promises.writeFile(outputPath, combinedSQL);

    log('\\n' + '━'.repeat(60));
    logSuccess('Migration SQL has been generated!');
    log('━'.repeat(60) + '\\n');

    log('Next steps:\\n');
    log('1. The complete database setup SQL has been saved to:');
    log(`   ${outputPath}\\n`);
    
    log('2. Go to your Supabase Dashboard:');
    log(`   ${supabaseUrl}\\n`);
    
    log('3. Navigate to the SQL Editor');
    log('4. Create a new query');
    log('5. Copy and paste the contents of database-setup.sql');
    log('6. Click "Run" to execute\\n');
    
    logInfo('This will create all tables, functions, triggers, and RLS policies.');
    log('\\nAlternatively, you can run each migration file individually in order.');

  } catch (error) {
    logError(`Failed to process migrations: ${error.message}`);
    process.exit(1);
  }
}

// Run
runMigrations();