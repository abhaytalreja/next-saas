# Admin System Troubleshooting Guide

This guide helps resolve common issues with the NextSaaS admin system, including setup problems, access issues, and performance concerns.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] **Database migrations applied**: `npm run db:migrate`
- [ ] **Super admin created**: Check `users` table for `is_system_admin = true`
- [ ] **Admin package built**: `npm run build --filter=@nextsaas/admin`
- [ ] **Session valid**: User is signed in with admin account
- [ ] **Environment variables set**: Check `.env.local` for admin settings
- [ ] **Browser cache cleared**: Clear cache and cookies
- [ ] **Network connectivity**: Check internet connection and API access

## Common Issues

### 1. Access and Authentication Issues

#### Issue: "Forbidden" Error on Admin Pages

**Symptoms:**
- Getting 403 Forbidden when accessing `/admin`
- Admin pages redirect to main dashboard
- "Access denied" messages

**Causes & Solutions:**

**1. User lacks admin privileges**
```sql
-- Check current admin status
SELECT email, is_system_admin FROM users WHERE email = 'your-email@domain.com';

-- Grant admin privileges
UPDATE users SET is_system_admin = true WHERE email = 'your-email@domain.com';
```

**2. Middleware configuration issue**
```typescript
// Verify middleware.ts includes admin routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
```

**3. Session authentication problems**
```bash
# Check unified Supabase client usage (see CLAUDE.md)
# Clear browser data and re-authenticate
# Verify environment variables are correct
```

#### Issue: Constant Redirections or Auth Loops

**Symptoms:**
- Endless redirect between login and admin pages
- "User not authenticated" despite being logged in
- Session expires immediately

**Solutions:**

**1. Check Supabase client consistency**
```typescript
// Ensure all components use the same client
import { getSupabaseBrowserClient } from '@nextsaas/supabase'

// ❌ Don't use direct imports
import { createClient } from '@supabase/supabase-js'
```

**2. Clear authentication state**
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Clear cookies in browser developer tools
# Restart development server
npm run dev
```

**3. Verify middleware configuration**
```typescript
// middleware.ts should handle admin routes properly
if (request.nextUrl.pathname.startsWith('/admin')) {
  // Proper session check and admin verification
}
```

### 2. Setup and Installation Issues

#### Issue: Admin Package Not Found

**Symptoms:**
- `Cannot resolve '@nextsaas/admin'` errors
- Import statements fail
- TypeScript errors for admin components

**Solutions:**

**1. Rebuild admin package**
```bash
# Build admin package specifically
npm run build --filter=@nextsaas/admin

# Or build all packages
npm run build

# Clear Next.js cache if needed
rm -rf apps/web/.next
npm run dev
```

**2. Check package.json dependencies**
```json
// apps/web/package.json should include
{
  "dependencies": {
    "@nextsaas/admin": "workspace:*"
  }
}
```

**3. Verify TypeScript path mapping**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@nextsaas/admin": ["../packages/admin/src"],
      "@nextsaas/admin/*": ["../packages/admin/src/*"]
    }
  }
}
```

#### Issue: Database Migration Failures

**Symptoms:**
- Migration commands fail
- Admin-related database tables missing
- SQL errors during setup

**Solutions:**

**1. Check migration status**
```bash
# List all migrations
npx supabase migration list

# Check which have been applied
npx supabase migration status
```

**2. Reset and reapply migrations (Development only)**
```bash
# ⚠️ CAUTION: This destroys all data
npx supabase db reset

# Reapply all migrations
npx supabase db push
```

**3. Apply specific admin migrations**
```bash
# Apply admin system migration
npx supabase migration up --target 022

# Apply dashboard enhancements
npx supabase migration up --target 023
```

**4. Manual migration verification**
```sql
-- Check if admin tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%admin%';

-- Check for system admin column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_system_admin';
```

### 3. Performance and Loading Issues

#### Issue: Admin Dashboard Loads Slowly

**Symptoms:**
- Long loading times for admin pages
- Dashboard metrics take too long to load
- Browser becomes unresponsive

**Solutions:**

**1. Enable performance monitoring**
```env
# Add to .env.local
NEXT_PUBLIC_DEBUG_ADMIN=true
DEBUG=nextsaas:admin*
```

