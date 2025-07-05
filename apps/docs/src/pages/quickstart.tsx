export default function QuickstartPage() {
  return (
    <div className="prose max-w-none">
      <h1>⚡ 5-Minute Quick Start</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">🎯 Goal: Get your SaaS running in 5 minutes</p>
        <p className="text-blue-800">By the end of this guide, you'll have a fully functional SaaS with authentication, database, and payments ready to go.</p>
      </div>

      <h2>📋 Prerequisites (30 seconds)</h2>
      
      <p>Ensure you have these installed:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-1">Node.js 18+</h4>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">node --version</code>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-1">npm 10.9.2+</h4>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">npm --version</code>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-1">Git</h4>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">git --version</code>
        </div>
      </div>

      <h2>🚀 Step 1: Clone & Install (1 minute)</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Not sure how to clone? See our <a href="/setup-methods" className="text-blue-600 underline">setup methods guide</a> for detailed instructions.
        </p>
      </div>
      
      <pre><code>{`# If you've already cloned the repo
cd my-saas

# Install all dependencies
npm install`}</code></pre>

      <p className="text-green-600 font-medium">✓ Great! All packages are now installed.</p>

      <h2>🗄️ Step 2: Set Up Database (2 minutes)</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-900 font-semibold mb-1">⚡ Quick Setup with Supabase</p>
        <p className="text-yellow-800">We use Supabase for database, auth, and real-time features. The free tier is perfect for development!</p>
      </div>

      <ol className="space-y-3">
        <li>
          <strong>Create a Supabase project:</strong>
          <ul className="mt-1 ml-4 text-sm text-gray-600">
            <li>• Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600">app.supabase.com</a></li>
            <li>• Click "New project"</li>
            <li>• Choose a name and password</li>
            <li>• Select the closest region</li>
          </ul>
        </li>
        
        <li>
          <strong>Get your project credentials:</strong>
          <ul className="mt-1 ml-4 text-sm text-gray-600">
            <li>• Go to Settings → API</li>
            <li>• Copy the <code>Project URL</code> and <code>anon public</code> key</li>
          </ul>
        </li>
      </ol>

      <h2>🔑 Step 3: Environment Setup (1 minute)</h2>
      
      <p>Copy the example environment file:</p>
      
      <pre><code>cp .env.example .env.local</code></pre>

      <p>Open <code>.env.local</code> and add your values:</p>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <h4 className="font-semibold mb-3">Required Environment Variables:</h4>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-700">1. Supabase Credentials</p>
            <pre className="mt-2"><code>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}</code></pre>
            <p className="text-sm text-gray-600 mt-1">
              ↑ Use the values you just copied from Supabase
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700">2. Authentication Secret</p>
            <pre className="mt-2"><code>{`NEXTAUTH_SECRET=your_random_secret_key`}</code></pre>
            <p className="text-sm text-gray-600 mt-1">
              → Generate with: <code className="bg-gray-100 px-1">openssl rand -base64 32</code>
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700">3. App URL & Organization Mode</p>
            <pre className="mt-2"><code>{`NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_ORGANIZATION_MODE=single  # or 'none' or 'multi'`}</code></pre>
          </div>
        </div>
      </div>

      <h2>🗄️ Step 4: Set Up Database Tables (2 minutes)</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="text-blue-900 font-semibold mb-2">🏢 Choose Your Organization Mode</h4>
        <p className="text-blue-800 mb-2">
          NextSaaS supports different organization structures. Choose what fits your app:
        </p>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>single</strong> (recommended): One workspace per user, can add teams later</li>
          <li>• <strong>none</strong>: User-centric app, no organizations needed</li>
          <li>• <strong>multi</strong>: Full B2B SaaS with multiple teams per user</li>
        </ul>
      </div>
      
      <p>Generate the database schema for your chosen mode:</p>
      
      <pre><code>{`# For most apps (recommended)
npm run db:generate-sql -- --mode single

# For personal/individual apps
npm run db:generate-sql -- --mode none

# For complex B2B SaaS
npm run db:generate-sql -- --mode multi`}</code></pre>

      <p>This creates a file <code>database-[mode].sql</code> with the appropriate tables. Then:</p>
      
      <ol className="text-sm space-y-2 ml-4">
        <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600">Supabase Dashboard</a></li>
        <li>Click on "SQL Editor" in the sidebar</li>
        <li>Click "New query"</li>
        <li>Copy and paste the contents of your <code>database-[mode].sql</code> file</li>
        <li>Click "Run" to create all tables</li>
      </ol>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
        <p className="text-green-800 text-sm">
          ✅ This creates all tables, security policies, and functions!
        </p>
      </div>

      <p className="mt-4"><strong>Optional: Add sample data</strong></p>
      <pre><code>npm run db:seed-sql</code></pre>
      <p className="text-sm text-gray-600 ml-4">
        This generates seed-data.sql with sample users, organizations, and projects to explore.
      </p>

      <h2>🎉 Step 5: Start Everything (30 seconds)</h2>
      
      <pre><code>npm run dev</code></pre>

      <p>This starts all three applications:</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
        <h4 className="font-semibold text-green-900 mb-2">🎊 Your apps are now running!</h4>
        <ul className="space-y-2">
          <li><strong>Main App:</strong> <a href="http://localhost:3000" className="text-blue-600">http://localhost:3000</a> - Your SaaS application</li>
          <li><strong>Documentation:</strong> <a href="http://localhost:3001" className="text-blue-600">http://localhost:3001</a> - You are here!</li>
          <li><strong>Landing Page:</strong> <a href="http://localhost:3002" className="text-blue-600">http://localhost:3002</a> - Marketing site</li>
        </ul>
      </div>

      <h2>✅ Step 6: Verify Everything Works (30 seconds)</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-green-500 text-xl">✓</span>
          <div>
            <p className="font-medium">Test Authentication</p>
            <p className="text-sm text-gray-600">Go to <a href="http://localhost:3000/sign-up" className="text-blue-600">http://localhost:3000/sign-up</a> and create your first account</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-green-500 text-xl">✓</span>
          <div>
            <p className="font-medium">Check Database</p>
            <p className="text-sm text-gray-600">Visit your Supabase dashboard to see the new user in the database</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-green-500 text-xl">✓</span>
          <div>
            <p className="font-medium">Explore UI Components</p>
            <p className="text-sm text-gray-600">Check out the pre-built components in your app</p>
          </div>
        </div>
      </div>

      <h2>🎯 What You Now Have</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">✅ Complete Authentication</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Sign up / Sign in / Sign out</li>
            <li>• Password reset flow</li>
            <li>• Email verification</li>
            <li>• Protected routes</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">✅ Database Ready</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• User profiles table</li>
            <li>• Subscription management</li>
            <li>• Row Level Security</li>
            <li>• Real-time subscriptions</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">✅ UI Components</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Navigation & Layout</li>
            <li>• Forms & Inputs</li>
            <li>• Modals & Dialogs</li>
            <li>• Loading states</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">✅ Developer Experience</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Hot reloading</li>
            <li>• TypeScript everywhere</li>
            <li>• Shared packages</li>
            <li>• ESLint & Prettier</li>
          </ul>
        </div>
      </div>

      <h2>🚀 Next Steps</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
        <a href="/features/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🔐 Customize Auth</h4>
          <p className="text-sm text-gray-600">Add social logins, custom fields</p>
        </a>
        
        <a href="/features/database" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">💾 Extend Database</h4>
          <p className="text-sm text-gray-600">Add tables for your features</p>
        </a>
        
        <a href="/deployment/vercel" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🌐 Deploy to Production</h4>
          <p className="text-sm text-gray-600">Go live in minutes</p>
        </a>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <p className="text-yellow-900 font-semibold mb-1">💡 Pro Tip</p>
        <p className="text-yellow-800">Join our Discord community for help, updates, and to showcase what you build!</p>
      </div>

      <div className="mt-8 pt-8 border-t">
        <p className="text-center text-gray-600">
          <strong>🎉 Congratulations!</strong> You've successfully set up NextSaaS in under 5 minutes.
        </p>
        <p className="text-center text-gray-600 mt-2">
          Now go build something amazing! 🚀
        </p>
      </div>
    </div>
  );
}