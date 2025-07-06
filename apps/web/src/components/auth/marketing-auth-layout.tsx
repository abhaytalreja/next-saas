'use client'

import { ThemeSwitcher } from '@nextsaas/ui/client'
import Link from 'next/link'
import { Button } from '@nextsaas/ui'

interface MarketingAuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  type: 'signin' | 'signup' | 'reset'
}

const features = [
  {
    icon: '🌐',
    title: 'Global Ready',
    description: 'Built-in internationalization with 6 languages'
  },
  {
    icon: '🛡️',
    title: 'Enterprise Security',
    description: 'Bank-level security with role-based access'
  },
  {
    icon: '🚀',
    title: 'Lightning Fast',
    description: 'Optimized for performance and scalability'
  }
]

const testimonials = [
  {
    text: "NextSaaS saved us months of development time. The auth system just works!",
    author: "Sarah Chen",
    role: "CTO, TechStart"
  },
  {
    text: "The internationalization features helped us expand globally in weeks.",
    author: "Marcus Rodriguez", 
    role: "Founder, GlobalApp"
  }
]

export function MarketingAuthLayout({ children, title, subtitle, type }: MarketingAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="http://localhost:3002" className="text-2xl font-bold text-gray-900 dark:text-white">
            NextSaaS
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="http://localhost:3002">
              <Button variant="ghost" size="sm">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-20">
        {/* Left Side - Minimalist Marketing Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col justify-center items-center text-center p-12 w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                {type === 'signup' && 'Build Your SaaS'}
                {type === 'signin' && 'Welcome Back'}
                {type === 'reset' && 'Reset Password'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {type === 'signup' && 'Production-ready starter with everything you need'}
                {type === 'signin' && 'Continue building amazing things'}
                {type === 'reset' && 'Get back to building in seconds'}
              </p>
              
              {/* Simple stats for signup */}
              {type === 'signup' && (
                <div className="flex justify-center gap-8 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>🌐 6 Languages</span>
                  <span>🛡️ Enterprise Security</span>
                  <span>💰 100% Free</span>
                </div>
              )}
            </div>

            {/* Key features - minimal */}
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Everything Ready</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auth • Payments • i18n • Dark Mode
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Production Grade</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  TypeScript • Tests • CI/CD • Documentation
                </p>
              </div>
              {type === 'signup' && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Open Source</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    MIT License • No Vendor Lock-in
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile Header for smaller screens */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
            </div>

            {/* Auth Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="hidden lg:block text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
              </div>

              {children}

              {/* Social Proof for mobile */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Trusted by developers worldwide
                  </p>
                  <div className="flex justify-center items-center gap-6 text-xs text-gray-400">
                    <span>🌐 6 Languages</span>
                    <span>🛡️ Enterprise Security</span>
                    <span>🚀 Production Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative actions */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {type === 'signup' && (
                <>
                  Already have an account?{' '}
                  <Link href="/auth/sign-in" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium">
                    Sign in
                  </Link>
                </>
              )}
              {type === 'signin' && (
                <>
                  Don't have an account?{' '}
                  <Link href="/auth/sign-up" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium">
                    Sign up for free
                  </Link>
                </>
              )}
              {type === 'reset' && (
                <>
                  Remember your password?{' '}
                  <Link href="/auth/sign-in" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium">
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 text-center">
              <div className="flex justify-center items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>🔒</span>
                <span>Secured by enterprise-grade encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}