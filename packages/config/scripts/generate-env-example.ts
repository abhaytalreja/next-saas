#!/usr/bin/env tsx

import { generateEnvVarDefinitions, EnvVarDefinition } from '../src/utils';
import { Environment } from '../src/loader';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-generation script for environment file templates
 * 
 * This script generates .env template files for different environments
 * with proper documentation and default values.
 */

interface EnvFileOptions {
  environment: Environment;
  outputPath?: string;
  includeComments: boolean;
  includeDefaults: boolean;
  includeExamples: boolean;
  includeSecrets: boolean;
}

/**
 * Generate environment file content
 */
function generateEnvFileContent(options: EnvFileOptions): string {
  const { environment, includeComments, includeDefaults, includeExamples, includeSecrets } = options;
  
  let content = '';
  
  // Add header
  if (includeComments) {
    content += `# Environment Variables for ${environment.charAt(0).toUpperCase() + environment.slice(1)}\n`;
    content += `# Generated on ${new Date().toISOString()}\n`;
    content += `#\n`;
    content += `# Copy this file to .env.${environment} and fill in the required values.\n`;
    content += `# Make sure to update any placeholder values with real ones.\n`;
    content += `#\n`;
    content += `# Security Note: Never commit actual secrets to version control!\n`;
    content += `# Use environment-specific .env files or a secrets management system.\n\n`;
  }
  
  const definitions = generateEnvVarDefinitions(environment);
  
  // Group definitions by category
  const categories = groupDefinitionsByCategory(definitions);
  
  for (const [category, categoryDefs] of Object.entries(categories)) {
    if (includeComments) {
      content += `# ${category}\n`;
      content += `${'#'.repeat(50)}\n\n`;
    }
    
    for (const def of categoryDefs) {
      // Skip secrets in example files unless explicitly requested
      if (!includeSecrets && isSecretVariable(def.name)) {
        if (includeComments) {
          content += `# ${def.name}=<secret-value-required>\n`;
          if (def.description) {
            content += `# Description: ${def.description}\n`;
          }
          content += `# Type: ${def.type}, Required: ${def.required}\n`;
          content += `# WARNING: This is a secret! Set this in your actual .env file.\n\n`;
        }
        continue;
      }
      
      // Add description and metadata
      if (includeComments && def.description) {
        content += `# ${def.description}\n`;
      }
      
      if (includeComments) {
        content += `# Type: ${def.type}`;
        if (def.required) {
          content += ', Required: Yes';
        } else {
          content += ', Required: No';
        }
        content += '\n';
      }
      
      // Add examples for complex types
      if (includeExamples && includeComments) {
        const example = getExampleValue(def);
        if (example) {
          content += `# Example: ${def.name}=${example}\n`;
        }
      }
      
      // Add the variable
      if (includeDefaults && def.default !== undefined) {
        content += `${def.name}=${def.default}\n`;
      } else if (def.required) {
        content += `${def.name}=\n`;
      } else {
        content += `# ${def.name}=\n`;
      }
      
      content += '\n';
    }
  }
  
  return content;
}

/**
 * Group environment variable definitions by category
 */
function groupDefinitionsByCategory(definitions: EnvVarDefinition[]): Record<string, EnvVarDefinition[]> {
  const categories: Record<string, EnvVarDefinition[]> = {
    'Application Settings': [],
    'Database Configuration': [],
    'Authentication & Security': [],
    'Email Configuration': [],
    'Storage & File Uploads': [],
    'Payment & Billing': [],
    'Cache & Performance': [],
    'Third-party Integrations': [],
    'Monitoring & Logging': [],
    'Other': [],
  };
  
  for (const def of definitions) {
    const category = categorizeVariable(def.name);
    if (categories[category]) {
      categories[category].push(def);
    } else {
      categories['Other'].push(def);
    }
  }
  
  // Remove empty categories
  for (const [category, defs] of Object.entries(categories)) {
    if (defs.length === 0) {
      delete categories[category];
    }
  }
  
  return categories;
}

