export default function OrganizationModesPage() {
  return (
    <div className="prose max-w-none">
      <h1>🏢 Organization Modes</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">🎯 Flexible Architecture</p>
        <p className="text-blue-800">
          NextSaaS supports three organization modes to fit different use cases. 
          Choose the mode that matches your app's needs - you can migrate between modes as you grow!
        </p>
      </div>

      <h2>📋 Available Modes</h2>
      
      <div className="grid grid-cols-1 gap-6 not-prose mb-8">
        <div className="border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">🚀 Mode: <code>none</code> - User-Centric</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Best for personal tools and individual apps</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Simplest</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">No teams</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">User billing</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">✅ Use When:</h4>
              <ul className="text-sm space-y-1">
                <li>• Building personal productivity tools</li>
                <li>• Individual subscriptions (like Spotify)</li>
                <li>• No collaboration features needed</li>
                <li>• Want the simplest data model</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Examples:</h4>
              <ul className="text-sm space-y-1">
                <li>• Personal todo apps</li>
                <li>• Individual learning platforms</li>
                <li>• Personal finance trackers</li>
                <li>• Solo creator tools</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
          <h3 className="text-xl font-bold mb-2">⭐ Mode: <code>single</code> - One Workspace per User (Default)</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Best for apps that might add teams later</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Recommended</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Future-proof</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">Auto workspace</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">✅ Use When:</h4>
              <ul className="text-sm space-y-1">
                <li>• Starting with individual users</li>
                <li>• Might add team features later</li>
                <li>• Want consistent data model</li>
                <li>• Planning to scale</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Examples:</h4>
              <ul className="text-sm space-y-1">
                <li>• Freelancer tools → Agencies</li>
                <li>• Personal blogs → Multi-author</li>
                <li>• Individual stores → Marketplace</li>
                <li>• Most SaaS MVPs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-2 border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">🏢 Mode: <code>multi</code> - Multiple Organizations</h3>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Best for team collaboration and B2B SaaS</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Full featured</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Team invites</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">Role-based</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">✅ Use When:</h4>
              <ul className="text-sm space-y-1">
                <li>• Building B2B SaaS</li>
                <li>• Users belong to multiple teams</li>
                <li>• Need role-based permissions</li>
                <li>• Enterprise features required</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 Examples:</h4>
              <ul className="text-sm space-y-1">
                <li>• Slack, Discord</li>
                <li>• Notion, Linear</li>
                <li>• GitHub, GitLab</li>
                <li>• Enterprise SaaS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h2>🔧 Configuration</h2>
      
      <h3>1. Set Environment Variable</h3>
      
      <p>Add to your <code>.env.local</code>:</p>
      
      <pre><code>{`# Organization mode: 'none' | 'single' | 'multi'
NEXT_PUBLIC_ORGANIZATION_MODE=single  # Default`}</code></pre>

      <h3>2. Generate Database Schema</h3>
      
      <p>Generate the appropriate database schema for your mode:</p>
      
      <pre><code>{`# Generate schema for your chosen mode
npm run db:generate-sql -- --mode single

# This creates: database-single.sql`}</code></pre>

      <h3>3. Apply to Database</h3>
      
      <ol>
        <li>Open your Supabase SQL editor</li>
        <li>Paste the contents of <code>database-[mode].sql</code></li>
        <li>Run the SQL to create tables</li>
      </ol>

      <h2>📊 Mode Comparison</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3">Feature</th>
              <th className="text-center p-3">None</th>
              <th className="text-center p-3">Single</th>
              <th className="text-center p-3">Multi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Organizations table</td>
              <td className="text-center p-3">❌</td>
              <td className="text-center p-3">✅</td>
              <td className="text-center p-3">✅</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Auto-create workspace</td>
              <td className="text-center p-3">-</td>
              <td className="text-center p-3">✅</td>
              <td className="text-center p-3">❌</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Team invitations</td>
              <td className="text-center p-3">❌</td>
              <td className="text-center p-3">❌</td>
              <td className="text-center p-3">✅</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Multiple orgs per user</td>
              <td className="text-center p-3">-</td>
              <td className="text-center p-3">❌</td>
              <td className="text-center p-3">✅</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Billing model</td>
              <td className="text-center p-3">Per user</td>
              <td className="text-center p-3">Per org</td>
              <td className="text-center p-3">Per org</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Data ownership</td>
              <td className="text-center p-3">user_id</td>
              <td className="text-center p-3">organization_id</td>
              <td className="text-center p-3">organization_id</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Complexity</td>
              <td className="text-center p-3">🟢 Simple</td>
              <td className="text-center p-3">🟡 Moderate</td>
              <td className="text-center p-3">🔴 Complex</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>💻 Code Examples</h2>
      
      <h3>Using the Organization Hook</h3>
      
      <pre><code>{`import { useOrganization, useResourceQuery } from '@nextsaas/database';

function MyComponent() {
  const { organization, mode, hasOrganizations } = useOrganization();
  const { buildFilter, ownerField } = useResourceQuery();

  // Works regardless of mode
  const filter = buildFilter(); // { user_id: ... } or { organization_id: ... }

  if (!hasOrganizations) {
    return <PersonalDashboard />;
  }

  return <TeamDashboard organization={organization} />;
}`}</code></pre>

      <h3>Conditional UI Based on Mode</h3>
      
      <pre><code>{`import { getOrganizationMode } from '@nextsaas/config';

function Navigation() {
  const mode = getOrganizationMode();

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      {mode !== 'none' && <Link href="/team">Team</Link>}
      {mode === 'multi' && <OrganizationSwitcher />}
    </nav>
  );
}`}</code></pre>

      <h2>🔄 Migration Paths</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-900 font-semibold mb-2">📈 Upgrading Modes</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">None → Single</h4>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Create organizations table</li>
              <li>2. Create organization for each user</li>
              <li>3. Migrate user_id → organization_id in resources</li>
              <li>4. Update RLS policies</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-semibold">Single → Multi</h4>
            <ol className="text-sm space-y-1 ml-4">
              <li>1. Add invitation system tables</li>
              <li>2. Add organization switcher UI</li>
              <li>3. Update onboarding flow</li>
              <li>4. Enable team features</li>
            </ol>
          </div>
        </div>
      </div>

      <h2>🎯 Choosing the Right Mode</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-900 font-semibold mb-2">💡 Decision Framework</h3>
        
        <div className="space-y-3 text-green-800">
          <p><strong>Start with 'none' if:</strong> You're building a personal tool and are 100% sure you'll never need teams.</p>
          
          <p><strong>Start with 'single' if:</strong> You're unsure or might add team features later. This is the safest default!</p>
          
          <p><strong>Start with 'multi' if:</strong> You're building a B2B SaaS where users definitely belong to multiple organizations.</p>
        </div>
      </div>

      <h2>🚀 Next Steps</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
        <a href="/quickstart" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🏃 Quick Start</h4>
          <p className="text-sm text-gray-600">Set up your chosen mode</p>
        </a>
        
        <a href="/features/business-logic" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">📋 Business Logic</h4>
          <p className="text-sm text-gray-600">Understand the data model</p>
        </a>
        
        <a href="/guides/best-practices" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">✨ Best Practices</h4>
          <p className="text-sm text-gray-600">Learn mode-specific patterns</p>
        </a>
      </div>
    </div>
  );
}