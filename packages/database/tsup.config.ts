import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/queries/index.ts',
    'src/types/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to type errors
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@supabase/supabase-js', 'pg', 'postgres'],
})