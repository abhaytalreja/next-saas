#!/usr/bin/env node
/**
 * Database setup script
 * Automates the complete database setup process for new instances
 */

const { spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
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

function logStep(step, message) {
  log(`\n${colors.bright}[${step}]${colors.reset} ${message}`);
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

// Check if environment variables are set
function checkEnvironment() {
  logStep('1/5', 'Checking environment configuration...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL'
  ];
  
  const missing = [];
  const warnings = [];
  
  // Check for .env.local file
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    logError('.env.local file not found!');
    log('\nPlease create .env.local file with your Supabase credentials:');
    log('  cp .env.example .env.local');
    log('  # Then edit .env.local with your Supabase credentials');
    process.exit(1);
  }
  
  // Load environment variables from .env.local
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  } catch (error) {
    logError(`Failed to read .env.local: ${error.message}`);
    process.exit(1);
  }
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  });
  
  if (missing.length > 0) {
    logError('Missing required environment variables:');
    missing.forEach(varName => log(`  - ${varName}`, 'red'));
    log('\nPlease add these to your .env.local file');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    logWarning('Missing optional environment variables:');
    warnings.forEach(varName => log(`  - ${varName}`, 'yellow'));
    log('These may be needed for certain operations');
  }
  
  logSuccess('Environment configuration verified');
  
  // Display connection info
  logInfo(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
}

// Run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Install dependencies
async function installDependencies() {
  logStep('2/5', 'Installing dependencies...');
  
  try {
    await runCommand('npm', ['install']);
    logSuccess('Dependencies installed');
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    process.exit(1);
  }
}

// Run database migrations
async function runMigrations() {
  logStep('3/5', 'Running database migrations...');
  
  try {
    await runCommand('npm', ['run', 'db:migrate', 'up'], {
      cwd: join(process.cwd(), 'packages/database')
    });
    logSuccess('Database migrations completed');
  } catch (error) {
    logError(`Failed to run migrations: ${error.message}`);
    logWarning('You may need to run migrations manually:');
    log('  cd packages/database && npm run db:migrate up');
    process.exit(1);
  }
}

// Seed the database
async function seedDatabase() {
  logStep('4/5', 'Seeding database with initial data...');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\nDo you want to seed the database with sample data? (y/N): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y') {
        try {
          await runCommand('npm', ['run', 'db:seed', 'run'], {
            cwd: join(process.cwd(), 'packages/database')
          });
          logSuccess('Database seeded with sample data');
        } catch (error) {
          logError(`Failed to seed database: ${error.message}`);
          logWarning('You can seed manually later:');
          log('  cd packages/database && npm run db:seed run');
        }
      } else {
        logInfo('Skipping database seeding');
      }
      
      resolve();
    });
  });
}

// Generate TypeScript types
async function generateTypes() {
  logStep('5/5', 'Generating TypeScript types...');
  
  try {
    await runCommand('npm', ['run', 'db:generate'], {
      cwd: join(process.cwd(), 'packages/database')
    });
    logSuccess('TypeScript types generated');
  } catch (error) {
    logWarning(`Failed to generate types: ${error.message}`);
    log('You can generate types manually:');
    log('  cd packages/database && npm run db:generate');
  }
}

// Main setup function
async function setupDatabase() {
  log('\n🚀 NextSaaS Database Setup', 'bright');
  log('==========================\n');
  
  try {
    // Step 1: Check environment
    checkEnvironment();
    
    // Step 2: Install dependencies
    await installDependencies();
    
    // Step 3: Run migrations
    await runMigrations();
    
    // Step 4: Seed database (optional)
    await seedDatabase();
    
    // Step 5: Generate types
    await generateTypes();
    
    // Success!
    log('\n' + '='.repeat(50), 'green');
    logSuccess('Database setup completed successfully! 🎉');
    log('='.repeat(50) + '\n', 'green');
    
    log('Next steps:');
    log('1. Start the development server: npm run dev');
    log('2. Visit http://localhost:3002');
    log('3. Create your first user account\n');
    
    logInfo('Check the Supabase dashboard to explore your database:');
    log(`   ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();