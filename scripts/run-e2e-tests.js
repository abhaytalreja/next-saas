#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * E2E Test Runner Script
 * 
 * This script orchestrates the execution of E2E tests with proper setup,
 * environment configuration, and reporting.
 */

const TEST_TYPES = {
  all: 'Run all E2E tests',
  user: 'Run user journey tests only',
  mobile: 'Run mobile-specific tests only',
  org: 'Run organization workflow tests only',
  smoke: 'Run smoke tests (quick validation)',
  cross: 'Run cross-browser tests'
}

const ENVIRONMENTS = {
  local: 'http://localhost:3000',
  staging: process.env.STAGING_URL || 'https://staging.nextsaas.com',
  production: process.env.PRODUCTION_URL || 'https://nextsaas.com'
}

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    type: 'all',
    env: 'local',
    headed: false,
    debug: false,
    workers: undefined,
    reporter: 'html',
    help: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--type':
      case '-t':
        options.type = args[++i]
        break
      case '--env':
      case '-e':
        options.env = args[++i]
        break
      case '--headed':
      case '-h':
        options.headed = true
        break
      case '--debug':
      case '-d':
        options.debug = true
        break
      case '--workers':
      case '-w':
        options.workers = parseInt(args[++i])
        break
      case '--reporter':
      case '-r':
        options.reporter = args[++i]
        break
      case '--help':
        options.help = true
        break
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`)
          process.exit(1)
        }
    }
  }

  return options
}

function showHelp() {
  console.log(`
🎭 NextSaaS E2E Test Runner

Usage: npm run test:e2e [options]

Options:
  --type, -t <type>       Test type to run (default: all)
                          ${Object.entries(TEST_TYPES).map(([k, v]) => `${k}: ${v}`).join('\n                          ')}
  
  --env, -e <env>         Environment to test against (default: local)
                          ${Object.entries(ENVIRONMENTS).map(([k, v]) => `${k}: ${v}`).join('\n                          ')}
  
  --headed, -h            Run tests in headed mode (visible browser)
  --debug, -d             Enable debug mode with verbose output
  --workers, -w <num>     Number of parallel workers
  --reporter, -r <type>   Reporter type (html, json, junit, list)
  --help                  Show this help message

Examples:
  npm run test:e2e                          # Run all tests locally
  npm run test:e2e --type user --headed     # Run user journey tests with visible browser
  npm run test:e2e --type mobile --env staging  # Run mobile tests against staging
  npm run test:e2e --debug --workers 1      # Run with debug output, single worker
