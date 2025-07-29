# NextSaaS Admin Security Guide

## Overview

This document outlines the comprehensive security measures implemented in the NextSaaS admin system to ensure enterprise-grade protection against unauthorized access and security threats.

## Security Issues Resolved

### 1. Admin Authorization Bypass ✅ FIXED
**Problem**: Any authenticated user could access admin functions due to improper authorization checks.

**Solution**: 
- Implemented proper `isUserSystemAdmin` function from `@nextsaas/auth/middleware/admin-middleware`
- All admin API endpoints now verify both authentication AND system admin privileges
- Added database-backed admin privilege verification using `system_admins` table

### 2. Authentication Client Inconsistency ✅ FIXED
**Problem**: Direct Supabase imports violated the unified client pattern, causing session conflicts.

**Solution**:
- Replaced all direct `@supabase/supabase-js` imports with unified `@nextsaas/supabase` client
- Ensures consistent session handling across the entire application
- Prevents authentication state conflicts between admin and user interfaces

### 3. Service Role Key Exposure ✅ FIXED
**Problem**: High-privilege service role credentials were used inappropriately in API routes.

**Solution**:
- Removed all inappropriate service role key usage
- Replaced direct user creation with proper invitation flow requirements
- Implemented secure user management patterns

## Admin Security Architecture

### Database Schema

#### Users Table Enhancement
```sql
-- System admin flag for quick identification
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_users_is_system_admin ON users(is_system_admin) WHERE is_system_admin = TRUE;
```

#### System Admins Table
```sql
CREATE TABLE system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### Admin Audit Log
```sql
CREATE TABLE system_admin_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Permission System

#### Admin Permissions
- `admin:access_dashboard` - Basic admin dashboard access
- `admin:manage_users` - Full user management capabilities
- `admin:view_users` - Read-only user access
- `admin:suspend_users` - User suspension capabilities
- `admin:impersonate_users` - User impersonation for debugging
- `admin:delete_users` - User deletion capabilities
- `admin:manage_organizations` - Organization management
- `admin:view_organizations` - Read-only organization access
- `admin:delete_organizations` - Organization deletion
- `admin:view_analytics` - Analytics dashboard access
- `admin:export_data` - Data export capabilities
- `admin:manage_billing` - Billing system management
- `admin:view_billing` - Read-only billing access
- `admin:manage_email` - Email campaign management
- `admin:view_email_campaigns` - Email campaign viewing
- `admin:send_emails` - Email sending capabilities
- `admin:manage_security` - Security settings management
- `admin:view_audit_logs` - Audit log access
- `admin:view_security_events` - Security event monitoring
- `admin:manage_system` - System configuration
- `admin:view_system_health` - System health monitoring
- `admin:manage_settings` - Platform settings
- `admin:manage_features` - Feature flag management
- `admin:manage_announcements` - System announcements

### Authentication Flow

1. **Session Verification**: All admin routes verify valid user session
2. **System Admin Check**: Verify `users.is_system_admin = TRUE`
3. **Active Admin Record**: Confirm active record in `system_admins` table with `revoked_at IS NULL`
4. **Permission Validation**: Check specific permissions for granular access control
5. **Audit Logging**: Log all admin actions for compliance and security monitoring

### API Security Middleware

#### Admin API Middleware (`_middleware.ts`)
```typescript
export async function adminAPIMiddleware(
  request: NextRequest,
  requiredPermissions: string[] = []
): Promise<{ success: boolean; session?: any; supabase?: any; error?: string; status?: number }>
```

Features:
- Consistent authentication across all admin endpoints
- Permission-based access control
- Automatic security event logging for unauthorized attempts
- Rate limiting protection
- Comprehensive audit trail

#### Usage Example
```typescript
export async function GET(request: NextRequest) {
  const authResult = await adminAPIMiddleware(request, [ADMIN_PERMISSIONS.VIEW_USERS])
  
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  
  // Proceed with authenticated admin user
  const { session, supabase } = authResult
}
```

### Row Level Security (RLS)

#### System Admins Table
```sql
-- Only system admins can view system admin records
CREATE POLICY "system_admins_select_policy" ON system_admins
  FOR SELECT USING (is_system_admin(auth.uid()));

-- Only existing system admins can manage other system admins
CREATE POLICY "system_admins_insert_policy" ON system_admins
  FOR INSERT WITH CHECK (is_system_admin(auth.uid()));
```

