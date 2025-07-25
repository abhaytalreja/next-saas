#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const organizationMode = args.includes('--mode') 
  ? args[args.indexOf('--mode') + 1] 
  : 'single';

const validModes = ['none', 'single', 'multi'];
if (!validModes.includes(organizationMode)) {
  console.error(`Invalid organization mode: ${organizationMode}`);
  console.error(`Valid modes are: ${validModes.join(', ')}`);
  process.exit(1);
}

console.log(`Generating database SQL for organization mode: ${organizationMode}`);

// Base tables needed for all modes
const baseTables = `
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

-- Enhanced activities table for comprehensive audit tracking
-- Handle both new installations and existing database upgrades
DO $$
BEGIN
  -- Check if activities table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities') THEN
    -- Add columns if they don't exist (backward compatibility)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'ip_address') THEN
      ALTER TABLE activities ADD COLUMN ip_address inet;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_agent') THEN
      ALTER TABLE activities ADD COLUMN user_agent text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_type') THEN
      ALTER TABLE activities ADD COLUMN device_type text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'browser') THEN
      ALTER TABLE activities ADD COLUMN browser text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'os') THEN
      ALTER TABLE activities ADD COLUMN os text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'location') THEN
      ALTER TABLE activities ADD COLUMN location text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'session_id') THEN
      ALTER TABLE activities ADD COLUMN session_id text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'status') THEN
      ALTER TABLE activities ADD COLUMN status text DEFAULT 'success';
      -- Add constraint if it doesn't exist
      BEGIN
        ALTER TABLE activities ADD CONSTRAINT activities_status_check CHECK (status IN ('success', 'failure', 'pending'));
      EXCEPTION WHEN duplicate_object THEN
        NULL; -- Constraint already exists
      END;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'is_public') THEN
      ALTER TABLE activities ADD COLUMN is_public boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'error_message') THEN
      ALTER TABLE activities ADD COLUMN error_message text;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'expires_at') THEN
      ALTER TABLE activities ADD COLUMN expires_at timestamptz;
    END IF;
    
    -- Ensure organization_id column exists (for organization modes)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'organization_id') THEN
      ALTER TABLE activities ADD COLUMN organization_id uuid;
      -- Add foreign key constraint if organizations table exists
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE activities ADD CONSTRAINT fk_activities_organization 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
      END IF;
    END IF;
    
  ELSE
    -- Create table from scratch if it doesn't exist
    CREATE TABLE activities (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
      project_id uuid, -- References projects table if it exists
      action text NOT NULL,
      entity_type text,
      entity_id uuid,
      entity_title text,
      description text,
      metadata jsonb DEFAULT '{}',
      
      -- Context Information
      ip_address inet,
      user_agent text,
      device_type text,
      browser text,
      os text,
      location text,
      session_id text,
      
      -- Status
      status text DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
      is_public boolean DEFAULT false,
      error_message text,
      
      -- Timestamps
      created_at timestamptz DEFAULT now(),
      expires_at timestamptz
    );
  END IF;
END $$;

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

-- Profile Management Tables
-- User preferences for comprehensive user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme & Appearance
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  date_format text DEFAULT 'MM/DD/YYYY',
  time_format text DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  
  -- Email Notifications
  email_notifications_enabled boolean DEFAULT true,
  email_frequency text DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  email_digest boolean DEFAULT true,
  
  -- Notification Types
  notify_security_alerts boolean DEFAULT true,
  notify_account_updates boolean DEFAULT true,
  notify_organization_updates boolean DEFAULT true,
  notify_project_updates boolean DEFAULT true,
  notify_mentions boolean DEFAULT true,
  notify_comments boolean DEFAULT true,
  notify_invitations boolean DEFAULT true,
  notify_billing_alerts boolean DEFAULT true,
  notify_feature_announcements boolean DEFAULT false,
  
  -- Push Notifications
  browser_notifications_enabled boolean DEFAULT false,
  desktop_notifications_enabled boolean DEFAULT false,
  mobile_notifications_enabled boolean DEFAULT false,
  
  -- Marketing & Communication
  marketing_emails boolean DEFAULT false,
  product_updates boolean DEFAULT true,
  newsletters boolean DEFAULT false,
  surveys boolean DEFAULT false,
  
  -- Privacy Settings
  profile_visibility text DEFAULT 'organization' CHECK (profile_visibility IN ('public', 'organization', 'private')),
  email_visibility text DEFAULT 'organization' CHECK (email_visibility IN ('public', 'organization', 'private')),
  activity_visibility text DEFAULT 'organization' CHECK (activity_visibility IN ('public', 'organization', 'private')),
  hide_last_seen boolean DEFAULT false,
  hide_activity_status boolean DEFAULT false,
  
  -- Advanced Settings
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '08:00',
  timezone_aware boolean DEFAULT true,
  
  -- Accessibility
  reduce_motion boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  screen_reader_optimized boolean DEFAULT false,
  
  -- Data & Privacy
  data_retention_period integer DEFAULT 365, -- days
  auto_delete_inactive boolean DEFAULT false,
  
  -- Organization Mode Context (for universal SaaS support)
  organization_context jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User avatars table for avatar management
CREATE TABLE IF NOT EXISTS user_avatars (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Storage Information
  storage_path text NOT NULL,
  storage_bucket text DEFAULT 'avatars',
  public_url text,
  
  -- File Information
  original_filename text,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,
  
  -- Image Processing
  is_processed boolean DEFAULT false,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error text,
  
  -- Variants/Sizes (JSON with size -> URL mapping)
  variants jsonb DEFAULT '{}',
  
  -- Status & Moderation
  is_active boolean DEFAULT true,
  is_approved boolean DEFAULT true,
  moderation_notes text,
  
  -- Security & Validation
  file_hash text,
  virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'failed')),
  virus_scan_result text,
  
  -- Metadata
  uploaded_via text DEFAULT 'web',
  upload_session_id text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Profile completeness table for tracking profile completion
CREATE TABLE IF NOT EXISTS profile_completeness (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Completeness Scores (0-100)
  overall_score integer DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  basic_info_score integer DEFAULT 0 CHECK (basic_info_score >= 0 AND basic_info_score <= 100),
  contact_info_score integer DEFAULT 0 CHECK (contact_info_score >= 0 AND contact_info_score <= 100),
  professional_info_score integer DEFAULT 0 CHECK (professional_info_score >= 0 AND professional_info_score <= 100),
  preferences_score integer DEFAULT 0 CHECK (preferences_score >= 0 AND preferences_score <= 100),
  security_score integer DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
  
  -- Field Completion Status
  completed_fields jsonb DEFAULT '[]',
  missing_fields jsonb DEFAULT '[]',
  
  -- Progress Tracking
  last_updated_field text,
  completion_suggestions jsonb DEFAULT '[]',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_activity view (alias for activities for API compatibility)
CREATE OR REPLACE VIEW user_activity AS 
SELECT 
  id,
  user_id,
  action,
  entity_type as resource,
  entity_id as resource_id,
  description,
  metadata,
  ip_address,
  user_agent,
  device_type,
  browser,
  os,
  location,
  session_id,
  organization_id,
  status,
  error_message,
  created_at,
  expires_at
FROM activities;
`;

