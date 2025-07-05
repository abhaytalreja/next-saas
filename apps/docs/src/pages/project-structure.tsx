export default function ProjectStructurePage() {
  return (
    <div className="prose max-w-none">
      <h1>📁 Project Structure</h1>
      
      <p>
        NextSaaS uses a monorepo structure powered by Turborepo. This allows for code sharing, 
        optimized builds, and better developer experience across all your applications.
      </p>

      <h2>Directory Overview</h2>

      <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto"><code>{`next-saas/
├── apps/                    # All applications
│   ├── web/                # Main SaaS application
│   ├── docs/               # Documentation site (you are here!)
│   └── landing/            # Marketing/landing pages
│
├── packages/               # Shared packages
│   ├── ui/                # React component library
│   ├── auth/              # Authentication logic
│   ├── database/          # Database client & schemas
│   ├── supabase/          # Supabase client & utilities
│   ├── config/            # Shared configurations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── tsconfig/          # Shared TypeScript configs
│
├── scripts/               # Build and dev scripts
├── .github/              # GitHub Actions workflows
├── turbo.json            # Turborepo configuration
├── package.json          # Root package.json
└── .env.example          # Environment variables template`}</code></pre>

      <h2>🚀 Applications</h2>

      <div className="space-y-6">
        <div>
          <h3>📱 Web App (<code>apps/web</code>)</h3>
          <p>Your main SaaS application where users log in and use your product.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Key features:</h4>
            <ul className="text-sm">
              <li>Authentication flows (sign up, sign in, password reset)</li>
              <li>User dashboard and settings</li>
              <li>Billing and subscription management</li>
              <li>Core SaaS functionality</li>
            </ul>
          </div>

          <pre className="mt-4"><code>{`apps/web/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # App-specific components
│   ├── lib/             # App-specific utilities
│   └── styles/          # App-specific styles
├── public/              # Static assets
├── next.config.js       # Next.js configuration
└── package.json         # Dependencies`}</code></pre>
        </div>

        <div>
          <h3>📚 Documentation (<code>apps/docs</code>)</h3>
          <p>The documentation site you're currently viewing.</p>
          
          <pre><code>{`apps/docs/
├── src/
│   ├── pages/           # Documentation pages
│   ├── components/      # Docs-specific components
│   └── styles/         # Documentation styles
├── content/            # MDX content files
└── package.json        # Dependencies`}</code></pre>
        </div>

        <div>
          <h3>🚀 Landing Page (<code>apps/landing</code>)</h3>
          <p>Marketing site for attracting and converting visitors.</p>
          
          <pre><code>{`apps/landing/
├── src/
│   ├── app/            # Marketing pages
│   ├── components/     # Landing-specific components
│   └── styles/        # Landing page styles
└── package.json       # Dependencies`}</code></pre>
        </div>
      </div>

      <h2>📦 Shared Packages</h2>

      <div className="space-y-4">
        <div>
          <h3>🎨 UI Package (<code>packages/ui</code>)</h3>
          <p>Shared React components used across all applications.</p>
          
          <pre><code>{`packages/ui/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── ...
│   └── index.ts       # Package exports
└── package.json       # Dependencies`}</code></pre>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
            <p className="text-sm">
              <strong>💡 Usage:</strong> <code>import {`{ Button }`} from '@nextsaas/ui'</code>
            </p>
          </div>
        </div>

        <div>
          <h3>🔐 Auth Package (<code>packages/auth</code>)</h3>
          <p>Authentication utilities, hooks, and providers.</p>
          
          <pre><code>{`packages/auth/
├── src/
│   ├── hooks/         # useAuth, useUser, etc.
│   ├── providers/     # AuthProvider component
│   ├── utils/         # Auth helper functions
│   └── index.ts      # Package exports
└── package.json      # Dependencies`}</code></pre>
        </div>

        <div>
          <h3>💾 Database Package (<code>packages/database</code>)</h3>
          <p>Database client, schemas, and type-safe queries.</p>
          
          <pre><code>{`packages/database/
├── src/
│   ├── client/       # Database client setup
│   ├── schemas/      # Table schemas
│   ├── queries/      # Reusable queries
│   └── index.ts     # Package exports
└── package.json     # Dependencies`}</code></pre>
        </div>
      </div>

      <h2>⚙️ Configuration Files</h2>

      <div className="space-y-3">
        <div>
          <h3><code>turbo.json</code></h3>
          <p>Configures the build pipeline and caching strategy for Turborepo.</p>
        </div>

        <div>
          <h3><code>.env.example</code></h3>
          <p>Template for environment variables. Copy to <code>.env.local</code> for local development.</p>
        </div>

        <div>
          <h3><code>package.json</code> (root)</h3>
          <p>Workspace configuration and scripts that run across all packages.</p>
        </div>
      </div>

      <h2>🛠️ Development Workflow</h2>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Working with the Monorepo</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">1. Installing Dependencies</h4>
            <pre><code>{`# Install in a specific workspace
npm install <package> --workspace=@nextsaas/web

# Install in a shared package
npm install <package> --workspace=@nextsaas/ui`}</code></pre>
          </div>

          <div>
            <h4 className="font-medium">2. Running Commands</h4>
            <pre><code>{`# Run dev for all apps
npm run dev

# Run dev for specific app
npm run dev -- --filter=@nextsaas/web

# Build specific package
npm run build -- --filter=@nextsaas/ui`}</code></pre>
          </div>

          <div>
            <h4 className="font-medium">3. Creating New Packages</h4>
            <pre><code>{`# Create new package directory
mkdir packages/my-package
cd packages/my-package

# Initialize package
npm init --workspace=packages/my-package`}</code></pre>
          </div>
        </div>
      </div>

      <h2>📝 Best Practices</h2>

      <ul>
        <li>
          <strong>Keep packages focused</strong> - Each package should have a single, clear purpose
        </li>
        <li>
          <strong>Use TypeScript everywhere</strong> - All packages include TypeScript for type safety
        </li>
        <li>
          <strong>Share don't duplicate</strong> - If code is used in multiple apps, move it to a package
        </li>
        <li>
          <strong>Version together</strong> - All packages use the same version for simplicity
        </li>
        <li>
          <strong>Document exports</strong> - Each package should have clear documentation of its exports
        </li>
      </ul>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <p className="text-yellow-900 font-semibold mb-1">🚨 Important</p>
        <p className="text-yellow-800">
          When adding new dependencies, always specify which workspace needs them using the 
          <code className="bg-yellow-100 px-1">--workspace</code> flag. This keeps dependencies 
          organized and prevents version conflicts.
        </p>
      </div>

      <div className="mt-8 pt-8 border-t">
        <h3>Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
          <a href="/quickstart" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <h4 className="font-semibold mb-1">⚡ Quick Start</h4>
            <p className="text-sm text-gray-600">Get everything running in 5 minutes</p>
          </a>
          
          <a href="/development/local" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <h4 className="font-semibold mb-1">💻 Local Development</h4>
            <p className="text-sm text-gray-600">Learn development best practices</p>
          </a>
        </div>
      </div>
    </div>
  );
}