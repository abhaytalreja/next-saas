export default function BusinessLogicPage() {
  return (
    <div className="prose max-w-none">
      <h1>🏢 Business Logic & Features</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">📋 Complete Feature Documentation</p>
        <p className="text-blue-800">
          This page documents all business functionality, data models, and expected behaviors built into NextSaaS.
        </p>
      </div>

      <h2>🔍 Overview</h2>
      
      <p>NextSaaS comes with a complete multi-tenant SaaS architecture including:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">👥 User Management</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• User profiles with avatars</li>
            <li>• Email verification</li>
            <li>• Password reset flows</li>
            <li>• Session management</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🏢 Organizations</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Multi-tenant isolation</li>
            <li>• Team member invitations</li>
            <li>• Role-based permissions</li>
            <li>• Custom domains (optional)</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💳 Billing & Subscriptions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Subscription plans</li>
            <li>• Usage tracking</li>
            <li>• Invoice management</li>
            <li>• Payment history</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">📊 Content Management</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Projects/Workspaces</li>
            <li>• Flexible item system</li>
            <li>• Categories & tags</li>
            <li>• File attachments</li>
          </ul>
        </div>
      </div>

      <h2>👤 User Management</h2>

      <h3>User Profile</h3>
      
      <pre><code>{`interface UserProfile {
  id: string;                    // UUID from auth system
  email: string;                 // Primary email
  email_verified_at?: Date;      // Verification timestamp
  name?: string;                 // Display name
  avatar_url?: string;           // Profile picture
  timezone: string;              // User's timezone (default: UTC)
  locale: string;                // Language preference (default: en)
  metadata: Record<string, any>; // Extensible user data
  last_seen_at?: Date;          // Last activity
  created_at: Date;
  updated_at: Date;
}`}</code></pre>

      <h4>Key Features:</h4>
      <ul>
        <li><strong>Email Verification</strong> - Users must verify email before accessing certain features</li>
        <li><strong>Profile Customization</strong> - Name, avatar, timezone, language preferences</li>
        <li><strong>Metadata Storage</strong> - Store custom data like preferences, settings, etc.</li>
        <li><strong>Activity Tracking</strong> - Track last seen for engagement metrics</li>
      </ul>

      <h4>Business Rules:</h4>
      <ul>
        <li>Email is unique across the system</li>
        <li>Users can belong to multiple organizations</li>
        <li>Deleting a user soft-deletes (data retained for 30 days)</li>
        <li>Profile updates trigger audit logs</li>
      </ul>

      <h2>🏢 Organization Management</h2>

      <h3>Organization Model</h3>
      
      <pre><code>{`interface Organization {
  id: string;
  name: string;                     // Display name
  slug: string;                     // URL-friendly identifier
  domain?: string;                  // Custom domain (enterprise)
  logo_url?: string;               // Organization branding
  settings: {
    features: string[];            // Enabled features
    limits: Record<string, number>; // Usage limits
    preferences: Record<string, any>;
  };
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
  trial_ends_at?: Date;
  created_by: string;              // User ID of creator
}`}</code></pre>

      <h3>Membership & Roles</h3>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Role Hierarchy:</h4>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Role</th>
              <th className="text-left py-2">Permissions</th>
              <th className="text-left py-2">Limitations</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 font-medium">Owner</td>
              <td>All permissions + billing + delete org</td>
              <td>Only one per organization</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 font-medium">Admin</td>
              <td>Manage members, settings, content</td>
              <td>Cannot access billing or delete org</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 font-medium">Member</td>
              <td>Create/edit own content, view shared</td>
              <td>Cannot manage other users</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Organization Features:</h4>
      <ul>
        <li><strong>Team Invitations</strong> - Email-based invites with expiration</li>
        <li><strong>Activity Feed</strong> - Track all organization activities</li>
        <li><strong>Usage Tracking</strong> - Monitor resource usage against limits</li>
        <li><strong>Data Isolation</strong> - Complete separation between organizations</li>
      </ul>

      <h2>💳 Billing & Subscriptions</h2>

      <h3>Subscription Plans</h3>
      
      <pre><code>{`interface Plan {
  id: string;
  name: string;                    // "Starter", "Pro", "Enterprise"
  slug: string;                    // "starter", "pro", "enterprise"
  price_monthly: number;           // In cents (e.g., 999 = $9.99)
  price_yearly: number;            // In cents with discount
  currency: string;                // USD, EUR, etc.
  features: string[];              // List of features
  limits: {
    users: number;                 // Max team members
    projects: number;              // Max projects
    storage_gb: number;            // Storage limit
    api_calls_per_month: number;   // API rate limits
    [key: string]: number;         // Extensible limits
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_default: boolean;             // Default for new signups
  sort_order: number;              // Display order
}`}</code></pre>

      <h3>Default Plans Structure</h3>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-green-900 font-semibold mb-1">✅ Automatic Sync with Landing Page</p>
        <p className="text-green-800">
          Pricing plans are automatically fetched from the database and displayed on the landing page. 
          Any changes to plans in the database will immediately reflect on the marketing site.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-700">Starter Plan</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Price: $9/month or $90/year</li>
            <li>• Users: 3</li>
            <li>• Projects: 5</li>
            <li>• Storage: 10GB</li>
            <li>• API calls: 10,000/month</li>
          </ul>
        </div>
        
        <div className="border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-700">Pro Plan</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Price: $29/month or $290/year</li>
            <li>• Users: 10</li>
            <li>• Projects: 50</li>
            <li>• Storage: 100GB</li>
            <li>• API calls: 100,000/month</li>
            <li>• Priority support</li>
          </ul>
        </div>
        
        <div className="border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-700">Enterprise Plan</h4>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Price: Custom</li>
            <li>• Users: Unlimited</li>
            <li>• Projects: Unlimited</li>
            <li>• Storage: Unlimited</li>
            <li>• API calls: Unlimited</li>
            <li>• Custom domain</li>
            <li>• SLA & dedicated support</li>
          </ul>
        </div>
      </div>

      <h3>Subscription Lifecycle</h3>
      
      <ol>
        <li><strong>Trial Period</strong> - 14 days free trial on signup</li>
        <li><strong>Payment Required</strong> - Card required after trial</li>
        <li><strong>Grace Period</strong> - 3 days after payment failure</li>
        <li><strong>Downgrade</strong> - Automatic downgrade to free tier</li>
        <li><strong>Data Retention</strong> - 30 days after cancellation</li>
      </ol>

      <h3>Managing Pricing Plans</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="text-blue-900 font-semibold mb-2">📝 How to Update Pricing</h4>
        <ol className="text-blue-800 space-y-2">
          <li>1. Update plans in the <code className="bg-blue-100 px-1 rounded">plans</code> table in your database</li>
          <li>2. Changes automatically sync to the landing page on next page load</li>
          <li>3. Set <code className="bg-blue-100 px-1 rounded">is_active = false</code> to hide a plan</li>
          <li>4. Use <code className="bg-blue-100 px-1 rounded">sort_order</code> to control display order</li>
        </ol>
      </div>
      
      <h4>Key Points:</h4>
      <ul>
        <li>The landing page fetches pricing from the database server-side</li>
        <li>Fallback pricing is used if database is unavailable</li>
        <li>Prices are stored in cents (e.g., 999 = $9.99)</li>
        <li>Enterprise plans have <code>price_monthly = 0</code> for custom pricing</li>
      </ul>
      
      <h3>Usage Tracking</h3>
      
      <pre><code>{`interface UsageTracking {
  organization_id: string;
  metric_name: string;      // "api_calls", "storage_bytes", etc.
  usage_value: number;      // Current usage
  usage_limit: number;      // Plan limit
  period_start: Date;       // Billing period start
  period_end: Date;         // Billing period end
  last_updated: Date;
}`}</code></pre>

      <h2>📁 Content Management</h2>

      <h3>Projects System</h3>
      
      <p>Projects are flexible containers for organizing content:</p>
      
      <pre><code>{`interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'general' | 'real_estate' | 'crypto' | 'ecommerce' | 'custom';
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_by: string;
}`}</code></pre>

      <h3>Items System</h3>
      
      <p>Items are the generic content units that can represent anything:</p>
      
      <pre><code>{`interface Item {
  id: string;
  organization_id: string;
  project_id: string;
  parent_id?: string;        // For hierarchical content
  type: string;              // "task", "document", "property", etc.
  title: string;
  slug?: string;
  description?: string;
  content?: string;          // Rich text content
  data: Record<string, any>; // Type-specific data
  status: string;            // "draft", "active", "archived"
  tags: string[];
  assigned_to?: string;      // User assignment
  due_date?: Date;          // For time-based items
}`}</code></pre>

      <h4>Item Type Examples:</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold mb-2">Task Item</h5>
          <pre className="text-xs"><code>{`{
  type: "task",
  data: {
    priority: "high",
    estimated_hours: 4,
    completed: false
  }
}`}</code></pre>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold mb-2">Document Item</h5>
          <pre className="text-xs"><code>{`{
  type: "document",
  data: {
    word_count: 1250,
    version: 2,
    format: "markdown"
  }
}`}</code></pre>
        </div>
      </div>

      <h2>🔒 Security & Permissions</h2>

      <h3>Row Level Security</h3>
      
      <p>All data access is controlled by RLS policies:</p>
      
      <ul>
        <li><strong>User Isolation</strong> - Users can only see their own data</li>
        <li><strong>Organization Boundaries</strong> - Data is scoped to organizations</li>
        <li><strong>Role-Based Access</strong> - Different permissions per role</li>
        <li><strong>Audit Trail</strong> - All changes are logged</li>
      </ul>

      <h3>Key Security Features:</h3>
      
      <ul>
        <li>Automatic session expiration after 30 days</li>
        <li>IP address tracking for sessions</li>
        <li>Failed login attempt monitoring</li>
        <li>Email verification required for sensitive actions</li>
        <li>API rate limiting per organization</li>
      </ul>

      <h2>📊 Analytics & Monitoring</h2>

      <h3>Built-in Metrics:</h3>
      
      <ul>
        <li><strong>User Analytics</strong> - Signups, active users, retention</li>
        <li><strong>Organization Metrics</strong> - Growth, churn, usage</li>
        <li><strong>Feature Usage</strong> - Track which features are used most</li>
        <li><strong>Performance Metrics</strong> - API response times, errors</li>
      </ul>

      <h2>🔄 Data Flows</h2>

      <h3>User Onboarding Flow:</h3>
      
      <ol>
        <li>User signs up → Creates user profile</li>
        <li>Email verification sent</li>
        <li>First login → Prompted to create organization</li>
        <li>Organization created → User becomes owner</li>
        <li>Trial period starts (14 days)</li>
        <li>Onboarding tour shown</li>
      </ol>

      <h3>Team Invitation Flow:</h3>
      
      <ol>
        <li>Admin sends invitation → Email sent</li>
        <li>Invitation link clicked → User signs up/in</li>
        <li>Membership created with specified role</li>
        <li>User added to organization</li>
        <li>Welcome notification sent</li>
      </ol>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <h3 className="text-yellow-900 font-semibold mb-2">🚧 Continuous Improvement</h3>
        <p className="text-yellow-800">
          This documentation is continuously updated as features are refined. Check back 
          regularly for updates and new functionality!
        </p>
      </div>
    </div>
  );
}