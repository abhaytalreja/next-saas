import { z } from 'zod';
import { baseConfigSchema } from './environments/base';
import * as schemas from './schemas';

/**
 * Type Generator for Configuration Schemas
 * 
 * This module provides utilities to generate TypeScript type definitions
 * from Zod schemas automatically. It ensures type safety and provides
 * better developer experience with auto-completion and type checking.
 */

// Type generation options
export interface TypeGenerationOptions {
  outputPath?: string;
  includeComments?: boolean;
  exportTypes?: boolean;
  generateInterfaces?: boolean;
  generateEnums?: boolean;
  includeValidation?: boolean;
  namespace?: string;
}

// Generated type information
export interface GeneratedType {
  name: string;
  definition: string;
  description?: string;
  dependencies: string[];
}

/**
 * Extract type information from Zod schema
 */
export function extractTypeFromSchema(schema: z.ZodSchema, name: string): GeneratedType {
  const dependencies: string[] = [];
  let definition = '';
  let description = '';

  // Get description from schema if available
  if ('description' in schema && typeof schema.description === 'string') {
    description = schema.description;
  }

  // Generate type definition based on schema type
  if (schema instanceof z.ZodObject) {
    definition = generateObjectType(schema, name, dependencies);
  } else if (schema instanceof z.ZodArray) {
    definition = generateArrayType(schema, name, dependencies);
  } else if (schema instanceof z.ZodUnion) {
    definition = generateUnionType(schema, name, dependencies);
  } else if (schema instanceof z.ZodEnum) {
    definition = generateEnumType(schema, name);
  } else if (schema instanceof z.ZodString) {
    definition = 'string';
  } else if (schema instanceof z.ZodNumber) {
    definition = 'number';
  } else if (schema instanceof z.ZodBoolean) {
    definition = 'boolean';
  } else {
    definition = 'any';
  }

  return {
    name,
    definition,
    description,
    dependencies,
  };
}

/**
 * Generate object type from ZodObject
 */
function generateObjectType(schema: z.ZodObject<any>, name: string, dependencies: string[]): string {
  const shape = schema.shape;
  const properties: string[] = [];

  for (const [key, value] of Object.entries(shape)) {
    const propSchema = value as z.ZodSchema;
    const propType = getTypeString(propSchema, dependencies);
    const isOptional = propSchema.isOptional();
    
    let propDescription = '';
    if ('description' in propSchema && typeof propSchema.description === 'string') {
      propDescription = `  /** ${propSchema.description} */\n`;
    }
    
    properties.push(`${propDescription}  ${key}${isOptional ? '?' : ''}: ${propType};`);
  }

  return `{\n${properties.join('\n')}\n}`;
}

/**
 * Generate array type from ZodArray
 */
function generateArrayType(schema: z.ZodArray<any>, name: string, dependencies: string[]): string {
  const elementType = getTypeString(schema.element, dependencies);
  return `Array<${elementType}>`;
}

/**
 * Generate union type from ZodUnion
 */
function generateUnionType(schema: z.ZodUnion<any>, name: string, dependencies: string[]): string {
  const options = schema.options.map((option: z.ZodSchema) => getTypeString(option, dependencies));
  return options.join(' | ');
}

/**
 * Generate enum type from ZodEnum
 */
function generateEnumType(schema: z.ZodEnum<any>, name: string): string {
  const values = schema.options.map((value: string) => `'${value}'`);
  return values.join(' | ');
}

/**
 * Get type string from schema
 */
function getTypeString(schema: z.ZodSchema, dependencies: string[]): string {
  if (schema instanceof z.ZodString) {
    return 'string';
  } else if (schema instanceof z.ZodNumber) {
    return 'number';
  } else if (schema instanceof z.ZodBoolean) {
    return 'boolean';
  } else if (schema instanceof z.ZodArray) {
    const elementType = getTypeString(schema.element, dependencies);
    return `Array<${elementType}>`;
  } else if (schema instanceof z.ZodObject) {
    // For nested objects, we might want to generate a separate type
    return 'object';
  } else if (schema instanceof z.ZodUnion) {
    const options = schema.options.map((option: z.ZodSchema) => getTypeString(option, dependencies));
    return options.join(' | ');
  } else if (schema instanceof z.ZodEnum) {
    const values = schema.options.map((value: string) => `'${value}'`);
    return values.join(' | ');
  } else if (schema instanceof z.ZodOptional) {
    return getTypeString(schema.unwrap(), dependencies);
  } else if (schema instanceof z.ZodNullable) {
    const innerType = getTypeString(schema.unwrap(), dependencies);
    return `${innerType} | null`;
  } else if (schema instanceof z.ZodDefault) {
    return getTypeString(schema.removeDefault(), dependencies);
  } else {
    return 'any';
  }
}

