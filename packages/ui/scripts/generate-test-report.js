const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Badge colors
const colors = {
  passing: '#4c1',
  failing: '#e05d44',
  skipped: '#dfb317',
  unknown: '#9f9f9f'
}

// Generate badge URL
function generateBadge(label, message, color) {
  const encodedLabel = encodeURIComponent(label)
  const encodedMessage = encodeURIComponent(message)
  return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}`
}

// Parse test results
function parseTestResults() {
  try {
    // Check if test-results.json already exists
    if (!fs.existsSync('test-results.json')) {
      // Run tests with JSON reporter
      const output = execSync('npm test -- --json --outputFile=test-results.json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
    }
  } catch (error) {
    // Tests might fail but we still get the JSON output
  }

  const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'))
  return results
}

// Extract component test results
function extractComponentResults(testResults) {
  const components = {}
  
  testResults.testResults.forEach(suite => {
    // Extract component name from file path
    const filePath = suite.name || ''
    const match = filePath.match(/\/(atoms|molecules|organisms|templates)\/([^\/]+)\/(\w+)\.test\.tsx$/)
    if (match) {
      const [, category, folder, component] = match
      const componentName = component
      
      if (!components[componentName]) {
        components[componentName] = {
          name: componentName,
          category,
          folder,
          tests: {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
          },
          accessibility: false,
          responsive: false,
          performance: false,
          visual: false
        }
      }
      
      // Count test results
      suite.assertionResults.forEach(test => {
        components[componentName].tests.total++
        if (test.status === 'passed') {
          components[componentName].tests.passed++
          
          // Check for specific test types
          if (test.title.toLowerCase().includes('accessibility') || 
              test.title.toLowerCase().includes('no accessibility violations')) {
            components[componentName].accessibility = true
          }
          if (test.title.toLowerCase().includes('responsive') || 
              test.title.toLowerCase().includes('viewport') ||
              test.title.toLowerCase().includes('mobile')) {
            components[componentName].responsive = true
          }
          if (test.title.toLowerCase().includes('performance') || 
              test.title.toLowerCase().includes('render time')) {
            components[componentName].performance = true
          }
        } else if (test.status === 'failed') {
          components[componentName].tests.failed++
        } else if (test.status === 'pending') {
          components[componentName].tests.skipped++
        }
      })
    }
  })
  
  return components
}

// Generate component status badges
function generateComponentBadges(component) {
  const badges = []
  
  // Overall test status
  const testStatus = component.tests.failed > 0 ? 'failing' : 
                    component.tests.passed === component.tests.total ? 'passing' : 
                    'partial'
  const testColor = testStatus === 'passing' ? colors.passing : 
                   testStatus === 'failing' ? colors.failing : 
                   colors.skipped
  const testMessage = `${component.tests.passed}/${component.tests.total} tests`
  badges.push({
    type: 'tests',
    url: generateBadge('tests', testMessage, testColor),
    status: testStatus
  })
  
  // Accessibility badge
  badges.push({
    type: 'accessibility',
    url: generateBadge('accessibility', component.accessibility ? 'passing' : 'pending', 
                      component.accessibility ? colors.passing : colors.unknown),
    status: component.accessibility ? 'passing' : 'pending'
  })
  
  // Responsive badge
  badges.push({
    type: 'responsive',
    url: generateBadge('responsive', component.responsive ? 'tested' : 'pending',
                      component.responsive ? colors.passing : colors.unknown),
    status: component.responsive ? 'tested' : 'pending'
  })
  
  // Performance badge
  badges.push({
    type: 'performance',
    url: generateBadge('performance', component.performance ? 'optimized' : 'untested',
                      component.performance ? colors.passing : colors.unknown),
    status: component.performance ? 'optimized' : 'untested'
  })
  
  // Visual tests badge (check if visual test file exists)
  const visualTestPath = path.join(
    'src',
    component.category,
    component.folder,
    `${component.name}.visual.test.ts`
  )
  const hasVisualTests = fs.existsSync(visualTestPath)
  badges.push({
    type: 'visual',
    url: generateBadge('visual', hasVisualTests ? 'tested' : 'pending',
                      hasVisualTests ? colors.passing : colors.unknown),
    status: hasVisualTests ? 'tested' : 'pending'
  })
  
  return badges
}

// Generate markdown table
function generateMarkdownTable(components) {
  let markdown = '# UI Component Test Status\n\n'
  markdown += '> Auto-generated test status report. Last updated: ' + new Date().toISOString() + '\n\n'
  
  markdown += '## Test Coverage Summary\n\n'
  markdown += '| Component | Tests | Accessibility | Responsive | Performance | Visual |\n'
  markdown += '|-----------|-------|---------------|------------|-------------|--------|\n'
  
  Object.values(components).forEach(component => {
    const badges = generateComponentBadges(component)
    const row = [
      component.name,
      ...badges.map(b => `![${b.type}](${b.url})`)
    ]
    markdown += '| ' + row.join(' | ') + ' |\n'
  })
  
  markdown += '\n## Component Details\n\n'
  
  Object.values(components).forEach(component => {
    markdown += `### ${component.name}\n\n`
    markdown += `- **Category**: ${component.category}\n`
    markdown += `- **Tests**: ${component.tests.passed} passing, ${component.tests.failed} failing, ${component.tests.skipped} skipped\n`
    markdown += `- **Test Coverage**: ${((component.tests.passed / component.tests.total) * 100).toFixed(1)}%\n`
    markdown += '\n'
  })
  
  return markdown
}

