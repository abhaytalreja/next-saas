# NextSaaS Multi-Tenant Package

A comprehensive multi-tenant architecture package for NextSaaS with Row Level Security (RLS), workspace hierarchy, and enterprise-grade permissions.

## Features

- 🏢 **Organization Management** - Complete organization lifecycle management
- 👥 **Workspace Hierarchy** - Organizations > Workspaces > Projects structure
- 🔐 **Row Level Security** - Database-level data isolation using Supabase RLS
- 🛡️ **Role-Based Access Control** - Flexible permission system with custom roles
- 📝 **Audit Logging** - Comprehensive activity tracking for compliance
- 💳 **Billing Isolation** - Separate billing per organization
- 🚀 **Performance Optimized** - Caching, indexing, and efficient queries
- 🔄 **Real-time Updates** - Tenant-aware real-time subscriptions

## Installation

```bash
npm install @next-saas/multi-tenant
```

## Quick Start

### 1. Database Setup

Run the SQL migrations in your Supabase dashboard:

```sql
-- Run these files in order:
-- 1. packages/multi-tenant/database/migrations/001_enhanced_multi_tenant_schema.sql
-- 2. packages/multi-tenant/database/policies/001_workspace_policies.sql
-- 3. packages/multi-tenant/database/policies/002_enhanced_organization_policies.sql
-- 4. packages/multi-tenant/database/policies/003_audit_billing_policies.sql
-- 5. packages/multi-tenant/database/functions/001_organization_functions.sql
-- 6. packages/multi-tenant/database/functions/002_workspace_functions.sql
-- 7. packages/multi-tenant/database/triggers/001_audit_triggers.sql
```

### 2. Environment Configuration

Set your organization mode in `.env.local`:

```env
# Organization modes: 'none' | 'single' | 'multi'
NEXT_PUBLIC_ORGANIZATION_MODE=multi
```

### 3. Add the Provider

Wrap your app with the TenantProvider:

```tsx
// app/layout.tsx
import { TenantProvider } from '@next-saas/multi-tenant'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TenantProvider organizationMode="multi">
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
```

## Usage

### Organization Management

```tsx
import { useOrganization, OrganizationSwitcher } from '@next-saas/multi-tenant'

function MyApp() {
  const {
    currentOrganization,
    organizations,
    createOrganization,
    switchOrganization,
  } = useOrganization()

  return (
    <div>
      <OrganizationSwitcher />
      
      <h1>{currentOrganization?.name}</h1>
      
      <button onClick={() => createOrganization({ 
        name: 'New Org',
        slug: 'new-org' 
      })}>
        Create Organization
      </button>
    </div>
  )
}
```

### Permission Checking

```tsx
import { useOrganizationPermissions } from '@next-saas/multi-tenant'

function AdminPanel() {
  const permissions = useOrganizationPermissions()

  if (!permissions.isAdmin()) {
    return <div>Access Denied</div>
  }

  return (
    <div>
      {permissions.canManageBilling() && (
        <BillingSettings />
      )}
      
      {permissions.hasPermission('organization:view_audit_logs') && (
        <AuditLogs />
      )}
    </div>
  )
}
```

### Member Management

```tsx
import { MemberList, useOrganizationMembers } from '@next-saas/multi-tenant'

function TeamManagement() {
  const {
    inviteMember,
    removeMember,
    updateMemberRole,
  } = useOrganizationMembers()

  const handleInvite = async () => {
    await inviteMember({
      email: 'user@example.com',
      role: 'member',
      send_email: true,
    })
  }

  return (
    <div>
      <MemberList onInviteClick={handleInvite} />
    </div>
  )
}
```

### Workspace Management

