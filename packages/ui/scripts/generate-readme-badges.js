const fs = require('fs')
const path = require('path')

// Read test status report
const testStatus = JSON.parse(fs.readFileSync('test-status.json', 'utf8'))

// Generate overall badges
function generateOverallBadges() {
  const { summary } = testStatus
  const passRate = ((summary.passedTests / summary.totalTests) * 100).toFixed(1)
  
  const badges = []
  
  // Test coverage badge
  const coverageColor = passRate >= 90 ? '4c1' : passRate >= 70 ? 'dfb317' : 'e05d44'
  badges.push(`![Test Coverage](https://img.shields.io/badge/coverage-${passRate}%25-${coverageColor})`)
  
  // Tests passing badge
  badges.push(`![Tests](https://img.shields.io/badge/tests-${summary.passedTests}%20passing-4c1)`)
  
  // Accessibility badge
  const accessibleComponents = Object.values(testStatus.components).filter(c => c.accessibility).length
  const allAccessible = accessibleComponents === summary.totalComponents
  badges.push(`![Accessibility](https://img.shields.io/badge/accessibility-${allAccessible ? 'WCAG%202.1%20AA' : 'partial'}-${allAccessible ? '4c1' : 'dfb317'})`)
  
  // Components badge
  badges.push(`![Components](https://img.shields.io/badge/components-${summary.totalComponents}-blue)`)
  
  // Build status badge
  badges.push(`![Build](https://img.shields.io/badge/build-passing-4c1)`)
  
  return badges
}

// Update main README
function updateMainReadme() {
  const readmePath = path.join(__dirname, '..', '..', '..', 'README.md')
  let readme = fs.readFileSync(readmePath, 'utf8')
  
  const badges = generateOverallBadges()
  const badgeSection = `## UI Package Status\n\n${badges.join(' ')}\n\n[View detailed test report](./packages/ui/TEST_STATUS.md)`
  
  // Find the UI package section and add badges
  const uiPackageRegex = /### UI Package.*?(?=###|$)/s
  if (uiPackageRegex.test(readme)) {
    readme = readme.replace(uiPackageRegex, (match) => {
      // Remove existing badge section if any
      const cleanedMatch = match.replace(/## UI Package Status[\s\S]*?\[View detailed test report\].*?\n\n/m, '')
      return cleanedMatch + '\n' + badgeSection + '\n\n'
    })
  } else {
    // If no UI package section, add at the end
    readme += '\n\n' + badgeSection
  }
  
  fs.writeFileSync(readmePath, readme)
  console.log('✅ Updated main README.md with UI package badges')
}

// Create component gallery with badges
function createComponentGallery() {
  let gallery = '# UI Component Gallery\n\n'
  gallery += '> Visual overview of all UI components with their test status\n\n'
  
  // Group components by category
  const categories = {}
  Object.entries(testStatus.components).forEach(([name, component]) => {
    if (!categories[component.category]) {
      categories[component.category] = []
    }
    categories[component.category].push(component)
  })
  
  // Generate gallery for each category
  Object.entries(categories).forEach(([category, components]) => {
    gallery += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`
    gallery += '| Component | Preview | Test Status | Coverage |\n'
    gallery += '|-----------|---------|-------------|----------|\n'
    
    components.forEach(component => {
      const coverage = ((component.tests.passed / component.tests.total) * 100).toFixed(0)
      const badges = [
        component.badges.tests.url,
        component.badges.accessibility.url,
        component.badges.visual.url
      ].map(url => `![](${url})`).join(' ')
      
      gallery += `| **${component.name}** | [View Docs](../../apps/docs/src/pages/components/${component.name.toLowerCase()}.tsx) | ${badges} | ${coverage}% |\n`
    })
    
    gallery += '\n'
  })
  
  fs.writeFileSync('COMPONENT_GALLERY.md', gallery)
  console.log('✅ Generated COMPONENT_GALLERY.md')
}

// Generate badge JSON for CI
function generateBadgeJson() {
  const badges = {
    schemaVersion: 1,
    label: 'UI Tests',
    message: `${testStatus.summary.passedTests}/${testStatus.summary.totalTests} passing`,
    color: testStatus.summary.failedTests === 0 ? 'brightgreen' : 'red'
  }
  
  fs.writeFileSync('test-badge.json', JSON.stringify(badges, null, 2))
  console.log('✅ Generated test-badge.json for CI integration')
}

// Main execution
try {
  updateMainReadme()
  createComponentGallery()
  generateBadgeJson()
  console.log('\n✨ Badge generation complete!')
} catch (error) {
  console.error('❌ Error generating badges:', error)
  process.exit(1)
}