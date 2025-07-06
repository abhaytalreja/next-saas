import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import TopNav from '../components/TopNav'

const navigation = [
  {
    name: '🚀 Quick Start',
    items: [
      { name: 'Overview', href: '/', current: false },
      { name: 'Setup Methods', href: '/setup-methods', current: false },
      { name: '5-Minute Setup', href: '/quickstart', current: false },
      { name: 'Project Structure', href: '/project-structure', current: false },
    ]
  },
  {
    name: '✨ Features',
    items: [
      { name: 'Business Logic', href: '/features/business-logic', current: false },
      { name: 'Pricing Sync', href: '/features/pricing-sync', current: false },
      { name: 'Authentication', href: '/features/authentication', current: false },
      { name: 'Database', href: '/features/database', current: false },
      { name: 'UI Components', href: '/features/ui-components', current: false },
      { name: 'Email', href: '/features/email', current: false },
      { name: 'Payments', href: '/features/payments', current: false },
      { name: 'Internationalization', href: '/features/i18n', current: false },
    ]
  },
  {
    name: '🛠️ Development',
    items: [
      { name: 'Local Development', href: '/development/local', current: false },
      { name: 'Environment Variables', href: '/development/environment', current: false },
      { name: 'Testing', href: '/development/testing', current: false },
      { name: 'Code Style', href: '/development/code-style', current: false },
    ]
  },
  {
    name: '🏗️ Architecture',
    items: [
      { name: 'Organization Modes', href: '/architecture/organization-modes', current: false },
      { name: 'Monorepo Structure', href: '/architecture/monorepo', current: false },
      { name: 'Database Schema', href: '/architecture/database-schema', current: false },
      { name: 'Security', href: '/architecture/security', current: false },
      { name: 'Performance', href: '/architecture/performance', current: false },
    ]
  },
  {
    name: '🚢 Deployment',
    items: [
      { name: 'Vercel', href: '/deployment/vercel', current: false },
      { name: 'Docker', href: '/deployment/docker', current: false },
      { name: 'Environment Setup', href: '/deployment/environment', current: false },
    ]
  },
  {
    name: '📚 Guides',
    items: [
      { name: 'Adding Features', href: '/guides/adding-features', current: false },
      { name: 'Custom Styling', href: '/guides/styling', current: false },
      { name: 'API Integration', href: '/guides/api-integration', current: false },
      { name: 'Best Practices', href: '/guides/best-practices', current: false },
    ]
  },
  {
    name: '🔧 Troubleshooting',
    items: [
      { name: 'Overview', href: '/troubleshooting', current: false },
      { name: 'Environment Variables', href: '/troubleshooting/environment-variables', current: false },
      { name: 'Database Errors', href: '/troubleshooting/database-errors', current: false },
      { name: 'Build Errors', href: '/troubleshooting/build-errors', current: false },
      { name: 'Port Conflicts', href: '/troubleshooting/port-conflicts', current: false },
      { name: 'Authentication', href: '/troubleshooting/authentication', current: false },
      { name: 'Deployment', href: '/troubleshooting/deployment', current: false },
    ]
  }
]

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="flex pt-16"> {/* Add padding-top for fixed nav */}
        {/* Left Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Remove the NextSaaS Docs title since it's in TopNav now */}
                <nav className="mt-5 flex-1 px-2 space-y-8">
                  {navigation.map((section) => (
                    <div key={section.name}>
                      <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {section.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <a href="http://localhost:3000" className="text-blue-600 hover:text-blue-800 text-sm">
                  ← Back to Web App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="md:hidden">
          <div className="fixed inset-0 flex z-40" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                {/* Remove title from mobile sidebar too */}
                <nav className="mt-5 px-2 space-y-8">
                  {navigation.map((section) => (
                    <div key={section.name}>
                      <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {section.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden">
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
              <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            </div>
          </div>
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Component {...pageProps} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}