`)
}

function validateOptions(options) {
  if (!TEST_TYPES[options.type]) {
    console.error(`Invalid test type: ${options.type}`)
    console.error(`Available types: ${Object.keys(TEST_TYPES).join(', ')}`)
    process.exit(1)
  }

  if (!ENVIRONMENTS[options.env]) {
    console.error(`Invalid environment: ${options.env}`)
    console.error(`Available environments: ${Object.keys(ENVIRONMENTS).join(', ')}`)
    process.exit(1)
  }

  if (options.workers && (options.workers < 1 || options.workers > 10)) {
    console.error('Workers must be between 1 and 10')
    process.exit(1)
  }
}

function getTestPattern(type) {
  switch (type) {
    case 'user':
      return '**/user-journey.spec.ts'
    case 'mobile':
      return '**/mobile-*.spec.ts'
    case 'org':
      return '**/organization-workflow.spec.ts'
    case 'smoke':
      return '**/smoke.spec.ts'
    case 'cross':
      return '**/*.spec.ts --project=chromium --project=firefox --project=webkit'
    case 'all':
    default:
      return '**/*.spec.ts'
  }
}

function getBrowserFlags(options) {
  const flags = []
  
  if (options.headed) {
    flags.push('--headed')
  }
  
  if (options.debug) {
    flags.push('--debug')
  }
  
  if (options.workers) {
    flags.push(`--workers=${options.workers}`)
  }
  
  if (options.reporter) {
    flags.push(`--reporter=${options.reporter}`)
  }
  
  return flags
}

function setupEnvironment(env) {
  const baseURL = ENVIRONMENTS[env]
  
  // Set environment variables
  process.env.TEST_BASE_URL = baseURL
  process.env.PLAYWRIGHT_BASE_URL = baseURL
  process.env.TEST_ENV = env
  
  if (env !== 'local') {
    // For non-local environments, we might need special configuration
    process.env.CI = 'true'  // Treat as CI environment
  }
  
  console.log(`🌍 Testing against: ${baseURL}`)
  
  return baseURL
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...')
  
  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' })
    console.log('✅ Playwright is installed')
  } catch (error) {
    console.error('❌ Playwright is not installed. Run: npm install @playwright/test')
    process.exit(1)
  }
  
  // Check if browsers are installed
  try {
    execSync('npx playwright list-browsers', { stdio: 'pipe' })
    console.log('✅ Playwright browsers are installed')
  } catch (error) {
    console.log('⚠️  Installing Playwright browsers...')
    execSync('npx playwright install', { stdio: 'inherit' })
  }
}

function createTestReport(startTime, success) {
  const endTime = Date.now()
  const duration = endTime - startTime
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${Math.round(duration / 1000)}s`,
    success,
    environment: process.env.TEST_ENV,
    baseURL: process.env.TEST_BASE_URL
  }
  
  // Save basic report
  fs.writeFileSync(
    path.join(process.cwd(), 'e2e-summary.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log(`\n📊 Test Summary:`)
  console.log(`   Status: ${success ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`   Duration: ${report.duration}`)
  console.log(`   Environment: ${report.environment}`)
  console.log(`   Base URL: ${report.baseURL}`)
  
  if (fs.existsSync('e2e-results.json')) {
    console.log(`   Detailed Report: e2e-results.json`)
  }
  
  if (fs.existsSync('e2e-report/index.html')) {
    console.log(`   HTML Report: e2e-report/index.html`)
  }
}

function main() {
  const options = parseArgs()
  
  if (options.help) {
    showHelp()
    return
  }
  
  validateOptions(options)
  
  console.log('🎭 NextSaaS E2E Test Runner')
  console.log(`📋 Test Type: ${options.type} (${TEST_TYPES[options.type]})`)
  
  checkPrerequisites()
  setupEnvironment(options.env)
  
  const testPattern = getTestPattern(options.type)
  const browserFlags = getBrowserFlags(options)
  
  console.log(`🚀 Starting E2E tests...`)
  if (options.debug) {
    console.log(`   Pattern: ${testPattern}`)
    console.log(`   Flags: ${browserFlags.join(' ')}`)
  }
  
  const startTime = Date.now()
  let success = false
  
  try {
    // Build the command
    const cmd = [
      'npx playwright test',
      testPattern,
      ...browserFlags
    ].filter(Boolean).join(' ')
    
    if (options.debug) {
      console.log(`🔧 Command: ${cmd}`)
    }
    
    // Run the tests
    execSync(cmd, { 
      stdio: 'inherit',
      env: { ...process.env }
    })
    
    success = true
    console.log('\n🎉 All E2E tests passed!')
    
  } catch (error) {
    success = false
    console.error('\n💥 E2E tests failed!')
    
    if (options.debug) {
      console.error('Error details:', error.message)
    }
    
    // Don't exit with error code immediately, create report first
  }
  
  createTestReport(startTime, success)
  
  // Open HTML report if tests failed and we're in local environment
  if (!success && options.env === 'local' && fs.existsSync('e2e-report/index.html')) {
    console.log('\n📖 Opening test report...')
    try {
      const open = require('open')
      open('e2e-report/index.html')
    } catch (error) {
      console.log('   To view the report, open: e2e-report/index.html')
    }
  }
  
  process.exit(success ? 0 : 1)
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️  Test execution interrupted')
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('\n⏹️  Test execution terminated')
  process.exit(1)
})

if (require.main === module) {
  main()
}

module.exports = { main, parseArgs, validateOptions }