/**
 * Generate TypeScript definitions for all configuration schemas
 */
export function generateConfigTypes(options: TypeGenerationOptions = {}): string {
  const {
    includeComments = true,
    exportTypes = true,
    generateInterfaces = true,
    namespace,
  } = options;

  let output = '';

  // Add header
  if (includeComments) {
    output += `/**\n`;
    output += ` * Auto-generated TypeScript types for NextSaaS Configuration\n`;
    output += ` * \n`;
    output += ` * This file is automatically generated from Zod schemas.\n`;
    output += ` * Do not edit manually - regenerate using the type generator.\n`;
    output += ` * \n`;
    output += ` * Generated on: ${new Date().toISOString()}\n`;
    output += ` */\n\n`;
  }

  // Add imports
  output += `import { z } from 'zod';\n\n`;

  // Start namespace if specified
  if (namespace) {
    output += `export namespace ${namespace} {\n`;
  }

  // Generate base configuration type
  const baseType = extractTypeFromSchema(baseConfigSchema, 'BaseConfig');
  
  if (includeComments && baseType.description) {
    output += `  /**\n   * ${baseType.description}\n   */\n`;
  }
  
  const exportKeyword = exportTypes && !namespace ? 'export ' : '';
  const indentation = namespace ? '  ' : '';
  
  if (generateInterfaces) {
    output += `${indentation}${exportKeyword}interface BaseConfig ${baseType.definition}\n\n`;
  } else {
    output += `${indentation}${exportKeyword}type BaseConfig = ${baseType.definition};\n\n`;
  }

  // Generate individual schema types
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
      const typeName = schemaName.replace('Schema', '').replace('Config', 'Config');
      const capitalizedTypeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      
      const typeInfo = extractTypeFromSchema(schema, capitalizedTypeName);
      
      if (includeComments && typeInfo.description) {
        output += `${indentation}/**\n${indentation} * ${typeInfo.description}\n${indentation} */\n`;
      }
      
      if (generateInterfaces) {
        output += `${indentation}${exportKeyword}interface ${capitalizedTypeName} ${typeInfo.definition}\n\n`;
      } else {
        output += `${indentation}${exportKeyword}type ${capitalizedTypeName} = ${typeInfo.definition};\n\n`;
      }
    }
  }

  // Generate environment type
  output += `${indentation}${exportKeyword}type Environment = 'development' | 'staging' | 'production' | 'test';\n\n`;

  // Generate utility types
  output += `${indentation}${exportKeyword}type ConfigSection<K extends keyof BaseConfig> = BaseConfig[K];\n\n`;

  // Generate feature flag types
  output += `${indentation}${exportKeyword}type FeatureFlag = keyof BaseConfig['features'];\n\n`;

  // Close namespace if specified
  if (namespace) {
    output += `}\n`;
  }

  return output;
}

/**
 * Generate environment variable types
 */
