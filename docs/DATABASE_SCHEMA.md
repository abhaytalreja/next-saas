# 🗄️ Database Schema Documentation

This document provides a comprehensive overview of the NextSaaS database schema across all three organization modes: `none`, `single`, and `multi`.

## 📋 Table of Contents

- [Organization Modes Overview](#organization-modes-overview)
- [Core Tables](#core-tables)
- [Mode-Specific Tables](#mode-specific-tables)
- [Indexes](#indexes)
- [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
- [Functions and Triggers](#functions-and-triggers)
- [Schema Diagrams](#schema-diagrams)
- [Migration Guide](#migration-guide)

## 🏢 Organization Modes Overview

### Mode: `none` (User-Centric)
- **Use Case**: Personal tools, individual productivity apps
- **Billing**: Per user
- **Structure**: No organizations, all resources owned directly by users
- **Example**: Personal todo app, journal app

### Mode: `single` (One Workspace per User)
- **Use Case**: Small teams, freelancers, default mode
- **Billing**: Per organization
- **Structure**: Each user gets one organization automatically
- **Example**: Freelancer project management, small team collaboration

### Mode: `multi` (Full B2B SaaS)
- **Use Case**: Enterprise B2B applications
- **Billing**: Per organization with seat limits
- **Structure**: Users can belong to multiple organizations
- **Example**: Slack, Notion, GitHub

## 🔧 Core Tables

These tables exist in **ALL** organization modes:

### 1. `profiles`
Extends Supabase's `auth.users` with additional user data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | References auth.users(id) |
| `email` | text | User's email (unique) |
| `name` | text | Display name |
| `avatar_url` | text | Profile picture URL |
| `timezone` | text | User's timezone |
| `locale` | text | User's locale |
| `metadata` | jsonb | Additional user data |
| `last_seen_at` | timestamptz | Last activity timestamp |
| `created_at` | timestamptz | Account creation |
| `updated_at` | timestamptz | Last profile update |

### 2. `plans`
Subscription plans available in the system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Plan identifier |
| `name` | text | Plan name |
| `slug` | text | URL-friendly identifier (unique) |
| `description` | text | Plan description |
| `price_monthly` | integer | Monthly price in cents |
| `price_yearly` | integer | Yearly price in cents |
| `currency` | text | Currency code (default: USD) |
| `features` | jsonb | Array of feature descriptions (JSON array) |
| `limits` | jsonb | Usage limits (users, projects, etc.) |
| `stripe_price_id_monthly` | text | Stripe monthly price ID |
| `stripe_price_id_yearly` | text | Stripe yearly price ID |
| `is_active` | boolean | Whether plan is available |
| `is_default` | boolean | Default plan for new users |
| `sort_order` | integer | Display order |

### 3. `projects`
Main content containers (workspaces/projects).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Project identifier |
| `user_id`* | uuid | Owner user (mode: none) |
| `organization_id`* | uuid | Owner organization (modes: single, multi) |
| `name` | text | Project name |
| `slug` | text | URL-friendly identifier |
| `description` | text | Project description |
| `type` | text | Project type/category |
| `settings` | jsonb | Project-specific settings |
| `metadata` | jsonb | Additional data |
| `created_by` | uuid | User who created project |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

*Owner column depends on organization mode

### 4. `items`
Flexible content items within projects.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Item identifier |
| `user_id`* | uuid | Owner user (mode: none) |
| `organization_id`* | uuid | Owner organization (modes: single, multi) |
| `project_id` | uuid | Parent project |
| `parent_id` | uuid | Parent item (for nesting) |
| `type` | text | Item type (task, document, etc.) |
| `title` | text | Item title |
| `slug` | text | URL-friendly identifier |
| `description` | text | Short description |
| `content` | text | Main content |
| `data` | jsonb | Type-specific data |
| `status` | text | Current status |
| `tags` | text[] | Array of tags |
| `assigned_to` | uuid | Assigned user |
| `due_date` | timestamptz | Due date |
| `created_by` | uuid | Creator user |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### 5. `subscriptions`
Active subscriptions tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Subscription identifier |
| `user_id`* | uuid | Subscriber user (mode: none) |
| `organization_id`* | uuid | Subscriber organization (modes: single, multi) |
| `plan_id` | uuid | Active plan |
| `stripe_subscription_id` | text | Stripe subscription ID |
| `stripe_customer_id` | text | Stripe customer ID |
| `status` | text | Subscription status |
| `current_period_start` | timestamptz | Current billing period start |
| `current_period_end` | timestamptz | Current billing period end |
| `cancel_at` | timestamptz | Scheduled cancellation |
| `canceled_at` | timestamptz | Cancellation timestamp |
| `trial_start` | timestamptz | Trial period start |
| `trial_end` | timestamptz | Trial period end |
| `metadata` | jsonb | Additional data |

### 6. `usage_tracking`
Track usage against plan limits.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Record identifier |
| `user_id`* | uuid | User (mode: none) |
| `organization_id`* | uuid | Organization (modes: single, multi) |
| `metric_name` | text | Metric being tracked |
| `usage_value` | bigint | Current usage |
| `usage_limit` | bigint | Plan limit |
| `period_start` | timestamptz | Billing period start |
| `period_end` | timestamptz | Billing period end |

## 🏗️ Mode-Specific Tables

### Organizations Tables (modes: `single`, `multi`)

#### `organizations`
Organization/workspace entities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Organization identifier |
| `name` | text | Organization name |
| `slug` | text | URL-friendly identifier (unique) |
| `domain` | text | Custom domain (unique) |
| `logo_url` | text | Organization logo |
| `settings` | jsonb | Organization settings |
| `subscription_status` | text | Current subscription status |
| `subscription_id` | text | Active subscription |
| `plan_id` | uuid | Current plan |
| `trial_ends_at` | timestamptz | Trial expiration |
| `subscription_ends_at` | timestamptz | Subscription expiration |
| `created_by` | uuid | Founding user |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

#### `organization_members`
User membership in organizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Membership identifier |
| `organization_id` | uuid | Organization reference |
| `user_id` | uuid | User reference |
| `role` | text | Member role (owner, admin, member) |
| `joined_at` | timestamptz | Join timestamp |

#### `organization_invitations`
Pending invitations to organizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Invitation identifier |
| `organization_id` | uuid | Target organization |
| `email` | text | Invitee email |
| `role` | text | Invited role (admin, member) |
| `token` | text | Unique invitation token |
| `invited_by` | uuid | Inviting user |
| `expires_at` | timestamptz | Invitation expiration |
| `accepted_at` | timestamptz | Acceptance timestamp |
| `created_at` | timestamptz | Creation timestamp |

## 📊 Indexes

### Common Indexes (All Modes)

```sql
-- Profile indexes
idx_profiles_email (email)
idx_profiles_updated_at (updated_at)

-- Project indexes  
idx_projects_[user_id/organization_id] ([user_id/organization_id])
idx_items_project_id (project_id)
idx_items_type (type)
idx_items_status (status)
```

### Organization Mode Indexes

```sql
-- Organization indexes
idx_organizations_slug (slug)
idx_organizations_subscription_status (subscription_status)

-- Membership indexes
idx_organization_members_user_id (user_id)
idx_organization_members_organization_id (organization_id)

-- Invitation indexes
idx_organization_invitations_email (email)
idx_organization_invitations_token (token)
```

## 🔒 Row Level Security (RLS) Policies

### Mode: `none` (User-Centric)

#### Profile Policies
- **SELECT**: Users can view their own profile
- **UPDATE**: Users can update their own profile

#### Project Policies
- **SELECT**: Users can view their own projects
- **INSERT**: Users can create projects (owner = self)
- **UPDATE**: Users can update their own projects
- **DELETE**: Users can delete their own projects

#### Item Policies
- **ALL**: Users have full access to items in their projects

#### Subscription Policies
- **SELECT**: Users can view their own subscription

### Mode: `single` & `multi` (Organization-Based)

#### Organization Policies
- **SELECT**: Members can view their organizations
- **INSERT**: Any user can create organizations
- **UPDATE**: Owners/admins can update organizations

#### Member Policies
- **SELECT**: Members can view membership of their organizations

#### Project Policies
- **SELECT**: Organization members can view projects
- **INSERT**: Organization members can create projects
- **UPDATE**: Organization members can update projects
- **DELETE**: Owners/admins can delete projects

#### Item Policies
- **ALL**: Organization members have full access to items

#### Subscription Policies
- **SELECT**: Organization members can view subscription

## ⚙️ Functions and Triggers

### Common Functions

#### `update_updated_at()`
Updates the `updated_at` timestamp on row modifications.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Applied to tables: profiles, projects, items, plans, subscriptions, organizations

### Mode-Specific Functions

#### `create_default_organization()` (mode: `single` only)
Automatically creates an organization when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id uuid;
  org_slug text;
BEGIN
  -- Generate unique slug from user name/email
  -- Create organization
  -- Add user as owner
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Trigger: `create_default_org_for_user` on `auth.users` INSERT

## 📈 Schema Diagrams

### Mode: `none` (User-Centric)
```
┌─────────────┐     ┌─────────────┐
│   auth.users │────│   profiles  │
└─────────────┘     └─────────────┘
       │                    
       │ owns               
       ↓                    
┌─────────────┐     ┌─────────────┐
│   projects  │────│    items    │
└─────────────┘     └─────────────┘
       │
       │ has
       ↓
┌─────────────┐
│subscriptions│
└─────────────┘
```

### Mode: `single` & `multi` (Organization-Based)
```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   auth.users │────│   profiles  │     │organizations │
└─────────────┘     └─────────────┘     └──────────────┘
       │                                        │
       │ belongs to                             │ owns
       ↓                                        ↓
┌─────────────────┐                    ┌─────────────┐
│ org_members     │────────────────────│   projects  │
└─────────────────┘                    └─────────────┘
                                              │
                                              │ contains
                                              ↓
                                       ┌─────────────┐
                                       │    items    │
                                       └─────────────┘
```

## 🔄 Migration Guide

### Migrating from `none` to `single`

1. Create organizations table and related tables
2. Create an organization for each user
3. Migrate project ownership from user_id to organization_id
4. Update RLS policies
5. Update application code to use organization context

### Migrating from `single` to `multi`

1. Update organization_members to support multiple memberships
2. Add organization switching UI
3. Update billing to handle multiple subscriptions per user
4. Consider data isolation requirements

### Best Practices

1. **Start with `single` mode** - It provides the best balance of simplicity and future flexibility
2. **Plan for growth** - Even if starting with `none`, structure your code to easily add organizations later
3. **Test RLS policies thoroughly** - Use Supabase's SQL editor to test as different users
4. **Monitor usage** - Set up alerts for approaching plan limits
5. **Regular backups** - Especially important during mode migrations

## 🚀 Quick Start Commands

```bash
# Generate schema for your chosen mode
npm run db:generate-sql -- --mode [none|single|multi]

# Apply to Supabase
# 1. Copy the generated SQL
# 2. Run in Supabase SQL editor
# 3. Set environment variable
NEXT_PUBLIC_ORGANIZATION_MODE=[your-mode]
```

## 📚 Related Documentation

- [Organization Modes Configuration](./ORGANIZATION_MODES.md)
- [Supabase Integration Guide](./SUPABASE_INTEGRATION.md)
- [Database Setup Guide](../README.md#database-setup)