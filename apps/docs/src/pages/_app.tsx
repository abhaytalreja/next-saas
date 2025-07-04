import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-gray-900">
                NextSaaS Docs
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/getting-started" className="text-gray-600 hover:text-gray-900">
                Getting Started
              </a>
              <a href="/development" className="text-gray-600 hover:text-gray-900">
                Development
              </a>
              <a href="http://localhost:3000" className="text-blue-600 hover:text-blue-800">
                Web App →
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto py-8 px-4">
        <Component {...pageProps} />
      </main>
    </div>
  )
}