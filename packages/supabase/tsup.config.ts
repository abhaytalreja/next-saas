import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts',
    client: 'src/client.ts',
    hooks: 'src/hooks.ts'
  },
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to type errors
  sourcemap: true,
  external: [
    'react', 
    'react-dom', 
    'next',
    '@supabase/supabase-js',
    '@supabase/ssr',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react',
    '@supabase/storage-js',
    '@supabase/realtime-js',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'backblaze-b2',
    'sharp',
    'file-type',
    'mime-types'
  ],
  clean: true,
  minify: false,
  splitting: false,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist'
});