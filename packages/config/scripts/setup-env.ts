#!/usr/bin/env tsx

import { generateEnvVarDefinitions, generateSecureSecret, isValidEmail, isValidUrl } from '../src/utils';
import { Environment } from '../src/loader';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer';

/**
 * Interactive setup script for NextSaaS configuration
 * 
 * This script helps users set up their configuration by asking
 * interactive questions and generating appropriate .env files.
 */

interface SetupOptions {
  environment: Environment;
  interactive: boolean;
  force: boolean;
  outputDir: string;
  includeSecrets: boolean;
}

interface SetupAnswers {
  // Application
  appName: string;
  appUrl: string;
  apiUrl: string;
  supportEmail: string;
  companyName: string;

  // Database
  databaseProvider: 'postgresql' | 'mysql' | 'sqlite';
  databaseUrl?: string;
  
  // Authentication
  generateJwtSecret: boolean;
  jwtSecret?: string;
  generateSessionSecret: boolean;
  sessionSecret?: string;

  // Email
  emailProvider: 'smtp' | 'sendgrid' | 'mailgun' | 'none';
  fromEmail?: string;
  fromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  sendgridApiKey?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;

  // Storage
  storageProvider: 'local' | 'aws-s3' | 'azure' | 'gcs';
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  s3Bucket?: string;

  // Billing
  enableBilling: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;

  // Cache
  enableRedis: boolean;
  redisUrl?: string;

  // Monitoring
  enableSentry: boolean;
  sentryDsn?: string;
  enableAnalytics: boolean;
  gaTrackingId?: string;
}

/**
 * Interactive setup questionnaire
 */
