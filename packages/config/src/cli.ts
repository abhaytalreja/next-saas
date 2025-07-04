#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig, validateConfig, exportConfig, getCurrentEnvironment, type Environment, type BaseConfig } from './loader';
import { generateEnvVarDefinitions, validateEnvVars, sanitizeConfig, getConfigSummary, formatConfigForDisplay } from './utils';

/**
 * Configuration CLI Tool
 * 
 * This module provides command-line interface for configuration management.
 * It includes commands for validation, export, inspection, and environment
 * variable management.
 */

const program = new Command();

program
  .name('config-cli')
  .description('NextSaaS Configuration Management CLI')
  .version('1.0.0');

/**
 * Load and display configuration
 */
program
  .command('load')
  .description('Load and display configuration')
  .option('-e, --env <environment>', 'Environment to load', getCurrentEnvironment())
  .option('-s, --sanitize', 'Sanitize sensitive data', false)
  .option('-v, --validate', 'Validate configuration', true)
  .action(async (options) => {
    try {
      console.log(`Loading configuration for environment: ${options.env}`);
      
      const result = await loadConfig({
        environment: options.env as Environment,
        validate: options.validate,
        throwOnError: false,
      });
      
      if (result.validationErrors.length > 0) {
        console.error('Validation Errors:');
        result.validationErrors.forEach(error => console.error(`  - ${error}`));
      }
      
      if (result.missingEnvVars.length > 0) {
        console.error('Missing Environment Variables:');
        result.missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
      }
      
      if (result.warnings.length > 0) {
        console.warn('Warnings:');
        result.warnings.forEach(warning => console.warn(`  - ${warning}`));
      }
      
      const configToDisplay = options.sanitize ? sanitizeConfig(result.config) : result.config;
      console.log('\nConfiguration:');
      console.log(formatConfigForDisplay(configToDisplay as BaseConfig));
      
    } catch (error) {
      console.error('Failed to load configuration:', error);
      process.exit(1);
    }
  });

/**
 * Validate configuration
 */
program
  .command('validate')
  .description('Validate configuration')
  .option('-e, --env <environment>', 'Environment to validate', getCurrentEnvironment())
  .option('-f, --file <file>', 'Configuration file to validate')
  .action(async (options) => {
    try {
      let config;
      
      if (options.file) {
        // Load from file
        const fs = await import('fs');
        const configData = JSON.parse(fs.readFileSync(options.file, 'utf8'));
        const result = await validateConfig(configData);
        
        if (result.valid) {
          console.log('✅ Configuration is valid');
          config = result.data;
        } else {
          console.error('❌ Configuration validation failed:');
          result.errors.forEach(error => console.error(`  - ${error}`));
          process.exit(1);
        }
      } else {
        // Load from environment
        const result = await loadConfig({
          environment: options.env as Environment,
          validate: true,
          throwOnError: false,
        });
        
        if (result.validationErrors.length === 0 && result.missingEnvVars.length === 0) {
          console.log('✅ Configuration is valid');
        } else {
          console.error('❌ Configuration validation failed:');
          result.validationErrors.forEach(error => console.error(`  - ${error}`));
          result.missingEnvVars.forEach(envVar => console.error(`  - Missing: ${envVar}`));
          process.exit(1);
        }
        
        config = result.config;
      }
      
      // Display summary
      const summary = getConfigSummary(config!);
      console.log('\nConfiguration Summary:');
      console.log(`Environment: ${summary.environment}`);
      console.log(`Features: ${Object.entries(summary.features).filter(([, enabled]) => enabled).map(([name]) => name).join(', ')}`);
      console.log(`Services: ${Object.entries(summary.services).map(([name, provider]) => `${name}(${provider})`).join(', ')}`);
      console.log(`Security: ${Object.entries(summary.security).filter(([, enabled]) => enabled).map(([name]) => name).join(', ')}`);
      
    } catch (error) {
      console.error('Failed to validate configuration:', error);
      process.exit(1);
    }
  });

/**
 * Export configuration
 */
program
  .command('export')
  .description('Export configuration')
  .option('-e, --env <environment>', 'Environment to export', getCurrentEnvironment())
  .option('-f, --format <format>', 'Output format (json, env)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options) => {
    try {
      console.log(`Exporting configuration for environment: ${options.env}`);
      
      const configData = await exportConfig(options.env as Environment, options.format);
      
      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, configData);
        console.log(`Configuration exported to: ${options.output}`);
      } else {
        console.log(configData);
      }
      
    } catch (error) {
      console.error('Failed to export configuration:', error);
      process.exit(1);
    }
  });

/**
 * Environment variables management
 */
