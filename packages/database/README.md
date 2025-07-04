# NextSaaS Database Package

A comprehensive, type-safe database solution for NextSaaS applications with multi-tenant architecture, Row Level Security (RLS), and database provider abstraction.

## 🎯 Features

- **Multi-Tenant Architecture**: Organization-based data isolation with RLS
- **Type-Safe Operations**: Full TypeScript support with auto-generated types
- **Database Abstraction**: Support for multiple providers (Supabase, Firebase planned)
- **Migration System**: Version-controlled schema evolution
- **Real-time Subscriptions**: Live data updates (Supabase)
- **Audit Logging**: Comprehensive activity tracking
- **Flexible Schema**: Extensible design for any use case
- **Security First**: Row Level Security policies enforced at database level

## 📁 Package Structure

```
packages/database/
├── schema/              # SQL schema definitions
│   ├── core/           # Core tables (users, organizations)
│   ├── auth/           # Authentication tables
│   ├── billing/        # Subscription & billing tables
│   ├── content/        # Flexible content system
│   ├── system/         # System tables (audit, notifications)
│   ├── policies/       # Row Level Security policies
│   └── functions/      # Database functions & triggers
├── migrations/          # Database migrations
├── seeds/              # Seed data for different environments
├── src/
│   ├── abstractions/   # Database provider interfaces
│   ├── repositories/   # Data access patterns
│   ├── types/          # TypeScript type definitions
│   ├── validation/     # Zod schemas
│   └── tools/          # CLI tools for migrations & seeding
└── prisma/             # Prisma schema (legacy support)
```

## 🚀 Quick Start

### Installation

```bash
npm install @nextsaas/database
```

### Initialize Database Client

```typescript
import { initializeDatabase } from '@nextsaas/database';

// Initialize with Supabase
const db = initializeDatabase({
  provider: 'supabase',
  config: {
    connectionString: process.env.SUPABASE_URL + '::' + process.env.SUPABASE_ANON_KEY
  }
});

await db.connect();
```

### Basic Usage

```typescript
import { getDatabase } from '@nextsaas/database';

const db = getDatabase();

// Find users
const users = await db.users.find({
  where: { email_verified_at: { not: null } },
  orderBy: [{ column: 'created_at', direction: 'desc' }],
  limit: 10
});

// Create organization with owner
const org = await db.organizations.createWithOwner({
  name: 'My Company',
  slug: 'my-company'
}, userId);

// Get organization members
const members = await db.organizations.getMembers(orgId);
```

## 🗄️ Database Schema

### Core Tables

#### Users
- Multi-tenant user management
- Profile information with timezone/locale support
- Soft delete capability
- Audit trail

#### Organizations
- Tenant isolation boundary
- Subscription management
- Custom settings and metadata
- Domain mapping support

#### Memberships
- User-Organization relationships
- Role-based access (owner, admin, member)
- Custom permissions
- Invitation workflow

### Authentication

- **Sessions**: Active user sessions with device tracking
- **OAuth Accounts**: Third-party authentication providers
- **Password Resets**: Secure token-based password recovery
- **Email Verifications**: Email verification workflow

### Billing & Subscriptions

- **Plans**: Tiered pricing with features and limits
- **Subscriptions**: Stripe-integrated subscription management
- **Invoices**: Complete invoice history
- **Payments**: Payment tracking with refund support
- **Usage Tracking**: Feature usage metering

### Content System

- **Projects**: Flexible workspaces/containers
- **Items**: Generic content items (tasks, documents, etc.)
- **Categories**: Hierarchical categorization
- **Attachments**: File attachment management
- **Custom Fields**: Dynamic field system

### System Tables

- **Audit Logs**: Complete data change history
- **Activities**: User activity feed
- **Notifications**: In-app notification system
- **Feature Flags**: Gradual feature rollout
- **API Keys**: Programmatic access management

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Organization-based data isolation
- Role-based access control
- User-specific data access
- Audit trail integrity

Example RLS policy:
```sql
-- Users can only view data in their organizations
CREATE POLICY "Organization members can view projects" ON projects
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );
```

