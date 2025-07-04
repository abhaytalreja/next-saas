#!/usr/bin/env node
/**
 * Component API Validation Script
 * 
 * Validates that all components follow NextSaaS API standards.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Required props for all components
const REQUIRED_COMPONENT_PROPS = [
  'className',
  'data-testid',
];

// Required accessibility considerations for interactive components
const REQUIRED_ACCESSIBILITY_PROPS = [
  'aria-label',
  'role',
];

// Interactive component types that need accessibility props
const INTERACTIVE_COMPONENTS = [
  'button',
  'input',
  'select',
  'textarea',
  'link',
  'dialog',
  'modal',
];

/**
 * Extracts component information from TypeScript files
 */
function extractComponentInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath, path.extname(filePath));
  const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
  
  // Look for any Props interface (more flexible)
  const interfaceMatch = content.match(new RegExp(`interface\\s+\\w*Props\\s*[^{]*{([^}]+)}`, 's'));
  const componentMatch = content.match(new RegExp(`(export\\s+)?(const|function)\\s+${componentName}`, 'm'));
  
  if (!interfaceMatch || !componentMatch) {
    // Return basic info even if we can't parse everything
    return {
      name: componentName,
      props: {},
      variants: [],
      sizes: [],
      accessibility: [],
      examples: [],
      filePath,
      hasInterface: !!interfaceMatch,
      hasComponent: !!componentMatch
    };
  }
  
  // Extract props from interface
  const propsContent = interfaceMatch[1];
  const propMatches = propsContent.match(/(\w+)(\?)?:\s*([^;]+);?/g) || [];
  
  const props = {};
  const variants = [];
  const sizes = [];
  
  propMatches.forEach(prop => {
    const match = prop.match(/(\w+)(\?)?:\s*([^;]+)/);
    if (match) {
      const [, propName, optional, propType] = match;
      props[propName] = propType.trim();
      
      // Extract variants and sizes
      if (propName === 'variant' && propType.includes('|')) {
        const variantMatches = propType.match(/'([^']+)'/g);
        if (variantMatches) {
          variants.push(...variantMatches.map(v => v.replace(/'/g, '')));
        }
      }
      
      if (propName === 'size' && propType.includes('|')) {
        const sizeMatches = propType.match(/'([^']+)'/g);
        if (sizeMatches) {
          sizes.push(...sizeMatches.map(s => s.replace(/'/g, '')));
        }
      }
    }
  });
  
  // Extract accessibility props
  const accessibilityProps = Object.keys(props).filter(prop => 
    prop.startsWith('aria-') || prop === 'role' || prop === 'tabIndex'
  );
  
  // Extract examples from JSDoc comments
  const exampleMatches = content.match(/@example\s*\n\s*\*\s*```[^`]+```/g) || [];
  const examples = exampleMatches.map(example => 
    example.replace(/@example\s*\n\s*\*\s*```[^`]*\n/, '').replace(/```[^`]*$/, '').trim()
  );
  
  return {
    name: fileName,
    props,
    variants,
    sizes,
    accessibility: accessibilityProps,
    examples,
    filePath
  };
}

/**
 * Validates component API compliance
 */
function validateComponentAPI(component) {
  const errors = [];
  const warnings = [];
  
  // Check required props
  const missingProps = REQUIRED_COMPONENT_PROPS.filter(
    prop => !(prop in component.props)
  );
  
  if (missingProps.length > 0) {
    errors.push(`Missing required props: ${missingProps.join(', ')}`);
  }
  
  // Check accessibility for interactive components
  const isInteractive = INTERACTIVE_COMPONENTS.some(type => 
    component.name.toLowerCase().includes(type)
  );
  
  if (isInteractive) {
    const hasAccessibilityProps = REQUIRED_ACCESSIBILITY_PROPS.some(
      prop => component.accessibility.includes(prop)
    );
    
    if (!hasAccessibilityProps) {
      errors.push('Interactive component must have accessibility props (aria-label, role, etc.)');
    }
  }
  
  // Check for examples
  if (component.examples.length === 0) {
    warnings.push('Component should have usage examples in JSDoc @example tags');
  }
  
  // Check for variants on interactive components
  if (isInteractive && component.variants.length === 0) {
    warnings.push('Interactive component should have variants defined');
  }
  
  // Check props naming conventions
  Object.keys(component.props).forEach(propName => {
    if (propName.includes('_') || propName.includes('-')) {
      errors.push(`Prop name "${propName}" should use camelCase`);
    }
  });
  
  // Check for children prop in container components
  const containerComponents = ['card', 'modal', 'dialog', 'container'];
  const isContainer = containerComponents.some(type => 
    component.name.toLowerCase().includes(type)
  );
  
  if (isContainer && !('children' in component.props)) {
    warnings.push('Container component should accept children prop');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Main validation function
 */
function validateComponents() {
  console.log('🧩 Validating component APIs...');
  
  const componentsDir = path.join(__dirname, '..', 'packages', 'ui', 'src', 'components');
  
  if (!fs.existsSync(componentsDir)) {
    console.error('❌ Components directory not found:', componentsDir);
    process.exit(1);
  }
  
  // Find all component files
  const componentFiles = glob.sync('**/*.tsx', { cwd: componentsDir });
  
  let totalComponents = 0;
  let validComponents = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  componentFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const component = extractComponentInfo(filePath);
    
    if (!component) {
      console.log(`⚠️  Skipping ${file} - could not extract component info`);
      return;
    }
    
    totalComponents++;
    
    const validation = validateComponentAPI(component);
    
    if (validation.valid) {
      validComponents++;
      console.log(`✅ ${component.name}`);
    } else {
      console.log(`❌ ${component.name}`);
      validation.errors.forEach(error => {
        console.log(`   Error: ${error}`);
        totalErrors++;
      });
    }
    
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        console.log(`   Warning: ${warning}`);
        totalWarnings++;
      });
    }
  });
  
  console.log('\n📊 Component API Validation Summary:');
  console.log(`   Total components: ${totalComponents}`);
  console.log(`   Valid components: ${validComponents}`);
  console.log(`   Components with errors: ${totalComponents - validComponents}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  
  if (totalErrors > 0) {
    console.log('\n❌ Component API validation failed');
    process.exit(1);
  } else {
    console.log('\n✅ Component API validation passed!');
    if (totalWarnings > 0) {
      console.log('⚠️  Consider addressing warnings for better component quality');
    }
    process.exit(0);
  }
}

/**
 * CLI execution
 */
function main() {
  validateComponents();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateComponents, validateComponentAPI };