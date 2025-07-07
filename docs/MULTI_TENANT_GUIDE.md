# Multi-Tenant Architecture Guide

## Overview

NextSaaS includes a powerful multi-tenant architecture that supports three organization modes:
- **None**: Simple user-centric apps (no organizations)
- **Single**: One workspace per user (B2C apps)
- **Multi**: Multiple organizations per user (B2B SaaS)

## Quick Start (5 Minutes)

When you clone NextSaaS, the multi-tenant architecture is **already included** in the generated database schema. Here's what you need to know:

### 1. Choose Your Organization Mode

In your `.env.local` file, set:

```env
# Options: 'none' | 'single' | 'multi'
NEXT_PUBLIC_ORGANIZATION_MODE=multi
```

### 2. Generate and Run Database Schema

```bash
# Generate SQL based on your chosen mode
npm run db:generate-sql

# This creates database-multi.sql (or database-single.sql / database-none.sql)
# Copy the generated SQL and run it in Supabase SQL Editor
```

**That's it!** Your database now has:
- ✅ All multi-tenant tables (organizations, workspaces, memberships)
- ✅ Row Level Security policies for data isolation
- ✅ Audit logging and activity tracking
- ✅ Billing isolation per organization
- ✅ Performance indexes

### 3. Use in Your App

```tsx
// app/layout.tsx
import { TenantProvider } from '@next-saas/multi-tenant'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TenantProvider organizationMode="multi">
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
```

## What Gets Created?

### Database Tables (Multi Mode)

When you run the generated SQL with `NEXT_PUBLIC_ORGANIZATION_MODE=multi`, these tables are created:

```
Core Multi-Tenant:
├── organizations          # Organization/company records
├── organization_members   # User-organization relationships
├── organization_invitations # Pending invitations
├── workspaces            # Sub-divisions within organizations
├── workspace_members     # Workspace-specific access
├── projects              # Projects within workspaces
└── items                 # Generic content items

Enhanced Features:
├── custom_roles          # Custom role definitions
├── member_permissions    # Permission overrides
├── audit_logs           # Complete audit trail
├── organization_billing  # Isolated billing per org
├── usage_quotas         # Resource limits
└── api_keys             # Organization API access
```

### Automatic Features

The multi-tenant package automatically provides:

1. **Data Isolation**: RLS policies ensure users only see their organization's data
2. **Permission System**: Role-based access control (Owner, Admin, Member, Viewer, Guest)
3. **Audit Logging**: All actions are automatically logged
4. **Organization Switching**: Built-in UI components
5. **Invitation System**: Email-based member invitations
6. **Billing Isolation**: Each organization has separate billing

## Performance & Efficiency

### How Organization Mode Affects Performance

#### None Mode (Fastest)
- **Pros**: Simplest queries, no joins needed
- **Cons**: No team features
- **Use when**: Building personal apps, tools, or simple B2C

#### Single Mode (Fast)
- **Pros**: Simple org structure, auto-created workspaces
- **Cons**: No org switching UI overhead
- **Use when**: B2C with workspace needs (like Notion personal)

#### Multi Mode (Optimized)
- **Pros**: Full B2B features, enterprise-ready
- **Cons**: More complex queries with joins
- **Use when**: Building team collaboration tools, B2B SaaS

### Performance Optimizations Built-in

```sql
-- All tenant-filtering columns are indexed
CREATE INDEX idx_org_id ON all_tables(organization_id);
CREATE INDEX idx_workspace_id ON workspace_tables(workspace_id);

-- Composite indexes for common queries
CREATE INDEX idx_members_lookup ON organization_members(user_id, organization_id);

-- Permission caching in the application layer
-- 5-minute cache TTL for permission checks
```

## Development Workflow

### Local Development

```bash
# 1. Set your organization mode
NEXT_PUBLIC_ORGANIZATION_MODE=multi

# 2. Generate fresh schema when needed
npm run db:generate-sql

# 3. Run the app
npm run dev
```

### Switching Organization Modes

If you need to change modes later:

```bash
# 1. Change in .env.local
NEXT_PUBLIC_ORGANIZATION_MODE=single  # was 'multi'

# 2. Regenerate schema
npm run db:generate-sql

# 3. WARNING: This requires database migration!
# Export data → Run new schema → Import data
```

## Common Patterns

### Check Current Organization

```tsx
import { useOrganization } from '@next-saas/multi-tenant'

function MyComponent() {
  const { currentOrganization, isLoading } = useOrganization()
  
  if (isLoading) return <Spinner />
  if (!currentOrganization) return <CreateOrgPrompt />
  
  return <h1>Welcome to {currentOrganization.name}</h1>
}
```

### Protect Admin Features

```tsx
import { useOrganizationPermissions } from '@next-saas/multi-tenant'

function AdminPanel() {
  const { isAdmin, canManageBilling } = useOrganizationPermissions()
  
  if (!isAdmin()) {
    return <AccessDenied />
  }
  
  return (
    <div>
      {canManageBilling() && <BillingSettings />}
    </div>
  )
}
```

### Organization-Scoped Queries

```tsx
// All queries are automatically scoped by RLS!
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  // No need for .eq('organization_id', ...) - RLS handles it!
```

## Deployment Considerations

### Environment Variables

```env
# Required for multi-tenant
NEXT_PUBLIC_ORGANIZATION_MODE=multi
NEXT_PUBLIC_APP_NAME="Your SaaS"
NEXT_PUBLIC_APP_URL="https://yourapp.com"

# Email invitations (optional)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourapp.com"
```

### Database Migrations

When deploying:

1. Run the generated SQL in your production Supabase
2. Enable Row Level Security on all tables
3. Verify RLS policies are active
4. Test with multiple test organizations

### Monitoring

Monitor these metrics:
- Organization creation rate
- Active organizations count
- Members per organization
- Permission check cache hit rate
- Audit log growth

## Troubleshooting

### "No organization found"
- Check if user has joined/created an organization
- Verify organization mode in env vars
- Check RLS policies are enabled

### "Permission denied" errors
- Verify user's role in the organization
- Check custom permissions
- Ensure RLS policies match your schema

### Slow queries
- Check indexes exist on organization_id
- Monitor permission cache effectiveness
- Consider read replicas for large deployments

## Migration Guide

### From None to Single/Multi Mode

1. Export existing user data
2. Generate new schema with organization support
3. Create default organizations for existing users
4. Migrate data with organization_id references
5. Update application code to use TenantProvider

### From Single to Multi Mode

1. Backup current data
2. Generate multi-mode schema
3. Convert existing workspaces to organizations
4. Update UI to show organization switcher
5. Test data isolation thoroughly

## Best Practices

1. **Always use the hooks** - Don't query organization tables directly
2. **Cache aggressively** - Permissions don't change often
3. **Audit everything** - Use the built-in audit logger
4. **Test isolation** - Regularly test cross-tenant data access
5. **Plan for scale** - Monitor query performance as you grow

## Next Steps

- See [Components Guide](./COMPONENTS.md) for UI components
- Read [Security Guide](./SECURITY.md) for RLS details
- Check [API Reference](./API_REFERENCE.md) for all hooks/functions