const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { performance } = require('perf_hooks')

// Mock components for benchmarking
const mockComponents = {
  Button: require('../dist/index.js').Button,
  Input: require('../dist/index.js').Input,
  Card: require('../dist/index.js').Card,
  // Add more components as needed
}

// Benchmark configuration
const ITERATIONS = 1000
const WARMUP_ITERATIONS = 100

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
}

// Format time in milliseconds
function formatTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// Benchmark a single component
function benchmarkComponent(name, Component, props = {}) {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    ReactDOMServer.renderToString(React.createElement(Component, props))
  }
  
  // Actual benchmark
  const times = []
  let totalMemory = 0
  
  for (let i = 0; i < ITERATIONS; i++) {
    const memBefore = process.memoryUsage().heapUsed
    const start = performance.now()
    
    ReactDOMServer.renderToString(React.createElement(Component, props))
    
    const end = performance.now()
    const memAfter = process.memoryUsage().heapUsed
    
    times.push(end - start)
    totalMemory += (memAfter - memBefore)
  }
  
  // Calculate statistics
  times.sort((a, b) => a - b)
  const min = times[0]
  const max = times[times.length - 1]
  const median = times[Math.floor(times.length / 2)]
  const mean = times.reduce((a, b) => a + b, 0) / times.length
  const p95 = times[Math.floor(times.length * 0.95)]
  const p99 = times[Math.floor(times.length * 0.99)]
  const avgMemory = totalMemory / ITERATIONS / 1024 // KB
  
  return {
    name,
    min,
    max,
    median,
    mean,
    p95,
    p99,
    avgMemory,
  }
}

// Run benchmarks
async function runBenchmarks() {
  console.log(`${colors.blue}⚡ Running performance benchmarks...${colors.reset}\n`)
  console.log(`Iterations: ${ITERATIONS}`)
  console.log(`Warmup iterations: ${WARMUP_ITERATIONS}\n`)
  
  const results = []
  
  // Benchmark each component
  const components = [
    { name: 'Button', Component: mockComponents.Button, props: { children: 'Click me' } },
    { name: 'Button (with icons)', Component: mockComponents.Button, props: { 
      children: 'Click me',
      leftIcon: React.createElement('span', {}, '←'),
      rightIcon: React.createElement('span', {}, '→'),
    }},
    { name: 'Input', Component: mockComponents.Input, props: { placeholder: 'Enter text' } },
    { name: 'Card', Component: mockComponents.Card, props: { children: 'Card content' } },
  ]
  
  for (const { name, Component, props } of components) {
    if (Component) {
      console.log(`Benchmarking ${name}...`)
      const result = benchmarkComponent(name, Component, props)
      results.push(result)
    }
  }
  
  // Print results table
  console.log(`\n${colors.gray}${'─'.repeat(100)}${colors.reset}`)
  console.log(
    `${colors.gray}│${colors.reset} ${'Component'.padEnd(20)} ` +
    `${colors.gray}│${colors.reset} ${'Mean'.padEnd(10)} ` +
    `${colors.gray}│${colors.reset} ${'Median'.padEnd(10)} ` +
    `${colors.gray}│${colors.reset} ${'P95'.padEnd(10)} ` +
    `${colors.gray}│${colors.reset} ${'P99'.padEnd(10)} ` +
    `${colors.gray}│${colors.reset} ${'Memory'.padEnd(10)} ${colors.gray}│${colors.reset}`
  )
  console.log(`${colors.gray}${'─'.repeat(100)}${colors.reset}`)
  
  for (const result of results) {
    const meanColor = result.mean > 1 ? colors.red : result.mean > 0.5 ? colors.yellow : colors.green
    
    console.log(
      `${colors.gray}│${colors.reset} ${result.name.padEnd(20)} ` +
      `${colors.gray}│${colors.reset} ${meanColor}${formatTime(result.mean).padEnd(10)}${colors.reset} ` +
      `${colors.gray}│${colors.reset} ${formatTime(result.median).padEnd(10)} ` +
      `${colors.gray}│${colors.reset} ${formatTime(result.p95).padEnd(10)} ` +
      `${colors.gray}│${colors.reset} ${formatTime(result.p99).padEnd(10)} ` +
      `${colors.gray}│${colors.reset} ${result.avgMemory.toFixed(1)} KB`.padEnd(10) + ` ${colors.gray}│${colors.reset}`
    )
  }
  
  console.log(`${colors.gray}${'─'.repeat(100)}${colors.reset}`)
  
  // Performance thresholds
  console.log(`\n${colors.blue}🎯 Performance Checks:${colors.reset}`)
  
  const thresholds = {
    mean: 0.5, // 0.5ms mean render time
    p95: 1.0,  // 1ms for 95th percentile
    p99: 2.0,  // 2ms for 99th percentile
    memory: 50, // 50KB average memory
  }
  
  let hasFailures = false
  
  for (const result of results) {
    const meanOk = result.mean <= thresholds.mean
    const p95Ok = result.p95 <= thresholds.p95
    const p99Ok = result.p99 <= thresholds.p99
    const memoryOk = result.avgMemory <= thresholds.memory
    
    const allOk = meanOk && p95Ok && p99Ok && memoryOk
    const icon = allOk ? '✅' : '⚠️'
    const color = allOk ? colors.green : colors.yellow
    
    console.log(`  ${icon} ${result.name}: ${color}${allOk ? 'PASS' : 'NEEDS OPTIMIZATION'}${colors.reset}`)
    
    if (!allOk) {
      if (!meanOk) console.log(`     • Mean time: ${formatTime(result.mean)} (threshold: ${formatTime(thresholds.mean)})`)
      if (!p95Ok) console.log(`     • P95 time: ${formatTime(result.p95)} (threshold: ${formatTime(thresholds.p95)})`)
      if (!p99Ok) console.log(`     • P99 time: ${formatTime(result.p99)} (threshold: ${formatTime(thresholds.p99)})`)
      if (!memoryOk) console.log(`     • Memory: ${result.avgMemory.toFixed(1)} KB (threshold: ${thresholds.memory} KB)`)
      hasFailures = true
    }
  }
  
  // Summary
  console.log(`\n${colors.blue}📊 Performance Summary:${colors.reset}`)
  const avgMean = results.reduce((sum, r) => sum + r.mean, 0) / results.length
  const avgMemory = results.reduce((sum, r) => sum + r.avgMemory, 0) / results.length
  
  console.log(`  • Average render time: ${formatTime(avgMean)}`)
  console.log(`  • Average memory usage: ${avgMemory.toFixed(1)} KB`)
  console.log(`  • Components benchmarked: ${results.length}`)
  
  if (hasFailures) {
    console.log(`\n${colors.yellow}⚠️  Some components need performance optimization${colors.reset}`)
  } else {
    console.log(`\n${colors.green}✅ All components meet performance targets!${colors.reset}`)
  }
}

// Run benchmarks
runBenchmarks().catch((error) => {
  console.error(`${colors.red}Error running benchmarks:${colors.reset}`, error)
  process.exit(1)
})