// Organizations table (only for single and multi modes)
const organizationTables = `
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
`;

// Projects/Items tables - structure depends on mode
const getProjectTables = (mode) => {
  const ownerColumn = mode === 'none' 
    ? 'user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE'
    : 'organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE';

  return `
-- Projects/Workspaces
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ${ownerColumn},
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  type text DEFAULT 'general',
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  ${mode === 'none' ? 'UNIQUE(user_id, slug)' : 'UNIQUE(organization_id, slug)'}
);

-- Items (flexible content)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ${ownerColumn},
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
`;
};

// Subscriptions table - structure depends on mode
const getSubscriptionTables = (mode) => {
  const ownerColumn = mode === 'none'
    ? 'user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE'
    : 'organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE';

  return `
-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ${ownerColumn},
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
  ${ownerColumn},
  metric_name text NOT NULL,
  usage_value bigint NOT NULL DEFAULT 0,
  usage_limit bigint,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(${mode === 'none' ? 'user_id' : 'organization_id'}, metric_name, period_start)
);
`;
};

// Indexes - adjust based on mode
const getIndexes = (mode) => {
  const baseIndexes = `
-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);

-- Profile management indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON user_preferences(language);

CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_is_active ON user_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_user_avatars_processing_status ON user_avatars(processing_status);

CREATE INDEX IF NOT EXISTS idx_profile_completeness_user_id ON profile_completeness(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_completeness_overall_score ON profile_completeness(overall_score);
`;

  const organizationIndexes = `
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
`;

  const projectIndexes = `
CREATE INDEX IF NOT EXISTS idx_projects_${mode === 'none' ? 'user_id' : 'organization_id'} ON projects(${mode === 'none' ? 'user_id' : 'organization_id'});
CREATE INDEX IF NOT EXISTS idx_items_project_id ON items(project_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
`;

  let indexes = baseIndexes + projectIndexes;
  if (mode !== 'none') {
    indexes += organizationIndexes;
  }
  return indexes;
};

