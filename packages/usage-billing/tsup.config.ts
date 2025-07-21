import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    'src/index.ts',
    'src/hooks/index.ts',
    'src/components/index.ts', 
    'src/services/index.ts'
  ],
  format: ['cjs', 'esm'],
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
  onSuccess: 'echo "✅ @nextsaas/usage-billing built successfully"'
})