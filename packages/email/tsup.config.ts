import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    templates: 'src/templates/index.ts',
    providers: 'src/providers/index.ts',
    components: 'src/components/index.ts',
  },
  format: ['cjs', 'esm'],
  target: 'node16',
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    '@nextsaas/supabase',
    '@nextsaas/config',
    '@nextsaas/database',
    '@nextsaas/multi-tenant',
    '@react-email/components',
    '@react-email/render',
    '@react-email/tailwind',
    '@sendgrid/mail',
    'resend',
    'html-to-text',
    'zod'
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  }
})