// RLS Policies - adjust based on mode
const getRLSPolicies = (mode) => {
  const baseRLS = `
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_completeness ENABLE ROW LEVEL SECURITY;

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

-- User preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- User avatars policies
DROP POLICY IF EXISTS "Users can view own avatars" ON user_avatars;
CREATE POLICY "Users can view own avatars" ON user_avatars
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own avatars" ON user_avatars;
CREATE POLICY "Users can update own avatars" ON user_avatars
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own avatars" ON user_avatars;
CREATE POLICY "Users can insert own avatars" ON user_avatars
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own avatars" ON user_avatars;
CREATE POLICY "Users can delete own avatars" ON user_avatars
  FOR DELETE USING (user_id = auth.uid());

-- Profile completeness policies
DROP POLICY IF EXISTS "Users can view own completeness" ON profile_completeness;
CREATE POLICY "Users can view own completeness" ON profile_completeness
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own completeness" ON profile_completeness;
CREATE POLICY "Users can update own completeness" ON profile_completeness
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own completeness" ON profile_completeness;
CREATE POLICY "Users can insert own completeness" ON profile_completeness
  FOR INSERT WITH CHECK (user_id = auth.uid());
`;

  if (mode === 'none') {
    // User-centric policies
    return baseRLS + `
-- Projects policies (user-owned)
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Items policies (user-owned via project)
DROP POLICY IF EXISTS "Users can view items in their projects" ON items;
CREATE POLICY "Users can view items in their projects" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create items in their projects" ON items;
CREATE POLICY "Users can create items in their projects" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update items in their projects" ON items;
CREATE POLICY "Users can update items in their projects" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items in their projects" ON items;
CREATE POLICY "Users can delete items in their projects" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Subscription policies (user-owned)
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage tracking policies (user-owned)
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
`;
  } else {
    // Organization-based policies
    return baseRLS + `
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
`;
  }
};

// Functions and triggers
const getFunctions = (mode) => {
  const baseFunctions = `
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

-- Profile management triggers
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_avatars_updated_at ON user_avatars;
CREATE TRIGGER update_user_avatars_updated_at BEFORE UPDATE ON user_avatars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profile_completeness_updated_at ON profile_completeness;
CREATE TRIGGER update_profile_completeness_updated_at BEFORE UPDATE ON profile_completeness
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profile completeness calculation functions
CREATE OR REPLACE FUNCTION calculate_profile_completeness(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completeness_score integer := 0;
  profile_record RECORD;
  preferences_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;
  
  -- Get preferences data
  SELECT * INTO preferences_record FROM user_preferences WHERE user_id = user_uuid;
  
  -- Calculate basic info score (40% weight)
  IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate contact info score (20% weight)
  IF profile_record.metadata->>'phone' IS NOT NULL AND profile_record.metadata->>'phone' != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.metadata->>'website' IS NOT NULL AND profile_record.metadata->>'website' != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate professional info score (20% weight)
  IF profile_record.metadata->>'job_title' IS NOT NULL AND profile_record.metadata->>'job_title' != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.metadata->>'company' IS NOT NULL AND profile_record.metadata->>'company' != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate preferences score (20% weight)
  IF preferences_record IS NOT NULL THEN
    completeness_score := completeness_score + 20;
  END IF;
  
  -- Additional profile completeness factors
  IF profile_record.name IS NOT NULL AND profile_record.name != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.timezone IS NOT NULL AND profile_record.timezone != 'UTC' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  RETURN completeness_score;
END;
$$;

-- Function to update profile completeness
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_score integer;
BEGIN
  -- Calculate new completeness score
  new_score := calculate_profile_completeness(COALESCE(NEW.id, NEW.user_id));
  
  -- Update or insert completeness record
  INSERT INTO profile_completeness (user_id, overall_score, updated_at)
  VALUES (COALESCE(NEW.id, NEW.user_id), new_score, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    overall_score = new_score,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Function to auto-create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_preferences (user_id, created_at)
  VALUES (NEW.id, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO profile_completeness (user_id, overall_score, created_at)
  VALUES (NEW.id, 0, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Profile management triggers
DROP TRIGGER IF EXISTS trigger_create_default_preferences ON profiles;
CREATE TRIGGER trigger_create_default_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_preferences();

DROP TRIGGER IF EXISTS trigger_update_profile_completeness_on_profile ON profiles;
CREATE TRIGGER trigger_update_profile_completeness_on_profile
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();

DROP TRIGGER IF EXISTS trigger_update_profile_completeness_on_preferences ON user_preferences;
CREATE TRIGGER trigger_update_profile_completeness_on_preferences
  AFTER INSERT OR UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completeness();
`;

  const organizationFunctions = `
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
`;

  if (mode === 'single') {
    // Auto-create organization for new users
    return baseFunctions + organizationFunctions + `
-- Trigger to create default organization for new users
DROP TRIGGER IF EXISTS create_default_org_for_user ON auth.users;
CREATE TRIGGER create_default_org_for_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_organization();
`;
  } else if (mode === 'multi') {
    return baseFunctions + organizationFunctions;
  }
  
  return baseFunctions;
};

