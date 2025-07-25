export default function ProfileManagementGuidePage() {
  return (
    <div className="prose max-w-none">
      <h1>📖 Profile Management Guide</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">📚 Complete Documentation</p>
        <p className="text-blue-800">This is the complete documentation for the NextSaaS Profile Management System. For a quick overview, see the <a href="/features/profile-management" className="text-blue-600">Profile Management feature page</a>.</p>
      </div>

      <h2>📋 Table of Contents</h2>
      
      <ul>
        <li><a href="#overview">Overview</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#quick-start">Quick Start</a></li>
        <li><a href="#organization-modes">Organization Modes</a></li>
        <li><a href="#profile-components">Profile Components</a></li>
        <li><a href="#available-tabs">Available Tabs</a></li>
        <li><a href="#organization-context">Organization Context</a></li>
        <li><a href="#permission-system">Permission System</a></li>
        <li><a href="#avatar-management">Avatar Management</a></li>
        <li><a href="#activity-tracking">Activity Tracking</a></li>
        <li><a href="#data-export">Data Export</a></li>
        <li><a href="#account-deletion">Account Deletion</a></li>
        <li><a href="#api-endpoints">API Endpoints</a></li>
        <li><a href="#database-schema">Database Schema</a></li>
        <li><a href="#customization">Customization</a></li>
        <li><a href="#best-practices">Best Practices</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
      </ul>

      <h2 id="overview">🎯 Overview</h2>

      <p>The NextSaaS Profile Management System provides a comprehensive, universal solution for managing user profiles across single-user, organization-based, and multi-tenant SaaS applications. The system automatically adapts to your application's organizational structure while maintaining a consistent API and user experience.</p>

      <h3>Key Benefits</h3>
      
      <ul>
        <li><strong>Universal Compatibility</strong>: Works across all SaaS types without code changes</li>
        <li><strong>Automatic Adaptation</strong>: UI automatically adjusts based on organization mode</li>
        <li><strong>Production Ready</strong>: Includes avatar management, activity tracking, and GDPR compliance</li>
        <li><strong>Developer Friendly</strong>: Simple API with comprehensive documentation</li>
      </ul>

      <h2 id="features">✨ Features</h2>

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

      <h2 id="quick-start">🚀 Quick Start</h2>

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

      <h2 id="organization-modes">🏢 Organization Modes</h2>

      <h3>None (Personal SaaS)</h3>
      
      <p>For single-user applications without organizations:</p>

      <pre><code>{`import { PersonalProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <PersonalProfile />
}

// Environment Configuration:
NEXT_PUBLIC_ORGANIZATION_MODE=none`}</code></pre>

      <h3>Single Organization</h3>
      
      <p>For applications with one organization per user:</p>

      <pre><code>{`import { SingleOrgProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return <SingleOrgProfile />
}

// Environment Configuration:
NEXT_PUBLIC_ORGANIZATION_MODE=single`}</code></pre>

      <h3>Multi-Organization</h3>
      
      <p>For multi-tenant applications:</p>

      <pre><code>{`import { MultiOrgProfile } from '@nextsaas/auth'

export default function ProfilePage() {
  return (
    <MultiOrgProfile
      showOrganizationSwitcher={true}
    />
  )
}

// Environment Configuration:
NEXT_PUBLIC_ORGANIZATION_MODE=multi`}</code></pre>

      <h2 id="avatar-management">🖼️ Avatar Management</h2>

      <h3>Backblaze Integration</h3>
      
      <p>Avatars are stored in Backblaze B2 cloud storage:</p>

      <pre><code>{`NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_BACKBLAZE_ENDPOINT=https://s3.us-west-000.backblazeb2.com
BACKBLAZE_ACCESS_KEY_ID=your-access-key
BACKBLAZE_SECRET_ACCESS_KEY=your-secret-key`}</code></pre>

      <h3>Usage</h3>

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

      <h2 id="api-endpoints">🔌 API Endpoints</h2>

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

      <p>For complete API documentation with request/response examples, see the <a href="/docs/PROFILE_MANAGEMENT_API" className="text-blue-600">Profile Management API Reference</a>.</p>

      <h2 id="best-practices">💡 Best Practices</h2>

      <h3>Performance</h3>
      
      <ul>
        <li>Use pagination for activity lists</li>
        <li>Implement lazy loading for avatar variants</li>
        <li>Cache profile data appropriately</li>
      </ul>

      <h3>Security</h3>
      
      <ul>
        <li>Validate all profile updates server-side</li>
        <li>Implement rate limiting on avatar uploads</li>
        <li>Use RLS policies for data access</li>
      </ul>

      <h3>User Experience</h3>
      
      <ul>
        <li>Provide clear feedback for all actions</li>
        <li>Show loading states during operations</li>
        <li>Implement optimistic updates where appropriate</li>
      </ul>

      <h2 id="troubleshooting">🛠️ Troubleshooting</h2>

      <h3>Common Issues</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Avatar uploads failing</h4>
          <ul className="text-sm text-gray-600 ml-4">
            <li>• Check Backblaze configuration</li>
            <li>• Verify API routes are properly configured</li>
            <li>• Check file size and type restrictions</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium">Organization context not working</h4>
          <ul className="text-sm text-gray-600 ml-4">
            <li>• Ensure <code>NEXT_PUBLIC_ORGANIZATION_MODE</code> is set</li>
            <li>• Verify OrganizationProvider is in component tree</li>
            <li>• Check user membership data</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium">Profile data not loading</h4>
          <ul className="text-sm text-gray-600 ml-4">
            <li>• Verify database tables exist</li>
            <li>• Check RLS policies</li>
            <li>• Ensure user is authenticated</li>
          </ul>
        </div>
      </div>

      <h3>Debug Mode</h3>
      
      <p>Enable debug logging:</p>

      <pre><code>NEXT_PUBLIC_DEBUG_PROFILE_MANAGEMENT=true</code></pre>

      <p>This will enable detailed logging for all profile management operations.</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <p className="text-green-900 font-semibold mb-1">📚 Complete Documentation</p>
        <p className="text-green-800">This guide provides a comprehensive overview of the profile management system. For detailed API documentation, see the <a href="/docs/PROFILE_MANAGEMENT_API" className="text-green-600 underline">API Reference</a>.</p>
      </div>
    </div>
  );
}