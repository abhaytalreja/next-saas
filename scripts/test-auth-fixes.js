#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('🧪 Running Authentication Fix Tests\n')

// Test configurations
const tests = [
  {
    name: 'Auth Provider Unit Tests',
    command: 'cd packages/auth && npm test -- --testPathPattern=AuthProvider.test.tsx',
    description: 'Tests unified Supabase client usage and auth state management'
  },
  {
    name: 'Protected Layout Unit Tests', 
    command: 'cd packages/auth && npm test -- --testPathPattern=ProtectedLayout.test.tsx',
    description: 'Tests correct route redirects and authentication flow'
  },
  {
    name: 'Project Activity Unit Tests',
    command: 'cd apps/web && npm test -- --testPathPattern=ProjectActivity.test.tsx',
    description: 'Tests database column fixes and user display formatting'
  },
  {
    name: 'Project API Integration Tests',
    command: 'cd apps/web && npm test -- --testPathPattern=project-api.integration.test.ts',
    description: 'Tests API authentication and database access patterns'
  },
  {
    name: 'Authentication E2E Tests',
    command: 'npm run test:e2e -- --grep "Authentication Flow"',
    description: 'Tests complete authentication workflow and fixes'
  }
]

let passedTests = 0
let failedTests = 0
const results = []

console.log('📋 Test Plan:')
tests.forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`)
  console.log(`   ${test.description}`)
})
console.log('')

// Run each test
for (const test of tests) {
  console.log(`🔄 Running: ${test.name}`)
  
  try {
    const startTime = Date.now()
    
    // Execute test command
    execSync(test.command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 60000 // 1 minute timeout
    })
    
    const duration = Date.now() - startTime
    console.log(`✅ PASSED: ${test.name} (${duration}ms)\n`)
    
    passedTests++
    results.push({ ...test, status: 'PASSED', duration })
    
  } catch (error) {
    console.log(`❌ FAILED: ${test.name}`)
    console.log(`   Error: ${error.message}\n`)
    
    failedTests++
    results.push({ ...test, status: 'FAILED', error: error.message })
  }
}

// Print summary
console.log('📊 Test Results Summary')
console.log('='.repeat(50))
console.log(`Total Tests: ${tests.length}`)
console.log(`✅ Passed: ${passedTests}`)
console.log(`❌ Failed: ${failedTests}`)
console.log(`Success Rate: ${Math.round((passedTests / tests.length) * 100)}%`)
console.log('')

// Detailed results
console.log('📝 Detailed Results:')
results.forEach((result, i) => {
  const status = result.status === 'PASSED' ? '✅' : '❌'
  const duration = result.duration ? ` (${result.duration}ms)` : ''
  console.log(`${i + 1}. ${status} ${result.name}${duration}`)
  
  if (result.status === 'FAILED') {
    console.log(`   ${result.error}`)
  }
})

console.log('')

// Exit with appropriate code
if (failedTests > 0) {
  console.log('❌ Some tests failed. Please check the issues above.')
  process.exit(1)
} else {
  console.log('🎉 All authentication fix tests passed!')
  console.log('')
  console.log('✅ Authentication Issues Resolved:')
  console.log('   • Unified Supabase client usage')
  console.log('   • Correct route redirects (/auth/sign-in)')
  console.log('   • Database column fixes (first_name + last_name)')
  console.log('   • Proper user display formatting')
  console.log('   • Session state consistency')
  console.log('   • Module resolution fixes')
  process.exit(0)
}