/**
 * Categorize environment variable by name
 */
function categorizeVariable(name: string): string {
  if (name.match(/^(APP_|NODE_ENV|DEBUG|LOG_|PORT|HOST|TIMEZONE)/)) {
    return 'Application Settings';
  } else if (name.match(/^(DATABASE_|DB_|POSTGRES_|MYSQL_|MONGODB_)/)) {
    return 'Database Configuration';
  } else if (name.match(/^(JWT_|SESSION_|AUTH_|PASSWORD_|OAUTH_|GOOGLE_|GITHUB_|FACEBOOK_)/)) {
    return 'Authentication & Security';
  } else if (name.match(/^(EMAIL_|SMTP_|SENDGRID_|MAILGUN_|FROM_|REPLY_)/)) {
    return 'Email Configuration';
  } else if (name.match(/^(STORAGE_|AWS_|S3_|AZURE_|GCS_|CDN_|UPLOAD_)/)) {
    return 'Storage & File Uploads';
  } else if (name.match(/^(STRIPE_|PAYPAL_|BILLING_|PAYMENT_)/)) {
    return 'Payment & Billing';
  } else if (name.match(/^(REDIS_|CACHE_|MEMCACHED_)/)) {
    return 'Cache & Performance';
  } else if (name.match(/^(GA_|SENTRY_|SLACK_|DISCORD_|INTERCOM_|ZENDESK_)/)) {
    return 'Third-party Integrations';
  } else if (name.match(/^(LOG_|MONITOR_|METRICS_|TRACE_)/)) {
    return 'Monitoring & Logging';
  } else {
    return 'Other';
  }
}

/**
 * Check if variable contains secrets
 */
function isSecretVariable(name: string): boolean {
  return name.match(/SECRET|KEY|PASSWORD|TOKEN|PRIVATE|API_KEY|WEBHOOK/) !== null;
}

/**
 * Get example value for variable
 */
function getExampleValue(def: EnvVarDefinition): string | null {
  switch (def.name) {
    case 'DATABASE_URL':
      return 'postgresql://user:password@localhost:5432/database';
    case 'REDIS_URL':
      return 'redis://localhost:6379';
    case 'JWT_SECRET':
      return 'your-super-secure-jwt-secret-at-least-32-characters';
    case 'SESSION_SECRET':
      return 'your-super-secure-session-secret-at-least-32-characters';
    case 'FROM_EMAIL':
      return 'noreply@yourdomain.com';
    case 'SUPPORT_EMAIL':
      return 'support@yourdomain.com';
    case 'APP_URL':
      return 'https://yourdomain.com';
    case 'API_URL':
      return 'https://api.yourdomain.com';
    case 'ALLOWED_ORIGINS':
      return 'https://yourdomain.com,https://admin.yourdomain.com';
    case 'AWS_REGION':
      return 'us-east-1';
    case 'S3_BUCKET':
      return 'your-app-bucket';
    default:
      if (def.type === 'array') {
        return 'value1,value2,value3';
      } else if (def.type === 'boolean') {
        return 'true';
      } else if (def.type === 'number') {
        return '100';
      } else if (def.type === 'json') {
        return '{"key":"value"}';
      }
      return null;
  }
}

/**
 * Generate environment files for all environments
 */
