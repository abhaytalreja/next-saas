export default function AuthenticationPage() {
  return (
    <div className="prose max-w-none">
      <h1>🔐 Authentication System</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">✅ Production-Ready Authentication</p>
        <p className="text-green-800">
          NextSaaS includes a complete, secure authentication system with multi-tenant organization support, 
          all pre-configured and ready to use.
        </p>
      </div>

      <h2>🎯 Overview</h2>
      
      <p>
        The NextSaaS authentication system is built on <strong>Supabase Auth</strong> and provides enterprise-grade 
        security features out of the box. It's designed to handle everything from simple user authentication 
        to complex multi-tenant B2B scenarios.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🔑 Core Authentication</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Email/password authentication</li>
            <li>• Social login (Google, GitHub, Microsoft, Apple)</li>
            <li>• Email verification with secure tokens</li>
            <li>• Password reset flows</li>
            <li>• Session management with refresh tokens</li>
            <li>• Protected routes and middleware</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">🏢 Multi-Tenant Features</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Organization-based multi-tenancy</li>
            <li>• Role-based access control (Owner, Admin, Member)</li>
            <li>• Organization invitations system</li>
            <li>• Member management and permissions</li>
            <li>• Organization switching interface</li>
            <li>• Data isolation and security</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">👤 Profile Management</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Complete user profiles with custom fields</li>
            <li>• Avatar upload and management</li>
            <li>• Timezone and locale preferences</li>
            <li>• Profile validation and error handling</li>
            <li>• Real-time profile updates</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">🛡️ Security Features</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Session tracking with device info</li>
            <li>• Security event logging</li>
            <li>• Password strength validation</li>
            <li>• Active session management</li>
            <li>• Rate limiting and CSRF protection</li>
            <li>• Row Level Security (RLS) policies</li>
          </ul>
        </div>
      </div>

      <h2>🚀 Quick Start</h2>

      <h3>1. Basic Authentication Hooks</h3>
      
      <p>Use the core authentication hooks in your components:</p>

      <pre><code>{`import { useAuth, useUser, useSession } from '@nextsaas/auth';

export function MyComponent() {
  const { user, loading, error } = useAuth();
  const { signIn, signOut, signUp } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  if (!user) {
    return (
      <button onClick={() => signIn({ email, password })}>
        Sign In
      </button>
    );
  }
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}`}</code></pre>

      <h3>2. Organization Management</h3>

      <p>Handle multi-tenant organizations with built-in hooks:</p>

      <pre><code>{`import { useOrganization, useOrganizations } from '@nextsaas/auth';

export function OrgManagement() {
  const { 
    organization, 
    members, 
    loading,
    inviteUser,
    removeMember,
    updateMemberRole 
  } = useOrganization();
  
  const { organizations, switchOrganization } = useOrganizations();
  
  return (
    <div>
      <h2>Current: {organization?.name}</h2>
      
      {/* Organization Switcher */}
      <select onChange={(e) => switchOrganization(e.target.value)}>
        {organizations.map(org => (
          <option key={org.id} value={org.id}>
            {org.name} ({org.role})
          </option>
        ))}
      </select>
      
      {/* Member Management */}
      <button onClick={() => inviteUser({
        email: 'user@example.com',
        role: 'member'
      })}>
        Invite Member
      </button>
    </div>
  );
}`}</code></pre>

      <h3>3. Pre-built Components</h3>

      <p>Use ready-made authentication components:</p>

      <pre><code>{`import { 
  LoginForm, 
  SignUpForm, 
  ProfileForm,
  AccountDropdown,
  OrganizationSwitcher,
  MembersList 
} from '@nextsaas/auth/components';

// Auth forms with validation
<LoginForm redirectTo="/dashboard" />
<SignUpForm organizationMode="multi" />

// Profile management
<ProfileForm enableAvatarUpload={true} />

// Organization UI
<AccountDropdown showOrganization={true} />
<OrganizationSwitcher />
<MembersList onInvite={true} onRemove={true} />`}</code></pre>

      <h2>📚 Complete API Reference</h2>

      <h3>Authentication Hooks</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useAuth()</h4>
        <p className="text-sm mb-3">Main authentication hook with all auth methods</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>user: AuthUser | null</code> - Current authenticated user</li>
            <li>• <code>session: AuthSession | null</code> - Current session</li>
            <li>• <code>loading: boolean</code> - Loading state</li>
            <li>• <code>error: AuthError | null</code> - Any authentication errors</li>
            <li>• <code>signIn(credentials): Promise&lt;AuthResponse&gt;</code></li>
            <li>• <code>signUp(credentials): Promise&lt;AuthResponse&gt;</code></li>
            <li>• <code>signOut(): Promise&lt;void&gt;</code></li>
            <li>• <code>resetPassword(email): Promise&lt;void&gt;</code></li>
            <li>• <code>updatePassword(data): Promise&lt;void&gt;</code></li>
            <li>• <code>updateProfile(data): Promise&lt;void&gt;</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useOrganization()</h4>
        <p className="text-sm mb-3">Current organization management</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>organization: Organization | null</code> - Current organization</li>
            <li>• <code>membership: Membership | null</code> - User's membership</li>
            <li>• <code>members: MembershipWithUser[]</code> - Organization members</li>
            <li>• <code>role: MembershipRole</code> - User's role in organization</li>
            <li>• <code>isOwner(): boolean</code></li>
            <li>• <code>isAdmin(): boolean</code></li>
            <li>• <code>canInviteMembers(): boolean</code></li>
            <li>• <code>inviteUser(data): Promise&lt;void&gt;</code></li>
            <li>• <code>removeMember(userId): Promise&lt;void&gt;</code></li>
            <li>• <code>updateMemberRole(userId, role): Promise&lt;void&gt;</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useSessions()</h4>
        <p className="text-sm mb-3">Session management and security</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>sessions: ActiveSession[]</code> - All active sessions</li>
            <li>• <code>currentSession: ActiveSession</code> - Current session info</li>
            <li>• <code>revokeSession(sessionId): Promise&lt;void&gt;</code></li>
            <li>• <code>revokeAllOtherSessions(): Promise&lt;void&gt;</code></li>
          </ul>
        </div>
      </div>

      <h3>Route Protection</h3>

      <p>Protect routes with middleware and components:</p>

      <pre><code>{`// middleware.ts
import { authMiddleware } from '@nextsaas/auth/middleware';

export default authMiddleware({
  publicRoutes: ['/'],
  protectedRoutes: ['/dashboard', '/settings'],
  authRoutes: ['/auth/sign-in', '/auth/sign-up'],
  loginUrl: '/auth/sign-in'
});

// Component-level protection
import { ProtectedRoute } from '@nextsaas/auth';

<ProtectedRoute 
  requireAuth={true}
  requireEmailVerification={true}
  requireRole="admin"
  fallback={<LoginPrompt />}
>
  <AdminPanel />
</ProtectedRoute>`}</code></pre>

      <h2>🏗️ Available Pages & Components</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">📄 Authentication Pages</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Core Auth Pages:</strong>
            <ul className="mt-1 space-y-1 text-blue-800">
              <li>• <code>/auth/sign-in</code> - Sign in with email/password or social</li>
              <li>• <code>/auth/sign-up</code> - Registration with organization creation</li>
              <li>• <code>/auth/forgot-password</code> - Password reset request</li>
              <li>• <code>/auth/verify-email</code> - Email verification with tokens</li>
              <li>• <code>/auth/callback</code> - OAuth callback handler</li>
            </ul>
          </div>
          <div>
            <strong>Management Pages:</strong>
            <ul className="mt-1 space-y-1 text-blue-800">
              <li>• <code>/settings/profile</code> - User profile management</li>
              <li>• <code>/settings/security</code> - Password & session management</li>
              <li>• <code>/settings/organization</code> - Organization settings</li>
              <li>• <code>/settings/organization/members</code> - Member management</li>
              <li>• <code>/invitation/[token]</code> - Accept organization invitations</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-green-900 font-semibold mb-2">🧩 UI Components</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Forms & Auth:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• <code>LoginForm</code> - Email/password + social login</li>
              <li>• <code>SignUpForm</code> - Registration with organization</li>
              <li>• <code>ForgotPasswordForm</code> - Password reset request</li>
              <li>• <code>UpdatePasswordForm</code> - Change password with strength indicator</li>
              <li>• <code>ProfileForm</code> - Complete profile editing with avatar</li>
            </ul>
          </div>
          <div>
            <strong>Organization UI:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• <code>AccountDropdown</code> - User menu with organization context</li>
              <li>• <code>OrganizationSwitcher</code> - Switch between organizations</li>
              <li>• <code>UserAvatar</code> - User avatar with fallback to initials</li>
              <li>• <code>MembersList</code> - Organization member management</li>
              <li>• <code>InvitationForm</code> - Invite members with roles</li>
            </ul>
          </div>
        </div>
      </div>

      <h2>🔧 Configuration</h2>

      <h3>Environment Variables</h3>

      <pre><code>{`# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required - App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3010
NEXTAUTH_URL=http://localhost:3010
NEXTAUTH_SECRET=your_random_secret_key

# Organization Mode (none | single | multi)
NEXT_PUBLIC_ORGANIZATION_MODE=multi

# Optional - Email Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com`}</code></pre>

      <h3>Organization Modes</h3>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold">🏠 Single Mode (Default)</h4>
          <p className="text-sm text-gray-600 mb-2">Each user gets one auto-created organization</p>
          <ul className="text-sm space-y-1">
            <li>• ✅ Perfect for most SaaS applications</li>
            <li>• ✅ Can upgrade to multi-tenant later</li>
            <li>• ❌ No organization switching</li>
            <li>• ❌ No member invitations</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold">🏢 Multi Mode (Full B2B)</h4>
          <p className="text-sm text-gray-600 mb-2">Users can create and join multiple organizations</p>
          <ul className="text-sm space-y-1">
            <li>• ✅ Full multi-tenant capabilities</li>
            <li>• ✅ Organization invitations and roles</li>
            <li>• ✅ Member management</li>
            <li>• ✅ Organization switching</li>
            <li>• ✅ Custom domains (future)</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold">👤 None Mode (User-Centric)</h4>
          <p className="text-sm text-gray-600 mb-2">No organizations, all data belongs to users</p>
          <ul className="text-sm space-y-1">
            <li>• ✅ Simplest setup</li>
            <li>• ✅ Individual subscriptions</li>
            <li>• ❌ No team features</li>
            <li>• ❌ No collaboration</li>
          </ul>
        </div>
      </div>

      <h2>📊 Database Schema</h2>

      <p>The authentication system uses these database tables:</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Core Tables</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <ul className="space-y-1">
              <li><code>users</code> - User profiles with extended fields</li>
              <li><code>organizations</code> - Multi-tenant organization data</li>
              <li><code>memberships</code> - User-organization relationships</li>
              <li><code>organization_invitations</code> - Pending invitations</li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li><code>sessions</code> - Active sessions with device tracking</li>
              <li><code>oauth_accounts</code> - Social login connections</li>
              <li><code>password_resets</code> - Reset tokens</li>
              <li><code>email_verifications</code> - Verification tokens</li>
              <li><code>auth_events</code> - Security audit trail</li>
              <li><code>organization_events</code> - Organization activity logs</li>
            </ul>
          </div>
        </div>
      </div>

      <p><strong>Security:</strong> All tables include Row Level Security (RLS) policies for proper data isolation between organizations and users.</p>

      <h2>🔒 Security Features</h2>

      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-900 font-semibold mb-2">🛡️ Built-in Security</h4>
          <ul className="text-red-800 space-y-1 text-sm">
            <li>• <strong>Row Level Security (RLS)</strong> - Database-level access control</li>
            <li>• <strong>CSRF Protection</strong> - Automatic token validation</li>
            <li>• <strong>Rate Limiting</strong> - Configurable request limits</li>
            <li>• <strong>Session Security</strong> - Secure session management</li>
            <li>• <strong>Password Policies</strong> - Configurable strength requirements</li>
            <li>• <strong>Audit Logging</strong> - Complete security event tracking</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-900 font-semibold mb-2">⚙️ Security Configuration</h4>
          <pre className="text-xs"><code>{`// In your app configuration
const authConfig = {
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,    // 24 hours
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  rateLimit: {
    signIn: { requests: 5, window: 60 }, // 5 attempts per minute
    signUp: { requests: 3, window: 60 }, // 3 signups per minute
  }
};`}</code></pre>
        </div>
      </div>

      <h2>🚨 Troubleshooting</h2>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Authentication Issues</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>User not persisting after sign in:</strong> Check NEXTAUTH_URL matches your domain</li>
            <li>• <strong>Module not found @nextsaas/auth:</strong> Run <code>npm run build --workspace=@nextsaas/auth</code></li>
            <li>• <strong>Session expires quickly:</strong> Check Supabase JWT expiry settings</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Email Issues</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Verification emails not sending:</strong> Check Supabase email settings and SMTP config</li>
            <li>• <strong>Rate limit errors:</strong> Check Supabase email rate limits in development</li>
            <li>• <strong>Email in spam:</strong> Configure SPF/DKIM records for your domain</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Organization Issues</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Organization not created:</strong> Check database triggers and RLS policies</li>
            <li>• <strong>Can't switch organizations:</strong> Verify user has membership in target organization</li>
            <li>• <strong>Invitation links broken:</strong> Check NEXT_PUBLIC_APP_URL is correct</li>
          </ul>
        </div>
      </div>

      <h2>🔗 Next Steps</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
        <a href="/features/database" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">💾 Database Integration</h4>
          <p className="text-sm text-gray-600">Learn how auth integrates with the database layer</p>
        </a>
        
        <a href="/components" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🧩 UI Components</h4>
          <p className="text-sm text-gray-600">Explore all available auth components</p>
        </a>
        
        <a href="/architecture/organization-modes" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🏢 Organization Modes</h4>
          <p className="text-sm text-gray-600">Deep dive into multi-tenancy options</p>
        </a>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <h3 className="text-blue-900 font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Start with 'single' mode and upgrade to 'multi' when you need team features</li>
          <li>• Use the testing guide at <code>/MULTI_TENANT_TESTING_GUIDE.md</code> to validate your setup</li>
          <li>• Enable social providers in Supabase Dashboard for better user experience</li>
          <li>• Set up proper email templates in Supabase for branded auth emails</li>
          <li>• Monitor auth events in the database for security insights</li>
        </ul>
      </div>
    </div>
  );
}