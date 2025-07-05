#!/usr/bin/env node
/**
 * Database seeding script
 * Adds sample data to your database
 */

const { readdir, readFile } = require('fs').promises;
const { join } = require('path');
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

async function generateSeedSQL() {
  const seedsPath = join(__dirname, '../packages/database/seeds/development');
  
  try {
    // Read all seed files
    const files = await readdir(seedsPath);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    if (sqlFiles.length === 0) {
      logWarning('No seed files found');
      return null;
    }
    
    let combinedSQL = `-- NextSaaS Sample Data
-- Generated on: ${new Date().toISOString()}
-- 
-- This will add sample data to help you explore the system

`;
    
    for (const file of sqlFiles) {
      console.log(`  • Processing ${file}`);
      const content = await readFile(join(seedsPath, file), 'utf-8');
      
      combinedSQL += `\n-- ============================================\n`;
      combinedSQL += `-- ${file}\n`;
      combinedSQL += `-- ============================================\n\n`;
      combinedSQL += content;
      combinedSQL += `\n\n`;
    }
    
    return combinedSQL;
  } catch (error) {
    logError(`Failed to read seed files: ${error.message}`);
    return null;
  }
}

async function seedDatabase() {
  log('\n🌱 Database Seeding', 'bright');
  log('==================\n');
  
  logInfo('This will add sample data to your database including:');
  log('  • Sample users and organizations');
  log('  • Example projects and content');
  log('  • Demo subscription plans');
  log('  • Test data to explore features\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Do you want to add sample data? (y/N): ', async (answer) => {
    rl.close();
    
    if (answer.toLowerCase() !== 'y') {
      logInfo('Skipping database seeding');
      return;
    }
    
    log('\nGenerating seed SQL...');
    const seedSQL = await generateSeedSQL();
    
    if (!seedSQL) {
      logError('Failed to generate seed SQL');
      return;
    }
    
    // Save to file
    const outputPath = join(__dirname, '../seed-data.sql');
    await require('fs').promises.writeFile(outputPath, seedSQL);
    
    log('\n' + '━'.repeat(60));
    logSuccess('Seed SQL generated successfully!');
    log('━'.repeat(60) + '\n');
    
    log('To add the sample data:\n');
    log('1. Go to your Supabase SQL Editor');
    log('2. Create a new query');
    log('3. Copy and paste the contents of seed-data.sql');
    log('4. Click "Run"\n');
    
    logWarning('Note: Sample data includes:');
    log('  • Test users (password: "password123" for all)');
    log('  • Demo organizations');
    log('  • Example projects and items');
    log('  • Sample billing plans\n');
    
    logInfo('You can always delete this data later from the Supabase dashboard.');
  });
}

// Run
seedDatabase();