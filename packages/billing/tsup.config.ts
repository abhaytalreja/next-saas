import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/stripe/index.ts',
    'src/usage/index.ts', 
    'src/pricing/index.ts',
    'src/gating/index.ts',
    'src/components/index.ts',
    'src/hooks/index.ts'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next'],
})