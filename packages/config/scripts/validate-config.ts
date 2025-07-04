#!/usr/bin/env tsx

import { loadConfig, validateConfig, Environment } from '../src/loader';
import { validateEnvVars, generateEnvVarDefinitions } from '../src/utils';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration validation script
 * 
 * This script validates configuration files, environment variables,
 * and provides detailed reports on configuration health.
 */

interface ValidationOptions {
  environment?: Environment;
  configFile?: string;
  envFile?: string;
  strict?: boolean;
  verbose?: boolean;
  exitOnError?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  summary: {
    configValid: boolean;
    envVarsValid: boolean;
    missingRequired: string[];
    totalErrors: number;
    totalWarnings: number;
  };
}

/**
 * Validate configuration and environment variables
 */
async function validateConfiguration(options: ValidationOptions = {}): Promise<ValidationResult> {
  const {
    environment = 'development',
    configFile,
    envFile,
    strict = false,
    verbose = false,
  } = options;

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
    summary: {
      configValid: false,
      envVarsValid: false,
      missingRequired: [],
      totalErrors: 0,
      totalWarnings: 0,
    },
  };

  try {
    // Load environment variables from file if specified
    let envVars = process.env;
    if (envFile) {
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf8');
        const parsedEnv = parseEnvFile(envContent);
        envVars = { ...process.env, ...parsedEnv };
        result.info.push(`Loaded environment variables from: ${envFile}`);
      } else {
        result.errors.push(`Environment file not found: ${envFile}`);
      }
    }

    // Validate environment variables
    const envDefinitions = generateEnvVarDefinitions(environment);
    const envValidation = validateEnvVars(envDefinitions, envVars as Record<string, string>);

    if (!envValidation.valid) {
      result.errors.push(...envValidation.errors);
      result.summary.envVarsValid = false;
    } else {
      result.summary.envVarsValid = true;
      result.info.push('✅ Environment variables validation passed');
    }

    // Validate configuration
    if (configFile) {
      // Validate from file
      if (!fs.existsSync(configFile)) {
        result.errors.push(`Configuration file not found: ${configFile}`);
      } else {
        const configContent = fs.readFileSync(configFile, 'utf8');
        let configData;
        
        try {
          configData = JSON.parse(configContent);
        } catch (error) {
          result.errors.push(`Invalid JSON in configuration file: ${error}`);
        }

        if (configData) {
          const configValidation = await validateConfig(configData);
          if (!configValidation.valid) {
            result.errors.push(...configValidation.errors);
            result.summary.configValid = false;
          } else {
            result.summary.configValid = true;
            result.info.push('✅ Configuration file validation passed');
          }
        }
      }
    } else {
      // Validate from environment
      try {
        const configResult = await loadConfig({
          environment,
          envVars: envVars as Record<string, string>,
          validate: true,
          throwOnError: false,
        });

        if (configResult.validationErrors.length > 0) {
          result.errors.push(...configResult.validationErrors);
          result.summary.configValid = false;
        } else {
          result.summary.configValid = true;
          result.info.push('✅ Configuration validation passed');
        }

        if (configResult.missingEnvVars.length > 0) {
          result.summary.missingRequired = configResult.missingEnvVars;
          result.errors.push(...configResult.missingEnvVars.map(v => `Missing required environment variable: ${v}`));
        }

        if (configResult.warnings.length > 0) {
          result.warnings.push(...configResult.warnings);
        }

      } catch (error) {
        result.errors.push(`Configuration loading failed: ${error}`);
        result.summary.configValid = false;
      }
    }

    // Add strict mode warnings
    if (strict) {
      // Check for unused environment variables
      const usedVars = new Set(envDefinitions.map(def => def.name));
      const allVars = Object.keys(envVars);
      const unusedVars = allVars.filter(v => !usedVars.has(v) && !v.startsWith('npm_') && !v.startsWith('NODE_'));
      
      if (unusedVars.length > 0 && verbose) {
        result.warnings.push(`Unused environment variables: ${unusedVars.join(', ')}`);
      }
    }

    // Calculate summary
    result.summary.totalErrors = result.errors.length;
    result.summary.totalWarnings = result.warnings.length;
    result.valid = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Validation failed: ${error}`);
    result.valid = false;
  }

  return result;
}

/**
 * Parse environment file content
 */
function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = trimmed.substring(0, equalIndex).trim();
    const value = trimmed.substring(equalIndex + 1).trim();

    // Remove quotes if present
    const unquotedValue = value.replace(/^["'](.*)["']$/, '$1');
    
    env[key] = unquotedValue;
  }

  return env;
}

/**
 * Generate validation report
 */
function generateReport(result: ValidationResult, verbose: boolean = false): string {
  let report = '';

  // Header
  report += '🔍 Configuration Validation Report\n';
  report += '='.repeat(50) + '\n\n';

  // Summary
  report += 'Summary:\n';
  report += `  Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}\n`;
  report += `  Configuration: ${result.summary.configValid ? '✅ Valid' : '❌ Invalid'}\n`;
  report += `  Environment Variables: ${result.summary.envVarsValid ? '✅ Valid' : '❌ Invalid'}\n`;
  report += `  Errors: ${result.summary.totalErrors}\n`;
  report += `  Warnings: ${result.summary.totalWarnings}\n`;
  
  if (result.summary.missingRequired.length > 0) {
    report += `  Missing Required Variables: ${result.summary.missingRequired.length}\n`;
  }
  
  report += '\n';

  // Errors
  if (result.errors.length > 0) {
    report += '❌ Errors:\n';
    result.errors.forEach((error, index) => {
      report += `  ${index + 1}. ${error}\n`;
    });
    report += '\n';
  }

  // Warnings
  if (result.warnings.length > 0) {
    report += '⚠️  Warnings:\n';
    result.warnings.forEach((warning, index) => {
      report += `  ${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }

  // Info (only in verbose mode)
  if (verbose && result.info.length > 0) {
    report += 'ℹ️  Information:\n';
    result.info.forEach((info, index) => {
      report += `  ${index + 1}. ${info}\n`;
    });
    report += '\n';
  }

  // Missing required variables details
  if (result.summary.missingRequired.length > 0) {
    report += '🚨 Missing Required Environment Variables:\n';
    result.summary.missingRequired.forEach((variable, index) => {
      report += `  ${index + 1}. ${variable}\n`;
    });
    report += '\n';
    report += 'Please set these variables in your environment or .env file.\n\n';
  }

  // Recommendations
  if (!result.valid) {
    report += '💡 Recommendations:\n';
    if (!result.summary.configValid) {
      report += '  - Review configuration schema and fix validation errors\n';
    }
    if (!result.summary.envVarsValid) {
      report += '  - Set missing required environment variables\n';
      report += '  - Check environment variable types and formats\n';
    }
    if (result.summary.missingRequired.length > 0) {
      report += '  - Use `npm run generate:env` to create environment file templates\n';
    }
    report += '  - Run validation again after making changes\n';
  }

  return report;
}

