# Admin System Configuration

Complete guide for configuring and using the NextSaaS admin system.

## Overview

The admin system provides platform-wide management capabilities including user management, organization oversight, analytics, security monitoring, and system configuration.

## Quick Configuration

### 1. Environment Variables

Add admin configuration to your `.env.local`:

```bash
# Admin System
ENABLE_ADMIN_FEATURES=true
SUPER_ADMIN_EMAIL=your-email@example.com  # Replace with your email

# Optional Configuration
ADMIN_SESSION_TIMEOUT=3600  # 1 hour
ADMIN_REQUIRE_2FA=false     # Set true for production
```

### 2. Create Super Admin Account

Run the admin setup script:

```bash
npm run admin:setup
```

This will:
- Create your super admin account using `SUPER_ADMIN_EMAIL`
- Grant full admin permissions
- Initialize admin audit logging

### 3. Access Admin Dashboard

1. Sign in with your super admin email
2. Navigate to `/admin` to access the dashboard
3. All admin routes are under `/admin/*`

## Admin Features

### User Management (`/admin/users`)
- View all platform users
- Suspend/activate accounts  
- View user activity and organizations
- Access user impersonation (use with caution)

### Organization Management (`/admin/organizations`)
- Monitor all organizations
- View organization metrics
- Manage organization settings
- Handle organization disputes

### Analytics Dashboard (`/admin/analytics`)
- Platform-wide usage metrics
- User growth and engagement
- Revenue and subscription analytics
- Performance monitoring

### Security & Audit (`/admin/security`)
- View all admin actions
- Monitor security events
- Access audit logs
- Configure security settings

### Email Management (`/admin/email`)
- System-wide email campaigns
- Email template management
- Delivery monitoring
- Bulk email operations

### Billing Oversight (`/admin/billing`)
- Platform revenue overview
- Subscription management
- Payment processing monitoring
- Billing dispute resolution

### System Settings (`/admin/settings`)
- Platform configuration
- Feature flag management
- System maintenance
- Environment settings

## Permissions System

Admin permissions are automatically granted to super admins:

- `admin:access_dashboard` - Dashboard access
- `admin:manage_users` - User management
- `admin:manage_organizations` - Organization oversight
- `admin:view_analytics` - Analytics access
- `admin:manage_billing` - Billing management
- `admin:manage_email` - Email system
- `admin:manage_security` - Security configuration
- `admin:view_audit_logs` - Audit log access
- `admin:manage_system` - System settings

## Security Features

### Automatic Auditing
All admin actions are automatically logged with:
- Admin user ID and email
- Action performed
- Target resources
- Timestamp and IP address
- User agent information

### Access Control
- Admin routes protected by middleware
- System admin verification required
- Session timeout for security
- Optional IP whitelisting
- Optional 2FA requirement

### Monitoring
- Failed login attempt tracking
- Suspicious activity detection
- Real-time security alerts
- Comprehensive audit trails

## Production Configuration

For production deployments, enhance security:

```bash
# Enhanced Security
ADMIN_REQUIRE_2FA=true
ADMIN_SESSION_TIMEOUT=1800  # 30 minutes
ADMIN_IP_WHITELIST="your-office-ip/32"

# Audit Configuration
ADMIN_AUDIT_RETENTION_DAYS=365
ADMIN_AUDIT_EXPORT_ENABLED=true

# Performance
ADMIN_ITEMS_PER_PAGE=50
ADMIN_ENABLE_QUERY_CACHING=true
```

## Commands

```bash
# Setup admin system
npm run admin:setup

# Create additional admin
npm run admin:create-user <email>

# Revoke admin access
npm run admin:revoke <email>

# Export audit logs
npm run admin:export-audit [days]

# Verify admin setup
npm run admin:verify
```

## Troubleshooting

**Cannot access admin routes**
```bash
# Verify super admin account
npm run admin:verify

# Check environment variables
grep SUPER_ADMIN_EMAIL .env.local
```

**Admin middleware errors**
```bash
# Rebuild auth package
cd packages/auth && npm run build

# Restart development server
npm run dev
```

**Missing admin data**
```bash
# Re-run admin setup
npm run admin:setup

# Check database migrations
npm run db:status
```

## Best Practices

1. **Limit Admin Access**: Only grant to essential personnel
2. **Regular Audits**: Review admin actions monthly
3. **Secure Environment**: Use strong passwords and 2FA
4. **Monitor Activity**: Watch for unusual admin behavior
5. **Backup Data**: Regular admin data backups
6. **Document Changes**: Log significant admin configuration changes

## API Integration

Admin functions are also available via API:

```typescript
import { AdminClient } from '@nextsaas/admin'

const admin = new AdminClient()

// Get user list
const users = await admin.users.list()

// Suspend user
await admin.users.suspend(userId)

// Get organization metrics
const metrics = await admin.organizations.getMetrics()
```

See the [Admin API Documentation](./docs/admin-api.md) for complete reference.