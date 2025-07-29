# Admin System Setup Guide

This guide covers the complete setup and configuration of the NextSaaS admin system, including database migrations, super admin creation, and security configuration.

## Prerequisites

Before setting up the admin system, ensure you have:

- ✅ NextSaaS project cloned and dependencies installed
- ✅ Supabase project configured and connected
- ✅ Basic user authentication working
- ✅ Multi-tenant organization system set up

## Quick Start

For a rapid setup, run these commands in order:

```bash
# 1. Apply admin database migrations
npm run db:migrate

# 2. Create initial super admin
npm run db:seed

# 3. Build admin package
npm run build --filter=@nextsaas/admin

# 4. Start development server
npm run dev
```

## Detailed Setup

### 1. Database Migration

The admin system requires specific database tables and security policies.

#### Apply Admin Migrations

```bash
# Apply the super admin system migration
npx supabase db push

# Or apply specific migrations
npx supabase migration up 022_add_super_admin_system
npx supabase migration up 023_admin_dashboard_enhancements
```

#### Migration Details

**022_add_super_admin_system.sql** creates:
- `is_system_admin` column on users table
- Admin audit logging system
- Admin-specific RLS policies
- System admin role functions

**023_admin_dashboard_enhancements.sql** adds:
- Dashboard metrics views
- Performance indexes
- Enhanced audit logging
- System health monitoring tables

### 2. Super Admin Creation

#### Automated Setup (Recommended)

```bash
# Run the super admin seed script
npm run db:seed
```

This creates a super admin user using the email from your environment:

```env
# Required in .env.local
SUPER_ADMIN_EMAIL=admin@yourcompany.com
```

#### Manual Setup

If you need to manually create a super admin:

```sql
-- 1. Create or update existing user
INSERT INTO users (email, name, is_system_admin)
VALUES ('admin@yourcompany.com', 'System Administrator', true)
ON CONFLICT (email) 
DO UPDATE SET is_system_admin = true;

-- 2. Verify creation
SELECT id, email, name, is_system_admin 
FROM users 
WHERE is_system_admin = true;
```

### 3. Environment Configuration

#### Required Environment Variables

Add these to your `.env.local` file:

```env
# Super Admin Configuration
SUPER_ADMIN_EMAIL=admin@yourcompany.com

# Admin Dashboard Configuration (Optional)
ADMIN_DASHBOARD_TITLE="NextSaaS Admin"
ADMIN_PAGINATION_LIMIT=20

# Security Configuration (Recommended)
ADMIN_SESSION_TIMEOUT=3600  # 1 hour in seconds
ADMIN_REQUIRE_2FA=false     # Enable for production
ADMIN_IP_WHITELIST=""       # Comma-separated IPs (optional)
```

#### Production Environment Variables

For production, consider these additional settings:

```env
# Production Security
ADMIN_REQUIRE_2FA=true
ADMIN_IP_WHITELIST="203.0.113.1,203.0.113.2"
ADMIN_SESSION_TIMEOUT=1800  # 30 minutes

# Monitoring Integration
ADMIN_MONITORING_ENABLED=true
ADMIN_METRICS_ENDPOINT="https://your-monitoring-service.com/api"

# Audit Logging
ADMIN_AUDIT_RETENTION_DAYS=90
ADMIN_AUDIT_EXPORT_ENABLED=true
```

### 4. Package Configuration

#### Install Admin Package

The admin package should already be installed in your monorepo:

```bash
# Verify installation
npm list @nextsaas/admin

# If missing, add it
npm install @nextsaas/admin --workspace=apps/web
```

#### Build Admin Package

```bash
# Build admin package and dependencies
npm run build --filter=@nextsaas/admin

# Or build all packages
npm run build
```

### 5. Middleware Configuration

#### Update Next.js Middleware

Ensure your middleware includes admin route protection:

```typescript
// apps/web/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ... existing auth middleware

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // ... supabase config
    )

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    // Check system admin status
    const { data: user } = await supabase
      .from('users')
      .select('is_system_admin')
      .eq('id', session.user.id)
      .single()

    if (!user?.is_system_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    // ... other protected routes
  ],
}
```

