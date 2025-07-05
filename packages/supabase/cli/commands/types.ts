#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Generate TypeScript types from Supabase schema
 */
export async function generateTypes(): Promise<void> {
  const spinner = ora('Generating TypeScript types from Supabase schema...').start();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    }

    // Use Supabase CLI to generate types
    const command = `npx supabase gen types typescript --project-id ${supabaseUrl.split('.')[0].split('//')[1]} --schema public`;
    
    const types = execSync(command, { encoding: 'utf8' });
    
    // Write types to file
    const typesPath = join(process.cwd(), 'src/types/supabase.ts');
    writeFileSync(typesPath, types);

    spinner.succeed(chalk.green('TypeScript types generated successfully!'));
    console.log(chalk.blue(`Types written to: ${typesPath}`));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to generate types'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// CLI handler
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'generate':
      generateTypes();
      break;
    default:
      console.log(`
${chalk.bold('Supabase Types CLI')}

Usage:
  tsx cli/commands/types.ts <command>

Commands:
  generate    Generate TypeScript types from Supabase schema

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL      Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY     Your Supabase service role key
      `);
  }
}