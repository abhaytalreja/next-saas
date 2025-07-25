-- Profile Management Tables for NextSaaS
-- Migration: 019_profile_management_tables
-- Date: 2025-01-22

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhance existing activities table or create new one
DO $$
BEGIN
  -- Check if activities table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'ip_address') THEN
      ALTER TABLE activities ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_agent') THEN
      ALTER TABLE activities ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'device_type') THEN
      ALTER TABLE activities ADD COLUMN device_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'browser') THEN
      ALTER TABLE activities ADD COLUMN browser TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'os') THEN
      ALTER TABLE activities ADD COLUMN os TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'location') THEN
      ALTER TABLE activities ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'session_id') THEN
      ALTER TABLE activities ADD COLUMN session_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'status') THEN
      ALTER TABLE activities ADD COLUMN status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending'));
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'is_public') THEN
      ALTER TABLE activities ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'error_message') THEN
      ALTER TABLE activities ADD COLUMN error_message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'expires_at') THEN
      ALTER TABLE activities ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
    
    -- Ensure organization_id column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'organization_id') THEN
      ALTER TABLE activities ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
  ELSE
    -- Create table from scratch if it doesn't exist
    CREATE TABLE activities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      project_id UUID, -- References projects table if it exists
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id UUID,
      entity_title TEXT,
      description TEXT,
      metadata JSONB DEFAULT '{}',
      
      -- Context Information
      ip_address INET,
      user_agent TEXT,
      device_type TEXT,
      browser TEXT,
      os TEXT,
      location TEXT,
      session_id TEXT,
      
      -- Status
      status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
      is_public BOOLEAN DEFAULT false,
      error_message TEXT,
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    );
  END IF;
END $$;

-- Create user_preferences table for comprehensive user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme & Appearance
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  
  -- Email Notifications
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  email_digest BOOLEAN DEFAULT true,
  
  -- Notification Types
  notify_security_alerts BOOLEAN DEFAULT true,
  notify_account_updates BOOLEAN DEFAULT true,
  notify_organization_updates BOOLEAN DEFAULT true,
  notify_project_updates BOOLEAN DEFAULT true,
  notify_mentions BOOLEAN DEFAULT true,
  notify_comments BOOLEAN DEFAULT true,
  notify_invitations BOOLEAN DEFAULT true,
  notify_billing_alerts BOOLEAN DEFAULT true,
  notify_feature_announcements BOOLEAN DEFAULT false,
  
  -- Push Notifications
  browser_notifications_enabled BOOLEAN DEFAULT false,
  desktop_notifications_enabled BOOLEAN DEFAULT false,
  mobile_notifications_enabled BOOLEAN DEFAULT false,
  
  -- Marketing & Communication
  marketing_emails BOOLEAN DEFAULT false,
  product_updates BOOLEAN DEFAULT true,
  newsletters BOOLEAN DEFAULT false,
  surveys BOOLEAN DEFAULT false,
  
  -- Privacy Settings
  profile_visibility TEXT DEFAULT 'organization' CHECK (profile_visibility IN ('public', 'organization', 'private')),
  email_visibility TEXT DEFAULT 'organization' CHECK (email_visibility IN ('public', 'organization', 'private')),
  activity_visibility TEXT DEFAULT 'organization' CHECK (activity_visibility IN ('public', 'organization', 'private')),
  hide_last_seen BOOLEAN DEFAULT false,
  hide_activity_status BOOLEAN DEFAULT false,
  
  -- Advanced Settings
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone_aware BOOLEAN DEFAULT true,
  
  -- Accessibility
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  screen_reader_optimized BOOLEAN DEFAULT false,
  
  -- Data & Privacy
  data_retention_period INTEGER DEFAULT 365, -- days
  auto_delete_inactive BOOLEAN DEFAULT false,
  
  -- Organization Mode Context (for universal SaaS support)
  organization_context JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_avatars table for avatar management
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Storage Information
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'avatars',
  public_url TEXT,
  
  -- File Information
  original_filename TEXT,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  
  -- Image Processing
  is_processed BOOLEAN DEFAULT false,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  
  -- Variants/Sizes (JSON with size -> URL mapping)
  variants JSONB DEFAULT '{}',
  
  -- Status & Moderation
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  moderation_notes TEXT,
  
  -- Security & Validation
  file_hash TEXT,
  virus_scan_status TEXT DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'failed')),
  virus_scan_result TEXT,
  
  -- Metadata
  uploaded_via TEXT DEFAULT 'web',
  upload_session_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
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