**2. Check database performance**
```sql
-- Check for missing indexes
EXPLAIN ANALYZE SELECT * FROM users WHERE is_system_admin = true;

-- Monitor query performance
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%admin%' 
ORDER BY mean_exec_time DESC;
```

**3. Optimize data fetching**
```typescript
// Use pagination for large datasets
const { users } = useUserManagement({
  page: 1,
  limit: 20  // Reduce if needed
})

// Implement proper filtering
const filteredUsers = useMemo(() => 
  users.filter(user => user.status === 'active'), 
  [users]
)
```

#### Issue: Admin API Endpoints Timeout

**Symptoms:**
- 504 Gateway Timeout errors
- API requests never complete
- Network errors in browser console

**Solutions:**

**1. Check server resources**
```bash
# Monitor server performance
htop  # or Activity Monitor on macOS

# Check development server logs
npm run dev  # Look for error messages
```

**2. Optimize database queries**
```sql
-- Add missing indexes for admin queries
CREATE INDEX CONCURRENTLY idx_users_is_system_admin 
ON users(is_system_admin) 
WHERE is_system_admin = true;

CREATE INDEX CONCURRENTLY idx_users_last_seen_at 
ON users(last_seen_at) 
WHERE last_seen_at IS NOT NULL;
```

**3. Implement request caching**
```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['admin-dashboard'],
  queryFn: fetchDashboardData,
  staleTime: 5 * 60 * 1000  // 5 minutes
})
```

### 4. Data and Display Issues

#### Issue: Incorrect or Missing Data

**Symptoms:**
- Dashboard shows zero or incorrect metrics
- User lists are empty or incomplete
- Charts display no data

**Solutions:**

**1. Verify data sources**
```sql
-- Check user count
SELECT COUNT(*) FROM users WHERE deleted_at IS NULL;

-- Check organizations
SELECT COUNT(*) FROM organizations WHERE deleted_at IS NULL;

-- Check audit logs
SELECT COUNT(*) FROM audit_logs;
```

**2. Check data transformations**
```typescript
// Verify API response structure
console.log('Dashboard data:', dashboardData)

// Check for null/undefined values
const safeMetrics = {
  totalUsers: metrics?.totalUsers ?? 0,
  activeUsers: metrics?.activeUsers ?? 0
}
```

**3. Review mock data configuration**
```typescript
// Some metrics use mock data (see admin API)
// Ensure mock data is reasonable for your environment
const mockRevenue = {
  mrr: 125000,  // Adjust for your app
  total: 1500000
}
```

#### Issue: Export Functionality Not Working

**Symptoms:**
- Export buttons do nothing
- Download doesn't start
- CSV/Excel files are empty

**Solutions:**

**1. Check browser permissions**
```javascript
// Verify download permissions
// Check if popup blockers are interfering
// Ensure browser allows file downloads
```

**2. Debug export functions**
```typescript
// Test export with sample data
import { exportToCSV } from '@nextsaas/admin'

const testData = [{ id: 1, name: 'Test User' }]
exportToCSV(testData, 'test-export.csv')
```

**3. Check data size limits**
```typescript
// Implement chunked exports for large datasets
const chunkSize = 1000
const chunks = []
for (let i = 0; i < data.length; i += chunkSize) {
  chunks.push(data.slice(i, i + chunkSize))
}
```

### 5. Security and Compliance Issues

#### Issue: Audit Logs Not Recording

**Symptoms:**
- Admin actions not appearing in audit logs
- Missing log entries for user management
- Audit trail incomplete

**Solutions:**

**1. Verify audit function exists**
```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'log_system_admin_action';

-- Test function manually
SELECT log_system_admin_action(
  'user-id'::uuid, 
  'test_action', 
  'test', 
  '{"test": true}'::jsonb,
  '127.0.0.1'::inet, 
  'test-agent'
);
```

**2. Check function calls in API**
```typescript
// Ensure admin endpoints call audit function
await supabase.rpc('log_system_admin_action', {
  admin_id: session.user.id,
  action_name: 'dashboard_viewed',
  target_type: 'dashboard',
  action_details: { method: 'admin_panel' },
  ip_addr: request.ip,
  user_agent_str: request.headers.get('user-agent')
})
```

