-- Migration: 001_initial_schema
-- Description: Initial database schema for NextSaaS
-- Created: 2024-01-01

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core schema
\i ../schema/core/001_users.sql
\i ../schema/core/002_organizations.sql
\i ../schema/core/003_memberships.sql

-- Auth schema
\i ../schema/auth/001_sessions.sql
\i ../schema/auth/002_oauth_accounts.sql
\i ../schema/auth/003_password_resets.sql
\i ../schema/auth/004_email_verifications.sql

-- Billing schema
\i ../schema/billing/001_plans.sql
\i ../schema/billing/002_subscriptions.sql
\i ../schema/billing/003_invoices.sql
\i ../schema/billing/004_payments.sql
\i ../schema/billing/005_usage_tracking.sql

-- Content schema
\i ../schema/content/001_projects.sql
\i ../schema/content/002_items.sql
\i ../schema/content/003_categories.sql
\i ../schema/content/004_attachments.sql
\i ../schema/content/005_custom_fields.sql

-- System schema
\i ../schema/system/001_audit_logs.sql
\i ../schema/system/002_activities.sql
\i ../schema/system/003_notifications.sql
\i ../schema/system/004_feature_flags.sql
\i ../schema/system/005_system_settings.sql

-- Functions and triggers
\i ../schema/functions/001_updated_at_trigger.sql
\i ../schema/functions/002_audit_trigger.sql
\i ../schema/functions/003_activity_trigger.sql
\i ../schema/functions/004_utility_functions.sql

-- Row Level Security policies
\i ../schema/policies/001_enable_rls.sql
\i ../schema/policies/002_auth_policies.sql
\i ../schema/policies/003_organization_policies.sql
\i ../schema/policies/004_billing_policies.sql
\i ../schema/policies/005_content_policies.sql
\i ../schema/policies/006_system_policies.sql