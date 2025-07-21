#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 NextSaaS 5-Minute Setup Validation\n')

const tests = [
  {
    name: 'Database SQL Generation',
    check: () => {
      console.log('📊 Testing database SQL generation...')
      
      // Test all modes
      const modes = ['none', 'single', 'multi']
      const results = []
      
      modes.forEach(mode => {
        try {
          execSync(`node scripts/generate-database-sql.js --mode ${mode}`, { stdio: 'pipe' })
          
          // Check output file exists and has required tables
          const sqlFile = `database-${mode}.sql`
          if (fs.existsSync(sqlFile)) {
            const content = fs.readFileSync(sqlFile, 'utf8')
            
            // Check for essential authentication tables and fields
            const requiredElements = [
              'CREATE TABLE IF NOT EXISTS profiles',
              'first_name text',
              'last_name text',
              'CREATE TABLE IF NOT EXISTS activities',
              'user_id uuid NOT NULL REFERENCES auth.users(id)',
              'ALTER TABLE activities ENABLE ROW LEVEL SECURITY'
            ]
            
            const missing = requiredElements.filter(element => !content.includes(element))
            
            if (missing.length === 0) {
              results.push({ mode, success: true })
              console.log(`  ✅ ${mode} mode: Generated successfully`)
            } else {
              results.push({ mode, success: false, missing })
              console.log(`  ❌ ${mode} mode: Missing elements: ${missing.join(', ')}`)
            }
          } else {
            results.push({ mode, success: false, error: 'Output file not created' })
            console.log(`  ❌ ${mode} mode: Output file not created`)
          }
        } catch (error) {
          results.push({ mode, success: false, error: error.message })
          console.log(`  ❌ ${mode} mode: Generation failed`)
        }
      })
      
      return results.every(r => r.success)
    }
  },
  {
    name: 'Package Builds',
    check: () => {
      console.log('📦 Testing package builds...')
      
      const packages = [
        'packages/supabase',
        'packages/auth'
      ]
      
      const results = []
      
      packages.forEach(pkg => {
        try {
          const packagePath = path.join(process.cwd(), pkg)
          if (fs.existsSync(packagePath)) {
            execSync(`cd ${pkg} && npm run build`, { stdio: 'pipe' })
            results.push({ package: pkg, success: true })
            console.log(`  ✅ ${pkg}: Build successful`)
          } else {
            results.push({ package: pkg, success: false, error: 'Package not found' })
            console.log(`  ❌ ${pkg}: Package not found`)
          }
        } catch (error) {
          results.push({ package: pkg, success: false, error: 'Build failed' })
          console.log(`  ❌ ${pkg}: Build failed`)
        }
      })
      
      return results.every(r => r.success)
    }
  },
  {
    name: 'Authentication Files',
    check: () => {
      console.log('🔐 Checking authentication files...')
      
      const criticalFiles = [
        'packages/auth/src/providers/AuthProvider.tsx',
        'packages/auth/src/middleware/auth-middleware.ts',
        'packages/auth/src/components/layouts/ProtectedLayout.tsx',
        'packages/supabase/src/client/browser.ts',
        'packages/supabase/src/client/server.ts',
        'packages/supabase/src/client/middleware.ts'
      ]
      
      const results = []
      
      criticalFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          
          // Check for critical authentication patterns
          let hasRequiredPattern = false
          
          if (file.includes('AuthProvider.tsx')) {
            hasRequiredPattern = content.includes('@nextsaas/supabase')
          } else if (file.includes('auth-middleware.ts')) {
            hasRequiredPattern = content.includes('/auth/sign-in')
          } else if (file.includes('ProtectedLayout.tsx')) {
            hasRequiredPattern = content.includes('/auth/sign-in')
          } else {
            hasRequiredPattern = true // Other files just need to exist
          }
          
          if (hasRequiredPattern) {
            results.push({ file, success: true })
            console.log(`  ✅ ${file}: Exists with correct patterns`)
          } else {
            results.push({ file, success: false, error: 'Missing required patterns' })
            console.log(`  ❌ ${file}: Missing required authentication patterns`)
          }
        } else {
          results.push({ file, success: false, error: 'File not found' })
          console.log(`  ❌ ${file}: File not found`)
        }
      })
      
      return results.every(r => r.success)
    }
  },
  {
    name: 'Configuration Files',
    check: () => {
      console.log('⚙️ Checking configuration files...')
      
      const configFiles = [
        { file: 'apps/web/tsconfig.json', pattern: '"@/*": ["./src/*"]' },
        { file: 'apps/web/middleware.ts', pattern: 'authMiddleware' },
        { file: 'turbo.json', pattern: 'tasks' }
      ]
      
      const results = []
      
      configFiles.forEach(({ file, pattern }) => {
        const filePath = path.join(process.cwd(), file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          if (content.includes(pattern)) {
            results.push({ file, success: true })
            console.log(`  ✅ ${file}: Configuration correct`)
          } else {
            results.push({ file, success: false, error: `Missing pattern: ${pattern}` })
            console.log(`  ❌ ${file}: Missing required pattern`)
          }
        } else {
          results.push({ file, success: false, error: 'File not found' })
          console.log(`  ❌ ${file}: File not found`)
        }
      })
      
      return results.every(r => r.success)
    }
  }
]

// Run all tests
let allPassed = true
const results = []

console.log('Running validation tests...\n')

tests.forEach(test => {
  const passed = test.check()
  results.push({ name: test.name, passed })
  if (!passed) allPassed = false
  console.log()
})

// Summary
console.log('📋 Validation Summary:')
console.log('='.repeat(50))

results.forEach(result => {
  const status = result.passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}: ${result.name}`)
})

console.log('='.repeat(50))

if (allPassed) {
  console.log('🎉 All tests passed! Your NextSaaS setup is ready for 5-minute deployment!')
  console.log('\nNext steps:')
  console.log('1. Create a new Supabase project')
  console.log('2. Run the generated SQL (database-single.sql recommended for most users)')
  console.log('3. Set environment variables in .env.local')
  console.log('4. Run npm run dev')
  process.exit(0)
} else {
  console.log('❌ Some validation tests failed. Please fix the issues above.')
  console.log('\nFor help, check:')
  console.log('- docs/AUTHENTICATION_TROUBLESHOOTING.md')
  console.log('- CLAUDE.md for development patterns')
  process.exit(1)
}