// Generate JSON report
function generateJSONReport(components) {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      totalComponents: Object.keys(components).length,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0
    },
    components: {}
  }
  
  Object.entries(components).forEach(([name, component]) => {
    report.summary.totalTests += component.tests.total
    report.summary.passedTests += component.tests.passed
    report.summary.failedTests += component.tests.failed
    report.summary.skippedTests += component.tests.skipped
    
    const badges = generateComponentBadges(component)
    report.components[name] = {
      ...component,
      badges: badges.reduce((acc, badge) => {
        acc[badge.type] = {
          status: badge.status,
          url: badge.url
        }
        return acc
      }, {})
    }
  })
  
  return report
}

// Generate component README badges
function generateComponentReadme(component) {
  const badges = generateComponentBadges(component)
  let readme = `## Test Status\n\n`
  
  badges.forEach(badge => {
    readme += `![${badge.type}](${badge.url}) `
  })
  readme += '\n\n'
  
  readme += '### Test Results\n\n'
  readme += `- **Total Tests**: ${component.tests.total}\n`
  readme += `- **Passed**: ${component.tests.passed}\n`
  readme += `- **Failed**: ${component.tests.failed}\n`
  readme += `- **Skipped**: ${component.tests.skipped}\n`
  readme += `- **Coverage**: ${((component.tests.passed / component.tests.total) * 100).toFixed(1)}%\n`
  
  return readme
}

// Main function
async function generateTestReport() {
  console.log('📊 Generating test report...')
  
  try {
    // Parse test results
    const testResults = parseTestResults()
    const components = extractComponentResults(testResults)
    
    // Generate reports
    const markdownReport = generateMarkdownTable(components)
    const jsonReport = generateJSONReport(components)
    
    // Write main report
    fs.writeFileSync('TEST_STATUS.md', markdownReport)
    console.log('✅ Generated TEST_STATUS.md')
    
    // Write JSON report
    fs.writeFileSync('test-status.json', JSON.stringify(jsonReport, null, 2))
    console.log('✅ Generated test-status.json')
    
    // Update component READMEs
    Object.entries(components).forEach(([name, component]) => {
      const readmePath = path.join(
        'src',
        component.category,
        component.folder,
        'README.md'
      )
      
      try {
        let readme = ''
        if (fs.existsSync(readmePath)) {
          readme = fs.readFileSync(readmePath, 'utf8')
          // Remove existing test status section
          readme = readme.replace(/## Test Status[\s\S]*?(?=##|$)/m, '')
        } else {
          readme = `# ${component.name} Component\n\n`
        }
        
        // Add test status
        readme += '\n' + generateComponentReadme(component)
        
        fs.writeFileSync(readmePath, readme)
        console.log(`✅ Updated ${readmePath}`)
      } catch (error) {
        console.error(`❌ Failed to update ${readmePath}:`, error.message)
      }
    })
    
    // Clean up
    fs.unlinkSync('test-results.json')
    
    console.log('\n📋 Test Report Summary:')
    console.log(`- Total Components: ${jsonReport.summary.totalComponents}`)
    console.log(`- Total Tests: ${jsonReport.summary.totalTests}`)
    console.log(`- Passed: ${jsonReport.summary.passedTests}`)
    console.log(`- Failed: ${jsonReport.summary.failedTests}`)
    console.log(`- Skipped: ${jsonReport.summary.skippedTests}`)
    console.log(`- Pass Rate: ${((jsonReport.summary.passedTests / jsonReport.summary.totalTests) * 100).toFixed(1)}%`)
    
  } catch (error) {
    console.error('❌ Failed to generate test report:', error)
    process.exit(1)
  }
}

// Run report generation
generateTestReport()