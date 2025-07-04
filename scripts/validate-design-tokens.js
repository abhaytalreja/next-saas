#!/usr/bin/env node
/**
 * Design Token Validation Script
 * 
 * Validates that design tokens follow NextSaaS standards and conventions.
 */

const fs = require('fs');
const path = require('path');

// Color validation regex
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const SPACING_REGEX = /^\d+(\.\d+)?(px|rem|em)$/;

/**
 * Validates color tokens
 */
function validateColors(colors, path = '') {
  const errors = [];
  
  for (const [key, value] of Object.entries(colors)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string') {
      if (!HEX_COLOR_REGEX.test(value)) {
        errors.push(`Invalid color format at ${currentPath}: ${value}. Expected hex format (#RRGGBB)`);
      }
    } else if (typeof value === 'object' && value !== null) {
      errors.push(...validateColors(value, currentPath));
    }
  }
  
  return errors;
}

/**
 * Validates spacing tokens
 */
function validateSpacing(spacing) {
  const errors = [];
  
  for (const [key, value] of Object.entries(spacing)) {
    if (typeof value === 'string' && key !== '0' && key !== 'px') {
      if (!SPACING_REGEX.test(value)) {
        errors.push(`Invalid spacing format at ${key}: ${value}. Expected format: number + px/rem/em`);
      }
    }
  }
  
  return errors;
}

/**
 * Validates typography tokens
 */
function validateTypography(typography) {
  const errors = [];
  
  // Check font families
  if (typography.fontFamilies) {
    for (const [key, value] of Object.entries(typography.fontFamilies)) {
      if (!Array.isArray(value)) {
        errors.push(`Font family ${key} must be an array of font names`);
      }
    }
  }
  
  // Check font weights
  if (typography.fontWeights) {
    for (const [key, value] of Object.entries(typography.fontWeights)) {
      const numericValue = parseInt(value);
      if (isNaN(numericValue) || numericValue < 100 || numericValue > 900 || numericValue % 100 !== 0) {
        errors.push(`Invalid font weight at ${key}: ${value}. Must be 100-900 in increments of 100`);
      }
    }
  }
  
  return errors;
}

/**
 * Validates component tokens
 */
function validateComponents(components) {
  const errors = [];
  
  for (const [componentName, componentConfig] of Object.entries(components)) {
    if (!componentConfig.variants && !componentConfig.base) {
      errors.push(`Component ${componentName} must have either variants or base configuration`);
    }
    
    if (componentConfig.variants) {
      for (const [variantName, variant] of Object.entries(componentConfig.variants)) {
        // Allow both string and object variants
        if (typeof variant !== 'object' && typeof variant !== 'string') {
          errors.push(`Variant ${variantName} in component ${componentName} must be an object or string`);
        }
      }
    }
  }
  
  return errors;
}

/**
 * Main validation function
 */
function validateDesignTokens(tokensPath) {
  console.log('🎨 Validating design tokens...');
  
  try {
    const tokensContent = fs.readFileSync(tokensPath, 'utf8');
    const tokens = JSON.parse(tokensContent);
    
    const errors = [];
    
    // Validate structure
    if (!tokens.tokens) {
      errors.push('Design tokens file must have a "tokens" property');
      return { valid: false, errors };
    }
    
    const { tokens: designTokens } = tokens;
    
    // Validate colors
    if (designTokens.colors) {
      errors.push(...validateColors(designTokens.colors));
    }
    
    // Validate spacing
    if (designTokens.spacing) {
      errors.push(...validateSpacing(designTokens.spacing));
    }
    
    // Validate typography
    if (designTokens.typography) {
      errors.push(...validateTypography(designTokens.typography));
    }
    
    // Validate components
    if (tokens.components) {
      errors.push(...validateComponents(tokens.components));
    }
    
    // Check for required token categories
    const requiredCategories = ['colors', 'typography', 'spacing'];
    const missingCategories = requiredCategories.filter(category => !designTokens[category]);
    
    if (missingCategories.length > 0) {
      errors.push(`Missing required token categories: ${missingCategories.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
    
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to parse design tokens file: ${error.message}`]
    };
  }
}

/**
 * CLI execution
 */
function main() {
  const tokensPath = path.join(__dirname, '..', 'packages', 'config', 'design-tokens', 'hubspot-tokens.json');
  
  if (!fs.existsSync(tokensPath)) {
    console.error('❌ Design tokens file not found:', tokensPath);
    process.exit(1);
  }
  
  const result = validateDesignTokens(tokensPath);
  
  if (result.valid) {
    console.log('✅ Design tokens validation passed!');
    process.exit(0);
  } else {
    console.error('❌ Design tokens validation failed:');
    result.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateDesignTokens };