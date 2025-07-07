-- NextSaaS Complete Database Setup
-- Generated on: 2025-07-07T03:08:04.646Z
-- 
-- Instructions:
-- 1. Go to your Supabase SQL Editor
-- 2. Create a new query
-- 3. Paste this entire file
-- 4. Click "Run"
--
-- This will create all tables, functions, triggers, and security policies


-- ============================================
-- CORE SCHEMA
-- ============================================

-- ------------------------------------
-- 001_users.sql
-- ------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  name VARCHAR(255),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add comments
COMMENT ON TABLE users IS 'Core user table for authentication and user management';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.email IS 'User email address, must be unique';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';
COMMENT ON COLUMN users.name IS 'Display name of the user';
COMMENT ON COLUMN users.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN users.timezone IS 'User preferred timezone';
COMMENT ON COLUMN users.locale IS 'User preferred locale/language';
COMMENT ON COLUMN users.metadata IS 'Additional user metadata in JSON format';
COMMENT ON COLUMN users.last_seen_at IS 'Last time user was active';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';

-- ------------------------------------
-- 002_organizations.sql
-- ------------------------------------

-- Organizations (Tenant Isolation)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  subscription_status VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_domain ON organizations(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_organizations_created_by ON organizations(created_by);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE organizations IS 'Organizations provide multi-tenant isolation';
COMMENT ON COLUMN organizations.id IS 'Unique identifier for the organization';
COMMENT ON COLUMN organizations.name IS 'Display name of the organization';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN organizations.domain IS 'Custom domain for the organization';
COMMENT ON COLUMN organizations.logo_url IS 'URL to organization logo';
COMMENT ON COLUMN organizations.settings IS 'Organization-specific settings';
COMMENT ON COLUMN organizations.metadata IS 'Additional organization metadata';
COMMENT ON COLUMN organizations.subscription_status IS 'Current subscription status (trial, active, cancelled, etc.)';
COMMENT ON COLUMN organizations.trial_ends_at IS 'When the trial period ends';
COMMENT ON COLUMN organizations.created_by IS 'User who created the organization';

-- ------------------------------------
-- 003_memberships.sql
-- ------------------------------------

-- User-Organization Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '[]',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Create indexes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_memberships_role ON memberships(role);
CREATE INDEX idx_memberships_invited_by ON memberships(invited_by);

-- Add comments
COMMENT ON TABLE memberships IS 'Links users to organizations with roles and permissions';
COMMENT ON COLUMN memberships.id IS 'Unique identifier for the membership';
COMMENT ON COLUMN memberships.user_id IS 'User who is a member';
COMMENT ON COLUMN memberships.organization_id IS 'Organization the user belongs to';
COMMENT ON COLUMN memberships.role IS 'Role within the organization (owner, admin, member, etc.)';
COMMENT ON COLUMN memberships.permissions IS 'Additional custom permissions';
COMMENT ON COLUMN memberships.invited_by IS 'User who invited this member';
COMMENT ON COLUMN memberships.invited_at IS 'When the invitation was sent';
COMMENT ON COLUMN memberships.accepted_at IS 'When the invitation was accepted';

-- ------------------------------------
-- 004_organizations_additions.sql
-- ------------------------------------

-- Additional columns for organizations table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add website column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'website') THEN
    ALTER TABLE organizations ADD COLUMN website VARCHAR(255);
    COMMENT ON COLUMN organizations.website IS 'Organization website URL';
  END IF;

  -- Add description column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'organizations' AND column_name = 'description') THEN
    ALTER TABLE organizations ADD COLUMN description TEXT;
    COMMENT ON COLUMN organizations.description IS 'Organization description or about text';
  END IF;
END $$;

-- ------------------------------------
-- 005_users_profile_additions.sql
-- ------------------------------------

-- Additional profile columns for users table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add first_name column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    COMMENT ON COLUMN users.first_name IS 'User first name';
  END IF;

  -- Add last_name column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    COMMENT ON COLUMN users.last_name IS 'User last name';
  END IF;

  -- Add bio column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
    COMMENT ON COLUMN users.bio IS 'User biography or about text';
  END IF;

  -- Add phone column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    COMMENT ON COLUMN users.phone IS 'User phone number';
  END IF;

  -- Add website column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'website') THEN
    ALTER TABLE users ADD COLUMN website VARCHAR(255);
    COMMENT ON COLUMN users.website IS 'User personal website URL';
  END IF;

  -- Add current_organization_id column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'current_organization_id') THEN
    ALTER TABLE users ADD COLUMN current_organization_id UUID REFERENCES organizations(id);
    COMMENT ON COLUMN users.current_organization_id IS 'Currently selected organization for multi-tenant context';
  END IF;
END $$;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_users_current_organization_id ON users(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);

-- ------------------------------------
-- 006_memberships_additions.sql
-- ------------------------------------

-- Additional columns for memberships table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'status') THEN
    ALTER TABLE memberships ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended'));
    COMMENT ON COLUMN memberships.status IS 'Membership status (active, invited, suspended)';
  END IF;

  -- Add joined_at column if not exists (rename accepted_at for clarity)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'memberships' AND column_name = 'joined_at') THEN
    ALTER TABLE memberships ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN memberships.joined_at IS 'When the user officially joined the organization';
  END IF;
END $$;

-- Add index for status
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_user_organization_status ON memberships(user_id, organization_id, status);


-- ============================================
-- AUTH SCHEMA
-- ============================================

-- ------------------------------------
-- 001_sessions.sql
-- ------------------------------------

-- User Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Add comments
COMMENT ON TABLE sessions IS 'Active user sessions for authentication';
COMMENT ON COLUMN sessions.id IS 'Unique session identifier';
COMMENT ON COLUMN sessions.user_id IS 'User who owns this session';
COMMENT ON COLUMN sessions.token IS 'Unique session token';
COMMENT ON COLUMN sessions.ip_address IS 'IP address of the session';
COMMENT ON COLUMN sessions.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN sessions.device_info IS 'Additional device information';
COMMENT ON COLUMN sessions.expires_at IS 'When this session expires';

-- ------------------------------------
-- 002_oauth_accounts.sql
-- ------------------------------------

-- OAuth Provider Accounts
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(50),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(provider, provider_account_id)
);

-- Create indexes
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);

-- Add comments
COMMENT ON TABLE oauth_accounts IS 'OAuth provider accounts linked to users';
COMMENT ON COLUMN oauth_accounts.provider IS 'OAuth provider name (google, github, etc.)';
COMMENT ON COLUMN oauth_accounts.provider_account_id IS 'Account ID from the OAuth provider';
COMMENT ON COLUMN oauth_accounts.access_token IS 'OAuth access token (encrypted)';
COMMENT ON COLUMN oauth_accounts.refresh_token IS 'OAuth refresh token (encrypted)';
COMMENT ON COLUMN oauth_accounts.expires_at IS 'When the access token expires';

-- ------------------------------------
-- 003_password_resets.sql
-- ------------------------------------

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- Add comments
COMMENT ON TABLE password_resets IS 'Password reset tokens for secure password recovery';
COMMENT ON COLUMN password_resets.token IS 'Unique reset token';
COMMENT ON COLUMN password_resets.expires_at IS 'When this token expires';
COMMENT ON COLUMN password_resets.used_at IS 'When this token was used';

-- ------------------------------------
-- 004_email_verifications.sql
-- ------------------------------------

-- Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Add comments
COMMENT ON TABLE email_verifications IS 'Email verification tokens';
COMMENT ON COLUMN email_verifications.email IS 'Email address to verify';
COMMENT ON COLUMN email_verifications.token IS 'Unique verification token';
COMMENT ON COLUMN email_verifications.expires_at IS 'When this token expires';
COMMENT ON COLUMN email_verifications.verified_at IS 'When the email was verified';

-- ------------------------------------
-- 005_organization_invitations.sql
-- ------------------------------------

-- Organization Invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member')),
  token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES users(id),
  accepted_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_expires_at ON organization_invitations(expires_at);

-- Add comments
COMMENT ON TABLE organization_invitations IS 'Pending invitations to join organizations';
COMMENT ON COLUMN organization_invitations.id IS 'Unique invitation identifier';
COMMENT ON COLUMN organization_invitations.organization_id IS 'Organization being invited to';
COMMENT ON COLUMN organization_invitations.email IS 'Email address of invitee';
COMMENT ON COLUMN organization_invitations.role IS 'Role to be assigned upon acceptance';
COMMENT ON COLUMN organization_invitations.token IS 'Unique token for accepting invitation';
COMMENT ON COLUMN organization_invitations.message IS 'Optional personal message from inviter';
COMMENT ON COLUMN organization_invitations.status IS 'Current status of invitation';
COMMENT ON COLUMN organization_invitations.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN organization_invitations.accepted_by IS 'User who accepted the invitation';
COMMENT ON COLUMN organization_invitations.expires_at IS 'When this invitation expires';
COMMENT ON COLUMN organization_invitations.accepted_at IS 'When this invitation was accepted';

-- ------------------------------------
-- 006_auth_events.sql
-- ------------------------------------

-- Authentication Events for Security Tracking
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_created ON auth_events(user_id, created_at);

-- Add comments
COMMENT ON TABLE auth_events IS 'Authentication and security events for audit trail';
COMMENT ON COLUMN auth_events.id IS 'Unique event identifier';
COMMENT ON COLUMN auth_events.user_id IS 'User associated with the event (nullable for failed attempts)';
COMMENT ON COLUMN auth_events.event_type IS 'Type of authentication event (login, logout, failed_login, password_reset, etc)';
COMMENT ON COLUMN auth_events.ip_address IS 'IP address where event originated';
COMMENT ON COLUMN auth_events.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN auth_events.metadata IS 'Additional event-specific data';
COMMENT ON COLUMN auth_events.created_at IS 'When the event occurred';

-- ------------------------------------
-- 007_sessions_additions.sql
-- ------------------------------------

-- Additional columns for sessions table
-- These are added conditionally to avoid errors if they already exist

DO $$ 
BEGIN
  -- Add browser column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'browser') THEN
    ALTER TABLE sessions ADD COLUMN browser VARCHAR(255);
    COMMENT ON COLUMN sessions.browser IS 'Parsed browser name from user agent';
  END IF;

  -- Add os column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'os') THEN
    ALTER TABLE sessions ADD COLUMN os VARCHAR(255);
    COMMENT ON COLUMN sessions.os IS 'Parsed operating system from user agent';
  END IF;

  -- Add location column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'location') THEN
    ALTER TABLE sessions ADD COLUMN location VARCHAR(255);
    COMMENT ON COLUMN sessions.location IS 'Approximate location based on IP geolocation';
  END IF;

  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'status') THEN
    ALTER TABLE sessions ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    COMMENT ON COLUMN sessions.status IS 'Session status (active, revoked, expired)';
  END IF;

  -- Add last_active_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'last_active_at') THEN
    ALTER TABLE sessions ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    COMMENT ON COLUMN sessions.last_active_at IS 'Last time this session was used';
  END IF;

  -- Add revoked_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'sessions' AND column_name = 'revoked_at') THEN
    ALTER TABLE sessions ADD COLUMN revoked_at TIMESTAMP WITH TIME ZONE;
    COMMENT ON COLUMN sessions.revoked_at IS 'When this session was manually revoked';
  END IF;
END $$;

-- Add additional indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active_at ON sessions(last_active_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON sessions(user_id, status);


-- ============================================
-- BILLING SCHEMA
-- ============================================

-- ------------------------------------
-- 001_plans.sql
-- ------------------------------------

-- Subscription Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly INTEGER, -- in cents
  price_yearly INTEGER,  -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  stripe_product_id VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_sort_order ON plans(sort_order);

-- Add comments
COMMENT ON TABLE plans IS 'Available subscription plans';
COMMENT ON COLUMN plans.name IS 'Display name of the plan';
COMMENT ON COLUMN plans.slug IS 'URL-friendly identifier';
COMMENT ON COLUMN plans.price_monthly IS 'Monthly price in cents';
COMMENT ON COLUMN plans.price_yearly IS 'Yearly price in cents';
COMMENT ON COLUMN plans.features IS 'Array of feature descriptions';
COMMENT ON COLUMN plans.limits IS 'JSON object with usage limits';
COMMENT ON COLUMN plans.is_default IS 'Whether this is the default plan for new users';

-- ------------------------------------
-- 002_subscriptions.sql
-- ------------------------------------

-- Organization Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Add comments
COMMENT ON TABLE subscriptions IS 'Organization subscription records';
COMMENT ON COLUMN subscriptions.organization_id IS 'Organization that owns this subscription';
COMMENT ON COLUMN subscriptions.plan_id IS 'Current subscription plan';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status (active, cancelled, past_due, etc.)';
COMMENT ON COLUMN subscriptions.billing_cycle IS 'Monthly or yearly billing';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at period end';

-- ------------------------------------
-- 003_invoices.sql
-- ------------------------------------

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  invoice_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  amount_total INTEGER NOT NULL, -- in cents
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  line_items JSONB DEFAULT '[]',
  billing_details JSONB DEFAULT '{}',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Add comments
COMMENT ON TABLE invoices IS 'Invoice records for billing';
COMMENT ON COLUMN invoices.amount_total IS 'Total invoice amount in cents';
COMMENT ON COLUMN invoices.status IS 'Invoice status (draft, open, paid, void, uncollectible)';
COMMENT ON COLUMN invoices.line_items IS 'Array of invoice line items';
COMMENT ON COLUMN invoices.billing_details IS 'Customer billing information';

-- ------------------------------------
-- 004_payments.sql
-- ------------------------------------

-- Payment History
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_method_details JSONB DEFAULT '{}',
  failure_reason TEXT,
  refunded_amount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Add comments
COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON COLUMN payments.amount IS 'Payment amount in cents';
COMMENT ON COLUMN payments.status IS 'Payment status (pending, succeeded, failed, refunded)';
COMMENT ON COLUMN payments.payment_method IS 'Payment method type (card, bank_transfer, etc.)';
COMMENT ON COLUMN payments.refunded_amount IS 'Amount refunded in cents';

-- ------------------------------------
-- 005_usage_tracking.sql
-- ------------------------------------

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, feature, period_start)
);

-- Create indexes
CREATE INDEX idx_usage_tracking_organization_id ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_feature ON usage_tracking(feature);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- Add comments
COMMENT ON TABLE usage_tracking IS 'Track feature usage for billing and limits';
COMMENT ON COLUMN usage_tracking.feature IS 'Feature identifier (api_calls, storage_gb, etc.)';
COMMENT ON COLUMN usage_tracking.usage_count IS 'Current usage count';
COMMENT ON COLUMN usage_tracking.usage_limit IS 'Usage limit for this period';
COMMENT ON COLUMN usage_tracking.period_start IS 'Start of the billing period';
COMMENT ON COLUMN usage_tracking.period_end IS 'End of the billing period';


-- ============================================
-- CONTENT SCHEMA
-- ============================================

-- ------------------------------------
-- 001_projects.sql
-- ------------------------------------

-- Generic Projects/Workspaces
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100),
  description TEXT,
  type VARCHAR(100) DEFAULT 'general', -- real_estate, crypto, ecommerce, etc.
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(organization_id, slug)
);

-- Create indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE projects IS 'Generic projects/workspaces for organizing content';
COMMENT ON COLUMN projects.type IS 'Project type for industry-specific features';
COMMENT ON COLUMN projects.slug IS 'URL-friendly identifier within organization';
COMMENT ON COLUMN projects.settings IS 'Project-specific settings';
COMMENT ON COLUMN projects.is_archived IS 'Whether project is archived';

-- ------------------------------------
-- 002_items.sql
-- ------------------------------------

-- Flexible Content Items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- property, crypto_position, product, task, etc.
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  description TEXT,
  content TEXT, -- Rich text content
  data JSONB DEFAULT '{}', -- Flexible data storage
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0, -- For ordering
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(organization_id, project_id, slug)
);

-- Create indexes
CREATE INDEX idx_items_organization_id ON items(organization_id);
CREATE INDEX idx_items_project_id ON items(project_id);
CREATE INDEX idx_items_parent_id ON items(parent_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_assigned_to ON items(assigned_to);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_data ON items USING GIN(data);

-- Add comments
COMMENT ON TABLE items IS 'Flexible content items that can represent any entity type';
COMMENT ON COLUMN items.type IS 'Item type (property, product, task, etc.)';
COMMENT ON COLUMN items.parent_id IS 'Parent item for hierarchical structures';
COMMENT ON COLUMN items.data IS 'Flexible JSON data based on item type';
COMMENT ON COLUMN items.position IS 'Order position within parent or project';
COMMENT ON COLUMN items.tags IS 'Array of tags for categorization';

-- ------------------------------------
-- 003_categories.sql
-- ------------------------------------

-- Categories for Content Organization
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color
  metadata JSONB DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, parent_id, slug)
);

-- Create indexes
CREATE INDEX idx_categories_organization_id ON categories(organization_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Item-Category relationship
CREATE TABLE IF NOT EXISTS item_categories (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (item_id, category_id)
);

-- Create indexes
CREATE INDEX idx_item_categories_item_id ON item_categories(item_id);
CREATE INDEX idx_item_categories_category_id ON item_categories(category_id);

-- Add comments
COMMENT ON TABLE categories IS 'Hierarchical categories for organizing content';
COMMENT ON COLUMN categories.parent_id IS 'Parent category for nested structures';
COMMENT ON TABLE item_categories IS 'Many-to-many relationship between items and categories';

-- ------------------------------------
-- 004_attachments.sql
-- ------------------------------------

-- File Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- item, project, user, etc.
  entity_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  storage_provider VARCHAR(50) DEFAULT 'supabase', -- supabase, s3, etc.
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attachments_organization_id ON attachments(organization_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Add comments
COMMENT ON TABLE attachments IS 'File attachments for various entities';
COMMENT ON COLUMN attachments.entity_type IS 'Type of entity this attachment belongs to';
COMMENT ON COLUMN attachments.entity_id IS 'ID of the entity this attachment belongs to';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN attachments.storage_provider IS 'Storage provider where file is stored';

-- ------------------------------------
-- 005_custom_fields.sql
-- ------------------------------------

-- Dynamic Custom Fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL, -- items, projects, users, etc.
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- text, number, date, select, multiselect, boolean, json
  field_options JSONB DEFAULT '{}', -- For select/multiselect options
  validation_rules JSONB DEFAULT '{}', -- Validation constraints
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  help_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, entity_type, field_name)
);

-- Create indexes
CREATE INDEX idx_custom_fields_organization_id ON custom_fields(organization_id);
CREATE INDEX idx_custom_fields_entity_type ON custom_fields(entity_type);
CREATE INDEX idx_custom_fields_sort_order ON custom_fields(sort_order);

-- Custom Field Values
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_id UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(custom_field_id, entity_id)
);

-- Create indexes
CREATE INDEX idx_custom_field_values_custom_field_id ON custom_field_values(custom_field_id);
CREATE INDEX idx_custom_field_values_entity_id ON custom_field_values(entity_id);
CREATE INDEX idx_custom_field_values_value ON custom_field_values USING GIN(value);

-- Add comments
COMMENT ON TABLE custom_fields IS 'Dynamic custom fields for extending entity schemas';
COMMENT ON COLUMN custom_fields.entity_type IS 'Type of entity this field applies to';
COMMENT ON COLUMN custom_fields.field_type IS 'Data type of the custom field';
COMMENT ON COLUMN custom_fields.field_options IS 'Options for select fields';
COMMENT ON COLUMN custom_fields.validation_rules IS 'JSON schema for field validation';
COMMENT ON TABLE custom_field_values IS 'Values for custom fields';


-- ============================================
-- SYSTEM SCHEMA
-- ============================================

-- ------------------------------------
-- 001_audit_logs.sql
-- ------------------------------------

-- Comprehensive Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, ACCESS
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  request_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition by month for better performance
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all data changes';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.old_data IS 'Data before the change (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_data IS 'Data after the change (for INSERT/UPDATE)';
COMMENT ON COLUMN audit_logs.changed_fields IS 'Array of field names that changed';

-- ------------------------------------
-- 002_activities.sql
-- ------------------------------------

-- Activity Feed
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- created_item, updated_project, invited_user, etc.
  entity_type VARCHAR(100),
  entity_id UUID,
  entity_title VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_project_id ON activities(project_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_action ON activities(action);

-- Add comments
COMMENT ON TABLE activities IS 'User activity feed for organization';
COMMENT ON COLUMN activities.action IS 'Type of action performed';
COMMENT ON COLUMN activities.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN activities.entity_id IS 'ID of entity affected';
COMMENT ON COLUMN activities.is_public IS 'Whether activity is visible to all org members';

-- ------------------------------------
-- 003_notifications.sql
-- ------------------------------------

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- mention, assignment, invitation, billing, system
  title VARCHAR(255) NOT NULL,
  message TEXT,
  action_url TEXT,
  action_label VARCHAR(100),
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Add comments
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN notifications.priority IS 'Notification priority level';

-- ------------------------------------
-- 004_feature_flags.sql
-- ------------------------------------

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  conditions JSONB DEFAULT '{}', -- Complex targeting conditions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization-specific feature overrides
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feature_flag_id, organization_id)
);

-- Create indexes
CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flag_overrides_feature_flag_id ON feature_flag_overrides(feature_flag_id);
CREATE INDEX idx_feature_flag_overrides_organization_id ON feature_flag_overrides(organization_id);

-- Add comments
COMMENT ON TABLE feature_flags IS 'Global feature flags for gradual rollouts';
COMMENT ON COLUMN feature_flags.rollout_percentage IS 'Percentage of users to enable feature for';
COMMENT ON COLUMN feature_flags.conditions IS 'Complex targeting conditions (user segments, etc.)';
COMMENT ON TABLE feature_flag_overrides IS 'Organization-specific feature flag overrides';

-- ------------------------------------
-- 005_system_settings.sql
-- ------------------------------------

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  type VARCHAR(50) NOT NULL, -- string, number, boolean, json
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(category, key)
);

-- Create indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(10) NOT NULL, -- First few chars for identification
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000, -- Requests per hour
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX idx_api_keys_revoked_at ON api_keys(revoked_at) WHERE revoked_at IS NULL;

-- Add comments
COMMENT ON TABLE system_settings IS 'Global system configuration settings';
COMMENT ON COLUMN system_settings.is_encrypted IS 'Whether value is encrypted';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access';
COMMENT ON COLUMN api_keys.key_hash IS 'Hashed API key for security';
COMMENT ON COLUMN api_keys.key_prefix IS 'Visible prefix for key identification';

-- ------------------------------------
-- 006_organization_events.sql
-- ------------------------------------

-- Organization Events for audit and activity tracking
CREATE TABLE IF NOT EXISTS organization_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_events_organization_id ON organization_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_events_user_id ON organization_events(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_events_event_type ON organization_events(event_type);
CREATE INDEX IF NOT EXISTS idx_organization_events_created_at ON organization_events(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_events_org_created ON organization_events(organization_id, created_at);

-- Add comments
COMMENT ON TABLE organization_events IS 'Track important events within organizations';
COMMENT ON COLUMN organization_events.id IS 'Unique event identifier';
COMMENT ON COLUMN organization_events.organization_id IS 'Organization where event occurred';
COMMENT ON COLUMN organization_events.user_id IS 'User who triggered the event (nullable for system events)';
COMMENT ON COLUMN organization_events.event_type IS 'Type of event (member_added, member_removed, settings_updated, etc)';
COMMENT ON COLUMN organization_events.metadata IS 'Event-specific data and context';
COMMENT ON COLUMN organization_events.created_at IS 'When the event occurred';


-- ============================================
-- FUNCTIONS SCHEMA
-- ============================================

-- ------------------------------------
-- 001_updated_at_trigger.sql
-- ------------------------------------

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON oauth_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at BEFORE UPDATE ON custom_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flag_overrides_updated_at BEFORE UPDATE ON feature_flag_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------
-- 002_audit_trigger.sql
-- ------------------------------------

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  old_data JSONB;
  new_data JSONB;
BEGIN
  -- Determine the action and set data accordingly
  IF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Calculate changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data) o
    FULL OUTER JOIN jsonb_each(new_data) n USING (key)
    WHERE o.value IS DISTINCT FROM n.value;
  ELSIF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Insert audit log entry
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    ip_address,
    user_agent,
    session_id,
    request_id
  ) VALUES (
    COALESCE(
      CASE 
        WHEN TG_TABLE_NAME IN ('organizations', 'memberships', 'projects', 'items', 'categories', 'attachments', 'custom_fields') THEN
          COALESCE((NEW.organization_id)::UUID, (OLD.organization_id)::UUID)
        ELSE NULL
      END,
      NULL
    ),
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE((NEW.id)::UUID, (OLD.id)::UUID),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    current_setting('request.ip', true)::inet,
    current_setting('request.user_agent', true),
    current_setting('request.session_id', true)::uuid,
    current_setting('request.request_id', true)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_items AFTER INSERT OR UPDATE OR DELETE ON items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_custom_fields AFTER INSERT OR UPDATE OR DELETE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_api_keys AFTER INSERT OR UPDATE OR DELETE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ------------------------------------
-- 003_activity_trigger.sql
-- ------------------------------------

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity(
  p_action VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_entity_title VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
  org_id UUID;
  proj_id UUID;
BEGIN
  -- Determine organization and project based on entity type
  IF p_entity_type = 'organization' THEN
    org_id := p_entity_id;
  ELSIF p_entity_type = 'project' THEN
    SELECT organization_id, id INTO org_id, proj_id
    FROM projects WHERE id = p_entity_id;
  ELSIF p_entity_type = 'item' THEN
    SELECT i.organization_id, i.project_id INTO org_id, proj_id
    FROM items i WHERE i.id = p_entity_id;
  END IF;

  -- Insert activity
  INSERT INTO activities (
    organization_id,
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
    entity_title,
    description,
    metadata
  ) VALUES (
    org_id,
    proj_id,
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_title,
    p_description,
    p_metadata
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic activity creation
CREATE OR REPLACE FUNCTION auto_create_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type VARCHAR;
  entity_title VARCHAR;
BEGIN
  -- Determine action type
  action_type := CASE TG_OP
    WHEN 'INSERT' THEN 'created'
    WHEN 'UPDATE' THEN 'updated'
    WHEN 'DELETE' THEN 'deleted'
  END || '_' || TG_TABLE_NAME;

  -- Get entity title based on table
  entity_title := CASE TG_TABLE_NAME
    WHEN 'projects' THEN COALESCE(NEW.name, OLD.name)
    WHEN 'items' THEN COALESCE(NEW.title, OLD.title)
    WHEN 'organizations' THEN COALESCE(NEW.name, OLD.name)
    ELSE NULL
  END;

  -- Create activity
  PERFORM create_activity(
    action_type,
    TG_TABLE_NAME::text,
    COALESCE(NEW.id, OLD.id),
    entity_title
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity triggers
CREATE TRIGGER activity_projects AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

CREATE TRIGGER activity_items AFTER INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION auto_create_activity();

-- ------------------------------------
-- 004_utility_functions.sql
-- ------------------------------------

-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          input_text,
          '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
        ),
        '\s+', '-', 'g'  -- Replace spaces with hyphens
      ),
      '-+', '-', 'g'  -- Replace multiple hyphens with single
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug(
  base_slug TEXT,
  table_name TEXT,
  org_id UUID DEFAULT NULL,
  exclude_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Check if slug exists
    EXECUTE format(
      'SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 %s %s)',
      table_name,
      CASE WHEN org_id IS NOT NULL THEN 'AND organization_id = $2' ELSE '' END,
      CASE WHEN exclude_id IS NOT NULL THEN 'AND id != $3' ELSE '' END
    ) INTO slug_exists USING final_slug, org_id, exclude_id;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate subscription days remaining
CREATE OR REPLACE FUNCTION subscription_days_remaining(sub_id UUID)
RETURNS INTEGER AS $$
DECLARE
  end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT current_period_end INTO end_date
  FROM subscriptions
  WHERE id = sub_id;
  
  IF end_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN GREATEST(0, EXTRACT(DAY FROM end_date - NOW())::INTEGER);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check feature limit
CREATE OR REPLACE FUNCTION check_feature_limit(
  org_id UUID,
  feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get current usage and limit
  SELECT u.usage_count, u.usage_limit
  INTO current_usage, usage_limit
  FROM usage_tracking u
  WHERE u.organization_id = org_id
  AND u.feature = feature_name
  AND u.period_start <= NOW()
  AND u.period_end > NOW();
  
  -- If no limit set, allow
  IF usage_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if under limit
  RETURN current_usage < usage_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  org_id UUID,
  feature_name TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Update usage count
  UPDATE usage_tracking
  SET usage_count = usage_count + increment_by,
      updated_at = NOW()
  WHERE organization_id = org_id
  AND feature = feature_name
  AND period_start <= NOW()
  AND period_end > NOW()
  RETURNING usage_count INTO new_count;
  
  -- If no row updated, create new usage record
  IF new_count IS NULL THEN
    INSERT INTO usage_tracking (
      organization_id,
      feature,
      usage_count,
      period_start,
      period_end
    ) VALUES (
      org_id,
      feature_name,
      increment_by,
      date_trunc('month', NOW()),
      date_trunc('month', NOW() + INTERVAL '1 month')
    ) RETURNING usage_count INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete records
CREATE OR REPLACE FUNCTION soft_delete(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    table_name
  ) USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to restore soft deleted records
CREATE OR REPLACE FUNCTION restore_deleted(
  table_name TEXT,
  record_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  ) USING record_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- POLICIES SCHEMA
-- ============================================

-- ------------------------------------
-- 001_enable_rls.sql
-- ------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- ------------------------------------
-- 002_auth_policies.sql
-- ------------------------------------

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION auth.check_org_membership(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
    AND memberships.user_id = user_id
    AND accepted_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check organization role
CREATE OR REPLACE FUNCTION auth.check_org_role(org_id UUID, user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM memberships
  WHERE organization_id = org_id 
  AND memberships.user_id = user_id
  AND accepted_at IS NOT NULL;
  
  -- Role hierarchy: owner > admin > member
  RETURN CASE
    WHEN required_role = 'member' THEN user_role IN ('member', 'admin', 'owner')
    WHEN required_role = 'admin' THEN user_role IN ('admin', 'owner')
    WHEN required_role = 'owner' THEN user_role = 'owner'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read profiles of organization members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.organization_id = m2.organization_id
      WHERE m1.user_id = auth.uid()
      AND m2.user_id = users.id
      AND m1.accepted_at IS NOT NULL
      AND m2.accepted_at IS NOT NULL
    )
  );

-- Sessions policies
CREATE POLICY "Users can manage their own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- OAuth accounts policies
CREATE POLICY "Users can manage their own OAuth accounts" ON oauth_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Password reset policies
CREATE POLICY "Users can request password resets for their account" ON password_resets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own password resets" ON password_resets
  FOR SELECT USING (auth.uid() = user_id);

-- Email verification policies
CREATE POLICY "Users can manage their own email verifications" ON email_verifications
  FOR ALL USING (auth.uid() = user_id);

-- ------------------------------------
-- 003_organization_policies.sql
-- ------------------------------------

-- Organizations policies
CREATE POLICY "Users can read organizations they belong to" ON organizations
  FOR SELECT USING (
    auth.check_org_membership(id, auth.uid())
  );

CREATE POLICY "Organization owners can update their organization" ON organizations
  FOR UPDATE USING (
    auth.check_org_role(id, auth.uid(), 'owner')
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Organization owners can soft delete their organization" ON organizations
  FOR UPDATE USING (
    auth.check_org_role(id, auth.uid(), 'owner')
    AND deleted_at IS NULL
  );

-- Memberships policies
CREATE POLICY "Users can view memberships in their organizations" ON memberships
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Organization admins can create memberships" ON memberships
  FOR INSERT WITH CHECK (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "Organization admins can update memberships" ON memberships
  FOR UPDATE USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
    OR (user_id = auth.uid() AND accepted_at IS NULL) -- Users can accept their own invitations
  );

CREATE POLICY "Organization owners can delete memberships" ON memberships
  FOR DELETE USING (
    auth.check_org_role(organization_id, auth.uid(), 'owner')
    OR (user_id = auth.uid() AND role != 'owner') -- Users can remove themselves unless they're the owner
  );

-- ------------------------------------
-- 004_billing_policies.sql
-- ------------------------------------

-- Plans policies (public read for pricing pages)
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage plans" ON plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- Subscriptions policies
CREATE POLICY "Organization members can view their subscription" ON subscriptions
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization owners can manage subscriptions" ON subscriptions
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'owner')
  );

-- Invoices policies
CREATE POLICY "Organization members can view invoices" ON invoices
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "System can create invoices" ON invoices
  FOR INSERT WITH CHECK (true); -- Handled by service account

-- Payments policies
CREATE POLICY "Organization admins can view payments" ON payments
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (true); -- Handled by service account

-- Usage tracking policies
CREATE POLICY "Organization members can view usage" ON usage_tracking
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "System can manage usage tracking" ON usage_tracking
  FOR ALL USING (true); -- Handled by service account

-- ------------------------------------
-- 005_content_policies.sql
-- ------------------------------------

-- Projects policies
CREATE POLICY "Organization members can view projects" ON projects
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "Organization members can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Project creators and admins can update projects" ON projects
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

CREATE POLICY "Project creators and admins can delete projects" ON projects
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

-- Items policies
CREATE POLICY "Organization members can view items" ON items
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "Organization members can create items" ON items
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Item creators and assignees can update items" ON items
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR assigned_to = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

CREATE POLICY "Item creators and admins can delete items" ON items
  FOR UPDATE USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (created_by = auth.uid() OR auth.check_org_role(organization_id, auth.uid(), 'admin'))
    AND deleted_at IS NULL
  );

-- Categories policies
CREATE POLICY "Organization members can view categories" ON categories
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization admins can manage categories" ON categories
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

-- Item categories policies
CREATE POLICY "Organization members can view item categories" ON item_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_id
      AND auth.check_org_membership(items.organization_id, auth.uid())
    )
  );

CREATE POLICY "Item creators can manage item categories" ON item_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_id
      AND auth.check_org_membership(items.organization_id, auth.uid())
      AND (items.created_by = auth.uid() OR auth.check_org_role(items.organization_id, auth.uid(), 'admin'))
    )
  );

-- Attachments policies
CREATE POLICY "Organization members can view attachments" ON attachments
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization members can create attachments" ON attachments
  FOR INSERT WITH CHECK (
    auth.check_org_membership(organization_id, auth.uid())
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Attachment uploaders can delete their attachments" ON attachments
  FOR DELETE USING (
    uploaded_by = auth.uid()
  );

-- Custom fields policies
CREATE POLICY "Organization members can view custom fields" ON custom_fields
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Organization admins can manage custom fields" ON custom_fields
  FOR ALL USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

-- Custom field values policies
CREATE POLICY "Organization members can view custom field values" ON custom_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_fields
      WHERE custom_fields.id = custom_field_id
      AND auth.check_org_membership(custom_fields.organization_id, auth.uid())
    )
  );

CREATE POLICY "Users with entity access can manage custom field values" ON custom_field_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM custom_fields
      WHERE custom_fields.id = custom_field_id
      AND auth.check_org_membership(custom_fields.organization_id, auth.uid())
    )
  );

-- ------------------------------------
-- 006_system_policies.sql
-- ------------------------------------

-- Audit logs policies
CREATE POLICY "Organization members can view their org audit logs" ON audit_logs
  FOR SELECT USING (
    organization_id IS NOT NULL 
    AND auth.check_org_membership(organization_id, auth.uid())
  );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Handled by triggers

-- Activities policies
CREATE POLICY "Organization members can view activities" ON activities
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
    AND (is_public = true OR user_id = auth.uid())
  );

CREATE POLICY "System can create activities" ON activities
  FOR INSERT WITH CHECK (true); -- Handled by application

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Handled by application

-- Feature flags policies
CREATE POLICY "Anyone can view enabled feature flags" ON feature_flags
  FOR SELECT USING (
    enabled = true
  );

CREATE POLICY "System admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- Feature flag overrides policies
CREATE POLICY "Organization admins can view their feature overrides" ON feature_flag_overrides
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "System admins can manage feature flag overrides" ON feature_flag_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings
      WHERE category = 'admin_users'
      AND key = 'user_ids'
      AND value ? auth.uid()::text
    )
  );

-- System settings policies
CREATE POLICY "Anyone can view public system settings" ON system_settings
  FOR SELECT USING (
    is_public = true
  );

CREATE POLICY "System admins can view all system settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM system_settings ss
      WHERE ss.category = 'admin_users'
      AND ss.key = 'user_ids'
      AND ss.value ? auth.uid()::text
    )
  );

CREATE POLICY "System admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM system_settings ss
      WHERE ss.category = 'admin_users'
      AND ss.key = 'user_ids'
      AND ss.value ? auth.uid()::text
    )
  );

-- API keys policies
CREATE POLICY "Organization admins can view API keys" ON api_keys
  FOR SELECT USING (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
  );

CREATE POLICY "Organization admins can create API keys" ON api_keys
  FOR INSERT WITH CHECK (
    auth.check_org_role(organization_id, auth.uid(), 'admin')
    AND created_by = auth.uid()
  );

CREATE POLICY "API key creators can revoke their keys" ON api_keys
  FOR UPDATE USING (
    created_by = auth.uid()
    AND revoked_at IS NULL
  );

-- ------------------------------------
-- 007_auth_additions_policies.sql
-- ------------------------------------

-- RLS Policies for new authentication tables

-- Enable RLS on new tables (if not already enabled)
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;

-- Organization Invitations Policies
-- Drop existing policies if they exist to avoid conflicts
DO $$ BEGIN
  DROP POLICY IF EXISTS "Organization admins can view invitations" ON organization_invitations;
  DROP POLICY IF EXISTS "Organization admins can create invitations" ON organization_invitations;
  DROP POLICY IF EXISTS "Anyone with token can view invitation" ON organization_invitations;
  DROP POLICY IF EXISTS "Organization admins can update invitations" ON organization_invitations;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Organization admins can view their org invitations
CREATE POLICY "Organization admins can view invitations" ON organization_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- Organization admins can create invitations
CREATE POLICY "Organization admins can create invitations" ON organization_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
    AND invited_by = auth.uid()
  );

-- Anyone with valid token can view invitation (for acceptance flow)
CREATE POLICY "Anyone with token can view invitation" ON organization_invitations
  FOR SELECT USING (true); -- Token validation happens in application layer

-- Organization admins can update their invitations (cancel, etc)
CREATE POLICY "Organization admins can update invitations" ON organization_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_invitations.organization_id
      AND memberships.user_id = auth.uid()
      AND memberships.role IN ('owner', 'admin')
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- Auth Events Policies
-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own auth events" ON auth_events;
  DROP POLICY IF EXISTS "System can insert auth events" ON auth_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Users can only view their own auth events
CREATE POLICY "Users can view own auth events" ON auth_events
  FOR SELECT USING (user_id = auth.uid());

-- System can insert auth events (controlled by application)
CREATE POLICY "System can insert auth events" ON auth_events
  FOR INSERT WITH CHECK (true); -- Application handles validation

-- Organization Events Policies
-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Organization members can view events" ON organization_events;
  DROP POLICY IF EXISTS "System can insert organization events" ON organization_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Organization members can view their org events
CREATE POLICY "Organization members can view events" ON organization_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.organization_id = organization_events.organization_id
      AND memberships.user_id = auth.uid()
      AND (memberships.status IS NULL OR memberships.status = 'active')
    )
  );

-- System can insert organization events (controlled by application)
CREATE POLICY "System can insert organization events" ON organization_events
  FOR INSERT WITH CHECK (true); -- Application handles validation


-- ============================================
-- FINAL SETUP
-- ============================================

-- Grant necessary permissions for the application
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS public._migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mark this setup as complete
INSERT INTO _migrations (name) VALUES ('complete_database_setup');

-- Success!
-- Your NextSaaS database is now ready to use! 🎉
