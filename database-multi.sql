-- NextSaaS Database Schema
-- Organization Mode: multi
-- Generated on: 2025-07-21T19:45:15.461Z


-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  first_name text,
  last_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  locale text DEFAULT 'en',
  metadata jsonb DEFAULT '{}',
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table for tracking user actions
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  entity_title text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Plans table (for subscription billing)
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_monthly integer NOT NULL,
  price_yearly integer NOT NULL,
  currency text DEFAULT 'USD',
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}',
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  sort_order integer DEFAULT 999,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure features column is jsonb (in case it was created as text[] before)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' 
    AND column_name = 'features' 
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE plans ALTER COLUMN features TYPE jsonb USING to_jsonb(features);
  END IF;
END $$;


-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text UNIQUE,
  logo_url text,
  settings jsonb DEFAULT '{}',
  subscription_status text DEFAULT 'trial',
  subscription_id text,
  plan_id uuid REFERENCES plans(id),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  subscription_ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Organization invitations
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid REFERENCES auth.users(id),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);


-- Projects/Workspaces
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  type text DEFAULT 'general',
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Items (flexible content)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES items(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  slug text,
  description text,
  content text,
  data jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  tags text[] DEFAULT '{}',
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id),
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  usage_value bigint NOT NULL DEFAULT 0,
  usage_limit bigint,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, metric_name, period_start)
);


-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_project_id ON items(project_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);


-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Plans policies (public read)
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = true);

-- Activities policies (users can view their own activities)
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create activities" ON activities;
CREATE POLICY "Users can create activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = id 
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners and admins can update their organization" ON organizations;
CREATE POLICY "Owners and admins can update their organization" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = id 
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization members policies
DROP POLICY IF EXISTS "Members can view their organization members" ON organization_members;
CREATE POLICY "Members can view their organization members" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id = auth.uid()
    )
  );

-- Projects policies (organization-owned)
DROP POLICY IF EXISTS "Members can view organization projects" ON projects;
CREATE POLICY "Members can view organization projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = projects.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can create projects" ON projects;
CREATE POLICY "Members can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = projects.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can update projects" ON projects;
CREATE POLICY "Members can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = projects.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Items policies (organization-owned)
DROP POLICY IF EXISTS "Members can view organization items" ON items;
CREATE POLICY "Members can view organization items" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = items.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can create items" ON items;
CREATE POLICY "Members can create items" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = items.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can update items" ON items;
CREATE POLICY "Members can update items" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = items.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Subscription policies (organization-owned)
DROP POLICY IF EXISTS "Members can view organization subscription" ON subscriptions;
CREATE POLICY "Members can view organization subscription" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = subscriptions.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Usage tracking policies (organization-owned)
DROP POLICY IF EXISTS "Members can view organization usage" ON usage_tracking;
CREATE POLICY "Members can view organization usage" ON usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = usage_tracking.organization_id 
      AND organization_members.user_id = auth.uid()
    )
  );

-- Activities policies (organization context)
DROP POLICY IF EXISTS "Members can view organization activities" ON activities;
CREATE POLICY "Members can view organization activities" ON activities
  FOR SELECT USING (
    -- Users can see their own activities
    auth.uid() = user_id
    OR
    -- Or activities in projects they have access to
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects 
      JOIN organization_members ON organization_members.organization_id = projects.organization_id
      WHERE projects.id = activities.project_id 
      AND organization_members.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can create activities in organization context" ON activities;
CREATE POLICY "Users can create activities in organization context" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-create organization for new users (single mode only)
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id uuid;
  org_slug text;
BEGIN
  -- Generate a unique slug
  org_slug := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), '[^a-z0-9]+', '-', 'g'));
  
  -- Ensure slug is unique
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 4);
  END LOOP;

  -- Create organization
  INSERT INTO organizations (name, slug, created_by)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', 'My Workspace'),
    org_slug,
    NEW.id
  )
  RETURNING id INTO org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default plans
INSERT INTO plans (name, slug, price_monthly, price_yearly, features, limits, is_default, sort_order)
VALUES 
  ('Starter', 'starter', 900, 9000, 
   '["3 team members", "5 projects", "10GB storage", "10,000 API calls/month", "Email support"]'::jsonb,
   '{"users": 3, "projects": 5, "storage_gb": 10, "api_calls": 10000}'::jsonb,
   true, 1),
  ('Pro', 'pro', 2900, 29000,
   '["10 team members", "50 projects", "100GB storage", "100,000 API calls/month", "Priority support", "Advanced analytics"]'::jsonb,
   '{"users": 10, "projects": 50, "storage_gb": 100, "api_calls": 100000}'::jsonb,
   false, 2),
  ('Enterprise', 'enterprise', 0, 0,
   '["Unlimited team members", "Unlimited projects", "Unlimited storage", "Unlimited API calls", "Dedicated support", "Custom domain"]'::jsonb,
   '{"users": -1, "projects": -1, "storage_gb": -1, "api_calls": -1}'::jsonb,
   false, 3)
ON CONFLICT (slug) DO NOTHING;
