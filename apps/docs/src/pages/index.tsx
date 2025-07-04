export default function DocsHomePage() {
  return (
    <div className="prose max-w-none">
      <h1>Welcome to NextSaaS Documentation</h1>
      
      <p>
        NextSaaS is a modern, production-ready SaaS starter kit built with the latest technologies:
      </p>

      <ul>
        <li><strong>Next.js 15</strong> - Latest features with App Router and Server Components</li>
        <li><strong>Turborepo</strong> - High-performance monorepo with intelligent caching</li>
        <li><strong>TypeScript</strong> - End-to-end type safety with strict mode</li>
        <li><strong>Tailwind CSS</strong> - Modern styling with custom design system</li>
        <li><strong>React 19</strong> - Latest React with concurrent features</li>
      </ul>

      <h2>🚀 Quick Start</h2>
      
      <p>Get your development environment running in under 5 minutes:</p>

      <pre><code>{`# Install dependencies (already done if you're seeing this!)
npm install

# Set up environment variables
cp .env.example .env.local

# Start development servers
npm run dev`}</code></pre>

      <p><strong>Your apps are running at:</strong></p>
      <ul>
        <li>🌐 <a href="http://localhost:3000">Web App</a> - Main SaaS application</li>
        <li>📚 <a href="http://localhost:3001">Documentation</a> - You are here!</li>
        <li>🚀 <a href="http://localhost:3002">Landing Page</a> - Marketing site</li>
      </ul>

      <h2>📁 What's Included</h2>

      <h3>Applications</h3>
      <ul>
        <li><strong>Web App</strong> (<code>apps/web</code>) - Your main SaaS application with Next.js 15</li>
        <li><strong>Documentation</strong> (<code>apps/docs</code>) - This documentation site</li>
        <li><strong>Landing Page</strong> (<code>apps/landing</code>) - Marketing and landing pages</li>
      </ul>

      <h3>Shared Packages</h3>
      <ul>
        <li><strong>UI</strong> (<code>packages/ui</code>) - Shared React component library</li>
        <li><strong>Auth</strong> (<code>packages/auth</code>) - Authentication utilities and hooks</li>
        <li><strong>Database</strong> (<code>packages/database</code>) - Database client and schemas</li>
        <li><strong>Config</strong> (<code>packages/config</code>) - Shared ESLint, TypeScript, Tailwind configs</li>
        <li><strong>Types</strong> (<code>packages/types</code>) - Shared TypeScript type definitions</li>
        <li><strong>Utils</strong> (<code>packages/utils</code>) - Shared utility functions and helpers</li>
      </ul>

      <h2>🎯 Next Steps</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h3 className="font-semibold text-lg mb-2">📚 Getting Started</h3>
          <p className="text-gray-600 text-sm mb-3">Complete setup guide and first steps</p>
          <a href="/getting-started" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Read the guide →
          </a>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h3 className="font-semibold text-lg mb-2">💻 Development</h3>
          <p className="text-gray-600 text-sm mb-3">Best practices and workflows</p>
          <a href="/development" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View guide →
          </a>
        </div>
      </div>

      <h2>🛠️ Development Commands</h2>

      <pre><code>{`# Development
npm run dev              # Start all apps
npm run build           # Build for production
npm run lint            # Check code quality
npm run format          # Format code

# Working with specific apps
npm run dev -- --filter=@nextsaas/web
npm run build -- --filter=@nextsaas/web

# Adding dependencies
npm install <package> --workspace=@nextsaas/web`}</code></pre>

      <h2>💡 Features Highlights</h2>

      <ul>
        <li><strong>🏗️ Monorepo Architecture</strong> - Shared code, optimized builds</li>
        <li><strong>⚡ Fast Development</strong> - Hot reloading across all apps</li>
        <li><strong>🎨 Design System</strong> - Consistent UI with Tailwind CSS</li>
        <li><strong>🔒 Type Safety</strong> - Strict TypeScript throughout</li>
        <li><strong>🚀 Production Ready</strong> - Optimized for deployment</li>
      </ul>

      <p>Ready to start building? Check out the <a href="/getting-started">Getting Started</a> guide!</p>
    </div>
  );
}