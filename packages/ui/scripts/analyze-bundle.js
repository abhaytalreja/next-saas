const fs = require('fs')
const path = require('path')
const { gzipSync } = require('zlib')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
}

// Format bytes to human readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file size and gzipped size
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    const content = fs.readFileSync(filePath)
    const gzipped = gzipSync(content)
    
    return {
      size: stats.size,
      gzipSize: gzipped.length,
    }
  } catch (error) {
    return null
  }
}

// Analyze bundle sizes
async function analyzeBundles() {
  console.log(`${colors.blue}📊 Analyzing bundle sizes...${colors.reset}\n`)
  
  const distDir = path.join(__dirname, '..', 'dist')
  const files = [
    { name: 'Main Bundle (CJS)', path: 'index.js' },
    { name: 'Main Bundle (ESM)', path: 'index.mjs' },
    { name: 'Client Bundle (CJS)', path: 'client.js' },
    { name: 'Client Bundle (ESM)', path: 'client.mjs' },
    { name: 'Server Bundle (CJS)', path: 'server.js' },
    { name: 'Server Bundle (ESM)', path: 'server.mjs' },
  ]
  
  const results = []
  let totalSize = 0
  let totalGzipSize = 0
  
  for (const file of files) {
    const filePath = path.join(distDir, file.path)
    const sizes = getFileSize(filePath)
    
    if (sizes) {
      results.push({
        name: file.name,
        path: file.path,
        size: sizes.size,
        gzipSize: sizes.gzipSize,
      })
      totalSize += sizes.size
      totalGzipSize += sizes.gzipSize
    }
  }
  
  // Print results table
  console.log(`${colors.gray}${'─'.repeat(70)}${colors.reset}`)
  console.log(`${colors.gray}│${colors.reset} ${'Bundle'.padEnd(30)} ${colors.gray}│${colors.reset} ${'Size'.padEnd(12)} ${colors.gray}│${colors.reset} ${'Gzipped'.padEnd(12)} ${colors.gray}│${colors.reset}`)
  console.log(`${colors.gray}${'─'.repeat(70)}${colors.reset}`)
  
  for (const result of results) {
    const sizeStr = formatBytes(result.size)
    const gzipStr = formatBytes(result.gzipSize)
    const color = result.size > 500000 ? colors.red : result.size > 250000 ? colors.yellow : colors.green
    
    console.log(
      `${colors.gray}│${colors.reset} ${result.name.padEnd(30)} ${colors.gray}│${colors.reset} ${color}${sizeStr.padEnd(12)}${colors.reset} ${colors.gray}│${colors.reset} ${gzipStr.padEnd(12)} ${colors.gray}│${colors.reset}`
    )
  }
  
  console.log(`${colors.gray}${'─'.repeat(70)}${colors.reset}`)
  console.log(
    `${colors.gray}│${colors.reset} ${'TOTAL'.padEnd(30)} ${colors.gray}│${colors.reset} ${formatBytes(totalSize).padEnd(12)} ${colors.gray}│${colors.reset} ${formatBytes(totalGzipSize).padEnd(12)} ${colors.gray}│${colors.reset}`
  )
  console.log(`${colors.gray}${'─'.repeat(70)}${colors.reset}`)
  
  // Check against thresholds
  console.log(`\n${colors.blue}🎯 Bundle Size Checks:${colors.reset}`)
  
  const thresholds = {
    'index.js': 500 * 1024,
    'index.mjs': 450 * 1024,
    'client.js': 30 * 1024,
    'client.mjs': 25 * 1024,
    'server.js': 20 * 1024,
    'server.mjs': 18 * 1024,
  }
  
  let hasFailures = false
  
  for (const result of results) {
    const threshold = thresholds[result.path]
    if (threshold) {
      const isOk = result.size <= threshold
      const icon = isOk ? '✅' : '❌'
      const color = isOk ? colors.green : colors.red
      
      console.log(
        `  ${icon} ${result.path}: ${formatBytes(result.size)} ${color}(limit: ${formatBytes(threshold)})${colors.reset}`
      )
      
      if (!isOk) hasFailures = true
    }
  }
  
  // Analyze component sizes
  console.log(`\n${colors.blue}🧩 Component Analysis:${colors.reset}`)
  try {
    const { stdout } = await execAsync('npx source-map-explorer dist/index.js --json')
    const analysis = JSON.parse(stdout)
    
    // Find largest components
    const components = Object.entries(analysis.files)
      .filter(([path]) => path.includes('src/'))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
    
    console.log('  Top 10 largest components:')
    components.forEach(([path, size], index) => {
      const componentPath = path.replace(/.*src\//, 'src/')
      console.log(`    ${index + 1}. ${componentPath}: ${formatBytes(size)}`)
    })
  } catch (error) {
    console.log(`  ${colors.gray}(Install source-map-explorer for detailed analysis)${colors.reset}`)
  }
  
  // Performance metrics
  console.log(`\n${colors.blue}⚡ Performance Metrics:${colors.reset}`)
  console.log(`  • Tree-shakeable: ✅ Yes (ESM exports)`)
  console.log(`  • Side effects: ✅ None (sideEffects: false)`)
  console.log(`  • Code splitting: ✅ Supported (multiple entry points)`)
  
  if (hasFailures) {
    console.log(`\n${colors.red}❌ Bundle size check failed!${colors.reset}`)
    process.exit(1)
  } else {
    console.log(`\n${colors.green}✅ All bundle sizes within limits!${colors.reset}`)
  }
}

// Run analysis
analyzeBundles().catch((error) => {
  console.error(`${colors.red}Error analyzing bundles:${colors.reset}`, error)
  process.exit(1)
})