export function generateEnvVarTypes(options: TypeGenerationOptions = {}): string {
  const {
    includeComments = true,
    exportTypes = true,
    namespace,
  } = options;

  let output = '';

  // Add header
  if (includeComments) {
    output += `/**\n`;
    output += ` * Environment Variable Types\n`;
    output += ` * \n`;
    output += ` * Generated on: ${new Date().toISOString()}\n`;
    output += ` */\n\n`;
  }

  const exportKeyword = exportTypes && !namespace ? 'export ' : '';
  const indentation = namespace ? '  ' : '';

  // Start namespace if specified
  if (namespace) {
    output += `export namespace ${namespace} {\n`;
  }

  // Generate environment variable interface
  output += `${indentation}${exportKeyword}interface ProcessEnv {\n`;
  
  // Common environment variables
  const envVars = [
    { name: 'NODE_ENV', type: 'Environment', required: true, description: 'Node environment' },
    { name: 'DEBUG', type: 'string', required: false, description: 'Debug flag' },
    { name: 'LOG_LEVEL', type: 'string', required: false, description: 'Logging level' },
    { name: 'PORT', type: 'string', required: false, description: 'Server port' },
    { name: 'HOST', type: 'string', required: false, description: 'Server host' },
    { name: 'DATABASE_URL', type: 'string', required: true, description: 'Database connection URL' },
    { name: 'JWT_SECRET', type: 'string', required: true, description: 'JWT secret key' },
    { name: 'SESSION_SECRET', type: 'string', required: true, description: 'Session secret key' },
    { name: 'FROM_EMAIL', type: 'string', required: false, description: 'Default sender email' },
    { name: 'STRIPE_SECRET_KEY', type: 'string', required: false, description: 'Stripe secret key' },
    { name: 'AWS_ACCESS_KEY_ID', type: 'string', required: false, description: 'AWS access key ID' },
    { name: 'AWS_SECRET_ACCESS_KEY', type: 'string', required: false, description: 'AWS secret access key' },
    { name: 'REDIS_URL', type: 'string', required: false, description: 'Redis connection URL' },
  ];

  for (const envVar of envVars) {
    if (includeComments && envVar.description) {
      output += `${indentation}  /** ${envVar.description} */\n`;
    }
    const optional = envVar.required ? '' : '?';
    output += `${indentation}  ${envVar.name}${optional}: ${envVar.type};\n`;
  }

  output += `${indentation}}\n\n`;

  // Close namespace if specified
  if (namespace) {
    output += `}\n`;
  }

  return output;
}

/**
 * Generate validation helper types
 */
export function generateValidationTypes(options: TypeGenerationOptions = {}): string {
  const {
    includeComments = true,
    exportTypes = true,
    namespace,
  } = options;

  let output = '';

  const exportKeyword = exportTypes && !namespace ? 'export ' : '';
  const indentation = namespace ? '  ' : '';

  // Start namespace if specified
  if (namespace) {
    output += `export namespace ${namespace} {\n`;
  }

  // Validation result type
  output += `${indentation}${exportKeyword}interface ValidationResult<T = any> {\n`;
  output += `${indentation}  valid: boolean;\n`;
  output += `${indentation}  data?: T;\n`;
  output += `${indentation}  errors: string[];\n`;
  output += `${indentation}}\n\n`;

  // Configuration load result type
  output += `${indentation}${exportKeyword}interface ConfigLoadResult {\n`;
  output += `${indentation}  config: BaseConfig;\n`;
  output += `${indentation}  environment: Environment;\n`;
  output += `${indentation}  validationErrors: string[];\n`;
  output += `${indentation}  missingEnvVars: string[];\n`;
  output += `${indentation}  warnings: string[];\n`;
  output += `${indentation}}\n\n`;

  // Close namespace if specified
  if (namespace) {
    output += `}\n`;
  }

  return output;
}

/**
 * Generate all types and combine them
 */
export function generateAllTypes(options: TypeGenerationOptions = {}): string {
  let output = '';
  
  output += generateConfigTypes(options);
  output += '\n';
  output += generateEnvVarTypes(options);
  output += '\n';
  output += generateValidationTypes(options);
  
  return output;
}

/**
 * CLI function to generate types
 */
export async function generateTypesFile(outputPath: string, options: TypeGenerationOptions = {}): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  
  const typeDefinitions = generateAllTypes(options);
  const fullPath = path.resolve(outputPath);
  
  // Ensure directory exists
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, typeDefinitions);
  console.log(`✅ Types generated successfully: ${fullPath}`);
}

// Export utility functions
export const typeGenerator = {
  extractTypeFromSchema,
  generateConfigTypes,
  generateEnvVarTypes,
  generateValidationTypes,
  generateAllTypes,
  generateTypesFile,
};

export default typeGenerator;