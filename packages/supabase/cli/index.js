#!/usr/bin/env node

const { program } = require('commander');
const { execSync } = require('child_process');
const path = require('path');

program
  .name('nextsaas-supabase')
  .description('NextSaaS Supabase CLI tools')
  .version('1.0.0');

program
  .command('types')
  .description('Generate TypeScript types from Supabase schema')
  .action(() => {
    execSync('tsx cli/commands/types.ts generate', {
      stdio: 'inherit',
      cwd: path.dirname(__dirname),
    });
  });

program
  .command('migrate')
  .argument('<action>', 'Migration action (up, down, create)')
  .description('Run database migrations')
  .action((action) => {
    execSync(`tsx cli/commands/migrate.ts ${action}`, {
      stdio: 'inherit',
      cwd: path.dirname(__dirname),
    });
  });

program
  .command('seed')
  .argument('<action>', 'Seed action (run, reset)')
  .description('Manage database seeds')
  .action((action) => {
    execSync(`tsx cli/commands/seed.ts ${action}`, {
      stdio: 'inherit',
      cwd: path.dirname(__dirname),
    });
  });

program.parse();