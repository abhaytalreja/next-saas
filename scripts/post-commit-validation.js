#!/usr/bin/env node

/**
 * Post-commit validation script for NextSaaS
 * Runs comprehensive validation after each commit and updates roadmap
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running post-commit validation...');

// Run validation scripts
const validationChecks = [
  {
    name: 'Type Check',
    command: 'npm run type-check',
    required: true
  },
  {
    name: 'Lint Check',
    command: 'npm run lint',
    required: true
  },
  {
    name: 'Design Tokens',
    command: 'npm run validate:design-tokens',
    required: false
  },
  {
    name: 'Component APIs',
    command: 'npm run validate:components',
    required: false
  },
  {
    name: 'Bundle Size',
    command: 'npm run bundle:check',
    required: false
  }
];

let allPassed = true;
const results = [];

for (const check of validationChecks) {
  try {
    console.log(`\n🔍 Running ${check.name}...`);
    execSync(check.command, { stdio: 'inherit' });
    results.push({ name: check.name, status: 'passed' });
    console.log(`✅ ${check.name} passed`);
  } catch (error) {
    const failed = check.required;
    results.push({ name: check.name, status: failed ? 'failed' : 'warning' });
    console.log(`${failed ? '❌' : '⚠️'} ${check.name} ${failed ? 'failed' : 'warning'}`);
    if (failed) allPassed = false;
  }
}

// Get commit info
const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
const commitMessage = execSync('git log -1 --pretty=%s', { encoding: 'utf8' }).trim();

// Update roadmap with validation results
updateRoadmap(commitHash, commitMessage, results);

if (allPassed) {
  console.log('\n🎉 All validation checks passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some validation checks failed. Please review and fix.');
  process.exit(1);
}

function updateRoadmap(commitHash, commitMessage, results) {
  const roadmapPath = path.join(process.cwd(), 'ROADMAP.md');
  
  if (!fs.existsSync(roadmapPath)) {
    console.log('⚠️ ROADMAP.md not found, skipping update');
    return;
  }

  const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Create validation summary
  const validationSummary = results.map(r => 
    `  - ${r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⚠️'} ${r.name}`
  ).join('\n');

  // Add entry to recently completed section
  const newEntry = `
### ✅ Commit ${commitHash} (${timestamp})
**${commitMessage}**

**Validation Results:**
${validationSummary}

`;

  // Insert after "## 🚀 Recently Completed" section
  const updatedContent = roadmapContent.replace(
    /## 🚀 Recently Completed\n/,
    `## 🚀 Recently Completed\n${newEntry}`
  );

  fs.writeFileSync(roadmapPath, updatedContent);
  console.log(`📝 Updated ROADMAP.md with validation results for commit ${commitHash}`);
}