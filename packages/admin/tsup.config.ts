import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@nextsaas/auth',
    '@nextsaas/database',
    '@nextsaas/multi-tenant',
    '@nextsaas/supabase',
    '@nextsaas/ui',
    '@nextsaas/utils'
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";'
    }
  }
})