// Generate the complete SQL based on mode
let sql = '-- NextSaaS Database Schema\n';
sql += `-- Organization Mode: ${organizationMode}\n`;
sql += `-- Generated on: ${new Date().toISOString()}\n\n`;

// Add base tables
sql += baseTables;

// Add organization tables if needed
if (organizationMode !== 'none') {
  sql += '\n' + organizationTables;
}

// Add project/content tables
sql += '\n' + getProjectTables(organizationMode);

// Add subscription tables
sql += '\n' + getSubscriptionTables(organizationMode);

// Add indexes
sql += '\n' + getIndexes(organizationMode);

// Add RLS policies
sql += '\n' + getRLSPolicies(organizationMode);

// Add functions and triggers
sql += '\n' + getFunctions(organizationMode);

// Add default data
sql += `
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

-- Helpful views for profile management

-- View for user profiles with completeness
CREATE OR REPLACE VIEW user_profiles_with_completeness AS
SELECT 
  p.*,
  pc.overall_score as completeness_score,
  pc.completion_suggestions,
  CASE 
    WHEN pc.overall_score >= 90 THEN 'complete'
    WHEN pc.overall_score >= 60 THEN 'good'
    WHEN pc.overall_score >= 30 THEN 'basic'
    ELSE 'incomplete'
  END as completeness_status
FROM profiles p
LEFT JOIN profile_completeness pc ON p.id = pc.user_id;

${organizationMode !== 'none' ? `
-- View for organization mode aware profiles
CREATE OR REPLACE VIEW organization_profiles AS
SELECT 
  p.*,
  m.organization_id,
  m.role as organization_role,
  o.name as organization_name,
  o.slug as organization_slug
FROM profiles p
JOIN organization_members m ON p.id = m.user_id
JOIN organizations o ON m.organization_id = o.id;` : ''}
`;

// Write the SQL file
const outputPath = path.join(process.cwd(), `database-${organizationMode}.sql`);
fs.writeFileSync(outputPath, sql);

console.log(`✅ Database SQL generated successfully!`);
console.log(`📄 Output file: ${outputPath}`);
console.log(`🚀 Mode: ${organizationMode}`);
console.log(`\nNext steps:`);
console.log(`1. Review the generated SQL file`);
console.log(`2. Run it in your Supabase SQL editor`);
console.log(`3. Set NEXT_PUBLIC_ORGANIZATION_MODE=${organizationMode} in your .env.local`);

// Also update the main generation script
const mainScriptPath = path.join(process.cwd(), 'scripts', 'generate-supabase-sql.js');
if (fs.existsSync(mainScriptPath)) {
  console.log(`\n💡 Tip: The main script has been updated to use mode: ${organizationMode}`);
}