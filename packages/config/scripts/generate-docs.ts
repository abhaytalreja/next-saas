#!/usr/bin/env tsx

import { z } from 'zod';
import { baseConfigSchema } from '../src/environments/base';
import * as schemas from '../src/schemas';
import { generateEnvVarDefinitions } from '../src/utils';
import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-generation script for configuration documentation
 * 
 * This script generates comprehensive markdown documentation
 * from configuration schemas and environment variable definitions.
 */

interface DocGenerationOptions {
  outputDir: string;
  includeExamples: boolean;
  includeEnvVars: boolean;
  includeSchemas: boolean;
  format: 'markdown' | 'html';
}

/**
 * Generate schema documentation
 */
function generateSchemaDoc(schema: z.ZodSchema, name: string): string {
  let doc = `## ${name}\n\n`;
  
  // Add description if available
  if ('description' in schema && typeof schema.description === 'string') {
    doc += `${schema.description}\n\n`;
  }
  
  if (schema instanceof z.ZodObject) {
    doc += generateObjectDoc(schema);
  } else if (schema instanceof z.ZodArray) {
    doc += generateArrayDoc(schema);
  } else if (schema instanceof z.ZodUnion) {
    doc += generateUnionDoc(schema);
  } else if (schema instanceof z.ZodEnum) {
    doc += generateEnumDoc(schema);
  }
  
  return doc;
}

/**
 * Generate object schema documentation
 */
function generateObjectDoc(schema: z.ZodObject<any>): string {
  let doc = '### Properties\n\n';
  doc += '| Property | Type | Required | Default | Description |\n';
  doc += '|----------|------|----------|---------|-------------|\n';
  
  const shape = schema.shape;
  
  for (const [key, value] of Object.entries(shape)) {
    const propSchema = value as z.ZodSchema;
    const type = getTypeDescription(propSchema);
    const required = !propSchema.isOptional() ? '✅' : '❌';
    const defaultValue = getDefaultValue(propSchema);
    const description = getDescription(propSchema);
    
    doc += `| \`${key}\` | ${type} | ${required} | ${defaultValue} | ${description} |\n`;
  }
  
  doc += '\n';
  return doc;
}

/**
 * Generate array schema documentation
 */
function generateArrayDoc(schema: z.ZodArray<any>): string {
  const elementType = getTypeDescription(schema.element);
  return `**Type:** Array of ${elementType}\n\n`;
}

/**
 * Generate union schema documentation
 */
function generateUnionDoc(schema: z.ZodUnion<any>): string {
  const options = schema.options.map((option: z.ZodSchema) => getTypeDescription(option));
  return `**Type:** ${options.join(' | ')}\n\n`;
}

/**
 * Generate enum schema documentation
 */
function generateEnumDoc(schema: z.ZodEnum<any>): string {
  const values = schema.options.map((value: string) => `\`${value}\``);
  return `**Allowed values:** ${values.join(', ')}\n\n`;
}

/**
 * Get type description from schema
 */
function getTypeDescription(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodString) {
    return 'string';
  } else if (schema instanceof z.ZodNumber) {
    return 'number';
  } else if (schema instanceof z.ZodBoolean) {
    return 'boolean';
  } else if (schema instanceof z.ZodArray) {
    const elementType = getTypeDescription(schema.element);
    return `Array<${elementType}>`;
  } else if (schema instanceof z.ZodObject) {
    return 'object';
  } else if (schema instanceof z.ZodUnion) {
    const options = schema.options.map((option: z.ZodSchema) => getTypeDescription(option));
    return options.join(' \\| ');
  } else if (schema instanceof z.ZodEnum) {
    const values = schema.options.map((value: string) => `"${value}"`);
    return values.join(' \\| ');
  } else if (schema instanceof z.ZodOptional) {
    return getTypeDescription(schema.unwrap());
  } else if (schema instanceof z.ZodNullable) {
    const innerType = getTypeDescription(schema.unwrap());
    return `${innerType} \\| null`;
  } else if (schema instanceof z.ZodDefault) {
    return getTypeDescription(schema.removeDefault());
  } else {
    return 'any';
  }
}

/**
 * Get default value from schema
 */
function getDefaultValue(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    if (typeof defaultValue === 'string') {
      return `\`"${defaultValue}"\``;
    } else if (typeof defaultValue === 'boolean' || typeof defaultValue === 'number') {
      return `\`${defaultValue}\``;
    } else if (Array.isArray(defaultValue)) {
      return `\`[${defaultValue.join(', ')}]\``;
    } else if (typeof defaultValue === 'object') {
      return '`{...}`';
    } else {
      return `\`${defaultValue}\``;
    }
  } else if (schema instanceof z.ZodOptional) {
    return 'undefined';
  }
  return '-';
}

/**
 * Get description from schema
 */
function getDescription(schema: z.ZodSchema): string {
  if ('description' in schema && typeof schema.description === 'string') {
    return schema.description;
  }
  return '-';
}

/**
 * Generate environment variables documentation
 */