#### Admin Audit Table
```sql
-- Only system admins can view audit logs
CREATE POLICY "system_admin_audit_select_policy" ON system_admin_audit
  FOR SELECT USING (is_system_admin(auth.uid()));

-- System can insert audit records (functions, triggers)
CREATE POLICY "system_admin_audit_insert_policy" ON system_admin_audit
  FOR INSERT WITH CHECK (true);
```

### Security Functions

#### Admin Status Verification
```sql
CREATE OR REPLACE FUNCTION is_system_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u 
    JOIN system_admins sa ON u.id = sa.user_id 
    WHERE u.id = user_uuid 
    AND u.is_system_admin = TRUE 
    AND sa.revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Audit Logging
```sql
CREATE OR REPLACE FUNCTION log_system_admin_action(
  admin_id UUID,
  action_name VARCHAR,
  target_type VARCHAR DEFAULT NULL,
  target_id UUID DEFAULT NULL,
  action_details JSONB DEFAULT '{}',
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
) RETURNS UUID AS $$
```

## Security Best Practices

### 1. Principle of Least Privilege
- Admin users receive only the minimum permissions required for their role
- Granular permission system allows fine-tuned access control
- Regular permission audits ensure appropriate access levels

### 2. Defense in Depth
- Multiple layers of security checks (session, admin flag, active record, permissions)
- Rate limiting prevents abuse
- Comprehensive audit logging for security monitoring

### 3. Secure by Default
- All admin routes require explicit security verification
- Default deny for all admin operations
- Secure session handling through unified Supabase client

### 4. Audit and Monitoring
- All admin actions are logged with full context
- Security events are tracked for unauthorized access attempts
- IP addresses and user agents logged for forensic analysis

### 5. Data Protection
- RLS policies prevent unauthorized data access
- Secure database functions with proper privilege levels
- No sensitive credentials exposed in API routes

## Setup Instructions

### 1. Apply Database Migration
```bash
# Apply the admin system migration
npx supabase db reset
```

### 2. Create Initial Super Admin
```sql
-- Update the email in packages/database/seeds/001_create_super_admin.sql
-- Then run the seed script
```

### 3. Configure Environment Variables
Ensure proper environment variables are set (no service role key exposure):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# No SUPABASE_SERVICE_ROLE_KEY in API routes
```

### 4. Verify Security Setup
- Test admin access with proper credentials
- Verify non-admin users cannot access admin functions
- Check audit logs are being created properly

## Monitoring and Alerting

### Security Events to Monitor
- Unauthorized admin access attempts
- Failed authentication attempts on admin endpoints
- Unusual admin activity patterns
- Permission escalation attempts
- High-frequency admin API calls

### Recommended Alerts
- Multiple failed admin login attempts
- Admin access from new IP addresses
- Admin privilege grants/revocations
- Large data exports
- System configuration changes

## Compliance Features

### SOC 2 Type II
- Comprehensive audit logging
- Access control documentation
- Security monitoring capabilities
- Data protection measures

### GDPR
- Data export capabilities
- User deletion functionality
- Comprehensive audit trails
- Privacy controls

### HIPAA (if applicable)
- Access logging and monitoring
- User activity tracking
- Secure data handling
- Administrative safeguards

## Emergency Procedures

### Compromised Admin Account
1. Immediately revoke admin privileges in `system_admins` table
2. Set `revoked_at` timestamp
3. Review audit logs for suspicious activity
4. Reset affected account credentials
5. Notify security team

### Suspicious Activity
1. Review system admin audit logs
2. Check for unauthorized permission changes
3. Verify all admin actions are legitimate
4. Implement additional monitoring if needed

### Recovery Procedures
1. Restore from backup if data compromise suspected
2. Re-apply security patches
3. Audit all admin accounts and permissions
4. Update security procedures based on incident

## Conclusion

The NextSaaS admin security system now provides enterprise-grade protection with:
- ✅ Proper authentication and authorization
- ✅ Comprehensive audit logging
- ✅ Granular permission system
- ✅ Row-level security
- ✅ Rate limiting and monitoring
- ✅ Secure API design patterns

All critical security vulnerabilities have been resolved, and the system follows security best practices for SaaS applications.