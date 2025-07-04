import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      incremental: false
    }
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['next', 'react', 'next-auth'],
})