async function interactiveSetup(environment: Environment): Promise<SetupAnswers> {
  console.log(`🚀 Welcome to NextSaaS Configuration Setup for ${environment} environment!\n`);
  console.log('This wizard will help you configure your application step by step.\n');

  const answers = await inquirer.prompt([
    // Application settings
    {
      type: 'input',
      name: 'appName',
      message: 'What is your application name?',
      default: 'NextSaaS',
      validate: (input: string) => input.trim().length > 0 || 'Application name is required',
    },
    {
      type: 'input',
      name: 'appUrl',
      message: 'What is your application URL?',
      default: environment === 'development' ? 'http://localhost:3000' : 'https://app.example.com',
      validate: (input: string) => isValidUrl(input) || 'Please enter a valid URL',
    },
    {
      type: 'input',
      name: 'apiUrl',
      message: 'What is your API URL?',
      default: (answers: any) => environment === 'development' 
        ? 'http://localhost:3000/api' 
        : `${answers.appUrl}/api`,
      validate: (input: string) => isValidUrl(input) || 'Please enter a valid URL',
    },
    {
      type: 'input',
      name: 'supportEmail',
      message: 'What is your support email?',
      default: 'support@example.com',
      validate: (input: string) => isValidEmail(input) || 'Please enter a valid email',
    },
    {
      type: 'input',
      name: 'companyName',
      message: 'What is your company name?',
      default: (answers: any) => `${answers.appName} Inc.`,
    },

    // Database configuration
    {
      type: 'list',
      name: 'databaseProvider',
      message: 'Which database provider do you want to use?',
      choices: [
        { name: 'PostgreSQL (Recommended)', value: 'postgresql' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite (Development only)', value: 'sqlite' },
      ],
      default: 'postgresql',
    },
    {
      type: 'input',
      name: 'databaseUrl',
      message: 'Enter your database connection URL:',
      when: (answers: any) => answers.databaseProvider !== 'sqlite',
      default: (answers: any) => {
        if (environment === 'development') {
          return answers.databaseProvider === 'postgresql' 
            ? 'postgresql://postgres:password@localhost:5432/nextsaas_dev'
            : 'mysql://root:password@localhost:3306/nextsaas_dev';
        }
        return '';
      },
      validate: (input: string, answers: any) => {
        if (!input && environment !== 'development') {
          return 'Database URL is required for non-development environments';
        }
        return true;
      },
    },

    // Authentication
    {
      type: 'confirm',
      name: 'generateJwtSecret',
      message: 'Generate a secure JWT secret automatically?',
      default: true,
    },
    {
      type: 'input',
      name: 'jwtSecret',
      message: 'Enter your JWT secret (minimum 32 characters):',
      when: (answers: any) => !answers.generateJwtSecret,
      validate: (input: string) => 
        input.length >= 32 || 'JWT secret must be at least 32 characters long',
    },
    {
      type: 'confirm',
      name: 'generateSessionSecret',
      message: 'Generate a secure session secret automatically?',
      default: true,
    },
    {
      type: 'input',
      name: 'sessionSecret',
      message: 'Enter your session secret (minimum 32 characters):',
      when: (answers: any) => !answers.generateSessionSecret,
      validate: (input: string) => 
        input.length >= 32 || 'Session secret must be at least 32 characters long',
    },

    // Email configuration
    {
      type: 'list',
      name: 'emailProvider',
      message: 'Which email provider do you want to use?',
      choices: [
        { name: 'SMTP (Generic)', value: 'smtp' },
        { name: 'SendGrid', value: 'sendgrid' },
        { name: 'Mailgun', value: 'mailgun' },
        { name: 'None (Disable email)', value: 'none' },
      ],
      default: 'smtp',
    },
    {
      type: 'input',
      name: 'fromEmail',
      message: 'What email should we send from?',
      when: (answers: any) => answers.emailProvider !== 'none',
      default: (answers: any) => `noreply@${new URL(answers.appUrl).hostname}`,
      validate: (input: string) => isValidEmail(input) || 'Please enter a valid email',
    },
    {
      type: 'input',
      name: 'fromName',
      message: 'What name should appear as the sender?',
      when: (answers: any) => answers.emailProvider !== 'none',
      default: (answers: any) => answers.appName,
    },

    // SMTP specific
    {
      type: 'input',
      name: 'smtpHost',
      message: 'SMTP Host:',
      when: (answers: any) => answers.emailProvider === 'smtp',
      default: 'localhost',
    },
    {
      type: 'number',
      name: 'smtpPort',
      message: 'SMTP Port:',
      when: (answers: any) => answers.emailProvider === 'smtp',
      default: 587,
    },

    // SendGrid specific
    {
      type: 'input',
      name: 'sendgridApiKey',
      message: 'SendGrid API Key:',
      when: (answers: any) => answers.emailProvider === 'sendgrid',
    },

    // Mailgun specific
    {
      type: 'input',
      name: 'mailgunApiKey',
      message: 'Mailgun API Key:',
      when: (answers: any) => answers.emailProvider === 'mailgun',
    },
    {
      type: 'input',
      name: 'mailgunDomain',
      message: 'Mailgun Domain:',
      when: (answers: any) => answers.emailProvider === 'mailgun',
    },

    // Storage configuration
    {
      type: 'list',
      name: 'storageProvider',
      message: 'Which storage provider do you want to use?',
      choices: [
        { name: 'Local Storage (Development)', value: 'local' },
        { name: 'AWS S3', value: 'aws-s3' },
        { name: 'Azure Blob Storage', value: 'azure' },
        { name: 'Google Cloud Storage', value: 'gcs' },
      ],
      default: environment === 'development' ? 'local' : 'aws-s3',
    },

    // AWS S3 specific
    {
      type: 'input',
      name: 'awsAccessKeyId',
      message: 'AWS Access Key ID:',
      when: (answers: any) => answers.storageProvider === 'aws-s3',
    },
    {
      type: 'input',
      name: 'awsSecretAccessKey',
      message: 'AWS Secret Access Key:',
      when: (answers: any) => answers.storageProvider === 'aws-s3',
    },
    {
      type: 'input',
      name: 'awsRegion',
      message: 'AWS Region:',
      when: (answers: any) => answers.storageProvider === 'aws-s3',
      default: 'us-east-1',
    },
    {
      type: 'input',
      name: 's3Bucket',
      message: 'S3 Bucket Name:',
      when: (answers: any) => answers.storageProvider === 'aws-s3',
    },

    // Billing
    {
      type: 'confirm',
      name: 'enableBilling',
      message: 'Do you want to enable billing/payments (Stripe)?',
      default: true,
    },
    {
      type: 'input',
      name: 'stripePublishableKey',
      message: 'Stripe Publishable Key:',
      when: (answers: any) => answers.enableBilling,
    },
    {
      type: 'input',
      name: 'stripeSecretKey',
      message: 'Stripe Secret Key:',
      when: (answers: any) => answers.enableBilling,
    },
    {
      type: 'input',
      name: 'stripeWebhookSecret',
      message: 'Stripe Webhook Secret:',
      when: (answers: any) => answers.enableBilling,
    },

    // Cache
    {
      type: 'confirm',
      name: 'enableRedis',
      message: 'Do you want to enable Redis for caching?',
      default: environment !== 'development',
    },
    {
      type: 'input',
      name: 'redisUrl',
      message: 'Redis URL:',
      when: (answers: any) => answers.enableRedis,
      default: 'redis://localhost:6379',
    },

    // Monitoring
    {
      type: 'confirm',
      name: 'enableSentry',
      message: 'Do you want to enable Sentry for error tracking?',
      default: environment === 'production',
    },
    {
      type: 'input',
      name: 'sentryDsn',
      message: 'Sentry DSN:',
      when: (answers: any) => answers.enableSentry,
    },
    {
      type: 'confirm',
      name: 'enableAnalytics',
      message: 'Do you want to enable Google Analytics?',
      default: environment === 'production',
    },
    {
      type: 'input',
      name: 'gaTrackingId',
      message: 'Google Analytics Tracking ID:',
      when: (answers: any) => answers.enableAnalytics,
    },
  ]);

  // Generate secrets if requested
  if (answers.generateJwtSecret) {
    answers.jwtSecret = generateSecureSecret(64);
  }
  if (answers.generateSessionSecret) {
    answers.sessionSecret = generateSecureSecret(64);
  }

  return answers;
}

/**
 * Generate environment file from answers
 */
function generateEnvFromAnswers(answers: SetupAnswers, environment: Environment): string {
  let content = `# Environment Configuration for ${environment}\n`;
  content += `# Generated on ${new Date().toISOString()}\n`;
  content += `# NextSaaS Configuration Setup\n\n`;

  // Application settings
  content += '# Application Settings\n';
  content += '#' + '='.repeat(30) + '\n';
  content += `NODE_ENV=${environment}\n`;
  content += `APP_NAME="${answers.appName}"\n`;
  content += `APP_URL="${answers.appUrl}"\n`;
  content += `API_URL="${answers.apiUrl}"\n`;
  content += `SUPPORT_EMAIL="${answers.supportEmail}"\n`;
  content += `COMPANY_NAME="${answers.companyName}"\n`;
  content += `DEBUG=${environment === 'development' ? 'true' : 'false'}\n`;
  content += `LOG_LEVEL=${environment === 'production' ? 'info' : 'debug'}\n\n`;

  // Database
  content += '# Database Configuration\n';
  content += '#' + '='.repeat(30) + '\n';
  if (answers.databaseUrl) {
    content += `DATABASE_URL="${answers.databaseUrl}"\n`;
  }
  content += '\n';

  // Authentication
  content += '# Authentication & Security\n';
  content += '#' + '='.repeat(30) + '\n';
  if (answers.jwtSecret) {
    content += `JWT_SECRET="${answers.jwtSecret}"\n`;
  }
  if (answers.sessionSecret) {
    content += `SESSION_SECRET="${answers.sessionSecret}"\n`;
  }
  content += '\n';

  // Email
  if (answers.emailProvider !== 'none') {
    content += '# Email Configuration\n';
    content += '#' + '='.repeat(30) + '\n';
    content += `EMAIL_PROVIDER="${answers.emailProvider}"\n`;
    if (answers.fromEmail) {
      content += `FROM_EMAIL="${answers.fromEmail}"\n`;
    }
    if (answers.fromName) {
      content += `FROM_NAME="${answers.fromName}"\n`;
    }

    if (answers.emailProvider === 'smtp') {
      if (answers.smtpHost) content += `SMTP_HOST="${answers.smtpHost}"\n`;
      if (answers.smtpPort) content += `SMTP_PORT=${answers.smtpPort}\n`;
    } else if (answers.emailProvider === 'sendgrid') {
      if (answers.sendgridApiKey) content += `SENDGRID_API_KEY="${answers.sendgridApiKey}"\n`;
    } else if (answers.emailProvider === 'mailgun') {
      if (answers.mailgunApiKey) content += `MAILGUN_API_KEY="${answers.mailgunApiKey}"\n`;
      if (answers.mailgunDomain) content += `MAILGUN_DOMAIN="${answers.mailgunDomain}"\n`;
    }
    content += '\n';
  }

  // Storage
  content += '# Storage Configuration\n';
  content += '#' + '='.repeat(30) + '\n';
  content += `STORAGE_PROVIDER="${answers.storageProvider}"\n`;
  if (answers.storageProvider === 'aws-s3') {
    if (answers.awsAccessKeyId) content += `AWS_ACCESS_KEY_ID="${answers.awsAccessKeyId}"\n`;
    if (answers.awsSecretAccessKey) content += `AWS_SECRET_ACCESS_KEY="${answers.awsSecretAccessKey}"\n`;
    if (answers.awsRegion) content += `AWS_REGION="${answers.awsRegion}"\n`;
    if (answers.s3Bucket) content += `S3_BUCKET="${answers.s3Bucket}"\n`;
  }
  content += '\n';

  // Billing
  if (answers.enableBilling) {
    content += '# Billing & Payments\n';
    content += '#' + '='.repeat(30) + '\n';
    if (answers.stripePublishableKey) content += `STRIPE_PUBLISHABLE_KEY="${answers.stripePublishableKey}"\n`;
    if (answers.stripeSecretKey) content += `STRIPE_SECRET_KEY="${answers.stripeSecretKey}"\n`;
    if (answers.stripeWebhookSecret) content += `STRIPE_WEBHOOK_SECRET="${answers.stripeWebhookSecret}"\n`;
    content += '\n';
  }

  // Cache
  if (answers.enableRedis) {
    content += '# Cache Configuration\n';
    content += '#' + '='.repeat(30) + '\n';
    if (answers.redisUrl) content += `REDIS_URL="${answers.redisUrl}"\n`;
    content += '\n';
  }

  // Monitoring
  if (answers.enableSentry || answers.enableAnalytics) {
    content += '# Monitoring & Analytics\n';
    content += '#' + '='.repeat(30) + '\n';
    if (answers.enableSentry && answers.sentryDsn) {
      content += `SENTRY_DSN="${answers.sentryDsn}"\n`;
    }
    if (answers.enableAnalytics && answers.gaTrackingId) {
      content += `GA_MEASUREMENT_ID="${answers.gaTrackingId}"\n`;
    }
    content += '\n';
  }

  return content;
}

/**
 * Run the setup process
 */
async function runSetup(options: SetupOptions): Promise<void> {
  const { environment, interactive, force, outputDir, includeSecrets } = options;

  let answers: SetupAnswers;

  if (interactive) {
    answers = await interactiveSetup(environment);
  } else {
    // Non-interactive mode with defaults
    answers = {
      appName: 'NextSaaS',
      appUrl: environment === 'development' ? 'http://localhost:3000' : 'https://app.example.com',
      apiUrl: environment === 'development' ? 'http://localhost:3000/api' : 'https://api.example.com',
      supportEmail: 'support@example.com',
      companyName: 'NextSaaS Inc.',
      databaseProvider: 'postgresql',
      databaseUrl: environment === 'development' ? 'postgresql://postgres:password@localhost:5432/nextsaas_dev' : '',
      generateJwtSecret: true,
      generateSessionSecret: true,
      emailProvider: 'smtp',
      fromEmail: 'noreply@example.com',
      fromName: 'NextSaaS',
      smtpHost: 'localhost',
      smtpPort: 587,
      storageProvider: environment === 'development' ? 'local' : 'aws-s3',
      enableBilling: true,
      enableRedis: environment !== 'development',
      redisUrl: 'redis://localhost:6379',
      enableSentry: environment === 'production',
      enableAnalytics: environment === 'production',
    };

    // Generate secrets
    answers.jwtSecret = generateSecureSecret(64);
    answers.sessionSecret = generateSecureSecret(64);
  }

  // Generate environment file
  const envContent = generateEnvFromAnswers(answers, environment);
  const envFileName = `.env.${environment}`;
  const envFilePath = path.join(outputDir, envFileName);

  // Check if file exists
  if (fs.existsSync(envFilePath) && !force) {
    console.log(`\n❌ File ${envFileName} already exists.`);
    console.log('Use --force to overwrite or choose a different output directory.');
    return;
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write environment file
  fs.writeFileSync(envFilePath, envContent);

  console.log(`\n✅ Configuration setup complete!`);
  console.log(`   Environment file created: ${envFilePath}`);
  
  if (includeSecrets && (answers.jwtSecret || answers.sessionSecret)) {
    console.log('\n🔐 Generated secure secrets:');
    if (answers.jwtSecret) console.log(`   JWT Secret: ${answers.jwtSecret.substring(0, 20)}...`);
    if (answers.sessionSecret) console.log(`   Session Secret: ${answers.sessionSecret.substring(0, 20)}...`);
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Review and update the generated .env file');
  console.log('   2. Set any missing required values');
  console.log('   3. Run configuration validation: npm run validate');
  console.log('   4. Start your application');
  console.log('\n🔒 Security reminder: Never commit .env files to version control!');
}

// CLI setup
program
  .name('setup-env')
  .description('Interactive setup for NextSaaS configuration')
  .version('1.0.0');

program
  .option('-e, --env <environment>', 'Environment to setup', 'development')
  .option('-i, --interactive', 'Run in interactive mode', true)
  .option('-f, --force', 'Overwrite existing files', false)
  .option('-o, --output <dir>', 'Output directory', '.')
  .option('--include-secrets', 'Show generated secrets in output', false)
  .action(async (options) => {
    try {
      const setupOptions: SetupOptions = {
        environment: options.env as Environment,
        interactive: options.interactive,
        force: options.force,
        outputDir: path.resolve(process.cwd(), options.output),
        includeSecrets: options.includeSecrets,
      };

      await runSetup(setupOptions);

    } catch (error) {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export for direct usage
export { runSetup, interactiveSetup };