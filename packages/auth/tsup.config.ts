import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.tsx',
    'hooks/index': 'src/hooks/index.ts',
    'providers/index': 'src/providers/index.tsx',
    'middleware/index': 'src/middleware/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
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
    '@nextsaas/supabase',
  ],
})