// CLI setup
program
  .name('validate-config')
  .description('Validate configuration and environment variables')
  .version('1.0.0');

program
  .option('-e, --env <environment>', 'Environment to validate', 'development')
  .option('-c, --config <file>', 'Configuration file to validate')
  .option('-f, --env-file <file>', 'Environment file to load')
  .option('-s, --strict', 'Enable strict validation mode', false)
  .option('-v, --verbose', 'Enable verbose output', false)
  .option('--no-exit', 'Do not exit with error code on validation failure')
  .option('-o, --output <file>', 'Save report to file')
  .action(async (options) => {
    try {
      const validationOptions: ValidationOptions = {
        environment: options.env as Environment,
        configFile: options.config,
        envFile: options.envFile,
        strict: options.strict,
        verbose: options.verbose,
        exitOnError: options.exit !== false,
      };

      console.log(`🔄 Validating configuration for ${options.env} environment...`);
      if (options.config) {
        console.log(`   Config file: ${options.config}`);
      }
      if (options.envFile) {
        console.log(`   Environment file: ${options.envFile}`);
      }
      console.log();

      const result = await validateConfiguration(validationOptions);
      const report = generateReport(result, options.verbose);

      console.log(report);

      // Save report to file if specified
      if (options.output) {
        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, report);
        console.log(`📄 Report saved to: ${outputPath}`);
      }

      // Exit with appropriate code
      if (!result.valid && validationOptions.exitOnError) {
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export for direct usage
export { validateConfiguration, generateReport };