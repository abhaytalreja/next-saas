#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

const CONFIG_PATH = path.join(__dirname, '..', 'playwright.config.ts')

console.log('🧪 Running Profile Management E2E Tests')
console.log('=' .repeat(50))

const playwrightArgs = [
  'test',
  '--config', CONFIG_PATH,
  'e2e/profile/',
  '--reporter=list',
  '--max-failures=3'
]

if (process.argv.includes('--headed')) {
  playwrightArgs.push('--headed')
}

if (process.argv.includes('--debug')) {
  playwrightArgs.push('--debug')
}

if (process.argv.includes('--ui')) {
  playwrightArgs.push('--ui')
}

const project = process.argv.find(arg => arg.startsWith('--project='))
if (project) {
  playwrightArgs.push(project)
}

console.log(`Running: npx playwright ${playwrightArgs.join(' ')}\n`)

const child = spawn('npx', ['playwright', ...playwrightArgs], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
})

child.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ Profile E2E tests completed successfully!')
  } else {
    console.log(`\n❌ Profile E2E tests failed with exit code: ${code}`)
  }
  process.exit(code)
})

child.on('error', (error) => {
  console.error('Failed to start profile E2E tests:', error)
  process.exit(1)
})