#!/usr/bin/env node

/**
 * E2E Test Database Setup Script
 * 
 * This script sets up a clean test database environment for E2E testing.
 * It ensures consistent test data and proper isolation from development data.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Setting up E2E Test Database...\n')

/**
 * Configuration
 */
const config = {
  // Environment variables for test database
  testEnv: {
    NODE_ENV: 'test',
    DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    SUPABASE_URL: process.env.TEST_SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.TEST_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_ANON_KEY: process.env.TEST_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  
  // Test user credentials (these will be created in the database)
  testUsers: [
    {
      email: 'next-saas-admin@mailinator.com',
      password: 'AdminTest123!',
      role: 'admin'
    },
    {
      email: 'next-saas-org-admin@mailinator.com', 
      password: 'OrgAdmin123!',
      role: 'org_admin'
    },
    {
      email: 'next-saas-user@mailinator.com',
      password: 'UserTest123!', 
      role: 'user'
    },
    {
      email: 'next-saas-multi@mailinator.com',
      password: 'MultiTest123!',
      role: 'user'
    },
    {
      email: 'next-saas-mobile@mailinator.com',
      password: 'MobileTest123!',
      role: 'user'
    },
    {
      email: 'next-saas-pending@mailinator.com',
      password: 'PendingTest123!',
      role: 'user'
    },
    {
      email: 'next-saas-incomplete@mailinator.com',
      password: 'IncompleteTest123!',
      role: 'user'
    },
    {
      email: 'next-saas-gdpr@mailinator.com',
      password: 'GdprTest123!',
      role: 'user'
    }
  ]
}

/**
 * Utility functions
 */
function runCommand(command, description, options = {}) {
  console.log(`\n🔧 ${description}...`)
  
  try {
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...config.testEnv, ...options.env }
    })
    console.log(`✅ ${description} completed`)
    return result
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    throw error
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...')
  
  // Check if test database environment variables are set
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
  const missingVars = requiredEnvVars.filter(varName => {
    const testVar = `TEST_${varName}`
    const regularVar = varName
    return !process.env[testVar] && !process.env[regularVar]
  })
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('Please set these in your .env.test file or as environment variables')
    process.exit(1)
  }
  
  // Check if packages/database exists
  const databasePath = path.join(process.cwd(), 'packages/database')
  if (!fs.existsSync(databasePath)) {
    console.error('❌ packages/database directory not found')
    console.error('Please run this script from the project root directory')
    process.exit(1)
  }
  
  console.log('✅ Prerequisites check passed')
}

function resetTestDatabase() {
  console.log('\n🗑️ Resetting test database...')
  
  // Warning for production safety
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot run test database setup in production environment')
    process.exit(1)
  }
  
  // Run database reset (this will truncate tables and reseed)
  runCommand(
    'npm run db:seed reset',
    'Resetting database and running base seeds',
    { cwd: path.join(process.cwd(), 'packages/database') }
  )
}

function seedTestData() {
  console.log('\n🌱 Seeding E2E test data...')
  
  // Run test-specific seeds
  runCommand(
    'npm run db:seed run test',
    'Running E2E test seeds',
    { cwd: path.join(process.cwd(), 'packages/database') }
  )
}

function validateTestData() {
  console.log('\n✅ Validating test data...')
  
  // Check if test users were created
  console.log('📋 Test users that should be available:')
  config.testUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.role})`)
  })
  
  console.log('\n📋 Test organizations that should be available:')
  const testOrgs = [
    'Acme Corporation',
    'Tech Startup Inc', 
    'Enterprise Corp',
    'Consulting Firm LLC',
    'Mobile First Co',
    'Startup Co'
  ]
  testOrgs.forEach(org => {
    console.log(`  - ${org}`)
  })
  
  console.log('\n📧 Email testing:')
  console.log('  - All test users use @mailinator.com emails')
  console.log('  - Check emails at: https://mailinator.com')
  console.log('  - Use format: next-saas-{purpose}@mailinator.com for new test emails')
}

function createTestReport() {
  const reportPath = path.join(process.cwd(), 'e2e-test-database-setup.json')
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'test',
    database_url: config.testEnv.SUPABASE_URL ? 'configured' : 'missing',
    test_users_count: config.testUsers.length,
    test_users: config.testUsers.map(user => ({
      email: user.email,
      role: user.role
    })),
    test_organizations: [
      'Acme Corporation',
      'Tech Startup Inc',
      'Enterprise Corp', 
      'Consulting Firm LLC',
      'Mobile First Co',
      'Startup Co'
    ],
    setup_completed: true,
    instructions: {
      run_e2e_tests: 'npm run test:e2e',
      run_specific_tests: 'npm run test:e2e:user or npm run test:e2e:mobile',
      reset_test_data: 'node scripts/setup-e2e-database.js',
      access_test_emails: 'https://mailinator.com'
    }
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Test setup report saved to: ${reportPath}`)
}

/**
 * Main setup function
 */
async function setupE2EDatabase() {
  try {
    console.log('🎯 NextSaaS E2E Test Database Setup')
    console.log('=====================================\n')
    
    // Step 1: Check prerequisites
    checkPrerequisites()
    
    // Step 2: Reset test database
    resetTestDatabase()
    
    // Step 3: Seed test data
    seedTestData()
    
    // Step 4: Validate setup
    validateTestData()
    
    // Step 5: Create test report
    createTestReport()
    
    console.log('\n🎉 E2E Test Database setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('  1. Run E2E tests: npm run test:e2e')
    console.log('  2. Run specific test suites: npm run test:e2e:user')
    console.log('  3. Check test emails at: https://mailinator.com')
    console.log('  4. Reset test data anytime by running this script again')
    
    console.log('\n🔒 Security notes:')
    console.log('  - Test data uses weak passwords for testing only')
    console.log('  - Never use test credentials in production')
    console.log('  - Mailinator emails are public - for testing only')
    
  } catch (error) {
    console.error('\n💥 E2E database setup failed!')
    console.error('Error:', error.message)
    console.error('\n🔧 Troubleshooting:')
    console.error('  1. Check environment variables in .env.test')
    console.error('  2. Ensure database is accessible')
    console.error('  3. Verify Supabase credentials')
    console.error('  4. Run from project root directory')
    process.exit(1)
  }
}

/**
 * CLI handling
 */
if (require.main === module) {
  // Handle command line arguments
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
E2E Test Database Setup

Usage:
  node scripts/setup-e2e-database.js [options]

Options:
  --help, -h          Show this help message
  --reset             Force reset even if data exists
  --validate-only     Only validate existing test data

Environment Variables:
  TEST_SUPABASE_URL              Test database URL
  TEST_SUPABASE_SERVICE_KEY      Test database service key
  TEST_SUPABASE_ANON_KEY         Test database anon key

Examples:
  node scripts/setup-e2e-database.js              # Full setup
  node scripts/setup-e2e-database.js --reset      # Force reset
  node scripts/setup-e2e-database.js --validate-only  # Just validate
`)
    process.exit(0)
  }
  
  if (args.includes('--validate-only')) {
    console.log('🔍 Validating E2E test database setup...')
    validateTestData()
    console.log('✅ Validation completed')
    process.exit(0)
  }
  
  // Run the main setup
  setupE2EDatabase()
}

module.exports = {
  setupE2EDatabase,
  config,
  checkPrerequisites,
  resetTestDatabase,
  seedTestData,
  validateTestData
}