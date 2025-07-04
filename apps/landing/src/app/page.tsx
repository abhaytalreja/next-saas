'use client'

import { Button } from '@nextsaas/ui'
import Link from 'next/link'
import { motion } from 'framer-motion'
export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">NextSaaS</div>
        <div className="flex gap-6 items-center">
          <Link href="http://localhost:3001" className="hover:text-gray-600">Docs</Link>
          <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
          <Link href="/blog" className="hover:text-gray-600">Blog</Link>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            🌐 <span className="hidden sm:inline">6 Languages</span>
          </div>
          <Button variant="outline" size="sm">Sign In</Button>
          <Button size="sm">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.h1 
          className="text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Build Your SaaS
          <span className="text-orange-600"> 10x Faster</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Production-ready starter with <strong>internationalization</strong>, <strong>quality guard rails</strong>, 
          and <strong>industry-specific customization</strong>. Built with Next.js 15, TypeScript, and Turborepo.
        </motion.p>
        <motion.div 
          className="flex gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg">Get Started Free</Button>
          <Button variant="outline" size="lg">View Demo</Button>
        </motion.div>
        <motion.div 
          className="flex flex-wrap gap-6 justify-center text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            🌐 <span>6 Languages</span>
          </div>
          <div className="flex items-center gap-2">
            🛡️ <span>Guard Rails</span>
          </div>
          <div className="flex items-center gap-2">
            🎯 <span>Use Case Ready</span>
          </div>
          <div className="flex items-center gap-2">
            ⚡ <span>HubSpot Design</span>
          </div>
        </motion.div>
      </section>

      {/* New Features Spotlight */}
      <section className="bg-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🚀 Latest Features</h2>
            <p className="text-xl text-gray-600">Production-ready enhancements to accelerate your SaaS development</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg border-2 border-orange-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-semibold mb-4 text-orange-600">Global Ready</h3>
              <p className="text-gray-600 mb-4">
                Full internationalization with 6 languages (EN, ES, FR, DE, JA, ZH). 
                SEO-optimized with proper hreflang tags and automatic locale detection.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• JSON-based translation system</li>
                <li>• Dynamic language switching</li>
                <li>• TypeScript support</li>
                <li>• Performance optimized</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Quality Guard Rails</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive quality assurance with pre/post-commit hooks, 
                ESLint rules, and automated validation to maintain code excellence.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Pre-commit validation</li>
                <li>• Component API checks</li>
                <li>• Design token validation</li>
                <li>• Automated roadmap updates</li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-green-600">Use Case Templates</h3>
              <p className="text-gray-600 mb-4">
                Industry-specific configurations for Real Estate, Crypto/DeFi, and more. 
                Instant customization with branding, content, and feature sets.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Real Estate template</li>
                <li>• Crypto/DeFi template</li>
                <li>• Custom branding</li>
                <li>• Feature toggles</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getCoreFeatures().map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Updated CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Global SaaS?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join developers worldwide using NextSaaS with internationalization, 
            quality guard rails, and industry templates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              Start Building Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
              View Live Demo →
            </Button>
          </div>
          <div className="mt-8 text-sm text-orange-200">
            ✨ New: Internationalization • Guard Rails • Use Case Templates
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2024 NextSaaS. All rights reserved. • Built with ❤️ for the global developer community</p>
        </div>
      </footer>
    </div>
  )
}

const getCoreFeatures = () => [
  {
    icon: '🚀',
    title: 'Production Ready',
    description: 'Built with best practices and ready to scale from day one with HubSpot-inspired design system.'
  },
  {
    icon: '🔒',
    title: 'Authentication',
    description: 'Complete auth system with Supabase integration and role-based access control.'
  },
  {
    icon: '💳',
    title: 'Payments',
    description: 'Stripe integration for subscriptions and one-time payments with invoice management.'
  },
  {
    icon: '🎨',
    title: 'UI Components',
    description: 'Beautiful, accessible components with HubSpot design tokens and Tailwind CSS.'
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Built-in analytics dashboard to track your business metrics and user engagement.'
  },
  {
    icon: '🔧',
    title: 'Developer Experience',
    description: 'TypeScript, ESLint, Prettier, Turborepo, and comprehensive documentation.'
  }
]