```tsx
import { useWorkspace } from '@next-saas/multi-tenant'

function WorkspaceView() {
  const {
    currentWorkspace,
    workspaces,
    createWorkspace,
    switchWorkspace,
  } = useWorkspace()

  return (
    <div>
      <h2>{currentWorkspace?.name}</h2>
      
      <select 
        value={currentWorkspace?.id} 
        onChange={(e) => switchWorkspace(e.target.value)}
      >
        {workspaces.map(ws => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
    </div>
  )
}
```

## Organization Modes

### Multi Mode (B2B SaaS)
- Users can create and belong to multiple organizations
- Full organization management features
- Workspace hierarchy support
- Best for team collaboration apps

### Single Mode
- One organization per user (auto-created)
- Simplified UI without org switching
- Best for B2C apps with workspaces

### None Mode
- No organization concept
- Direct user-to-resource relationships
- Best for simple personal apps

## Permission System

### Built-in Roles

- **Owner** - Full access to all resources
- **Admin** - Administrative access (no org deletion)
- **Member** - Standard member access
- **Viewer** - Read-only access
- **Guest** - Limited guest access

### System Permissions

```typescript
// Organization permissions
'organization:view'
'organization:update'
'organization:delete'
'organization:manage_billing'
'organization:manage_members'
'organization:manage_roles'
'organization:view_audit_logs'

// Workspace permissions
'workspace:create'
'workspace:view'
'workspace:update'
'workspace:delete'
'workspace:manage_members'

// Project permissions
'project:create'
'project:view'
'project:update'
'project:delete'
```

### Custom Permissions

```tsx
// Grant custom permissions to a member
await updateMemberPermissions(userId, [
  'custom:feature_x',
  'custom:beta_access',
])

// Check custom permissions
if (hasPermission('custom:feature_x')) {
  // Show feature X
}
```

## Security Best Practices

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only access data from their organizations
- Workspace data is isolated by organization
- Audit logs track all data access

### Data Isolation

```sql
-- Example RLS policy
CREATE POLICY "Users can only see their org data" ON items
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );
```

### Audit Logging

All significant actions are logged:

```tsx
// Automatic audit logging for:
- Organization CRUD operations
- Member management
- Permission changes
- Authentication events
- Data exports/imports
- Billing changes
```

## Performance Considerations

### Caching

- User permissions are cached for 5 minutes
- Organization data is cached in context
- Cache is cleared on permission changes

### Indexes

Key indexes for performance:
- `organization_id` on all tenant tables
- `user_id` on membership tables
- `created_at` for time-based queries
- Composite indexes for common queries

### Query Optimization

- Use database functions for complex operations
- Batch operations when possible
- Leverage Supabase's connection pooling

## API Reference

### Hooks

- `useOrganization()` - Organization context and operations
- `useWorkspace()` - Workspace context and operations
- `useOrganizationPermissions()` - Permission helpers
- `useOrganizationMembers()` - Member management

### Components

- `<OrganizationSwitcher />` - Organization selection dropdown
- `<CreateOrganizationForm />` - New organization form
- `<MemberList />` - Member management interface
- `<TenantProvider />` - Root provider component

### Utilities

- `PermissionEngine` - Permission checking engine
- `AuditLogger` - Audit logging utility

## Testing

```tsx
import { renderWithTenant, createTestOrganization } from '@next-saas/multi-tenant/test-utils'

describe('Multi-tenant features', () => {
  it('should isolate data between organizations', async () => {
    const org1 = await createTestOrganization()
    const org2 = await createTestOrganization()
    
    // Test data isolation
  })
})
```

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. Run migration scripts
2. Update environment variables
3. Add TenantProvider
4. Update data queries to include org context
5. Test data isolation

## Troubleshooting

### Common Issues

**"No organization found"**
- Ensure user has been added to an organization
- Check if organization mode is set correctly

**"Permission denied"**
- Verify RLS policies are enabled
- Check user's role and permissions
- Ensure organization context is set

**Performance issues**
- Check database indexes
- Enable query logging
- Monitor cache hit rates

## License

MIT © NextSaaS