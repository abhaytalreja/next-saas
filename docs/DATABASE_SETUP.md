# Database Setup Guide

This guide will walk you through setting up the database for your NextSaaS application. Follow these steps every time you clone the repository or set up a new instance.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A Supabase account (free tier works great for development)

## 🚀 Quick Setup (5 minutes)

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Fill in the project details:
   - **Name**: Your project name (e.g., "nextsaas-dev")
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to you
   - **Pricing Plan**: Free tier is perfect for development

4. Wait for the project to be created (takes about 2 minutes)

### 2. Get Your Database Credentials

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public key** (a long string starting with `eyJ...`)
   - **Service role key** (⚠️ Keep this secret! Only for server-side)

3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-key...

# Direct database connection (for migrations)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 4. Install Dependencies

```bash
# From the root of the project
npm install
```

### 5. Run Database Setup Script

We've created a one-command setup that will:
- Create all tables
- Set up Row Level Security
- Configure triggers and functions
- Seed initial data

```bash
# Run the complete database setup
npm run db:setup
```

This command will:
1. ✅ Create all database tables
2. ✅ Set up Row Level Security policies
3. ✅ Create triggers and functions
4. ✅ Insert seed data for development
5. ✅ Set up the initial admin user

## 🛠️ Manual Setup (Alternative)

If you prefer to run the setup manually or need more control:

### 1. Run Migrations

```bash
cd packages/database
npm run db:migrate up
```

### 2. Seed the Database

```bash
# Development data
npm run db:seed run development

# Or reset and seed
npm run db:seed reset
```

### 3. Verify Setup

Go to your Supabase dashboard:
1. Navigate to **Table Editor**
2. You should see all tables:
   - Core: `users`, `organizations`, `memberships`
   - Auth: `sessions`, `oauth_accounts`, `password_resets`, `email_verifications`
   - Billing: `plans`, `subscriptions`, `invoices`, `payments`, `usage_tracking`
   - Content: `projects`, `items`, `categories`, `attachments`, `custom_fields`
   - System: `audit_logs`, `activities`, `notifications`, `feature_flags`, `api_keys`

## 🔐 Enable Row Level Security

**Important**: RLS should be automatically enabled by the migrations, but verify:

1. Go to **Authentication** → **Policies** in Supabase
2. Check that all tables show "RLS enabled" ✅
3. You should see policies for each table

## 👤 Create Your First User

### Option 1: Using Supabase Auth (Recommended)

1. Go to **Authentication** → **Users** in Supabase
2. Click "Invite user"
3. Enter your email
4. Check your email for the confirmation link

### Option 2: Using the Application

1. Start the development server:
```bash
npm run dev
```

2. Navigate to http://localhost:3002/register
3. Create your account
4. Check the `users` table in Supabase to see your user

## 🏢 Create Your First Organization

After creating a user:

```sql
-- Run this in the Supabase SQL editor
-- Replace the user_id with your actual user ID from the users table

INSERT INTO organizations (name, slug, created_by) 
VALUES ('My Company', 'my-company', 'your-user-id-here');

-- Add yourself as the owner
INSERT INTO memberships (user_id, organization_id, role, accepted_at)
VALUES (
  'your-user-id-here',
  (SELECT id FROM organizations WHERE slug = 'my-company'),
  'owner',
  NOW()
);
```

## 🧪 Test Your Setup

Run this SQL query in the Supabase SQL editor to verify everything is working:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check your user and organization
SELECT 
  u.email,
  u.name,
  o.name as org_name,
  m.role
FROM users u
JOIN memberships m ON m.user_id = u.id
JOIN organizations o ON o.id = m.organization_id
WHERE u.email = 'your-email@example.com';
```

## 🚨 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Make sure RLS is enabled on all tables
   - Check that you're using the correct API keys
   - Verify your user has the proper role in the organization

2. **"Relation does not exist" errors**
   - Run migrations: `npm run db:migrate up`
   - Check you're connected to the right database

3. **Can't see data in the application**
   - Verify RLS policies are correct
   - Make sure you're authenticated
   - Check that your user is a member of an organization

### Reset Everything

If you need to start fresh:

```bash
# ⚠️ This will delete ALL data
cd packages/database
npm run db:seed reset
```

## 📚 Next Steps

1. **Explore the Admin Panel**: Visit `/admin` in your application
2. **Check the API**: Test endpoints at `/api/health`
3. **Review Security**: Check RLS policies in Supabase dashboard
4. **Set up Backups**: Enable point-in-time recovery in Supabase

## 🔄 Keeping Your Database Updated

When pulling new changes from the repository:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Run any new migrations
cd packages/database
npm run db:migrate up
```

## 📝 Development Tips

1. **Use the Supabase Dashboard**: Great for exploring data and testing queries
2. **Enable Realtime**: Go to Database → Replication to enable realtime for tables
3. **SQL Editor**: Use the SQL editor in Supabase for quick queries
4. **Logs**: Check Database → Logs for query performance

## 🚀 Production Deployment

For production:

1. Create a separate Supabase project for production
2. Use different API keys and connection strings
3. Enable additional security features:
   - SSL enforcement
   - Connection pooling
   - Daily backups
4. Set up monitoring and alerts

---

## Quick Reference

```bash
# One-command setup
npm run db:setup

# Individual commands
npm run db:migrate up        # Run migrations
npm run db:seed run          # Seed data
npm run db:seed reset        # Reset and seed
npm run db:migrate status    # Check migration status
npm run db:generate          # Generate TypeScript types
```

Need help? Check the [troubleshooting guide](./TROUBLESHOOTING.md) or open an issue on GitHub.