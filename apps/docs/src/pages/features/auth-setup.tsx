export default function AuthSetupPage() {
  return (
    <div className="prose max-w-none">
      <h1>🚀 Authentication Setup Guide</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">📋 Complete Setup Guide</p>
        <p className="text-blue-800">
          This guide walks you through setting up the complete authentication system from scratch,
          including database, Supabase configuration, and testing.
        </p>
      </div>

      <h2>📚 Table of Contents</h2>
      
      <ul>
        <li><a href="#prerequisites">1. Prerequisites</a></li>
        <li><a href="#database-setup">2. Database Setup</a></li>
        <li><a href="#supabase-config">3. Supabase Configuration</a></li>
        <li><a href="#environment-setup">4. Environment Setup</a></li>
        <li><a href="#organization-modes">5. Organization Mode Selection</a></li>
        <li><a href="#testing">6. Testing Your Setup</a></li>
        <li><a href="#production">7. Production Deployment</a></li>
        <li><a href="#troubleshooting">8. Troubleshooting</a></li>
      </ul>

      <h2 id="prerequisites">1. Prerequisites</h2>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Required Accounts & Tools</h4>
        <ul className="space-y-2 text-sm">
          <li>✅ <strong>Supabase Account:</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
          <li>✅ <strong>Node.js 18+:</strong> <code>node --version</code></li>
          <li>✅ <strong>Git:</strong> For version control</li>
          <li>✅ <strong>Code Editor:</strong> VS Code recommended</li>
          <li>🔧 <strong>Email Service (Optional):</strong> Resend, SendGrid, or Supabase SMTP</li>
        </ul>
      </div>

      <h2 id="database-setup">2. Database Setup</h2>

      <h3>Step 1: Create Supabase Project</h3>

      <ol className="space-y-3">
        <li>
          <strong>Go to Supabase Dashboard:</strong>
          <p>Visit <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer">app.supabase.com</a> and sign in</p>
        </li>
        <li>
          <strong>Create New Project:</strong>
          <ul className="ml-4 text-sm space-y-1">
            <li>• Click "New project"</li>
            <li>• Choose organization</li>
            <li>• Enter project name (e.g., "my-saas-app")</li>
            <li>• Create strong database password</li>
            <li>• Select region closest to your users</li>
            <li>• Click "Create new project"</li>
          </ul>
        </li>
        <li>
          <strong>Wait for Setup:</strong>
          <p className="text-sm">Project creation takes 1-2 minutes. Wait for "Project setup completed" message.</p>
        </li>
      </ol>

      <h3>Step 2: Generate Database Schema</h3>

      <p>NextSaaS includes a comprehensive database schema generator. Run this to create all authentication tables:</p>

      <pre><code>{`# Generate complete database schema
npm run db:generate-sql

# This creates: supabase-setup.sql`}</code></pre>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="text-green-900 font-semibold mb-2">🗄️ What Gets Created</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Core Tables:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• users (with profile fields)</li>
              <li>• organizations</li>
              <li>• memberships</li>
              <li>• organization_invitations</li>
            </ul>
          </div>
          <div>
            <strong>Auth Tables:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• sessions (with device tracking)</li>
              <li>• oauth_accounts</li>
              <li>• password_resets</li>
              <li>• email_verifications</li>
              <li>• auth_events</li>
            </ul>
          </div>
        </div>
        <p className="text-green-800 mt-2 text-sm">
          <strong>Plus:</strong> billing tables, audit logs, RLS policies, database functions, and indexes.
        </p>
      </div>

      <h3>Step 3: Run Database Schema</h3>

      <ol className="space-y-3">
        <li>
          <strong>Open Supabase SQL Editor:</strong>
          <p>In your Supabase dashboard, click "SQL Editor" in the sidebar</p>
        </li>
        <li>
          <strong>Create New Query:</strong>
          <p>Click "New query" or the "+" button</p>
        </li>
        <li>
          <strong>Paste Schema:</strong>
          <p>Copy the entire contents of <code>supabase-setup.sql</code> and paste into the SQL editor</p>
        </li>
        <li>
          <strong>Run Schema:</strong>
          <p>Click "Run" (Ctrl/Cmd + Enter). This will create all tables, indexes, and security policies.</p>
        </li>
        <li>
          <strong>Verify Success:</strong>
          <p>Check the "Table Editor" tab to see all created tables</p>
        </li>
      </ol>

      <h2 id="supabase-config">3. Supabase Configuration</h2>

      <h3>Step 1: Get Project Credentials</h3>

      <ol className="space-y-3">
        <li>
          <strong>Go to Settings → API:</strong>
          <p>In your Supabase project dashboard</p>
        </li>
        <li>
          <strong>Copy Required Values:</strong>
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-sm font-medium mb-2">You'll need these values:</p>
            <ul className="text-sm space-y-1">
              <li>• <strong>Project URL:</strong> <code>https://xxx.supabase.co</code></li>
              <li>• <strong>anon public key:</strong> <code>eyJhbGci...</code></li>
              <li>• <strong>service_role key:</strong> <code>eyJhbGci...</code> (keep secret!)</li>
            </ul>
          </div>
        </li>
      </ol>

      <h3>Step 2: Configure Authentication</h3>

      <ol className="space-y-3">
        <li>
          <strong>Go to Authentication → Settings:</strong>
          <p>Configure these essential settings:</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
            <ul className="text-sm space-y-1">
              <li>• <strong>Site URL:</strong> <code>http://localhost:3010</code> (for development)</li>
              <li>• <strong>Additional Redirect URLs:</strong></li>
              <li className="ml-4">- <code>http://localhost:3010/auth/callback</code></li>
              <li className="ml-4">- <code>http://localhost:3010/auth/verify-email</code></li>
            </ul>
          </div>
        </li>
        <li>
          <strong>Enable Email Confirmation:</strong>
          <ul className="ml-4 text-sm space-y-1">
            <li>• Go to Authentication → Settings</li>
            <li>• Enable "Enable email confirmations"</li>
            <li>• Set "Confirm email" to "Required"</li>
          </ul>
        </li>
      </ol>

      <h3>Step 3: Configure Social Providers (Optional)</h3>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🔵 Google OAuth</h4>
          <ol className="text-sm space-y-1">
            <li>1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>2. Create project → Enable Google+ API</li>
            <li>3. Create OAuth 2.0 credentials</li>
            <li>4. Add redirect URI: <code>https://xxx.supabase.co/auth/v1/callback</code></li>
            <li>5. Copy Client ID & Secret to Supabase</li>
          </ol>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🐙 GitHub OAuth</h4>
          <ol className="text-sm space-y-1">
            <li>1. Go to GitHub → Settings → Developer settings</li>
            <li>2. New OAuth App</li>
            <li>3. Authorization callback URL: <code>https://xxx.supabase.co/auth/v1/callback</code></li>
            <li>4. Copy Client ID & Secret to Supabase</li>
          </ol>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🪟 Microsoft OAuth</h4>
          <ol className="text-sm space-y-1">
            <li>1. Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer">Azure Portal</a></li>
            <li>2. App registrations → New registration</li>
            <li>3. Add redirect URI: <code>https://xxx.supabase.co/auth/v1/callback</code></li>
            <li>4. Copy Application ID & Secret to Supabase</li>
          </ol>
        </div>
      </div>

      <h2 id="environment-setup">4. Environment Setup</h2>

      <h3>Step 1: Create Environment File</h3>

      <p>Copy the example environment file and add your credentials:</p>

      <pre><code>cp .env.example .env.local</code></pre>

      <h3>Step 2: Configure Environment Variables</h3>

      <p>Edit <code>.env.local</code> with your Supabase credentials:</p>

      <pre><code>{`# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3010

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Authentication (REQUIRED)
NEXTAUTH_URL=http://localhost:3010
NEXTAUTH_SECRET=your_random_secret_key_here

# Organization Mode (REQUIRED)
NEXT_PUBLIC_ORGANIZATION_MODE=multi

# Email Configuration (OPTIONAL)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Analytics (OPTIONAL)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com`}</code></pre>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h4 className="text-red-900 font-semibold mb-2">🔐 Generate Secure Secrets</h4>
        <p className="text-red-800 text-sm mb-2">Generate a strong NEXTAUTH_SECRET:</p>
        <pre className="text-xs"><code>openssl rand -base64 32</code></pre>
        <p className="text-red-800 text-sm mt-2">This creates a cryptographically secure random string.</p>
      </div>

      <h2 id="organization-modes">5. Organization Mode Selection</h2>

      <p>Choose the organization mode that fits your application:</p>

      <div className="space-y-4">
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900">🏠 Single Mode (Recommended for Most Apps)</h4>
          <p className="text-sm text-green-800 mb-2">Each user gets one auto-created organization</p>
          <pre className="text-xs"><code>NEXT_PUBLIC_ORGANIZATION_MODE=single</code></pre>
          <div className="mt-2 text-sm">
            <p><strong>Best for:</strong> SaaS apps that might add team features later</p>
            <p><strong>Examples:</strong> Project management tools, analytics dashboards, personal productivity apps</p>
          </div>
        </div>

        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900">🏢 Multi Mode (Full B2B SaaS)</h4>
          <p className="text-sm text-blue-800 mb-2">Users can create and join multiple organizations</p>
          <pre className="text-xs"><code>NEXT_PUBLIC_ORGANIZATION_MODE=multi</code></pre>
          <div className="mt-2 text-sm">
            <p><strong>Best for:</strong> Team collaboration, B2B SaaS, enterprise applications</p>
            <p><strong>Examples:</strong> Slack, Notion, Linear, team communication tools</p>
          </div>
        </div>

        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900">👤 None Mode (User-Centric)</h4>
          <p className="text-sm text-gray-600 mb-2">No organizations, all data belongs directly to users</p>
          <pre className="text-xs"><code>NEXT_PUBLIC_ORGANIZATION_MODE=none</code></pre>
          <div className="mt-2 text-sm">
            <p><strong>Best for:</strong> Personal apps, individual subscriptions</p>
            <p><strong>Examples:</strong> Personal finance apps, individual learning platforms</p>
          </div>
        </div>
      </div>

      <h2 id="testing">6. Testing Your Setup</h2>

      <h3>Step 1: Start Development Server</h3>

      <pre><code>npm run dev</code></pre>

      <p>This starts all three applications:</p>
      <ul>
        <li>Main app: <a href="http://localhost:3010">http://localhost:3010</a></li>
        <li>Documentation: <a href="http://localhost:3011">http://localhost:3011</a></li>
        <li>Landing page: <a href="http://localhost:3012">http://localhost:3012</a></li>
      </ul>

      <h3>Step 2: Test Authentication Flow</h3>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="text-green-900 font-semibold mb-2">✅ Complete Testing Checklist</h4>
        
        <div className="space-y-3 text-sm">
          <div>
            <strong>Basic Authentication:</strong>
            <ul className="ml-4 space-y-1 text-green-800">
              <li>□ Sign up at <code>/auth/sign-up</code></li>
              <li>□ Check email for verification link</li>
              <li>□ Verify email and access dashboard</li>
              <li>□ Sign out and sign back in</li>
              <li>□ Test password reset flow</li>
            </ul>
          </div>

          <div>
            <strong>Profile Management:</strong>
            <ul className="ml-4 space-y-1 text-green-800">
              <li>□ Update profile at <code>/settings/profile</code></li>
              <li>□ Upload avatar image</li>
              <li>□ Change password at <code>/settings/security</code></li>
              <li>□ View active sessions</li>
            </ul>
          </div>

          <div>
            <strong>Organization Features (Multi Mode):</strong>
            <ul className="ml-4 space-y-1 text-green-800">
              <li>□ Create additional organizations</li>
              <li>□ Switch between organizations</li>
              <li>□ Invite team members</li>
              <li>□ Test invitation acceptance flow</li>
              <li>□ Manage member roles</li>
            </ul>
          </div>
        </div>
      </div>

      <h3>Step 3: Database Verification</h3>

      <p>Check your Supabase dashboard to verify:</p>
      <ul>
        <li>User records in the <code>users</code> table</li>
        <li>Organization records in the <code>organizations</code> table</li>
        <li>Membership relationships in the <code>memberships</code> table</li>
        <li>Auth events in the <code>auth_events</code> table</li>
      </ul>

      <h2 id="production">7. Production Deployment</h2>

      <h3>Step 1: Update Supabase Settings</h3>

      <ol className="space-y-2">
        <li><strong>Update Site URL:</strong> Change to your production domain</li>
        <li><strong>Update Redirect URLs:</strong> Add production callback URLs</li>
        <li><strong>Configure Custom SMTP:</strong> Set up proper email service</li>
        <li><strong>Review RLS Policies:</strong> Ensure security policies are correct</li>
      </ol>

      <h3>Step 2: Environment Variables</h3>

      <p>Update your production environment with:</p>
      <ul>
        <li>Production Supabase URL and keys</li>
        <li>Production app URL</li>
        <li>Strong production secrets</li>
        <li>Email service configuration</li>
      </ul>

      <h3>Step 3: Security Checklist</h3>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-red-900 font-semibold mb-2">🔒 Production Security</h4>
        <ul className="text-red-800 space-y-1 text-sm">
          <li>□ All secrets are properly configured</li>
          <li>□ RLS policies are enabled and tested</li>
          <li>□ Rate limiting is configured</li>
          <li>□ Email templates are branded</li>
          <li>□ OAuth apps are configured for production</li>
          <li>□ HTTPS is enforced</li>
          <li>□ Security headers are configured</li>
        </ul>
      </div>

      <h2 id="troubleshooting">8. Troubleshooting</h2>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold">🚫 Common Setup Issues</h4>
          
          <div className="space-y-3 text-sm mt-3">
            <div>
              <p><strong>Error: "Module not found: @nextsaas/auth"</strong></p>
              <p className="text-gray-600">Solution: Build the auth package</p>
              <pre className="text-xs mt-1"><code>npm run build --workspace=@nextsaas/auth</code></pre>
            </div>

            <div>
              <p><strong>Error: "Invalid Supabase configuration"</strong></p>
              <p className="text-gray-600">Solution: Check environment variables</p>
              <ul className="ml-4 mt-1">
                <li>• Verify NEXT_PUBLIC_SUPABASE_URL is correct</li>
                <li>• Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct</li>
                <li>• Restart development server after changes</li>
              </ul>
            </div>

            <div>
              <p><strong>Error: "Database error" during signup</strong></p>
              <p className="text-gray-600">Solution: Check database schema</p>
              <ul className="ml-4 mt-1">
                <li>• Verify all tables exist in Supabase</li>
                <li>• Check RLS policies are enabled</li>
                <li>• Review SQL execution logs</li>
              </ul>
            </div>

            <div>
              <p><strong>Email verification not working</strong></p>
              <p className="text-gray-600">Solution: Check email configuration</p>
              <ul className="ml-4 mt-1">
                <li>• Check Supabase email settings</li>
                <li>• Verify redirect URLs are correct</li>
                <li>• Check spam folder</li>
                <li>• Review email rate limits</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold">🔍 Debugging Tips</h4>
          
          <ul className="space-y-2 text-sm mt-3">
            <li><strong>Check Browser Console:</strong> Look for JavaScript errors</li>
            <li><strong>Check Network Tab:</strong> Monitor API requests and responses</li>
            <li><strong>Check Supabase Logs:</strong> Review database and auth logs</li>
            <li><strong>Use Testing Guide:</strong> Follow the comprehensive testing guide</li>
            <li><strong>Enable Debug Mode:</strong> Add <code>NODE_ENV=development</code></li>
          </ul>
        </div>
      </div>

      <h2>🎉 Next Steps</h2>

      <p>Congratulations! You now have a fully functional authentication system. Here's what to explore next:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mt-6">
        <a href="/features/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">📖 Auth Documentation</h4>
          <p className="text-sm text-gray-600">Complete API reference and usage examples</p>
        </a>
        
        <a href="/components" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🧩 UI Components</h4>
          <p className="text-sm text-gray-600">Explore all available authentication components</p>
        </a>
        
        <a href="/features/database" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">💾 Database Integration</h4>
          <p className="text-sm text-gray-600">Learn how to extend the database schema</p>
        </a>
      </div>
    </div>
  );
}