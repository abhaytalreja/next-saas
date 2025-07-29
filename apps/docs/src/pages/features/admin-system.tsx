export default function AdminSystemPage() {
  return (
    <div className="prose max-w-none">
      <h1>🛡️ Admin System</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-900 font-semibold mb-1">⚙️ Enterprise-Grade Administration</p>
        <p className="text-blue-800">
          NextSaaS includes a comprehensive admin system for platform-wide management, 
          user oversight, and system administration with full audit trails and security features.
        </p>
      </div>

      <h2>🎯 Overview</h2>
      
      <p>
        The NextSaaS admin system provides <strong>system administrators</strong> with complete platform oversight
        and management capabilities. Built with security-first principles, every admin action is logged and 
        audited for compliance and security monitoring.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">👥 User Management</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• View all platform users</li>
            <li>• Suspend/activate user accounts</li>
            <li>• Monitor user activity and sessions</li>
            <li>• User impersonation for support</li>
            <li>• Bulk user operations</li>
            <li>• User data export</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">🏢 Organization Oversight</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Monitor all organizations</li>
            <li>• Organization metrics and analytics</li>
            <li>• Member management oversight</li>
            <li>• Organization lifecycle management</li>
            <li>• Billing and subscription oversight</li>
            <li>• Organization data export</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">📊 Analytics & Reporting</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Platform-wide usage metrics</li>
            <li>• User growth and engagement analytics</li>
            <li>• Revenue and subscription analytics</li>
            <li>• Performance monitoring dashboards</li>
            <li>• Custom reporting tools</li>
            <li>• Data export and visualization</li>
          </ul>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">🔒 Security & Audit</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Complete audit trail logging</li>
            <li>• Security event monitoring</li>
            <li>• Admin action tracking</li>
            <li>• Session and access monitoring</li>
            <li>• Security alert system</li>
            <li>• Compliance reporting</li>
          </ul>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">📧 Email Management</h4>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>• System-wide email campaigns</li>
            <li>• Email template management</li>
            <li>• Delivery monitoring and analytics</li>
            <li>• Bulk email operations</li>
            <li>• Email system configuration</li>
            <li>• Bounce and complaint handling</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">💳 Billing Oversight</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Platform revenue overview</li>
            <li>• Subscription lifecycle management</li>
            <li>• Payment processing monitoring</li>
            <li>• Billing dispute resolution</li>
            <li>• Revenue analytics and forecasting</li>
            <li>• Payment method oversight</li>
          </ul>
        </div>
      </div>

      <h2>🚀 Quick Start</h2>

      <h3>1. Environment Configuration</h3>
      
      <p>Add admin system configuration to your environment:</p>

      <pre><code>{`# Admin System Configuration
ENABLE_ADMIN_FEATURES=true
SUPER_ADMIN_EMAIL=your-admin@example.com

# Optional Security Settings
ADMIN_SESSION_TIMEOUT=3600  # 1 hour
ADMIN_REQUIRE_2FA=false     # Enable for production
ADMIN_IP_WHITELIST=""       # Comma-separated IPs`}</code></pre>

      <h3>2. Create Super Admin Account</h3>
      
      <p>Run the admin setup script to create your super admin account:</p>

      <pre><code>{`# Create super admin with full permissions
npm run admin:setup

# Verify admin account was created
npm run admin:verify`}</code></pre>

      <h3>3. Access Admin Dashboard</h3>

      <p>Navigate to the admin dashboard and explore available features:</p>

      <pre><code>{`// Sign in with your super admin email
// Navigate to: http://localhost:3000/admin

// Available admin routes:
/admin                 # Main dashboard
/admin/users          # User management
/admin/organizations  # Organization oversight
/admin/analytics      # Platform analytics
/admin/security       # Security & audit logs
/admin/email          # Email management
/admin/billing        # Billing oversight
/admin/settings       # System settings`}</code></pre>

      <h2>🔧 Admin Components & Hooks</h2>

      <h3>Using Admin Components</h3>

      <p>The admin system provides ready-to-use components:</p>

      <pre><code>{`import { 
  AdminDashboard,
  UserManagement,
  OrganizationOverview,
  SecurityAuditLog,
  AdminAnalytics
} from '@nextsaas/admin';

// Main admin dashboard
<AdminDashboard />

// User management interface
<UserManagement 
  onUserSuspend={handleUserSuspend}
  onUserActivate={handleUserActivate}
  enableImpersonation={true}
/>

// Organization oversight
<OrganizationOverview 
  showMetrics={true}
  enableBulkActions={true}
/>

// Security audit interface
<SecurityAuditLog 
  autoRefresh={true}
  exportEnabled={true}
/>`}</code></pre>

      <h3>Admin Data Hooks</h3>

      <p>Access admin data and functionality through hooks:</p>

      <pre><code>{`import { 
  useAdminUsers,
  useAdminOrganizations,
  useAdminAnalytics,
  useAdminAudit 
} from '@nextsaas/admin';

export function AdminPanel() {
  const { 
    users, 
    loading, 
    suspendUser,
    activateUser,
    deleteUser 
  } = useAdminUsers();
  
  const { 
    organizations,
    getOrgMetrics,
    exportOrgData 
  } = useAdminOrganizations();
  
  const { 
    platformMetrics,
    userGrowth,
    revenueData 
  } = useAdminAnalytics();
  
  const { 
    auditLogs,
    searchAudit,
    exportAudit 
  } = useAdminAudit();
  
  return (
    <div>
      <h2>Platform Overview</h2>
      <p>Total Users: {users.length}</p>
      <p>Total Organizations: {organizations.length}</p>
      <p>Monthly Revenue: {platformMetrics.monthlyRevenue}</p>
    </div>
  );
}`}</code></pre>

      <h2>📚 Complete API Reference</h2>

      <h3>Admin Management Hooks</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useAdminUsers()</h4>
        <p className="text-sm mb-3">Complete user management functionality</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>users: AdminUser[]</code> - All platform users</li>
            <li>• <code>loading: boolean</code> - Loading state</li>
            <li>• <code>totalUsers: number</code> - Total user count</li>
            <li>• <code>activeUsers: number</code> - Active users count</li>
            <li>• <code>suspendUser(userId): Promise&lt;void&gt;</code></li>
            <li>• <code>activateUser(userId): Promise&lt;void&gt;</code></li>
            <li>• <code>deleteUser(userId): Promise&lt;void&gt;</code></li>
            <li>• <code>impersonateUser(userId): Promise&lt;void&gt;</code></li>
            <li>• <code>exportUsers(filters): Promise&lt;Blob&gt;</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useAdminOrganizations()</h4>
        <p className="text-sm mb-3">Organization oversight and management</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>organizations: Organization[]</code> - All organizations</li>
            <li>• <code>metrics: OrgMetrics</code> - Organization metrics</li>
            <li>• <code>getOrgDetails(orgId): Promise&lt;OrgDetails&gt;</code></li>
            <li>• <code>getOrgMembers(orgId): Promise&lt;Member[]&gt;</code></li>
            <li>• <code>suspendOrganization(orgId): Promise&lt;void&gt;</code></li>
            <li>• <code>deleteOrganization(orgId): Promise&lt;void&gt;</code></li>
            <li>• <code>exportOrgData(orgId): Promise&lt;Blob&gt;</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useAdminAnalytics()</h4>
        <p className="text-sm mb-3">Platform analytics and metrics</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>platformMetrics: PlatformMetrics</code> - Overall platform stats</li>
            <li>• <code>userGrowth: GrowthData[]</code> - User growth over time</li>
            <li>• <code>revenueData: RevenueData[]</code> - Revenue analytics</li>
            <li>• <code>usageMetrics: UsageData[]</code> - Feature usage data</li>
            <li>• <code>getCustomReport(config): Promise&lt;ReportData&gt;</code></li>
            <li>• <code>exportAnalytics(timeRange): Promise&lt;Blob&gt;</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">useAdminAudit()</h4>
        <p className="text-sm mb-3">Security audit and logging</p>
        
        <div className="space-y-2 text-sm">
          <div><strong>Returns:</strong></div>
          <ul className="ml-4 space-y-1">
            <li>• <code>auditLogs: AuditEntry[]</code> - Recent audit entries</li>
            <li>• <code>searchAudit(query): Promise&lt;AuditEntry[]&gt;</code></li>
            <li>• <code>getSecurityEvents(): Promise&lt;SecurityEvent[]&gt;</code></li>
            <li>• <code>exportAudit(timeRange): Promise&lt;Blob&gt;</code></li>
            <li>• <code>createSecurityAlert(config): Promise&lt;void&gt;</code></li>
          </ul>
        </div>
      </div>

      <h3>Admin Route Protection</h3>

      <p>Admin routes are automatically protected with enhanced middleware:</p>

      <pre><code>{`// middleware.ts - Admin protection is built-in
import { adminMiddleware } from '@nextsaas/auth/middleware';

export default adminMiddleware({
  adminRoutes: ['/admin'],
  systemAdminRoutes: [
    '/admin/users',
    '/admin/organizations', 
    '/admin/security',
    '/admin/system'
  ],
  requireSystemAdmin: true
});

// Component-level admin protection
import { AdminProtectedRoute } from '@nextsaas/admin';

<AdminProtectedRoute 
  requirePermission="admin:manage_users"
  fallback={<UnauthorizedPage />}
>
  <UserManagementPanel />
</AdminProtectedRoute>`}</code></pre>

      <h2>🔐 Permissions & Security</h2>

      <h3>Admin Permission System</h3>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Core Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User Management:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <code>admin:manage_users</code></li>
              <li>• <code>admin:suspend_users</code></li>
              <li>• <code>admin:impersonate_users</code></li>
              <li>• <code>admin:delete_users</code></li>
            </ul>
          </div>
          <div>
            <strong>Organization Management:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <code>admin:manage_organizations</code></li>
              <li>• <code>admin:view_organizations</code></li>
              <li>• <code>admin:delete_organizations</code></li>
            </ul>
          </div>
          <div>
            <strong>System Administration:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <code>admin:access_dashboard</code></li>
              <li>• <code>admin:manage_system</code></li>
              <li>• <code>admin:manage_settings</code></li>
              <li>• <code>admin:view_system_health</code></li>
            </ul>
          </div>
          <div>
            <strong>Security & Audit:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <code>admin:view_audit_logs</code></li>
              <li>• <code>admin:manage_security</code></li>
              <li>• <code>admin:export_data</code></li>
            </ul>
          </div>
        </div>
      </div>

      <h3>Security Features</h3>

      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-900 font-semibold mb-2">🛡️ Automatic Security</h4>
          <ul className="text-red-800 space-y-1 text-sm">
            <li>• <strong>Complete Audit Trail</strong> - Every admin action is logged</li>
            <li>• <strong>IP Tracking</strong> - All admin access includes IP and location</li>
            <li>• <strong>Session Monitoring</strong> - Enhanced session security for admins</li>
            <li>• <strong>Permission Verification</strong> - Real-time permission checking</li>
            <li>• <strong>Access Logging</strong> - All admin route access is audited</li>
            <li>• <strong>Security Alerts</strong> - Automated alerts for suspicious activity</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-900 font-semibold mb-2">⚙️ Security Configuration</h4>
          <pre className="text-xs"><code>{`// Production security configuration
const adminSecurityConfig = {
  session: {
    timeout: 1800, // 30 minutes
    requireReauth: true,
  },
  access: {
    requireIPWhitelist: true,
    require2FA: true,
    maxFailedAttempts: 3,
  },
  audit: {
    logAllActions: true,
    retentionDays: 365,
    exportEnabled: true,
  }
};`}</code></pre>
        </div>
      </div>

      <h2>🏗️ Available Admin Features</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-blue-900 font-semibold mb-2">📊 Admin Dashboard Routes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Core Admin Pages:</strong>
            <ul className="mt-1 space-y-1 text-blue-800">
              <li>• <code>/admin</code> - Main dashboard with platform overview</li>
              <li>• <code>/admin/users</code> - User management and oversight</li>
              <li>• <code>/admin/organizations</code> - Organization monitoring</li>
              <li>• <code>/admin/analytics</code> - Platform analytics and metrics</li>
            </ul>
          </div>
          <div>
            <strong>Advanced Features:</strong>
            <ul className="mt-1 space-y-1 text-blue-800">
              <li>• <code>/admin/security</code> - Security monitoring and audit logs</li>
              <li>• <code>/admin/email</code> - Email system management</li>
              <li>• <code>/admin/billing</code> - Billing and revenue oversight</li>
              <li>• <code>/admin/settings</code> - System configuration</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="text-green-900 font-semibold mb-2">🧩 Admin UI Components</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Dashboard Components:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• <code>AdminDashboard</code> - Main platform overview</li>
              <li>• <code>PlatformMetrics</code> - Key performance indicators</li>
              <li>• <code>RecentActivity</code> - Latest admin and user actions</li>
              <li>• <code>SystemHealth</code> - Platform status monitoring</li>
            </ul>
          </div>
          <div>
            <strong>Management Components:</strong>
            <ul className="mt-1 space-y-1 text-green-800">
              <li>• <code>UserManagement</code> - Complete user oversight</li>
              <li>• <code>OrganizationOverview</code> - Organization management</li>
              <li>• <code>SecurityAuditLog</code> - Security event monitoring</li>
              <li>• <code>AdminAnalytics</code> - Analytics dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <h2>🔧 Configuration & Setup</h2>

      <h3>Environment Variables</h3>

      <pre><code>{`# Required - Admin System
ENABLE_ADMIN_FEATURES=true
SUPER_ADMIN_EMAIL=your-admin@example.com
SUPER_ADMIN_NAME="System Administrator"

# Security Configuration
ADMIN_SESSION_TIMEOUT=3600        # 1 hour
ADMIN_REQUIRE_2FA=false          # Enable for production
ADMIN_IP_WHITELIST=""            # Comma-separated IPs
ADMIN_MAX_FAILED_ATTEMPTS=3      # Failed login limit

# Audit Configuration
ADMIN_AUDIT_ENABLED=true
ADMIN_AUDIT_RETENTION_DAYS=365
ADMIN_LOG_LEVEL=info

# Performance Settings
ADMIN_ITEMS_PER_PAGE=25
ADMIN_ENABLE_QUERY_CACHING=true`}</code></pre>

      <h3>Database Schema</h3>

      <p>The admin system adds these database tables:</p>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-2">Admin Tables</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <ul className="space-y-1">
              <li><code>system_admins</code> - Admin user records and permissions</li>
              <li><code>system_admin_audit</code> - Complete audit trail</li>
            </ul>
          </div>
          <div>
            <ul className="space-y-1">
              <li><code>users.is_system_admin</code> - Admin flag on user records</li>
              <li><code>is_system_admin()</code> - Database function for permission checks</li>
            </ul>
          </div>
        </div>
      </div>

      <h2>🚨 Troubleshooting</h2>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Cannot Access Admin Routes</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Check super admin setup:</strong> Run <code>npm run admin:verify</code></li>
            <li>• <strong>Verify environment variables:</strong> Ensure <code>ENABLE_ADMIN_FEATURES=true</code></li>
            <li>• <strong>Check database:</strong> Verify <code>users.is_system_admin = true</code> for your account</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Admin Middleware Errors</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Package not built:</strong> Run <code>cd packages/auth && npm run build</code></li>
            <li>• <strong>Missing dependencies:</strong> Run <code>npm install</code> in root and packages</li>
            <li>• <strong>Database connection:</strong> Check Supabase connection and RLS policies</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Permission Issues</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• <strong>Missing permissions:</strong> Check <code>system_admins.permissions</code> field</li>
            <li>• <strong>Revoked access:</strong> Ensure <code>system_admins.revoked_at</code> is null</li>
            <li>• <strong>Session issues:</strong> Clear browser cache and sign in again</li>
          </ul>
        </div>
      </div>

      <h2>📋 Management Scripts</h2>

      <p>Use these scripts for admin system management:</p>

      <pre><code>{`# Setup and verification
npm run admin:setup           # Create super admin account
npm run admin:verify          # Verify admin setup
npm run admin:status          # Check admin system status

# Admin management
npm run admin:create-user <email>    # Create additional admin
npm run admin:revoke <email>         # Revoke admin privileges
npm run admin:list-admins           # List all system admins

# Data operations
npm run admin:export-audit [days]   # Export audit logs
npm run admin:export-users          # Export user data
npm run admin:backup-data           # Backup admin data`}</code></pre>

      <h2>🔗 Next Steps</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
        <a href="/features/authentication" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🔐 Authentication</h4>
          <p className="text-sm text-gray-600">Learn how admin integrates with the auth system</p>
        </a>
        
        <a href="/features/database" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">💾 Database Security</h4>
          <p className="text-sm text-gray-600">Understand admin RLS policies and data access</p>
        </a>
        
        <a href="/architecture/organization-modes" className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <h4 className="font-semibold mb-1">🏢 Multi-Tenancy</h4>
          <p className="text-sm text-gray-600">Admin oversight in multi-tenant environments</p>
        </a>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
        <h3 className="text-red-900 font-semibold mb-2">⚠️ Security Best Practices</h3>
        <ul className="text-red-800 space-y-1 text-em">
          <li>• <strong>Limit Admin Access:</strong> Only grant admin privileges to essential personnel</li>
          <li>• <strong>Enable 2FA:</strong> Always require two-factor authentication for admin accounts</li>
          <li>• <strong>Monitor Audit Logs:</strong> Regularly review admin actions and security events</li>
          <li>• <strong>Use IP Whitelisting:</strong> Restrict admin access to known IP addresses</li>
          <li>• <strong>Regular Reviews:</strong> Periodically audit admin permissions and access</li>
          <li>• <strong>Secure Sessions:</strong> Use short session timeouts for admin accounts</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h3 className="text-blue-900 font-semibold mb-2">💡 Pro Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Set up monitoring alerts for admin activities using the audit system</li>
          <li>• Use the <code>ADMIN_SETUP.md</code> guide for detailed configuration steps</li>
          <li>• Enable audit log exports for compliance and security reporting</li>
          <li>• Test admin functionality in staging before production deployment</li>
          <li>• Create runbooks for common admin operations and security procedures</li>
        </ul>
      </div>
    </div>
  );
}