### 6. TypeScript Configuration

#### Path Mapping

Ensure your `tsconfig.json` includes the admin package:

```json
{
  "compilerOptions": {
    "paths": {
      "@nextsaas/admin": ["../packages/admin/src"],
      "@nextsaas/admin/*": ["../packages/admin/src/*"]
    }
  }
}
```

## Verification

### 1. Database Verification

Check that all admin tables and functions exist:

```sql
-- Check admin column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_system_admin';

-- Verify super admin created
SELECT email, is_system_admin 
FROM users 
WHERE is_system_admin = true;

-- Check audit logging function
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'log_system_admin_action';
```

### 2. Application Verification

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test admin access**:
   - Navigate to `/admin`
   - Should redirect to sign-in if not authenticated
   - Sign in with super admin email
   - Should see admin dashboard

3. **Test API endpoints**:
   ```bash
   # Test dashboard API (requires authentication)
   curl -X GET http://localhost:3000/api/admin/dashboard \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN"
   ```

### 3. Security Verification

- ✅ Non-admin users cannot access `/admin` routes
- ✅ Admin API endpoints return 403 for non-admin users
- ✅ Audit logging captures admin actions
- ✅ Session timeout works as configured

## Troubleshooting

### Common Issues

#### 1. "Forbidden" Error on Admin Pages

**Symptoms**: Getting 403 error when accessing admin pages

**Solutions**:
```sql
-- Verify user has admin flag
SELECT email, is_system_admin FROM users WHERE email = 'your-email@domain.com';

-- Grant admin privileges
UPDATE users SET is_system_admin = true WHERE email = 'your-email@domain.com';
```

#### 2. Admin Package Not Found

**Symptoms**: Import errors for `@nextsaas/admin`

**Solutions**:
```bash
# Rebuild admin package
npm run build --filter=@nextsaas/admin

# Clear Next.js cache
rm -rf apps/web/.next

# Restart development server
npm run dev
```

#### 3. Database Migration Failures

**Symptoms**: Migration errors during setup

**Solutions**:
```bash
# Check current migration status
npx supabase migration list

# Reset migrations (CAUTION: Development only)
npx supabase db reset

# Apply migrations step by step
npx supabase migration up --target 022
npx supabase migration up --target 023
```

#### 4. Session Authentication Issues

**Symptoms**: Constant redirections or auth failures

**Solutions**:
- Ensure unified Supabase client usage (see `CLAUDE.md`)
- Clear browser cookies and localStorage
- Check environment variables are correct

### Debug Mode

Enable debug logging for troubleshooting:

```env
# Add to .env.local
DEBUG=nextsaas:admin*
NEXT_PUBLIC_DEBUG_ADMIN=true
```

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Enable 2FA requirement (`ADMIN_REQUIRE_2FA=true`)
- [ ] Configure IP whitelisting if needed
- [ ] Set shorter session timeout
- [ ] Enable audit log retention policies
- [ ] Configure monitoring and alerting
- [ ] Review and test all admin permissions
- [ ] Backup database before deployment

### Performance Optimization

- [ ] Database indexes on admin query paths
- [ ] CDN configuration for admin assets
- [ ] Rate limiting on admin API endpoints
- [ ] Monitoring for admin dashboard performance

### Monitoring Setup

Configure monitoring for:
- Admin login attempts and failures
- Admin action frequency and patterns
- System performance impact
- Security events and anomalies

## Next Steps

After setup completion:

1. **Read the [Admin User Guide](./admin-user-guide.md)** to understand dashboard features
2. **Review [Admin API Reference](./admin-api-reference.md)** for integration details
3. **Check [Security Documentation](../ADMIN_SECURITY.md)** for security best practices
4. **Set up monitoring and alerting** for admin system health

## Support

For additional help:
- Check the [Troubleshooting Guide](./admin-troubleshooting.md)
- Review package documentation in `/packages/admin/README.md`
- Open an issue on the project repository

---

**⚠️ Security Note**: Admin access provides full system control. Always follow the principle of least privilege and regularly audit admin user access.