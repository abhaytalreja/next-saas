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
          <Link href="/docs" className="hover:text-gray-600">Docs</Link>
          <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
          <Link href="/blog" className="hover:text-gray-600">Blog</Link>
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
          <span className="text-blue-600"> 10x Faster</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          NextSaaS is a production-ready starter kit with everything you need to launch your SaaS. 
          Built with Next.js 15, TypeScript, and Turborepo.
        </motion.p>
        <motion.div 
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg">Get Started Free</Button>
          <Button variant="outline" size="lg">View Demo</Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your SaaS?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of developers who are building faster with NextSaaS
          </p>
          <Button size="lg" variant="secondary">
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 NextSaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: '🚀',
    title: 'Production Ready',
    description: 'Built with best practices and ready to scale from day one.'
  },
  {
    icon: '🔒',
    title: 'Authentication',
    description: 'Complete auth system with Supabase integration.'
  },
  {
    icon: '💳',
    title: 'Payments',
    description: 'Stripe integration for subscriptions and one-time payments.'
  },
  {
    icon: '🎨',
    title: 'UI Components',
    description: 'Beautiful, accessible components built with Radix UI.'
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Built-in analytics to track your business metrics.'
  },
  {
    icon: '🔧',
    title: 'Developer Experience',
    description: 'TypeScript, ESLint, Prettier, and more configured.'
  }
]