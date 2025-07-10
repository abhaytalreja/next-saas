#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * Script to run authentication E2E tests with proper setup and cleanup
 */

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, colors.red)
}

function success(message) {
  log(`✅ ${message}`, colors.green)
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

async function checkPrerequisites() {
  log(`${colors.bold}📋 Checking Prerequisites${colors.reset}`)
  
  // Check if Node.js version is compatible
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (majorVersion < 18) {
    error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`)
    process.exit(1)
  }
  
  success(`Node.js version ${nodeVersion} is compatible`)
  
  // Check if Playwright is installed
  try {
    await runCommand('npx', ['playwright', '--version'], { stdio: 'pipe' })
    success('Playwright is installed')
  } catch (err) {
    error('Playwright is not installed. Run: npm install -D @playwright/test')
    process.exit(1)
  }
  
  // Check if application dependencies are installed
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    error('Dependencies not installed. Run: npm install')
    process.exit(1)
  }
  
  success('All dependencies are installed')
  
  // Check if .env files exist
  const envFiles = ['.env.local', '.env.test']
  for (const envFile of envFiles) {
    if (!fs.existsSync(path.join(process.cwd(), envFile))) {
      warning(`${envFile} not found. Some tests may fail without proper configuration.`)
    }
  }
  
  info('Prerequisites check completed')
}

async function setupTestEnvironment() {
  log(`${colors.bold}🔧 Setting Up Test Environment${colors.reset}`)
  
  try {
    // Set up test database
    info('Setting up test database...')
    await runCommand('npm', ['run', 'test:e2e:setup'])
    success('Test database setup completed')
    
    // Install Playwright browsers if needed
    info('Installing Playwright browsers...')
    await runCommand('npx', ['playwright', 'install'])
    success('Playwright browsers installed')
    
  } catch (err) {
    error(`Failed to set up test environment: ${err.message}`)
    process.exit(1)
  }
}

async function runAuthTests(options = {}) {
  log(`${colors.bold}🧪 Running Authentication E2E Tests${colors.reset}`)
  
  const args = [
    'test',
    'e2e/auth/',
    '--config=e2e/playwright.config.ts'
  ]
  
  // Add options based on arguments
  if (options.headed) {
    args.push('--headed')
  }
  
  if (options.debug) {
    args.push('--debug')
  }
  
  if (options.workers) {
    args.push(`--workers=${options.workers}`)
  }
  
  if (options.browser) {
    args.push(`--project=${options.browser}`)
  }
  
  if (options.grep) {
    args.push(`--grep=${options.grep}`)
  }
  
  if (options.reporter) {
    args.push(`--reporter=${options.reporter}`)
  } else {
    args.push('--reporter=line,html')
  }
  
  try {
    await runCommand('npx', ['playwright', ...args])
    success('Authentication tests completed successfully')
  } catch (err) {
    error(`Authentication tests failed: ${err.message}`)
    return false
  }
  
  return true
}

async function cleanup() {
  log(`${colors.bold}🧹 Cleaning Up Test Environment${colors.reset}`)
  
  try {
    await runCommand('npm', ['run', 'test:e2e:cleanup'])
    success('Test environment cleanup completed')
  } catch (err) {
    warning(`Cleanup failed: ${err.message}`)
  }
}

async function generateReport() {
  log(`${colors.bold}📊 Generating Test Report${colors.reset}`)
  
  try {
    info('Opening test report...')
    await runCommand('npx', ['playwright', 'show-report'])
  } catch (err) {
    warning(`Failed to open test report: ${err.message}`)
    info('You can manually open the report by running: npx playwright show-report')
  }
}

function printUsage() {
  console.log(`
${colors.bold}Authentication E2E Test Runner${colors.reset}

Usage: node scripts/run-auth-e2e.js [options]

Options:
  --headed          Run tests in headed mode (show browser)
  --debug          Run tests in debug mode
  --workers=N      Number of workers to use (default: auto)
  --browser=NAME   Run tests only on specific browser (chromium, firefox, webkit)
  --grep=PATTERN   Run tests matching pattern
  --reporter=TYPE  Test reporter (html, json, line, etc.)
  --no-setup       Skip test environment setup
  --no-cleanup     Skip test environment cleanup
  --no-report      Skip opening test report
  --help           Show this help message

Examples:
  node scripts/run-auth-e2e.js
  node scripts/run-auth-e2e.js --headed --browser=chromium
  node scripts/run-auth-e2e.js --debug --grep="registration"
  node scripts/run-auth-e2e.js --workers=1 --no-setup
`)
}

async function main() {
  const args = process.argv.slice(2)
  
  // Parse command line arguments
  const options = {
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    noSetup: args.includes('--no-setup'),
    noCleanup: args.includes('--no-cleanup'),
    noReport: args.includes('--no-report'),
    help: args.includes('--help')
  }
  
  // Extract value arguments
  const workersArg = args.find(arg => arg.startsWith('--workers='))
  if (workersArg) {
    options.workers = workersArg.split('=')[1]
  }
  
  const browserArg = args.find(arg => arg.startsWith('--browser='))
  if (browserArg) {
    options.browser = browserArg.split('=')[1]
  }
  
  const grepArg = args.find(arg => arg.startsWith('--grep='))
  if (grepArg) {
    options.grep = grepArg.split('=')[1]
  }
  
  const reporterArg = args.find(arg => arg.startsWith('--reporter='))
  if (reporterArg) {
    options.reporter = reporterArg.split('=')[1]
  }
  
  if (options.help) {
    printUsage()
    return
  }
  
  log(`${colors.bold}🚀 Starting Authentication E2E Test Suite${colors.reset}`)
  
  try {
    // Check prerequisites
    await checkPrerequisites()
    
    // Setup test environment (unless skipped)
    if (!options.noSetup) {
      await setupTestEnvironment()
    }
    
    // Run authentication tests
    const testsPassed = await runAuthTests(options)
    
    // Cleanup (unless skipped)
    if (!options.noCleanup) {
      await cleanup()
    }
    
    // Generate report (unless skipped)
    if (!options.noReport && testsPassed) {
      await generateReport()
    }
    
    if (testsPassed) {
      success('🎉 All authentication tests passed!')
    } else {
      error('❌ Some authentication tests failed')
      process.exit(1)
    }
    
  } catch (err) {
    error(`Test execution failed: ${err.message}`)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

// Run the main function
main().catch((err) => {
  error(`Script failed: ${err.message}`)
  process.exit(1)
})