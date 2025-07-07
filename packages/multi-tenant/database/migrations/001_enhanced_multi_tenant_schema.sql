-- Enhanced Multi-Tenant Schema for NextSaaS
-- This migration adds workspace hierarchy, enhanced permissions, and audit logging

-- Add workspace tables
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  color text,
  settings jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(organization_id, slug)
);

-- Add workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  permissions text[] DEFAULT '{}',
  joined_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  UNIQUE(workspace_id, user_id)
);

-- Enhance projects table to link to workspaces
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add custom roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  level text NOT NULL CHECK (level IN ('organization', 'workspace', 'project')),
  permissions jsonb NOT NULL DEFAULT '[]',
  inherits_from text[] DEFAULT '{}',
  is_system boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Add member permissions override table
CREATE TABLE IF NOT EXISTS member_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id uuid NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted boolean DEFAULT true,
  conditions jsonb,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE(membership_id, permission)
);

-- Add audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL,
  actor_type text NOT NULL DEFAULT 'user',
  actor_name text,
  actor_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  resource_name text,
  changes jsonb,
  result text NOT NULL DEFAULT 'success' CHECK (result IN ('success', 'failure', 'partial')),
  error_message text,
  ip_address inet,
  user_agent text,
  location jsonb,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add organization billing table
CREATE TABLE IF NOT EXISTS organization_billing (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id text UNIQUE,
  payment_method_id text,
  billing_email text,
  billing_name text,
  billing_address jsonb,
  tax_id text,
  tax_exempt boolean DEFAULT false,
  currency text DEFAULT 'usd',
  payment_status text DEFAULT 'active',
  next_billing_date timestamptz,
  cancellation_date timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add usage quotas table
CREATE TABLE IF NOT EXISTS usage_quotas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  limit_value bigint NOT NULL,
  current_value bigint DEFAULT 0,
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly', 'lifetime')),
  reset_at timestamptz,
  overage_allowed boolean DEFAULT false,
  overage_rate numeric(10,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, resource_type)
);

-- Add API keys table for organization-level API access
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions text[] DEFAULT '{}',
  expires_at timestamptz,
  last_used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_archived ON workspaces(is_archived);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);

CREATE INDEX IF NOT EXISTS idx_custom_roles_organization_id ON custom_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_member_permissions_membership_id ON member_permissions(membership_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_organization_billing_organization_id ON organization_billing(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_billing_stripe_customer_id ON organization_billing(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_usage_quotas_organization_id ON usage_quotas(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys(organization_id);

-- Enable RLS on new tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;