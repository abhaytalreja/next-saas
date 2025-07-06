#!/usr/bin/env node

/**
 * Check for packages with disabled linting and enforce governance rules
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Find all package.json files
const packageJsonFiles = glob.sync('**/package.json', {
  ignore: ['node_modules/**', '**/node_modules/**', 'dist/**']
});

const disabledLintingPackages = [];
const disabledTestPackages = [];
const disabledTypeCheckPackages = [];

// Check each package for disabled linting
packageJsonFiles.forEach(packagePath => {
  try {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const packageName = packageContent.name;
    const packageDir = path.dirname(packagePath);
    
    if (!packageName) return; // Skip packages without names
    
    // Check for disabled linting
    const lintScript = packageContent.scripts?.lint;
    const typeCheckScript = packageContent.scripts?.['type-check'];
    const testScript = packageContent.scripts?.test;
    
    if (lintScript && lintScript.includes('echo') && lintScript.includes('disabled')) {
      disabledLintingPackages.push({
        name: packageName,
        path: packagePath,
        reason: lintScript
      });
    }
    
    if (typeCheckScript && typeCheckScript.includes('echo') && typeCheckScript.includes('disabled')) {
      disabledTypeCheckPackages.push({
        name: packageName,
        path: packagePath,
        reason: typeCheckScript
      });
    }
    
    if (testScript && testScript.includes('echo') && testScript.includes('disabled')) {
      disabledTestPackages.push({
        name: packageName,
        path: packagePath,
        reason: testScript
      });
    }
    
  } catch (error) {
    // Skip invalid package.json files
  }
});

// Display results
console.log(`${colors.bold}🛡️  Lint Governance Check${colors.reset}\n`);

if (disabledLintingPackages.length === 0 && disabledTestPackages.length === 0 && disabledTypeCheckPackages.length === 0) {
  log('green', '✅ All packages have linting, type checking, and tests enabled!');
  process.exit(0);
}

// Show disabled linting
if (disabledLintingPackages.length > 0) {
  log('red', `❌ ${disabledLintingPackages.length} packages have disabled linting:`);
  disabledLintingPackages.forEach(pkg => {
    console.log(`   • ${pkg.name} (${pkg.path})`);
  });
  console.log();
}

// Show disabled type checking
if (disabledTypeCheckPackages.length > 0) {
  log('yellow', `⚠️  ${disabledTypeCheckPackages.length} packages have disabled type checking:`);
  disabledTypeCheckPackages.forEach(pkg => {
    console.log(`   • ${pkg.name} (${pkg.path})`);
  });
  console.log();
}

// Show disabled tests
if (disabledTestPackages.length > 0) {
  log('yellow', `⚠️  ${disabledTestPackages.length} packages have disabled tests:`);
  disabledTestPackages.forEach(pkg => {
    console.log(`   • ${pkg.name} (${pkg.path})`);
  });
  console.log();
}

// Enforcement rules
log('blue', '📋 Governance Rules:');
console.log('   1. Before modifying any package above, attempt to re-enable linting');
console.log('   2. Include linting status in your PR description'); 
console.log('   3. Update docs/LINT_GOVERNANCE.md with your changes');
console.log('   4. Set target fix dates for any remaining disabled checks');
console.log();

log('blue', '🔧 Quick Fix Commands:');
console.log('   # Test if linting can be re-enabled:');
disabledLintingPackages.slice(0, 3).forEach(pkg => {
  const packageDir = path.dirname(pkg.path);
  console.log(`   npm run lint --filter=${pkg.name}`);
});

if (disabledLintingPackages.length > 3) {
  console.log(`   ... and ${disabledLintingPackages.length - 3} more packages`);
}

console.log();
log('blue', '📖 See docs/LINT_GOVERNANCE.md for detailed instructions');

// Exit with warning code to indicate disabled linting exists
process.exit(1);