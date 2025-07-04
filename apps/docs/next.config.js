/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nextsaas/ui", "@nextsaas/utils"],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = nextConfig;