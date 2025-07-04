#!/usr/bin/env tsx

import { generateTypesFile, TypeGenerationOptions } from '../src/type-generator';
import { program } from 'commander';
import * as path from 'path';

/**
 * Auto-generation script for TypeScript types
 * 
 * This script generates TypeScript type definitions from Zod schemas
 * and saves them to the specified output file.
 */

program
  .name('generate-types')
  .description('Generate TypeScript types from configuration schemas')
  .version('1.0.0');

program
  .option('-o, --output <path>', 'Output file path', './src/types/generated.ts')
  .option('-n, --namespace <name>', 'Namespace for generated types')
  .option('--no-comments', 'Skip generating comments')
  .option('--no-export', 'Skip export keywords')
  .option('--interfaces', 'Generate interfaces instead of types', false)
  .option('--enums', 'Generate enums', true)
  .action(async (options) => {
    try {
      console.log('🔄 Generating TypeScript types...');
      
      const outputPath = path.resolve(process.cwd(), options.output);
      
      const generationOptions: TypeGenerationOptions = {
        includeComments: options.comments !== false,
        exportTypes: options.export !== false,
        generateInterfaces: options.interfaces,
        generateEnums: options.enums,
        namespace: options.namespace,
      };
      
      await generateTypesFile(outputPath, generationOptions);
      
      console.log('✅ TypeScript types generated successfully!');
      console.log(`   Output: ${outputPath}`);
      
      if (generationOptions.namespace) {
        console.log(`   Namespace: ${generationOptions.namespace}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to generate types:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export for direct usage
export { generateTypesFile };