### Security Features

- Automatic audit logging via triggers
- Encrypted sensitive data fields
- API key hashing
- Session management
- Rate limiting support

## 🛠️ Database Operations

### Repositories

Pre-built repository classes for common operations:

```typescript
// User Repository
const user = await db.users.findByEmail('user@example.com');
await db.users.updateLastSeen(userId);
await db.users.verifyEmail(userId);

// Organization Repository
const org = await db.organizations.findBySlug('my-company');
await db.organizations.updateMemberRole(orgId, userId, 'admin');
const stats = await db.organizations.getStats(orgId);
```

### Validation

Zod schemas for runtime validation:

```typescript
import { createUserSchema, validateData } from '@nextsaas/database';

const userData = validateData(createUserSchema, {
  email: 'user@example.com',
  name: 'John Doe',
  timezone: 'America/New_York'
});
```

### Real-time Subscriptions

```typescript
// Subscribe to organization updates
const subscription = db.getProvider().subscribe(
  'organizations',
  (payload) => {
    console.log('Organization updated:', payload.record);
  },
  { 
    event: 'UPDATE',
    filter: `id=eq.${orgId}`
  }
);

// Unsubscribe
subscription.unsubscribe();
```

## 🔧 Database Tools

### Migrations

```bash
# Run pending migrations
npm run db:migrate up

# Rollback last migration
npm run db:migrate down

# Check migration status
npm run db:migrate status
```

### Seeding

```bash
# Seed development data
npm run db:seed run

# Reset and seed
npm run db:seed reset

# Generate sample data
npm run db:seed generate
```

### Type Generation

```bash
# Generate TypeScript types from schema
npm run db:generate
```

## 📊 Performance Optimization

### Indexes

Strategic indexes on:
- Foreign keys for joins
- Commonly queried fields
- Soft delete filters
- Date range queries

### Query Optimization

- Efficient pagination with cursor-based navigation
- Selective field queries
- Connection pooling
- Query result caching

## 🧪 Testing

```typescript
import { createDatabase } from '@nextsaas/database';
import { beforeEach, describe, it, expect } from 'vitest';

describe('Database Tests', () => {
  let db;

  beforeEach(async () => {
    db = createDatabase({
      provider: 'supabase',
      config: { connectionString: process.env.TEST_DATABASE_URL }
    });
  });

  it('should enforce organization isolation', async () => {
    // Test RLS policies
  });
});
```

## 🔄 Migration Guide

### From Prisma

The package maintains Prisma compatibility while transitioning to native SQL:

```typescript
// Old Prisma code
import { db } from '@nextsaas/database';
const user = await db.user.findUnique({ where: { email } });

// New repository pattern
import { getDatabase } from '@nextsaas/database';
const db = getDatabase();
const user = await db.users.findByEmail(email);
```

### Schema Evolution

1. Create migration file in `migrations/`
2. Write forward migration (`.sql`)
3. Write rollback migration (`.down.sql`)
4. Run migration with `npm run db:migrate up`

## 🚨 Troubleshooting

### Common Issues

1. **Connection errors**: Check environment variables
2. **RLS violations**: Ensure proper authentication context
3. **Migration failures**: Check for dependency order
4. **Type mismatches**: Regenerate types after schema changes

### Debug Mode

```typescript
// Enable query logging
const db = initializeDatabase({
  provider: 'supabase',
  config: {
    connectionString: process.env.SUPABASE_URL,
    debug: true
  }
});
```

## 📚 Best Practices

1. **Always use RLS**: Never bypass Row Level Security
2. **Audit everything**: Critical operations should be logged
3. **Validate inputs**: Use Zod schemas for data validation
4. **Handle errors**: Implement proper error boundaries
5. **Monitor performance**: Track slow queries
6. **Plan migrations**: Test migrations in staging first
7. **Backup regularly**: Implement automated backups

## 🤝 Contributing

See the main NextSaaS contributing guide for development setup and guidelines.

## 📄 License

MIT - see LICENSE file for details