function generateEnvVarsDoc(): string {
  let doc = '# Environment Variables\n\n';
  doc += 'This document describes all environment variables used by the NextSaaS configuration system.\n\n';
  
  const environments = ['development', 'staging', 'production', 'test'] as const;
  
  for (const env of environments) {
    doc += `## ${env.charAt(0).toUpperCase() + env.slice(1)} Environment\n\n`;
    
    const definitions = generateEnvVarDefinitions(env);
    
    doc += '| Variable | Type | Required | Default | Description |\n';
    doc += '|----------|------|----------|---------|-------------|\n';
    
    for (const def of definitions) {
      const required = def.required ? '✅' : '❌';
      const defaultValue = def.default !== undefined ? `\`${def.default}\`` : '-';
      const description = def.description || '-';
      
      doc += `| \`${def.name}\` | ${def.type} | ${required} | ${defaultValue} | ${description} |\n`;
    }
    
    doc += '\n';
  }
  
  return doc;
}

/**
 * Generate configuration examples
 */
function generateExamplesDoc(): string {
  let doc = '# Configuration Examples\n\n';
  doc += 'This document provides examples of configuration for different environments.\n\n';
  
  // Development example
  doc += '## Development Configuration\n\n';
  doc += '```typescript\n';
  doc += 'import { developmentConfig } from "@nextsaas/config";\n\n';
  doc += 'const config = {\n';
  doc += '  ...developmentConfig,\n';
  doc += '  // Override specific settings\n';
  doc += '  database: {\n';
  doc += '    url: "postgresql://localhost:5432/myapp_dev",\n';
  doc += '  },\n';
  doc += '  auth: {\n';
  doc += '    jwt: {\n';
  doc += '      secret: "my-dev-secret",\n';
  doc += '      expiresIn: "24h",\n';
  doc += '    },\n';
  doc += '  },\n';
  doc += '};\n';
  doc += '```\n\n';
  
  // Production example
  doc += '## Production Configuration\n\n';
  doc += '```typescript\n';
  doc += 'import { productionConfig } from "@nextsaas/config";\n\n';
  doc += 'const config = {\n';
  doc += '  ...productionConfig,\n';
  doc += '  database: {\n';
  doc += '    url: process.env.DATABASE_URL,\n';
  doc += '    ssl: { enabled: true },\n';
  doc += '  },\n';
  doc += '  auth: {\n';
  doc += '    jwt: {\n';
  doc += '      secret: process.env.JWT_SECRET,\n';
  doc += '      expiresIn: "24h",\n';
  doc += '    },\n';
  doc += '  },\n';
  doc += '};\n';
  doc += '```\n\n';
  
  // Environment file examples
  doc += '## Environment File Examples\n\n';
  doc += '### .env.development\n\n';
  doc += '```bash\n';
  doc += 'NODE_ENV=development\n';
  doc += 'DEBUG=true\n';
  doc += 'DATABASE_URL=postgresql://localhost:5432/myapp_dev\n';
  doc += 'JWT_SECRET=dev-secret-change-in-production\n';
  doc += 'SESSION_SECRET=dev-session-secret-change-in-production\n';
  doc += '```\n\n';
  
  doc += '### .env.production\n\n';
  doc += '```bash\n';
  doc += 'NODE_ENV=production\n';
  doc += 'DEBUG=false\n';
  doc += 'DATABASE_URL=postgresql://prod-db-host:5432/myapp_prod\n';
  doc += 'JWT_SECRET=super-secure-jwt-secret-at-least-32-chars\n';
  doc += 'SESSION_SECRET=super-secure-session-secret-at-least-32-chars\n';
  doc += 'SENDGRID_API_KEY=your-sendgrid-api-key\n';
  doc += 'STRIPE_SECRET_KEY=sk_live_your-stripe-secret\n';
  doc += '```\n\n';
  
  return doc;
}

/**
 * Generate usage documentation
 */