**3. Enable audit logging**
```typescript
// Uncomment audit logging calls in API endpoints
// Check database migration 022 has been applied
// Verify RLS policies allow admin audit logging
```

### 6. Development and Build Issues

#### Issue: Build Failures

**Symptoms:**
- `npm run build` fails with admin-related errors
- TypeScript compilation errors
- Missing dependencies

**Solutions:**

**1. Check build order**
```bash
# Build dependencies first
npm run build --filter=@nextsaas/supabase
npm run build --filter=@nextsaas/auth
npm run build --filter=@nextsaas/admin
```

**2. Resolve TypeScript errors**
```typescript
// Check for missing type imports
import type { AdminUser, DashboardMetrics } from '@nextsaas/admin'

// Verify all exports are properly typed
export type { AdminUser } from './types'
```

**3. Clean and rebuild**
```bash
# Clean all build artifacts
npm run clean

# Clear node_modules if needed
rm -rf node_modules
npm install

# Rebuild everything
npm run build
```

## Advanced Troubleshooting

### Debug Mode

Enable comprehensive debugging:

```env
# .env.local
DEBUG=nextsaas:admin*
NEXT_PUBLIC_DEBUG_ADMIN=true
NODE_ENV=development
```

### Database Debugging

Monitor database activity:

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Monitor real-time queries
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state = 'active';
```

### Network Debugging

Check API calls:

```javascript
// Monitor fetch requests
const originalFetch = window.fetch
window.fetch = (...args) => {
  console.log('Admin API call:', args[0])
  return originalFetch(...args)
}
```

### Performance Profiling

Use browser dev tools:

1. **Network Tab**: Monitor API response times
2. **Performance Tab**: Profile React component rendering
3. **Memory Tab**: Check for memory leaks
4. **Console**: Review error messages and warnings

## Production Issues

### Monitoring Setup

Set up monitoring for production:

```bash
# Install monitoring tools
npm install @sentry/nextjs @vercel/analytics

# Configure error tracking
# Set up uptime monitoring
# Enable performance metrics
```

### Log Analysis

Review production logs:

```bash
# Check application logs
tail -f /var/log/nextjs/admin.log

# Monitor error rates
grep "ERROR" /var/log/nextjs/*.log | wc -l

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

### Security Monitoring

Monitor for security issues:

```sql
-- Check failed admin login attempts
SELECT * FROM audit_logs 
WHERE action_name = 'admin_login_failed' 
AND created_at > NOW() - INTERVAL '24 hours';

-- Monitor unusual admin activity
SELECT admin_id, COUNT(*) as action_count
FROM audit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY admin_id 
HAVING COUNT(*) > 100;
```

## Getting Help

### Escalation Process

If issues persist:

1. **Check Documentation**: Review all admin documentation
2. **Search Issues**: Look for similar problems in project issues
3. **Create Reproduction**: Provide minimal reproduction case
4. **Gather Information**: Include logs, error messages, and environment details
5. **Submit Issue**: Use the project issue template

### Information to Include

When reporting issues, include:

- **Environment**: Development/staging/production
- **Browser**: Version and type
- **Node.js**: Version
- **Database**: PostgreSQL version and Supabase details
- **Error Messages**: Complete error messages and stack traces
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens

### Emergency Contacts

For critical production issues:

- **System Administrator**: Your organization's admin
- **Database Administrator**: For database-related issues
- **Security Team**: For security incidents
- **Development Team**: For code-related problems

## Prevention

### Regular Maintenance

Prevent issues with regular maintenance:

- **Weekly**: Review audit logs and security alerts
- **Monthly**: Update dependencies and check performance
- **Quarterly**: Review admin permissions and access
- **Annually**: Security audit and penetration testing

### Monitoring Checklist

Set up monitoring for:

- [ ] Admin login failures
- [ ] API response times
- [ ] Database query performance
- [ ] System resource usage
- [ ] Security alerts
- [ ] Error rates
- [ ] User activity patterns

---

**💡 Pro Tip**: Keep this troubleshooting guide bookmarked and refer to it whenever issues arise. Most admin problems have straightforward solutions when you know where to look.