program
  .command('env')
  .description('Environment variables management')
  .option('-e, --env <environment>', 'Environment', getCurrentEnvironment())
  .option('-g, --generate', 'Generate environment variable definitions', false)
  .option('-v, --validate', 'Validate environment variables', false)
  .option('-t, --template', 'Generate .env template', false)
  .action(async (options) => {
    try {
      const environment = options.env as Environment;
      const definitions = generateEnvVarDefinitions(environment);
      
      if (options.generate) {
        console.log('Environment Variable Definitions:');
        definitions.forEach(def => {
          console.log(`${def.name}:`);
          console.log(`  Type: ${def.type}`);
          console.log(`  Required: ${def.required}`);
          if (def.description) console.log(`  Description: ${def.description}`);
          if (def.default !== undefined) console.log(`  Default: ${def.default}`);
          console.log();
        });
      }
      
      if (options.validate) {
        console.log('Validating environment variables...');
        const result = validateEnvVars(definitions);
        
        if (result.valid) {
          console.log('✅ All environment variables are valid');
        } else {
          console.error('❌ Environment variable validation failed:');
          result.errors.forEach(error => console.error(`  - ${error}`));
          process.exit(1);
        }
      }
      
      if (options.template) {
        console.log('# Environment Variables Template');
        console.log(`# Generated for ${environment} environment`);
        console.log();
        
        definitions.forEach(def => {
          if (def.description) {
            console.log(`# ${def.description}`);
          }
          console.log(`# Type: ${def.type}, Required: ${def.required}`);
          
          if (def.default !== undefined) {
            console.log(`${def.name}=${def.default}`);
          } else {
            console.log(`${def.name}=`);
          }
          console.log();
        });
      }
      
    } catch (error) {
      console.error('Failed to process environment variables:', error);
      process.exit(1);
    }
  });

/**
 * Configuration inspection
 */
program
  .command('inspect')
  .description('Inspect configuration')
  .option('-e, --env <environment>', 'Environment to inspect', getCurrentEnvironment())
  .option('-s, --section <section>', 'Configuration section to inspect')
  .action(async (options) => {
    try {
      console.log(`Inspecting configuration for environment: ${options.env}`);
      
      const result = await loadConfig({
        environment: options.env as Environment,
        validate: false,
        throwOnError: false,
      });
      
      const config = result.config;
      
      if (options.section) {
        if (config[options.section as keyof typeof config]) {
          console.log(`\n${options.section} configuration:`);
          console.log(JSON.stringify(config[options.section as keyof typeof config], null, 2));
        } else {
          console.error(`Section '${options.section}' not found in configuration`);
          process.exit(1);
        }
      } else {
        const summary = getConfigSummary(config);
        
        console.log('\nConfiguration Overview:');
        console.log('='.repeat(50));
        console.log(`Environment: ${summary.environment}`);
        console.log();
        
        console.log('Features:');
        Object.entries(summary.features).forEach(([name, enabled]) => {
          console.log(`  ${enabled ? '✅' : '❌'} ${name}`);
        });
        console.log();
        
        console.log('Services:');
        Object.entries(summary.services).forEach(([name, provider]) => {
          console.log(`  ${name}: ${provider}`);
        });
        console.log();
        
        console.log('Security:');
        Object.entries(summary.security).forEach(([name, enabled]) => {
          console.log(`  ${enabled ? '✅' : '❌'} ${name}`);
        });
        console.log();
        
        if (result.validationErrors.length > 0) {
          console.log('Validation Errors:');
          result.validationErrors.forEach(error => console.log(`  ❌ ${error}`));
          console.log();
        }
        
        if (result.missingEnvVars.length > 0) {
          console.log('Missing Environment Variables:');
          result.missingEnvVars.forEach(envVar => console.log(`  ❌ ${envVar}`));
          console.log();
        }
        
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
          console.log();
        }
      }
      
    } catch (error) {
      console.error('Failed to inspect configuration:', error);
      process.exit(1);
    }
  });

/**
 * Initialize configuration
 */
program
  .command('init')
  .description('Initialize configuration for environment')
  .option('-e, --env <environment>', 'Environment to initialize', getCurrentEnvironment())
  .option('-f, --force', 'Force initialization (overwrite existing)', false)
  .action(async (options) => {
    try {
      console.log(`Initializing configuration for environment: ${options.env}`);
      
      const fs = await import('fs');
      const path = await import('path');
      
      // Generate .env file
      const envFile = `.env.${options.env}`;
      const envPath = path.resolve(process.cwd(), envFile);
      
      if (fs.existsSync(envPath) && !options.force) {
        console.error(`Environment file ${envFile} already exists. Use --force to overwrite.`);
        process.exit(1);
      }
      
      const definitions = generateEnvVarDefinitions(options.env as Environment);
      
      let envContent = `# Environment Variables for ${options.env}\n`;
      envContent += `# Generated on ${new Date().toISOString()}\n\n`;
      
      definitions.forEach(def => {
        if (def.description) {
          envContent += `# ${def.description}\n`;
        }
        envContent += `# Type: ${def.type}, Required: ${def.required}\n`;
        
        if (def.default !== undefined) {
          envContent += `${def.name}=${def.default}\n`;
        } else {
          envContent += `${def.name}=\n`;
        }
        envContent += '\n';
      });
      
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Environment file created: ${envFile}`);
      
      // Validate after creation
      console.log('Validating generated configuration...');
      const result = validateEnvVars(definitions);
      
      if (result.valid) {
        console.log('✅ Configuration is valid');
      } else {
        console.warn('⚠️  Configuration has validation errors (this is normal for newly generated files):');
        result.errors.forEach(error => console.warn(`  - ${error}`));
      }
      
    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export for programmatic use
export { program };
export default program;