export default function ProfileManagementPage() {
  return (
    <div className="prose max-w-none">
      <h1>👤 Profile Management System</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">🎯 Universal Profile System</p>
        <p className="text-blue-800">NextSaaS includes a comprehensive profile management system that automatically adapts to single-user, organization-based, and multi-tenant SaaS applications.</p>
      </div>

      <h2>✨ Key Features</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">🔄 Universal Compatibility</h4>
          <p className="text-sm text-gray-600">Works across all SaaS types (personal, single-org, multi-org)</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🖼️ Avatar Management</h4>
          <p className="text-sm text-gray-600">Integrated with Backblaze B2 cloud storage</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">📊 Activity Tracking</h4>
          <p className="text-sm text-gray-600">Comprehensive audit trails with organization context</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">🔒 GDPR Compliant</h4>
          <p className="text-sm text-gray-600">Data export and secure account deletion</p>
        </div>
      </div>

      <h2>🚀 Quick Start</h2>

      <h3>Basic Usage</h3>
      
      <p>For most applications, simply use the UniversalProfile component:</p>

      <pre><code>{`import { UniversalProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <UniversalProfile />
}`}</code></pre>

      <h3>Page Layout</h3>
      
      <p>For a complete page with header and styling:</p>

      <pre><code>{`import { ProfilePageLayout } from '@nextsaas/auth'

export default function ProfilePage() {
  return (
    <ProfilePageLayout
      title="Profile Settings"
      description="Manage your account settings"
    />
  )
}`}</code></pre>

      <h3>Embedded Profile</h3>
      
      <p>For use within existing layouts:</p>

      <pre><code>{`import { EmbeddedProfile } from '@nextsaas/auth'

export default function DashboardProfileSection() {
  return (
    <EmbeddedProfile
      showHeader={true}
      title="Profile Settings"
      defaultTab="profile"
    />
  )
}`}</code></pre>

      <h2>🏢 Organization Modes</h2>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <h4 className="font-semibold mb-3">Configure Your Organization Mode</h4>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-700">Personal SaaS (None)</p>
            <pre className="mt-2"><code>NEXT_PUBLIC_ORGANIZATION_MODE=none</code></pre>
            <p className="text-sm text-gray-600 mt-1">For single-user applications without organizations</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Single Organization</p>
            <pre className="mt-2"><code>NEXT_PUBLIC_ORGANIZATION_MODE=single</code></pre>
            <p className="text-sm text-gray-600 mt-1">For applications with one organization per user</p>
          </div>

          <div>
            <p className="font-medium text-gray-700">Multi-Organization</p>
            <pre className="mt-2"><code>NEXT_PUBLIC_ORGANIZATION_MODE=multi</code></pre>
            <p className="text-sm text-gray-600 mt-1">For multi-tenant applications</p>
          </div>
        </div>
      </div>

      <h2>🖼️ Avatar Management</h2>

      <h3>Backblaze Configuration</h3>
      
      <p>Avatars are stored in Backblaze B2 cloud storage. Add these environment variables:</p>

      <pre><code>{`NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_BACKBLAZE_ENDPOINT=https://s3.us-west-000.backblazeb2.com
BACKBLAZE_ACCESS_KEY_ID=your-access-key
BACKBLAZE_SECRET_ACCESS_KEY=your-secret-key`}</code></pre>

      <h3>Avatar Component Usage</h3>

      <pre><code>{`import { AvatarUpload } from '@nextsaas/auth'

function ProfileAvatar() {
  return (
    <AvatarUpload
      userId={user.id}
      currentAvatarUrl={profile?.avatar_url}
      onAvatarUpdate={(url) => {
        updateProfile({ avatar_url: url })
      }}
    />
  )
}`}</code></pre>

      <h2>📊 Activity Tracking</h2>

      <p>The system automatically tracks:</p>
      
      <ul>
        <li>Profile updates</li>
        <li>Avatar changes</li>
        <li>Preference modifications</li>
        <li>Authentication events</li>
        <li>Organization context switches</li>
      </ul>

      <h3>Manual Activity Tracking</h3>

      <pre><code>{`import { createActivityService } from '@nextsaas/auth'

const activityService = createActivityService(supabase)

await activityService.trackProfileActivity(
  {
    userId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  },
  {
    action: 'custom_action',
    details: { custom_data: 'value' },
    metadata: { source: 'manual' }
  }
)`}</code></pre>

      <h2>🔒 Data Export & Deletion</h2>

      <h3>GDPR-Compliant Data Export</h3>

      <pre><code>{`import { DataExportManager } from '@nextsaas/auth'

function ExportSection() {
  return (
    <DataExportManager
      userId={user.id}
      context="organization" // or "personal"
    />
  )
}`}</code></pre>

      <h3>Account Deletion</h3>

      <pre><code>{`import { AccountDeletionManager } from '@nextsaas/auth'

function DeletionSection() {
  return (
    <AccountDeletionManager
      userId={user.id}
      context="organization" // or "personal"
    />
  )
}`}</code></pre>

      <h2>🏗️ Organization Context</h2>

      <h3>Context Switching (Multi-org mode)</h3>

      <pre><code>{`import { OrganizationContextWidget } from '@nextsaas/auth'

function ProfileHeader() {
  return (
    <OrganizationContextWidget
      compact={false}
      showPermissions={true}
      showDescription={true}
    />
  )
}`}</code></pre>

      <h3>Using Context Data</h3>

      <pre><code>{`import { useOrganizationProfileContext } from '@nextsaas/auth'

function ProfileComponent() {
  const {
    currentOrganization,
    membership,
    profile,
    canViewTab,
    isVisible,
    updateProfile
  } = useOrganizationProfileContext()

  return (
    <div>
      {canViewTab('activity') && <ActivityTab />}
      {isVisible('email') && <EmailField />}
    </div>
  )
}`}</code></pre>

      <h2>📋 Available Profile Tabs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Profile Tab</h4>
          <p className="text-sm text-gray-600">Personal information, contact details</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Avatar Tab</h4>
          <p className="text-sm text-gray-600">Upload and manage profile pictures</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Preferences Tab</h4>
          <p className="text-sm text-gray-600">Notification and privacy settings</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Activity Tab</h4>
          <p className="text-sm text-gray-600">Account activity and security events</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Export Tab</h4>
          <p className="text-sm text-gray-600">GDPR-compliant data export</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium">Delete Tab</h4>
          <p className="text-sm text-gray-600">Secure account deletion</p>
        </div>
      </div>

      <h2>🔧 API Endpoints</h2>

      <div className="bg-gray-50 rounded-lg p-4 my-4">
        <h4 className="font-semibold mb-3">Profile Management APIs</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <code>GET /api/profile</code>
            <span className="text-gray-600">Get user profile</span>
          </div>
          <div className="flex justify-between">
            <code>PATCH /api/profile</code>
            <span className="text-gray-600">Update profile</span>
          </div>
          <div className="flex justify-between">
            <code>POST /api/profile/avatar</code>
            <span className="text-gray-600">Upload avatar</span>
          </div>
          <div className="flex justify-between">
            <code>GET /api/profile/activity</code>
            <span className="text-gray-600">Get activity logs</span>
          </div>
          <div className="flex justify-between">
            <code>POST /api/profile/export</code>
            <span className="text-gray-600">Request data export</span>
          </div>
        </div>
      </div>

      <h2>📚 Documentation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
        <a href="/docs/PROFILE_MANAGEMENT_GUIDE" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">📖 Complete Guide</h4>
          <p className="text-sm text-gray-600">Comprehensive profile management documentation</p>
        </a>
        
        <a href="/docs/PROFILE_MANAGEMENT_API" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🔌 API Reference</h4>
          <p className="text-sm text-gray-600">Detailed API documentation</p>
        </a>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <p className="text-green-900 font-semibold mb-1">✅ Ready to Use</p>
        <p className="text-green-800">The profile management system is fully integrated and ready to use in your NextSaaS application. Just import the components and start building!</p>
      </div>
    </div>
  );
}