-- Create profile_completeness table for tracking profile completion
CREATE TABLE IF NOT EXISTS profile_completeness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Completeness Scores (0-100)
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  basic_info_score INTEGER DEFAULT 0 CHECK (basic_info_score >= 0 AND basic_info_score <= 100),
  contact_info_score INTEGER DEFAULT 0 CHECK (contact_info_score >= 0 AND contact_info_score <= 100),
  professional_info_score INTEGER DEFAULT 0 CHECK (professional_info_score >= 0 AND professional_info_score <= 100),
  preferences_score INTEGER DEFAULT 0 CHECK (preferences_score >= 0 AND preferences_score <= 100),
  security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100),
  
  -- Field Completion Status
  completed_fields JSONB DEFAULT '[]',
  missing_fields JSONB DEFAULT '[]',
  
  -- Progress Tracking
  last_updated_field TEXT,
  completion_suggestions JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON user_preferences(language);

CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_is_active ON user_avatars(is_active);
CREATE INDEX IF NOT EXISTS idx_user_avatars_processing_status ON user_avatars(processing_status);

CREATE INDEX IF NOT EXISTS idx_profile_completeness_user_id ON profile_completeness(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_completeness_overall_score ON profile_completeness(overall_score);

-- Enable RLS on all new tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_completeness ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public org activities" ON activities
  FOR SELECT USING (
    is_public = true 
    AND EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = activities.organization_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role has full access to activities" ON activities
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "System can create activities" ON activities
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role has full access to user_preferences" ON user_preferences
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for user_avatars
CREATE POLICY "Users can view own avatars" ON user_avatars
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own avatars" ON user_avatars
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own avatars" ON user_avatars
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own avatars" ON user_avatars
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Service role has full access to user_avatars" ON user_avatars
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS Policies for profile_completeness
CREATE POLICY "Users can view own completeness" ON profile_completeness
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own completeness" ON profile_completeness
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own completeness" ON profile_completeness
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role has full access to profile_completeness" ON profile_completeness
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Functions for profile management

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completeness_score INTEGER := 0;
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
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate contact info score (20% weight)
  IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.website IS NOT NULL AND profile_record.website != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate professional info score (20% weight)
  IF profile_record.job_title IS NOT NULL AND profile_record.job_title != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  IF profile_record.company IS NOT NULL AND profile_record.company != '' THEN
    completeness_score := completeness_score + 10;
  END IF;
  
  -- Calculate preferences score (20% weight)
  IF preferences_record IS NOT NULL THEN
    completeness_score := completeness_score + 20;
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
  new_score INTEGER;
BEGIN
  -- Calculate new completeness score
  new_score := calculate_profile_completeness(COALESCE(NEW.id, NEW.user_id));
  
  -- Update or insert completeness record
  INSERT INTO profile_completeness (user_id, overall_score, updated_at)
  VALUES (COALESCE(NEW.id, NEW.user_id), new_score, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    overall_score = new_score,
    updated_at = NOW();
  
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
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO profile_completeness (user_id, overall_score, created_at)
  VALUES (NEW.id, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create triggers
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

-- Create update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_avatars_updated_at ON user_avatars;
CREATE TRIGGER update_user_avatars_updated_at 
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profile_completeness_updated_at ON profile_completeness;
CREATE TRIGGER update_profile_completeness_updated_at 
  BEFORE UPDATE ON profile_completeness
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Add helpful views for easier querying

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

-- View for organization mode aware profiles
CREATE OR REPLACE VIEW organization_profiles AS
SELECT 
  p.*,
  m.organization_id,
  m.role as organization_role,
  o.name as organization_name,
  o.slug as organization_slug
FROM profiles p
JOIN memberships m ON p.id = m.user_id
JOIN organizations o ON m.organization_id = o.id
WHERE m.status = 'active';