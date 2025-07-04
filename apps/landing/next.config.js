const { i18n } = require('../../next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nextsaas/ui'],
  images: {
    domains: ['localhost', 'images.unsplash.com']
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'framer-motion']
  },
  i18n,
}

module.exports = nextConfig