export default function DocsHomePage() {
  return (
    <div className="prose max-w-none">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">NextSaaS Documentation</h1>
        <p className="text-xl text-gray-600">
          Ship your SaaS faster with our production-ready starter kit
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 mb-8 not-prose">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">⚡ Get Started in 5 Minutes</h2>
          <p className="text-lg mb-6 opacity-90">
            From zero to a fully functional SaaS with auth, database, and payments
          </p>
          <a 
            href="/quickstart" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Quick Setup →
          </a>
        </div>
      </div>

      <h2>🎯 Why NextSaaS?</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
        <div className="text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-semibold text-lg mb-2">Production Ready</h3>
          <p className="text-gray-600 text-sm">Authentication, database, payments, and more - all configured and ready to deploy</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="font-semibold text-lg mb-2">Save Weeks of Setup</h3>
          <p className="text-gray-600 text-sm">Skip the boilerplate and focus on building your unique features</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-3">🛠️</div>
          <h3 className="font-semibold text-lg mb-2">Best Practices Built-in</h3>
          <p className="text-gray-600 text-sm">TypeScript, ESLint, testing, CI/CD - everything configured properly</p>
        </div>
      </div>

      <h2>✨ What's Included</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-2xl">🔐</span> Authentication System
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-8">
            <li>• Email/password authentication</li>
            <li>• Social login providers</li>
            <li>• Magic links & OTP</li>
            <li>• Protected routes & middleware</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-2xl">💾</span> Database & ORM
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-8">
            <li>• Supabase PostgreSQL database</li>
            <li>• Type-safe database queries</li>
            <li>• Row Level Security (RLS)</li>
            <li>• Real-time subscriptions</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-2xl">💳</span> Payments & Billing
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-8">
            <li>• Stripe integration</li>
            <li>• Subscription management</li>
            <li>• Usage-based billing</li>
            <li>• Customer portal</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <span className="text-2xl">🎨</span> UI Components
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-8">
            <li>• 50+ React components</li>
            <li>• Tailwind CSS styling</li>
            <li>• Dark mode support</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>

      <h2>🏗️ Tech Stack</h2>

      <div className="flex flex-wrap gap-3 not-prose mb-8">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Next.js 15</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">React 19</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">TypeScript</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Tailwind CSS</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Supabase</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Turborepo</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Stripe</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">Resend</span>
      </div>

      <h2>📖 Documentation Structure</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 not-prose">
        <a href="/quickstart" className="block border-2 border-blue-200 bg-blue-50 rounded-lg p-4 hover:border-blue-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2 text-blue-900">🚀 Quick Start</h3>
          <p className="text-sm text-blue-700">Get up and running in 5 minutes</p>
        </a>

        <a href="/features/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">✨ Features</h3>
          <p className="text-sm text-gray-600">Learn about built-in features</p>
        </a>

        <a href="/development/local" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🛠️ Development</h3>
          <p className="text-sm text-gray-600">Best practices & workflows</p>
        </a>

        <a href="/architecture/monorepo" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🏗️ Architecture</h3>
          <p className="text-sm text-gray-600">Understand the structure</p>
        </a>

        <a href="/deployment/vercel" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">🚢 Deployment</h3>
          <p className="text-sm text-gray-600">Deploy to production</p>
        </a>

        <a href="/guides/adding-features" className="block border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
          <h3 className="font-semibold text-lg mb-2">📚 Guides</h3>
          <p className="text-sm text-gray-600">How-to tutorials</p>
        </a>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-lg mb-2">💡 Pro Tip</h3>
        <p className="text-gray-700">
          Start with the <a href="/quickstart" className="text-blue-600 font-semibold">5-minute quick start</a> to get everything running, 
          then explore specific features as you need them. Most developers have their SaaS up and running before finishing their coffee! ☕
        </p>
      </div>

      <div className="text-center mt-12 pt-8 border-t">
        <p className="text-gray-600 mb-4">
          Built with ❤️ by developers who've shipped dozens of SaaS products
        </p>
        <div className="flex justify-center gap-4">
          <a href="https://github.com/yourusername/nextsaas" className="text-blue-600 hover:text-blue-800">
            GitHub
          </a>
          <span className="text-gray-400">•</span>
          <a href="https://discord.gg/yourdiscord" className="text-blue-600 hover:text-blue-800">
            Discord
          </a>
          <span className="text-gray-400">•</span>
          <a href="https://twitter.com/yourtwitter" className="text-blue-600 hover:text-blue-800">
            Twitter
          </a>
        </div>
      </div>
    </div>
  );
}