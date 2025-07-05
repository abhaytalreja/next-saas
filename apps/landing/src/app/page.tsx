import { Button } from '@nextsaas/ui'
import { ClientHeader } from '../components/client-header'
import { AnimatedHero, AnimatedFeatures, AnimatedSpotlight } from '../components/client-animations'
import { PricingSectionWithData } from '../components/pricing-section-server'

// Server-side data - perfect for SEO
const heroData = {
  title: "Build Your SaaS",
  titleAccent: "10x Faster", 
  description: `Production-ready starter with <strong class="text-orange-600 dark:text-orange-400">internationalization</strong>, <strong class="text-orange-600 dark:text-orange-400">quality guard rails</strong>, and <strong class="text-orange-600 dark:text-orange-400">industry-specific customization</strong>. Built with Next.js 15, TypeScript, and Turborepo.`,
  features: [
    "🌐 6 Languages",
    "🛡️ Guard Rails", 
    "🎯 Use Case Ready",
    "💰 100% Free"
  ]
};

const spotlightFeatures = [
  {
    icon: "🌐",
    title: "Global Ready",
    description: "Full internationalization with 6 languages (EN, ES, FR, DE, JA, ZH). SEO-optimized with proper hreflang tags and automatic locale detection.",
    items: [
      "JSON-based translation system",
      "Dynamic language switching", 
      "TypeScript support",
      "Performance optimized"
    ],
    colorClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-200 dark:border-orange-600"
  },
  {
    icon: "🛡️", 
    title: "Quality Guard Rails",
    description: "Comprehensive quality assurance with pre/post-commit hooks, ESLint rules, and automated validation to maintain code excellence.",
    items: [
      "Pre-commit validation",
      "Component API checks",
      "Design token validation", 
      "Automated roadmap updates"
    ],
    colorClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-200 dark:border-blue-600"
  },
  {
    icon: "🎯",
    title: "Use Case Templates", 
    description: "Industry-specific configurations for Real Estate, Crypto/DeFi, and more. Instant customization with branding, content, and feature sets.",
    items: [
      "Real Estate template",
      "Crypto/DeFi template",
      "Custom branding",
      "Feature toggles"
    ],
    colorClass: "text-green-600 dark:text-green-400",
    borderClass: "border-green-200 dark:border-green-600"
  }
];

const coreFeatures = [
  {
    icon: '🌐',
    title: 'Internationalization',
    description: 'Full i18n support with 6 languages, automatic locale detection, and SEO optimization.'
  },
  {
    icon: '🌓',
    title: 'Dark Mode',
    description: 'Complete light/dark theme system with automatic detection and smooth transitions.'
  },
  {
    icon: '🚀',
    title: 'Production Ready',
    description: 'Built with best practices and ready to scale from day one with modern design system.'
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
    icon: '🔧',
    title: 'Developer Experience',
    description: 'TypeScript, ESLint, Prettier, Turborepo, and comprehensive documentation.'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Navigation - Client Component for Dynamic Features */}
      <ClientHeader />

      {/* Hero Section - Client Component for Animations */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <AnimatedHero {...heroData} />
      </section>

      {/* New Features Spotlight */}
      <section className="bg-orange-50 dark:bg-gray-800 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">🚀 Latest Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Production-ready enhancements to accelerate your SaaS development</p>
          </div>
          <AnimatedSpotlight features={spotlightFeatures} />
        </div>
      </section>

      {/* Core Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <AnimatedFeatures features={coreFeatures} title="Everything You Need" />
      </section>

      {/* Pricing Section */}
      <PricingSectionWithData />

      {/* Updated CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Global SaaS for FREE?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join developers worldwide using NextSaaS with internationalization, 
            quality guard rails, and industry templates - completely free and open source
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-gray-100 dark:bg-white dark:text-orange-600 dark:hover:bg-gray-100 font-semibold"
            >
              Start Building Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-orange-600 font-semibold"
            >
              View Live Demo →
            </Button>
          </div>
          <div className="mt-8 text-sm text-orange-200">
            ✨ 100% Free • Open Source • No Subscriptions • No Hidden Costs
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 NextSaaS. All rights reserved. • Built with ❤️ for the global developer community</p>
        </div>
      </footer>
    </div>
  )
}

