import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.tsx',
    'hooks/index': 'src/hooks/index.ts',
    'lib/index': 'src/lib/index.ts',
    'middleware/index': 'src/middleware/index.ts',
    'types/index': 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      incremental: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@nextsaas/ui',
    '@nextsaas/config',
    '@nextsaas/utils',
    '@nextsaas/auth',
    '@nextsaas/multi-tenant',
  ],
})