function generateUsageDoc(): string {
  let doc = '# Configuration Usage Guide\n\n';
  doc += 'This guide shows how to use the NextSaaS configuration system in your application.\n\n';
  
  doc += '## Quick Start\n\n';
  doc += '```typescript\n';
  doc += 'import { initializeGlobalConfig, config } from "@nextsaas/config";\n\n';
  doc += '// Initialize configuration\n';
  doc += 'await initializeGlobalConfig();\n\n';
  doc += '// Access configuration\n';
  doc += 'const dbConfig = config.database();\n';
  doc += 'const isFeatureEnabled = config.feature("aiIntegration");\n';
  doc += 'const appName = config.value("app.name");\n';
  doc += '```\n\n';
  
  doc += '## Using ConfigManager\n\n';
  doc += '```typescript\n';
  doc += 'import { ConfigManager } from "@nextsaas/config";\n\n';
  doc += 'const manager = new ConfigManager("production");\n';
  doc += 'await manager.initialize();\n\n';
  doc += '// Get typed configuration sections\n';
  doc += 'const authConfig = manager.getAuthConfig();\n';
  doc += 'const emailConfig = manager.getEmailConfig();\n\n';
  doc += '// Watch for configuration changes\n';
  doc += 'manager.watch((event) => {\n';
  doc += '  console.log("Config changed:", event.changes);\n';
  doc += '});\n';
  doc += '```\n\n';
  
  doc += '## React Integration\n\n';
  doc += '```tsx\n';
  doc += 'import { ConfigProvider, useConfig, FeatureGate } from "@nextsaas/config";\n\n';
  doc += 'function App() {\n';
  doc += '  return (\n';
  doc += '    <ConfigProvider>\n';
  doc += '      <MyComponent />\n';
  doc += '    </ConfigProvider>\n';
  doc += '  );\n';
  doc += '}\n\n';
  doc += 'function MyComponent() {\n';
  doc += '  const { config } = useConfig();\n';
  doc += '  const authConfig = useAuthConfig();\n\n';
  doc += '  return (\n';
  doc += '    <div>\n';
  doc += '      <h1>{config.app.name}</h1>\n';
  doc += '      <FeatureGate feature="aiIntegration">\n';
  doc += '        <AIComponent />\n';
  doc += '      </FeatureGate>\n';
  doc += '    </div>\n';
  doc += '  );\n';
  doc += '}\n';
  doc += '```\n\n';
  
  return doc;
}

/**
 * Generate complete documentation
 */
async function generateDocs(options: DocGenerationOptions): Promise<void> {
  const { outputDir, includeExamples, includeEnvVars, includeSchemas } = options;
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate main README
  let readme = '# NextSaaS Configuration Documentation\n\n';
  readme += 'Comprehensive configuration system for NextSaaS applications.\n\n';
  readme += '## Table of Contents\n\n';
  readme += '- [Usage Guide](./usage.md)\n';
  readme += '- [Configuration Schemas](./schemas.md)\n';
  readme += '- [Environment Variables](./environment-variables.md)\n';
  readme += '- [Examples](./examples.md)\n\n';
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  
  // Generate usage documentation
  const usageDoc = generateUsageDoc();
  fs.writeFileSync(path.join(outputDir, 'usage.md'), usageDoc);
  
  // Generate schema documentation
  if (includeSchemas) {
    let schemasDoc = '# Configuration Schemas\n\n';
    schemasDoc += 'This document describes all configuration schemas in the NextSaaS system.\n\n';
    
    // Base configuration
    schemasDoc += generateSchemaDoc(baseConfigSchema, 'Base Configuration');
    
    // Individual schemas
    const schemaNames = [
      'authConfigSchema',
      'billingConfigSchema',
      'databaseConfigSchema',
      'emailConfigSchema',
      'integrationsConfigSchema',
      'monitoringConfigSchema',
      'storageConfigSchema',
    ];
    
    for (const schemaName of schemaNames) {
      const schema = (schemas as any)[schemaName];
      if (schema instanceof z.ZodSchema) {
        const displayName = schemaName.replace('ConfigSchema', ' Configuration').replace(/([A-Z])/g, ' $1').trim();
        schemasDoc += generateSchemaDoc(schema, displayName);
      }
    }
    
    fs.writeFileSync(path.join(outputDir, 'schemas.md'), schemasDoc);
  }
  
  // Generate environment variables documentation
  if (includeEnvVars) {
    const envVarsDoc = generateEnvVarsDoc();
    fs.writeFileSync(path.join(outputDir, 'environment-variables.md'), envVarsDoc);
  }
  
  // Generate examples documentation
  if (includeExamples) {
    const examplesDoc = generateExamplesDoc();
    fs.writeFileSync(path.join(outputDir, 'examples.md'), examplesDoc);
  }
}

// CLI setup
program
  .name('generate-docs')
  .description('Generate configuration documentation')
  .version('1.0.0');

program
  .option('-o, --output <dir>', 'Output directory', './docs')
  .option('--no-examples', 'Skip generating examples')
  .option('--no-env-vars', 'Skip generating environment variables docs')
  .option('--no-schemas', 'Skip generating schema docs')
  .option('-f, --format <format>', 'Output format (markdown, html)', 'markdown')
  .action(async (options) => {
    try {
      console.log('📚 Generating configuration documentation...');
      
      const outputDir = path.resolve(process.cwd(), options.output);
      
      const docOptions: DocGenerationOptions = {
        outputDir,
        includeExamples: options.examples !== false,
        includeEnvVars: options.envVars !== false,
        includeSchemas: options.schemas !== false,
        format: options.format,
      };
      
      await generateDocs(docOptions);
      
      console.log('✅ Documentation generated successfully!');
      console.log(`   Output: ${outputDir}`);
      console.log('   Files:');
      console.log('   - README.md');
      console.log('   - usage.md');
      if (docOptions.includeSchemas) console.log('   - schemas.md');
      if (docOptions.includeEnvVars) console.log('   - environment-variables.md');
      if (docOptions.includeExamples) console.log('   - examples.md');
      
    } catch (error) {
      console.error('❌ Failed to generate documentation:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export for direct usage
export { generateDocs };