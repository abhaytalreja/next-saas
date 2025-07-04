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
}

module.exports = nextConfig