async function generateAllEnvFiles(baseOutputDir: string, options: Partial<EnvFileOptions> = {}): Promise<void> {
  const environments: Environment[] = ['development', 'staging', 'production', 'test'];
  
  for (const environment of environments) {
    const filename = `.env.${environment}.example`;
    const outputPath = path.join(baseOutputDir, filename);
    
    const envOptions: EnvFileOptions = {
      environment,
      outputPath,
      includeComments: true,
      includeDefaults: true,
      includeExamples: true,
      includeSecrets: environment === 'development', // Only include secrets in dev examples
      ...options,
    };
    
    const content = generateEnvFileContent(envOptions);
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Generated ${filename}`);
  }
}

/**
 * Generate Docker Compose environment file
 */
function generateDockerComposeEnv(): string {
  let content = '# Docker Compose Environment Variables\n';
  content += '# These variables are used by docker-compose.yml\n\n';
  
  content += '# Database\n';
  content += 'POSTGRES_DB=nextsaas_dev\n';
  content += 'POSTGRES_USER=postgres\n';
  content += 'POSTGRES_PASSWORD=password\n';
  content += 'POSTGRES_PORT=5432\n\n';
  
  content += '# Redis\n';
  content += 'REDIS_PORT=6379\n\n';
  
  content += '# Application\n';
  content += 'APP_PORT=3000\n';
  content += 'API_PORT=3001\n\n';
  
  return content;
}

/**
 * Generate .gitignore entries for environment files
 */
function generateGitignoreEntries(): string {
  let content = '# Environment files\n';
  content += '.env\n';
  content += '.env.local\n';
  content += '.env.development.local\n';
  content += '.env.staging.local\n';
  content += '.env.production.local\n';
  content += '.env.test.local\n\n';
  
  content += '# Keep example files\n';
  content += '!.env.*.example\n';
  content += '!.env.example\n\n';
  
  return content;
}

// CLI setup
program
  .name('generate-env-example')
  .description('Generate environment file templates')
  .version('1.0.0');

program
  .command('single')
  .description('Generate environment file for a single environment')
  .option('-e, --env <environment>', 'Environment (development, staging, production, test)', 'development')
  .option('-o, --output <path>', 'Output file path')
  .option('--no-comments', 'Skip generating comments')
  .option('--no-defaults', 'Skip default values')
  .option('--no-examples', 'Skip example values')
  .option('--include-secrets', 'Include secret variables (use with caution)')
  .action(async (options) => {
    try {
      const environment = options.env as Environment;
      const outputPath = options.output || `.env.${environment}.example`;
      
      console.log(`🔄 Generating environment file for ${environment}...`);
      
      const envOptions: EnvFileOptions = {
        environment,
        outputPath,
        includeComments: options.comments !== false,
        includeDefaults: options.defaults !== false,
        includeExamples: options.examples !== false,
        includeSecrets: options.includeSecrets === true,
      };
      
      const content = generateEnvFileContent(envOptions);
      
      // Ensure directory exists
      const dir = path.dirname(path.resolve(outputPath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      
      console.log(`✅ Environment file generated: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Failed to generate environment file:', error);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Generate environment files for all environments')
  .option('-o, --output <dir>', 'Output directory', './templates')
  .option('--no-comments', 'Skip generating comments')
  .option('--no-defaults', 'Skip default values')
  .option('--no-examples', 'Skip example values')
  .action(async (options) => {
    try {
      console.log('🔄 Generating environment files for all environments...');
      
      const outputDir = path.resolve(process.cwd(), options.output);
      
      await generateAllEnvFiles(outputDir, {
        includeComments: options.comments !== false,
        includeDefaults: options.defaults !== false,
        includeExamples: options.examples !== false,
      });
      
      // Generate additional files
      const dockerEnvContent = generateDockerComposeEnv();
      fs.writeFileSync(path.join(outputDir, '.env.docker-compose'), dockerEnvContent);
      console.log('✅ Generated .env.docker-compose');
      
      const gitignoreContent = generateGitignoreEntries();
      fs.writeFileSync(path.join(outputDir, 'gitignore-env-entries.txt'), gitignoreContent);
      console.log('✅ Generated gitignore-env-entries.txt');
      
      console.log('\n✅ All environment files generated successfully!');
      console.log(`   Output directory: ${outputDir}`);
      
    } catch (error) {
      console.error('❌ Failed to generate environment files:', error);
      process.exit(1);
    }
  });

// Default command
program
  .action(async () => {
    // Run 'all' command by default
    await generateAllEnvFiles('./templates');
    console.log('✅ Generated all environment file templates');
  });

// Parse command line arguments
program.parse();

// Export for direct usage
export { generateEnvFileContent, generateAllEnvFiles };